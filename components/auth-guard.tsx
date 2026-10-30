"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { isActiveAdminSession, isAdminRoute, isProtectedRoute, routeAuthRedirect } from "@/lib/protected-routes";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const session = authClient.useSession();
  const protectedRoute = isProtectedRoute(pathname);
  const deniedAdmin = isAdminRoute(pathname) && !isActiveAdminSession(session.data);

  useEffect(() => {
    if (!protectedRoute || session.isPending) return;

    const destination = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    const redirect = routeAuthRedirect(pathname, destination, session.data);
    if (redirect) window.location.replace(redirect);
  }, [pathname, protectedRoute, session.data, session.isPending]);

  if (protectedRoute && (session.isPending || !session.data || deniedAdmin)) {
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
