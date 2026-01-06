import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utills/axiosInstance";

// Thunks
export const fetchAllArtists = createAsyncThunk(
  "artists/fetchAll",
  async ({ page = 1, limit = 10 } = {}, thunkAPI) => {
    try {
      const res = await axios.get(`/artists?page=${page}&limit=${limit}`);
      return {
        artists: res.data.artists,
        pagination: res.data.pagination,
      };
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch artists"
      );
    }
  }
);

export const fetchAllArtistsNoPagination = createAsyncThunk(
  "artists/fetchAllNoPagination",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get(`/artists/all`);
      return res.data.artists;
    } catch (err) {
      console.error("Error fetching artists:", err.response?.data || err.message);
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch all artists"
      );
    }
  }
);

export const fetchArtistBySlug = createAsyncThunk(
  "artists/fetchById",
  async (id, thunkAPI) => {
    try {
      const res = await axios.get(`/artists/${id}`);
      return res.data.artist;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch artist"
      );
    }
  }
);

// NEW: Fetch artist's own profile
export const fetchArtistProfile = createAsyncThunk(
  "artists/fetchProfile",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get("/artists/profile/me");
      return res.data.data; // Return the data object from response
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch artist profile"
      );
    }
  }
);

export const createArtist = createAsyncThunk(
  "artists/create",
  async (formData, thunkAPI) => {
    try {
      const res = await axios.post("/artists", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data.artist;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to create artist"
      );
    }
  }
);



// NEW: Update artist's own profile
export const updateArtistProfile = createAsyncThunk(
  "artists/updateProfile",
  async ({ id, formData }, thunkAPI) => { // Destructure parameters properly
    try {
      const res = await axios.put(`/artists/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data.artist || res.data.data; // Return updated artist data
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to update artist profile"
      );
    }
  }
);

export const deleteArtist = createAsyncThunk(
  "artists/delete",
  async (id, thunkAPI) => {
    try {
      await axios.delete(`/artists/${id}`);
      return id;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to delete artist"
      );
    }
  }
);

export const fetchRandomArtistWithSongs = createAsyncThunk(
  "artists/fetchRandomArtistWithSongs",
  async ({ page = 1, limit = 10 } = {}, thunkAPI) => {
    try {
      const res = await axios.get(
        `/discover/random-artist?page=${page}&limit=${limit}`
      );
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch random artist"
      );
    }
  }
);

export const searchArtists = createAsyncThunk(
  "artists/search",
  async ({ query, page = 1, limit = 10 }, thunkAPI) => {
    try {
      const res = await axios.get(
        `/artists?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
      );
      return {
        artists: res.data.results,
        pagination: {
          page: res.data.page,
          limit,
          total: res.data.total,
          totalPages: res.data.pages,
        },
      };
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to search artists"
      );
    }
  }
);

export const fetchSubscriberCount = createAsyncThunk(
  "artists/fetchSubscriberCount",
  async (artistId, thunkAPI) => {
    try {
      const res = await axios.get(`/admin/dashboard/subscriber-count/${artistId}`);
      return {
        artistId,
        ...res.data
      };
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch subscriber count"
      );
    }
  }
);

// Slice
const artistSlice = createSlice({
  name: "artists",
  initialState: {
    allArtists: [],
    fullArtistList: [],
    selectedArtist: null,
    artistProfile: null, // NEW: Store for artist's own profile
    randomArtist: null,
    randomArtistSongs: [],
    randomArtistPagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
    loading: false,
    profileLoading: false, // NEW: Separate loading for profile
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
    isCached: false,
    lastFetchTime: null,
    cachedPages: [],
    cachedData: {},
    isFullListCached: false,
    fullListLastFetchTime: null,
    subscriberCounts: {},
    subscriberCountLoading: false,
    subscriberCountError: null,
  },
  reducers: {
    clearSelectedArtist: (state) => {
      state.selectedArtist = null;
      state.loading = true;
    },
    clearArtistProfile: (state) => { // NEW: Clear artist profile
      state.artistProfile = null;
    },
    clearCache: (state) => {
      state.allArtists = [];
      state.isCached = false;
      state.lastFetchTime = null;
      state.cachedPages = [];
      state.cachedData = {};
      state.pagination = {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      };
    },
    clearFullListCache: (state) => {
      state.fullArtistList = [];
      state.isFullListCached = false;
      state.fullListLastFetchTime = null;
    },
    clearAllCaches: (state) => {
      state.allArtists = [];
      state.isCached = false;
      state.lastFetchTime = null;
      state.cachedPages = [];
      state.cachedData = {};
      state.pagination = {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      };
      state.fullArtistList = [];
      state.isFullListCached = false;
      state.fullListLastFetchTime = null;
      state.artistProfile = null; // Also clear profile cache
    },
    setCachedData: (state, action) => {
      const { page, artists, pagination } = action.payload;
      state.cachedData[page] = { artists, pagination };
      if (!state.cachedPages.includes(page)) {
        state.cachedPages.push(page);
      }
    },
    loadFromCache: (state, action) => {
      const page = action.payload;
      if (state.cachedData[page]) {
        state.allArtists = state.cachedData[page].artists;
        state.pagination = state.cachedData[page].pagination;
      }
    },
    loadFullListFromCache: (state) => {
      state.loading = false;
    },
    clearSubscriberCount: (state, action) => {
      if (action.payload) {
        delete state.subscriberCounts[action.payload];
      } else {
        state.subscriberCounts = {};
      }
    },
    // Helper to update selectedArtist in state when editing
    updateSelectedArtistLocally: (state, action) => {
      if (state.selectedArtist && state.selectedArtist._id === action.payload._id) {
        state.selectedArtist = { ...state.selectedArtist, ...action.payload };
      }
    },
    // NEW: Helper to update artistProfile in state when editing
    updateArtistProfileLocally: (state, action) => {
      if (state.artistProfile) {
        state.artistProfile = { ...state.artistProfile, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllArtists.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllArtists.fulfilled, (state, action) => {
        state.loading = false;
        state.allArtists = action.payload.artists;
        state.pagination = action.payload.pagination;
        state.isCached = true;
        state.lastFetchTime = Date.now();
        const page = action.payload.pagination.page;
        state.cachedData[page] = {
          artists: action.payload.artists,
          pagination: action.payload.pagination,
        };
        if (!state.cachedPages.includes(page)) {
          state.cachedPages.push(page);
        }
      })
      .addCase(fetchAllArtists.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchAllArtistsNoPagination.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllArtistsNoPagination.fulfilled, (state, action) => {
        state.loading = false;
        state.fullArtistList = action.payload;
        state.isFullListCached = true;
        state.fullListLastFetchTime = Date.now();
      })
      .addCase(fetchAllArtistsNoPagination.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchArtistBySlug.pending, (state) => {
        state.selectedArtist = null;
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchArtistBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedArtist = action.payload;
      })
      .addCase(fetchArtistBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // NEW: Handle fetchArtistProfile actions
      .addCase(fetchArtistProfile.pending, (state) => {
        state.profileLoading = true;
        state.error = null;
      })
      .addCase(fetchArtistProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.artistProfile = action.payload;
      })
      .addCase(fetchArtistProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.error = action.payload;
      })

      .addCase(createArtist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createArtist.fulfilled, (state, action) => {
        state.loading = false;
        state.allArtists.push(action.payload);
        state.isCached = false;
        state.cachedPages = [];
        state.cachedData = {};
        state.isFullListCached = false;
        state.fullListLastFetchTime = null;
      })
      .addCase(createArtist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })



      // NEW: Handle updateArtistProfile actions
      .addCase(updateArtistProfile.pending, (state) => {
        state.profileLoading = true;
        state.error = null;
      })
      .addCase(updateArtistProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.artistProfile = action.payload;
        
        // Also update in allArtists array if exists
        const index = state.allArtists.findIndex(a => a._id === action.payload.id);
        if (index !== -1) {
          // Map the profile response to match artist format
          const updatedArtist = {
            ...state.allArtists[index],
            name: action.payload.name,
            bio: action.payload.bio,
            location: action.payload.location,
            country: action.payload.country,
            profileImage: action.payload.profileImage,
            coverImage: action.payload.coverImage,
            subscriptionPrice: action.payload.monetization?.subscriptionPrice,
            subscriptionPlans: action.payload.monetization?.plans,
            isMonetizationComplete: action.payload.monetization?.isComplete,
          };
          state.allArtists[index] = updatedArtist;
        }
        
        // Also update in fullArtistList array if exists
        const fullListIndex = state.fullArtistList.findIndex(a => a._id === action.payload.id);
        if (fullListIndex !== -1) {
          const updatedFullArtist = {
            ...state.fullArtistList[fullListIndex],
            name: action.payload.name,
            bio: action.payload.bio,
            location: action.payload.location,
            country: action.payload.country,
            profileImage: action.payload.profileImage,
            coverImage: action.payload.coverImage,
            subscriptionPrice: action.payload.monetization?.subscriptionPrice,
            subscriptionPlans: action.payload.monetization?.plans,
            isMonetizationComplete: action.payload.monetization?.isComplete,
          };
          state.fullArtistList[fullListIndex] = updatedFullArtist;
        }
      })
      .addCase(updateArtistProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.error = action.payload;
      })

      .addCase(deleteArtist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteArtist.fulfilled, (state, action) => {
        state.loading = false;
        state.allArtists = state.allArtists.filter(artist => artist._id !== action.payload);
        state.fullArtistList = state.fullArtistList.filter(artist => artist._id !== action.payload);
        state.isCached = false;
        state.cachedPages = [];
        state.cachedData = {};
        state.isFullListCached = false;
        state.fullListLastFetchTime = null;
        delete state.subscriberCounts[action.payload];
      })
      .addCase(deleteArtist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchRandomArtistWithSongs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRandomArtistWithSongs.fulfilled, (state, action) => {
        state.loading = false;
        state.randomArtist = action.payload.artist;
        state.randomArtistSongs = action.payload.songs;
        state.randomArtistPagination = action.payload.pagination;
      })
      .addCase(fetchRandomArtistWithSongs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(searchArtists.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchArtists.fulfilled, (state, action) => {
        state.loading = false;
        state.allArtists = action.payload.artists;
        state.pagination = action.payload.pagination;
      })
      .addCase(searchArtists.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchSubscriberCount.pending, (state) => {
        state.subscriberCountLoading = true;
        state.subscriberCountError = null;
      })
      .addCase(fetchSubscriberCount.fulfilled, (state, action) => {
        state.subscriberCountLoading = false;
        const { artistId, activeSubscribers, totalRevenue } = action.payload;
        state.subscriberCounts[artistId] = {
          activeSubscribers,
          totalRevenue,
          lastUpdated: Date.now()
        };
      })
      .addCase(fetchSubscriberCount.rejected, (state, action) => {
        state.subscriberCountLoading = false;
        state.subscriberCountError = action.payload;
      });
  },
});

export const { 
  clearSelectedArtist, 
  clearArtistProfile,
  clearCache, 
  clearFullListCache, 
  clearAllCaches, 
  setCachedData, 
  loadFromCache,
  loadFullListFromCache,
  clearSubscriberCount,
  updateSelectedArtistLocally,
  updateArtistProfileLocally
} = artistSlice.actions;

export default artistSlice.reducer;