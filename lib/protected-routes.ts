export const PROTECTED_ROUTE_PREFIXES = [
  "/app",
  "/profile",
  "/travel-plans",
  "/matching",
  "/circle",
  "/journey",
  "/safety",
  "/verification",
  "/locations",
  "/map",
  "/admin",
] as const;

export function isProtectedRoute(pathname: string) {
  return PROTECTED_ROUTE_PREFIXES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function isAdminRoute(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export function isActiveAdminSession(session: unknown) {
  if (!session || typeof session !== "object" || !("user" in session)) return false;
  const user = session.user;
  return Boolean(user && typeof user === "object"
    && "role" in user && user.role === "ADMIN"
    && "accountStatus" in user && user.accountStatus === "ACTIVE");
}

export function routeAuthRedirect(pathname: string, destination: string, session: unknown) {
  if (!isProtectedRoute(pathname)) return null;
  if (!session) return `/login?next=${encodeURIComponent(destination)}`;
  if (isAdminRoute(pathname) && !isActiveAdminSession(session)) return "/app";
  return null;
}

const adminAccessErrors = new Set([
  "Admin permission required",
  "Moderator permission required",
  "Required moderator capability is not granted",
  "Account is not permitted to access this resource",
]);

export function apiAuthRedirect(status: number, message: unknown, pathname: string, destination: string) {
  if (status === 401 && isProtectedRoute(pathname)) return routeAuthRedirect(pathname, destination, null);
  if (status === 403 && isAdminRoute(pathname) && typeof message === "string" && adminAccessErrors.has(message)) return "/app";
  return null;
}
