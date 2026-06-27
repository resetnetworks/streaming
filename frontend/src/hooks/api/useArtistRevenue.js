// src/hooks/api/useArtistRevenue.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { artistRevenueApi } from "../../api/artistRevenueApi";
import { toast } from "sonner";

export const artistRevenueKeys = {
  all: ["artist-revenue"],
  balance: () => [...artistRevenueKeys.all, "balance"],
  ledger: (filters) => [...artistRevenueKeys.all, "ledger", filters],
  payouts: () => [...artistRevenueKeys.all, "payouts"],
};

export const useArtistBalance = () => {
  return useQuery({
    queryKey: artistRevenueKeys.balance(),
    queryFn: artistRevenueApi.fetchBalance,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useArtistLedger = (filters = { page: 1, limit: 20 }) => {
  return useQuery({
    queryKey: artistRevenueKeys.ledger(filters),
    queryFn: () => artistRevenueApi.fetchLedger(filters),
    keepPreviousData: true,
    staleTime: 2 * 60 * 1000,
  });
};

export const useArtistPayouts = () => {
  return useQuery({
    queryKey: artistRevenueKeys.payouts(),
    queryFn: artistRevenueApi.fetchPayouts,
    staleTime: 2 * 60 * 1000,
  });
};

export const useRequestPayout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: artistRevenueApi.requestPayout,
    onSuccess: (data) => {
      // Invalidate balance, payouts, and ledger
      queryClient.invalidateQueries({ queryKey: artistRevenueKeys.balance() });
      queryClient.invalidateQueries({ queryKey: artistRevenueKeys.payouts() });
      queryClient.invalidateQueries({ queryKey: [...artistRevenueKeys.all, "ledger"] });
      toast.success(data?.message || "Payout requested successfully!");
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || err?.message || "Failed to request payout";
      toast.error(msg);
    },
  });
};
