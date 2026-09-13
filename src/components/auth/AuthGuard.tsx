"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken } from "@/lib/auth";

// Simple client-side gate: if there's no access token, redirect to /login.
// This does not itself handle mid-session expiry — that's handled by
// apiFetch's silent-refresh-on-401 (see lib/api/client.ts) so an expiring
// token doesn't strand the user on a page they were already viewing. This
// guard only covers the "never had a token" / "refresh token also expired"
// case on initial page load.
//
// Fixes a real hydration mismatch that was here before: reading
// getAccessToken() directly during render meant the server (no
// localStorage) and the client's first paint (localStorage already
// available) could produce different output for the same render, which
// React flags as "Hydration failed". The fix is a one-time mount gate —
// `hasMounted` starts false on both server and client's first render
// (matching output, no mismatch), then flips true after mount, at which
// point it's safe to read the real token. This is not the
// derived-state-from-props pattern the set-state-in-effect rule warns
// about — it runs once, with an empty dependency array, specifically to
// defer browser-only reads until after hydration.
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    // Disabling set-state-in-effect here: this is the standard
    // hydration-safe "mount gate" pattern (see comment above the
    // component) — a one-time initialization, not state synced from a
    // prop on every render, which is what the rule is designed to catch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (hasMounted && !getAccessToken()) {
      router.replace("/login");
    }
  }, [hasMounted, router]);

  if (!hasMounted) return null;
  if (!getAccessToken()) return null;

  return <>{children}</>;
}
