import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedSong: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.5,
  lastSelectedAt: null,
  forceRefreshToken: null, // New field for cache busting
};

const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    setSelectedSong(state, action) {
      state.selectedSong = action.payload;
      state.currentTime = 0;
      state.duration = 0;
      state.isPlaying = true;
      state.lastSelectedAt = Date.now();
      state.forceRefreshToken = Date.now(); // Force reload
    },
    play(state) {
      state.isPlaying = true;
    },
    pause(state) {
      state.isPlaying = false;
    },
    setCurrentTime(state, action) {
      state.currentTime = action.payload;
    },
    setDuration(state, action) {
      state.duration = action.payload;
    },
    setVolume(state, action) {
      state.volume = action.payload;
      // Persist volume changes immediately
      try {
        localStorage.setItem('player-volume', action.payload);
      } catch (e) {
        console.warn("Failed to persist volume", e);
      }
    },
    // New reducer for cache control
    resetPlayerState(state) {
      // Reset everything except volume
      return {
        ...initialState,
        volume: state.volume,
        forceRefreshToken: Date.now()
      };
    },
    // New reducer for force refresh
    forceRefresh(state) {
      state.forceRefreshToken = Date.now();
    }
  },
});

// Helper function to load initial volume
export const loadInitialVolume = () => {
  try {
    const savedVolume = localStorage.getItem('player-volume');
    return savedVolume ? parseFloat(savedVolume) : initialState.volume;
  } catch (e) {
    return initialState.volume;
  }
};

export const {
  setSelectedSong,
  play,
  pause,
  setCurrentTime,
  setDuration,
  setVolume,
  resetPlayerState,
  forceRefresh
} = playerSlice.actions;

// Selector for getting player state with fresh data
export const selectPlayerState = (state) => ({
  ...state.player,
  shouldRefresh: state.player.forceRefreshToken !== null
});

export default playerSlice.reducer;