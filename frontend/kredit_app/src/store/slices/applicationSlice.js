import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

const initialState = {
  applications: [],
  currentApplication: null,
  users: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchUsers = createAsyncThunk(
  "application/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/users");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load users"
      );
    }
  }
);

export const fetchApplications = createAsyncThunk(
  "application/fetchApplications",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/applications");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load applications"
      );
    }
  }
);

export const fetchApplicationById = createAsyncThunk(
  "application/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/applications/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load application"
      );
    }
  }
);

export const deleteApplication = createAsyncThunk(
  "application/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/applications/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete application"
      );
    }
  }
);

export const createApplication = createAsyncThunk(
  "application/create",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post("/applications", payload);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create application"
      );
    }
  }
);

export const updateApplication = createAsyncThunk(
  "application/update",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/applications/${id}`, payload);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update application"
      );
    }
  }
);

const applicationSlice = createSlice({
  name: "application",
  initialState,
  reducers: {
    setApplications: (state, action) => {
      state.applications = action.payload;
    },
    setCurrentApplication: (state, action) => {
      state.currentApplication = action.payload;
    },
    setUsers: (state, action) => {
      state.users = action.payload;
    },
    removeApplication: (state, action) => {
      state.applications = state.applications.filter(
        (app) => app.id !== action.payload
      );
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Applications
      .addCase(fetchApplications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.applications = action.payload;
      })
      .addCase(fetchApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Application By ID
      .addCase(fetchApplicationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApplicationById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentApplication = action.payload;
      })
      .addCase(fetchApplicationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Application
      .addCase(deleteApplication.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteApplication.fulfilled, (state, action) => {
        state.loading = false;
        state.applications = state.applications.filter(
          (app) => app.id !== action.payload
        );
      })
      .addCase(deleteApplication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Application
      .addCase(createApplication.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createApplication.fulfilled, (state, action) => {
        state.loading = false;
        state.applications.push(action.payload);
      })
      .addCase(createApplication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Application
      .addCase(updateApplication.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateApplication.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.applications.findIndex(
          (app) => app.id === action.payload.id
        );
        if (index !== -1) {
          state.applications[index] = action.payload;
        }
      })
      .addCase(updateApplication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setApplications,
  setCurrentApplication,
  setUsers,
  removeApplication,
  setLoading,
  setError,
} = applicationSlice.actions;
export default applicationSlice.reducer;
