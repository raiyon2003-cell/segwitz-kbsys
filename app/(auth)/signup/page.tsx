import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Users } from "lucide-react";
import { SignupForm } from "@/components/auth/signup-form";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a Segwitz Knowledge Base account",
};

export default function SignupPage() {
  return (
    <div className="relative flex min-h-screen">
      <div className="brand-panel relative hidden w-[44%] flex-col justify-between overflow-hidden p-10 text-white lg:flex xl:w-[42%]">
        <div className="pointer-events-none absolute inset-0 opacity-60" aria-hidden>
          <div className="absolute -left-20 top-0 size-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 size-80 rounded-full bg-accent/20 blur-3xl" />
        </div>
        <div className="relative z-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/55">
            Segwitz
          </p>
          <h1 className="mt-3 max-w-sm text-3xl font-bold leading-tight">
            Knowledge Base
          </h1>
          <p className="mt-3 max-w-md text-sm text-white/75">
            Request access to the internal document library. Your profile is
            created automatically after sign-up.
          </p>
        </div>
        <ul className="relative z-10 space-y-4">
          <li className="flex gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15">
              <FileText className="size-5" aria-hidden />
            </span>
            <span>
              <p className="text-sm font-semibold">Browse documents</p>
              <p className="text-xs text-white/65">
                Find policies, SOPs, and team resources.
              </p>
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15">
              <Users className="size-5" aria-hidden />
            </span>
            <span>
              <p className="text-sm font-semibold">Admin-assigned roles</p>
              <p className="text-xs text-white/65">
                Permissions are configured by your administrator.
              </p>
            </span>
          </li>
        </ul>
      </div>

      <div className="relative flex flex-1 flex-col">
        <div className="absolute right-4 top-4 z-20">
          <ThemeToggle variant="ghost" />
        </div>

        <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 lg:px-10">
          <div className="mb-8 flex flex-col items-center gap-2 text-center lg:hidden">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-brand">
              KB
            </div>
            <h1 className="text-xl font-semibold tracking-tight">Create your account</h1>
            <p className="text-sm text-muted-foreground">
              Join the internal knowledge base
            </p>
          </div>

          <div className="w-full max-w-md">
            <SignupForm />
          </div>

          <p className="mt-8 text-center text-sm">
            <Link href="/login" className="link-subtle">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
