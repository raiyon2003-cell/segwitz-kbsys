"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, id, label, hint, error, ...props }, ref) => {
    const generatedId = React.useId();
    const taId = id ?? generatedId;

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label ? (
          <label htmlFor={taId} className="text-sm font-medium text-foreground">
            {label}
          </label>
        ) : null}
        <textarea
          id={taId}
          ref={ref}
          rows={4}
          className={cn(
            "flex min-h-[100px] w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-foreground-faint",
            "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50 dark:focus-visible:ring-offset-slate-950",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500/80 focus-visible:ring-red-500/60",
            className,
          )}
          aria-invalid={error ? true : undefined}
          {...props}
        />
        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : hint ? (
          <p className="text-sm text-foreground-muted">{hint}</p>
        ) : null}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";
