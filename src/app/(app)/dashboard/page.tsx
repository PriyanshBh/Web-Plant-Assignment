"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Plus, RefreshCw, AlertCircle, Search, X, CheckCircle2, Clock, Circle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchProjects,
  createProject,
  updateProject,
  deleteProject,
} from "@/store/slices/projectsSlice";
import { IProjectResponse } from "@/models/Project";
import { TaskStatus } from "@/models/Task";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { StatusPill } from "@/components/ui/StatusPill";
import { DueDateChip } from "@/components/tasks/DueDateChip";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { StatsStrip } from "@/components/projects/StatsStrip";
import { Segmented } from "@/components/ui/Segmented";
import { useDebounce } from "@/hooks/useDebounce";
import { apiClient } from "@/lib/api-client";

interface SearchTaskResult {
  id: string;
  projectId: string;
  projectTitle: string;
  title: string;
  description: string;
  status: TaskStatus;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { items: projects, status, error } = useAppSelector(
    (state) => state.projects
  );

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<IProjectResponse | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<IProjectResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 250);
  const [searchTab, setSearchTab] = useState<"projects" | "tasks">("projects");
  const [matchingTasks, setMatchingTasks] = useState<SearchTaskResult[]>([]);
  const [isSearchingTasks, setIsSearchingTasks] = useState(false);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  // Aggregate global stats from projects
  const totalProjects = projects.length;
  let totalOpenTasks = 0;
  let totalDoneTasks = 0;
  let totalOverdueTasks = 0;

  for (const p of projects) {
    if (p.taskCounts) {
      totalOpenTasks += p.taskCounts.todo + p.taskCounts.inProgress;
      totalDoneTasks += p.taskCounts.done;
      totalOverdueTasks += p.taskCounts.overdue || 0;
    }
  }

  // Filter projects by search query
  const filteredProjects = useMemo(() => {
    if (!debouncedQuery.trim()) return projects;
    const q = debouncedQuery.toLowerCase().trim();
    return projects.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
    );
  }, [projects, debouncedQuery]);

  // Global search across tasks when a query is active
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setMatchingTasks([]);
      return;
    }
    let isCancelled = false;
    setIsSearchingTasks(true);

    apiClient<SearchTaskResult[]>(
      `/api/tasks?q=${encodeURIComponent(debouncedQuery.trim())}`
    )
      .then((data) => {
        if (!isCancelled) setMatchingTasks(data || []);
      })
      .catch(() => {
        if (!isCancelled) setMatchingTasks([]);
      })
      .finally(() => {
        if (!isCancelled) setIsSearchingTasks(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [debouncedQuery]);

  const handleOpenCreate = () => {
    setEditingProject(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (project: IProjectResponse) => {
    setEditingProject(project);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: { title: string; description: string }) => {
    if (editingProject) {
      const res = await dispatch(
        updateProject({ id: editingProject.id, data })
      );
      if (updateProject.fulfilled.match(res)) {
        toast.success("Project updated successfully");
      } else {
        throw new Error(res.payload || "Failed to update project");
      }
    } else {
      const res = await dispatch(createProject(data));
      if (createProject.fulfilled.match(res)) {
        toast.success("Project created successfully");
      } else {
        throw new Error(res.payload || "Failed to create project");
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;

    try {
      setIsDeleting(true);
      const res = await dispatch(deleteProject(projectToDelete.id));
      if (deleteProject.fulfilled.match(res)) {
        toast.success("Project and all its tasks were deleted");
        setProjectToDelete(null);
      } else {
        toast.error(res.payload || "Failed to delete project");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const isLoading = status === "loading" && projects.length === 0;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <PageHeader
        title="Projects"
        count={projects.length}
        description="Organize work into structured workspaces and manage task lifecycles."
        action={
          <Button variant="accent" onClick={handleOpenCreate} className="gap-2">
            <Plus className="w-4 h-4" />
            <span>New project</span>
          </Button>
        }
      />

      {/* Stats Summary Strip */}
      <StatsStrip
        totalProjects={totalProjects}
        openTasks={totalOpenTasks}
        overdueTasks={totalOverdueTasks}
        doneTasks={totalDoneTasks}
      />

      {/* Search Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-3)] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects or tasks..."
            className="w-full h-10 pl-10 pr-9 text-base sm:text-sm bg-[var(--surface)] text-[var(--ink)] placeholder:text-[var(--ink-3)] rounded-xl border border-[var(--border)] focus:border-[var(--ink)] focus:outline-2 focus:outline-[var(--accent)] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[var(--ink-3)] hover:text-[var(--ink)] rounded-md transition-colors cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {debouncedQuery.trim() && (
          <div className="overflow-x-auto no-scrollbar">
            <Segmented
              name="dashboard-search-tab"
              value={searchTab}
              onChange={(val) => setSearchTab(val as "projects" | "tasks")}
              options={[
                { value: "projects", label: "Projects", count: filteredProjects.length },
                { value: "tasks", label: "Tasks", count: matchingTasks.length },
              ]}
            />
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-44 w-full" />
          <Skeleton className="h-44 w-full" />
          <Skeleton className="h-44 w-full" />
        </div>
      ) : status === "failed" && projects.length === 0 ? (
        <div className="p-8 text-center border border-[var(--danger)]/30 bg-[var(--danger)]/5 rounded-xl space-y-4">
          <AlertCircle className="w-8 h-8 text-[var(--danger)] mx-auto" />
          <div>
            <h3 className="font-semibold text-base text-[var(--ink)]">
              Failed to load projects
            </h3>
            <p className="text-xs text-[var(--ink-2)] mt-1">{error}</p>
          </div>
          <Button
            variant="secondary"
            onClick={() => dispatch(fetchProjects())}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try again</span>
          </Button>
        </div>
      ) : debouncedQuery.trim() && searchTab === "tasks" ? (
        /* Matching Tasks List */
        isSearchingTasks ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : matchingTasks.length === 0 ? (
          <EmptyState
            title="No tasks found"
            description={`No tasks match "${debouncedQuery}". Try a different keyword.`}
            actionLabel="Clear search"
            onAction={() => setSearchQuery("")}
          />
        ) : (
          <div className="space-y-2">
            <AnimatePresence mode="popLayout" initial={false}>
              {matchingTasks.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl hover:border-[var(--ink-2)]/40 transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="pt-0.5">
                      {task.status === "done" ? (
                        <CheckCircle2 className="w-4 h-4 text-[var(--done-fg)] shrink-0" />
                      ) : task.status === "in-progress" ? (
                        <Clock className="w-4 h-4 text-[var(--prog-fg)] shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-[var(--todo-fg)] shrink-0" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <Link
                          href={`/projects/${task.projectId}`}
                          className="text-sm font-medium text-[var(--ink)] hover:text-[var(--accent)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--accent)] rounded"
                        >
                          {task.title}
                        </Link>
                        <Link
                          href={`/projects/${task.projectId}`}
                          className="text-[11px] font-mono px-2 py-0.5 bg-[var(--surface-2)] text-[var(--ink-2)] hover:text-[var(--ink)] rounded-md border border-[var(--border)] transition-colors"
                        >
                          {task.projectTitle}
                        </Link>
                      </div>
                      {task.description && (
                        <p className="text-xs text-[var(--ink-2)] line-clamp-1 mt-0.5">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <StatusPill status={task.status} />
                    <DueDateChip dueDate={task.dueDate} isDone={task.status === "done"} />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )
      ) : projects.length === 0 ? (
        <EmptyState
          title="Nothing here yet"
          description="Start with your first project to organize your team deliverables and track tasks."
          actionLabel="Create your first project"
          onAction={handleOpenCreate}
        />
      ) : debouncedQuery.trim() && filteredProjects.length === 0 ? (
        <EmptyState
          title="No projects match this search"
          description={`No projects match "${debouncedQuery}". You can also check matching tasks above.`}
          actionLabel="Clear search"
          onAction={() => setSearchQuery("")}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project, idx) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.25,
                delay: Math.min(idx * 0.04, 0.3),
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <ProjectCard
                project={project}
                onEdit={handleOpenEdit}
                onDelete={setProjectToDelete}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Create / Edit Project Modal */}
      <ProjectForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        projectToEdit={editingProject}
        onSubmit={handleFormSubmit}
      />

      {/* Delete Project Confirmation Dialog */}
      <ConfirmDialog
        open={!!projectToDelete}
        onOpenChange={(open) => !open && setProjectToDelete(null)}
        title="Delete project?"
        description={`Are you sure you want to delete "${projectToDelete?.title}"? This will permanently delete the project and all ${projectToDelete?.taskCounts?.total || 0} associated tasks.`}
        confirmLabel="Delete project"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
