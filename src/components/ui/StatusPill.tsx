"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { TaskStatus } from "@/models/Task";

interface StatusPillProps {
  status: TaskStatus;
  className?: string;
  size?: "sm" | "md";
}

const statusConfig: Record<
  TaskStatus,
  { label: string; fg: string; bg: string; dot: string }
> = {
  todo: {
    label: "To do",
    fg: "text-[var(--todo-fg)]",
    bg: "bg-[var(--todo-bg)]",
    dot: "bg-[var(--todo-fg)]",
  },
  "in-progress": {
    label: "In progress",
    fg: "text-[var(--prog-fg)]",
    bg: "bg-[var(--prog-bg)]",
    dot: "bg-[var(--prog-fg)]",
  },
  done: {
    label: "Done",
    fg: "text-[var(--done-fg)]",
    bg: "bg-[var(--done-bg)]",
    dot: "bg-[var(--done-fg)]",
  },
};

export const StatusPill: React.FC<StatusPillProps> = ({
  status,
  className,
  size = "md",
}) => {
  const config = statusConfig[status] || statusConfig.todo;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium transition-colors select-none",
        config.bg,
        config.fg,
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        className
      )}
    >
      <span className={cn("rounded-full shrink-0", config.dot, size === "sm" ? "w-1.5 h-1.5" : "w-1.5 h-1.5")} />
      <span>{config.label}</span>
    </span>
  );
};
