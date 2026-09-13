import { AuthGuard } from "@/components/auth/AuthGuard";
import { Navbar } from "./Navbar";

export function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <Navbar />
      {children}
    </AuthGuard>
  );
}
