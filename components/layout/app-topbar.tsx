"use client";

import { memo } from "react";
import { Menu, Search } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { getInitials } from "@/lib/display";
import type { Profile } from "@/types";
import { cn } from "@/lib/utils";

function AppTopbarComponent({
  profile,
  email,
  onMenuClick,
}: {
  profile: Profile;
  email: string | null;
  onMenuClick?: () => void;
}) {
  const initials = getInitials(email ?? profile.email, profile.full_name);
  const display =
    profile.full_name?.trim() ||
    email ||
    profile.email ||
    "Signed in";

  return (
    <header className="glass-header flex h-14 shrink-0 items-center gap-3 px-4 md:gap-4 md:px-6 lg:px-8">
      <button
        type="button"
        onClick={onMenuClick}
        className="inline-flex size-9 items-center justify-center rounded-lg border border-border/60 bg-card text-foreground shadow-sm hover:bg-muted lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="size-[18px]" />
      </button>

      <div className="hidden min-w-0 flex-col sm:flex">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Workspace
        </span>
        <span className="truncate text-sm font-semibold text-foreground">
          Knowledge Base
        </span>
      </div>

      <div className="relative mx-auto hidden w-full max-w-xl flex-1 items-center md:flex">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <label htmlFor="global-search" className="sr-only">
          Search
        </label>
        <input
          id="global-search"
          type="search"
          placeholder="Search documents, divisions…"
          className="h-10 w-full rounded-lg border border-input/90 bg-background/90 pl-10 pr-4 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          autoComplete="off"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <div className="hidden flex-col items-end gap-0.5 text-right sm:flex">
          <span className="max-w-[140px] truncate text-xs font-medium text-foreground">
            {display}
          </span>
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
            {profile.role}
          </span>
        </div>
        <button
          type="button"
          className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border/60 bg-gradient-to-br from-primary/25 to-accent/20 text-xs font-semibold text-foreground ring-1 ring-border/40"
          aria-label={`Account — ${display}`}
        >
          {initials}
        </button>
      </div>
    </header>
  );
}

export const AppTopbar = memo(AppTopbarComponent);
