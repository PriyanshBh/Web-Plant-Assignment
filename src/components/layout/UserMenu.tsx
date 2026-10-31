"use client";

import React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { LogOut } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";

interface UserMenuProps {
  user?: {
    name: string;
    email: string;
  } | null;
  onLogout: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ user, onLogout }) => {
  if (!user) return null;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="flex items-center gap-2 p-1 rounded-full focus-visible:outline-2 focus-visible:outline-[var(--accent)] cursor-pointer"
          aria-label="User account menu"
        >
          <Avatar name={user.name} size="md" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-[200px] bg-[var(--surface)] border border-[var(--border)] rounded-xl p-1.5 shadow-[var(--popover-shadow)] text-xs animate-fadeIn focus:outline-none"
        >
          <div className="px-3 py-2 border-b border-[var(--border)] mb-1">
            <p className="font-semibold text-sm text-[var(--ink)] truncate">
              {user.name}
            </p>
            <p className="text-[var(--ink-3)] text-xs truncate mt-0.5 font-mono">
              {user.email}
            </p>
          </div>

          <DropdownMenu.Item
            onSelect={onLogout}
            className="flex items-center gap-2 px-3 py-2 text-[var(--danger)] hover:bg-[var(--danger)]/10 rounded-lg cursor-pointer outline-none transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log out</span>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
