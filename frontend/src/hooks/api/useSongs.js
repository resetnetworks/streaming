import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { songApi } from "../../api/songApi";
import { toast } from "sonner";

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
  likedList: (filters) => [...songKeys.liked(), "list", filters],
  matchingGenres: () => [...songKeys.all, "matching-genres"],
  genre: (genre) => [...songKeys.all, "genre", genre],
};

// Get liked songs with infinite scroll
export const useLikedSongs = (limit = 20) => {
  return useInfiniteQuery({
    queryKey: songKeys.likedList({ limit }),
    queryFn: ({ pageParam = 1 }) => 
      songApi.fetchLikedSongs({ page: pageParam, limit }),
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.page || 1;
      const totalPages = lastPage.pages || 1;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

// Unlike song mutation
export const useUnlikeSong = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: songApi.unlikeSong,
    onMutate: async (songId) => {
      await queryClient.cancelQueries({ queryKey: songKeys.liked() });
      
      const previousData = queryClient.getQueryData(songKeys.likedList({ limit: 20 }));
      
      // Optimistically remove song from all pages
      queryClient.setQueryData(
        songKeys.likedList({ limit: 20 }),
        (oldData) => {
          if (!oldData?.pages) return oldData;
          
          return {
            ...oldData,
            pages: oldData.pages.map(page => ({
              ...page,
              songs: page.songs?.filter(song => song._id !== songId) || [],
              total: page.total ? page.total - 1 : 0,
            }))
          };
        }
      );
      
      return { previousData };
    },
    onError: (err, songId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(songKeys.likedList({ limit: 20 }), context.previousData);
      }
      toast.error(err.message || "Failed to unlike song");
    },
    onSuccess: (songId) => {
      toast.success("Song removed from liked");
    },
  });
};

// Keep other existing queries and mutations as they are
export const useSongs = (filters = { page: 1, limit: 10 }) => {
  return useQuery({
    queryKey: songKeys.list(filters),
    queryFn: () => songApi.fetchAll(filters),
    keepPreviousData: true,
  });
};

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

export const useSong = (id) => {
  return useQuery({
    queryKey: songKeys.detail(id),
    queryFn: () => songApi.fetchById(id),
    enabled: !!id,
  });
};

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

export const useAlbumSongs = (albumId) => {
  return useQuery({
    queryKey: songKeys.album(albumId),
    queryFn: () => songApi.fetchByAlbum(albumId),
    enabled: !!albumId,
  });
};

export const useAllSingles = (filters = { page: 1, limit: 10 }) => {
  return useQuery({
    queryKey: songKeys.singlesList(filters),
    queryFn: () => songApi.fetchAllSingles(filters),
    keepPreviousData: true,
  });
};

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

export const useMatchingGenreSongs = (filters = { page: 1, limit: 20 }) => {
  return useQuery({
    queryKey: [...songKeys.matchingGenres(), filters],
    queryFn: () => songApi.fetchMatchingGenreSongs(filters),
  });
};

export const useSongsByGenre = (genre, filters = { page: 1, limit: 20 }) => {
  return useQuery({
    queryKey: [...songKeys.genre(genre), filters],
    queryFn: () => songApi.fetchByGenre({ genre, ...filters }),
    enabled: !!genre,
  });
};

export const useCreateSong = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: songApi.create,
    onSuccess: (newSong) => {
      queryClient.invalidateQueries({ queryKey: songKeys.lists() });
      queryClient.invalidateQueries({ queryKey: songKeys.singles() });
      toast.success("Song created successfully!");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create song");
    },
  });
};

export const useUpdateSong = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: songApi.update,
    onSuccess: (updatedSong) => {
      queryClient.invalidateQueries({ queryKey: songKeys.lists() });
      queryClient.invalidateQueries({ queryKey: songKeys.detail(updatedSong._id) });
      toast.success("Song updated successfully!");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update song");
    },
  });
};

export const useDeleteSong = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: songApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: songKeys.all });
      toast.success("Song deleted successfully!");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete song");
    },
  });
};