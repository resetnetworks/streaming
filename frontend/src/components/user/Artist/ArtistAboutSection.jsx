import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { FiMapPin } from "react-icons/fi";
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
} from "react-icons/fa";
import { SiLinktree } from "react-icons/si";
import { toast } from "sonner";
import axiosInstance from "../../../utills/axiosInstance";
import { useQueryClient } from "@tanstack/react-query";
import { useUserSubscriptions, userDashboardKeys } from "../../../hooks/api/useUserDashboard";
import { artistKeys } from "../../../hooks/api/useArtists";

const getSocialIcon = (platform) => {
  switch (platform?.toLowerCase()) {
    case "spotify":
      return <FaSpotify className="text-[#1DB954]" />;
    case "instagram":
      return <FaInstagram className="text-[#E1306C]" />;
    case "soundcloud":
      return <FaSoundcloud className="text-[#FF5500]" />;
    case "youtube":
      return <FaYoutube className="text-[#FF0000]" />;
    case "twitter":
      return <FaTwitter className="text-[#1DA1F2]" />;
    case "tiktok":
      return <FaTiktok className="text-white" />;
    case "facebook":
      return <FaFacebook className="text-[#1877F2]" />;
    case "bandcamp":
      return <FaBandcamp className="text-[#629aa9]" />;
    case "linktree":
      return <SiLinktree className="text-[#43E660]" />;
    default:
      return <FaLink className="text-gray-400" />;
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
      return c;
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
  const hash = name
    .split("")
    .reduce((acc, char) => char.charCodeAt(0) + acc, 0);
  return colors[hash % colors.length];
};

const ArtistAboutSection = ({
  artist,
  artistId,
  openSubscriptionOptions,
  subscriptionLoading,
  setSubscriptionLoading,
  currentUser, 
}) => {
  const queryClient = useQueryClient();
  const artistColor = getArtistColor(artist?.name);
  const [showFullBio, setShowFullBio] = useState(false);

  const { data: subscriptionsData } = useUserSubscriptions();
  const userSubscriptions = subscriptionsData?.subscriptions || [];

  const isSubscribed = userSubscriptions.some(
    (sub) => sub.artist?.slug === artistId || sub.artist?._id === artistId || sub.artist?._id === artist?._id || sub.artist?.slug === artist?.slug
  );

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

  const subscriptionPrice =
    artist?.subscriptionPlans?.[0]?.basePrice?.amount ?? 4.99;

  const BIO_LIMIT = 500;
  const isLongBio = artist?.bio?.length > BIO_LIMIT;

  const displayedBio = showFullBio
    ? artist?.bio
    : artist?.bio?.slice(0, BIO_LIMIT);

  const handleSubscribe = async () => {
     if (!currentUser) {
    toast.error("Please sign in to subscribe");
    return;
  }
    if (!artist?._id) {
      toast.error("Artist info not loaded.");
      return;
    }

    if (isSubscribed) {
      const confirmUnsub = window.confirm(
        `Are you sure you want to unsubscribe from ${artist.name}?`,
      );
      if (!confirmUnsub) return;

      setSubscriptionLoading(true);
      try {
        await axiosInstance.delete(`/subscriptions/artist/${artist._id}`);
        queryClient.invalidateQueries({ queryKey: userDashboardKeys.subscriptions() });
        queryClient.invalidateQueries({ queryKey: artistKeys.subscriberCount(artist._id) });
        toast.success(`Unsubscribed from ${artist.name}`);
      } catch (error) {
        console.error("Unsubscribe error:", error);
        toast.error(
          `Failed to unsubscribe: ${
            error.response?.data?.message || error.message
          }`,
        );
      } finally {
        setSubscriptionLoading(false);
      }
    } else {
      setSubscriptionLoading(true);
      openSubscriptionOptions(artist, currentCycle, subscriptionPrice);
    }
  };

  return (
    <div className="mt-12 flex flex-col md:flex-row gap-6 px-6 pb-12 text-white">
      {artist ? (
        <>
          <div className="w-full bg-white/5 backdrop-blur-sm p-6 rounded-md shadow-lg border border-white/10">
            <div className="mb-2 flex items-center gap-2 text-xl font-bold" style={{ color: '#4DB3FF' }}>
              <span className="text-2xl lowercase" style={{ color: '#4DB3FF' }}>about</span>
              <span className="text-white capitalize">
                {artist?.name || "Unknown"}
              </span>
            </div>
            {(artist?.location || artist?.country) && (
              <div className="flex items-center gap-3 text-sm text-gray-300 mb-2">
                <FiMapPin style={{ color: '#4DB3FF' }} />
                <span>
                  {artist?.location ? (
                    artist.country ? `${artist.location}, ${artist.country}` : artist.location
                  ) : (
                    artist?.country || ""
                  )}
                </span>
              </div>
            )}
            {artist?.bio && (
              <p className="text-sm text-gray-300 leading-relaxed">
                {displayedBio}
                {isLongBio && !showFullBio && "..."}
                {isLongBio && (
                  <span
                    onClick={() => setShowFullBio(!showFullBio)}
                    className="ml-2 cursor-pointer hover:underline"
                    style={{ color: '#4DB3FF' }}
                  >
                    {showFullBio ? "show less" : "show more"}
                  </span>
                )}
              </p>
            )}

            {artistSocials && artistSocials.length > 0 && (
              <div className="mt-6 pt-4 border-t border-white/10">
                <h4 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-3">
                  Links & Streaming
                </h4>
                <div className="flex flex-wrap items-center gap-3">
                  {artistSocials.map((link) => (
                    <a
                      key={link.platform}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-200 hover:text-white transition-all duration-200"
                    >
                      <span className="text-sm">{getSocialIcon(link.platform)}</span>
                      <span className="capitalize font-medium">{link.platform}</span>
                      <span className="text-[10px] text-gray-500">↗</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-white/10">
              <h3 className="text-lg font-semibold mb-2" style={{ color: '#4DB3FF' }}>
                Subscription Details
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-300">
                    {isSubscribed ? (
                      <span className="text-green-400">
                        ✓ You are subscribed
                      </span>
                    ) : (
                      ""
                    )}
                  </p>
                  <p className="text-xs text-gray-400 mt-2 flex flex-wrap items-center gap-2">
                    <span className="text-white font-semibold">
                      ${subscriptionPrice.toFixed(2)} / {cycleLabel(currentCycle)}
                    </span>
                    <span className="text-gray-600">•</span>
                    <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider">
                      Cancel anytime
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="w-full flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/4">
            <div className="bg-gray-700 h-72 w-full rounded-md animate-pulse" />
          </div>
          <div className="w-full md:w-2/3">
            <div className="bg-gray-700 h-72 w-full rounded-md animate-pulse" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtistAboutSection;
