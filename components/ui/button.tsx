"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
};

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 motion-safe:active:scale-[0.98]",
  secondary:
    "bg-muted text-foreground hover:bg-muted/80 motion-safe:active:scale-[0.98]",
  outline:
    "border border-border bg-background text-foreground hover:bg-muted motion-safe:active:scale-[0.98]",
  ghost:
    "text-muted-foreground hover:bg-muted hover:text-foreground motion-safe:active:scale-[0.98]",
  destructive:
    "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 motion-safe:active:scale-[0.98]",
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-9 px-3 text-sm rounded-lg gap-1.5",
  md: "h-10 px-4 text-sm rounded-lg gap-2",
  lg: "h-11 px-5 text-base rounded-lg gap-2",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      type = "button",
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center justify-center font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
