"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { StatusPill } from "@/components/ui/StatusPill";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ResponsiveModal } from "@/components/ui/ResponsiveModal";
import { Segmented } from "@/components/ui/Segmented";
import { TopBar } from "@/components/layout/TopBar";
import { PageHeader } from "@/components/layout/PageHeader";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

export default function DesignSystemPreviewPage() {
  const [filter, setFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const mockUser = {
    name: "Alex Designer",
    email: "alex@example.com",
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      <TopBar user={mockUser} onLogout={() => toast.info("Logout clicked")} />

      <main className="max-w-[1120px] mx-auto p-4 sm:p-8 space-y-12">
        <PageHeader
          title="Design System & UI Primitives"
          count={14}
          description="A complete catalog of tokens, typography, and interactive components built to verify WCAG AA compliance, responsive scaling, and zero gradients."
          action={
            <Button
              variant="accent"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="w-4 h-4" />
              <span>Open Modal</span>
            </Button>
          }
        />

        {/* 1. Color Palette Tokens */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--ink-3)]">
            Color Tokens (Flat & Solid)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 text-xs font-mono">
            <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--bg)]">
              <span className="block font-bold">--bg</span>
              <span className="text-[var(--ink-2)]">Canvas</span>
            </div>
            <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--surface)]">
              <span className="block font-bold">--surface</span>
              <span className="text-[var(--ink-2)]">Surface</span>
            </div>
            <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--surface-2)]">
              <span className="block font-bold">--surface-2</span>
              <span className="text-[var(--ink-2)]">Surface 2</span>
            </div>
            <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--border)] text-[var(--ink)]">
              <span className="block font-bold">--border</span>
              <span>Hairline</span>
            </div>
            <div className="p-3 rounded-lg bg-[var(--accent)] text-[var(--accent-ink)]">
              <span className="block font-bold">--accent</span>
              <span>Vermilion</span>
            </div>
            <div className="p-3 rounded-lg bg-[var(--danger)] text-white">
              <span className="block font-bold">--danger</span>
              <span>Alert</span>
            </div>
          </div>
        </section>

        {/* 2. Buttons */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--ink-3)]">
            Buttons
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Primary Solid</Button>
            <Button variant="accent">Accent Action</Button>
            <Button variant="secondary">Secondary Outline</Button>
            <Button variant="ghost">Ghost Neutral</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="primary" isLoading>
              Loading
            </Button>
            <Button
              variant="secondary"
              onClick={() => toast.success("Toast notification tested successfully!")}
            >
              Trigger Toast
            </Button>
          </div>
        </section>

        {/* 3. Form Elements */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--ink-3)]">
            Form Controls
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
            <Input
              label="Project Title"
              placeholder="e.g. Mobile App Redesign"
              defaultValue="Core API Infrastructure"
            />
            <Input
              label="Email Address (Error Demo)"
              type="email"
              error="Please enter a valid work email address"
              defaultValue="invalid-format@"
            />
            <Select
              label="Default Task Status"
              options={[
                { value: "todo", label: "To do" },
                { value: "in-progress", label: "In progress" },
                { value: "done", label: "Done" },
              ]}
            />
            <Textarea
              label="Project Notes"
              placeholder="Add optional description..."
              defaultValue="Weekly sprint goals and core deliverables for the backend engine."
            />
          </div>
        </section>

        {/* 4. Badges, Progress Bars, Segmented */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--ink-3)]">
            Status Indicators & Segmented Control
          </h2>
          <div className="flex flex-wrap items-center gap-4">
            <StatusPill status="todo" />
            <StatusPill status="in-progress" />
            <StatusPill status="done" />
          </div>

          <div className="max-w-md space-y-2 pt-2">
            <div className="flex justify-between text-xs text-[var(--ink-2)]">
              <span>Overall Progress</span>
              <span className="font-mono tabular-nums">4 of 10 done (40%)</span>
            </div>
            <ProgressBar todo={3} inProgress={3} done={4} />
          </div>

          <div className="pt-2">
            <Segmented
              value={filter}
              onChange={setFilter}
              options={[
                { value: "all", label: "All Tasks", count: 12 },
                { value: "todo", label: "To do", count: 4 },
                { value: "in-progress", label: "In progress", count: 3 },
                { value: "done", label: "Done", count: 5 },
              ]}
            />
          </div>
        </section>

        {/* 5. Skeletons */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--ink-3)]">
            Skeletons (Subtle Pulse, No Gradient Shimmer)
          </h2>
          <div className="max-w-md space-y-2.5 p-4 border border-[var(--border)] rounded-xl bg-[var(--surface)]">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        </section>

        {/* 6. Empty State */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--ink-3)]">
            Empty State
          </h2>
          <EmptyState
            title="No tasks match this filter"
            description="Try switching the active status filter above or clear your search term to see all tasks."
            actionLabel="Reset filters"
            onAction={() => setFilter("all")}
          />
        </section>

        {/* 7. Dialog Trigger Buttons */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--ink-3)]">
            Modal & Confirm Dialogs
          </h2>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setIsModalOpen(true)}>
              Test Responsive Modal
            </Button>
            <Button variant="destructive" onClick={() => setIsConfirmOpen(true)}>
              <Trash2 className="w-4 h-4" />
              <span>Test Delete Confirm</span>
            </Button>
          </div>
        </section>

        {/* Responsive Modal Demo */}
        <ResponsiveModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          title="Create New Project"
          description="Projects organize tasks and track team milestones."
        >
          <div className="space-y-4 pt-2">
            <Input label="Title" placeholder="e.g. Website Overhaul" />
            <Textarea label="Description" placeholder="Project goals..." />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="accent"
                onClick={() => {
                  toast.success("Project created (preview demo)");
                  setIsModalOpen(false);
                }}
              >
                Create Project
              </Button>
            </div>
          </div>
        </ResponsiveModal>

        {/* Confirm Dialog Demo */}
        <ConfirmDialog
          open={isConfirmOpen}
          onOpenChange={setIsConfirmOpen}
          title="Delete Project?"
          description="Are you sure you want to delete this project? All 6 tasks belonging to this project will also be permanently deleted."
          confirmLabel="Delete Project"
          onConfirm={() => {
            toast.error("Project and 6 tasks deleted");
            setIsConfirmOpen(false);
          }}
        />
      </main>
    </div>
  );
}
