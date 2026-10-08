// src/hooks/api/useReferrals.js
import { useQuery } from "@tanstack/react-query";
import { referralApi } from "../../api/referralApi";

export const referralKeys = {
  all: ["referrals"],
  myCode: () => [...referralKeys.all, "my-code"],
  myReferrals: () => [...referralKeys.all, "my-referrals"],
};

/**
 * Hook to retrieve or generate the current artist's referral code and shareable link.
 */
export const useMyReferralCode = (options = {}) => {
  return useQuery({
    queryKey: referralKeys.myCode(),
    queryFn: referralApi.getMyReferralCode,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to retrieve referral program metrics and the list of referees with progress stages.
 */
export const useMyReferrals = (options = {}) => {
  return useQuery({
    queryKey: referralKeys.myReferrals(),
    queryFn: referralApi.getMyReferrals,
    staleTime: 60 * 1000,
    ...options,
  });
};
