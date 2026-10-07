import React, { useMemo, useState, useEffect, useRef } from "react";
import { FiMapPin, FiAlertTriangle, FiX } from "react-icons/fi";
import {
  FaSpotify,
  FaInstagram,
  FaSoundcloud,
  FaYoutube,
  FaTwitter,
  FaFacebook,
  FaTiktok,
  FaBandcamp,
  FaLink,
  FaCheckCircle,
} from "react-icons/fa";
import { SiLinktree } from "react-icons/si";
import { motion, AnimatePresence } from "framer-motion";
import Skeleton from "react-loading-skeleton";
import { toast } from "sonner";
import axiosInstance from "../../../utills/axiosInstance";
import { useQueryClient } from "@tanstack/react-query";
import { useUserSubscriptions, userDashboardKeys } from "../../../hooks/api/useUserDashboard";

const getSocialIcon = (platform) => {
  switch (platform?.toLowerCase()) {
    case "instagram":
      return (
        <span className="w-full h-full rounded-full flex items-center justify-center bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white">
          <FaInstagram className="text-[12px]" />
        </span>
      );
    case "spotify":
      return <FaSpotify className="text-[#1DB954] text-[15px]" />;
    case "youtube":
      return <FaYoutube className="text-[#FF0000] text-[15px]" />;
    case "twitter":
    case "x":
      return <FaTwitter className="text-white text-[13px]" />;
    case "tiktok":
      return <FaTiktok className="text-white text-[13px]" />;
    case "soundcloud":
      return <FaSoundcloud className="text-[#FF5500] text-[14px]" />;
    case "facebook":
      return <FaFacebook className="text-[#1877F2] text-[14px]" />;
    case "bandcamp":
      return <FaBandcamp className="text-[#629aa9] text-[14px]" />;
    case "linktree":
      return <SiLinktree className="text-[#43E660] text-[13px]" />;
    default:
      return <FaLink className="text-gray-300 text-[12px]" />;
  }
};

const cycleLabel = (c) => {
  switch (c) {
    case "1m":
      return "Monthly";
    case "3m":
      return "3 Months";
    case "6m":
      return "6 Months";
    case "12m":
      return "12 Months";
    default:
      return c || "Monthly";
  }
};

const getArtistColor = (name) => {
  if (!name) return "bg-blue-600";
  const colors = [
    "bg-blue-600",
    "bg-purple-600",
    "bg-pink-600",
    "bg-red-600",
    "bg-orange-600",
    "bg-yellow-600",
    "bg-green-600",
    "bg-teal-600",
    "bg-indigo-600",
  ];
  const hash = name.split("").reduce((acc, char) => char.charCodeAt(0) + acc, 0);
  return colors[hash % colors.length];
};

// ─── Unsubscribe Confirmation Modal ───────────────────────────────────────────
const UnsubscribeModal = ({
  open,
  artist,
  subscriptionPrice,
  currentCycle,
  onConfirm,
  onClose,
  loading,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-md">
      <div className="relative w-full max-w-sm mx-4">
        <div className="player-wrapper">
          <div className="player-card rounded-2xl p-8 flex flex-col items-center gap-5">
            {/* Close button */}
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
              <div className="absolute inset-0 rounded-full border-2 border-red-500/40 opacity-20" />
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

            {/* Buttons */}
            <div className="w-full flex flex-col gap-3 mt-1">
              <button
                onClick={onClose}
                className="w-full py-3 px-4 bg-gradient-to-r from-green-700 to-emerald-600 hover:from-green-600 hover:to-emerald-500 rounded-lg text-white transition-all duration-300 text-sm font-semibold flex items-center justify-center gap-2 shadow-lg"
                style={{ fontFamily: "Jura" }}
              >
                <FaCheckCircle className="text-sm" />
                Keep My Subscription
              </button>

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
  openSubscriptionOptions,
  subscriptionLoading,
  setSubscriptionLoading,
  requireLogin,
}) => {
  const queryClient = useQueryClient();
  const [unsubscribeModalOpen, setUnsubscribeModalOpen] = useState(false);
  const [isStickyVisible, setIsStickyVisible] = useState(false);
  const heroRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      setIsStickyVisible(rect.bottom < 100);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { data: subscriptionsData } = useUserSubscriptions();
  const userSubscriptions = subscriptionsData?.subscriptions || [];

  const isSubscribed = useMemo(() => {
    if (!artist || !userSubscriptions.length) return false;
    return userSubscriptions.some(
      (sub) => sub.artist?._id === artist?._id || sub.artist?.slug === artist?.slug
    );
  }, [userSubscriptions, artist]);

  const artistSocials = useMemo(() => {
    if (!artist?.socials) return [];
    if (Array.isArray(artist.socials)) return artist.socials;
    if (typeof artist.socials === "string") {
      try {
        const parsed = JSON.parse(artist.socials);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  }, [artist?.socials]);

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

  const displayLocation = useMemo(() => {
    const parts = [artist?.location, artist?.country].filter(
      (p) => p && typeof p === "string" && p.trim().length > 0
    );
    if (!parts.length) return null;
    return parts.join(", ");
  }, [artist?.location, artist?.country]);

  const renderArtistImage = (imageUrl, name, size = "w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32") =>
    imageUrl ? (
      <img
        src={imageUrl}
        alt={name || "Artist"}
        className={`${size} rounded-full object-cover border-2 shadow-[0_0_8px_2px_#4DB3FF] shrink-0`}
        style={{ borderColor: "#4DB3FF" }}
      />
    ) : (
      <div
        className={`${size} ${artistColor} rounded-full flex items-center justify-center text-white font-bold text-2xl sm:text-3xl md:text-4xl border-2 shadow-[0_0_8px_2px_#4DB3FF] shrink-0`}
        style={{ borderColor: "#4DB3FF" }}
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
    if (!requireLogin("purchase", "subscription", artist)) return;
    if (!artist?._id) {
      toast.error("Artist info not loaded.");
      return;
    }
    setSubscriptionLoading(true);
    openSubscriptionOptions(artist, currentCycle, subscriptionPrice);
  };

  return (
    <>
      {/* ─── Mobile Sticky Bar on Scroll ─────────────────────────────────── */}
      <AnimatePresence>
        {isStickyVisible && artist && (
          <motion.div
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#0a0d14]/90 backdrop-blur-xl border-b border-white/10 px-4 py-2.5 shadow-2xl flex items-center justify-between gap-3"
          >
            {/* Left: Mini Avatar + Name + Verified */}
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              {artist?.profileImage ? (
                <img
                  src={artist.profileImage}
                  alt={artist.name || "Artist"}
                  className="w-9 h-9 rounded-full object-cover border border-[#4DB3FF] shadow-[0_0_8px_rgba(77,179,255,0.4)] shrink-0"
                />
              ) : (
                <div
                  className={`w-9 h-9 ${artistColor} rounded-full flex items-center justify-center text-white font-bold text-xs border border-[#4DB3FF] shadow-[0_0_8px_rgba(77,179,255,0.4)] shrink-0`}
                >
                  {artist?.name ? artist.name.charAt(0).toUpperCase() : "A"}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className="text-white font-bold text-sm truncate"
                    style={{ fontFamily: "Jura" }}
                  >
                    {artist?.name || "Artist"}
                  </span>
                  <img
                    src="/Verified.svg"
                    alt="Verified"
                    className="w-4 h-4 shrink-0 drop-shadow-[0_0_6px_rgba(91,255,137,0.5)]"
                  />
                </div>
                {displayLocation && (
                  <p className="text-gray-400 text-[11px] truncate flex items-center gap-1 mt-0.5">
                    <FiMapPin className="text-[10px] text-[#4DB3FF] shrink-0" />
                    <span className="truncate">{displayLocation}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Right: Subscribe CTA */}
            <div className="shrink-0">
              {isSubscribed ? (
                <button
                  onClick={() => setUnsubscribeModalOpen(true)}
                  disabled={subscriptionLoading}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors shadow-sm"
                  style={{ fontFamily: "Jura" }}
                >
                  {subscriptionLoading ? "..." : "Subscribed"}
                </button>
              ) : (
                <button
                  onClick={handleSubscribeClick}
                  disabled={subscriptionLoading}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white transition-all active:scale-95 shadow-md flex items-center gap-1"
                  style={{
                    background:
                      "linear-gradient(45deg, #0F3272 0%, #1A5DB4 60%, #3380FF 100%)",
                    boxShadow: "0 0 12px rgba(51, 128, 255, 0.35)",
                    fontFamily: "Jura",
                  }}
                >
                  {subscriptionLoading
                    ? "..."
                    : `Subscribe $${subscriptionPrice.toFixed(2)}/${cycleLabel(currentCycle)}`}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Hero Container ──────────────────────────────────────────────── */}
      <div
        ref={heroRef}
        className="relative min-h-[380px] md:min-h-0 md:h-80 w-full bg-black overflow-hidden flex items-end"
      >
        {artist ? (
          <>
            {artist?.coverImage ? (
              <img
                src={artist.coverImage}
                className="absolute inset-0 w-full h-full object-cover opacity-80"
                alt="Artist Background"
              />
            ) : (
              <div className={`absolute inset-0 w-full h-full ${artistColor} opacity-80`} />
            )}

            {/* Bottom black gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

            <div className="relative z-30 w-full pb-6 md:pb-8 px-4 md:px-8 flex flex-col md:flex-row items-center text-center md:text-left gap-4 md:gap-6 text-white">
              {renderArtistImage(artist?.profileImage, artist?.name)}
              <div className="flex flex-col items-center md:items-start">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold flex items-center justify-center md:justify-start gap-2">
                  <span>{artist?.name || "Unknown Artist"}</span>
                  <motion.img
                    src="/Verified.svg"
                    alt="Verified Artist"
                    title="Verified Artist"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.18, rotate: 6 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 inline-block drop-shadow-[0_0_8px_rgba(91,255,137,0.5)] cursor-pointer select-none shrink-0"
                  />
                </h1>

                <div className="flex items-center justify-center md:justify-start mt-1 text-gray-200 text-sm sm:text-[15px] font-medium">
                  <FiMapPin className="mr-2 text-sm sm:text-[15px] shrink-0" style={{ color: "#4DB3FF" }} />
                  <span>
                    {displayLocation || (artist?.location ? (
                      artist.country
                        ? `${artist.location}, ${artist.country}`
                        : artist.location
                    ) : (
                      artist?.country || "Unknown Location"
                    ))}
                  </span>
                </div>

                {/* Social Media Icons Row */}
                {artistSocials && artistSocials.length > 0 && (
                  <div className="flex items-center justify-center md:justify-start gap-2 my-2.5 flex-wrap">
                    {artistSocials.map((link, index) => (
                      <a
                        key={link.platform || index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`Visit ${link.platform}`}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 hover:border-white/50 flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-sm overflow-hidden"
                      >
                        {getSocialIcon(link.platform)}
                      </a>
                    ))}
                  </div>
                )}

                {/* Action Buttons Row */}
                <div className="flex items-center justify-center md:justify-start gap-3 mt-1.5 flex-wrap">
                  {isSubscribed ? (
                    <button
                      onClick={() => setUnsubscribeModalOpen(true)}
                      disabled={subscriptionLoading}
                      className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 shadow-md bg-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      {subscriptionLoading ? "Processing..." : "Subscribed"}
                    </button>
                  ) : (
                    <button
                      id="artist-subscribe-btn"
                      onClick={handleSubscribeClick}
                      disabled={subscriptionLoading}
                      className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 text-white cursor-pointer active:scale-95 disabled:opacity-70 shadow-md"
                      style={{
                        background:
                          "linear-gradient(45deg, #0F3272 0%, #1A5DB4 60%, #3380FF 100%)",
                        boxShadow: "0 0 15px rgba(51, 128, 255, 0.2)",
                        fontFamily: "Jura",
                      }}
                    >
                      {subscriptionLoading
                        ? "Processing..."
                        : `Subscribe $${subscriptionPrice.toFixed(2)}/${cycleLabel(currentCycle)}`}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <Skeleton width={200} height={40} />
          </div>
        )}
      </div>

      {/* Unsubscribe Confirmation Modal */}
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