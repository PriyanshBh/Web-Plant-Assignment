import {
  createSlice,
  createAsyncThunk,
  createSelector,
  PayloadAction,
} from "@reduxjs/toolkit";
import { apiClient, ApiError } from "@/lib/api-client";
import { ITaskResponse, TaskStatus } from "@/models/Task";
import { TaskCreateInput, TaskUpdateInput, TaskQueryInput } from "@/lib/validators";
import { isOverdue } from "@/lib/utils";

export interface TaskFilters {
  status: "all" | "todo" | "in-progress" | "done";
  sort: "dueDate" | "createdAt";
  order: "asc" | "desc";
  q: string;
}

export interface TasksState {
  items: ITaskResponse[];
  filters: TaskFilters;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  // History for optimistic update rollbacks
  previousItems: ITaskResponse[] | null;
}

const initialState: TasksState = {
  items: [],
  filters: {
    status: "all",
    sort: "createdAt",
    order: "desc",
    q: "",
  },
  status: "idle",
  error: null,
  previousItems: null,
};

export const fetchTasks = createAsyncThunk<
  ITaskResponse[],
  { projectId: string; filters?: Partial<TaskFilters> },
  { rejectValue: string }
>("tasks/fetchTasks", async ({ projectId, filters = {} }, { getState, rejectWithValue }) => {
  try {
    const state = getState() as { tasks: TasksState };
    const mergedFilters = { ...state.tasks.filters, ...filters };

    const searchParams = new URLSearchParams();
    if (mergedFilters.status !== "all") searchParams.set("status", mergedFilters.status);
    if (mergedFilters.sort) searchParams.set("sort", mergedFilters.sort);
    if (mergedFilters.order) searchParams.set("order", mergedFilters.order);
    if (mergedFilters.q && mergedFilters.q.trim() !== "") {
      searchParams.set("q", mergedFilters.q.trim());
    }

    const queryStr = searchParams.toString();
    const endpoint = `/api/projects/${projectId}/tasks${queryStr ? `?${queryStr}` : ""}`;

    return await apiClient<ITaskResponse[]>(endpoint);
  } catch (err: unknown) {
    if (err instanceof ApiError) return rejectWithValue(err.message);
    return rejectWithValue("Failed to load tasks");
  }
});

export const createTask = createAsyncThunk<
  ITaskResponse,
  { projectId: string; data: TaskCreateInput },
  { rejectValue: string }
>("tasks/createTask", async ({ projectId, data }, { rejectWithValue }) => {
  try {
    return await apiClient<ITaskResponse>(`/api/projects/${projectId}/tasks`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  } catch (err: unknown) {
    if (err instanceof ApiError) return rejectWithValue(err.message);
    return rejectWithValue("Failed to create task");
  }
});

export const updateTask = createAsyncThunk<
  ITaskResponse,
  { projectId: string; taskId: string; data: TaskUpdateInput },
  { rejectValue: string }
>("tasks/updateTask", async ({ projectId, taskId, data }, { rejectWithValue }) => {
  try {
    return await apiClient<ITaskResponse>(
      `/api/projects/${projectId}/tasks/${taskId}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      }
    );
  } catch (err: unknown) {
    if (err instanceof ApiError) return rejectWithValue(err.message);
    return rejectWithValue("Failed to update task");
  }
});

export const deleteTask = createAsyncThunk<
  string,
  { projectId: string; taskId: string },
  { rejectValue: string }
>("tasks/deleteTask", async ({ projectId, taskId }, { rejectWithValue }) => {
  try {
    await apiClient<{ id: string }>(`/api/projects/${projectId}/tasks/${taskId}`, {
      method: "DELETE",
    });
    return taskId;
  } catch (err: unknown) {
    if (err instanceof ApiError) return rejectWithValue(err.message);
    return rejectWithValue("Failed to delete task");
  }
});

export const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Partial<TaskFilters>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters(state) {
      state.filters = initialState.filters;
    },
    // Optimistic status update before network request completes
    optimisticStatusChange(
      state,
      action: PayloadAction<{ taskId: string; status: TaskStatus }>
    ) {
      state.previousItems = state.items.map((t) => ({ ...t }));
      const index = state.items.findIndex((t) => t.id === action.payload.taskId);
      if (index !== -1) {
        state.items[index].status = action.payload.status;
      }
    },
    // Rollback optimistic update on failure
    rollbackOptimisticUpdate(state) {
      if (state.previousItems) {
        state.items = state.previousItems;
        state.previousItems = null;
      }
    },
    // Optimistic deletion
    optimisticDeleteTask(state, action: PayloadAction<string>) {
      state.previousItems = state.items.map((t) => ({ ...t }));
      state.items = state.items.filter((t) => t.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    // fetchTasks
    builder.addCase(fetchTasks.pending, (state) => {
      state.status = "loading";
      state.error = null;
    });
    builder.addCase(
      fetchTasks.fulfilled,
      (state, action: PayloadAction<ITaskResponse[]>) => {
        state.status = "succeeded";
        state.items = action.payload;
        state.previousItems = null;
      }
    );
    builder.addCase(fetchTasks.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload || "Failed to load tasks";
    });

    // createTask
    builder.addCase(
      createTask.fulfilled,
      (state, action: PayloadAction<ITaskResponse>) => {
        state.items.unshift(action.payload);
      }
    );

    // updateTask fulfilled (reconciles with server response)
    builder.addCase(
      updateTask.fulfilled,
      (state, action: PayloadAction<ITaskResponse>) => {
        const index = state.items.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.previousItems = null;
      }
    );
    // updateTask rejected (roll back)
    builder.addCase(updateTask.rejected, (state, action) => {
      if (state.previousItems) {
        state.items = state.previousItems;
        state.previousItems = null;
      }
      state.error = action.payload || "Failed to update task";
    });

    // deleteTask fulfilled
    builder.addCase(deleteTask.fulfilled, (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((t) => t.id !== action.payload);
      state.previousItems = null;
    });
    // deleteTask rejected (roll back)
    builder.addCase(deleteTask.rejected, (state, action) => {
      if (state.previousItems) {
        state.items = state.previousItems;
        state.previousItems = null;
      }
      state.error = action.payload || "Failed to delete task";
    });
  },
});

export const {
  setFilters,
  resetFilters,
  optimisticStatusChange,
  rollbackOptimisticUpdate,
  optimisticDeleteTask,
} = tasksSlice.actions;

// Memoized Selectors
export const selectTasks = (state: { tasks: TasksState }) => state.tasks.items;
export const selectTaskFilters = (state: { tasks: TasksState }) => state.tasks.filters;

export const selectTaskCounts = createSelector([selectTasks], (tasks) => {
  const counts = { total: tasks.length, todo: 0, inProgress: 0, done: 0 };
  for (const t of tasks) {
    if (t.status === "todo") counts.todo++;
    else if (t.status === "in-progress") counts.inProgress++;
    else if (t.status === "done") counts.done++;
  }
  return counts;
});

export const selectOverdueTasksCount = createSelector([selectTasks], (tasks) => {
  return tasks.filter((t) => t.status !== "done" && isOverdue(t.dueDate)).length;
});

export const selectCompletionRate = createSelector([selectTaskCounts], (counts) => {
  if (counts.total === 0) return 0;
  return Math.round((counts.done / counts.total) * 100);
});

export default tasksSlice.reducer;
