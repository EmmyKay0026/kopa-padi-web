import { AuthGuard } from "@/components/auth-guard";
import { BugReportWidget } from "@/components/bug-report-widget";
import { Toaster } from "@/components/ui/sonner";
import Script from "next/script";
import "./globals.css";
export const metadata = {
  icons: {
    icon: [
      { url: "/Web_App/favicon.svg", type: "image/svg+xml" },
      { url: "/Web_App/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/Web_App/favicon.ico" },
    ],
    apple: [{ url: "/Web_App/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/Web_App/site.webmanifest",
  title: "Kopa-Padi - Travel together. Go further.",
  description:
    "Find compatible travel companions going your way and travel with more confidence.",
};
export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html suppressHydrationWarning lang="en" data-scroll-behavior="smooth">
      <body>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-BCH296S09H"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){window.dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-BCH296S09H');`}
        </Script>
        <AuthGuard>{children}</AuthGuard>
        <BugReportWidget />
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
