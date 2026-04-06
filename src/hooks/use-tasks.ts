"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { tasks, sync, briefing } from "@/lib/api";
import type { TaskCreate, TaskUpdate } from "@/types/task";

export function useTasks(params?: {
  status?: string;
  source?: string;
  priority?: string;
  search?: string;
  from_yesterday?: boolean;
  skip?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["tasks", "list", params],
    queryFn: () => tasks.getTasks(params),
  });
}

export function useTasksToday() {
  return useQuery({
    queryKey: ["tasks", "today"],
    queryFn: tasks.getTasksToday,
  });
}

export function useTasksOverdue() {
  return useQuery({
    queryKey: ["tasks", "overdue"],
    queryFn: tasks.getTasksOverdue,
  });
}

export function useTasksInbox() {
  return useQuery({
    queryKey: ["tasks", "inbox"],
    queryFn: tasks.getTasksInbox,
  });
}

export function useTaskSummary() {
  return useQuery({
    queryKey: ["tasks", "summary"],
    queryFn: tasks.getTaskSummary,
  });
}

export function useFocusTasks() {
  return useQuery({
    queryKey: ["tasks", "focus"],
    queryFn: tasks.getFocusTasks,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TaskCreate) => tasks.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TaskUpdate }) =>
      tasks.updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => tasks.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useBriefing() {
  return useQuery({
    queryKey: ["briefing", "today"],
    queryFn: () => briefing.getToday(false),
    staleTime: 2 * 60 * 1000,
  });
}

export function useGenerateBriefing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: briefing.generate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["briefing"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useSyncGmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sync.syncGmail,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["briefing"] });
    },
  });
}

export function useSyncTelegram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sync.syncTelegram,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["briefing"] });
    },
  });
}

export function useSyncAll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sync.syncAll,
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}
