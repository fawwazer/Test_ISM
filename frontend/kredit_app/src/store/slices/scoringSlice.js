import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

const initialState = {
  categories: [],
  scores: {},
  loading: false,
  error: null,
};

// Async thunk for fetching scoring structure
export const fetchScoringStructure = createAsyncThunk(
  "scoring/fetchStructure",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/scoring-structure");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load scoring structure"
      );
    }
  }
);

const scoringSlice = createSlice({
  name: "scoring",
  initialState,
  reducers: {
    setCategories: (state, action) => {
      state.categories = action.payload;
    },
    setScore: (state, action) => {
      const { criteriaId, scoreOptionId } = action.payload;
      state.scores[criteriaId] = scoreOptionId;
    },
    setScores: (state, action) => {
      state.scores = action.payload;
    },
    clearScores: (state) => {
      state.scores = {};
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
      .addCase(fetchScoringStructure.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchScoringStructure.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchScoringStructure.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setCategories,
  setScore,
  setScores,
  clearScores,
  setLoading,
  setError,
} = scoringSlice.actions;
export default scoringSlice.reducer;
