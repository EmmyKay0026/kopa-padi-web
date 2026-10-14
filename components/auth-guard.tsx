"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { isProtectedRoute } from "@/lib/protected-routes";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const session = authClient.useSession();
  const protectedRoute = isProtectedRoute(pathname);

  useEffect(() => {
    if (!protectedRoute || session.isPending || session.data) return;

    const destination = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    window.location.replace(`/login?next=${encodeURIComponent(destination)}`);
  }, [protectedRoute, session.data, session.isPending]);

  if (protectedRoute && (session.isPending || !session.data)) {
    return (
      <main className="grid min-h-screen place-items-center bg-background" aria-busy="true">
        <span className="sr-only" role="status">
          Checking authentication
        </span>
      </main>
    );
  }

  return children;
}
