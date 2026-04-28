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

    const supabase = createSupabaseBrowserClient();
    const { data, error: signError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: fullName ? { full_name: fullName, name: fullName } : undefined,
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
          Use your work email. Your role defaults to member until an admin assigns a higher role.
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
              className="rounded-md border border-emerald-500/35 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-900 dark:text-emerald-50"
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
