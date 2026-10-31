"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  todo?: number;
  inProgress?: number;
  done?: number;
  total?: number;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  todo = 0,
  inProgress = 0,
  done = 0,
  total,
  className,
}) => {
  const calculatedTotal = total ?? (todo + inProgress + done);

  if (calculatedTotal === 0) {
    return (
      <div
        className={cn(
          "w-full h-1.5 bg-[var(--surface-2)] rounded-full overflow-hidden",
          className
        )}
        aria-hidden="true"
      />
    );
  }

  const donePct = (done / calculatedTotal) * 100;
  const inProgressPct = (inProgress / calculatedTotal) * 100;
  const todoPct = (todo / calculatedTotal) * 100;

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(donePct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${Math.round(donePct)}% completed`}
      className={cn(
        "w-full h-1.5 bg-[var(--surface-2)] rounded-full overflow-hidden flex",
        className
      )}
    >
      {/* Done segment (Green) */}
      {donePct > 0 && (
        <div
          style={{ width: `${donePct}%` }}
          className="h-full bg-[var(--done-fg)] transition-all duration-300"
          title={`Done: ${done}`}
        />
      )}
      {/* In progress segment (Amber) */}
      {inProgressPct > 0 && (
        <div
          style={{ width: `${inProgressPct}%` }}
          className="h-full bg-[var(--prog-fg)] transition-all duration-300"
          title={`In progress: ${inProgress}`}
        />
      )}
      {/* To do segment (Neutral) */}
      {todoPct > 0 && (
        <div
          style={{ width: `${todoPct}%` }}
          className="h-full bg-[var(--todo-fg)] transition-all duration-300"
          title={`To do: ${todo}`}
        />
      )}
    </div>
  );
};
