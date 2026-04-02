import React, { useMemo, useState, useRef, useEffect } from "react";
import { FiMapPin } from "react-icons/fi";
import { HiUsers } from "react-icons/hi";
import { FaCheckCircle } from "react-icons/fa";
import { FiAlertTriangle, FiX } from "react-icons/fi";
import Skeleton from "react-loading-skeleton";
import { toast } from "sonner";
import axiosInstance from "../../../utills/axiosInstance";
import { useLiveSubscriberCount } from "../../../hooks/useLiveSubscriberCount";
import { useQueryClient } from "@tanstack/react-query";
import { useUserSubscriptions, userDashboardKeys } from "../../../hooks/api/useUserDashboard";

const cycleLabel = (c) => {
  switch (c) {
    case "1m": return "Monthly";
    case "3m": return "3 Months";
    case "6m": return "6 Months";
    case "12m": return "12 Months";
    default: return c;
  }
};

const formatSubscriberCount = (count) => {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count?.toString() || "0";
};

const getArtistColor = (name) => {
  if (!name) return "bg-blue-600";
  const colors = [
    "bg-blue-600", "bg-purple-600", "bg-pink-600", "bg-red-600",
    "bg-orange-600", "bg-yellow-600", "bg-green-600", "bg-teal-600", "bg-indigo-600",
  ];
  const hash = name.split("").reduce((acc, char) => char.charCodeAt(0) + acc, 0);
  return colors[hash % colors.length];
};

// ─── Unsubscribe Confirmation Modal ───────────────────────────────────────────
const UnsubscribeModal = ({ open, artist, subscriptionPrice, currentCycle, onConfirm, onClose, loading }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-md">
      <div className="relative w-full max-w-sm mx-4">
        <div className="player-wrapper">
          <div className="player-card rounded-2xl p-8 flex flex-col items-center gap-5">

            {/* Close button — subtle, tucked in corner */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 transition-colors"
            >
              <FiX className="text-lg" />
            </button>

            {/* Warning icon */}
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-[#1a0f0f] to-[#0d0909] rounded-full flex items-center justify-center shadow-2xl border border-red-500/30">
                <FiAlertTriangle className="text-3xl text-red-400" />
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-red-500/40 animate-ping opacity-20" />
            </div>

            {/* Badge */}
            <div className="px-4 py-1 bg-gradient-to-r from-red-700 to-red-500 rounded-full text-xs font-medium text-white flex items-center gap-2">
              <FiAlertTriangle className="text-sm" />
              <span style={{ fontFamily: "Jura" }}>Cancel Subscription</span>
            </div>

            {/* Title */}
            <div className="text-center space-y-1">
              <h2 className="text-white font-bold text-xl" style={{ fontFamily: "Jura" }}>
                Are you sure?
              </h2>
            </div>

            {/* Artist info */}
            <div className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center">
              <p className="text-white font-semibold text-sm" style={{ fontFamily: "Jura" }}>
                {artist?.name}
              </p>
              <p className="text-gray-400 text-xs mt-0.5">
                ${subscriptionPrice?.toFixed(2)} / {cycleLabel(currentCycle)}
              </p>
            </div>

            {/* Description */}
            <div className="text-center space-y-2">
              <p className="text-gray-300 text-sm leading-relaxed" style={{ fontFamily: "Jura" }}>
                You will lose access to all exclusive content from this artist.
              </p>
              <p className="text-gray-500 text-xs leading-relaxed" style={{ fontFamily: "Jura" }}>
                This action cannot be undone. You can re-subscribe anytime.
              </p>
            </div>

            {/* Buttons — Keep it is visually dominant */}
            <div className="w-full flex flex-col gap-3 mt-1">
              {/* Primary: Keep subscription — green, prominent */}
              <button
                onClick={onClose}
                className="w-full py-3 px-4 bg-gradient-to-r from-green-700 to-emerald-600 hover:from-green-600 hover:to-emerald-500 rounded-lg text-white transition-all duration-300 text-sm font-semibold flex items-center justify-center gap-2 shadow-lg"
                style={{ fontFamily: "Jura" }}
              >
                <FaCheckCircle className="text-sm" />
                Keep My Subscription
              </button>

              {/* Secondary: Confirm cancel — muted, less visible */}
              <button
                onClick={onConfirm}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-transparent border border-red-500/30 hover:border-red-500/60 rounded-lg text-red-400 hover:text-red-300 transition-all duration-300 text-xs font-medium flex items-center justify-center gap-2 opacity-70 hover:opacity-100"
                style={{ fontFamily: "Jura" }}
              >
                {loading ? "Processing..." : "Yes, cancel my subscription"}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const ArtistHeroSection = ({
  artist,
  artistId,
  currentUser,
  isInView,
  openSubscriptionOptions,
  subscriptionLoading,
  setSubscriptionLoading,
  subscriberCountData,
}) => {
  const queryClient = useQueryClient();
  const [unsubscribeModalOpen, setUnsubscribeModalOpen] = useState(false);

  const { data: subscriptionsData } = useUserSubscriptions();
  const userSubscriptions = subscriptionsData?.subscriptions || [];
  const subscriberData = subscriberCountData;

  const isSubscribed = useMemo(() => {
    if (!artist || !userSubscriptions.length) return false;
    return userSubscriptions.some(
      (sub) =>
        sub.artist?._id === artist?._id ||
        sub.artist?.slug === artist?.slug
    );
  }, [userSubscriptions, artist]);

  const liveSubscriberCount = useLiveSubscriberCount(
    subscriberData?.activeSubscribers ?? 0,
    isInView,
    artist?._id
  );

  const availableCycles = useMemo(() => {
    const plans = artist?.subscriptionPlans || [];
    return plans
      .map((p) => p?.cycle)
      .filter(Boolean)
      .filter((v, i, arr) => arr.indexOf(v) === i);
  }, [artist?.subscriptionPlans]);

  const currentCycle = useMemo(() => {
    if (!availableCycles.length) return null;
    return availableCycles.includes("1m") ? "1m" : availableCycles[0];
  }, [availableCycles]);

  const subscriptionPrice = artist?.subscriptionPlans?.[0]?.basePrice?.amount ?? 4.99;
  const artistColor = getArtistColor(artist?.name);

  const renderArtistImage = (imageUrl, name, size = "w-20 h-20") =>
    imageUrl ? (
      <img
        src={imageUrl}
        alt={name || "Artist"}
        className={`${size} rounded-full object-cover border-2 border-blue-500 shadow-[0_0_5px_1px_#3b82f6]`}
      />
    ) : (
      <div
        className={`${size} ${artistColor} rounded-full flex items-center justify-center text-white font-bold text-xl border-2 border-blue-500 shadow-[0_0_5px_1px_#3b82f6]`}
      >
        {name ? name.charAt(0).toUpperCase() : "A"}
      </div>
    );

  const handleUnsubscribeConfirmed = async () => {
    setSubscriptionLoading(true);
    try {
      await axiosInstance.delete(`/subscriptions/artist/${artist._id}`);
      await queryClient.invalidateQueries({
        queryKey: userDashboardKeys.subscriptions(),
      });
      toast.success(`Unsubscribed from ${artist.name}`);
      setUnsubscribeModalOpen(false);
    } catch (error) {
      console.error("Unsubscribe error:", error);
      toast.error(
        `Failed to unsubscribe: ${error.response?.data?.message || error.message}`
      );
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const handleSubscribeClick = () => {
    if (!currentUser) {
      toast.error("Please sign in to subscribe");
      return;
    }
    if (!artist?._id) {
      toast.error("Artist info not loaded.");
      return;
    }
    setSubscriptionLoading(true);
    openSubscriptionOptions(artist, currentCycle, subscriptionPrice);
  };

  return (
    <>
      <div className="relative h-80 w-full">
        {artist ? (
          <>
            {artist?.coverImage ? (
              <img
                src={artist.coverImage}
                className="w-full h-full object-cover opacity-80"
                alt="Artist Background"
              />
            ) : (
              <div className={`w-full h-full ${artistColor} opacity-80`} />
            )}
            <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-[#0f172a] to-transparent z-20" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-blue-900/30 z-10" />
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/70 to-transparent z-20" />

            <div className="absolute bottom-8 left-8 z-30 flex items-center gap-6 text-white">
              {renderArtistImage(artist?.profileImage, artist?.name)}
              <div>
                <p className="sm:text-sm text-xs lowercase tracking-widest text-gray-200">
                  artist
                </p>
                <h1 className="text-2xl md:text-4xl font-bold mt-1">
                  {artist?.name || "Unknown Artist"}
                </h1>
                <div className="flex items-center sm:gap-3 flex-wrap">
                  <div className="flex items-center mt-1 text-gray-300 sm:text-sm text-xs">
                    <FiMapPin className="mr-2 text-sm text-blue-400" />
                    <span>{artist?.location || "Unknown City"}</span>
                  </div>
                  <div className="flex items-center mt-1 text-gray-300 text-sm">
                    <HiUsers className="mr-2 text-sm text-blue-400" />
                    <span className="flex items-center gap-2">
                      <span className="font-bold text-blue-400">
                        {formatSubscriberCount(liveSubscriberCount)}
                      </span>
                      <span>subscribers</span>
                    </span>
                  </div>
                </div>

                {/* ✅ Button row — exact same position as original */}
                <div className="flex items-center gap-4 mt-3 flex-wrap">
                  <span className="text-lg font-semibold text-blue-400">
                    ${subscriptionPrice.toFixed(2)}/{cycleLabel(currentCycle)}
                  </span>

                  {isSubscribed ? (
                    <button
                      onClick={() => setUnsubscribeModalOpen(true)}
                      disabled={subscriptionLoading}
                      className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 shadow-md bg-gray-600 text-gray-300 hover:bg-gray-700
                        ${subscriptionLoading ? "opacity-70 cursor-not-allowed" : ""}`}
                    >
                      {subscriptionLoading ? "Processing..." : "Unsubscribe"}
                    </button>
                  ) : (
                    <button
                      id="artist-subscribe-btn"
                      onClick={handleSubscribeClick}
                      disabled={subscriptionLoading}
                      className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 shadow-md bg-blue-600 text-white hover:bg-blue-700
                        ${subscriptionLoading ? "opacity-70 cursor-not-allowed" : ""}`}
                      title={currentCycle ? `Cycle: ${cycleLabel(currentCycle)}` : "Cycle unavailable"}
                    >
                      {subscriptionLoading ? "Processing..." : "Subscribe"}
                    </button>
                  )}
                </div>

                {subscriberData?.totalRevenue > 0 &&
                  currentUser?._id === artist?._id && (
                    <div className="mt-2 text-xs text-gray-400">
                      Total Revenue: ${subscriberData.totalRevenue.toFixed(2)}
                    </div>
                  )}
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <Skeleton width={200} height={40} />
          </div>
        )}
      </div>

      {/* ✅ Unsubscribe confirmation modal */}
      <UnsubscribeModal
        open={unsubscribeModalOpen}
        artist={artist}
        subscriptionPrice={subscriptionPrice}
        currentCycle={currentCycle}
        onConfirm={handleUnsubscribeConfirmed}
        onClose={() => setUnsubscribeModalOpen(false)}
        loading={subscriptionLoading}
      />
    </>
  );
};

export default ArtistHeroSection;