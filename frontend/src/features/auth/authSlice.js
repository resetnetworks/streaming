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
    _id, // ✅ Ensure _id is included
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
    _id: _id || existingUser?._id, // ✅ Preserve _id
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

// ✅ Enhanced token management functions
const getTokenFromCookie = () => {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split('; ');
  const tokenCookie = cookies.find(cookie => cookie.startsWith('token='));
  
  if (tokenCookie) {
    return tokenCookie.split('=')[1];
  }
  return null;
};

const getTokenFromResponse = (response) => {
  // Try multiple ways to get token from response
  if (response.data?.token) {
    return response.data.token;
  }
  if (response.headers?.authorization) {
    return response.headers.authorization.replace('Bearer ', '');
  }
  if (response.headers?.Authorization) {
    return response.headers.Authorization.replace('Bearer ', '');
  }
  return null;
};

const storeTokenAndSetHeaders = (token) => {
  if (token) {
    console.log('✅ Storing token in localStorage:', token.substring(0, 10) + '...');
    localStorage.setItem("token", token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    return true;
  }
  return false;
};

const waitForCookie = async (maxAttempts = 5, delay = 100) => {
  for (let i = 0; i < maxAttempts; i++) {
    const token = getTokenFromCookie();
    if (token) {
      return token;
    }
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  return null;
};

// ====================
// 🔄 Enhanced Async Thunks
// ====================

export const registerUser = createAsyncThunk("auth/register", async (userData, thunkAPI) => {
  try {    
    console.log('🚀 Starting registration process...');
    
    const res = await axios.post("/users/register", userData, {
      withCredentials: true,
    });
    
    const { user } = res.data;
    console.log('✅ Registration API successful, user received:', !!user);

    // ✅ Enhanced token retrieval with multiple fallbacks
    let token = null;
    
    // Method 1: Try to get token from response directly
    token = getTokenFromResponse(res);
    if (token) {
      console.log('✅ Token found in response headers');
    }
    
    // Method 2: Wait for cookie to be set by server
    if (!token) {
      console.log('⏳ Waiting for token in cookies...');
      token = await waitForCookie();
      if (token) {
        console.log('✅ Token found in cookies after waiting');
      }
    }
    
    // Method 3: Check localStorage if token was set by interceptor
    if (!token) {
      token = localStorage.getItem('token');
      if (token) {
        console.log('✅ Token found in localStorage');
      }
    }
    
    // ✅ Store token and set headers
    if (token) {
      storeTokenAndSetHeaders(token);
      
      // Verify token works
      try {
        console.log('🔍 Verifying token with server...');
        const verifyResponse = await axios.get("/users/me", { 
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Token verification successful');
      } catch (tokenError) {
        console.error('❌ Token verification failed:', tokenError);
        console.warn('⚠️ Proceeding despite token verification failure');
      }
      
    } else {
      console.warn('⚠️ No token found, trying cookie-only authentication...');
      
      // Try to verify authentication via cookie-only
      try {
        const meResponse = await axios.get("/users/me", { withCredentials: true });
        if (meResponse.status === 200) {
          console.log('✅ Cookie-only authentication verified');
        } else {
          throw new Error("Authentication verification failed");
        }
      } catch (meError) {
        console.error('❌ Authentication verification failed:', meError);
        throw new Error("Authentication failed after registration");
      }
    }

    // ✅ Ensure user has _id field
    const userWithId = {
      ...user,
      _id: user._id || user.id
    };

    storeAuthToLocal(userWithId);
    
    console.log('✅ Registration process completed successfully');
    return userWithId;
    
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

export const loginUser = createAsyncThunk("auth/login", async (userData, thunkAPI) => {
  try {
    console.log('🚀 Starting login process...');
    
    const res = await axios.post("/users/login", userData, {
      withCredentials: true,
    });
    
    const { user, token } = res.data; // ✅ Also try to get token from response
    console.log('✅ Login API successful:', { hasUser: !!user, hasToken: !!token });

    // ✅ Enhanced token retrieval with multiple fallbacks
    let authToken = token || getTokenFromResponse(res) || null;
    
    // Method 2: Wait for cookie if no direct token
    if (!authToken) {
      console.log('⏳ Waiting for token in cookies...');
      authToken = await waitForCookie();
      if (authToken) {
        console.log('✅ Token found in cookies after waiting');
      }
    }
    
    // Method 3: Check localStorage if token was set by interceptor
    if (!authToken) {
      authToken = localStorage.getItem('token');
      if (authToken) {
        console.log('✅ Token found in localStorage');
      }
    }
    
    // ✅ Store token and set headers (always attempt in all environments)
    if (authToken) {
      storeTokenAndSetHeaders(authToken);
      
      // Verify token works
      try {
        console.log('🔍 Verifying token with server...');
        const verifyResponse = await axios.get("/users/me", { 
          withCredentials: true,
          headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('✅ Token verification successful');
      } catch (tokenError) {
        console.error('❌ Token verification failed:', tokenError);
        console.warn('⚠️ Proceeding despite token verification failure');
      }
    } else {
      console.warn('⚠️ No token found, trying cookie-only authentication...');
      
      // Try to verify authentication via cookie-only
      try {
        const meResponse = await axios.get("/users/me", { withCredentials: true });
        if (meResponse.status === 200) {
          console.log('✅ Cookie-only authentication verified');
        }
      } catch (meError) {
        console.error('❌ Cookie authentication verification failed:', meError);
      }
    }

    // ✅ Ensure user has _id field
    const userWithId = {
      ...user,
      _id: user._id || user.id
    };

    storeAuthToLocal(userWithId);
    
    console.log('✅ Login process completed successfully:', { 
      userId: userWithId._id, 
      hasToken: !!authToken 
    });
    
    return userWithId;
    
  } catch (err) {
    console.error("❌ Login error:", err);
    
    // Clear any partial data on error
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
    
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
    
    // Clear cookies as well
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    
    return res.data.message;
  } catch (err) {
    // Clear auth data even if logout request fails
    clearAuthFromLocal();
    delete axios.defaults.headers.common["Authorization"];
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

// ✅ New action to restore session on app load
export const restoreSession = createAsyncThunk("auth/restoreSession", async (_, thunkAPI) => {
  try {
    console.log('🔄 Attempting to restore session...');
    
    // Check if we have user in localStorage
    const localUser = getInitialUser();
    if (!localUser) {
      throw new Error('No user found in localStorage');
    }
    
    // Check for token in localStorage or cookies
    let token = localStorage.getItem('token') || getTokenFromCookie();
    
    if (token) {
      storeTokenAndSetHeaders(token);
    }
    
    // Verify with server
    const response = await axios.get('/users/me', { withCredentials: true });
    
    // ✅ Ensure returned user has _id
    const userWithId = {
      ...response.data,
      _id: response.data._id || response.data.id
    };
    
    console.log('✅ Session restored successfully');
    return userWithId;
    
  } catch (error) {
    console.log('❌ Session restore failed:', error.message);
    clearAuthFromLocal();
    return thunkAPI.rejectWithValue('Session restore failed');
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
// 🧩 Enhanced Slice Definition
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
    // ✅ New reducer to clear auth state
    clearAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.status = "idle";
      state.error = null;
      state.message = null;
      clearAuthFromLocal();
      delete axios.defaults.headers.common["Authorization"];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.fulfilled, (state, action) => {
        // ✅ Ensure user has _id
        const user = {
          ...action.payload,
          _id: action.payload._id || action.payload.id
        };
        
        state.user = user;
        state.isAuthenticated = true;
        state.status = "succeeded";
        state.message = "Registered successfully";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        // ✅ Ensure user has _id
        const user = {
          ...action.payload,
          _id: action.payload._id || action.payload.id
        };
        
        state.user = user;
        state.isAuthenticated = true;
        state.status = "succeeded";
        state.message = "Logged in successfully";
        state.error = null;
      })
      .addCase(getMyProfile.fulfilled, (state, action) => {
        const currentUser = state.user || {};
        
        // ✅ Ensure _id is included and preserved
        const user = {
          ...currentUser, // Preserve existing user data
          _id: action.payload._id || action.payload.id || currentUser._id,
          name: action.payload.name || currentUser.name || "",
          email: action.payload.email || currentUser.email || "",
          profileImage: action.payload.profileImage || currentUser.profileImage || "",
          purchasedSongs: action.payload.purchasedSongs || currentUser.purchasedSongs || [],
          purchasedAlbums: action.payload.purchasedAlbums || currentUser.purchasedAlbums || [],
          likedsong: action.payload.likedsong || currentUser.likedsong || [],
          preferredGenres: action.payload.preferredGenres || currentUser.preferredGenres || [],
          playlist: action.payload.playlist || currentUser.playlist || [],
          purchaseHistory: action.payload.purchaseHistory || currentUser.purchaseHistory || [],
        };

        state.user = user;
        state.isAuthenticated = true;
        state.status = "succeeded";
        state.error = null;
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
        state.error = null;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        // ✅ Ensure user has _id
        const user = {
          ...action.payload,
          _id: action.payload._id || action.payload.id
        };
        
        state.user = user;
        state.isAuthenticated = true;
        state.status = "succeeded";
        state.error = null;
        storeAuthToLocal(user);
      })
      .addCase(restoreSession.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.status = "idle";
      })
      .addCase(updatePreferredGenres.fulfilled, (state, action) => {
        if (state.user) {
          state.user.preferredGenres = action.payload;
          storeAuthToLocal(state.user);
        }
        state.status = "succeeded";
        state.message = "Preferred genres updated";
        state.error = null;
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
          !action.type.includes("toggleLikeSong") &&
          !action.type.includes("restoreSession"),
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

export const { clearMessage, addPurchase, clearAuth } = authSlice.actions;
export default authSlice.reducer;
