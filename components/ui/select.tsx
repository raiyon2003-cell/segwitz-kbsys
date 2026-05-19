"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
};

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, id, label, error, children, ...props }, ref) => {
    const generatedId = React.useId();
    const sid = id ?? generatedId;

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label ? (
          <label htmlFor={sid} className="text-sm font-medium text-foreground">
            {label}
          </label>
        ) : null}
        <select
          id={sid}
          ref={ref}
          className={cn(
            "select-native",
            error && "border-destructive/80 focus-visible:ring-destructive/60",
            className,
          )}
          aria-invalid={error ? true : undefined}
          {...props}
        >
          {children}
        </select>
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : null}
      </div>
    );
  },
);

Select.displayName = "Select";
