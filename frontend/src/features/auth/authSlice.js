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
    console.error("Failed to parse user from localStorage", err);
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
};


// ====================
// 🔄 Async Thunks
// ====================


export const registerUser = createAsyncThunk("auth/register", async (userData, thunkAPI) => {
  try {    
    const res = await axios.post("/users/register", userData, {
      withCredentials: true, // ✅ Important for cookie handling
    });
    
    const { user } = res.data;


    // ✅ Function to get token from cookie
    const getTokenFromCookie = () => {
      if (typeof document === 'undefined') return null;
      
      const cookies = document.cookie.split('; ');
      const tokenCookie = cookies.find(cookie => cookie.startsWith('token='));
      
      if (tokenCookie) {
        return tokenCookie.split('=')[1];
      }
      return null;
    };


    // ✅ Wait a bit for cookie to be set by server
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const token = getTokenFromCookie();
    
    if (token) {
      
      // Store token in localStorage for axios headers
      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      
      // Verify token works
      try {
        await axios.get("/users/me", { withCredentials: true });
      } catch (tokenError) {
        console.error('❌ Token verification failed:', tokenError);
        throw new Error("Token verification failed after registration");
      }
      
    } else {
      
      // Try to verify authentication via cookie
      try {
        const meResponse = await axios.get("/users/me", { withCredentials: true });
        if (meResponse.status === 200) {
        } else {
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
    console.error("❌ Registration error:", err);
    
    // Clear any partial data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
    
    const errorMessage = err.response?.data?.message || 
                        err.message || 
                        "Registration failed";
    
    return thunkAPI.rejectWithValue(errorMessage);
  }
});


// ✅ Also update loginUser similarly
export const loginUser = createAsyncThunk("auth/login", async (userData, thunkAPI) => {
  try {
    const res = await axios.post("/users/login", userData, {
      withCredentials: true,
    });
    
    const { user } = res.data;


    // Get token from cookie
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
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
  }
});



export const getMyProfile = createAsyncThunk("auth/me", async (_, thunkAPI) => {
  try {
    const res = await axios.get("/users/me");
    return res.data;
  } catch (err) {
    // Only clear on 401
    if (err.response?.status === 401) {
      clearAuthFromLocal();
    }
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
  }
});


export const logoutUser = createAsyncThunk("auth/logout", async (_, thunkAPI) => {
  try {
    const res = await axios.post("/users/logout");
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
    // ✅ NEW ACTIONS ADDED
    addPurchasedSong: (state, action) => {
      if (state.user) {
        // Initialize array if it doesn't exist
        if (!state.user.purchasedSongs) {
          state.user.purchasedSongs = [];
        }
        // Add song ID if not already present
        if (!state.user.purchasedSongs.includes(action.payload)) {
          state.user.purchasedSongs.push(action.payload);
        }
        storeAuthToLocal(state.user);
      }
    },
    addPurchasedAlbum: (state, action) => {
      if (state.user) {
        // Initialize array if it doesn't exist
        if (!state.user.purchasedAlbums) {
          state.user.purchasedAlbums = [];
        }
        // Add album ID if not already present
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
