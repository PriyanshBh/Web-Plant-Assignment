"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Check, Calendar, FolderKanban } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMe } from "@/store/slices/authSlice";
import { Button } from "@/components/ui/Button";
import { TopBar } from "@/components/layout/TopBar";
import { StatusPill } from "@/components/ui/StatusPill";
import { ProgressBar } from "@/components/ui/ProgressBar";

export default function LandingPage() {
  const dispatch = useAppDispatch();
  const { user, status } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchMe());
    }
  }, [dispatch, status]);

  const isAuthenticated = !!user;

  return (
    <div className="min-h-[100dvh] flex flex-col justify-between bg-[var(--bg)] text-[var(--ink)]">
      <TopBar showAuthNav={!isAuthenticated} user={user} />

      <main className="flex-1 max-w-[1120px] mx-auto px-4 sm:px-6 py-12 md:py-20 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Headline and Actions */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium tracking-wide bg-[var(--surface-2)] text-[var(--ink-2)] border border-[var(--border)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
              <span>Version 1.0 Ready</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif tracking-tight text-[var(--ink)] leading-[1.1]">
              Tools built with <br />
              <span className="italic font-normal">quiet precision.</span>
            </h1>

            <p className="text-base sm:text-lg text-[var(--ink-2)] leading-relaxed max-w-lg">
              A calm, focused project manager that treats your attention as a finite
              resource. Designed for clarity, speed, and effortless execution.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button variant="accent" size="lg" className="gap-2">
                    <span>Open dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/signup">
                    <Button variant="accent" size="lg" className="gap-2">
                      <span>Get started</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="secondary" size="lg">
                      Log in
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right Column: Live Non-Interactive Preview Built From Real Components */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-6 w-full"
          >
            <div className="p-6 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-[var(--popover-shadow)] space-y-5">
              {/* Mini Project Card Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-[var(--ink)]">
                    <FolderKanban className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-base text-[var(--ink)] tracking-tight">
                      Platform Engineering
                    </h2>
                    <p className="text-xs text-[var(--ink-3)] font-mono">
                      Updated 2 hours ago
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono text-[var(--ink-2)]">
                  2 of 3 done
                </span>
              </div>

              {/* Solid Segmented Progress Bar */}
              <ProgressBar todo={0} inProgress={1} done={2} total={3} />

              {/* Task Rows List */}
              <div className="space-y-2.5 pt-2">
                {/* Row 1 - Done */}
                <div className="p-3 bg-[var(--bg)] border border-[var(--border)] rounded-xl flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-4 h-4 rounded bg-[var(--done-fg)] text-[var(--bg)] flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span className="line-through text-[var(--ink-3)] truncate">
                      Design token architecture
                    </span>
                  </div>
                  <StatusPill status="done" size="sm" />
                </div>

                {/* Row 2 - Done */}
                <div className="p-3 bg-[var(--bg)] border border-[var(--border)] rounded-xl flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-4 h-4 rounded bg-[var(--done-fg)] text-[var(--bg)] flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span className="line-through text-[var(--ink-3)] truncate">
                      API endpoint rate limiting
                    </span>
                  </div>
                  <StatusPill status="done" size="sm" />
                </div>

                {/* Row 3 - In Progress */}
                <div className="p-3 bg-[var(--bg)] border border-[var(--border)] rounded-xl flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-4 h-4 rounded border border-[var(--ink-3)] shrink-0" />
                    <span className="font-medium text-[var(--ink)] truncate">
                      Real-time task sorting engine
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-[var(--ink-3)] font-mono">
                      <Calendar className="w-3 h-3" />
                      <span>Due in 2d</span>
                    </span>
                    <StatusPill status="in-progress" size="sm" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <footer className="border-t border-[var(--border)] py-6 text-center text-xs text-[var(--ink-3)]">
        Mini Project Manager — Designed for modern workflows and structured execution.
      </footer>
    </div>
  );
}
