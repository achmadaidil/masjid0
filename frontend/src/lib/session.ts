import { useQuery } from "@tanstack/react-query";
import { apiGet, apiPost, ApiError } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import type { SessionUser } from "@/lib/types";

/** GET /auth/me → the logged-in takmir, or null on 401 (not logged in). */
export async function fetchSession(): Promise<SessionUser | null> {
  try {
    return await apiGet<SessionUser>("/auth/me");
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return null;
    throw err;
  }
}

export function useSession() {
  return useQuery({ queryKey: ["me"], queryFn: fetchSession, retry: false });
}

/** Call after a successful login — refreshes the session cache. */
export async function beginSession() {
  await queryClient.invalidateQueries({ queryKey: ["me"] });
}

/**
 * Call on every sign-out: clears the server cookie AND wipes the react-query cache so the
 * previous account's data never renders for the next login on this browser.
 */
export async function endSession() {
  try {
    await apiPost("/auth/logout");
  } finally {
    queryClient.clear();
    queryClient.setQueryData(["me"], null);
  }
}
