"use client";

import { useTaskSummary } from "@/hooks/use-tasks";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import type { TaskFilter } from "@/types/task";

interface TaskFiltersProps {
  value: TaskFilter;
  onChange: (value: TaskFilter) => void;
}

const filters: { value: TaskFilter; label: string }[] = [
  { value: "all", label: "Усі" },
  { value: "today", label: "Сьогодні" },
  { value: "overdue", label: "Прострочені" },
  { value: "gmail", label: "Gmail" },
  { value: "telegram", label: "Telegram" },
  { value: "done", label: "Виконані" },
];

export function TaskFilters({ value, onChange }: TaskFiltersProps) {
  const { data: summary } = useTaskSummary();

  const countMap: Partial<Record<TaskFilter, number>> = {
    today: summary?.today_count,
    overdue: summary?.overdue_count,
    done: summary?.done_count,
  };

  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as TaskFilter)}>
      <TabsList variant="line" className="w-full justify-start overflow-x-auto">
        {filters.map((filter) => {
          const count = countMap[filter.value];
          return (
            <TabsTrigger key={filter.value} value={filter.value}>
              {filter.label}
              {count !== undefined && count > 0 && (
                <Badge variant="secondary" className="ml-1 h-4 min-w-4 px-1 text-[10px]">
                  {count}
                </Badge>
              )}
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}
