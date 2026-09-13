import { Suspense } from "react";
import { StockListPage } from "@/components/stock/StockListPage";
import { GridLoadingState } from "@/components/stock/StatusStates";

// Suspense boundary required here because StockListPage reads
// useSearchParams (URL is the source of truth for list state).
export default function Page() {
  return (
    <Suspense fallback={<GridLoadingState />}>
      <StockListPage />
    </Suspense>
  );
}
