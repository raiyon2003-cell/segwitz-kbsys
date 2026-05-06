import type { Metadata } from "next";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/*
          Fallback: same Tailwind build as app/globals.css, served from /public.
          If Next’s chunked CSS fails to load (cache, proxy, adblock), the UI
          still renders with design tokens and utilities.
        */}
        {/* eslint-disable-next-line @next/next/no-css-tags -- static /public bundle; not a duplicate app import */}
        <link rel="stylesheet" href="/kb-styles.css" />
      </head>
      <body
        className={cn(
          "min-h-full bg-surface text-foreground antialiased",
        )}
      >
        {children}
      </body>
    </html>
  );
}
