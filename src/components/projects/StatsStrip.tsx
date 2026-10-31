"use client";

import React, { useEffect, useState } from "react";
import { FolderKanban, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsStripProps {
  totalProjects: number;
  openTasks: number;
  overdueTasks: number;
  doneTasks: number;
  className?: string;
}

function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    // Respect reduced motion: immediately show value without animation
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplayValue(value);
      return;
    }

    const duration = 600; // ms
    const startTime = performance.now();

    const update = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      const current = Math.floor(eased * value);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        setDisplayValue(value);
      }
    };

    requestAnimationFrame(update);
  }, [value]);

  return <span className="font-mono tabular-nums">{displayValue}</span>;
}

export const StatsStrip: React.FC<StatsStripProps> = ({
  totalProjects,
  openTasks,
  overdueTasks,
  doneTasks,
  className,
}) => {
  const stats = [
    {
      label: "Total Projects",
      value: totalProjects,
      icon: <FolderKanban className="w-4 h-4 text-[var(--ink-2)]" />,
    },
    {
      label: "Open Tasks",
      value: openTasks,
      icon: <Clock className="w-4 h-4 text-[var(--prog-fg)]" />,
    },
    {
      label: "Overdue Tasks",
      value: overdueTasks,
      icon: <AlertTriangle className="w-4 h-4 text-[var(--danger)]" />,
      danger: overdueTasks > 0,
    },
    {
      label: "Completed",
      value: doneTasks,
      icon: <CheckCircle2 className="w-4 h-4 text-[var(--done-fg)]" />,
    },
  ];

  return (
    <div
      className={cn(
        "grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 my-6",
        className
      )}
    >
      {stats.map((s, idx) => (
        <div
          key={idx}
          className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl flex items-center justify-between"
        >
          <div className="space-y-1">
            <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--ink-3)]">
              {s.label}
            </p>
            <p
              className={cn(
                "text-2xl font-semibold tracking-tight",
                s.danger ? "text-[var(--danger)]" : "text-[var(--ink)]"
              )}
            >
              <AnimatedNumber value={s.value} />
            </p>
          </div>
          <div className="p-2 rounded-lg bg-[var(--surface-2)] shrink-0">
            {s.icon}
          </div>
        </div>
      ))}
    </div>
  );
};
