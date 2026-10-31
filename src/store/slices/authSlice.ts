import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiClient, ApiError } from "@/lib/api-client";
import { IUserResponse } from "@/models/User";
import { SignupInput, LoginInput } from "@/lib/validators";

export interface AuthState {
  user: IUserResponse | null;
  status: "idle" | "loading" | "authenticated" | "unauthenticated";
  error: string | null;
  fieldErrors: Record<string, string> | null;
}

const initialState: AuthState = {
  user: null,
  status: "idle",
  error: null,
  fieldErrors: null,
};

export const fetchMe = createAsyncThunk<
  IUserResponse,
  void,
  { rejectValue: { message: string } }
>("auth/fetchMe", async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient<{ user: IUserResponse }>("/api/auth/me");
    return res.user;
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return rejectWithValue({ message: err.message });
    }
    return rejectWithValue({ message: "Failed to verify session" });
  }
});

export const signup = createAsyncThunk<
  IUserResponse,
  SignupInput,
  { rejectValue: { message: string; fields?: Record<string, string> } }
>("auth/signup", async (payload, { rejectWithValue }) => {
  try {
    const res = await apiClient<{ user: IUserResponse; token: string }>(
      "/api/auth/signup",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
    return res.user;
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return rejectWithValue({ message: err.message, fields: err.fields });
    }
    return rejectWithValue({ message: "Signup failed. Please try again." });
  }
});

export const login = createAsyncThunk<
  IUserResponse,
  LoginInput,
  { rejectValue: { message: string; fields?: Record<string, string> } }
>("auth/login", async (payload, { rejectWithValue }) => {
  try {
    const res = await apiClient<{ user: IUserResponse; token: string }>(
      "/api/auth/login",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
    return res.user;
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return rejectWithValue({ message: err.message, fields: err.fields });
    }
    return rejectWithValue({ message: "Login failed. Please try again." });
  }
});

export const logout = createAsyncThunk<void, void>("auth/logout", async () => {
  try {
    await apiClient("/api/auth/logout", { method: "POST" });
  } catch {
    // Ignore error on logout
  }
});

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
      state.fieldErrors = null;
    },
    setUnauthenticated(state) {
      state.user = null;
      state.status = "unauthenticated";
      state.error = null;
      state.fieldErrors = null;
    },
  },
  extraReducers: (builder) => {
    // fetchMe
    builder.addCase(fetchMe.pending, (state) => {
      state.status = "loading";
    });
    builder.addCase(fetchMe.fulfilled, (state, action: PayloadAction<IUserResponse>) => {
      state.status = "authenticated";
      state.user = action.payload;
      state.error = null;
    });
    builder.addCase(fetchMe.rejected, (state) => {
      state.status = "unauthenticated";
      state.user = null;
    });

    // signup
    builder.addCase(signup.pending, (state) => {
      state.status = "loading";
      state.error = null;
      state.fieldErrors = null;
    });
    builder.addCase(signup.fulfilled, (state, action: PayloadAction<IUserResponse>) => {
      state.status = "authenticated";
      state.user = action.payload;
      state.error = null;
      state.fieldErrors = null;
    });
    builder.addCase(signup.rejected, (state, action) => {
      state.status = "unauthenticated";
      state.error = action.payload?.message || "Signup failed";
      state.fieldErrors = action.payload?.fields || null;
    });

    // login
    builder.addCase(login.pending, (state) => {
      state.status = "loading";
      state.error = null;
      state.fieldErrors = null;
    });
    builder.addCase(login.fulfilled, (state, action: PayloadAction<IUserResponse>) => {
      state.status = "authenticated";
      state.user = action.payload;
      state.error = null;
      state.fieldErrors = null;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.status = "unauthenticated";
      state.error = action.payload?.message || "Invalid email or password";
      state.fieldErrors = action.payload?.fields || null;
    });

    // logout
    builder.addCase(logout.fulfilled, (state) => {
      state.status = "unauthenticated";
      state.user = null;
      state.error = null;
      state.fieldErrors = null;
    });
  },
});

export const { clearAuthError, setUnauthenticated } = authSlice.actions;
export default authSlice.reducer;
