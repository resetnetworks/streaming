// src/components/artist/home/ListItem.jsx
import React from "react";
import { FiMusic } from "react-icons/fi";
import { formatCompactNumber } from "../../../utills/analytics/formatters";
import { formatDuration } from "../../../utills/helperFunctions";
import { getS3Url } from "../../../utills/s3Utils";

const ListItem = ({
  ItemName = "top tracks",
  items = null,
  songs: songsProp = null,
  type = "songs",
  onShowAll = null,
}) => {
  // Support both `items` prop and legacy `songs` prop
  const sourceItems = items || songsProp;

  const isAlbums = type === "albums" || ItemName.toLowerCase().includes("album");
  const isSingles = type === "singles" || ItemName.toLowerCase().includes("single");

  const formattedItems = Array.isArray(sourceItems)
    ? sourceItems.slice(0, 8).map((item, index) => {
        const title = item.title || item.name || "Untitled";
        const rawImage = item.image || item.coverImage || item.artwork || item.coverImageKey;
        const image = getS3Url(rawImage) || null;

        let rightBadge = "";
        if (isAlbums) {
          const views = typeof item.views === "number" ? item.views : 0;
          rightBadge = `${formatCompactNumber(views)} ${views === 1 ? "view" : "views"}`;
        } else {
          const plays = typeof item.plays === "number" ? item.plays : (item.views || item.totalPlays || 0);
          rightBadge = `${formatCompactNumber(plays)} ${plays === 1 ? "stream" : "streams"}`;
        }

        let subtitle = "";
        if (isAlbums) {
          const trackCount = Array.isArray(item.songs) ? item.songs.length : item.songCount || 0;
          if (item.genre) {
            subtitle = item.genre;
          } else if (trackCount > 0) {
            subtitle = `${trackCount} ${trackCount === 1 ? "track" : "tracks"}`;
          } else {
            subtitle = "";
          }
        } else if (isSingles) {
          if (item.genre) {
            subtitle = item.genre;
          } else {
            subtitle = "";
          }
        } else {
          subtitle = item.artist?.name || item.genre || "";
        }

        return {
          id: item._id || item.songId || index,
          rank: index + 1,
          title,
          subtitle,
          image,
          rightBadge,
        };
      })
    : [];

  if (formattedItems.length === 0) {
    return null;
  }

  return (
    <div className="rounded-[12px] p-[1px] bg-gradient-to-br from-white to-[#0c0d0d] h-full flex flex-col w-full">
      <div className="border border-transparent p-5 rounded-[10px] bg-gradient-to-br from-[#1e293b] to-[#0f172a] relative h-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white text-xl font-semibold capitalize">{ItemName}</h2>
        </div>

        {/* List items */}
        <div className="divide-y divide-white/[0.05] flex-1">
          {formattedItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-white/[0.03] transition-colors group"
            >
              {/* Left side - Rank, Image and Title */}
              <div className="flex items-center gap-3.5 min-w-0 pr-3">
                <span className="text-gray-400 text-xs font-semibold w-5 text-center flex-shrink-0">
                  {item.rank}
                </span>

                {/* Artwork / Image */}
                <div className="w-10 h-10 rounded-md overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 flex-shrink-0 relative border border-white/10 shadow-sm flex items-center justify-center">
                  {item.image ? (
                    <>
                      <img
                        src={item.image}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                          if (e.target.nextSibling) {
                            e.target.nextSibling.style.display = "flex";
                          }
                        }}
                      />
                      <div className="w-full h-full bg-slate-800 items-center justify-center text-gray-400 hidden">
                        <FiMusic className="w-4 h-4 text-blue-400" />
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center text-gray-400">
                      <FiMusic className="w-4 h-4 text-blue-400" />
                    </div>
                  )}
                </div>

                {/* Title & Subtitle */}
                <div className="flex flex-col min-w-0">
                  <span className="text-white text-sm font-medium truncate group-hover:text-blue-400 transition-colors">
                    {item.title}
                  </span>
                  {item.subtitle ? (
                    <span className="text-gray-400 text-xs truncate">
                      {item.subtitle}
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Right side - Badge */}
              {item.rightBadge && (
                <span className="text-xs font-medium text-gray-300 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full flex-shrink-0 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0459FE]" />
                  {item.rightBadge}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ListItem;