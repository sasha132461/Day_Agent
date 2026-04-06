"use client";

import { format, parseISO } from "date-fns";
import { useUpdateTask, useDeleteTask } from "@/hooks/use-tasks";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Calendar,
  Clock,
  ExternalLink,
  FolderOpen,
  MoreVertical,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowRight,
  ArrowDown,
} from "lucide-react";
import type { Task } from "@/types/task";

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
}

const sourceBadgeStyles: Record<string, string> = {
  gmail: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  telegram: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  manual: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
};

const priorityBadgeStyles: Record<string, string> = {
  high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

const priorityIcons: Record<string, typeof ArrowUp> = {
  high: ArrowUp,
  medium: ArrowRight,
  low: ArrowDown,
};

export function TaskCard({ task, onEdit }: TaskCardProps) {
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const isDone = task.status === "done";
  const PriorityIcon = priorityIcons[task.priority];

  const toggleDone = () => {
    updateTask.mutate({
      id: task.id,
      data: { status: isDone ? "todo" : "done" },
    });
  };

  const setPriority = (priority: string) => {
    updateTask.mutate({ id: task.id, data: { priority } });
  };

  return (
    <Card
      className={cn(
        "group/task-card transition-shadow hover:shadow-md",
        isDone && "opacity-60"
      )}
    >
      <div className="flex items-start gap-3 px-4">
        <div className="pt-0.5">
          <Checkbox
            checked={isDone}
            onCheckedChange={toggleDone}
          />
        </div>

        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "text-sm font-medium leading-snug",
              isDone && "line-through text-muted-foreground"
            )}
          >
            {task.title}
          </p>

          {task.description && (
            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
              {task.description}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {task.source_link ? (
              <a href={task.source_link} target="_blank" rel="noopener noreferrer">
                <Badge variant="secondary" className={cn(sourceBadgeStyles[task.source], "gap-1 hover:opacity-80 cursor-pointer")}>
                  {task.source}
                  <ExternalLink className="size-2.5" />
                </Badge>
              </a>
            ) : (
              <Badge variant="secondary" className={sourceBadgeStyles[task.source]}>
                {task.source}
              </Badge>
            )}

            <Badge variant="secondary" className={priorityBadgeStyles[task.priority]}>
              {PriorityIcon && <PriorityIcon className="size-3" />}
              {task.priority}
            </Badge>

            {task.from_yesterday && (
              <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                з учора
              </Badge>
            )}

            {task.due_date && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="size-3" />
                {format(parseISO(task.due_date), "MMM d")}
              </span>
            )}

            {task.due_time && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="size-3" />
                {task.due_time}
              </span>
            )}

            {task.project && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <FolderOpen className="size-3" />
                {task.project}
              </span>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-xs"
                className="shrink-0 opacity-0 transition-opacity group-hover/task-card:opacity-100 data-popup-open:opacity-100"
              />
            }
          >
            <MoreVertical className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(task)}>
                <Pencil className="size-4" />
                Редагувати
              </DropdownMenuItem>
            )}
            <DropdownMenuLabel>Пріоритет</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setPriority("high")}>
              <ArrowUp className="size-4 text-red-500" />
              Високий
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPriority("medium")}>
              <ArrowRight className="size-4 text-yellow-500" />
              Середній
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPriority("low")}>
              <ArrowDown className="size-4 text-green-500" />
              Низький
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => deleteTask.mutate(task.id)}
            >
              <Trash2 className="size-4" />
              Видалити
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}
