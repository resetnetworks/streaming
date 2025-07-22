import { createSelector } from '@reduxjs/toolkit';

export const selectAllSongs = (state) => state.songs.allSongs;
export const selectSongsStatus = (state) => state.songs.status;
export const selectSongsError = (state) => state.songs.error;
export const selectSongsMessage = (state) => state.songs.message;
export const selectTotalPages = (state) => state.songs.totalPages;
export const selectCurrentPage = (state) => state.songs.currentPage;
export const selectSelectedSong = (state) => state.player.selectedSong;
export const selectSongsState = (state) => state.songs;
export const selectLikedSongs = (state) => state.songs.likedSongs.songs;
export const selectLikedSongsTotal = (state) => state.songs.likedSongs.total;
export const selectLikedSongsPage = (state) => state.songs.likedSongs.page;
export const selectLikedSongsPages = (state) => state.songs.likedSongs.pages;

export const selectSongsByAlbum = (state, albumId) => state.songs.songsByAlbum[albumId] || [];

export const selectSongsByArtist = createSelector(
  [selectSongsState, (_, artistId) => artistId],
  (songs, artistId) => songs.songsByArtist[artistId] || {}
);
