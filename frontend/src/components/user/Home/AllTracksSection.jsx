import React, { useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { LuSquareChevronRight } from "react-icons/lu";
import Skeleton from "react-loading-skeleton";
import { toast } from "sonner";

import SongList from "../SongList";
import { useSongCache } from "../../../hooks/useSongCache";
import { useInfiniteScroll } from "../../../hooks/useInfiniteScroll";
import { handlePlaySong } from "../../../utills/songHelpers";
import { formatDuration } from "../../../utills/helperFunctions";

const AllTracksSection = ({ 
  onSubscribeRequired,
  onPurchaseClick,
  processingPayment,
  paymentLoading
}) => {
  const dispatch = useDispatch();
  const scrollRef = useRef(null);
  
  const currentUser = useSelector((state) => state.auth.user);
  const selectedSong = useSelector((state) => state.player.selectedSong);

  const {
    songs: topSongs,
    loading,
    loadingMore,
    pagination,
    loadMore,
    hasMore
  } = useSongCache("top", { limit: 20 }); // ✅ ab 20 songs per page

  const { lastElementRef } = useInfiniteScroll({
    hasMore,
    loading: loading || loadingMore,
    onLoadMore: loadMore   // ✅ fix: infinite scroll ab loadMore call karega
  });

  const handleScroll = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  const onPlaySong = useCallback((song) => {
    const result = handlePlaySong(song, currentUser, dispatch);
    if (result.requiresSubscription) {
      onSubscribeRequired(song.artist, "play", song);
      toast.error("Subscribe to play this song!");
    }
  }, [currentUser, dispatch, onSubscribeRequired]);

  // ✅ chunk bana ke grid view ke liye
  const chunkSize = 5;
  const songColumns = [];
  for (let i = 0; i < topSongs.length; i += chunkSize) {
    songColumns.push(topSongs.slice(i, i + chunkSize));
  }

  return (
    <>
      <div className="w-full flex justify-between items-center">
        <h2 className="md:text-xl text-lg font-semibold">
          all tracks for you
        </h2>
        <LuSquareChevronRight
          className="text-white cursor-pointer text-lg hover:text-blue-800 transition-all md:block hidden"
          onClick={handleScroll}
        />
      </div>
      
      <div
        ref={scrollRef}
        className="w-full overflow-x-auto no-scrollbar min-h-[280px]"
      >
        <div className="flex md:gap-8 gap-16">
          {loading && topSongs.length === 0
            ? [...Array(5)].map((_, idx) => (
                <div
                  key={`top-picks-skeleton-${idx}`}
                  className="flex flex-col gap-4 min-w-[400px]"
                >
                  {[...Array(5)].map((__, i) => (
                    <div
                      key={`top-picks-item-${i}`}
                      className="flex items-center gap-4 skeleton-wrapper"
                    >
                      <Skeleton
                        height={50}
                        width={50}
                        className="rounded-full"
                      />
                      <div className="flex flex-col gap-1">
                        <Skeleton width={120} height={14} />
                        <Skeleton width={80} height={12} />
                      </div>
                    </div>
                  ))}
                </div>
              ))
            : songColumns.map((column, columnIndex) => (
                <div
                  key={`column-${columnIndex}`}
                  ref={
                    columnIndex === songColumns.length - 1
                      ? lastElementRef // ✅ last element observe ho raha hai
                      : null
                  }
                  className="flex flex-col gap-4 min-w-[400px]"
                >
                  {column.map((song) => (
                    <SongList
                      key={song._id}
                      songId={song._id}
                      img={song.coverImage || "/images/placeholder.png"}
                      songName={song.title}
                      singerName={song.singer}
                      seekTime={formatDuration(song.duration)}
                      onPlay={() => onPlaySong(song)}   // ✅ ab ye play karega
                      isSelected={selectedSong?._id === song._id}
                    />
                  ))}
                </div>
              ))}
          
          {loadingMore && (
            <div className="flex flex-col gap-4 min-w-[400px]">
              {[...Array(5)].map((_, i) => (
                <div
                  key={`loading-more-${i}`}
                  className="flex items-center gap-4 skeleton-wrapper"
                >
                  <Skeleton
                    height={50}
                    width={50}
                    className="rounded-full"
                  />
                  <div className="flex flex-col gap-1">
                    <Skeleton width={120} height={14} />
                    <Skeleton width={80} height={12} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AllTracksSection;
