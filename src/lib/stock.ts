import type { Product } from "@/lib/api/types";

// "Low stock" isn't a field DummyJSON provides — defined as
// stock < minimumOrderQuantity, a client-side assumption stated explicitly
// per the brief's warning against inventing clinical data (see README).
// Extracted to one place so the SummaryCards count and the StockCard badge
// can't silently drift apart.
export function isLowStock(product: Product): boolean {
  return product.stock < product.minimumOrderQuantity;
}
