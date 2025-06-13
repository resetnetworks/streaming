export const selectAllAlbums = (state) => state.albums.allAlbums;
export const selectAlbumForm = (state) => state.albums.albumForm;
export const selectAlbumById = (state, albumId) => state.albums.albumById?.[albumId];
export const selectEditingAlbum = (state) => state.albums.editingAlbum;
export const selectAlbumsLoading = (state) => state.albums.loading;
export const selectAlbumsError = (state) => state.albums.error;