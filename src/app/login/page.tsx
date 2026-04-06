"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarDays, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, register, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        await register(email, password, name || undefined);
        await login(email, password);
        router.push("/integrations?new=1");
      } else {
        await login(email, password);
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || (isSignUp ? "Помилка реєстрації" : "Невірні дані для входу");
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <CalendarDays className="size-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Щоденний Планувальник
          </h1>
          <p className="text-sm text-muted-foreground">
            Плануй день, тримай фокус, досягай цілей.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isSignUp ? "Створити акаунт" : "З поверненням"}</CardTitle>
            <CardDescription>
              {isSignUp
                ? "Введіть дані для реєстрації"
                : "Увійдіть, щоб продовжити"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {isSignUp && (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name">Ім&apos;я</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Ваше ім'я"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button type="submit" disabled={loading} className="w-full">
                {loading && <Loader2 className="size-4 animate-spin" />}
                {isSignUp ? "Зареєструватися" : "Увійти"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                {isSignUp ? "Вже маєте акаунт?" : "Немає акаунту?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError(null);
                  }}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  {isSignUp ? "Увійти" : "Зареєструватися"}
                </button>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
