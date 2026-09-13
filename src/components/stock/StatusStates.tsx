import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export function GridLoadingState() {
  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      role="status"
      aria-label="Loading stock items"
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-64 w-full rounded-lg" />
      ))}
    </div>
  );
}

export function EmptyState({
  title = "No items found",
  description = "Try a different search or clear your filters.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-12 text-center"
    >
      <p className="font-medium">{title}</p>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}

export function ErrorState({
  message = "Something went wrong loading this data.",
  onRetry,
}: {
  message?: string;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="border-destructive/30 bg-destructive/5 flex flex-col items-center justify-center gap-3 rounded-lg border p-12 text-center"
    >
      <p className="font-medium">{message}</p>
      <Button onClick={onRetry} variant="outline">
        Try again
      </Button>
    </div>
  );
}
