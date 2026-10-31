"use client";

import React, { useState, useEffect } from "react";
import { ResponsiveModal } from "@/components/ui/ResponsiveModal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { ITaskResponse, TaskStatus } from "@/models/Task";

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskToEdit?: ITaskResponse | null;
  onSubmit: (data: {
    title: string;
    description: string;
    status: TaskStatus;
    dueDate: string | null;
  }) => Promise<void>;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  open,
  onOpenChange,
  taskToEdit,
  onSubmit,
}) => {
  const isEditing = !!taskToEdit;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [dueDate, setDueDate] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || "");
      setStatus(taskToEdit.status);
      setDueDate(
        taskToEdit.dueDate ? taskToEdit.dueDate.substring(0, 10) : ""
      );
    } else {
      setTitle("");
      setDescription("");
      setStatus("todo");
      setDueDate("");
    }
    setError(null);
  }, [taskToEdit, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();

    if (!cleanTitle) {
      setError("Task title is required");
      return;
    }
    if (cleanTitle.length > 120) {
      setError("Title cannot exceed 120 characters");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit({
        title: cleanTitle,
        description: description.trim(),
        status,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      });
      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Edit Task" : "New Task"}
      description={
        isEditing
          ? "Update details, progress status, and target completion dates."
          : "Add an actionable task item to this project workspace."
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        <Input
          id="task-title"
          label="Task Title"
          placeholder="e.g. Design token architecture"
          required
          maxLength={120}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={error || undefined}
          disabled={isSubmitting}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            id="task-status"
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            disabled={isSubmitting}
            options={[
              { value: "todo", label: "To do" },
              { value: "in-progress", label: "In progress" },
              { value: "done", label: "Done" },
            ]}
          />

          <Input
            id="task-due-date"
            label="Due Date (Optional)"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <Textarea
          id="task-description"
          label="Description (Optional)"
          placeholder="Add specifications, requirements, or links..."
          rows={3}
          maxLength={1000}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          helperText={`${description.length}/1000 characters`}
          disabled={isSubmitting}
        />

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="accent"
            isLoading={isSubmitting}
          >
            {isEditing ? "Save changes" : "Create task"}
          </Button>
        </div>
      </form>
    </ResponsiveModal>
  );
};
