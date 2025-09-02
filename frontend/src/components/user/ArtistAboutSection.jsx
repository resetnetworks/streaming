import React from "react";
import { FiMapPin } from "react-icons/fi";

const ArtistAboutSection = ({
  artist,
  isSubscribed,
  subscriptionLoading,
  subscriptionPrice,
  currentCycle,
  handleSubscribe,
  getArtistColor
}) => {
  const artistColor = getArtistColor(artist?.name);

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
              <span className="text-blue-500 text-2xl lowercase">
                about
              </span>
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
                    ₹{subscriptionPrice.toFixed(2)} per {currentCycle} • Cancel anytime
                  </p>
                </div>
                <button
                  onClick={handleSubscribe}
                  disabled={subscriptionLoading}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isSubscribed
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  } ${
                    subscriptionLoading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {subscriptionLoading
                    ? "Processing..."
                    : isSubscribed
                    ? "Cancle Subscription"
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
