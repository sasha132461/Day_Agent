"use client";

import { useQuery } from "@tanstack/react-query";
import { tasks as tasksApi } from "@/lib/api";
import { TaskCard } from "@/components/dashboard/task-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ClipboardList, RefreshCw } from "lucide-react";
import type { Task, TaskFilter } from "@/types/task";

interface TaskListProps {
  filter: TaskFilter;
  search: string;
}

function SkeletonCard() {
  return (
    <Card>
      <div className="flex items-start gap-3 px-4">
        <div className="size-4 shrink-0 animate-pulse rounded bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
          <div className="flex gap-2">
            <div className="h-5 w-14 animate-pulse rounded-full bg-muted" />
            <div className="h-5 w-14 animate-pulse rounded-full bg-muted" />
          </div>
        </div>
      </div>
    </Card>
  );
}

export function TaskList({ filter, search }: TaskListProps) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["tasks", "filtered", filter, search],
    queryFn: async () => {
      switch (filter) {
        case "today":
          return tasksApi.getTasksToday();
        case "overdue":
          return tasksApi.getTasksOverdue();
        case "done": {
          const res = await tasksApi.getTasks({ status: "done", search: search || undefined });
          return res.tasks;
        }
        case "gmail": {
          const res = await tasksApi.getTasks({ source: "gmail", search: search || undefined });
          return res.tasks;
        }
        case "telegram": {
          const res = await tasksApi.getTasks({ source: "telegram", search: search || undefined });
          return res.tasks;
        }
        default: {
          const res = await tasksApi.getTasks({ search: search || undefined });
          return res.tasks;
        }
      }
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <p className="text-sm text-muted-foreground">
          Не вдалося завантажити задачі. Спробуйте ще раз.
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="size-4" />
          Повторити
        </Button>
      </div>
    );
  }

  const taskList = (data as Task[]) ?? [];

  if (taskList.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-muted">
          <ClipboardList className="size-6 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">Задач не знайдено</p>
          <p className="text-xs text-muted-foreground">
            {search
              ? "Спробуйте інший пошуковий запит"
              : "Створіть нову задачу або синхронізуйте джерела"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {taskList.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}
