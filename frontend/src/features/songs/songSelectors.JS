import { createSelector } from "@reduxjs/toolkit";
// All paginated songs (infinite scroll)
export const selectAllSongs = (state) => state.songs.allSongs;

// Song CRUD and fetch status
export const selectSongsStatus = (state) => state.songs.status;
export const selectSongsError = (state) => state.songs.error;
export const selectSongsMessage = (state) => state.songs.message;

// Total pages and current page for pagination
export const selectTotalPages = (state) => state.songs.totalPages;
export const selectCurrentPage = (state) => state.songs.currentPage;

// Selected song for player (not modified, uses player slice)
export const selectSelectedSong = (state) => state.player.selectedSong;

export const selectSongsState = (state) => state.songs;


// Liked songs
export const selectLikedSongs = (state) => state.songs.likedSongs;

// Songs by specific album
export const selectSongsByAlbum = (state, albumId) => state.songs.songsByAlbum[albumId] || [];
export const selectSongsByArtist = createSelector(
  [selectSongsState, (_, artistId) => artistId],
  (songs, artistId) => songs.songsByArtist[artistId] || {}
);