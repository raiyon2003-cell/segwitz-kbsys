"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, id, label, hint, error, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label ? (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-foreground"
          >
            {label}
          </label>
        ) : null}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "flex h-10 w-full rounded-lg border border-input/90 bg-background/90 px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground",
            "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive/80 focus-visible:ring-destructive/60",
            className,
          )}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            hint || error
              ? `${inputId}-${error ? "error" : "hint"}`
              : undefined
          }
          {...props}
        />
        {error ? (
          <p id={`${inputId}-error`} className="text-sm text-destructive">
            {error}
          </p>
        ) : hint ? (
          <p id={`${inputId}-hint`} className="text-sm text-muted-foreground">
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";
