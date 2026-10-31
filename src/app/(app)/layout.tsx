"use client";

import React, { Suspense } from "react";
import { AuthGate } from "@/components/layout/AuthGate";
import { TopBar } from "@/components/layout/TopBar";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import { Skeleton } from "@/components/ui/Skeleton";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <Suspense
      fallback={
        <div className="max-w-[1120px] mx-auto p-4 sm:p-8 space-y-8">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-32 w-full" />
        </div>
      }
    >
      <AuthGate>
        <div className="min-h-[100dvh] flex flex-col bg-[var(--bg)] text-[var(--ink)]">
          <TopBar user={user} onLogout={handleLogout} />
          <main className="flex-1 w-full max-w-[1120px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
            {children}
          </main>
        </div>
      </AuthGate>
    </Suspense>
  );
}
