// src/features/artistDashboard/artistDashboardSelectors.js
import { createSelector } from "@reduxjs/toolkit";

// Base selectors
export const selectSongsState = (state) => state.artistDashboard.songs;
export const selectAlbumsState = (state) => state.artistDashboard.albums;

// 🎵 SONGS SELECTORS
export const selectSongsItems = createSelector(
  [selectSongsState],
  (songs) => songs.items || []
);

export const selectSongsLoading = createSelector(
  [selectSongsState],
  (songs) => songs.loading || false
);

export const selectSongsError = createSelector(
  [selectSongsState],
  (songs) => songs.error || null
);

export const selectSongsMeta = createSelector(
  [selectSongsState],
  (songs) => songs.meta || {}
);

export const selectSongsTotal = createSelector(
  [selectSongsMeta],
  (meta) => meta.total || 0
);

export const selectSongsCurrentPage = createSelector(
  [selectSongsMeta],
  (meta) => meta.page || 1
);

export const selectSongsTotalPages = createSelector(
  [selectSongsMeta],
  (meta) => meta.pages || 1
);

export const selectSongsType = createSelector(
  [selectSongsState],
  (songs) => songs.type || "single"
);

export const selectHasMoreSongs = createSelector(
  [selectSongsCurrentPage, selectSongsTotalPages],
  (page, totalPages) => page < totalPages
);

export const selectSongsCount = createSelector(
  [selectSongsItems],
  (items) => items.length
);

// 🎼 ALBUMS SELECTORS
export const selectAlbumsItems = createSelector(
  [selectAlbumsState],
  (albums) => albums.items || []
);

export const selectAlbumsLoading = createSelector(
  [selectAlbumsState],
  (albums) => albums.loading || false
);

export const selectAlbumsError = createSelector(
  [selectAlbumsState],
  (albums) => albums.error || null
);

export const selectAlbumsMeta = createSelector(
  [selectAlbumsState],
  (albums) => albums.meta || {}
);

export const selectAlbumsTotal = createSelector(
  [selectAlbumsMeta],
  (meta) => meta.total || 0
);

export const selectAlbumsCurrentPage = createSelector(
  [selectAlbumsMeta],
  (meta) => meta.page || 1
);

export const selectAlbumsTotalPages = createSelector(
  [selectAlbumsMeta],
  (meta) => meta.pages || 1
);

export const selectHasMoreAlbums = createSelector(
  [selectAlbumsCurrentPage, selectAlbumsTotalPages],
  (page, totalPages) => page < totalPages
);

export const selectAlbumsCount = createSelector(
  [selectAlbumsItems],
  (items) => items.length
);

// 📊 COMBINED SELECTORS
export const selectArtistDashboardLoading = createSelector(
  [selectSongsLoading, selectAlbumsLoading],
  (songsLoading, albumsLoading) => songsLoading || albumsLoading
);

export const selectArtistDashboardErrors = createSelector(
  [selectSongsError, selectAlbumsError],
  (songsError, albumsError) => ({
    songs: songsError,
    albums: albumsError
  })
);

// 🔍 UTILITY SELECTORS FOR COMPONENTS - ✅ UPDATED WITH PRICE
export const selectSongsForDisplay = createSelector(
  [selectSongsItems],
  (items) => items.map(song => ({
    id: song._id || song.id,
    title: song.title,
    artist: song.artist?.name || song.artistName,
    duration: song.duration,
    plays: song.plays || 0,
    image: song.coverImage || song.image,
    accessType: song.accessType,      // ✅ Original accessType
    basePrice: song.basePrice,        // ✅ Price for purchase-only
    album: song.album,                // ✅ Debug field
    createdAt: song.createdAt,
    isPublished: song.isPublished,
    releaseDate: song.releaseDate,
  }))
);

export const selectAlbumsForDisplay = createSelector(
  [selectAlbumsItems],
  (items) => items.map(album => ({
    id: album._id || album.id,
    title: album.title,
    artist: album.artist?.name || album.artistName,
    tracks: album.tracks?.length || 0,
    plays: album.plays || 0,
    image: album.coverImage || album.image,
    accessType: album.accessType,
    basePrice: album.basePrice,
    createdAt: album.createdAt,
    isPublished: album.isPublished
  }))
);

// 🎯 MOST USED SELECTORS (EXPORT FIRST)
export const selectArtistSongs = selectSongsItems;
export const selectArtistAlbums = selectAlbumsItems;
export const selectSongsPagination = selectSongsMeta;
export const selectAlbumsPagination = selectAlbumsMeta;
