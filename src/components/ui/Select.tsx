"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options?: SelectOption[];
  error?: string;
  helperText?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options = [], error, helperText, id, children, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-medium tracking-wide text-[var(--ink-2)]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              "w-full h-10 pl-3 pr-9 py-2 text-base md:text-sm bg-[var(--surface)] text-[var(--ink)] rounded-lg border appearance-none cursor-pointer transition-colors",
              error
                ? "border-[var(--danger)] focus:border-[var(--danger)]"
                : "border-[var(--border)] focus:border-[var(--ink)]",
              "focus:outline-2 focus:outline-[var(--accent)] focus:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
              className
            )}
            aria-invalid={!!error}
            {...props}
          >
            {children ||
              options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-[var(--ink-3)]" />
        </div>
        {error ? (
          <span className="text-xs text-[var(--danger)]">{error}</span>
        ) : helperText ? (
          <span className="text-xs text-[var(--ink-3)]">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

Select.displayName = "Select";
