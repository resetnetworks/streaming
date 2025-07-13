import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utills/axiosInstance.js";
import { toast } from "sonner";

// --- Helpers ---
const storeAuthToLocal = (user) => {
  if (!user) return;
  const { _id, name, email, role, profileImage } = user;
  localStorage.setItem(
    "user",
    JSON.stringify({ _id, name, email, role, profileImage })
  );
};

const clearAuthFromLocal = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
};

const getInitialUser = () => {
  try {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

// --- Thunks ---

export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, thunkAPI) => {
    try {
      const res = await axios.post("/users/register", userData);
      localStorage.setItem("token", res.data.token);
      storeAuthToLocal(res.data.user);
      return res.data.user;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (userData, thunkAPI) => {
    try {
      const res = await axios.post("/users/login", userData);
      storeAuthToLocal(res.data.user);
      return res.data.user;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

export const getMyProfile = createAsyncThunk("auth/me", async (_, thunkAPI) => {
  try {
    const res = await axios.get("/users/me");
    storeAuthToLocal(res.data);
    return res.data;
  } catch (err) {
    clearAuthFromLocal();
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, thunkAPI) => {
    try {
      const res = await axios.post("/users/logout");
      clearAuthFromLocal();
      return res.data.message;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

export const updatePreferredGenres = createAsyncThunk(
  "auth/updatePreferredGenres",
  async (genres, thunkAPI) => {
    try {
      const res = await axios.put("/users/update-genres", { genres });
      return res.data.preferredGenres;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

export const toggleLikeSong = createAsyncThunk(
  "auth/toggleLikeSong",
  async (songId, thunkAPI) => {
    try {
      const res = await axios.put(`/users/likedsong/${songId}`);
      return { songId, message: res.data.message };
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

// --- Initial State ---

const initialUser = getInitialUser();

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: initialUser,
    isAuthenticated: !!initialUser,
    status: "idle",
    error: null,
    message: null,
  },
  reducers: {
    clearMessage: (state) => {
      state.message = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.status = "succeeded";
        state.message = "Registered successfully";
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.status = "succeeded";
        state.message = "Logged in successfully";
      })
      .addCase(getMyProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.status = "succeeded";
      })
      .addCase(getMyProfile.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.status = "failed";
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.status = "succeeded";
        state.message = "Logged out successfully";
      })
      .addCase(updatePreferredGenres.fulfilled, (state, action) => {
        if (state.user) {
          state.user.preferredGenres = action.payload;
        }
        state.status = "succeeded";
        state.message = "Preferred genres updated successfully";
      })
      .addCase(updatePreferredGenres.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to update preferred genres";
      })
      .addCase(toggleLikeSong.fulfilled, (state, action) => {
        const { songId, message } = action.payload;

        if (!state.user.likedsong) state.user.likedsong = [];

        const alreadyLiked = state.user.likedsong.includes(songId);
        state.user.likedsong = alreadyLiked
          ? state.user.likedsong.filter((id) => id !== songId)
          : [...state.user.likedsong, songId];

        state.message = message;
      })
      .addMatcher(
        (action) =>
          action.type.startsWith("auth/") &&
          action.type.endsWith("/rejected") &&
          !action.type.includes("toggleLikeSong"),
        (state, action) => {
          state.status = "failed";
          state.error = action.payload || "Something went wrong";
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("auth/") &&
          action.type.endsWith("/pending") &&
          !action.type.includes("toggleLikeSong"),
        (state) => {
          state.status = "loading";
          state.error = null;
        }
      );
  },
});

export const { clearMessage } = authSlice.actions;
export default authSlice.reducer;
