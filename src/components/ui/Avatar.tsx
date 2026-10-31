"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function getInitials(name: string): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  size = "md",
  className,
}) => {
  const initials = getInitials(name);

  const sizeClasses = {
    sm: "w-7 h-7 text-xs",
    md: "w-8 h-8 text-xs",
    lg: "w-10 h-10 text-sm",
  };

  return (
    <div
      className={cn(
        "rounded-full bg-[var(--surface-2)] text-[var(--ink)] font-semibold flex items-center justify-center select-none border border-[var(--border)] shrink-0",
        sizeClasses[size],
        className
      )}
      aria-label={name}
      title={name}
    >
      <span>{initials}</span>
    </div>
  );
};
