import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import type { AppSettings } from "@/lib/types";

/** Public mosque profile + admin WhatsApp number. Falls back to defaults when offline. */
export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: () => apiGet<AppSettings>("/settings"),
    staleTime: 60_000,
    retry: false,
  });
}
