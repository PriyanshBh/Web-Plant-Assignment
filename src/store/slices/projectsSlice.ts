import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiClient, ApiError } from "@/lib/api-client";
import { IProjectResponse } from "@/models/Project";
import { ProjectCreateInput, ProjectUpdateInput } from "@/lib/validators";

export interface ProjectsState {
  items: IProjectResponse[];
  currentProject: IProjectResponse | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: ProjectsState = {
  items: [],
  currentProject: null,
  status: "idle",
  error: null,
};

export const fetchProjects = createAsyncThunk<
  IProjectResponse[],
  void,
  { rejectValue: string }
>("projects/fetchProjects", async (_, { rejectWithValue }) => {
  try {
    return await apiClient<IProjectResponse[]>("/api/projects");
  } catch (err: unknown) {
    if (err instanceof ApiError) return rejectWithValue(err.message);
    return rejectWithValue("Failed to load projects");
  }
});

export const fetchProject = createAsyncThunk<
  IProjectResponse,
  string,
  { rejectValue: string }
>("projects/fetchProject", async (id, { rejectWithValue }) => {
  try {
    return await apiClient<IProjectResponse>(`/api/projects/${id}`);
  } catch (err: unknown) {
    if (err instanceof ApiError) return rejectWithValue(err.message);
    return rejectWithValue("Failed to load project details");
  }
});

export const createProject = createAsyncThunk<
  IProjectResponse,
  ProjectCreateInput,
  { rejectValue: string }
>("projects/createProject", async (data, { rejectWithValue }) => {
  try {
    return await apiClient<IProjectResponse>("/api/projects", {
      method: "POST",
      body: JSON.stringify(data),
    });
  } catch (err: unknown) {
    if (err instanceof ApiError) return rejectWithValue(err.message);
    return rejectWithValue("Failed to create project");
  }
});

export const updateProject = createAsyncThunk<
  IProjectResponse,
  { id: string; data: ProjectUpdateInput },
  { rejectValue: string }
>("projects/updateProject", async ({ id, data }, { rejectWithValue }) => {
  try {
    return await apiClient<IProjectResponse>(`/api/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  } catch (err: unknown) {
    if (err instanceof ApiError) return rejectWithValue(err.message);
    return rejectWithValue("Failed to update project");
  }
});

export const deleteProject = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("projects/deleteProject", async (id, { rejectWithValue }) => {
  try {
    await apiClient<{ id: string }>(`/api/projects/${id}`, {
      method: "DELETE",
    });
    return id;
  } catch (err: unknown) {
    if (err instanceof ApiError) return rejectWithValue(err.message);
    return rejectWithValue("Failed to delete project");
  }
});

export const projectsSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    setCurrentProject(state, action: PayloadAction<IProjectResponse | null>) {
      state.currentProject = action.payload;
    },
    updateProjectCounts(
      state,
      action: PayloadAction<{
        projectId: string;
        taskCounts: NonNullable<IProjectResponse["taskCounts"]>;
      }>
    ) {
      const { projectId, taskCounts } = action.payload;
      const index = state.items.findIndex((p) => p.id === projectId);
      if (index !== -1) {
        state.items[index].taskCounts = taskCounts;
      }
      if (state.currentProject && state.currentProject.id === projectId) {
        state.currentProject.taskCounts = taskCounts;
      }
    },
  },
  extraReducers: (builder) => {
    // fetchProjects
    builder.addCase(fetchProjects.pending, (state) => {
      state.status = "loading";
      state.error = null;
    });
    builder.addCase(
      fetchProjects.fulfilled,
      (state, action: PayloadAction<IProjectResponse[]>) => {
        state.status = "succeeded";
        state.items = action.payload;
      }
    );
    builder.addCase(fetchProjects.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload || "Failed to load projects";
    });

    // fetchProject
    builder.addCase(
      fetchProject.fulfilled,
      (state, action: PayloadAction<IProjectResponse>) => {
        state.currentProject = action.payload;
      }
    );

    // createProject
    builder.addCase(
      createProject.fulfilled,
      (state, action: PayloadAction<IProjectResponse>) => {
        state.items.unshift(action.payload);
      }
    );

    // updateProject
    builder.addCase(
      updateProject.fulfilled,
      (state, action: PayloadAction<IProjectResponse>) => {
        const index = state.items.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentProject && state.currentProject.id === action.payload.id) {
          state.currentProject = action.payload;
        }
      }
    );

    // deleteProject
    builder.addCase(deleteProject.fulfilled, (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((p) => p.id !== action.payload);
      if (state.currentProject && state.currentProject.id === action.payload) {
        state.currentProject = null;
      }
    });
  },
});

export const { setCurrentProject, updateProjectCounts } = projectsSlice.actions;
export default projectsSlice.reducer;
