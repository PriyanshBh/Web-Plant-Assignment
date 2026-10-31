"use client";

import React from "react";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";

interface TopBarProps {
  user?: {
    name: string;
    email: string;
  } | null;
  onLogout?: () => void;
  showAuthNav?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  user,
  onLogout,
  showAuthNav = false,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[var(--surface)]/95 backdrop-blur-none border-b border-[var(--border)] pt-[env(safe-area-inset-top,0px)]">
      <div className="max-w-[1120px] mx-auto h-14 px-4 sm:px-6 flex items-center justify-between">
        {/* Wordmark logo */}
        <Link
          href={user ? "/dashboard" : "/"}
          className="flex items-center gap-2 font-semibold text-base tracking-tight text-[var(--ink)] hover:opacity-90 focus-visible:outline-2 focus-visible:outline-[var(--accent)] rounded-md px-1 py-0.5"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] shrink-0" />
          <span className="font-bold tracking-tight">MiniPM</span>
        </Link>

        {/* Right controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          {user && onLogout ? (
            <UserMenu user={user} onLogout={onLogout} />
          ) : showAuthNav ? (
            <div className="flex items-center gap-2 text-xs">
              <Link
                href="/login"
                className="px-3 py-1.5 text-[var(--ink-2)] hover:text-[var(--ink)] font-medium rounded-lg transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="px-3 py-1.5 bg-[var(--ink)] text-[var(--bg)] font-medium rounded-lg hover:opacity-90 transition-opacity"
              >
                Sign up
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
};
