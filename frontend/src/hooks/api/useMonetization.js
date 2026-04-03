// src/hooks/useMonetization.js

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { monetizationApi } from "../../api/monetizationApi";
import { toast } from "sonner";

/* ------------------ QUERY KEYS ------------------ */
const monetizationKeys = {
  all: ["monetization"],
  status: () => [...monetizationKeys.all, "status"],
};

/* ------------------ GET STATUS ------------------ */
export const useMonetizationStatus = () => {
  return useQuery({
    queryKey: monetizationKeys.status(),
    queryFn: monetizationApi.getSetupStatus,

    staleTime: 1000 * 60 * 5, // 5 min cache
    retry: 1,

    select: (data) => ({
      isMonetizationComplete: data?.isMonetizationComplete || false,
      reason: data?.reason || null,
      setupAt: data?.setupAt || null,
    }),
  });
};

/* ------------------ SETUP ------------------ */
export const useSetupMonetization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: monetizationApi.setup,

    onSuccess: (data) => {
      // ✅ auto refetch status
      queryClient.invalidateQueries({
        queryKey: monetizationKeys.status(),
      });

      toast.success("Monetization setup successful");
    },

    onError: (err) => {
      const msg =
        err?.response?.data?.message || "Monetization failed";
      toast.error(msg);
    },
  });
};