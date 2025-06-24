// Selectors
export const selectAllArtists = (state) => state.artists.allArtists;
export const selectFullArtistList = (state) => state.artists.fullArtistList;
export const selectSelectedArtist = (state) => state.artists.selectedArtist;
export const selectArtistLoading = (state) => state.artists.loading;
export const selectArtistError = (state) => state.artists.error;
export const selectArtistPagination = (state) => state.artists.pagination;
export const selectRandomArtist = (state) => state.artists.randomArtist;
export const selectRandomArtistSongs = (state) => state.artists.randomArtistSongs;
export const selectRandomArtistPagination = (state) => state.artists.randomArtistPagination;