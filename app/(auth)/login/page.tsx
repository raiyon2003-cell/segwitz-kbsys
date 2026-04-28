import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Segwitz Knowledge Base",
};

function LoginFallback() {
  return (
    <div className="h-[340px] animate-pulse rounded-lg border border-border-subtle bg-surface-muted/40" />
  );
}

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12">
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        aria-hidden
      >
        <div className="absolute -left-[20%] top-0 h-[420px] w-[420px] rounded-full bg-accent/15 blur-3xl" />
        <div className="absolute -right-[10%] bottom-0 h-[380px] w-[380px] rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-surface-muted/60 via-transparent to-surface" />
      </div>

      <div className="relative z-10 w-full max-w-[420px]">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="flex size-11 items-center justify-center rounded-xl bg-accent text-sm font-bold text-accent-foreground shadow-sm">
            KB
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-foreground-muted">
            Sign in to continue to Segwitz Knowledge Base.
          </p>
        </div>

        <Suspense fallback={<LoginFallback />}>
          <LoginForm />
        </Suspense>

        <p className="mt-8 text-center text-sm text-foreground-muted">
          Need access?{" "}
          <span className="text-foreground-muted">
            Ask an admin to invite you or assign your role.
          </span>
        </p>
        <p className="mt-2 text-center text-sm">
          <Link
            href="/"
            className="font-medium text-accent underline-offset-4 hover:underline"
          >
            Open app home
          </Link>{" "}
          <span className="text-foreground-muted">
            (requires sign-in — you’ll be redirected if needed)
          </span>
        </p>
      </div>
    </div>
  );
}
