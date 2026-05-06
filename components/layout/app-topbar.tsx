import { memo } from "react";
import { Bell, Search } from "lucide-react";
import { getInitials } from "@/lib/display";
import type { Profile } from "@/types";

function AppTopbarComponent({
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
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-4 border-b border-border-subtle bg-surface/95 px-4 shadow-sm backdrop-blur md:px-6 lg:px-8">
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
          className="h-10 w-full rounded-md border border-border bg-surface-muted/70 pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-faint shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          autoComplete="off"
        />
      </div>
      <button
        type="button"
        className="relative inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-border-subtle bg-surface-muted/60 text-foreground-muted hover:bg-surface-muted hover:text-foreground"
        aria-label="Notifications"
      >
        <Bell className="size-[18px]" />
        <span className="absolute right-2 top-2 size-2 rounded-full bg-accent" />
      </button>
      <div className="hidden flex-col items-end gap-0.5 text-right sm:flex">
        <span className="max-w-[140px] truncate text-xs font-medium text-foreground sm:inline">
          {display}
        </span>
        <span className="text-[10px] uppercase tracking-wide text-foreground-muted sm:inline">
          {profile.role}
        </span>
      </div>
      <button
        type="button"
        className="flex size-10 shrink-0 items-center justify-center rounded-full border border-brand-olive/50 bg-gradient-to-br from-brand-steel/30 to-brand-lime/20 text-xs font-semibold text-foreground ring-1 ring-border-subtle"
        aria-label={`Account — ${display}`}
      >
        {initials}
      </button>
    </header>
  );
}

export const AppTopbar = memo(AppTopbarComponent);
