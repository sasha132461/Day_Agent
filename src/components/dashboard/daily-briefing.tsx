"use client";

import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { useBriefing, useGenerateBriefing, useUpdateTask } from "@/hooks/use-tasks";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CalendarDays,
  CheckCircle2,
  Clock,
  ExternalLink,
  HelpCircle,
  Inbox,
  Loader2,
  Mail,
  MessageCircle,
  RefreshCw,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import type { Task, BriefingHighlight, ChecklistItem } from "@/types/task";

const priorityConfig = {
  high: { icon: ArrowUp, color: "text-red-500", bg: "bg-red-100 dark:bg-red-900/30" },
  medium: { icon: ArrowRight, color: "text-yellow-500", bg: "bg-yellow-100 dark:bg-yellow-900/30" },
  low: { icon: ArrowDown, color: "text-green-500", bg: "bg-green-100 dark:bg-green-900/30" },
};

function BriefingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-72 animate-pulse rounded-lg bg-muted" />
      <div className="h-20 animate-pulse rounded-xl bg-muted" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
      <div className="h-48 animate-pulse rounded-xl bg-muted" />
      <div className="h-40 animate-pulse rounded-xl bg-muted" />
    </div>
  );
}

function PriorityDot({ priority }: { priority: string }) {
  const config = priorityConfig[priority as keyof typeof priorityConfig];
  if (!config) return null;
  const Icon = config.icon;
  return <Icon className={cn("size-3.5 shrink-0", config.color)} />;
}

function TaskMiniCard({ task }: { task: Task }) {
  const updateTask = useUpdateTask();
  const isDone = task.status === "done";

  const toggleDone = () => {
    updateTask.mutate({
      id: task.id,
      data: { status: isDone ? "todo" : "done" },
    });
  };

  return (
    <div className={cn(
      "flex items-start gap-2.5 rounded-lg border p-3 transition-colors hover:bg-muted/50",
      isDone && "opacity-60"
    )}>
      <div className="pt-0.5">
        <Checkbox checked={isDone} onCheckedChange={toggleDone} />
      </div>
      <PriorityDot priority={task.priority} />
      <div className="min-w-0 flex-1">
        <p className={cn(
          "text-sm font-medium leading-snug",
          isDone && "line-through text-muted-foreground"
        )}>
          {task.title}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          {task.source_link && (
            <a
              href={task.source_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 text-xs text-primary hover:underline"
            >
              <ExternalLink className="size-3" />
              {task.source === "gmail" ? "Відкрити лист" : "Відкрити повідомлення"}
            </a>
          )}
          {task.due_date && (
            <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
              <CalendarDays className="size-3" />
              {format(parseISO(task.due_date), "MMM d")}
            </span>
          )}
          {task.due_time && (
            <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
              <Clock className="size-3" />
              {task.due_time}
            </span>
          )}
          {task.project && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {task.project}
            </Badge>
          )}
          {task.from_yesterday && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
              з учора
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

function HighlightList({
  highlights,
  icon: Icon,
  emptyText,
}: {
  highlights: BriefingHighlight[];
  icon: typeof Mail;
  emptyText: string;
}) {
  if (highlights.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyText}</p>;
  }
  return (
    <ul className="space-y-1.5">
      {highlights.map((h, i) => (
        <li key={i} className="flex items-start gap-2 text-sm">
          <Icon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
          <span>{h.text}</span>
        </li>
      ))}
    </ul>
  );
}

function ChecklistSection({ items }: { items: ChecklistItem[] }) {
  const updateTask = useUpdateTask();

  const toggle = (item: ChecklistItem) => {
    updateTask.mutate({
      id: item.task_id,
      data: { status: item.done ? "todo" : "done" },
    });
  };

  return (
    <ScrollArea className="max-h-80">
      <ul className="space-y-1">
        {items.map((item) => (
          <li
            key={item.task_id}
            className="flex items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-muted/50"
          >
            <Checkbox
              checked={item.done}
              onCheckedChange={() => toggle(item)}
            />
            <PriorityDot priority={item.priority} />
            <span
              className={cn(
                "text-sm",
                item.done && "text-muted-foreground line-through"
              )}
            >
              {item.title}
            </span>
          </li>
        ))}
      </ul>
    </ScrollArea>
  );
}

export function DailyBriefingView() {
  const { data: brief, isLoading, error } = useBriefing();
  const generateBriefing = useGenerateBriefing();

  const handleRefresh = () => {
    generateBriefing.mutate(undefined, {
      onSuccess: () => toast.success("Брифінг оновлено"),
      onError: () => toast.error("Не вдалося оновити брифінг"),
    });
  };

  if (isLoading) return <BriefingSkeleton />;

  if (error || !brief) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <AlertTriangle className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Не вдалося завантажити щоденний брифінг.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={generateBriefing.isPending}
          >
            {generateBriefing.isPending && <Loader2 className="size-4 animate-spin" />}
            Повторити
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Greeting + Generate */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            {brief.greeting}
          </h1>
          <p className="text-sm text-muted-foreground">
            {format(parseISO(brief.date), "EEEE, MMMM d, yyyy")}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={generateBriefing.isPending}
        >
          {generateBriefing.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <RefreshCw className="size-4" />
          )}
          Оновити брифінг
        </Button>
      </div>

      {/* Summary banner */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 size-5 shrink-0 text-primary" />
            <p className="text-sm leading-relaxed">{brief.summary}</p>
          </div>
        </CardContent>
      </Card>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Сьогодні", value: brief.stats.today_count, icon: CalendarDays, accent: "text-blue-500" },
          { label: "Прострочені", value: brief.stats.overdue_count, icon: AlertTriangle, accent: "text-orange-500" },
          { label: "Вхідні", value: brief.stats.inbox_count, icon: Inbox, accent: "text-purple-500" },
          { label: "Виконані", value: brief.stats.done_count, icon: CheckCircle2, accent: "text-green-500" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-3 py-3">
              <s.icon className={cn("size-5", s.accent)} />
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column — main content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Top 3 Priorities */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="size-4 text-primary" />
                Головні пріоритети
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {brief.top_priorities.length > 0 ? (
                brief.top_priorities.map((t) => (
                  <TaskMiniCard key={t.id} task={t} />
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Немає високопріоритетних задач. Все під контролем!
                </p>
              )}
            </CardContent>
          </Card>

          {/* Checklist */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <CheckCircle2 className="size-4 text-green-500" />
                Чеклист на сьогодні
                <Badge variant="secondary" className="ml-auto">
                  {brief.checklist.filter((c) => c.done).length}/{brief.checklist.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {brief.checklist.length > 0 ? (
                <ChecklistSection items={brief.checklist} />
              ) : (
                <p className="text-sm text-muted-foreground">Задач на сьогодні немає.</p>
              )}
            </CardContent>
          </Card>

          {/* Carried from yesterday */}
          {brief.from_yesterday.length > 0 && (
            <Card className="border-orange-200 dark:border-orange-900/40">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-orange-600 dark:text-orange-400">
                  <Clock className="size-4" />
                  Перенесено з учора
                  <Badge variant="secondary" className="ml-auto bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                    {brief.from_yesterday.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {brief.from_yesterday.map((t) => (
                  <TaskMiniCard key={t.id} task={t} />
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column — highlights & meta */}
        <div className="space-y-6">
          {/* Gmail highlights */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Mail className="size-4 text-red-500" />
                З Gmail
              </CardTitle>
            </CardHeader>
            <CardContent>
              <HighlightList
                highlights={brief.gmail_highlights}
                icon={Mail}
                emptyText="Немає нових елементів з пошти."
              />
            </CardContent>
          </Card>

          {/* Telegram highlights */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageCircle className="size-4 text-blue-500" />
                З Telegram
              </CardTitle>
            </CardHeader>
            <CardContent>
              <HighlightList
                highlights={brief.telegram_highlights}
                icon={MessageCircle}
                emptyText="Немає нових повідомлень з Telegram."
              />
            </CardContent>
          </Card>

          {/* Open Questions */}
          {brief.open_questions.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <HelpCircle className="size-4 text-purple-500" />
                  Потребує вашої уваги
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5">
                  {brief.open_questions.map((q, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="mt-1 size-1.5 shrink-0 rounded-full bg-purple-500" />
                      {q}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Risks */}
          {brief.risks.length > 0 && (
            <Card className="border-red-200 dark:border-red-900/40">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-red-600 dark:text-red-400">
                  <Zap className="size-4" />
                  Ризики та блокери
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5">
                  {brief.risks.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-red-500" />
                      {r}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
