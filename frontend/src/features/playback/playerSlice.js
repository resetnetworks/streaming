import { createSlice } from "@reduxjs/toolkit";

const loadInitialState = () => {
  try {
    const savedVolume = localStorage.getItem("player-volume");
    const savedDefaultSong = localStorage.getItem("player-default-song");
    const savedPlaybackContext = localStorage.getItem("player-playback-context");
    const savedShuffleMode = localStorage.getItem("player-shuffle-mode");
    const savedRepeatMode = localStorage.getItem("player-repeat-mode");
    
    return {
      selectedSong: null,
      defaultSong: savedDefaultSong ? JSON.parse(savedDefaultSong) : null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: savedVolume ? parseFloat(savedVolume) : 0.5,
      lastSelectedAt: null,
      forceRefreshToken: null,
      playbackContext: savedPlaybackContext ? JSON.parse(savedPlaybackContext) : {
        type: 'all',
        id: null,
        songs: []
      },
      // ✅ NEW: Shuffle and repeat state
      shuffleMode: savedShuffleMode ? JSON.parse(savedShuffleMode) : false,
      repeatMode: savedRepeatMode || 'off',
      shuffleOrder: []
    };
  } catch (e) {
    console.warn("Failed to load player state from storage", e);
    return {
      selectedSong: null,
      defaultSong: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 0.5,
      lastSelectedAt: null,
      forceRefreshToken: null,
      playbackContext: {
        type: 'all',
        id: null,
        songs: []
      },
      // ✅ NEW: Default shuffle and repeat state
      shuffleMode: false,
      repeatMode: 'off',
      shuffleOrder: []
    };
  }
};

const initialState = loadInitialState();

function getRandomSong(songs, maxCount = 20) {
  if (!songs || songs.length === 0) return null;
  const limitedSongs = songs.slice(0, Math.min(songs.length, maxCount));
  const randomIndex = Math.floor(Math.random() * limitedSongs.length);
  return limitedSongs[randomIndex];
}

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
    
    // ✅ NEW: Set shuffle mode with persistence
    setShuffleMode(state, action) {
      state.shuffleMode = action.payload;
      // Reset shuffle order when disabling shuffle
      if (!action.payload) {
        state.shuffleOrder = [];
      }
      try {
        localStorage.setItem("player-shuffle-mode", JSON.stringify(action.payload));
      } catch (e) {
        console.warn("Failed to persist shuffle mode", e);
      }
    },
    
    // ✅ NEW: Set repeat mode with persistence
    setRepeatMode(state, action) {
      state.repeatMode = action.payload;
      try {
        localStorage.setItem("player-repeat-mode", action.payload);
      } catch (e) {
        console.warn("Failed to persist repeat mode", e);
      }
    },
    
    // ✅ NEW: Set shuffle order
    setShuffleOrder(state, action) {
      state.shuffleOrder = action.payload;
    },
    
    setDefaultSong(state, action) {
      if (!state.defaultSong || action.payload.force) {
        state.defaultSong = action.payload.song;
        try {
          localStorage.setItem("player-default-song", JSON.stringify(action.payload.song));
        } catch (e) {
          console.warn("Failed to save default song", e);
        }
      }
    },
    
    setRandomDefaultFromSongs(state, action) {
      if (!state.defaultSong) {
        const availableSongs = action.payload || [];
        if (availableSongs.length > 0) {
          const randomSong = getRandomSong(availableSongs);
          if (randomSong) {
            state.defaultSong = randomSong;
            try {
              localStorage.setItem("player-default-song", JSON.stringify(randomSong));
            } catch (e) {
              console.warn("Failed to save random default song", e);
            }
          }
        }
      }
    },
    
    loadDefaultSongFromStorage(state) {
      try {
        const saved = localStorage.getItem("player-default-song");
        if (saved) {
          state.defaultSong = JSON.parse(saved);
        }
      } catch (e) {
        console.warn("Failed to load default song from storage", e);
        state.defaultSong = null;
      }
    },
    
    clearDefaultSong(state) {
      state.defaultSong = null;
      try {
        localStorage.removeItem("player-default-song");
      } catch (e) {
        console.warn("Failed to clear default song from storage", e);
      }
    },
    
    setPlaybackContext(state, action) {
      state.playbackContext = action.payload;
      try {
        localStorage.setItem("player-playback-context", JSON.stringify(action.payload));
      } catch (e) {
        console.warn("Failed to save playback context", e);
      }
    },
    
    clearPlaybackContext(state) {
      state.playbackContext = {
        type: 'all',
        id: null,
        songs: []
      };
      try {
        localStorage.removeItem("player-playback-context");
      } catch (e) {
        console.warn("Failed to clear playback context from storage", e);
      }
    },
    
    resetPlayerState(state) {
      const preservedVolume = state.volume;
      const preservedDefaultSong = state.defaultSong;
      const preservedPlaybackContext = state.playbackContext;
      const preservedShuffleMode = state.shuffleMode;
      const preservedRepeatMode = state.repeatMode;
      
      return {
        ...initialState,
        volume: preservedVolume,
        defaultSong: preservedDefaultSong,
        playbackContext: preservedPlaybackContext,
        shuffleMode: preservedShuffleMode,
        repeatMode: preservedRepeatMode,
        forceRefreshToken: Date.now(),
      };
    },
    
    forceRefresh(state) {
      state.forceRefreshToken = Date.now();
    },

    resetEverything(state) {
      try {
        localStorage.removeItem("player-default-song");
        localStorage.removeItem("player-playback-context");
        localStorage.removeItem("player-shuffle-mode");
        localStorage.removeItem("player-repeat-mode");
      } catch (e) {
        console.warn("Failed to clear player storage", e);
      }
      
      return {
        ...initialState,
        volume: state.volume,
        forceRefreshToken: Date.now(),
      };
    }
  },
});

export const {
  setSelectedSong,
  play,
  pause,
  setCurrentTime,
  setDuration,
  setVolume,
  setShuffleMode,
  setRepeatMode,
  setShuffleOrder,
  setDefaultSong,
  setRandomDefaultFromSongs,
  loadDefaultSongFromStorage,
  clearDefaultSong,
  setPlaybackContext,
  clearPlaybackContext,
  resetPlayerState,
  forceRefresh,
  resetEverything,
} = playerSlice.actions;

export default playerSlice.reducer;