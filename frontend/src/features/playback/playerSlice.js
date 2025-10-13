import { createSlice } from "@reduxjs/toolkit";

// ✅ NEW: Load initial state from localStorage for persistence
const loadInitialState = () => {
  try {
    const savedVolume = localStorage.getItem("player-volume");
    const savedDefaultSong = localStorage.getItem("player-default-song");
    const savedPlaybackContext = localStorage.getItem("player-playback-context");
    
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
      }
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
      }
    };
  }
};

const initialState = loadInitialState();

// ✅ NEW: Helper function to get random song from array
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
    
    // ✅ UPDATED: Set default song for display (with persistence)
    setDefaultSong(state, action) {
      // Only set if not already set or explicitly forced
      if (!state.defaultSong || action.payload.force) {
        state.defaultSong = action.payload.song;
        try {
          localStorage.setItem("player-default-song", JSON.stringify(action.payload.song));
        } catch (e) {
          console.warn("Failed to save default song", e);
        }
      }
    },
    
    // ✅ NEW: Set random default song from available songs (only if no default exists)
    setRandomDefaultFromSongs(state, action) {
      // Only set random default if no default song exists
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
    
    // ✅ NEW: Load default song from localStorage (for initialization)
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
    
    // ✅ NEW: Clear default song
    clearDefaultSong(state) {
      state.defaultSong = null;
      try {
        localStorage.removeItem("player-default-song");
      } catch (e) {
        console.warn("Failed to clear default song from storage", e);
      }
    },
    
    // ✅ NEW: Set playback context with persistence
    setPlaybackContext(state, action) {
      state.playbackContext = action.payload;
      try {
        localStorage.setItem("player-playback-context", JSON.stringify(action.payload));
      } catch (e) {
        console.warn("Failed to save playback context", e);
      }
    },
    
    // ✅ NEW: Clear playback context
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
    
    // ✅ UPDATED: Reset player state but preserve default song and volume
    resetPlayerState(state) {
      const preservedVolume = state.volume;
      const preservedDefaultSong = state.defaultSong;
      const preservedPlaybackContext = state.playbackContext;
      
      return {
        ...initialState,
        volume: preservedVolume,
        defaultSong: preservedDefaultSong, // ✅ Preserve default song on reset
        playbackContext: preservedPlaybackContext, // ✅ Preserve playback context
        forceRefreshToken: Date.now(),
      };
    },
    
    forceRefresh(state) {
      state.forceRefreshToken = Date.now();
    },

    // ✅ NEW: Reset everything including default song
    resetEverything(state) {
      try {
        localStorage.removeItem("player-default-song");
        localStorage.removeItem("player-playback-context");
      } catch (e) {
        console.warn("Failed to clear player storage", e);
      }
      
      return {
        ...initialState,
        volume: state.volume, // Only preserve volume
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
  setDefaultSong,
  setRandomDefaultFromSongs,
  loadDefaultSongFromStorage,
  clearDefaultSong,
  setPlaybackContext,
  clearPlaybackContext,
  resetPlayerState,
  forceRefresh,
  resetEverything, // ✅ NEW export
} = playerSlice.actions;

// ✅ UPDATED: Enhanced selector with default song info
export const selectPlayerState = (state) => ({
  ...state.player,
  shouldRefresh: state.player.forceRefreshToken !== null,
  // ✅ UPDATED: Computed properties for player display
  displaySong: state.player.selectedSong || state.player.defaultSong || null,
  isDisplayOnly: !state.player.selectedSong && !!state.player.defaultSong,
  hasAnySong: !!(state.player.selectedSong || state.player.defaultSong),
  // ✅ NEW: Additional computed properties
  hasPersistentDefault: !!state.player.defaultSong,
  canPlay: !!(state.player.selectedSong || state.player.defaultSong),
});

// ✅ UPDATED: Additional selectors for default song functionality
export const selectDefaultSong = (state) => state.player?.defaultSong || null;
export const selectDisplaySong = (state) => state.player?.selectedSong || state.player?.defaultSong || null;
export const selectIsDisplayOnly = (state) => !state.player?.selectedSong && !!state.player?.defaultSong;
export const selectHasAnySong = (state) => !!(state.player?.selectedSong || state.player?.defaultSong);

// ✅ NEW: Additional selectors for enhanced functionality
export const selectHasPersistentDefault = (state) => !!state.player?.defaultSong;
export const selectCanPlay = (state) => !!(state.player?.selectedSong || state.player?.defaultSong);
export const selectPlaybackContext = (state) => state.player?.playbackContext || { type: 'all', id: null, songs: [] };
export const selectPlaybackContextType = (state) => state.player?.playbackContext?.type || 'all';
export const selectPlaybackContextSongs = (state) => state.player?.playbackContext?.songs || [];

export default playerSlice.reducer;