"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { integrations } from "@/lib/api";
import type { AIPromptsPayload, SourceAIPrompts } from "@/types/ai-prompts";
import { useAuth } from "@/hooks/use-auth";
import { ExternalLink, Loader2, Mail, MessageCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const emptyPrompts = (): SourceAIPrompts => ({
  general: "",
  priority_low: "",
  priority_medium: "",
  priority_high: "",
});

function AiPromptFields({
  idPrefix,
  value,
  onChange,
}: {
  idPrefix: string;
  value: SourceAIPrompts;
  onChange: (next: SourceAIPrompts) => void;
}) {
  const set = (key: keyof SourceAIPrompts, v: string) =>
    onChange({ ...value, [key]: v });

  return (
    <div className="flex flex-col gap-4 border-t pt-4">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Sparkles className="size-4 text-primary" />
        Промпти для нейромережі
      </div>
      <p className="text-xs text-muted-foreground">
        Ці тексти додаються до стандартних правил витягування задач. Окремо для цього джерела
        (листи або повідомлення Telegram).
      </p>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}-general`}>Загальний запит</Label>
        <Textarea
          id={`${idPrefix}-general`}
          className="min-h-[88px]"
          placeholder="Напр.: я студент, важливі дедлайни з навчання; рекламу ігнорувати…"
          value={value.general}
          onChange={(e) => set("general", e.target.value)}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-1">
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${idPrefix}-low`}>Низький пріоритет — що для вас «легке» / FYI</Label>
          <Textarea
            id={`${idPrefix}-low`}
            className="min-h-[72px]"
            placeholder="Коли ставити low: нагадування без терміну, довгі дискусії…"
            value={value.priority_low}
            onChange={(e) => set("priority_low", e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${idPrefix}-med`}>Середній пріоритет</Label>
          <Textarea
            id={`${idPrefix}-med`}
            className="min-h-[72px]"
            placeholder="Звичайні справи з помірною важливістю…"
            value={value.priority_medium}
            onChange={(e) => set("priority_medium", e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${idPrefix}-high`}>Високий пріоритет — терміново, дедлайни</Label>
          <Textarea
            id={`${idPrefix}-high`}
            className="min-h-[72px]"
            placeholder="Що завжди має бути high: іспити завтра, оплата сьогодні…"
            value={value.priority_high}
            onChange={(e) => set("priority_high", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

export function IntegrationSettingsPanel({
  className,
  showWelcomeHint,
  onNavigateDashboard,
  embedded,
}: {
  className?: string;
  showWelcomeHint?: boolean;
  onNavigateDashboard?: () => void;
  /** У вікні налаштувань — без заголовка сторінки й кнопки «До дашборду» */
  embedded?: boolean;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const [gmailEmail, setGmailEmail] = useState("");
  const [gmailPass, setGmailPass] = useState("");
  const [tgPhone, setTgPhone] = useState("");
  const [tgCode, setTgCode] = useState("");
  const [tgChats, setTgChats] = useState("");
  const [gmailAi, setGmailAi] = useState<SourceAIPrompts>(emptyPrompts);
  const [telegramAi, setTelegramAi] = useState<SourceAIPrompts>(emptyPrompts);

  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: ["integrations", "status"],
    queryFn: integrations.getStatus,
    enabled: isAuthenticated === true,
  });

  const { data: promptsRemote, isLoading: promptsLoading } = useQuery({
    queryKey: ["integrations", "ai-prompts"],
    queryFn: integrations.getAiPrompts,
    enabled: isAuthenticated === true,
  });

  useEffect(() => {
    if (promptsRemote) {
      setGmailAi({ ...emptyPrompts(), ...promptsRemote.gmail });
      setTelegramAi({ ...emptyPrompts(), ...promptsRemote.telegram });
    }
  }, [promptsRemote]);

  const connectGmail = useMutation({
    mutationFn: () => integrations.connectGmail(gmailEmail.trim(), gmailPass),
    onSuccess: (r) => {
      toast.success(r.message || "Gmail збережено");
      setGmailPass("");
      queryClient.invalidateQueries({ queryKey: ["integrations", "status"] });
    },
    onError: (e: unknown) => {
      const d = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(typeof d === "string" ? d : "Не вдалося зберегти Gmail");
    },
  });

  const disconnectGmail = useMutation({
    mutationFn: integrations.disconnectGmail,
    onSuccess: () => {
      toast.success("Gmail відключено");
      queryClient.invalidateQueries({ queryKey: ["integrations", "status"] });
    },
  });

  const sendTgCode = useMutation({
    mutationFn: () => integrations.telegramSendCode(tgPhone.trim()),
    onSuccess: (r) => {
      toast.success(r.message || "Код надіслано");
      queryClient.invalidateQueries({ queryKey: ["integrations", "status"] });
    },
    onError: (e: unknown) => {
      const d = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(typeof d === "string" ? d : "Не вдалося надіслати код");
    },
  });

  const verifyTg = useMutation({
    mutationFn: () => integrations.telegramVerify(tgCode.trim()),
    onSuccess: (r) => {
      toast.success(r.message || "Telegram підключено");
      setTgCode("");
      queryClient.invalidateQueries({ queryKey: ["integrations", "status"] });
    },
    onError: (e: unknown) => {
      const d = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(typeof d === "string" ? d : "Помилка перевірки коду");
    },
  });

  const disconnectTg = useMutation({
    mutationFn: integrations.disconnectTelegram,
    onSuccess: () => {
      toast.success("Telegram відключено");
      queryClient.invalidateQueries({ queryKey: ["integrations", "status"] });
    },
  });

  const saveChats = useMutation({
    mutationFn: () => integrations.setTelegramChats(tgChats.trim() || null),
    onSuccess: () => {
      toast.success("Чати збережено");
      queryClient.invalidateQueries({ queryKey: ["integrations", "status"] });
    },
  });

  const saveAiPrompts = useMutation({
    mutationFn: (body: AIPromptsPayload) => integrations.putAiPrompts(body),
    onSuccess: () => {
      toast.success("Промпти для ШІ збережено");
      queryClient.invalidateQueries({ queryKey: ["integrations", "ai-prompts"] });
    },
    onError: (e: unknown) => {
      const d = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(typeof d === "string" ? d : "Не вдалося зберегти промпти");
    },
  });

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const goDash = () => {
    if (onNavigateDashboard) onNavigateDashboard();
    else router.push("/dashboard");
  };

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {!embedded && (
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Підключення та ШІ</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Доступ до пошти й Telegram та власні інструкції для моделі при синхронізації кожного джерела.
          </p>
          {showWelcomeHint && (
            <p className="mt-3 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm">
              Ласкаво просимо! Підключіть джерела або одразу перейдіть до{" "}
              <button
                type="button"
                className="font-medium text-primary underline"
                onClick={goDash}
              >
                дашборду
              </button>
              .
            </p>
          )}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mail className="size-5" />
            Gmail
          </CardTitle>
          <CardDescription>
            Потрібен{" "}
            <a
              href="https://support.google.com/accounts/answer/185833"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 text-primary underline"
            >
              пароль додатку
              <ExternalLink className="size-3" />
            </a>{" "}
            Google (не звичайний пароль від акаунта).
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {statusLoading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <p className="text-sm">
              Статус:{" "}
              <span className={status?.gmail_connected ? "text-green-600" : "text-muted-foreground"}>
                {status?.gmail_connected ? "підключено" : "не підключено"}
              </span>
            </p>
          )}
          <div className="flex flex-col gap-2">
            <Label htmlFor="gmail-email">Email Gmail</Label>
            <Input
              id="gmail-email"
              type="email"
              autoComplete="email"
              value={gmailEmail}
              onChange={(e) => setGmailEmail(e.target.value)}
              placeholder="you@gmail.com"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="gmail-app">Пароль додатку (16 символів)</Label>
            <Input
              id="gmail-app"
              type="password"
              autoComplete="new-password"
              value={gmailPass}
              onChange={(e) => setGmailPass(e.target.value)}
              placeholder="xxxx xxxx xxxx xxxx"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              disabled={connectGmail.isPending || !gmailEmail || !gmailPass}
              onClick={() => connectGmail.mutate()}
            >
              {connectGmail.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Зберегти Gmail
            </Button>
            {status?.gmail_connected && (
              <Button
                type="button"
                variant="outline"
                disabled={disconnectGmail.isPending}
                onClick={() => disconnectGmail.mutate()}
              >
                Відключити
              </Button>
            )}
          </div>

          {promptsLoading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <AiPromptFields idPrefix="gmail" value={gmailAi} onChange={setGmailAi} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageCircle className="size-5" />
            Telegram
          </CardTitle>
          <CardDescription>
            Номер у форматі міжнародного (+380…). На сервері мають бути вказані{" "}
            <code className="rounded bg-muted px-1">TELEGRAM_API_ID</code> та{" "}
            <code className="rounded bg-muted px-1">TELEGRAM_API_HASH</code> (з{" "}
            <a
              href="https://my.telegram.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              my.telegram.org
            </a>
            ).
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {statusLoading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <>
              <p className="text-sm">
                Статус:{" "}
                <span className={status?.telegram_connected ? "text-green-600" : "text-muted-foreground"}>
                  {status?.telegram_connected ? "підключено" : "не підключено"}
                </span>
                {!status?.server_telegram_configured && (
                  <span className="text-destructive"> — API ключі Telegram не налаштовані на сервері</span>
                )}
              </p>
              {status?.telegram_code_sent && (
                <p className="text-sm text-amber-600">Очікується код з Telegram (дійний ~10 хв).</p>
              )}
            </>
          )}
          <div className="flex flex-col gap-2">
            <Label htmlFor="tg-phone">Номер телефону</Label>
            <Input
              id="tg-phone"
              type="tel"
              autoComplete="tel"
              value={tgPhone}
              onChange={(e) => setTgPhone(e.target.value)}
              placeholder="+380501234567"
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            disabled={sendTgCode.isPending || !tgPhone.trim() || !status?.server_telegram_configured}
            onClick={() => sendTgCode.mutate()}
          >
            {sendTgCode.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Надіслати код у Telegram
          </Button>
          <div className="flex flex-col gap-2">
            <Label htmlFor="tg-code">Код з Telegram</Label>
            <Input
              id="tg-code"
              inputMode="numeric"
              value={tgCode}
              onChange={(e) => setTgCode(e.target.value)}
              placeholder="12345"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              disabled={verifyTg.isPending || !tgCode.trim()}
              onClick={() => verifyTg.mutate()}
            >
              {verifyTg.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Підтвердити
            </Button>
            {status?.telegram_connected && (
              <Button
                type="button"
                variant="outline"
                disabled={disconnectTg.isPending}
                onClick={() => disconnectTg.mutate()}
              >
                Відключити Telegram
              </Button>
            )}
          </div>
          <div className="border-t pt-4">
            <p className="mb-2 text-sm text-muted-foreground">
              Необов&apos;язково: ID чатів через кому (якщо порожньо — беруться останні діалоги).
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="flex-1">
                <Label htmlFor="tg-chats">Chat IDs</Label>
                <Input
                  id="tg-chats"
                  value={tgChats}
                  onChange={(e) => setTgChats(e.target.value)}
                  placeholder="-1001234567890, -1009876543210"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                disabled={saveChats.isPending || !status?.telegram_connected}
                onClick={() => saveChats.mutate()}
              >
                Зберегти чати
              </Button>
            </div>
          </div>

          {promptsLoading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <AiPromptFields idPrefix="tg" value={telegramAi} onChange={setTelegramAi} />
          )}
        </CardContent>
      </Card>

      <div
        className={cn(
          "flex flex-col gap-2",
          !embedded && "sm:flex-row sm:items-center sm:justify-between",
        )}
      >
        <Button
          type="button"
          disabled={saveAiPrompts.isPending || promptsLoading}
          onClick={() => saveAiPrompts.mutate({ gmail: gmailAi, telegram: telegramAi })}
        >
          {saveAiPrompts.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
          Зберегти всі промпти для ШІ
        </Button>
        {!embedded && (
          <Button type="button" variant="ghost" className="self-start sm:self-auto" onClick={goDash}>
            До дашборду
          </Button>
        )}
      </div>
    </div>
  );
}
