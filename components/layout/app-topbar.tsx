import { Bell, Search } from "lucide-react";
import { getInitials } from "@/lib/display";
import type { Profile } from "@/types";

export function AppTopbar({
  profile,
  email,
}: {
  profile: Profile;
  email: string | null;
}) {
  const initials = getInitials(email ?? profile.email, profile.full_name);
  const display =
    profile.full_name?.trim() ||
    email ||
    profile.email ||
    "Signed in";

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-4 border-b border-border-subtle bg-surface/90 px-4 backdrop-blur md:px-6 lg:px-8">
      <div className="relative mx-auto flex w-full max-w-4xl flex-1 items-center">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-faint"
          aria-hidden
        />
        <label htmlFor="global-search" className="sr-only">
          Search
        </label>
        <input
          id="global-search"
          type="search"
          placeholder="Search documents, divisions…"
          className="h-10 w-full rounded-md border border-border bg-surface-muted/60 pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50 dark:focus-visible:ring-offset-slate-950"
          autoComplete="off"
        />
      </div>
      <button
        type="button"
        className="relative inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-border-subtle bg-surface-muted/60 text-foreground-muted transition-colors hover:bg-surface-muted hover:text-foreground"
        aria-label="Notifications"
      >
        <Bell className="size-[18px]" />
        <span className="absolute right-2 top-2 size-2 rounded-full bg-accent" />
      </button>
      <div className="flex flex-col items-end gap-0.5">
        <span className="hidden max-w-[140px] truncate text-xs font-medium text-foreground sm:inline">
          {display}
        </span>
        <span className="hidden text-[10px] uppercase tracking-wide text-foreground-muted sm:inline">
          {profile.role}
        </span>
      </div>
      <button
        type="button"
        className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border-subtle bg-gradient-to-br from-accent/20 to-accent/5 text-xs font-semibold text-foreground ring-1 ring-border-subtle"
        aria-label={`Account — ${display}`}
      >
        {initials}
      </button>
    </header>
  );
}
