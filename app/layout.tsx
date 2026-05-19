import type { Metadata } from "next";
import Script from "next/script";
import { AppProviders } from "@/components/providers/app-providers";
import { resolveMetadataBaseUrl } from "@/lib/metadata/metadata-base";
import { cn } from "@/lib/utils";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Segwitz Knowledge Base",
    template: "%s · Segwitz KB",
  },
  description: "Internal knowledge base and document management",
  metadataBase: resolveMetadataBaseUrl(),
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

const themeInitScript = `
(function () {
  try {
    var k = 'segwitz-kb-theme';
    var t = localStorage.getItem(k);
    var d = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = t === 'dark' || t === 'light' ? t : (d ? 'dark' : 'light');
    document.documentElement.classList.add(theme);
  } catch (e) {
    document.documentElement.classList.add('light');
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        {/* Pre-built Tailwind bundle — ensures styles load even if Next dev CSS chunk is missing */}
        {/* eslint-disable-next-line @next/next/no-css-tags */}
        <link rel="stylesheet" href="/kb-styles.css" />
      </head>
      <body
        className={cn(
          "min-h-full bg-background text-foreground antialiased",
        )}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
