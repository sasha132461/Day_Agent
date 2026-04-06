"use client";

import { format, parseISO } from "date-fns";
import { useFocusTasks } from "@/hooks/use-tasks";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, PartyPopper, Zap } from "lucide-react";

const priorityDot: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-yellow-500",
  low: "bg-green-500",
};

export function FocusPanel() {
  const { data: focusTasks, isLoading } = useFocusTasks();

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="size-4 text-yellow-500" />
          Фокус
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="mt-1.5 size-2 shrink-0 animate-pulse rounded-full bg-muted" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 w-full animate-pulse rounded bg-muted" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : !focusTasks?.length ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <PartyPopper className="size-8 text-muted-foreground" />
            <p className="text-sm font-medium">Все зроблено!</p>
            <p className="text-xs text-muted-foreground">
              Чудова робота — нічого термінового.
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-80">
            <div className="space-y-3">
              {focusTasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-2 rounded-lg p-2 transition-colors hover:bg-muted/50"
                >
                  <div
                    className={cn(
                      "mt-1.5 size-2 shrink-0 rounded-full",
                      priorityDot[task.priority]
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-snug line-clamp-2">
                      {task.title}
                    </p>
                    {task.due_date && (
                      <span className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="size-3" />
                        {format(parseISO(task.due_date), "MMM d")}
                        {task.due_time && ` at ${task.due_time}`}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
