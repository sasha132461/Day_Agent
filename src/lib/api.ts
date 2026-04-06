import axios from "axios";
import type { AIPromptsPayload } from "@/types/ai-prompts";
import type { IntegrationStatus } from "@/types/integrations";
import type {
  AuthResponse,
  DailyBriefing,
  Task,
  TaskCreate,
  TaskListResponse,
  TaskSummary,
  TaskUpdate,
  User,
} from "@/types/task";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "",
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRequest = error.config?.url?.includes("/api/auth/me");
    if (
      isAuthRequest &&
      error.response?.status === 401 &&
      typeof window !== "undefined" &&
      !window.location.pathname.startsWith("/login")
    ) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const auth = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>("/api/auth/login", {
      email,
      password,
    });
    return data;
  },

  register: async (
    email: string,
    password: string,
    name?: string
  ): Promise<User> => {
    const { data } = await api.post<User>("/api/auth/register", {
      email,
      password,
      name,
    });
    return data;
  },

  getMe: async (): Promise<User> => {
    const { data } = await api.get<User>("/api/auth/me");
    return data;
  },
};

interface TaskQueryParams {
  status?: string;
  source?: string;
  priority?: string;
  search?: string;
  from_yesterday?: boolean;
  skip?: number;
  limit?: number;
}

export const tasks = {
  getTasks: async (params?: TaskQueryParams): Promise<TaskListResponse> => {
    const { data } = await api.get<TaskListResponse>("/api/tasks", { params });
    return data;
  },

  getTasksToday: async (): Promise<Task[]> => {
    const { data } = await api.get<Task[]>("/api/tasks/today");
    return data;
  },

  getTasksOverdue: async (): Promise<Task[]> => {
    const { data } = await api.get<Task[]>("/api/tasks/overdue");
    return data;
  },

  getTasksInbox: async (): Promise<Task[]> => {
    const { data } = await api.get<Task[]>("/api/tasks/inbox");
    return data;
  },

  getTaskSummary: async (): Promise<TaskSummary> => {
    const { data } = await api.get<TaskSummary>("/api/tasks/summary");
    return data;
  },

  getFocusTasks: async (): Promise<Task[]> => {
    const { data } = await api.get<Task[]>("/api/tasks/focus");
    return data;
  },

  createTask: async (taskData: TaskCreate): Promise<Task> => {
    const { data } = await api.post<Task>("/api/tasks", taskData);
    return data;
  },

  updateTask: async (id: number, taskData: TaskUpdate): Promise<Task> => {
    const { data } = await api.patch<Task>(`/api/tasks/${id}`, taskData);
    return data;
  },

  deleteTask: async (id: number): Promise<void> => {
    await api.delete(`/api/tasks/${id}`);
  },
};

export const briefing = {
  getToday: async (sync = false): Promise<DailyBriefing> => {
    const { data } = await api.get<DailyBriefing>("/api/briefing/today", {
      params: { sync },
    });
    return data;
  },

  generate: async (): Promise<DailyBriefing> => {
    // Tailscale Funnel often returns 502 on multi-minute requests (Gmail/Telegram + Ollama).
    // On *.ts.net use sync=false — refresh briefing from DB only; run full sync on LAN/localhost.
    const onTailscaleFunnel =
      typeof window !== "undefined" &&
      window.location.hostname.endsWith(".ts.net");
    const { data } = await api.post<DailyBriefing>(
      "/api/briefing/generate",
      null,
      {
        params: { sync: !onTailscaleFunnel },
        timeout: onTailscaleFunnel ? 120_000 : 30 * 60 * 1000,
      },
    );
    return data;
  },
};

export const sync = {
  syncGmail: async (): Promise<{ synced_count: number; skipped_count: number }> => {
    const { data } = await api.post("/api/sync/gmail");
    return data;
  },

  syncTelegram: async (): Promise<{ synced_count: number; skipped_count: number }> => {
    const { data } = await api.post("/api/sync/telegram");
    return data;
  },

  syncAll: async () => {
    const { data } = await api.post("/api/sync/all");
    return data;
  },
};

export const integrations = {
  getStatus: async (): Promise<IntegrationStatus> => {
    const { data } = await api.get<IntegrationStatus>("/api/integrations/status");
    return data;
  },

  connectGmail: async (email: string, appPassword: string): Promise<{ ok: boolean; message?: string }> => {
    const { data } = await api.put("/api/integrations/gmail", {
      email,
      app_password: appPassword,
    });
    return data;
  },

  disconnectGmail: async (): Promise<void> => {
    await api.delete("/api/integrations/gmail");
  },

  telegramSendCode: async (phoneNumber: string): Promise<{ ok: boolean; message?: string }> => {
    const { data } = await api.post("/api/integrations/telegram/send-code", {
      phone_number: phoneNumber,
    });
    return data;
  },

  telegramVerify: async (
    code: string,
    cloudPassword?: string | null,
  ): Promise<{ ok: boolean; message?: string }> => {
    const payload: { code: string; cloud_password?: string } = { code: code.trim() };
    const p = cloudPassword?.trim();
    if (p) payload.cloud_password = p;
    const { data } = await api.post("/api/integrations/telegram/verify", payload);
    return data;
  },

  disconnectTelegram: async (): Promise<void> => {
    await api.delete("/api/integrations/telegram");
  },

  setTelegramChats: async (chatIds: string | null): Promise<{ ok: boolean; telegram_chat_ids: string | null }> => {
    const { data } = await api.put("/api/integrations/telegram/chats", {
      chat_ids: chatIds,
    });
    return data;
  },

  getAiPrompts: async (): Promise<AIPromptsPayload> => {
    const { data } = await api.get<unknown>("/api/integrations/ai-prompts");
    const empty = {
      general: "",
      priority_low: "",
      priority_medium: "",
      priority_high: "",
    };
    if (!data || typeof data !== "object") {
      return { gmail: { ...empty }, telegram: { ...empty } };
    }
    const d = data as Record<string, unknown>;
    const pick = (src: unknown) => {
      if (!src || typeof src !== "object") return { ...empty };
      const o = src as Record<string, unknown>;
      return {
        general: typeof o.general === "string" ? o.general : "",
        priority_low: typeof o.priority_low === "string" ? o.priority_low : "",
        priority_medium: typeof o.priority_medium === "string" ? o.priority_medium : "",
        priority_high: typeof o.priority_high === "string" ? o.priority_high : "",
      };
    };
    return {
      gmail: pick(d.gmail),
      telegram: pick(d.telegram),
    };
  },

  putAiPrompts: async (body: AIPromptsPayload): Promise<AIPromptsPayload> => {
    const { data } = await api.put<AIPromptsPayload>("/api/integrations/ai-prompts", body);
    return data;
  },
};
