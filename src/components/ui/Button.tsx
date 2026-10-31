"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "accent" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none cursor-pointer";

    const variantStyles = {
      primary:
        "bg-[var(--ink)] text-[var(--bg)] hover:opacity-90 dark:bg-[var(--ink)] dark:text-[var(--bg)] border border-transparent shadow-none",
      accent:
        "bg-[var(--accent)] text-[var(--accent-ink)] hover:opacity-90 border border-transparent shadow-none",
      secondary:
        "bg-[var(--surface)] text-[var(--ink)] border border-[var(--border)] hover:bg-[var(--surface-2)]",
      ghost:
        "bg-transparent text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]",
      destructive:
        "bg-transparent text-[var(--danger)] border border-[var(--danger)]/30 hover:bg-[var(--danger)]/10 hover:border-[var(--danger)]",
    };

    const sizeStyles = {
      sm: "h-8 px-3 text-xs gap-1.5 min-w-[32px]",
      md: "h-10 px-4 text-sm gap-2 min-h-[40px]",
      lg: "h-12 px-6 text-base gap-2.5 min-h-[44px]",
      icon: "h-10 w-10 p-0 text-sm min-h-[40px] min-w-[40px]",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span className="sr-only">Loading</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
