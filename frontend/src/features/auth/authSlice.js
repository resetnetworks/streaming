// features/auth/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utills/axiosInstance.js";
import { toast } from "sonner";

// ====================
// 📦 Local Storage Helpers
// ====================

const getInitialUser = () => {
  try {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch (err) {
    return null;
  }
};

const storeAuthToLocal = (user) => {
  if (!user) return;

  const existingUser = getInitialUser();

  const {
    name,
    email,
    profileImage,
    purchasedSongs = [],
    purchasedAlbums = [],
    likedsong = [],
    preferredGenres = [],
    playlist = [],
    purchaseHistory = [],
    subscribedArtists = [],
    ...otherFields
  } = user;

  const userToStore = {
    ...existingUser,
    name: name || existingUser?.name,
    email: email || existingUser?.email,
    profileImage: profileImage !== undefined ? profileImage : existingUser?.profileImage,
    preferredGenres: preferredGenres.length > 0 ? preferredGenres : existingUser?.preferredGenres || [],
    playlist: playlist.length > 0 ? playlist : existingUser?.playlist || [],
    purchaseHistory: purchaseHistory.length > 0 ? purchaseHistory : existingUser?.purchaseHistory || [],
     subscribedArtists: subscribedArtists.length > 0 
    ? subscribedArtists 
    : existingUser?.subscribedArtists || [],
    purchasedSongs,
    purchasedAlbums,
    likedsong,
    ...otherFields
  };

  localStorage.setItem("user", JSON.stringify(userToStore));
};

const clearAuthFromLocal = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  localStorage.removeItem("subscribedArtists");
  localStorage.removeItem('persist:root');
  localStorage.removeItem('persist:auth');
  localStorage.removeItem('persist:player');
  localStorage.clear();
  sessionStorage.clear();
};

// ====================
// 🔄 Async Thunks
// ====================

export const registerUser = createAsyncThunk("auth/register", async (userData, thunkAPI) => {
  try {    
    const res = await axios.post("/users/register", userData, {
      withCredentials: true,
    });
    
    const { user } = res.data;

    const getTokenFromCookie = () => {
      if (typeof document === 'undefined') return null;
      
      const cookies = document.cookie.split('; ');
      const tokenCookie = cookies.find(cookie => cookie.startsWith('token='));
      
      if (tokenCookie) {
        return tokenCookie.split('=')[1];
      }
      return null;
    };

    await new Promise(resolve => setTimeout(resolve, 100));
    
    const token = getTokenFromCookie();
    
    if (token) {
      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      
      try {
        await axios.get("/users/me", { withCredentials: true });
      } catch (tokenError) {
        console.error('❌ Token verification failed:', tokenError);
        throw new Error("Token verification failed after registration");
      }
    } else {
      try {
        const meResponse = await axios.get("/users/me", { withCredentials: true });
        if (meResponse.status !== 200) {
          throw new Error("Authentication verification failed");
        }
      } catch (meError) {
        console.error('❌ Authentication verification failed:', meError);
        throw new Error("Authentication failed after registration");
      }
    }

    storeAuthToLocal(user);
    return user;
    
  } catch (err) {
    console.error("❌ Registration error:", err?.response?.data?.message);
    
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
    
     const errorMessage = err.response?.data?.message || 
                        err.response?.data?.error ||
                        err.message || 
                        "Login failed";
    
    return thunkAPI.rejectWithValue(errorMessage);
  }
});

// features/auth/authSlice.js में loginUser function को update करें:

export const loginUser = createAsyncThunk("auth/login", async (userData, thunkAPI) => {
  try {
    const res = await axios.post("/users/login", userData, {
      withCredentials: true,
    });
    
    const { user } = res.data;

    const getTokenFromCookie = () => {
      if (typeof document === 'undefined') return null;
      const cookies = document.cookie.split('; ');
      const tokenCookie = cookies.find(cookie => cookie.startsWith('token='));
      return tokenCookie ? tokenCookie.split('=')[1] : null;
    };

    await new Promise(resolve => setTimeout(resolve, 100));
    const token = getTokenFromCookie();

    if (token) {
      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }

    storeAuthToLocal(user);
    return user;
    
  } catch (err) {
    // ✅ IMPROVED ERROR HANDLING
    let errorMessage = "Login failed";
    
    if (err.response) {
      // Server responded with error
      const { data, status } = err.response;
      
      if (status === 403) {
        errorMessage = data.message || "Invalid email or password";
      } else if (status === 400) {
        errorMessage = data.message || "Bad request";
      } else if (status === 500) {
        errorMessage = "Server error. Please try again later.";
      } else {
        errorMessage = data.message || `Error: ${status}`;
      }
    } else if (err.request) {
      // Request made but no response
      errorMessage = "No response from server. Check your internet connection.";
    } else {
      // Something else happened
      errorMessage = err.message || "An unexpected error occurred";
    }
    
    // ✅ Clear local storage on login error
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
    
    // ✅ Show toast notification (optional)
    if (typeof window !== 'undefined') {
      toast.error(errorMessage);
    }
    
    return thunkAPI.rejectWithValue(errorMessage);
  }
});

// 🆕 NEW: Social Login Success Handler
export const handleSocialLoginSuccess = createAsyncThunk(
  "auth/socialLoginSuccess", 
  async ({ isNewUser }, thunkAPI) => {
    try {
      
      // Get token from cookie
      const getTokenFromCookie = () => {
        if (typeof document === 'undefined') return null;
        const cookies = document.cookie.split('; ');
        const tokenCookie = cookies.find(cookie => cookie.startsWith('token='));
        return tokenCookie ? tokenCookie.split('=')[1] : null;
      };

      // Wait for cookie to be set by backend
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const token = getTokenFromCookie();
      
      if (token) {
        localStorage.setItem("token", token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }

      // Get user profile from backend /me endpoint
      const res = await axios.get("/users/me", { withCredentials: true });
      const user = res.data;


      // Store to localStorage using existing function
      storeAuthToLocal(user);
      
      return { user, isNewUser };
      
    } catch (err) {
      
      // Clear partial data on error
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      delete axios.defaults.headers.common["Authorization"];
      
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Social login failed");
    }
  }
);

export const getMyProfile = createAsyncThunk("auth/me", async (_, thunkAPI) => {
  try {
    const res = await axios.get("/users/me");
    return res.data;
  } catch (err) {
    if (err.response?.status === 401) {
      clearAuthFromLocal();
    }
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const logoutUser = createAsyncThunk("auth/logout", async (_, thunkAPI) => {
  try {
    const res = await axios.post("/users/logout");
    
    // Clear all persist data
    if (typeof window !== 'undefined' && window.__PERSISTOR__) {
      await window.__PERSISTOR__.purge();
      await window.__PERSISTOR__.flush();
    }
    clearAuthFromLocal();
    delete axios.defaults.headers.common["Authorization"];
    
    return res.data.message;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
  }
});


export const updatePreferredGenres = createAsyncThunk("auth/updatePreferredGenres", async (genres, thunkAPI) => {
  try {
    const res = await axios.put("/users/update-genres", { genres });
    return res.data.preferredGenres;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const toggleLikeSong = createAsyncThunk("auth/toggleLikeSong", async (songId, thunkAPI) => {
  try {
    const res = await axios.put(`/users/likedsong/${songId}`);
    return { songId, message: res.data.message };
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
  }
});

// ====================
// 🧠 Initial State
// ====================

const initialUser = getInitialUser();

const initialState = {
  user: initialUser,
  isAuthenticated: !!initialUser,
  status: "idle",
  error: null,
  message: null,
};

// ====================
// 🧩 Slice Definition
// ====================

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearMessage: (state) => {
      state.message = null;
      state.error = null;
    },
    addPurchase: (state, action) => {
      const { itemType, itemId } = action.payload;
      if (!state.user) return;

      if (itemType === "song" && !state.user.purchasedSongs.includes(itemId)) {
        state.user.purchasedSongs.push(itemId);
      }

      if (itemType === "album" && !state.user.purchasedAlbums.includes(itemId)) {
        state.user.purchasedAlbums.push(itemId);
      }

      storeAuthToLocal(state.user);
    },
    addPurchasedSong: (state, action) => {
      if (state.user) {
        if (!state.user.purchasedSongs) {
          state.user.purchasedSongs = [];
        }
        if (!state.user.purchasedSongs.includes(action.payload)) {
          state.user.purchasedSongs.push(action.payload);
        }
        storeAuthToLocal(state.user);
      }
    },
    addPurchasedAlbum: (state, action) => {
      if (state.user) {
        if (!state.user.purchasedAlbums) {
          state.user.purchasedAlbums = [];
        }
        if (!state.user.purchasedAlbums.includes(action.payload)) {
          state.user.purchasedAlbums.push(action.payload);
        }
        storeAuthToLocal(state.user);
      }
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
      // 🆕 NEW: Social Login Cases
      .addCase(handleSocialLoginSuccess.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(handleSocialLoginSuccess.fulfilled, (state, action) => {
        const { user, isNewUser } = action.payload;
        state.user = user;
        state.isAuthenticated = true;
        state.status = "succeeded";
        
        if (isNewUser) {
          state.message = "Social registration successful! Please select your genres.";
        } else {
          state.message = "Social login successful!";
        }
        
      })
      .addCase(handleSocialLoginSuccess.rejected, (state, action) => {
        state.user = null;
        state.isAuthenticated = false;
        state.status = "failed";
        state.error = action.payload || "Social login failed";
      })
      .addCase(getMyProfile.fulfilled, (state, action) => {
        const currentUser = state.user || {};
        const user = {
          name: action.payload.name || currentUser.name || "",
          email: action.payload.email || currentUser.email || "",
          profileImage: action.payload.profileImage || currentUser.profileImage || "",
          purchasedSongs: action.payload.purchasedSongs || [],
          purchasedAlbums: action.payload.purchasedAlbums || [],
          likedsong: action.payload.likedsong || [],
          preferredGenres: action.payload.preferredGenres || currentUser.preferredGenres || [],
        };

        state.user = user;
        state.isAuthenticated = true;
        state.status = "succeeded";
        storeAuthToLocal(user);
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
          storeAuthToLocal(state.user);
        }
        state.status = "succeeded";
        state.message = "Preferred genres updated";
      })
      .addCase(updatePreferredGenres.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to update genres";
      })
      .addCase(toggleLikeSong.fulfilled, (state, action) => {
        const { songId, message } = action.payload;
        if (!state.user?.likedsong) state.user.likedsong = [];

        const alreadyLiked = state.user.likedsong.includes(songId);
        state.user.likedsong = alreadyLiked
          ? state.user.likedsong.filter((id) => id !== songId)
          : [...state.user.likedsong, songId];

        storeAuthToLocal(state.user);
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

export const { clearMessage, addPurchase, addPurchasedSong, addPurchasedAlbum } = authSlice.actions;
export default authSlice.reducer;
