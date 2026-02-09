import {
  useQuery,
  useMutation,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
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

/* ------------------ Queries ------------------ */

export const useSongs = (filters = { page: 1, limit: 10 }) =>
  useQuery({
    queryKey: songKeys.list(filters),
    queryFn: () => songApi.fetchAll(filters),
    keepPreviousData: true,
  });

export const useSong = (id) =>
  useQuery({
    queryKey: songKeys.detail(id),
    queryFn: () => songApi.fetchById(id),
    enabled: !!id,
  });

export const useArtistSongs = (artistId, limit = 10) =>
  useInfiniteQuery({
    queryKey: songKeys.artist(artistId),
    queryFn: ({ pageParam = 1 }) =>
      songApi.fetchByArtist({ artistId, page: pageParam, limit }),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination || {};
      return page < totalPages ? page + 1 : undefined;
    },
    enabled: !!artistId,
  });

export const useAlbumSongs = (albumId) =>
  useQuery({
    queryKey: songKeys.album(albumId),
    queryFn: () => songApi.fetchByAlbum(albumId),
    enabled: !!albumId,
  });

export const useLikedSongs = (limit = 20) =>
  useInfiniteQuery({
    queryKey: songKeys.likedList({ limit }),
    queryFn: ({ pageParam = 1 }) =>
      songApi.fetchLikedSongs({ page: pageParam, limit }),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.pages ? lastPage.page + 1 : undefined,
  });

/* ------------------ Singles Queries ------------------ */

export const useArtistSingles = (artistId, limit = 10) =>
  useInfiniteQuery({
    queryKey: songKeys.singlesArtist(artistId),
    queryFn: ({ pageParam = 1 }) =>
      songApi.fetchSinglesByArtist({ artistId, page: pageParam, limit }),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination || {};
      return page < totalPages ? page + 1 : undefined;
    },
    enabled: !!artistId,
  });

export const useAllSingles = (filters = { page: 1, limit: 10 }) =>
  useQuery({
    queryKey: songKeys.singlesList(filters),
    queryFn: () => songApi.fetchAllSingles(filters),
    keepPreviousData: true,
  });

/* ------------------ Genre Queries ------------------ */

export const useMatchingGenreSongs = (limit = 20) =>
  useInfiniteQuery({
    queryKey: songKeys.matchingGenres(),
    queryFn: ({ pageParam = 1 }) =>
      songApi.fetchMatchingGenreSongs({ page: pageParam, limit }),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination || {};
      return page < totalPages ? page + 1 : undefined;
    },
  });

export const useGenreSongs = (genre, limit = 20) =>
  useInfiniteQuery({
    queryKey: songKeys.genre(genre),
    queryFn: ({ pageParam = 1 }) =>
      songApi.fetchByGenre({ genre, page: pageParam, limit }),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination || {};
      return page < totalPages ? page + 1 : undefined;
    },
    enabled: !!genre,
  });

/* ------------------ Mutations ------------------ */

export const useCreateSong = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: songApi.create,
    onSuccess: (song) => {
      queryClient.invalidateQueries({ queryKey: songKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: songKeys.artist(song.artist),
      });

      if (song.album) {
        queryClient.invalidateQueries({
          queryKey: songKeys.album(song.album),
        });
      }
    },
    onError: (err) => {
    },
  });
};

export const useUpdateSong = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: songApi.update,
    onSuccess: (song) => {
      queryClient.invalidateQueries({ queryKey: songKeys.detail(song.id) });
      queryClient.invalidateQueries({
        queryKey: songKeys.artist(song.artist),
      });
    },
    onError: (err) => {
    },
  });
};

export const useDeleteSong = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: songApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: songKeys.all });
    },
    onError: (err) => {
    },
  });
};

export const useUnlikeSong = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: songApi.unlikeSong,

    // 🔥 Optimistic Update
    onMutate: async (songId) => {
      await queryClient.cancelQueries({ queryKey: songKeys.liked() });

      const previousData = queryClient.getQueryData(
        songKeys.likedList({ limit: 20 })
      );

      // Remove song from cache instantly
      queryClient.setQueryData(
        songKeys.likedList({ limit: 20 }),
        (old) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              songs: page.songs.filter((s) => s.id !== songId),
            })),
          };
        }
      );

      return { previousData };
    },

    // ❌ Rollback if error
    onError: (err, songId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          songKeys.likedList({ limit: 20 }),
          context.previousData
        );
      }
      toast.error("Failed to unlike song");
    },

    // ✅ Final sync
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: songKeys.liked() });
    },
  });
};
