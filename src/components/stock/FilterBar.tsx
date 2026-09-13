"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories } from "@/hooks/useProducts";
import type { ProductListParams } from "@/lib/queryKeys";

const SORT_OPTIONS = [
  { value: "title-asc", label: "Name (A-Z)", sortBy: "title", order: "asc" },
  { value: "title-desc", label: "Name (Z-A)", sortBy: "title", order: "desc" },
  {
    value: "stock-asc",
    label: "Stock (low-high)",
    sortBy: "stock",
    order: "asc",
  },
  {
    value: "stock-desc",
    label: "Stock (high-low)",
    sortBy: "stock",
    order: "desc",
  },
] as const;

export function FilterBar({
  params,
  onChange,
}: {
  params: ProductListParams;
  onChange: (next: Partial<ProductListParams>) => void;
}) {
  const { data: categories, isLoading } = useCategories();
  const isSearchActive = Boolean(params.q);

  const currentSortValue = SORT_OPTIONS.find(
    (o) => o.sortBy === params.sortBy && o.order === params.order,
  )?.value;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Select
          value={params.category ?? "all"}
          disabled={isSearchActive}
          onValueChange={(value) =>
            onChange({ category: value === "all" ? undefined : value })
          }
        >
          <SelectTrigger
            className="w-full sm:w-48"
            aria-label="Filter by category"
          >
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {!isLoading &&
              categories?.map((c) => (
                <SelectItem key={c.slug} value={c.slug}>
                  {c.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        <Select
          value={currentSortValue ?? "none"}
          onValueChange={(value) => {
            const option = SORT_OPTIONS.find((o) => o.value === value);
            onChange({
              sortBy: option?.sortBy,
              order: option?.order,
            });
          }}
        >
          <SelectTrigger className="w-full sm:w-48" aria-label="Sort items">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Default order</SelectItem>
            {SORT_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isSearchActive && (
        <p role="status" className="text-muted-foreground text-xs">
          Category filter is disabled while searching — DummyJSON doesn&apos;t
          support combining search with a category filter server-side.
        </p>
      )}
    </div>
  );
}
