// src/hooks/api/useAlbums.js
import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { albumApi } from "../../api/albumApi";
import { toast } from "sonner";

// 🎯 Query Keys (IMPORTANT for caching)
export const albumKeys = {
  all: ["albums"],
  lists: () => [...albumKeys.all, "list"],
  list: (filters) => [...albumKeys.lists(), { ...filters }],
  details: () => [...albumKeys.all, "detail"],
  detail: (id) => [...albumKeys.details(), id],
  artist: (artistId, filters) => [...albumKeys.all, "artist", artistId, { ...filters }],
};

// 📥 QUERIES (GET REQUESTS)

// Get all albums with pagination
export const useAlbums = (filters = { page: 1, limit: 10 }) => {
  return useQuery({
    queryKey: albumKeys.list(filters),
    queryFn: () => albumApi.fetchAll(filters),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get all albums with infinite scroll support
export const useAlbumsInfinite = (filters = { limit: 10 }) => {
  return useInfiniteQuery({
    queryKey: ["albums", "infinite", filters],
    queryFn: ({ pageParam = 1 }) => 
      albumApi.fetchAll({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.pagination?.page || 1;
      const totalPages = lastPage.pagination?.totalPages || 1;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    keepPreviousData: true,
    staleTime: 30 * 1000,
  });
};

// Get single album by ID/slug
export const useAlbum = (id, options = {}) => {
  return useQuery({
    queryKey: albumKeys.detail(id),
    queryFn: () => albumApi.fetchById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

// Get albums by artist (infinite scroll ready)
export const useArtistAlbums = (artistId, filters = { limit: 10 }) => {
  return useInfiniteQuery({
    queryKey: albumKeys.artist(artistId, filters),
    queryFn: ({ pageParam = 1 }) =>
      albumApi.fetchByArtist({ 
        artistId, 
        page: pageParam, 
        limit: filters.limit 
      }),
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.pagination?.page || 1;
      const totalPages = lastPage.pagination?.totalPages || 1;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled: !!artistId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get artist albums without infinite scroll
export const useArtistAlbumsSimple = (artistId, limit = 10) => {
  return useQuery({
    queryKey: albumKeys.artist(artistId, { limit }),
    queryFn: () => albumApi.fetchByArtist({ artistId, page: 1, limit }),
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
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: albumKeys.lists() });
      
      // Optimistically update cache for artist's albums
      if (formData.artistId) {
        const artistAlbumsKey = albumKeys.artist(formData.artistId, {});
        const previousArtistAlbums = queryClient.getQueryData(artistAlbumsKey);
        
        if (previousArtistAlbums) {
          const optimisticAlbum = {
            _id: `temp-${Date.now()}`,
            title: formData.title,
            coverImageKey: null,
            artist: { _id: formData.artistId },
            createdAt: new Date().toISOString(),
          };
          
          queryClient.setQueryData(artistAlbumsKey, (old) => {
            if (!old?.albums) return old;
            return {
              ...old,
              albums: [optimisticAlbum, ...old.albums],
            };
          });
          
          return { previousArtistAlbums };
        }
      }
      
      return {};
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousArtistAlbums && variables.artistId) {
        const artistAlbumsKey = albumKeys.artist(variables.artistId, {});
        queryClient.setQueryData(artistAlbumsKey, context.previousArtistAlbums);
      }
      toast.error(err.response?.data?.message || err.message || "Failed to create album");
    },
    onSuccess: (newAlbum) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: albumKeys.lists() });
      
      if (newAlbum.artist?.id) {
        queryClient.invalidateQueries({ 
          queryKey: albumKeys.artist(newAlbum.artist.id, {}) 
        });
      }
      
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
      const { albumId, formData } = variables;
      
      // Cancel outgoing queries
      await queryClient.cancelQueries(albumKeys.detail(albumId));
      
      // Snapshot previous value
      const previousAlbum = queryClient.getQueryData(albumKeys.detail(albumId));
      
      // Optimistic update
      if (previousAlbum) {
        const updatedAlbum = {
          ...previousAlbum,
          ...formData,
          updatedAt: new Date().toISOString(),
        };
        
        queryClient.setQueryData(albumKeys.detail(albumId), updatedAlbum);
      }
      
      return { previousAlbum };
    },
    onError: (err, variables, context) => {
      // Rollback
      if (context?.previousAlbum) {
        queryClient.setQueryData(albumKeys.detail(variables.albumId), context.previousAlbum);
      }
      toast.error(err.response?.data?.message || err.message || "Failed to update album");
    },
    onSuccess: (updatedAlbum) => {
      // Invalidate affected queries
      queryClient.invalidateQueries({ queryKey: albumKeys.lists() });
      queryClient.invalidateQueries({ queryKey: albumKeys.detail(updatedAlbum.id) });
      
      if (updatedAlbum.artist?.id) {
        queryClient.invalidateQueries({ 
          queryKey: albumKeys.artist(updatedAlbum.artist.id, {}) 
        });
      }
      
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
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: albumKeys.lists() });
      
      // Get album details before deletion for artist ID
      const albumDetail = queryClient.getQueryData(albumKeys.detail(albumId));
      const artistId = albumDetail?.artist?.id;
      
      // Optimistically remove from lists
      queryClient.setQueryData(albumKeys.list({ page: 1, limit: 10 }), (old) => {
        if (!old?.albums) return old;
        return {
          ...old,
          albums: old.albums.filter(album => album._id !== albumId),
        };
      });
      
      // Optimistically remove from artist's albums
      if (artistId) {
        const artistAlbumsKey = albumKeys.artist(artistId, {});
        const previousArtistAlbums = queryClient.getQueryData(artistAlbumsKey);
        
        if (previousArtistAlbums) {
          queryClient.setQueryData(artistAlbumsKey, (old) => {
            if (!old?.albums) return old;
            return {
              ...old,
              albums: old.albums.filter(album => album._id !== albumId),
            };
          });
          
          return { previousArtistAlbums };
        }
      }
      
      return {};
    },
    onError: (err, albumId, context) => {
      // Rollback
      queryClient.invalidateQueries({ queryKey: albumKeys.lists() });
      
      if (context?.previousArtistAlbums) {
        // Find artist ID from cache
        const albumDetail = queryClient.getQueryData(albumKeys.detail(albumId));
        const artistId = albumDetail?.artist?.id;
        
        if (artistId) {
          const artistAlbumsKey = albumKeys.artist(artistId, {});
          queryClient.setQueryData(artistAlbumsKey, context.previousArtistAlbums);
        }
      }
      
      toast.error(err.response?.data?.message || err.message || "Failed to delete album");
    },
    onSuccess: (deletedAlbumId, variables, context) => {
      // Invalidate all album queries
      queryClient.invalidateQueries({ queryKey: albumKeys.all });
      toast.success("Album deleted successfully!");
    },
  });
};

// Helper function for form data preparation
export const prepareAlbumFormData = (albumData) => {
  const formData = new FormData();
  
  Object.keys(albumData).forEach((key) => {
    const value = albumData[key];
    
    if (value === undefined || value === null) return;
    
    if (key === 'coverImage' && value instanceof File) {
      formData.append('coverImage', value);
    } else if (Array.isArray(value)) {
      value.forEach((item) => formData.append(key, item));
    } else if (typeof value === 'object' && !(value instanceof File)) {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, value);
    }
  });
  
  return formData;
};