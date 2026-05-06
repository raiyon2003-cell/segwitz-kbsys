"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
} from "@/components/ui";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function SignupForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setInfo(null);
    setPending(true);

    const form = event.currentTarget;
    const fd = new FormData(form);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    const fullName = String(fd.get("full_name") ?? "").trim();
    const requestedDeptLabel = String(
      fd.get("requested_department_label") ?? "",
    ).trim();

    const supabase = createSupabaseBrowserClient();
    const metaData: Record<string, string> = {};
    if (fullName) {
      metaData.full_name = fullName;
      metaData.name = fullName;
    }
    if (requestedDeptLabel) {
      metaData.requested_department_label = requestedDeptLabel;
    }

    const { data, error: signError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: Object.keys(metaData).length > 0 ? metaData : undefined,
      },
    });

    setPending(false);

    if (signError) {
      setError(signError.message);
      return;
    }

    if (data.session) {
      router.refresh();
      router.replace("/");
      return;
    }

    setInfo(
      "Check your email to confirm your account, then sign in. If confirmation is disabled in Supabase, you can sign in now.",
    );
  }

  return (
    <Card className="border-border-subtle shadow-[0_8px_40px_-12px_rgb(15_23_42/12%)]">
      <CardHeader>
        <CardTitle>Create account</CardTitle>
        <CardDescription>
          Use your work email. Your account defaults to the member role until an admin assigns a
          scoped role (manager, employee, viewer). Optional onboarding hints are stored on your
          auth profile for admins only — they do not grant access by themselves.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error ? (
            <p
              className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300"
              role="alert"
            >
              {error}
            </p>
          ) : null}
          {info ? (
            <p
              className="rounded-md border border-brand-lime/35 bg-brand-lime/10 px-3 py-2 text-sm text-brand-charcoal"
              role="status"
            >
              {info}
            </p>
          ) : null}
          <Input
            name="full_name"
            type="text"
            label="Full name"
            placeholder="Ada Lovelace"
            autoComplete="name"
            disabled={pending}
          />
          <Input
            name="email"
            type="email"
            label="Work email"
            placeholder="you@company.com"
            autoComplete="email"
            required
            disabled={pending}
          />
          <Input
            name="password"
            type="password"
            label="Password"
            placeholder="••••••••"
            autoComplete="new-password"
            minLength={8}
            required
            disabled={pending}
          />
          <Input
            name="requested_department_label"
            type="text"
            label="Department / team (optional)"
            placeholder="e.g. Clinical Ops — used as an onboarding hint only"
            autoComplete="organization-title"
            disabled={pending}
          />
          <Button type="submit" className="w-full" size="lg" disabled={pending}>
            {pending ? "Creating account…" : "Sign up"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-3 border-0 pt-0">
        <p className="text-center text-sm text-foreground-muted">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-accent underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
        <p className="text-center text-xs text-foreground-muted">
          Internal directory sign-up — contact an administrator for role changes.
        </p>
      </CardFooter>
    </Card>
  );
}
