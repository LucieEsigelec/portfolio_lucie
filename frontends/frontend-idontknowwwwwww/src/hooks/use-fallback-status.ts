import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useSyncExternalStore } from "react";

import type { ApiErrorInfo, ApiResult } from "@/services/api";

function isFallbackResult(value: unknown): value is ApiResult<unknown> {
  return (
    !!value &&
    typeof value === "object" &&
    "source" in value &&
    (value as { source: unknown }).source === "fallback"
  );
}

/**
 * Lists the API errors behind every fallback dataset currently displayed
 * (queries with at least one mounted observer). Empty when all data is live.
 */
export function useFallbackStatus(): ApiErrorInfo[] {
  const cache = useQueryClient().getQueryCache();

  const subscribe = useCallback((onChange: () => void) => cache.subscribe(onChange), [cache]);

  const getSnapshot = useCallback(() => {
    const byPath = new Map<string, ApiErrorInfo>();
    for (const query of cache.getAll()) {
      if (query.getObserversCount() === 0) continue;
      const data: unknown = query.state.data;
      if (isFallbackResult(data) && data.error) byPath.set(data.error.path, data.error);
    }
    return JSON.stringify([...byPath.values()]);
  }, [cache]);

  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => "[]");
  return useMemo(() => JSON.parse(snapshot) as ApiErrorInfo[], [snapshot]);
}
