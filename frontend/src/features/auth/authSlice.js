import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utills/axiosInstance.js";
import { toast } from "sonner";

// --- Helpers ---
const storeAuthToLocal = (user) => {
  if (!user) return;

  // Get existing user data from localStorage
  const existingUser = getInitialUser();

  const {
    _id,
    id,
    name,
    email,
    profileImage,
    purchasedSongs = [],
    purchasedAlbums = [],
    likedsong = [],
    role,
    preferredGenres = [],
    createdAt,
    updatedAt,
    playlist = [],
    purchaseHistory = [],
    ...otherFields
  } = user;

  // Merge with existing data to preserve all fields
  const userToStore = {
    // Use existing data as fallback
    ...existingUser,
    // Override with new data
    _id: _id || id || existingUser?._id,
    id: id || _id || existingUser?.id,
    name: name || existingUser?.name,
    email: email || existingUser?.email,
    profileImage: profileImage !== undefined ? profileImage : existingUser?.profileImage,
    role: role || existingUser?.role,
    preferredGenres: preferredGenres.length > 0 ? preferredGenres : existingUser?.preferredGenres || [],
    createdAt: createdAt || existingUser?.createdAt,
    updatedAt: updatedAt || existingUser?.updatedAt,
    playlist: playlist.length > 0 ? playlist : existingUser?.playlist || [],
    purchaseHistory: purchaseHistory.length > 0 ? purchaseHistory : existingUser?.purchaseHistory || [],
    purchasedSongs,
    purchasedAlbums,
    likedsong,
    ...otherFields
  };

  console.log("Storing user to localStorage:", userToStore); // Debug log

  localStorage.setItem("user", JSON.stringify(userToStore));
};

const clearAuthFromLocal = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  localStorage.removeItem("subscribedArtists");
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
      console.log("Register response:", res.data.user); // Debug log
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
      localStorage.setItem("token", res.data.token);
      console.log("Login response:", res.data.user); // Debug log
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
    console.log("getMyProfile response:", res.data); // Debug log
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
      console.log("updatePreferredGenres response:", res.data); // Debug log
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
    addPurchase: (state, action) => {
      const { itemType, itemId } = action.payload;
      if (!state.user) return;

      if (itemType === "song") {
        if (!state.user.purchasedSongs.includes(itemId)) {
          state.user.purchasedSongs.push(itemId);
        }
      } else if (itemType === "album") {
        if (!state.user.purchasedAlbums.includes(itemId)) {
          state.user.purchasedAlbums.push(itemId);
        }
      }

      storeAuthToLocal(state.user);
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
        const user = action.payload;
        // Merge with existing user data to preserve all fields
        state.user = {
          ...state.user, // Preserve existing Redux state
          ...user, // Override with new API data
          purchasedSongs: user.purchasedSongs || state.user?.purchasedSongs || [],
          purchasedAlbums: user.purchasedAlbums || state.user?.purchasedAlbums || [],
          likedsong: user.likedsong || state.user?.likedsong || [],
        };
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
          // Update localStorage with current complete state
          storeAuthToLocal(state.user);
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
        // Update localStorage with current state
        storeAuthToLocal(state.user);
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

export const { clearMessage, addPurchase } = authSlice.actions;
export default authSlice.reducer;
