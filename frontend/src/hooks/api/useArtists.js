// src/hooks/useArtists.js
import {
  useQuery,
  useMutation,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { artistApi } from "../../api/artistApi";
import { toast } from "sonner";

// 🎯 Query Keys (IMPORTANT for caching)
export const artistKeys = {
  all: ["artists"],
  lists: () => [...artistKeys.all, "list"],
  list: (filters) => [...artistKeys.lists(), filters],
  details: () => [...artistKeys.all, "detail"],
  detail: (id) => [...artistKeys.details(), id],
  profile: () => [...artistKeys.all, "profile"],
  fullList: () => [...artistKeys.all, "full-list"],
  random: () => [...artistKeys.all, "random"],
  search: (query) => [...artistKeys.all, "search", query],
  subscriberCounts: () => [...artistKeys.all, "subscriber-count"],
  subscriberCount: (artistId) => [...artistKeys.subscriberCounts(), artistId],
};

// 📥 QUERIES (GET REQUESTS)

// Get all artists with pagination
export const useArtists = (filters = { page: 1, limit: 10 }) => {
  return useQuery({
    queryKey: artistKeys.list(filters),
    queryFn: () => artistApi.fetchAll(filters),
    keepPreviousData: true, // Smooth pagination
    staleTime: 5 * 60 * 1000, // 5 minutes cache (matches your Redux cache)
  });
};

// Get all artists with infinite scroll support
export const useArtistsInfinite = (limit = 10) => {
  return useInfiniteQuery({
    queryKey: artistKeys.list({ infinite: true, limit }),
    queryFn: ({ pageParam = 1 }) =>
      artistApi.fetchAll({ page: pageParam, limit }),
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.pagination?.page || 1;
      const totalPages = lastPage.pagination?.totalPages || 1;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    keepPreviousData: true,
    staleTime: 30 * 1000, // 30 seconds for better infinite scroll
  });
};

// Get all artists without pagination (for dropdowns, etc.)
export const useAllArtists = () => {
  return useQuery({
    queryKey: artistKeys.fullList(),
    queryFn: artistApi.fetchAllNoPagination,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
};

// Get single artist by ID/slug
export const useArtist = (id) => {
  return useQuery({
    queryKey: artistKeys.detail(id),
    queryFn: () => artistApi.fetchById(id),
    enabled: !!id, // Only run when id exists
  });
};

// Get artist's own profile
export const useArtistProfile = () => {
  return useQuery({
    queryKey: artistKeys.profile(),
    queryFn: artistApi.fetchProfile,
    staleTime: 2 * 60 * 1000, // 2 minutes cache for profile
  });
};

// Get random artist with songs
export const useRandomArtistWithSongs = (filters = { page: 1, limit: 10 }) => {
  return useQuery({
    queryKey: artistKeys.list({ ...filters, random: true }),
    queryFn: () => artistApi.fetchRandomArtistWithSongs(filters),
  });
};

// Search artists
export const useSearchArtists = ({ query, page = 1, limit = 10 }, enabled = true) => {
  return useQuery({
    queryKey: artistKeys.search({ query, page, limit }),
    queryFn: () => artistApi.search({ query, page, limit }),
    enabled: !!query && enabled, // Only run when query exists and enabled is true
    keepPreviousData: true,
  });
};

// Get subscriber count for artist
export const useSubscriberCount = (artistId) => {
  return useQuery({
    queryKey: artistKeys.subscriberCount(artistId),
    queryFn: () => artistApi.fetchSubscriberCount(artistId),
    enabled: !!artistId,
    staleTime: 2 * 60 * 1000, // 2 minutes cache (matches your Redux cache)
  });
};

// Get subscriber count for multiple artists (parallel queries)
export const useSubscriberCounts = (artistIds) => {
  return useQueries({
    queries: artistIds.map((artistId) => ({
      queryKey: artistKeys.subscriberCount(artistId),
      queryFn: () => artistApi.fetchSubscriberCount(artistId),
      enabled: !!artistId,
      staleTime: 2 * 60 * 1000,
    })),
  });
};

// 📤 MUTATIONS (POST/PUT/DELETE)

// Create artist mutation
export const useCreateArtist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: artistApi.create,
    onMutate: async (formData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: artistKeys.lists() });
      await queryClient.cancelQueries({ queryKey: artistKeys.fullList() });

      // Snapshot previous values
      const previousArtists = queryClient.getQueryData(
        artistKeys.list({ page: 1, limit: 10 })
      );
      const previousFullList = queryClient.getQueryData(artistKeys.fullList());

      return { previousArtists, previousFullList };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousArtists) {
        queryClient.setQueryData(
          artistKeys.list({ page: 1, limit: 10 }),
          context.previousArtists
        );
      }
      if (context?.previousFullList) {
        queryClient.setQueryData(artistKeys.fullList(), context.previousFullList);
      }
      toast.error(err.message || "Failed to create artist");
    },
    onSuccess: (newArtist) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: artistKeys.lists() });
      queryClient.invalidateQueries({ queryKey: artistKeys.fullList() });
      toast.success("Artist created successfully!");
    },
  });
};

// Update artist profile mutation
export const useUpdateArtistProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: artistApi.updateProfile,
    onMutate: async (variables) => {
      const { id } = variables;

      // Cancel any outgoing refetches
      await queryClient.cancelQueries(artistKeys.profile());
      await queryClient.cancelQueries(artistKeys.detail(id));

      // Snapshot previous values
      const previousProfile = queryClient.getQueryData(artistKeys.profile());
      const previousArtist = queryClient.getQueryData(artistKeys.detail(id));

      // Optimistically update profile
      if (previousProfile) {
        queryClient.setQueryData(artistKeys.profile(), (old) => ({
          ...old,
          ...variables.formData,
        }));
      }

      return { previousProfile, previousArtist };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousProfile) {
        queryClient.setQueryData(artistKeys.profile(), context.previousProfile);
      }
      if (context?.previousArtist) {
        queryClient.setQueryData(
          artistKeys.detail(variables.id),
          context.previousArtist
        );
      }
      toast.error(err.message || "Failed to update artist profile");
    },
    onSuccess: (updatedArtist) => {
      // Invalidate affected queries
      queryClient.invalidateQueries({ queryKey: artistKeys.lists() });
      queryClient.invalidateQueries({ queryKey: artistKeys.fullList() });
      queryClient.invalidateQueries({ queryKey: artistKeys.profile() });
      queryClient.invalidateQueries({ queryKey: artistKeys.detail(updatedArtist._id || updatedArtist.id) });
      
      toast.success("Artist profile updated successfully!");
    },
  });
};

// Delete artist mutation
export const useDeleteArtist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: artistApi.delete,
    onMutate: async (artistId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: artistKeys.lists() });
      await queryClient.cancelQueries({ queryKey: artistKeys.fullList() });
      await queryClient.cancelQueries(artistKeys.subscriberCount(artistId));

      // Snapshot previous values
      const previousArtists = queryClient.getQueryData(
        artistKeys.list({ page: 1, limit: 10 })
      );
      const previousFullList = queryClient.getQueryData(artistKeys.fullList());

      // Optimistically remove artist from lists
      if (previousArtists?.artists) {
        queryClient.setQueryData(
          artistKeys.list({ page: 1, limit: 10 }),
          (old) => ({
            ...old,
            artists: old.artists.filter((artist) => artist._id !== artistId),
          })
        );
      }

      if (previousFullList) {
        queryClient.setQueryData(
          artistKeys.fullList(),
          (old) => old.filter((artist) => artist._id !== artistId)
        );
      }

      // Remove subscriber count
      queryClient.removeQueries(artistKeys.subscriberCount(artistId));

      return { previousArtists, previousFullList };
    },
    onError: (err, artistId, context) => {
      // Rollback on error
      if (context?.previousArtists) {
        queryClient.setQueryData(
          artistKeys.list({ page: 1, limit: 10 }),
          context.previousArtists
        );
      }
      if (context?.previousFullList) {
        queryClient.setQueryData(artistKeys.fullList(), context.previousFullList);
      }
      toast.error(err.message || "Failed to delete artist");
    },
    onSuccess: (deletedArtistId) => {
      // Invalidate all artist queries
      queryClient.invalidateQueries({ queryKey: artistKeys.all });
      queryClient.removeQueries(artistKeys.subscriberCount(deletedArtistId));
      toast.success("Artist deleted successfully!");
    },
  });
};

// 🎯 Helper Hooks

// Hook to prefetch artist data
export const usePrefetchArtist = (artistId) => {
  const queryClient = useQueryClient();

  return () => {
    if (artistId) {
      queryClient.prefetchQuery({
        queryKey: artistKeys.detail(artistId),
        queryFn: () => artistApi.fetchById(artistId),
        staleTime: 5 * 60 * 1000,
      });
    }
  };
};

// Hook to prefetch paginated artists
export const usePrefetchArtistsPage = (page, limit = 10) => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.prefetchQuery({
      queryKey: artistKeys.list({ page, limit }),
      queryFn: () => artistApi.fetchAll({ page, limit }),
      staleTime: 5 * 60 * 1000,
    });
  };
};

// Hook to get cached artist data
export const useCachedArtist = (artistId) => {
  const queryClient = useQueryClient();
  return queryClient.getQueryData(artistKeys.detail(artistId));
};

// Hook to update artist cache manually
export const useUpdateArtistCache = () => {
  const queryClient = useQueryClient();

  return (artistId, updates) => {
    queryClient.setQueryData(artistKeys.detail(artistId), (old) => {
      if (!old) return old;
      return { ...old, ...updates };
    });

    // Also update in lists if present
    queryClient.setQueriesData(
      { queryKey: artistKeys.lists() },
      (old) => {
        if (!old?.artists) return old;
        return {
          ...old,
          artists: old.artists.map((artist) =>
            artist._id === artistId ? { ...artist, ...updates } : artist
          ),
        };
      }
    );

    // Update in full list
    queryClient.setQueryData(artistKeys.fullList(), (old) => {
      if (!Array.isArray(old)) return old;
      return old.map((artist) =>
        artist._id === artistId ? { ...artist, ...updates } : artist
      );
    });
  };
};

// Hook to clear specific artist caches
export const useClearArtistCache = () => {
  const queryClient = useQueryClient();

  return (artistId) => {
    queryClient.removeQueries(artistKeys.detail(artistId));
    queryClient.removeQueries(artistKeys.subscriberCount(artistId));
    queryClient.invalidateQueries({ queryKey: artistKeys.lists() });
    queryClient.invalidateQueries({ queryKey: artistKeys.fullList() });
  };
};

// Hook to clear all artist caches
export const useClearAllArtistCaches = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.removeQueries({ queryKey: artistKeys.all });
    toast.success("Artist cache cleared!");
  };
};