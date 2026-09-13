"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import type { ProductListParams } from "@/lib/queryKeys";

// Single source of truth for the stock list's URL state (q, category,
// sort, order, page). Keeping this in the URL — rather than component
// state — is what makes reload and copied links restore the exact same
// view (see README decision log).
export function useProductListParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const params: ProductListParams = useMemo(() => {
    const page = Number(searchParams.get("page") ?? "1");
    return {
      q: searchParams.get("q") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      sortBy: searchParams.get("sortBy") ?? undefined,
      order: (searchParams.get("order") as "asc" | "desc" | null) ?? undefined,
      page: Number.isFinite(page) && page > 0 ? page : 1,
    };
  }, [searchParams]);

  // Updates one or more params. Any change other than `page` itself resets
  // page back to 1 — changing a filter/sort/search shouldn't strand the
  // user on a now-out-of-range page (requirement #2 in the brief).
  const setParams = useCallback(
    (next: Partial<ProductListParams>) => {
      const current = new URLSearchParams(searchParams.toString());

      Object.entries(next).forEach(([key, value]) => {
        if (value === undefined || value === "" || value === null) {
          current.delete(key);
        } else {
          current.set(key, String(value));
        }
      });

      const isOnlyPageChange = Object.keys(next).length === 1 && "page" in next;
      if (!isOnlyPageChange) {
        current.set("page", "1");
      }

      router.push(`${pathname}?${current.toString()}`);
    },
    [pathname, router, searchParams],
  );

  return { params, setParams };
}
