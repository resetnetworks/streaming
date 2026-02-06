// src/hooks/api/useArtistDashboard.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { artistDashboardApi } from "../../api/artistDashboardApi";

export const artistDashboardKeys = {
  all: ["artist-dashboard"],
  profile: () => [...artistDashboardKeys.all, "profile"],
};

export const useArtistProfile = (options = {}) => {
  return useQuery({
    queryKey: artistDashboardKeys.profile(),
    queryFn: artistDashboardApi.fetchDashboardProfile,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useUpdateArtistProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: artistDashboardApi.updateProfile,
    onMutate: async (profileData) => {
      await queryClient.cancelQueries({ queryKey: artistDashboardKeys.profile() });
      
      const previousProfile = queryClient.getQueryData(artistDashboardKeys.profile());
      
      if (previousProfile) {
        queryClient.setQueryData(artistDashboardKeys.profile(), {
          ...previousProfile,
          ...profileData,
        });
      }
      
      return { previousProfile };
    },
    onError: (err, variables, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(artistDashboardKeys.profile(), context.previousProfile);
      }
    },
    onSuccess: (updatedArtist) => {
      queryClient.setQueryData(artistDashboardKeys.profile(), updatedArtist);
    },
  });
};

export const useUpdateProfileImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: artistDashboardApi.updateProfileImage,
    onMutate: async (file) => {
      await queryClient.cancelQueries({ queryKey: artistDashboardKeys.profile() });
      return { previousProfile: queryClient.getQueryData(artistDashboardKeys.profile()) };
    },
    onError: (err, variables, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(artistDashboardKeys.profile(), context.previousProfile);
      }
    },
    onSuccess: (updatedArtist) => {
      queryClient.setQueryData(artistDashboardKeys.profile(), updatedArtist);
    },
  });
};

export const useUpdateCoverImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: artistDashboardApi.updateCoverImage,
    onMutate: async (file) => {
      await queryClient.cancelQueries({ queryKey: artistDashboardKeys.profile() });
      return { previousProfile: queryClient.getQueryData(artistDashboardKeys.profile()) };
    },
    onError: (err, variables, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(artistDashboardKeys.profile(), context.previousProfile);
      }
    },
    onSuccess: (updatedArtist) => {
      queryClient.setQueryData(artistDashboardKeys.profile(), updatedArtist);
    },
  });
};

export const useUpdateFullProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ textData, profileImage, coverImage }) => 
      artistDashboardApi.updateProfileWithImages(textData, profileImage, coverImage),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: artistDashboardKeys.profile() });
      
      const previousProfile = queryClient.getQueryData(artistDashboardKeys.profile());
      
      if (previousProfile && variables.textData) {
        queryClient.setQueryData(artistDashboardKeys.profile(), {
          ...previousProfile,
          ...variables.textData,
        });
      }
      
      return { previousProfile };
    },
    onError: (err, variables, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(artistDashboardKeys.profile(), context.previousProfile);
      }
    },
    onSuccess: (updatedArtist) => {
      queryClient.setQueryData(artistDashboardKeys.profile(), updatedArtist);
    },
  });
};

export const useArtistDashboardMutations = () => {
  const updateProfile = useUpdateArtistProfile();
  const updateProfileImage = useUpdateProfileImage();
  const updateCoverImage = useUpdateCoverImage();
  const updateFullProfile = useUpdateFullProfile();
  
  return {
    updateProfile: updateProfile.mutate,
    updateProfileImage: updateProfileImage.mutate,
    updateCoverImage: updateCoverImage.mutate,
    updateFullProfile: updateFullProfile.mutate,
    isLoading: updateProfile.isLoading || updateProfileImage.isLoading || 
                updateCoverImage.isLoading || updateFullProfile.isLoading,
    isError: updateProfile.isError || updateProfileImage.isError || 
              updateCoverImage.isError || updateFullProfile.isError,
  };
};