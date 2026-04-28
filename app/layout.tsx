import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Segwitz Knowledge Base",
    template: "%s · Segwitz KB",
  },
  description: "Internal knowledge base and document management",
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
      <body
        className={cn(
          inter.className,
          "min-h-full bg-gray-50 text-gray-900 antialiased dark:bg-slate-950 dark:text-slate-100",
        )}
      >
        {children}
      </body>
    </html>
  );
}
