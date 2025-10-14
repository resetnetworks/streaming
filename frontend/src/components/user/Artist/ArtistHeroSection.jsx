import React, { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiMapPin } from "react-icons/fi";
import { HiUsers } from "react-icons/hi";
import Skeleton from "react-loading-skeleton";
import { toast } from "sonner";
import axiosInstance from "../../../utills/axiosInstance";
import { fetchSubscriberCount } from "../../../features/artists/artistsSlice";
import { fetchUserSubscriptions } from "../../../features/payments/userPaymentSlice";
import { 
  selectArtistSubscriberCount,
  selectSubscriberCountLoading,
} from "../../../features/artists/artistsSelectors";
import { useLiveSubscriberCount } from "../../../hooks/useLiveSubscriberCount";

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

const ArtistHeroSection = ({ 
  artist, 
  artistId, 
  currentUser, 
  isInView, 
  openSubscriptionOptions,
  subscriptionLoading,
  setSubscriptionLoading
}) => {
  const dispatch = useDispatch();

  const subscriberData = useSelector(state => 
    selectArtistSubscriberCount(artist?._id)(state)
  );
  const subscriberCountLoading = useSelector(selectSubscriberCountLoading);
  const userSubscriptions = useSelector(
    (state) => state.userDashboard.subscriptions || []
  );

  const isSubscribed = userSubscriptions.some(
    (sub) => sub.artist?.slug === artistId
  );

  const liveSubscriberCount = useLiveSubscriberCount(
    subscriberData?.activeSubscribers, 
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

  const handleSubscribe = async () => {
    if (!artist?._id) {
      toast.error("Artist info not loaded.");
      return;
    }

    if (isSubscribed) {
      const confirmUnsub = window.confirm(
        `Are you sure you want to unsubscribe from ${artist.name}?`
      );
      if (!confirmUnsub) return;

      setSubscriptionLoading(true);
      try {
        await axiosInstance.delete(`/subscriptions/artist/${artist._id}`);
        dispatch(fetchUserSubscriptions());
        dispatch(fetchSubscriberCount(artist._id));
        toast.success(`Unsubscribed from ${artist.name}`);
      } catch (error) {
        console.error("Unsubscribe error:", error);
        toast.error(
          `Failed to unsubscribe: ${
            error.response?.data?.message || error.message
          }`
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
    <div className="relative h-80 w-full">
      {artist ? (
        <>
          {artist.image ? (
            <img
              src={artist.image}
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
            {renderArtistImage(artist?.image, artist?.name)}
            <div>
              <p className="sm:text-sm text-xs lowercase tracking-widest text-gray-200">artist</p>
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
              <div className="flex items-center gap-4 mt-3 flex-wrap">
                <span className="text-lg font-semibold text-blue-400">
                  ${subscriptionPrice.toFixed(2)}/{cycleLabel(currentCycle)}
                </span>
                <button
                  id="artist-subscribe-btn"
                  onClick={handleSubscribe}
                  disabled={subscriptionLoading}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 shadow-md
                    ${subscriptionLoading ? "opacity-70 cursor-not-allowed" : ""}
                    ${isSubscribed
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  title={currentCycle ? `Cycle: ${cycleLabel(currentCycle)}` : "Cycle unavailable"}
                >
                  {subscriptionLoading
                    ? "Processing..."
                    : isSubscribed
                    ? "Cancel Subscription"
                    : "Subscribe"}
                </button>
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
  );
};

export default ArtistHeroSection;
