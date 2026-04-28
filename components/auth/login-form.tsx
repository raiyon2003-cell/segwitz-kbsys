"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const nextPathRaw = searchParams.get("next");
  /** Never send users back to /login after a successful sign-in (avoids odd redirects). */
  const safeNext = ((): string => {
    const raw = nextPathRaw?.trim();
    if (
      !raw ||
      !raw.startsWith("/") ||
      raw.startsWith("//") ||
      raw.startsWith("/login")
    ) {
      return "/";
    }
    return raw;
  })();

  const oauthError = searchParams.get("error");

  useEffect(() => {
    if (oauthError) setError(oauthError);
  }, [oauthError]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const form = event.currentTarget;
    const fd = new FormData(form);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");

    const supabase = createSupabaseBrowserClient();
    const { error: signError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setPending(false);

    if (signError) {
      setError(signError.message);
      return;
    }

    // Full navigation so the SSR stack (middleware + server) sees auth cookies reliably,
    // and we stay on the same origin/port as this tab (fixes 404 when another process
    // is bound to a different localhost port).
    router.refresh();
    window.location.assign(safeNext);
  }

  return (
    <Card className="border-border-subtle shadow-[0_8px_40px_-12px_rgb(15_23_42/12%)]">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>
          Sign in with your work email and password.
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
            autoComplete="current-password"
            required
            disabled={pending}
          />
          <Button type="submit" className="w-full" size="lg" disabled={pending}>
            {pending ? "Signing in…" : "Continue"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center border-0 pt-0">
        <p className="text-center text-xs text-foreground-muted">
          Internal use only. Roles are assigned by an administrator.
        </p>
      </CardFooter>
    </Card>
  );
}
