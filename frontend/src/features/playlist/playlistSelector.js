// Admin Playlist Selectors
export const selectAllAdminPlaylists = (state) => state.playlists.playlists;
export const selectAdminPlaylistById = (state) => state.playlists.currentPlaylist;
export const selectAdminPlaylistLoading = (state) => state.playlists.loading;
export const selectAdminPlaylistError = (state) => state.playlists.error;
export const selectAdminPlaylistPagination = (state) => state.playlists.pagination;
