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
