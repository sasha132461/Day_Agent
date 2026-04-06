export interface Task {
  id: number;
  title: string;
  description: string | null;
  source: "gmail" | "telegram" | "manual";
  source_message_id: string | null;
  source_link: string | null;
  status: "todo" | "in_progress" | "done";
  priority: "high" | "medium" | "low";
  due_date: string | null;
  due_time: string | null;
  project: string | null;
  from_yesterday: boolean;
  extracted_by_ai: boolean;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface TaskCreate {
  title: string;
  description?: string;
  source?: string;
  priority?: string;
  due_date?: string;
  due_time?: string;
  project?: string;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  due_date?: string;
  due_time?: string;
  project?: string;
  from_yesterday?: boolean;
}

export interface TaskListResponse {
  tasks: Task[];
  total: number;
}

export interface TaskSummary {
  today_count: number;
  overdue_count: number;
  inbox_count: number;
  done_count: number;
}

export interface User {
  id: number;
  email: string;
  name: string | null;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export type TaskFilter =
  | "all"
  | "today"
  | "overdue"
  | "gmail"
  | "telegram"
  | "done";

export interface BriefingHighlight {
  text: string;
  source: string;
  task_id: number | null;
}

export interface ChecklistItem {
  task_id: number;
  title: string;
  done: boolean;
  priority: string;
}

export interface DailyBriefing {
  date: string;
  greeting: string;
  summary: string;
  top_priorities: Task[];
  today_tasks: Task[];
  from_yesterday: Task[];
  gmail_highlights: BriefingHighlight[];
  telegram_highlights: BriefingHighlight[];
  checklist: ChecklistItem[];
  open_questions: string[];
  risks: string[];
  stats: TaskSummary;
}
