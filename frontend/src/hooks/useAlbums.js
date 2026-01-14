// src/hooks/useAlbums.js
import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { albumApi } from "../api/albumApi";
import { toast } from "sonner";

// 🎯 Query Keys (IMPORTANT for caching)
export const albumKeys = {
  all: ["albums"],
  lists: () => [...albumKeys.all, "list"],
  list: (filters) => [...albumKeys.lists(), filters],
  details: () => [...albumKeys.all, "detail"],
  detail: (id) => [...albumKeys.details(), id],
  artist: (artistId) => [...albumKeys.all, "artist", artistId],
};

// 📥 QUERIES (GET REQUESTS)

// Get all albums with pagination (for AlbumsSection)
export const useAlbums = (filters = { page: 1, limit: 10 }) => {
  return useQuery({
    queryKey: albumKeys.list(filters),
    queryFn: () => albumApi.fetchAll(filters),
    keepPreviousData: true, // Smooth pagination
  });
};

// Get all albums with infinite scroll support (NEW)
export const useAlbumsInfinite = (limit = 10) => {
  return useInfiniteQuery({
    queryKey: ["albums", "infinite", limit],
    queryFn: ({ pageParam = 1 }) => 
      albumApi.fetchAll({ page: pageParam, limit }),
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.pagination?.page || 1;
      const totalPages = lastPage.pagination?.totalPages || 1;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    // Better user experience for infinite scroll
    keepPreviousData: true,
    staleTime: 30 * 1000, // 30 seconds for better infinite scroll
  });
};

// Get single album by ID/slug
export const useAlbum = (id) => {
  return useQuery({
    queryKey: albumKeys.detail(id),
    queryFn: () => albumApi.fetchById(id),
    enabled: !!id, // Only run when id exists
  });
};

// Get albums by artist (infinite scroll ready)
export const useArtistAlbums = (artistId, limit = 10) => {
  return useInfiniteQuery({
    queryKey: albumKeys.artist(artistId),
    queryFn: ({ pageParam = 1 }) =>
      albumApi.fetchByArtist({ artistId, page: pageParam, limit }),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    enabled: !!artistId,
  });
};

// 📤 MUTATIONS (POST/PUT/DELETE)

// Create album mutation
export const useCreateAlbum = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: albumApi.create,
    onMutate: async (formData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: albumKeys.lists() });
      
      // Snapshot previous value
      const previousAlbums = queryClient.getQueryData(albumKeys.list({ page: 1, limit: 10 }));
      
      return { previousAlbums };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousAlbums) {
        queryClient.setQueryData(albumKeys.list({ page: 1, limit: 10 }), context.previousAlbums);
      }
      toast.error(err.message || "Failed to create album");
    },
    onSuccess: (newAlbum) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: albumKeys.lists() });
      toast.success("Album created successfully!");
    },
  });
};

// Update album mutation
export const useUpdateAlbum = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: albumApi.update,
    onMutate: async (variables) => {
      const { albumId } = variables;
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries(albumKeys.detail(albumId));
      
      // Snapshot previous value
      const previousAlbum = queryClient.getQueryData(albumKeys.detail(albumId));
      
      return { previousAlbum };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousAlbum) {
        queryClient.setQueryData(albumKeys.detail(variables.albumId), context.previousAlbum);
      }
      toast.error(err.message || "Failed to update album");
    },
    onSuccess: (updatedAlbum) => {
      // Invalidate affected queries
      queryClient.invalidateQueries({ queryKey: albumKeys.lists() });
      queryClient.invalidateQueries({ queryKey: albumKeys.detail(updatedAlbum._id) });
      toast.success("Album updated successfully!");
    },
  });
};

// Delete album mutation
export const useDeleteAlbum = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: albumApi.delete,
    onMutate: async (albumId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: albumKeys.lists() });
      
      // Snapshot previous value
      const previousAlbums = queryClient.getQueryData(albumKeys.list({ page: 1, limit: 10 }));
      
      // Optimistically remove album
      queryClient.setQueryData(albumKeys.list({ page: 1, limit: 10 }), (old) => {
        if (!old?.albums) return old;
        return {
          ...old,
          albums: old.albums.filter(album => album._id !== albumId),
        };
      });
      
      return { previousAlbums };
    },
    onError: (err, albumId, context) => {
      // Rollback on error
      if (context?.previousAlbums) {
        queryClient.setQueryData(albumKeys.list({ page: 1, limit: 10 }), context.previousAlbums);
      }
      toast.error(err.message || "Failed to delete album");
    },
    onSuccess: () => {
      // Invalidate all album queries
      queryClient.invalidateQueries({ queryKey: albumKeys.all });
      toast.success("Album deleted successfully!");
    },
  });
};