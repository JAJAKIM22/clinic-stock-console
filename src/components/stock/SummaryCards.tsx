import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { isLowStock } from "@/lib/stock";
import type { Product } from "@/lib/api/types";

export function SummaryCards({
  products,
  total,
}: {
  products: Product[];
  total: number;
}) {
  const lowStockCount = products.filter(isLowStock).length;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-muted-foreground text-sm font-normal">
            Total items
          </CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-semibold">{total}</CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-muted-foreground text-sm font-normal">
            Low stock (this page)
          </CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-semibold">
          {lowStockCount}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-muted-foreground text-sm font-normal">
            Showing
          </CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-semibold">
          {products.length}
        </CardContent>
      </Card>
    </div>
  );
}
