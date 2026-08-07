import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { migrationApi } from "../../api/migrationApi";
import { toast } from "sonner";

export const useCreateMigration = () => {
  return useMutation({
    mutationFn: async ({ url, workspaceId }) => {
      if (!url) throw new Error("URL is required");
      return migrationApi.createMigration(url, workspaceId);
    }
  });
};

export const useMigrationStatus = (jobId, options = {}) => {
  return useQuery({
    queryKey: ["migration", jobId],
    queryFn: () => migrationApi.getMigrationStatus(jobId),
    enabled: !!jobId,
    // Allow polling via refetchInterval
    ...options
  });
};

export const useMigrationAlbums = (jobId) => {
  return useQuery({
    queryKey: ["migration-albums", jobId],
    queryFn: () => migrationApi.getMigrationAlbums(jobId),
    enabled: !!jobId,
  });
};

export const useMigrationTracks = (jobId) => {
  return useQuery({
    queryKey: ["migration-tracks", jobId],
    queryFn: () => migrationApi.getMigrationTracks(jobId),
    enabled: !!jobId,
  });
};

export const useDraftAlbums = (options = {}) => {
  return useQuery({
    queryKey: ["migration-drafts"],
    queryFn: () => migrationApi.getDraftAlbums(),
    ...options
  });
};

export const useDraftAlbumDetails = (albumId) => {
  return useQuery({
    queryKey: ["migration-draft-details", albumId],
    queryFn: () => migrationApi.getDraftAlbumDetails(albumId),
    enabled: !!albumId,
  });
};

export const useUpdateDraftAlbum = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ albumId, data }) => migrationApi.updateDraftAlbum(albumId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(["migration-draft-details", variables.albumId]);
      queryClient.invalidateQueries(["migration-drafts"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update draft album");
    }
  });
};

export const useUpdateDraftTrack = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ trackId, data }) => migrationApi.updateDraftTrack(trackId, data),
    onSuccess: () => {
      // Typically invalidate the album details that contains this track
      queryClient.invalidateQueries(["migration-draft-details"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update draft track");
    }
  });
};

export const usePublishDraftAlbum = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ albumId, data }) => migrationApi.publishDraftAlbum(albumId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["migration-drafts"]);
      // Optionally invalidate user library / albums
    }
  });
};

export const useImportMigration = () => {
  return useMutation({
    mutationFn: ({ jobId, data }) => migrationApi.importMigration(jobId, data),
    onSuccess: () => {
      toast.success("Migration imported successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to import migration");
    }
  });
};
