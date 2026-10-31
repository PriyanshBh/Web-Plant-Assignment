"use client";

import React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/useMediaQuery";

interface ResponsiveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const ResponsiveModal: React.FC<ResponsiveModalProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}) => {
  const isMobile = useIsMobile();

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        {/* Dimmed backdrop */}
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 duration-200 transition-opacity" />

        <DialogPrimitive.Content
          className={cn(
            "fixed z-50 bg-[var(--surface)] border-[var(--border)] focus:outline-none transition-all",
            isMobile
              ? "inset-x-0 bottom-0 rounded-t-2xl border-t p-6 max-h-[85dvh] overflow-y-auto pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] shadow-[0_-4px_24px_rgba(0,0,0,0.12)] duration-300"
              : "left-[50%] top-[50%] w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-xl border p-6 shadow-[var(--popover-shadow)] duration-200",
            className
          )}
        >
          {/* Mobile Drag Indicator Handle */}
          {isMobile && (
            <div className="w-10 h-1 bg-[var(--ink-3)]/30 rounded-full mx-auto mb-4" />
          )}

          <div className="flex items-start justify-between mb-4">
            <div>
              <DialogPrimitive.Title className="text-lg font-semibold tracking-tight text-[var(--ink)]">
                {title}
              </DialogPrimitive.Title>
              {description && (
                <DialogPrimitive.Description className="text-sm text-[var(--ink-2)] mt-1">
                  {description}
                </DialogPrimitive.Description>
              )}
            </div>
            <DialogPrimitive.Close className="rounded-md p-2 -m-1 sm:m-0 text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--accent)] min-w-[44px] min-h-[44px] sm:min-w-[32px] sm:min-h-[32px] flex items-center justify-center cursor-pointer">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </div>

          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
