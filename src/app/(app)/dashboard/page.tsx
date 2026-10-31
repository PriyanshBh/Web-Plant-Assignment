"use client";

import React, { useEffect, useState } from "react";
import { Plus, RefreshCw, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchProjects,
  createProject,
  updateProject,
  deleteProject,
} from "@/store/slices/projectsSlice";
import { IProjectResponse } from "@/models/Project";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { StatsStrip } from "@/components/projects/StatsStrip";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { items: projects, status, error } = useAppSelector(
    (state) => state.projects
  );

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<IProjectResponse | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<IProjectResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  // Aggregate global stats from projects
  const totalProjects = projects.length;
  let totalOpenTasks = 0;
  let totalDoneTasks = 0;

  for (const p of projects) {
    if (p.taskCounts) {
      totalOpenTasks += p.taskCounts.todo + p.taskCounts.inProgress;
      totalDoneTasks += p.taskCounts.done;
    }
  }

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
        overdueTasks={0}
        doneTasks={totalDoneTasks}
      />

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
      ) : projects.length === 0 ? (
        <EmptyState
          title="Nothing here yet"
          description="Start with your first project to organize your team deliverables and track tasks."
          actionLabel="Create your first project"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project, idx) => (
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
