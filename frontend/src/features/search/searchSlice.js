// src/features/search/searchSlice.js
import { createSlice } from "@reduxjs/toolkit";
import axios from "../../utills/axiosInstance"; // adjust path as needed

const initialState = {
  loading: false,
  error: null,
  results: {
    artists: { results: [], total: 0, page: 1, pages: 0 },
    songs: { results: [], total: 0, page: 1, pages: 0 },
    albums: { results: [], total: 0, page: 1, pages: 0 },
  },
};

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    fetchSearchStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchSearchSuccess: (state, action) => {
      state.loading = false;
      state.results = action.payload;
      state.error = null;
    },
    fetchSearchFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearSearchResults: (state) => {
      state.results = initialState.results;
      state.error = null;
      state.loading = false;
    },
  },
});

export const {
  fetchSearchStart,
  fetchSearchSuccess,
  fetchSearchFailure,
  clearSearchResults,
} = searchSlice.actions;

export default searchSlice.reducer;

// Thunk: Unified Search API
export const fetchUnifiedSearchResults = (query, page = 1, limit = 10) => async (dispatch) => {
  try {
    dispatch(fetchSearchStart());

    const response = await axios.get("/search", {
      params: { q: query, page, limit },
    });

    dispatch(fetchSearchSuccess(response.data));
  } catch (error) {
    dispatch(
      fetchSearchFailure(error.response?.data?.message || "Search failed")
    );
  }
};
