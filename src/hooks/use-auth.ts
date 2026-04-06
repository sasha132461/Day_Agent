"use client";

import { useCallback, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/api";

export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [hasToken, setHasToken] = useState<boolean | null>(null);

  useEffect(() => {
    setHasToken(!!localStorage.getItem("token"));
  }, []);

  const {
    data: user,
    isLoading: isQueryLoading,
    error,
  } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: auth.getMe,
    enabled: hasToken === true,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await auth.login(email, password);
      localStorage.setItem("token", response.access_token);
      setHasToken(true);
      await queryClient.fetchQuery({
        queryKey: ["auth", "me"],
        queryFn: auth.getMe,
      });
      return response;
    },
    [queryClient]
  );

  const register = useCallback(
    async (email: string, password: string, name?: string) => {
      const newUser = await auth.register(email, password, name);
      return newUser;
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setHasToken(false);
    queryClient.clear();
    router.push("/login");
  }, [queryClient, router]);

  const isHydrating = hasToken === null;

  return {
    user: user ?? null,
    isLoading: isHydrating || (hasToken === true && isQueryLoading),
    isAuthenticated: !!user && !error,
    login,
    register,
    logout,
  };
}
