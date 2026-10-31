"use client";

import React from "react";
import { motion } from "motion/react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { ITaskResponse, TaskStatus } from "@/models/Task";
import { StatusCheckControl } from "./StatusCheckControl";
import { DueDateChip } from "./DueDateChip";
import { cn } from "@/lib/utils";

interface TaskRowProps {
  task: ITaskResponse;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onEdit: (task: ITaskResponse) => void;
  onDelete: (taskId: string) => void;
}

export const TaskRow: React.FC<TaskRowProps> = ({
  task,
  onStatusChange,
  onEdit,
  onDelete,
}) => {
  const isDone = task.status === "done";

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group relative flex items-start sm:items-center justify-between gap-3 p-3.5 sm:p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl hover:border-[var(--ink-2)]/40 transition-colors shadow-none",
        isDone ? "bg-[var(--surface)]/60" : "bg-[var(--surface)]"
      )}
    >
      {/* Left Column: Status Check Control & Content */}
      <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
        <div className="pt-0.5 sm:pt-0">
          <StatusCheckControl
            status={task.status}
            onChange={(nextStatus) => onStatusChange(task.id, nextStatus)}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <h3
              className={cn(
                "text-sm font-medium tracking-tight transition-all duration-200 select-text",
                isDone
                  ? "line-through text-[var(--ink-3)] font-normal"
                  : "text-[var(--ink)]"
              )}
            >
              {task.title}
            </h3>
          </div>

          {task.description && (
            <p className="text-xs text-[var(--ink-2)] line-clamp-1 mt-0.5 leading-relaxed">
              {task.description}
            </p>
          )}
        </div>
      </div>

      {/* Right Column: Due Date Chip and Actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0 self-center">
        <DueDateChip dueDate={task.dueDate} isDone={isDone} />

        {/* Task Actions Menu */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              className="p-2 sm:p-1 -m-1 sm:m-0 rounded-md text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--accent)] cursor-pointer min-w-[44px] min-h-[44px] sm:min-w-[32px] sm:min-h-[32px] flex items-center justify-center"
              aria-label={`Options for task ${task.title}`}
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={4}
              className="z-50 min-w-[130px] bg-[var(--surface)] border border-[var(--border)] rounded-xl p-1 shadow-[var(--popover-shadow)] text-xs animate-fadeIn focus:outline-none"
            >
              <DropdownMenu.Item
                onSelect={() => onEdit(task)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[var(--ink)] hover:bg-[var(--surface-2)] cursor-pointer outline-none transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit</span>
              </DropdownMenu.Item>
              <DropdownMenu.Item
                onSelect={() => onDelete(task.id)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[var(--danger)] hover:bg-[var(--danger)]/10 cursor-pointer outline-none transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </motion.div>
  );
};
