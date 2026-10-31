"use client";

import React, { useState, useEffect } from "react";
import { ResponsiveModal } from "@/components/ui/ResponsiveModal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { IProjectResponse } from "@/models/Project";

interface ProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectToEdit?: IProjectResponse | null;
  onSubmit: (data: { title: string; description: string }) => Promise<void>;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
  open,
  onOpenChange,
  projectToEdit,
  onSubmit,
}) => {
  const isEditing = !!projectToEdit;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (projectToEdit) {
      setTitle(projectToEdit.title);
      setDescription(projectToEdit.description || "");
    } else {
      setTitle("");
      setDescription("");
    }
    setError(null);
  }, [projectToEdit, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();

    if (!cleanTitle) {
      setError("Project title is required");
      return;
    }
    if (cleanTitle.length > 80) {
      setError("Title cannot exceed 80 characters");
      return;
    }
    if (description.length > 500) {
      setError("Description cannot exceed 500 characters");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit({ title: cleanTitle, description: description.trim() });
      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save project");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Edit Project" : "New Project"}
      description={
        isEditing
          ? "Update your project title and overview."
          : "Create a focused space to organize tasks and track milestones."
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        <Input
          id="project-title"
          label="Project Title"
          placeholder="e.g. Mobile Application V2"
          required
          maxLength={80}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={error || undefined}
          disabled={isSubmitting}
        />

        <Textarea
          id="project-description"
          label="Description (Optional)"
          placeholder="Summary of objectives, goals, and key deliverables..."
          rows={3}
          maxLength={500}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          helperText={`${description.length}/500 characters`}
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
            {isEditing ? "Save changes" : "Create project"}
          </Button>
        </div>
      </form>
    </ResponsiveModal>
  );
};
