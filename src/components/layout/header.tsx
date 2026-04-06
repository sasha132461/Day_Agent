"use client";

import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useSyncAll, useSyncGmail, useSyncTelegram } from "@/hooks/use-tasks";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Link2,
  Loader2,
  LogOut,
  Mail,
  MessageCircle,
  Moon,
  RefreshCw,
  Sun,
} from "lucide-react";

export function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const syncAll = useSyncAll();
  const syncGmail = useSyncGmail();
  const syncTelegram = useSyncTelegram();

  const isSyncing =
    syncAll.isPending || syncGmail.isPending || syncTelegram.isPending;

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.charAt(0).toUpperCase() ?? "U";

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <CalendarDays className="size-4" />
          </div>
          <span className="text-base font-semibold tracking-tight">
            Щоденний Планувальник
          </span>
        </div>

        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon" disabled={isSyncing} />
              }
            >
              {isSyncing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <RefreshCw className="size-4" />
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Синхронізація</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => {
                toast.loading("Синхронізація...", { id: "sync" });
                syncAll.mutate(undefined, {
                  onSuccess: () => toast.success("Синхронізовано!", { id: "sync" }),
                  onError: () => toast.error("Помилка синхронізації", { id: "sync" }),
                });
              }}>
                <RefreshCw className="size-4" />
                Синхронізувати все
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                toast.loading("Gmail...", { id: "sync" });
                syncGmail.mutate(undefined, {
                  onSuccess: () => toast.success("Gmail синхронізовано!", { id: "sync" }),
                  onError: () => toast.error("Помилка Gmail", { id: "sync" }),
                });
              }}>
                <Mail className="size-4" />
                Синхронізувати Gmail
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                toast.loading("Telegram...", { id: "sync" });
                syncTelegram.mutate(undefined, {
                  onSuccess: () => toast.success("Telegram синхронізовано!", { id: "sync" }),
                  onError: () => toast.error("Помилка Telegram", { id: "sync" }),
                });
              }}>
                <MessageCircle className="size-4" />
                Синхронізувати Telegram
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="size-4 scale-100 rotate-0 transition-transform dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute size-4 scale-0 rotate-90 transition-transform dark:scale-100 dark:rotate-0" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                />
              }
            >
              <Avatar size="sm">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {user?.name || "Користувач"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {user?.email}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/integrations")}>
                <Link2 className="size-4" />
                Gmail і Telegram
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="size-4" />
                Вийти
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
