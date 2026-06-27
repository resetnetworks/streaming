// src/hooks/api/useAdminPayouts.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminPayoutApi } from "../../api/adminPayoutApi";
import { toast } from "sonner";

export const adminPayoutKeys = {
  all: ["admin-payouts"],
  list: (status) => [...adminPayoutKeys.all, "list", { status }],
};

export const usePendingPayouts = (status = "requested") => {
  return useQuery({
    queryKey: adminPayoutKeys.list(status),
    queryFn: () => adminPayoutApi.fetchPayouts({ status }),
    staleTime: 60 * 1000,
  });
};

export const useMarkPayoutAsPaid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminPayoutApi.markAsPaid,
    onSuccess: (data) => {
      // Invalidate payouts list
      queryClient.invalidateQueries({ queryKey: adminPayoutKeys.all });
      toast.success(data?.message || "Payout processed successfully.");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to process payout");
    },
  });
};
