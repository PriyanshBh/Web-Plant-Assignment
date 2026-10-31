"use client";

import React from "react";
import { Calendar, AlertCircle } from "lucide-react";
import { cn, getRelativeDueLabel } from "@/lib/utils";

interface DueDateChipProps {
  dueDate: string | null | undefined;
  isDone?: boolean;
  className?: string;
}

export const DueDateChip: React.FC<DueDateChipProps> = ({
  dueDate,
  isDone = false,
  className,
}) => {
  if (!dueDate) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 text-xs text-[var(--ink-3)] font-mono tabular-nums select-none",
          className
        )}
      >
        <Calendar className="w-3.5 h-3.5" />
        <span>No due date</span>
      </span>
    );
  }

  const { label, isOverdue } = getRelativeDueLabel(dueDate);
  const showOverdue = isOverdue && !isDone;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-mono tabular-nums px-2 py-0.5 rounded-md border select-none transition-colors",
        showOverdue
          ? "bg-[var(--danger)]/10 text-[var(--danger)] border-[var(--danger)]/30 font-medium"
          : isDone
            ? "bg-[var(--surface-2)] text-[var(--ink-3)] border-[var(--border)] line-through"
            : "bg-[var(--surface)] text-[var(--ink-2)] border-[var(--border)]",
        className
      )}
    >
      {showOverdue ? (
        <AlertCircle className="w-3.5 h-3.5 text-[var(--danger)] shrink-0" />
      ) : (
        <Calendar className="w-3.5 h-3.5 text-[var(--ink-3)] shrink-0" />
      )}
      <span>{label}</span>
    </span>
  );
};
