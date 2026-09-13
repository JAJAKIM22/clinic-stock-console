import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { isLowStock } from "@/lib/stock";
import type { Product } from "@/lib/api/types";

export function StockCard({ product }: { product: Product }) {
  const lowStock = isLowStock(product);

  return (
    <Link
      href={`/items/${product.id}`}
      className="focus-visible:ring-ring rounded-lg focus-visible:ring-2 focus-visible:outline-none"
    >
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardContent className="flex flex-col gap-2">
          <div className="bg-muted relative aspect-square w-full overflow-hidden rounded-md">
            <Image
              src={product.thumbnail}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover"
            />
          </div>
          <h3 className="line-clamp-1 font-medium">{product.title}</h3>
          <p className="text-muted-foreground text-sm capitalize">
            {product.category}
          </p>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <span className="text-sm">Stock: {product.stock}</span>
          {lowStock && <Badge variant="destructive">Low stock</Badge>}
        </CardFooter>
      </Card>
    </Link>
  );
}
