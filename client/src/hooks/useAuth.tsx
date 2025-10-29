import { useCallback, useEffect, useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = "/login" } = options ?? {};
  const utils = trpc.useUtils();
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("auth_token");
  });

  // 👇 --- IMPROVEMENT #1: Automatically log out if the token is invalid ---
  const logout = useCallback(async (skipMutation = false) => {
    // Invalidate the query first to ensure UI updates
    utils.auth.me.invalidate();

    // Clear token from React state and localStorage
    setToken(null);
    localStorage.removeItem("auth_token");
    
    // Reset the user data in the cache to null
    utils.auth.me.setData(undefined, undefined);

    // Optionally skip calling the backend (e.g., if we know the server call will fail)
    if (skipMutation) return;

    try {
      await logoutMutation.mutateAsync();
    } catch (error: unknown) {
      if (
        error instanceof TRPCClientError &&
        error.data?.code === "UNAUTHORIZED"
      ) {
        // If we get an unauthorized error during logout, it's fine.
        // The token is already gone locally. We can ignore this error.
        return;
      }
      // Re-throw other errors
      throw error;
    }
  }, [utils]);


  // Fetch current user if token exists
  const meQuery = trpc.auth.me.useQuery(undefined, {
    enabled: !!token,
    retry: false,
    refetchOnWindowFocus: false,
    // 👇 --- IMPROVEMENT #2: Handle expired token error directly ---
    onError: (error) => {
      // If the server says we're unauthorized, the token is bad.
      // Call the logout function to clear it everywhere.
      if (error.data?.code === 'UNAUTHORIZED') {
        logout(true); // skipMutation = true, no need to tell the server we're logging out
      }
    }
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    // onSuccess is now handled by the main logout function
  });

  // 👇 --- FIX: Create a new function to handle setting the token ---
  // This function saves to localStorage AND updates React state.
  const handleSetToken = useCallback((newToken: string) => {
    localStorage.setItem("auth_token", newToken);
    setToken(newToken);
  }, []);


  const state = useMemo(() => {
    return {
      user: meQuery.data ?? null,
      loading: meQuery.isLoading, // Simplified loading state
      error: meQuery.error ?? null, // Simplified error state
      isAuthenticated: !!meQuery.data && !!token, // Check for data AND token
      token,
    };
  }, [
    meQuery.data,
    meQuery.error,
    meQuery.isLoading,
    token,
  ]);

  // Handle redirect on unauthenticated
  useEffect(() => {
    if (!redirectOnUnauthenticated || meQuery.isLoading) return;
    if (state.isAuthenticated) return; // Use the derived isAuthenticated state
    if (typeof window === "undefined" || window.location.pathname === redirectPath) return;

    window.location.href = redirectPath;
  }, [
    redirectOnUnauthenticated,
    redirectPath,
    meQuery.isLoading,
    state.isAuthenticated,
  ]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
    // EXPORT THE NEW FUNCTION instead of the raw setToken
    setToken: handleSetToken,
  };
}