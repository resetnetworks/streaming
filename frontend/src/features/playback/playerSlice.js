import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedSong: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: loadInitialVolume(),
  lastSelectedAt: null,
  forceRefreshToken: null, // For cache busting
};

// Helper: Load volume from localStorage
export function loadInitialVolume() {
  try {
    const savedVolume = localStorage.getItem("player-volume");
    return savedVolume ? parseFloat(savedVolume) : 0.5;
  } catch (e) {
    return 0.5;
  }
}

const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    setSelectedSong(state, action) {
      state.selectedSong = action.payload;
      state.currentTime = 0; // reset time for new song
      state.duration = 0;
      state.isPlaying = true;
      state.lastSelectedAt = Date.now();
      state.forceRefreshToken = Date.now();
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
      try {
        localStorage.setItem("player-volume", action.payload);
      } catch (e) {
        console.warn("Failed to persist volume", e);
      }
    },
    resetPlayerState(state) {
      return {
        ...initialState,
        volume: state.volume,
        forceRefreshToken: Date.now(),
      };
    },
    forceRefresh(state) {
      state.forceRefreshToken = Date.now();
    },
  },
});

export const {
  setSelectedSong,
  play,
  pause,
  setCurrentTime,
  setDuration,
  setVolume,
  resetPlayerState,
  forceRefresh,
} = playerSlice.actions;

// Selector
export const selectPlayerState = (state) => ({
  ...state.player,
  shouldRefresh: state.player.forceRefreshToken !== null,
});

export default playerSlice.reducer;
