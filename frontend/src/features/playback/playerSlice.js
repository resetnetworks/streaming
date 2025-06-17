import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedSong: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.5,
  lastSelectedAt: null, // 🔥 new: force refresh even for same song
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
      state.lastSelectedAt = Date.now(); // 🔥 ensures unique change
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
} = playerSlice.actions;

export default playerSlice.reducer;
