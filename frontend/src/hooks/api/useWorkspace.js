import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { workspaceApi } from "../../api/workspaceApi";
import { toast } from "sonner";

/* ------------------ QUERY KEYS ------------------ */
export const workspaceKeys = {
  all: ["workspaces"],
  lists: () => [...workspaceKeys.all, "list"],
  details: () => [...workspaceKeys.all, "detail"],
  detail: (id) => [...workspaceKeys.details(), id],
  membersList: () => [...workspaceKeys.all, "members"],
  members: (workspaceId) => [...workspaceKeys.membersList(), workspaceId],
};

/* ------------------ GET MY WORKSPACES ------------------ */
export const useMyWorkspaces = (options = {}) => {
  return useQuery({
    queryKey: workspaceKeys.lists(),
    queryFn: workspaceApi.getMyWorkspaces,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    select: (res) => res?.workspaces || [],
    ...options,
  });
};

/* ------------------ GET DASHBOARD / STATS ------------------ */
export const useWorkspaceDashboard = (workspaceId) => {
  return useQuery({
    queryKey: workspaceKeys.detail(workspaceId),
    queryFn: () => workspaceApi.getWorkspaceDashboard(workspaceId),
    enabled: !!workspaceId,
    staleTime: 1000 * 60 * 2, // 2 minutes cache
  });
};

/* ------------------ GET MEMBERS ------------------ */
export const useWorkspaceMembers = (workspaceId) => {
  return useQuery({
    queryKey: workspaceKeys.members(workspaceId),
    queryFn: () => workspaceApi.getWorkspaceMembers(workspaceId),
    enabled: !!workspaceId,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    select: (res) => res?.members || [],
  });
};

/* ------------------ INVITE MEMBER ------------------ */
export const useInviteWorkspaceMember = (workspaceId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: workspaceApi.inviteWorkspaceMember,
    onSuccess: () => {
      // Refresh members list
      queryClient.invalidateQueries({
        queryKey: workspaceKeys.members(workspaceId),
      });
      toast.success("Invitation sent successfully!");
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || "Failed to send invitation";
      toast.error(msg);
    },
  });
};

/* ------------------ ACCEPT INVITE ------------------ */
export const useAcceptWorkspaceInvite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: workspaceApi.acceptInvite,
    onSuccess: () => {
      // Invalidate list of workspaces to trigger fresh fetch
      queryClient.invalidateQueries({
        queryKey: workspaceKeys.lists(),
      });
      toast.success("Invitation accepted! You are now a member of this workspace.");
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || "Failed to accept invitation";
      toast.error(msg);
    },
  });
};

/* ------------------ UPDATE MEMBER ------------------ */
export const useUpdateWorkspaceMember = (workspaceId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: workspaceApi.updateWorkspaceMember,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: workspaceKeys.members(workspaceId),
      });
      toast.success("Member updated successfully!");
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || "Failed to update member";
      toast.error(msg);
    },
  });
};

/* ------------------ REMOVE MEMBER ------------------ */
export const useRemoveWorkspaceMember = (workspaceId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: workspaceApi.removeWorkspaceMember,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: workspaceKeys.members(workspaceId),
      });
      toast.success("Member removed successfully!");
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || "Failed to remove member";
      toast.error(msg);
    },
  });
};
