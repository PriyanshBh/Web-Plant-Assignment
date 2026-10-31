"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium tracking-wide text-[var(--ink-2)]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            id={inputId}
            ref={ref}
            className={cn(
              "w-full h-10 px-3 py-2 text-base md:text-sm bg-[var(--surface)] text-[var(--ink)] placeholder:text-[var(--ink-3)] rounded-lg border transition-colors",
              error
                ? "border-[var(--danger)] focus:border-[var(--danger)]"
                : "border-[var(--border)] focus:border-[var(--ink)]",
              "focus:outline-2 focus:outline-[var(--accent)] focus:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
              className
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
        </div>
        {error ? (
          <span
            id={`${inputId}-error`}
            className="text-xs text-[var(--danger)] transition-all animate-fadeIn"
          >
            {error}
          </span>
        ) : helperText ? (
          <span className="text-xs text-[var(--ink-3)]">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
