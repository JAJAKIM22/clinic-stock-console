"use client";

import { use, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { AuthenticatedLayout } from "@/components/layout/AuthenticatedLayout";
import { Badge } from "@/components/ui/badge";
import { StockCorrectionForm } from "@/components/stock/StockCorrectionForm";
import { ErrorState } from "@/components/stock/StatusStates";
import { Skeleton } from "@/components/ui/skeleton";
import { useProduct } from "@/hooks/useProducts";

function ItemDetailContent({ id }: { id: string }) {
  const { data: product, isLoading, isError, refetch } = useProduct(id);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Move focus to the page heading on mount so keyboard users navigating
  // here from the card grid aren't stranded on the link they just
  // activated, or reset to the top of the document with no clear landmark.
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  if (isLoading) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8">
        <Skeleton className="mb-4 h-8 w-48" />
        <Skeleton className="aspect-square w-full rounded-lg" />
      </main>
    );
  }

  if (isError || !product) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8">
        <ErrorState onRetry={() => refetch()} />
      </main>
    );
  }

  const lowStock = product.stock < product.minimumOrderQuantity;

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8">
      <Link href="/" className="text-sm underline underline-offset-4">
        Back to stock list
      </Link>

      <h1
        ref={headingRef}
        tabIndex={-1}
        className="text-2xl font-semibold outline-none"
      >
        {product.title}
      </h1>

      <div className="bg-muted relative aspect-square w-full max-w-sm overflow-hidden rounded-lg">
        <Image
          src={product.thumbnail}
          alt={product.title}
          fill
          sizes="400px"
          className="object-cover"
        />
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <dt className="text-muted-foreground">Category</dt>
        <dd className="capitalize">{product.category}</dd>

        <dt className="text-muted-foreground">SKU</dt>
        <dd>{product.sku}</dd>

        <dt className="text-muted-foreground">Current stock</dt>
        <dd className="flex items-center gap-2">
          {product.stock}
          {lowStock && <Badge variant="destructive">Low stock</Badge>}
        </dd>

        <dt className="text-muted-foreground">Minimum order quantity</dt>
        <dd>{product.minimumOrderQuantity}</dd>
      </dl>

      <div>
        <h2 className="mb-2 font-medium">Correct stock count</h2>
        <StockCorrectionForm productId={id} currentStock={product.stock} />
      </div>
    </main>
  );
}

export default function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <AuthenticatedLayout>
      <ItemDetailContent id={id} />
    </AuthenticatedLayout>
  );
}
