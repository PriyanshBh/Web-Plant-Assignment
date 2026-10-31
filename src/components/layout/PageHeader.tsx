"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  count?: number;
  description?: string;
  action?: React.ReactNode;
  breadcrumb?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  count,
  description,
  action,
  breadcrumb,
  className,
}) => {
  return (
    <div className={cn("flex flex-col gap-3 pb-6 border-b border-[var(--border)]", className)}>
      {breadcrumb && (
        <div className="text-xs text-[var(--ink-3)] flex items-center gap-1.5 font-medium">
          {breadcrumb}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--ink)]">
            {title}
          </h1>
          {typeof count === "number" && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-[var(--surface-2)] text-[var(--ink-2)] border border-[var(--border)]">
              {count}
            </span>
          )}
        </div>

        {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
      </div>

      {description && (
        <p className="text-sm text-[var(--ink-2)] max-w-2xl leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
};
