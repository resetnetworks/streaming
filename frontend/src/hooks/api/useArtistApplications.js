// src/hooks/api/useArtistApplications.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { artistApplicationApi } from "../../api/artistApplicationApi";
import { toast } from "sonner";

export const artistApplicationKeys = {
  all: ["artist-applications"],
  myApplication: () => [...artistApplicationKeys.all, "me"],
  userRole: () => [...artistApplicationKeys.all, "user-role"],
};

export const useMyApplication = (options = {}) => {
  return useQuery({
    queryKey: artistApplicationKeys.myApplication(),
    queryFn: async () => {
      try {
        return await artistApplicationApi.fetchMyApplication();
      } catch (err) {
        const status = err.response?.status;
        const msg = err.response?.data?.message || err.message || "";
        // If 404, 403, or 500 indicating no application, return null
        if (
          status === 404 ||
          status === 403 ||
          (status === 500 && (msg.includes("No artist application") || msg.includes("not found")))
        ) {
          return null;
        }
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useCheckUserArtistRole = (options = {}) => {
  return useQuery({
    queryKey: artistApplicationKeys.userRole(),
    queryFn: async () => {
      try {
        const user = await artistApplicationApi.checkUserRole();
        const isArtist =
          user?.role === "artist" ||
          (Array.isArray(user?.roles) && user.roles.includes("artist"));
        return { isArtist, user };
      } catch (err) {
        return { isArtist: false, user: null };
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useSubmitApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: artistApplicationApi.submit,
    onSuccess: (data) => {
      queryClient.setQueryData(artistApplicationKeys.myApplication(), data);
      queryClient.invalidateQueries({ queryKey: artistApplicationKeys.myApplication() });
      queryClient.invalidateQueries({ queryKey: artistApplicationKeys.userRole() });
      toast.success("Artist application submitted successfully!");
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || err?.message || "Failed to submit application";
      toast.error(msg);
    },
  });
};
