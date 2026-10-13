import { trpc } from "@/providers/trpc";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { LOGIN_PATH } from "@/const";

const ACCESS_TOKEN_KEY = "ai_ds_access_token";
const REFRESH_TOKEN_KEY = "ai_ds_refresh_token";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = LOGIN_PATH } =
    options ?? {};

  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const [tokenReady, setTokenReady] = useState(false);

  // Set Authorization header from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) {
      setTokenReady(true);
    } else {
      setTokenReady(true);
    }
  }, []);

  const {
    data: meData,
    isLoading,
    error,
    refetch,
  } = trpc.auth.me.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
    retry: false,
    enabled: tokenReady,
  });

  const user = meData?.user ?? null;

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: async () => {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      await utils.invalidate();
      navigate(redirectPath);
      window.location.reload();
    },
  });

  const refreshMutation = trpc.auth.refresh.useMutation({
    onSuccess: (res) => {
      if (res.success && res.accessToken && res.refreshToken) {
        localStorage.setItem(ACCESS_TOKEN_KEY, res.accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, res.refreshToken);
        refetch();
      } else {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        window.location.reload();
      }
    },
    onError: () => {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      window.location.reload();
    },
  });

  const login = useCallback(
    (accessToken: string, refreshToken: string) => {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      refetch();
      navigate("/workspace");
    },
    [navigate, refetch]
  );

  const logout = useCallback(() => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    logoutMutation.mutate({ refreshToken: refreshToken || undefined });
  }, [logoutMutation]);

  // Auto-refresh token before expiry
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (refreshToken) {
        refreshMutation.mutate({ refreshToken });
      }
    }, 1000 * 60 * 10);
    return () => clearInterval(interval);
  }, [user, refreshMutation]);

  // Redirect if not authenticated
  useEffect(() => {
    if (redirectOnUnauthenticated && !isLoading && !user && tokenReady) {
      const currentPath = window.location.pathname;
      if (currentPath !== redirectPath) {
        navigate(redirectPath);
      }
    }
  }, [redirectOnUnauthenticated, isLoading, user, navigate, redirectPath, tokenReady]);

  return useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading: isLoading || logoutMutation.isPending || !tokenReady,
      error,
      login,
      logout,
      refresh: refetch,
    }),
    [user, isLoading, logoutMutation.isPending, tokenReady, error, login, logout, refetch]
  );
}

// Helper to get token for tRPC headers
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}
