import type { Metadata } from "next";
import { ADMIN_ROBOTS } from "@/lib/admin-indexing";

export const metadata: Metadata = { robots: ADMIN_ROBOTS };
export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
