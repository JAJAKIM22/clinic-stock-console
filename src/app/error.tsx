"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

// This catches unexpected render-time exceptions (a bug, not a failed
// fetch) anywhere in this route segment and below. The per-screen loading/
// empty/error states in components/stock/StatusStates.tsx handle expected
// data-fetch failures (e.g. testing against /http/500) — this is the
// backstop for anything those don't cover, so the app never shows a blank
// white screen.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="text-muted-foreground max-w-sm text-sm">
        An unexpected error occurred while loading this page.
      </p>
      <Button onClick={reset}>Try again</Button>
    </main>
  );
}
