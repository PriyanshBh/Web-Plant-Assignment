import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format date nicely for human reading (e.g., "Nov 3, 2026")
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "No due date";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Invalid date";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Check if a date is strictly in the past (overdue)
 */
export function isOverdue(date: string | Date | null | undefined): boolean {
  if (!date) return false;
  const target = new Date(date);
  if (isNaN(target.getTime())) return false;
  
  // Set to end of day
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  
  return target.getTime() < today.getTime();
}

/**
 * Calculate relative days label (e.g. "Due today", "Overdue by 2d", "Due in 3d")
 */
export function getRelativeDueLabel(date: string | Date | null | undefined): {
  label: string;
  isOverdue: boolean;
} {
  if (!date) return { label: "No due date", isOverdue: false };
  const target = new Date(date);
  if (isNaN(target.getTime())) return { label: "Invalid date", isOverdue: false };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDay = new Date(target);
  targetDay.setHours(0, 0, 0, 0);

  const diffMs = targetDay.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const days = Math.abs(diffDays);
    return {
      label: days === 1 ? "Overdue by 1 day" : `Overdue by ${days} days`,
      isOverdue: true,
    };
  }

  if (diffDays === 0) {
    return { label: "Due today", isOverdue: false };
  }

  if (diffDays === 1) {
    return { label: "Due tomorrow", isOverdue: false };
  }

  return { label: `Due in ${diffDays} days`, isOverdue: false };
}
