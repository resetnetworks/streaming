export const selectSelectedSong = (state) => state.player?.selectedSong || null;
export const selectDefaultSong = (state) => state.player?.defaultSong || null;
export const selectHasPersistentDefault = (state) => !!state.player?.defaultSong;
export const selectCanPlay = (state) => !!(state.player?.selectedSong || state.player?.defaultSong);
export const selectPlaybackContext = (state) => state.player?.playbackContext || { type: 'all', id: null, songs: [] };
export const selectPlaybackContextType = (state) => state.player?.playbackContext?.type || 'all';
export const selectPlaybackContextSongs = (state) => state.player?.playbackContext?.songs || [];

export const selectPlayerDisplaySong = (state) => {
  return state.player?.selectedSong || state.player?.defaultSong || null;
};
export const selectIsPlayerDisplayOnly = (state) => {
  return !state.player?.selectedSong && !!state.player?.defaultSong;
};
export const selectDisplaySong = selectPlayerDisplaySong;
export const selectIsDisplayOnly = selectIsPlayerDisplayOnly;

export const selectEnhancedPlayerState = (state) => {
  const displaySong = selectPlayerDisplaySong(state);
  const isDisplayOnly = selectIsPlayerDisplayOnly(state);
  const hasPersistentDefault = selectHasPersistentDefault(state);
  const canPlay = selectCanPlay(state);
  const playbackContext = selectPlaybackContext(state);
  return {
    displaySong,
    isDisplayOnly,
    hasPersistentDefault,
    canPlay,
    playbackContext,
    hasContent: !!displaySong,
    canShowPlayer: !!displaySong,
    isContextualPlayback: playbackContext.type !== 'all'
  };
};
