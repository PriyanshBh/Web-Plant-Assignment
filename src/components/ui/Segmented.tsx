"use client";

import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export interface SegmentedOption<T extends string = string> {
  value: T;
  label: string;
  count?: number;
}

interface SegmentedProps<T extends string = string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  name?: string;
}

export function Segmented<T extends string = string>({
  options,
  value,
  onChange,
  className,
  name = "segmented-filter",
}: SegmentedProps<T>) {
  return (
    <div
      role="tablist"
      aria-label="Filter selection"
      className={cn(
        "inline-flex p-1 bg-[var(--surface-2)] rounded-lg border border-[var(--border)] overflow-x-auto no-scrollbar max-w-full",
        className
      )}
    >
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap select-none flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-[var(--accent)] shrink-0",
              isActive
                ? "text-[var(--ink)] font-semibold"
                : "text-[var(--ink-2)] hover:text-[var(--ink)]"
            )}
          >
            {isActive && (
              <motion.div
                layoutId={`active-segmented-${name}`}
                className="absolute inset-0 bg-[var(--surface)] rounded-md border border-[var(--border)] shadow-sm"
                transition={{
                  type: "spring",
                  stiffness: 420,
                  damping: 34,
                }}
              />
            )}
            <span className="relative z-10">{option.label}</span>
            {typeof option.count === "number" && (
              <span
                className={cn(
                  "relative z-10 px-1.5 py-0.2 rounded-full text-[10px] font-mono tabular-nums leading-tight",
                  isActive
                    ? "bg-[var(--surface-2)] text-[var(--ink)]"
                    : "bg-[var(--surface)] text-[var(--ink-3)]"
                )}
              >
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
