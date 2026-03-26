import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { workspaceApi } from "../../api/workspaceApi";
import { toast } from "sonner";

// 🎯 Query Keys
export const workspaceKeys = {
  all: ["workspaces"],

  my: () => [...workspaceKeys.all, "my"],

  dashboard: (workspaceId) => [
    ...workspaceKeys.all,
    "dashboard",
    workspaceId,
  ],

  members: (workspaceId) => [
    ...workspaceKeys.all,
    "members",
    workspaceId,
  ],
};

//
// 📥 QUERIES
//

// ✅ Get My Workspaces
export const useMyWorkspaces = () => {
  return useQuery({
    queryKey: workspaceKeys.my(),
    queryFn: workspaceApi.fetchMyWorkspaces,
    staleTime: 5 * 60 * 1000,
  });
};

// ✅ Get Workspace Dashboard
export const useWorkspaceDashboard = (workspaceId) => {
  return useQuery({
    queryKey: workspaceKeys.dashboard(workspaceId),
    queryFn: () =>
      workspaceApi.fetchWorkspaceDashboard(workspaceId),
    enabled: !!workspaceId,
  });
};

// ✅ Get Workspace Members
export const useWorkspaceMembers = (workspaceId) => {
  return useQuery({
    queryKey: workspaceKeys.members(workspaceId),
    queryFn: () => workspaceApi.fetchMembers(workspaceId),
    enabled: !!workspaceId,
  });
};

//
// 📤 MUTATIONS
//

// ✉️ Invite Member
export const useInviteMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: workspaceApi.inviteMember,

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: workspaceKeys.members(variables.workspaceId),
      });

      toast.success("Invite sent successfully!");
    },

    onError: (err) => {
      toast.error(err.message || "Failed to send invite");
    },
  });
};

// ❌ Remove Member
export const useRemoveMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: workspaceApi.removeMember,

    onMutate: async ({ workspaceId, userId }) => {
      await queryClient.cancelQueries({
        queryKey: workspaceKeys.members(workspaceId),
      });

      const previousMembers = queryClient.getQueryData(
        workspaceKeys.members(workspaceId)
      );

      // Optimistic update
      queryClient.setQueryData(
        workspaceKeys.members(workspaceId),
        (old) => old?.filter((m) => m.userId._id !== userId)
      );

      return { previousMembers };
    },

    onError: (err, variables, context) => {
      if (context?.previousMembers) {
        queryClient.setQueryData(
          workspaceKeys.members(variables.workspaceId),
          context.previousMembers
        );
      }

      toast.error(err.message || "Failed to remove member");
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: workspaceKeys.members(variables.workspaceId),
      });

      toast.success("Member removed successfully");
    },
  });
};

// ✏️ Update Member
export const useUpdateMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: workspaceApi.updateMember,

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: workspaceKeys.members(variables.workspaceId),
      });

      toast.success("Member updated successfully");
    },

    onError: (err) => {
      toast.error(err.message || "Update failed");
    },
  });
};

// ✅ Accept Invite
export const useAcceptInvite = () => {
  return useMutation({
    mutationFn: workspaceApi.acceptInvite,

    onSuccess: () => {
      toast.success("Joined workspace successfully!");
    },

    onError: (err) => {
      toast.error(err.message || "Invalid or expired invite");
    },
  });
};

//
// 🎯 HELPER HOOKS
//

// Prefetch workspace dashboard
export const usePrefetchWorkspace = (workspaceId) => {
  const queryClient = useQueryClient();

  return () => {
    if (workspaceId) {
      queryClient.prefetchQuery({
        queryKey: workspaceKeys.dashboard(workspaceId),
        queryFn: () =>
          workspaceApi.fetchWorkspaceDashboard(workspaceId),
        staleTime: 5 * 60 * 1000,
      });
    }
  };
};

// Get cached workspace
export const useCachedWorkspace = (workspaceId) => {
  const queryClient = useQueryClient();
  return queryClient.getQueryData(
    workspaceKeys.dashboard(workspaceId)
  );
};

// Clear specific workspace cache
export const useClearWorkspaceCache = () => {
  const queryClient = useQueryClient();

  return (workspaceId) => {
    queryClient.removeQueries({
      queryKey: workspaceKeys.dashboard(workspaceId),
    });

    queryClient.removeQueries({
      queryKey: workspaceKeys.members(workspaceId),
    });
  };
};

// Clear all workspace cache
export const useClearAllWorkspaceCaches = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.removeQueries({ queryKey: workspaceKeys.all });
    toast.success("Workspace cache cleared!");
  };
};