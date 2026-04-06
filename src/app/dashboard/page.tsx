"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/layout/header";
import { DailyBriefingView } from "@/components/dashboard/daily-briefing";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { TaskFilters } from "@/components/dashboard/task-filters";
import { SearchBar } from "@/components/dashboard/search-bar";
import { TaskList } from "@/components/dashboard/task-list";
import { FocusPanel } from "@/components/dashboard/focus-panel";
import { CreateTaskDialog } from "@/components/dashboard/create-task-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, ListTodo } from "lucide-react";
import type { TaskFilter } from "@/types/task";

function DashboardSkeleton() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="sticky top-0 z-40 h-14 border-b bg-background" />
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
        <div className="h-8 w-72 animate-pulse rounded-lg bg-muted" />
        <div className="mt-4 h-20 animate-pulse rounded-xl bg-muted" />
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [filter, setFilter] = useState<TaskFilter>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex flex-1 flex-col">
      <Header />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
        <Tabs defaultValue="briefing">
          <div className="flex items-center justify-between gap-3">
            <TabsList>
              <TabsTrigger value="briefing">
                <Sparkles className="size-4" />
                Брифінг
              </TabsTrigger>
              <TabsTrigger value="tasks">
                <ListTodo className="size-4" />
                Усі задачі
              </TabsTrigger>
            </TabsList>
            <CreateTaskDialog />
          </div>

          <TabsContent value="briefing" className="mt-4">
            <DailyBriefingView />
          </TabsContent>

          <TabsContent value="tasks" className="mt-4">
            <SummaryCards />
            <div className="mt-6 flex flex-col gap-6 lg:flex-row">
              <div className="flex-1 min-w-0 space-y-4">
                <TaskFilters value={filter} onChange={setFilter} />
                <SearchBar value={search} onChange={setSearch} />
                <TaskList filter={filter} search={search} />
              </div>
              <aside className="w-full shrink-0 lg:w-80">
                <FocusPanel />
              </aside>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
