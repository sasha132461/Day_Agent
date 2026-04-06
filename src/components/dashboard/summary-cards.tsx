"use client";

import { useTaskSummary } from "@/hooks/use-tasks";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AlertCircle, CalendarDays, CheckCircle2, Inbox } from "lucide-react";

const cards = [
  {
    label: "Задачі на сьогодні",
    key: "today_count" as const,
    icon: CalendarDays,
    accent: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-100 dark:bg-blue-900/30",
  },
  {
    label: "Прострочені",
    key: "overdue_count" as const,
    icon: AlertCircle,
    accent: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-100 dark:bg-orange-900/30",
  },
  {
    label: "Вхідні",
    key: "inbox_count" as const,
    icon: Inbox,
    accent: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-100 dark:bg-purple-900/30",
  },
  {
    label: "Виконані",
    key: "done_count" as const,
    icon: CheckCircle2,
    accent: "text-green-600 dark:text-green-400",
    bg: "bg-green-100 dark:bg-green-900/30",
  },
];

export function SummaryCards() {
  const { data: summary, isLoading } = useTaskSummary();

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.key}>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className={cn("flex size-8 items-center justify-center rounded-lg", card.bg)}>
                <card.icon className={cn("size-4", card.accent)} />
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                {card.label}
              </span>
            </div>
            {isLoading ? (
              <div className="h-8 w-12 animate-pulse rounded-md bg-muted" />
            ) : (
              <span className="text-3xl font-bold tracking-tight">
                {summary?.[card.key] ?? 0}
              </span>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
