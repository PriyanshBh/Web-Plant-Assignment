"use client";

import React from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { IProjectResponse } from "@/models/Project";
import { ProgressBar } from "@/components/ui/ProgressBar";

interface ProjectCardProps {
  project: IProjectResponse;
  onEdit: (project: IProjectResponse) => void;
  onDelete: (project: IProjectResponse) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onEdit,
  onDelete,
}) => {
  const counts = project.taskCounts || {
    total: 0,
    todo: 0,
    inProgress: 0,
    done: 0,
  };

  const formattedUpdated = project.updatedAt
    ? formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })
    : "recently";

  return (
    <div className="relative group bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 hover:border-[var(--ink-2)]/40 hover:-translate-y-[1px] transition-all duration-200 shadow-none flex flex-col justify-between">
      {/* Top Header & Kebab Menu */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <Link
          href={`/projects/${project.id}`}
          className="flex-1 focus-visible:outline-2 focus-visible:outline-[var(--accent)] rounded-sm"
        >
          <h2 className="text-base font-semibold text-[var(--ink)] tracking-tight line-clamp-1 group-hover:text-[var(--accent)] transition-colors">
            {project.title}
          </h2>
        </Link>

        {/* Kebab Actions Dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className="p-1 rounded-md text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--accent)] cursor-pointer shrink-0"
              aria-label={`Actions for project ${project.title}`}
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={4}
              onClick={(e) => e.stopPropagation()}
              className="z-50 min-w-[140px] bg-[var(--surface)] border border-[var(--border)] rounded-xl p-1 shadow-[var(--popover-shadow)] text-xs animate-fadeIn focus:outline-none"
            >
              <DropdownMenu.Item
                onSelect={() => onEdit(project)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[var(--ink)] hover:bg-[var(--surface-2)] cursor-pointer outline-none transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit</span>
              </DropdownMenu.Item>
              <DropdownMenu.Item
                onSelect={() => onDelete(project)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[var(--danger)] hover:bg-[var(--danger)]/10 cursor-pointer outline-none transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      {/* Description */}
      <Link
        href={`/projects/${project.id}`}
        className="flex-1 block focus-visible:outline-none"
        tabIndex={-1}
      >
        <p className="text-xs text-[var(--ink-2)] line-clamp-2 leading-relaxed mb-6 min-h-[32px]">
          {project.description || "No description provided."}
        </p>

        {/* Progress Summary and Bar */}
        <div className="space-y-2 mt-auto">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-[var(--ink-2)] tabular-nums font-medium">
              {counts.done} of {counts.total} done
            </span>
            <span className="text-[11px] text-[var(--ink-3)] font-mono">
              Updated {formattedUpdated}
            </span>
          </div>

          <ProgressBar
            todo={counts.todo}
            inProgress={counts.inProgress}
            done={counts.done}
            total={counts.total}
          />
        </div>
      </Link>
    </div>
  );
};
