import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a Segwitz Knowledge Base account",
};

export default function SignupPage() {
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
          <h1 className="text-xl font-semibold tracking-tight">Create your account</h1>
          <p className="text-sm text-foreground-muted">
            Join the internal knowledge base — your profile is created automatically.
          </p>
        </div>

        <SignupForm />

        <p className="mt-8 text-center text-sm">
          <Link
            href="/login"
            className="font-medium text-accent underline-offset-4 hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
