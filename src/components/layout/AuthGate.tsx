"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMe } from "@/store/slices/authSlice";
import { Skeleton } from "@/components/ui/Skeleton";

interface AuthGateProps {
  children: React.ReactNode;
}

export const AuthGate: React.FC<AuthGateProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, status } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchMe());
    }
  }, [dispatch, status]);

  useEffect(() => {
    if (status === "unauthenticated") {
      const fullPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
      router.replace(`/login?next=${encodeURIComponent(fullPath)}`);
    }
  }, [status, router, pathname, searchParams]);

  // Loading state: calm, elegant skeleton while resolving initial session
  if (status === "loading" || status === "idle") {
    return (
      <div className="max-w-[1120px] mx-auto p-4 sm:p-8 space-y-8 animate-fadeIn">
        <div className="space-y-3 pb-6 border-b border-[var(--border)]">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-44 w-full" />
          <Skeleton className="h-44 w-full" />
          <Skeleton className="h-44 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGate;
