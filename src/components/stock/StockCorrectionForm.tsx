"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateStock } from "@/hooks/useProducts";

export function StockCorrectionForm({
  productId,
  currentStock,
}: {
  productId: string;
  currentStock: number;
}) {
  const [value, setValue] = useState(String(currentStock));
  const mutation = useUpdateStock(productId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) return;
    mutation.mutate(parsed);
  };

  return (
    <form onSubmit={handleSubmit} className="flex max-w-xs flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="stock-count">Corrected stock count</Label>
        <Input
          id="stock-count"
          type="number"
          min={0}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>

      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Saving..." : "Save correction"}
      </Button>

      <div aria-live="polite" className="text-sm">
        {mutation.isError && (
          <p className="text-destructive">
            Failed to save. Check your connection and try again.
          </p>
        )}
        {mutation.isSuccess && (
          <p className="text-muted-foreground">Stock count updated.</p>
        )}
      </div>
    </form>
  );
}
