// src/hooks/api/useSongs.js
import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { songApi } from "../../api/songApi";
import { toast } from "sonner";

// 🎯 Query Keys
export const songKeys = {
  all: ["songs"],
  lists: () => [...songKeys.all, "list"],
  list: (filters) => [...songKeys.lists(), filters],
  details: () => [...songKeys.all, "detail"],
  detail: (id) => [...songKeys.details(), id],
  artist: (artistId) => [...songKeys.all, "artist", artistId],
  album: (albumId) => [...songKeys.all, "album", albumId],
  singles: () => [...songKeys.all, "singles"],
  singlesList: (filters) => [...songKeys.singles(), "list", filters],
  singlesArtist: (artistId) => [...songKeys.singles(), "artist", artistId],
  liked: () => [...songKeys.all, "liked"],
  matchingGenres: () => [...songKeys.all, "matching-genres"],
  genre: (genre) => [...songKeys.all, "genre", genre],
};

// 📥 QUERIES (GET REQUESTS)

// Get all songs with pagination
export const useSongs = (filters = { page: 1, limit: 10 }) => {
  return useQuery({
    queryKey: songKeys.list(filters),
    queryFn: () => songApi.fetchAll(filters),
    keepPreviousData: true,
  });
};

// Get all songs with infinite scroll
export const useSongsInfinite = (limit = 10) => {
  return useInfiniteQuery({
    queryKey: songKeys.list({ infinite: true, limit }),
    queryFn: ({ pageParam = 1 }) => 
      songApi.fetchAll({ page: pageParam, limit }),
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.pagination?.page || 1;
      const totalPages = lastPage.pagination?.totalPages || 1;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    keepPreviousData: true,
    staleTime: 30 * 1000,
  });
};

// Get single song by ID
export const useSong = (id) => {
  return useQuery({
    queryKey: songKeys.detail(id),
    queryFn: () => songApi.fetchById(id),
    enabled: !!id,
  });
};

// Get songs by artist
export const useArtistSongs = (artistId, limit = 10) => {
  return useInfiniteQuery({
    queryKey: songKeys.artist(artistId),
    queryFn: ({ pageParam = 1 }) =>
      songApi.fetchByArtist({ artistId, page: pageParam, limit }),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination || {};
      return page && totalPages && page < totalPages ? page + 1 : undefined;
    },
    enabled: !!artistId,
  });
};

// Get songs by album
export const useAlbumSongs = (albumId) => {
  return useQuery({
    queryKey: songKeys.album(albumId),
    queryFn: () => songApi.fetchByAlbum(albumId),
    enabled: !!albumId,
  });
};

// Get all singles
export const useAllSingles = (filters = { page: 1, limit: 10 }) => {
  return useQuery({
    queryKey: songKeys.singlesList(filters),
    queryFn: () => songApi.fetchAllSingles(filters),
    keepPreviousData: true,
  });
};

// Get singles with infinite scroll
export const useSinglesInfinite = (limit = 10) => {
  return useInfiniteQuery({
    queryKey: songKeys.singlesList({ infinite: true, limit }),
    queryFn: ({ pageParam = 1 }) => 
      songApi.fetchAllSingles({ page: pageParam, limit }),
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.pagination?.page || 1;
      const totalPages = lastPage.pagination?.totalPages || 1;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    keepPreviousData: true,
    staleTime: 30 * 1000,
  });
};

// Get singles by artist
export const useArtistSingles = (artistId, limit = 10) => {
  return useInfiniteQuery({
    queryKey: songKeys.singlesArtist(artistId),
    queryFn: ({ pageParam = 1 }) =>
      songApi.fetchSinglesByArtist({ artistId, page: pageParam, limit }),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination || {};
      return page && totalPages && page < totalPages ? page + 1 : undefined;
    },
    enabled: !!artistId,
  });
};

// Get liked songs
export const useLikedSongs = (filters = { page: 1, limit: 20 }) => {
  return useQuery({
    queryKey: [...songKeys.liked(), filters],
    queryFn: () => songApi.fetchLikedSongs(filters),
  });
};

// Get songs matching user genres
export const useMatchingGenreSongs = (filters = { page: 1, limit: 20 }) => {
  return useQuery({
    queryKey: [...songKeys.matchingGenres(), filters],
    queryFn: () => songApi.fetchMatchingGenreSongs(filters),
  });
};

// Get songs by genre
export const useSongsByGenre = (genre, filters = { page: 1, limit: 20 }) => {
  return useQuery({
    queryKey: [...songKeys.genre(genre), filters],
    queryFn: () => songApi.fetchByGenre({ genre, ...filters }),
    enabled: !!genre,
  });
};

// 📤 MUTATIONS (POST/PUT/DELETE)

// Create song mutation
export const useCreateSong = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: songApi.create,
    onMutate: async (formData) => {
      await queryClient.cancelQueries({ queryKey: songKeys.lists() });
      await queryClient.cancelQueries({ queryKey: songKeys.singles() });
      
      const previousSongs = queryClient.getQueryData(songKeys.list({ page: 1, limit: 10 }));
      const previousSingles = queryClient.getQueryData(songKeys.singlesList({ page: 1, limit: 10 }));
      
      return { previousSongs, previousSingles };
    },
    onError: (err, variables, context) => {
      if (context?.previousSongs) {
        queryClient.setQueryData(songKeys.list({ page: 1, limit: 10 }), context.previousSongs);
      }
      if (context?.previousSingles) {
        queryClient.setQueryData(songKeys.singlesList({ page: 1, limit: 10 }), context.previousSingles);
      }
      toast.error(err.message || "Failed to create song");
    },
    onSuccess: (newSong) => {
      // Invalidate all song-related queries
      queryClient.invalidateQueries({ queryKey: songKeys.lists() });
      queryClient.invalidateQueries({ queryKey: songKeys.singles() });
      
      if (newSong.artist) {
        queryClient.invalidateQueries({ queryKey: songKeys.artist(newSong.artist) });
        queryClient.invalidateQueries({ queryKey: songKeys.singlesArtist(newSong.artist) });
      }
      
      if (newSong.album) {
        queryClient.invalidateQueries({ queryKey: songKeys.album(newSong.album) });
      }
      
      if (newSong.genre) {
        queryClient.invalidateQueries({ queryKey: songKeys.genre(newSong.genre) });
      }
      
      queryClient.invalidateQueries({ queryKey: songKeys.matchingGenres() });
      queryClient.invalidateQueries({ queryKey: songKeys.liked() });
      
      toast.success("Song created successfully!");
    },
  });
};

// Update song mutation
export const useUpdateSong = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: songApi.update,
    onMutate: async (variables) => {
      const { songId } = variables;
      
      await queryClient.cancelQueries(songKeys.detail(songId));
      
      const previousSong = queryClient.getQueryData(songKeys.detail(songId));
      
      return { previousSong };
    },
    onError: (err, variables, context) => {
      if (context?.previousSong) {
        queryClient.setQueryData(songKeys.detail(variables.songId), context.previousSong);
      }
      toast.error(err.message || "Failed to update song");
    },
    onSuccess: (updatedSong) => {
      // Invalidate all affected queries
      queryClient.invalidateQueries({ queryKey: songKeys.lists() });
      queryClient.invalidateQueries({ queryKey: songKeys.singles() });
      queryClient.invalidateQueries({ queryKey: songKeys.detail(updatedSong._id) });
      
      if (updatedSong.artist) {
        queryClient.invalidateQueries({ queryKey: songKeys.artist(updatedSong.artist) });
        queryClient.invalidateQueries({ queryKey: songKeys.singlesArtist(updatedSong.artist) });
      }
      
      if (updatedSong.album) {
        queryClient.invalidateQueries({ queryKey: songKeys.album(updatedSong.album) });
      }
      
      if (updatedSong.genre) {
        queryClient.invalidateQueries({ queryKey: songKeys.genre(updatedSong.genre) });
      }
      
      queryClient.invalidateQueries({ queryKey: songKeys.matchingGenres() });
      queryClient.invalidateQueries({ queryKey: songKeys.liked() });
      
      toast.success("Song updated successfully!");
    },
  });
};

// Delete song mutation
export const useDeleteSong = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: songApi.delete,
    onMutate: async (songId) => {
      await queryClient.cancelQueries({ queryKey: songKeys.lists() });
      await queryClient.cancelQueries({ queryKey: songKeys.singles() });
      
      const previousSongs = queryClient.getQueryData(songKeys.list({ page: 1, limit: 10 }));
      const previousSingles = queryClient.getQueryData(songKeys.singlesList({ page: 1, limit: 10 }));
      
      // Optimistically remove song from songs list
      queryClient.setQueryData(songKeys.list({ page: 1, limit: 10 }), (old) => {
        if (!old?.songs) return old;
        return {
          ...old,
          songs: old.songs.filter(song => song._id !== songId),
        };
      });
      
      // Optimistically remove from singles list
      queryClient.setQueryData(songKeys.singlesList({ page: 1, limit: 10 }), (old) => {
        if (!old?.songs) return old;
        return {
          ...old,
          songs: old.songs.filter(song => song._id !== songId),
        };
      });
      
      return { previousSongs, previousSingles };
    },
    onError: (err, songId, context) => {
      // Rollback on error
      if (context?.previousSongs) {
        queryClient.setQueryData(songKeys.list({ page: 1, limit: 10 }), context.previousSongs);
      }
      if (context?.previousSingles) {
        queryClient.setQueryData(songKeys.singlesList({ page: 1, limit: 10 }), context.previousSingles);
      }
      toast.error(err.message || "Failed to delete song");
    },
    onSuccess: (songId) => {
      // Invalidate all song queries
      queryClient.invalidateQueries({ queryKey: songKeys.all });
      queryClient.invalidateQueries({ queryKey: songKeys.singles() });
      toast.success("Song deleted successfully!");
    },
  });
};