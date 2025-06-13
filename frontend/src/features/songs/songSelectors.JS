export const selectAllSongs = (state) => state.songs.songs;
export const selectSongsStatus = (state) => state.songs.status;
export const selectSongsError = (state) => state.songs.error;
export const selectSongsMessage = (state) => state.songs.message;
export const selectSelectedSong = (state) => state.player.selectedSong;
export const selectLikedSongs = (state) => state.songs.likedSongs;
export const selectSongsByAlbum = (state, albumId) => state.songs.songsByAlbum[albumId] || [];