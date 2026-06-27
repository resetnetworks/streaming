// src/hooks/api/useAdminPayments.js
import { useQuery } from "@tanstack/react-query";
import { adminPaymentApi } from "../../api/adminPaymentApi";

export const adminPaymentKeys = {
  all: ["admin-payments"],
  transactions: (filters) => [...adminPaymentKeys.all, "transactions", filters],
  songs: (artistId) => [...adminPaymentKeys.all, "songs", artistId],
  albums: (artistId) => [...adminPaymentKeys.all, "albums", artistId],
  subscribers: (artistId) => [...adminPaymentKeys.all, "subscribers", artistId],
  revenue: (artistId) => [...adminPaymentKeys.all, "revenue", artistId],
};

export const useArtistTransactions = (filters = {}) => {
  return useQuery({
    queryKey: adminPaymentKeys.transactions(filters),
    queryFn: () => adminPaymentApi.fetchArtistTransactions(filters),
    enabled: !!filters.artistId,
    staleTime: 60 * 1000,
  });
};

export const useArtistPurchasedSongs = (artistId) => {
  return useQuery({
    queryKey: adminPaymentKeys.songs(artistId),
    queryFn: () => adminPaymentApi.fetchPurchasedSongs(artistId),
    enabled: !!artistId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useArtistPurchasedAlbums = (artistId) => {
  return useQuery({
    queryKey: adminPaymentKeys.albums(artistId),
    queryFn: () => adminPaymentApi.fetchPurchasedAlbums(artistId),
    enabled: !!artistId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useArtistSubscriberCount = (artistId) => {
  return useQuery({
    queryKey: adminPaymentKeys.subscribers(artistId),
    queryFn: () => adminPaymentApi.fetchSubscriberCount(artistId),
    enabled: !!artistId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useArtistRevenueSummary = (artistId) => {
  return useQuery({
    queryKey: adminPaymentKeys.revenue(artistId),
    queryFn: () => adminPaymentApi.fetchArtistRevenue(artistId),
    enabled: !!artistId,
    staleTime: 2 * 60 * 1000,
  });
};
