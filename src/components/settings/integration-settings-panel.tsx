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
  const [tgCloudPassword, setTgCloudPassword] = useState("");
  const [tgChats, setTgChats] = useState("");
  const [gmailAi, setGmailAi] = useState<SourceAIPrompts>(emptyPrompts);
  const [telegramAi, setTelegramAi] = useState<SourceAIPrompts>(emptyPrompts);

  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: ["integrations", "status"],
    queryFn: integrations.getStatus,
    enabled: isAuthenticated === true,
  });

  const { data: promptsRemote, isLoading: promptsLoading, isError: promptsError } = useQuery({
    queryKey: ["integrations", "ai-prompts"],
    queryFn: integrations.getAiPrompts,
    enabled: isAuthenticated === true,
    retry: false,
  });

  useEffect(() => {
    if (!promptsRemote) return;
    const g = promptsRemote.gmail;
    const t = promptsRemote.telegram;
    setGmailAi({
      ...emptyPrompts(),
      ...(g && typeof g === "object" ? g : {}),
    });
    setTelegramAi({
      ...emptyPrompts(),
      ...(t && typeof t === "object" ? t : {}),
    });
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
      setTgCloudPassword("");
      queryClient.invalidateQueries({ queryKey: ["integrations", "status"] });
    },
    onError: (e: unknown) => {
      const d = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(typeof d === "string" ? d : "Не вдалося надіслати код");
    },
  });

  const verifyTg = useMutation({
    mutationFn: () => integrations.telegramVerify(tgCode.trim(), tgCloudPassword),
    onSuccess: (r) => {
      toast.success(r.message || "Telegram підключено");
      setTgCode("");
      setTgCloudPassword("");
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
      {promptsError && (
        <p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-950 dark:text-amber-100">
          Не вдалося завантажити збережені промпти (перевірте бекенд і наявність{" "}
          <code className="rounded bg-muted px-1">GET /api/integrations/ai-prompts</code>). Можна
          заповнити поля вручну й зберегти.
        </p>
      )}
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
          <CardDescription className="flex flex-col gap-2">
            <span>
              Потрібен{" "}
              <a
                href="https://myaccount.google.com/apppasswords"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-primary underline"
              >
                пароль додатку
                <ExternalLink className="size-3" />
              </a>{" "}
              Google (не звичайний пароль від акаунта). Коли Google запитає назву додатка, можна ввести, наприклад,{" "}
              <strong className="font-medium text-foreground">Daily Planner</strong> — це лише підпис для вас у
              списку паролів.
            </span>
            <span className="text-xs leading-relaxed text-muted-foreground">
              Підказка: має бути увімкнена{" "}
              <a
                href="https://myaccount.google.com/signinoptions/two-step-verification"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-primary underline"
              >
                двофакторна перевірка (2FA)
                <ExternalLink className="size-3" />
              </a>
              . Якщо з’являється «налаштування недоступне» навіть для особистого @gmail.com: переконайтесь, що на{" "}
              <a
                href="https://myaccount.google.com/apppasswords"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                сторінці паролів додатків
              </a>{" "}
              у правому верхньому куті обрано саме той акаунт; вимкніть{" "}
              <a
                href="https://myaccount.google.com/security"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                Розширений захист Google
              </a>
              , якщо він увімкнений; облікові записи під наглядом (наприклад, Family Link) часто не отримують паролі
              додатків. Також буває з Workspace / шкільною поштою — тоді лише адмін або інший акаунт. Наш бекенд
              очікує IMAP з паролем додатку.
            </span>
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
          <CardDescription className="flex flex-col gap-2">
            <span>
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
            </span>
            <span className="text-xs leading-relaxed text-muted-foreground">
              Після «Надіслати код» введіть лише <strong className="font-medium text-foreground">цифри</strong> з
              повідомлення Telegram. Якщо у вас увімкнена{" "}
              <strong className="font-medium text-foreground">двоетапна перевірка</strong> (окремий пароль облікового
              запису в Telegram), введіть його в полі «Пароль 2FA» і натисніть «Підтвердити» (код і пароль разом).
            </span>
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
                <p className="text-sm text-amber-600">Очікується код з Telegram (дійний близько 15 хв).</p>
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
              autoComplete="one-time-code"
              value={tgCode}
              onChange={(e) => setTgCode(e.target.value)}
              placeholder="лише цифри, напр. 12345"
            />
            <p className="text-xs text-muted-foreground">
              Пробіли та дефіси можна не прибирати — вони будуть відкинуті при відправці.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="tg-2fa">Пароль 2FA Telegram (якщо увімкнено в застосунку)</Label>
            <Input
              id="tg-2fa"
              type="password"
              autoComplete="current-password"
              value={tgCloudPassword}
              onChange={(e) => setTgCloudPassword(e.target.value)}
              placeholder="залиште порожнім, якщо без двоетапної перевірки"
            />
            <p className="text-xs text-muted-foreground">
              Це не код з SMS/чату, а пароль, який ви задали в Telegram → Налаштування → Конфіденційність → Двоетапна
              перевірка.
            </p>
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
