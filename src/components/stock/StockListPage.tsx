"use client";

import { AuthenticatedLayout } from "@/components/layout/AuthenticatedLayout";
import { SummaryCards } from "@/components/stock/SummaryCards";
import { FilterBar } from "@/components/stock/FilterBar";
import { SearchBox } from "@/components/stock/SearchBox";
import { StockCardGrid } from "@/components/stock/StockCardGrid";
import { Pagination } from "@/components/stock/Pagination";
import {
  GridLoadingState,
  EmptyState,
  ErrorState,
} from "@/components/stock/StatusStates";
import { useProductListParams } from "@/hooks/useProductListParams";
import { useProducts } from "@/hooks/useProducts";

function StockListContent() {
  const { params, setParams } = useProductListParams();
  const { data, isLoading, isError, refetch } = useProducts(params);

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-semibold">Stock List</h1>

      {data && <SummaryCards products={data.products} total={data.total} />}

      <div className="flex flex-col gap-3">
        <SearchBox
          value={params.q ?? ""}
          onChange={(q) =>
            setParams({
              q: q || undefined,
              // Clear category alongside search — search and category
              // can't apply together (see FilterBar), so keeping a stale
              // category selected while it's disabled would be confusing.
              category: q ? undefined : params.category,
            })
          }
        />
        <FilterBar params={params} onChange={setParams} />
      </div>

      {isLoading && <GridLoadingState />}

      {isError && <ErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && data && data.products.length === 0 && (
        <EmptyState />
      )}

      {!isLoading && !isError && data && data.products.length > 0 && (
        <>
          <StockCardGrid products={data.products} />
          <Pagination
            page={params.page}
            total={data.total}
            onPageChange={(page) => setParams({ page })}
          />
        </>
      )}
    </main>
  );
}

export function StockListPage() {
  return (
    <AuthenticatedLayout>
      <StockListContent />
    </AuthenticatedLayout>
  );
}
