"use client";

import React from "react";
import { motion } from "motion/react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { TaskStatus } from "@/models/Task";
import { cn } from "@/lib/utils";

interface StatusCheckControlProps {
  status: TaskStatus;
  onChange: (nextStatus: TaskStatus) => void;
  disabled?: boolean;
}

export const StatusCheckControl: React.FC<StatusCheckControlProps> = ({
  status,
  onChange,
  disabled = false,
}) => {
  const isDone = status === "done";
  const isInProgress = status === "in-progress";

  const handleQuickToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    // Fast cycling: todo -> in-progress -> done -> todo
    if (status === "todo") onChange("in-progress");
    else if (status === "in-progress") onChange("done");
    else onChange("todo");
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          onClick={handleQuickToggle}
          onContextMenu={(e) => e.preventDefault()}
          disabled={disabled}
          className={cn(
            "w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-200 focus-visible:outline-2 focus-visible:outline-[var(--accent)] shrink-0 cursor-pointer touch-manipulation relative before:absolute before:-inset-3 sm:before:inset-0",
            isDone
              ? "bg-[var(--done-fg)] border-[var(--done-fg)] text-[var(--bg)]"
              : isInProgress
                ? "bg-[var(--prog-bg)] border-[var(--prog-fg)] text-[var(--prog-fg)]"
                : "bg-[var(--surface)] border-[var(--ink-3)]/60 hover:border-[var(--ink)]"
          )}
          aria-label={`Current status: ${status}. Click to change status.`}
        >
          {isDone ? (
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <motion.path
                d="M3 8.5L6.5 12L13 4.5"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
              />
            </svg>
          ) : isInProgress ? (
            <span className="w-2 h-2 rounded-full bg-[var(--prog-fg)]" />
          ) : null}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={6}
          onClick={(e) => e.stopPropagation()}
          className="z-50 min-w-[130px] bg-[var(--surface)] border border-[var(--border)] rounded-xl p-1 shadow-[var(--popover-shadow)] text-xs animate-fadeIn focus:outline-none"
        >
          <DropdownMenu.Item
            onSelect={() => onChange("todo")}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[var(--todo-fg)] hover:bg-[var(--surface-2)] cursor-pointer outline-none transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-[var(--todo-fg)]" />
            <span>To do</span>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onSelect={() => onChange("in-progress")}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[var(--prog-fg)] hover:bg-[var(--surface-2)] cursor-pointer outline-none transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-[var(--prog-fg)]" />
            <span>In progress</span>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onSelect={() => onChange("done")}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[var(--done-fg)] hover:bg-[var(--surface-2)] cursor-pointer outline-none transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-[var(--done-fg)]" />
            <span>Done</span>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
