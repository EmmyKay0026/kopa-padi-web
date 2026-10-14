import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthGuard } from "@/components/auth-guard";
export const metadata = {
  title: "Kopa-Padi - Travel together. Go further.",
  description:
    "Find compatible travel companions going your way and travel with more confidence.",
};
export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html suppressHydrationWarning lang="en">
      <body>
        <AuthGuard>{children}</AuthGuard>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}

