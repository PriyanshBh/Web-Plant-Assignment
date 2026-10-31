"use client";

import { Search, X } from "lucide-react";
import { Segmented } from "@/components/ui/Segmented";
import { Select } from "@/components/ui/Select";
import { TaskFilters } from "@/store/slices/tasksSlice";

interface TaskToolbarProps {
  filters: TaskFilters;
  counts: {
    total: number;
    todo: number;
    inProgress: number;
    done: number;
  };
  onFilterChange: (filters: Partial<TaskFilters>) => void;
}

export const TaskToolbar: React.FC<TaskToolbarProps> = ({
  filters,
  counts,
  onFilterChange,
}) => {
  const currentSortValue = `${filters.sort}_${filters.order}`;

  const handleSortChange = (combinedVal: string) => {
    const [sort, order] = combinedVal.split("_") as [
      TaskFilters["sort"],
      TaskFilters["order"],
    ];
    onFilterChange({ sort, order });
  };

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
      {/* Segmented Status Tabs */}
      <div className="overflow-x-auto no-scrollbar">
        <Segmented
          name="task-status-filter"
          value={filters.status}
          onChange={(status) => onFilterChange({ status })}
          options={[
            { value: "all", label: "All", count: counts.total },
            { value: "todo", label: "To do", count: counts.todo },
            { value: "in-progress", label: "In progress", count: counts.inProgress },
            { value: "done", label: "Done", count: counts.done },
          ]}
        />
      </div>

      {/* Search and Sort Controls */}
      <div className="flex items-center gap-2">
        {/* Search Input */}
        <div className="relative flex-1 sm:w-60">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--ink-3)] pointer-events-none" />
          <input
            type="text"
            value={filters.q}
            onChange={(e) => onFilterChange({ q: e.target.value })}
            placeholder="Search tasks..."
            className="w-full h-9 pl-8 pr-7 text-xs bg-[var(--surface)] text-[var(--ink)] placeholder:text-[var(--ink-3)] rounded-lg border border-[var(--border)] focus:border-[var(--ink)] focus:outline-2 focus:outline-[var(--accent)] transition-colors"
          />
          {filters.q && (
            <button
              onClick={() => onFilterChange({ q: "" })}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort Select */}
        <div className="w-40 sm:w-44 shrink-0">
          <Select
            value={currentSortValue}
            onChange={(e) => handleSortChange(e.target.value)}
            className="h-9 text-xs"
            options={[
              { value: "createdAt_desc", label: "Newest first" },
              { value: "createdAt_asc", label: "Oldest first" },
              { value: "dueDate_asc", label: "Due date (earliest)" },
              { value: "dueDate_desc", label: "Due date (latest)" },
            ]}
          />
        </div>
      </div>
    </div>
  );
};
