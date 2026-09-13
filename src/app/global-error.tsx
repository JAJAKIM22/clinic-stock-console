"use client";

import { useEffect } from "react";
import "./globals.css";

// Only fires if the root layout itself throws (rare — e.g. the Providers
// wrapper breaking). Has to render its own <html>/<body> since it
// replaces the root layout entirely while active.
export default function GlobalError({
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
    <html lang="en">
      <body>
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
          <h1 className="text-xl font-semibold">Something went wrong</h1>
          <p className="text-sm text-gray-500">
            The application failed to load. Please try again.
          </p>
          <button
            onClick={reset}
            className="rounded-md bg-black px-4 py-2 text-sm text-white"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
