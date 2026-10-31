"use client";

import React from "react";
import { cn } from "@/lib/utils";

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        "bg-[var(--surface-2)] rounded-lg animate-skeleton",
        className
      )}
      aria-hidden="true"
      {...props}
    />
  );
};
