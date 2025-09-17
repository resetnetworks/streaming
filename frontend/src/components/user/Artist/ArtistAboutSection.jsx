import React, { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiMapPin } from "react-icons/fi";
import { toast } from "sonner";
import axiosInstance from "../../../utills/axiosInstance";
import { fetchSubscriberCount } from "../../../features/artists/artistsSlice";
import { fetchUserSubscriptions } from "../../../features/payments/userPaymentSlice";

const cycleLabel = (c) => {
  switch (c) {
    case "1m": return "Monthly";
    case "3m": return "3 Months";
    case "6m": return "6 Months";
    case "12m": return "12 Months";
    default: return c;
  }
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

const ArtistAboutSection = ({
  artist,
  artistId,
  openSubscriptionOptions,
  subscriptionLoading,
  setSubscriptionLoading
}) => {
  const dispatch = useDispatch();
  const artistColor = getArtistColor(artist?.name);
  
  const userSubscriptions = useSelector(
    (state) => state.userDashboard.subscriptions || []
  );

  const isSubscribed = userSubscriptions.some(
    (sub) => sub.artist?.slug === artistId
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
    <div className="mt-12 flex flex-col md:flex-row gap-6 px-6 pb-12 text-white">
      {artist ? (
        <>
          <div className="w-full h-72 md:w-1/4">
            {artist.image ? (
              <img
                src={artist.image}
                alt={`Artist ${artist.name}`}
                className="w-full h-full object-cover border-t-4 border-b-4 border-blue-600"
              />
            ) : (
              <div className={`w-full h-full ${artistColor} flex items-center justify-center text-white text-8xl font-bold border-t-4 border-b-4 border-blue-600`}>
                {artist.name ? artist.name.charAt(0).toUpperCase() : 'A'}
              </div>
            )}
          </div>
          <div className="w-full md:w-2/3 bg-white/5 backdrop-blur-sm p-6 rounded-md shadow-lg border border-white/10">
            <div className="mb-2 flex items-center gap-2 text-blue-400 text-xl font-bold">
              <span className="text-blue-500 text-2xl lowercase">about</span>
              <span className="text-white capitalize">
                {artist?.name || "Unknown"}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-300 mb-4">
              <FiMapPin className="text-blue-500" />
              <span>
                {artist?.location || "Unknown Location"} •{" "}
                {artist?.birthYear || "N/A"}
              </span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              {artist?.bio || "This artist has not provided a biography yet."}{" "}
              <span className="text-blue-400 cursor-pointer hover:underline">
                View more
              </span>
            </p>
            <div className="mt-6 pt-4 border-t border-white/10">
              <h3 className="text-lg font-semibold text-blue-400 mb-2">
                Subscription Details
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-300">
                    {isSubscribed ? (
                      <span className="text-green-400">✓ You are subscribed</span>
                    ) : (
                      "Subscribe for exclusive content"
                    )}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    ${subscriptionPrice.toFixed(2)} per {cycleLabel(currentCycle)} • Cancel anytime
                  </p>
                </div>
                <button
                  onClick={handleSubscribe}
                  disabled={subscriptionLoading}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 shadow-md
                    ${subscriptionLoading ? "opacity-70 cursor-not-allowed" : ""}
                    ${isSubscribed
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                >
                  {subscriptionLoading
                    ? "Processing..."
                    : isSubscribed
                    ? "Cancel Subscription"
                    : "Subscribe Now"}
                </button>
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
