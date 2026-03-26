// src/hooks/api/useCurrentWorkspace.js

import { useMyWorkspaces } from "./useWorkspaces";
import { useQueryClient } from "@tanstack/react-query";

export const useCurrentWorkspace = () => {
  const queryClient = useQueryClient();

  const {
    data: workspaces,
    isLoading: isWorkspacesLoading,
  } = useMyWorkspaces();

  let workspaceId = null;
  let currentWorkspace = null;

  // 🔥 STEP 1: Try to get saved workspace (future ready)
  const savedWorkspaceId =
    typeof window !== "undefined"
      ? localStorage.getItem("currentWorkspaceId")
      : null;

  if (workspaces && Array.isArray(workspaces) && workspaces.length > 0) {
    // 🔥 STEP 2: If saved workspace exists → use that
    if (savedWorkspaceId) {
      const matched = workspaces.find(
        (ws) => ws.workspaceId?.toString() === savedWorkspaceId
      );

      if (matched) {
        workspaceId = matched.workspaceId?.toString();
        currentWorkspace = matched;
      }
    }

    // 🔥 STEP 3: fallback → first workspace
    if (!workspaceId) {
      const fallback = workspaces[0];

      workspaceId = fallback.workspaceId?.toString();
      currentWorkspace = fallback;

      // 🔥 save for next time
      localStorage.setItem(
        "currentWorkspaceId",
        fallback.workspaceId?.toString()
      );
    }
  }

  return {
    workspaceId,
    currentWorkspace,
    role: currentWorkspace?.role || null,
    permissions: currentWorkspace?.permissions || {},
    isLoading: isWorkspacesLoading,
  };
};