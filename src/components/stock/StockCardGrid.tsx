import { StockCard } from "./StockCard";
import type { Product } from "@/lib/api/types";

export function StockCardGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <StockCard key={product.id} product={product} />
      ))}
    </div>
  );
}
