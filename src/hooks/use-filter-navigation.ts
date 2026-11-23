"use client";

import { useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function useFilterNavigation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`/admin?${params.toString()}`);
    },
    [router, searchParams],
  );

  const updateParamDebounced = useCallback(
    (key: string, value: string, delay = 300) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => updateParam(key, value), delay);
    },
    [updateParam],
  );

  const clearAll = useCallback(() => {
    const params = new URLSearchParams();
    // Clearing the filters keeps the season: it is which rows exist, not a
    // narrowing of them.
    const year = searchParams.get("year");
    if (year) params.set("year", year);
    router.push(`/admin?${params.toString()}`);
  }, [router, searchParams]);

  return { updateParam, updateParamDebounced, clearAll, searchParams };
}
