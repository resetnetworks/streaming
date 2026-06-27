// src/hooks/api/useAdminArtistApplications.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApplicationApi } from "../../api/adminApplicationApi";
import { toast } from "sonner";

export const adminApplicationKeys = {
  all: ["admin", "artist-applications"],
  lists: () => [...adminApplicationKeys.all, "list"],
  list: (filters) => [...adminApplicationKeys.lists(), filters],
  details: () => [...adminApplicationKeys.all, "detail"],
  detail: (id) => [...adminApplicationKeys.details(), id],
};

export const useAdminApplications = (filters = {}) => {
  return useQuery({
    queryKey: adminApplicationKeys.list(filters),
    queryFn: () => adminApplicationApi.list(filters),
    keepPreviousData: true,
    staleTime: 60 * 1000, // 1 minute
  });
};

export const useAdminApplication = (id) => {
  return useQuery({
    queryKey: adminApplicationKeys.detail(id),
    queryFn: () => adminApplicationApi.fetchById(id),
    enabled: !!id,
  });
};

export const useAdminApproveApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminApplicationApi.approve,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: adminApplicationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminApplicationKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: ["artists"] }); // invalidate artists list query too!
      toast.success("Application approved successfully!");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to approve application");
    },
  });
};

export const useAdminRejectApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminApplicationApi.reject,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: adminApplicationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminApplicationKeys.detail(variables.id) });
      toast.success("Application rejected.");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to reject application");
    },
  });
};

export const useAdminRequestMoreInfo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminApplicationApi.requestMoreInfo,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: adminApplicationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminApplicationKeys.detail(variables.id) });
      toast.success("Request for more info submitted.");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to request info");
    },
  });
};

export const useAdminUpdateApplicationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminApplicationApi.updateStatus,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: adminApplicationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminApplicationKeys.detail(variables.id) });
      toast.success("Status updated successfully.");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to update status");
    },
  });
};

export const useAdminAddApplicationNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminApplicationApi.addNote,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: adminApplicationKeys.detail(variables.id) });
      toast.success("Note added successfully.");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to add note");
    },
  });
};

export const useAdminDeleteApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminApplicationApi.delete,
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: adminApplicationKeys.lists() });
      queryClient.removeQueries({ queryKey: adminApplicationKeys.detail(id) });
      toast.success("Application deleted successfully.");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to delete application");
    },
  });
};
