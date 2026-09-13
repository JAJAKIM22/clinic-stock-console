"use client";

import { useRouter } from "next/navigation";
import { UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useCurrentUser } from "@/hooks/useProducts";
import { clearTokens } from "@/lib/auth";

export function Navbar() {
  const router = useRouter();
  const { data: user, isLoading, isError } = useCurrentUser();

  const handleSignOut = () => {
    clearTokens();
    router.replace("/login");
  };

  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <span className="font-semibold">Clinic Stock Console</span>

        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              aria-label="Open profile"
              className="rounded-full p-2"
            >
              <UserRound className="size-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Signed in</DialogTitle>
              <DialogDescription>
                Your account details for this session.
              </DialogDescription>
            </DialogHeader>

            {isLoading && (
              <p className="text-muted-foreground text-sm">Loading...</p>
            )}

            {isError && (
              <p className="text-destructive text-sm">
                Couldn&apos;t load your profile. Try signing in again.
              </p>
            )}

            {user && (
              <dl className="space-y-3 text-sm">
                <div className="grid grid-cols-[80px_minmax(0,1fr)] gap-4">
                  <dt className="text-muted-foreground">Username</dt>
                  <dd className="min-w-0 break-words">{user.username}</dd>
                </div>

                <div className="grid grid-cols-[80px_minmax(0,1fr)] gap-4">
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="min-w-0 break-all">{user.email}</dd>
                </div>
              </dl>
            )}

            <Button variant="outline" onClick={handleSignOut}>
              Sign out
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}
