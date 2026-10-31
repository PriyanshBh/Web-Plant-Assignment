"use client";

import React, { useEffect, useState, use, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { AnimatePresence } from "motion/react";
import {
  ChevronLeft,
  Plus,
  Pencil,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProject, updateProject } from "@/store/slices/projectsSlice";
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  setFilters,
  resetFilters,
  optimisticStatusChange,
  rollbackOptimisticUpdate,
  optimisticDeleteTask,
  selectTaskCounts,
  selectCompletionRate,
  selectOverdueTasksCount,
  TaskFilters,
} from "@/store/slices/tasksSlice";
import { ITaskResponse, TaskStatus } from "@/models/Task";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { TaskRow } from "@/components/tasks/TaskRow";
import { TaskForm } from "@/components/tasks/TaskForm";
import { TaskToolbar } from "@/components/tasks/TaskToolbar";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { useDebounce } from "@/hooks/useDebounce";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailPage({ params }: PageProps) {
  const { id: projectId } = use(params);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [, startTransition] = useTransition();

  const { currentProject } = useAppSelector((state) => state.projects);
  const { items: tasks, filters, status: tasksStatus, error: tasksError } = useAppSelector(
    (state) => state.tasks
  );

  const taskCounts = useAppSelector(selectTaskCounts);
  const completionRate = useAppSelector(selectCompletionRate);
  const overdueCount = useAppSelector(selectOverdueTasksCount);

  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ITaskResponse | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);

  // Initialize filters from URL search params on mount
  useEffect(() => {
    const statusParam = searchParams.get("status") as TaskFilters["status"] | null;
    const sortParam = searchParams.get("sort") as TaskFilters["sort"] | null;
    const orderParam = searchParams.get("order") as TaskFilters["order"] | null;
    const qParam = searchParams.get("q");

    const initialFilters: Partial<TaskFilters> = {};
    if (statusParam && ["all", "todo", "in-progress", "done"].includes(statusParam)) {
      initialFilters.status = statusParam;
    }
    if (sortParam && ["dueDate", "createdAt"].includes(sortParam)) {
      initialFilters.sort = sortParam;
    }
    if (orderParam && ["asc", "desc"].includes(orderParam)) {
      initialFilters.order = orderParam;
    }
    if (qParam !== null) {
      initialFilters.q = qParam;
    }

    if (Object.keys(initialFilters).length > 0) {
      dispatch(setFilters(initialFilters));
    }
  }, [searchParams, dispatch]);

  // Load project and initial tasks
  useEffect(() => {
    dispatch(fetchProject(projectId));
  }, [dispatch, projectId]);

  // Debounce search query
  const debouncedSearch = useDebounce(filters.q, 250);

  // Fetch tasks whenever filters change
  useEffect(() => {
    dispatch(
      fetchTasks({
        projectId,
        filters: { ...filters, q: debouncedSearch },
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, projectId, filters.status, filters.sort, filters.order, debouncedSearch]);

  // Sync active filters to URL search params
  const handleFilterChange = (newFilters: Partial<TaskFilters>) => {
    dispatch(setFilters(newFilters));

    startTransition(() => {
      const merged = { ...filters, ...newFilters };
      const params = new URLSearchParams();
      if (merged.status !== "all") params.set("status", merged.status);
      if (merged.sort !== "createdAt") params.set("sort", merged.sort);
      if (merged.order !== "desc") params.set("order", merged.order);
      if (merged.q && merged.q.trim() !== "") params.set("q", merged.q.trim());

      const queryString = params.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    });
  };

  const handleOpenCreateTask = () => {
    setEditingTask(null);
    setIsTaskFormOpen(true);
  };

  const handleOpenEditTask = (task: ITaskResponse) => {
    setEditingTask(task);
    setIsTaskFormOpen(true);
  };

  const handleTaskFormSubmit = async (data: {
    title: string;
    description: string;
    status: TaskStatus;
    dueDate: string | null;
  }) => {
    if (editingTask) {
      const res = await dispatch(
        updateTask({
          projectId,
          taskId: editingTask.id,
          data,
        })
      );
      if (updateTask.fulfilled.match(res)) {
        toast.success("Task updated");
      } else {
        throw new Error(res.payload || "Failed to update task");
      }
    } else {
      const res = await dispatch(
        createTask({
          projectId,
          data,
        })
      );
      if (createTask.fulfilled.match(res)) {
        toast.success("Task created");
      } else {
        throw new Error(res.payload || "Failed to create task");
      }
    }
  };

  // Optimistic status toggle with automatic rollback on error
  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    dispatch(optimisticStatusChange({ taskId, status: newStatus }));

    const res = await dispatch(
      updateTask({
        projectId,
        taskId,
        data: { status: newStatus },
      })
    );

    if (updateTask.rejected.match(res)) {
      dispatch(rollbackOptimisticUpdate());
      toast.error(res.payload || "Failed to update task status. Changes rolled back.");
    }
  };

  // Optimistic deletion
  const handleConfirmDeleteTask = async () => {
    if (!taskToDelete) return;
    const targetId = taskToDelete;
    setTaskToDelete(null);

    dispatch(optimisticDeleteTask(targetId));

    const res = await dispatch(
      deleteTask({
        projectId,
        taskId: targetId,
      })
    );

    if (deleteTask.fulfilled.match(res)) {
      toast.success("Task deleted");
    } else {
      dispatch(rollbackOptimisticUpdate());
      toast.error(res.payload || "Failed to delete task. Changes restored.");
    }
  };

  const handleProjectUpdate = async (data: { title: string; description: string }) => {
    const res = await dispatch(updateProject({ id: projectId, data }));
    if (updateProject.fulfilled.match(res)) {
      toast.success("Project updated");
    } else {
      throw new Error(res.payload || "Failed to update project");
    }
  };

  const isLoading = tasksStatus === "loading" && tasks.length === 0;

  return (
    <div className="space-y-6 pb-20 animate-fadeIn">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[var(--ink-3)] font-medium">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 hover:text-[var(--ink)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--accent)] rounded"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Projects</span>
        </Link>
        <span>/</span>
        <span className="text-[var(--ink-2)] truncate max-w-[200px]">
          {currentProject?.title || "Workspace"}
        </span>
      </div>

      {/* Project Header Card */}
      <div className="p-5 sm:p-6 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-none space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--ink)]">
                {currentProject?.title || (
                  <Skeleton className="h-8 w-56 inline-block" />
                )}
              </h1>
              {currentProject && (
                <button
                  onClick={() => setIsProjectFormOpen(true)}
                  className="p-1.5 rounded-lg text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                  aria-label="Edit project details"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
            </div>

            <p className="text-sm text-[var(--ink-2)] leading-relaxed max-w-2xl">
              {currentProject?.description || "No description provided for this project."}
            </p>
          </div>

          <Button
            variant="accent"
            onClick={handleOpenCreateTask}
            className="gap-2 shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>New task</span>
          </Button>
        </div>

        {/* Progress and Task Statistics Strip */}
        <div className="pt-2 border-t border-[var(--border)] space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-mono text-[var(--ink-2)] tabular-nums">
              {taskCounts.done} of {taskCounts.total} completed ({completionRate}%)
            </span>
            <div className="flex items-center gap-3 font-mono text-[11px] text-[var(--ink-3)]">
              <span>{taskCounts.todo} to do</span>
              <span>•</span>
              <span>{taskCounts.inProgress} in progress</span>
              {overdueCount > 0 && (
                <>
                  <span>•</span>
                  <span className="text-[var(--danger)] font-medium">
                    {overdueCount} overdue
                  </span>
                </>
              )}
            </div>
          </div>

          <ProgressBar
            todo={taskCounts.todo}
            inProgress={taskCounts.inProgress}
            done={taskCounts.done}
            total={taskCounts.total}
          />
        </div>
      </div>

      {/* Task Filter & Search Toolbar */}
      <TaskToolbar
        filters={filters}
        counts={taskCounts}
        onFilterChange={handleFilterChange}
      />

      {/* Task List or States */}
      {isLoading ? (
        <div className="space-y-3 pt-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : tasksStatus === "failed" && tasks.length === 0 ? (
        <div className="p-8 text-center border border-[var(--danger)]/30 bg-[var(--danger)]/5 rounded-xl space-y-4">
          <AlertCircle className="w-8 h-8 text-[var(--danger)] mx-auto" />
          <div>
            <h3 className="font-semibold text-base text-[var(--ink)]">
              Failed to load tasks
            </h3>
            <p className="text-xs text-[var(--ink-2)] mt-1">{tasksError}</p>
          </div>
          <Button
            variant="secondary"
            onClick={() => dispatch(fetchTasks({ projectId }))}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try again</span>
          </Button>
        </div>
      ) : tasks.length === 0 ? (
        // Differentiate: no tasks yet vs no tasks matching current filter
        taskCounts.total === 0 ? (
          <EmptyState
            title="No tasks yet"
            description="Start organizing work by creating the first actionable task for this project."
            actionLabel="Create task"
            onAction={handleOpenCreateTask}
          />
        ) : (
          <EmptyState
            title="No tasks match this filter"
            description="None of your tasks match the selected status or search query."
            actionLabel="Clear filters"
            onAction={() => {
              dispatch(resetFilters());
              router.replace(pathname, { scroll: false });
            }}
          />
        )
      ) : (
        <div className="space-y-2 pt-1">
          <AnimatePresence mode="popLayout" initial={false}>
            {tasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onStatusChange={handleStatusChange}
                onEdit={handleOpenEditTask}
                onDelete={setTaskToDelete}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Mobile Floating Action Button (Safe-Area Aware) */}
      <div className="sm:hidden fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))] right-6 z-30">
        <Button
          variant="accent"
          size="icon"
          onClick={handleOpenCreateTask}
          className="w-14 h-14 rounded-full shadow-[var(--popover-shadow)]"
          aria-label="Add new task"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </Button>
      </div>

      {/* Create / Edit Task Modal */}
      <TaskForm
        open={isTaskFormOpen}
        onOpenChange={setIsTaskFormOpen}
        taskToEdit={editingTask}
        onSubmit={handleTaskFormSubmit}
      />

      {/* Edit Project Modal */}
      <ProjectForm
        open={isProjectFormOpen}
        onOpenChange={setIsProjectFormOpen}
        projectToEdit={currentProject}
        onSubmit={handleProjectUpdate}
      />

      {/* Delete Task Confirmation */}
      <ConfirmDialog
        open={!!taskToDelete}
        onOpenChange={(open) => !open && setTaskToDelete(null)}
        title="Delete task?"
        description="Are you sure you want to delete this task? This action cannot be undone."
        confirmLabel="Delete task"
        onConfirm={handleConfirmDeleteTask}
      />
    </div>
  );
}
