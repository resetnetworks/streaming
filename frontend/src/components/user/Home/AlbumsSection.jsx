import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { LuSquareChevronRight, LuSquareChevronLeft } from "react-icons/lu";
import Skeleton from "react-loading-skeleton";

import AlbumCard from "../AlbumCard";
import { useInfiniteScroll } from "../../../hooks/useInfiniteScroll";
import { fetchAllAlbums } from "../../../features/albums/albumsSlice";

const AlbumsSection = ({ 
  onPurchaseClick, 
  processingPayment, 
  paymentLoading 
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  
  const [albumsPage, setAlbumsPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const currentUser = useSelector((state) => state.auth.user);
  const albumsStatus = useSelector((state) => state.albums.loading);
  const albumsTotalPages = useSelector((state) => state.albums.pagination.totalPages);
  const allAlbums = useSelector((state) => state.albums.allAlbums);

  const { lastElementRef } = useInfiniteScroll({
    hasMore: albumsPage < (albumsTotalPages || 1),
    loading: albumsStatus || loadingMore,
    onLoadMore: () => {
      if (albumsPage < (albumsTotalPages || 1) && !loadingMore) {
        setLoadingMore(true);
        setAlbumsPage(prev => prev + 1);
      }
    }
  });

  useEffect(() => {
    dispatch(fetchAllAlbums({ page: albumsPage, limit: 10 }))
      .then(() => {
        setLoadingMore(false);
      });
  }, [dispatch, albumsPage]);

  const handleScroll = (direction = "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 200;
    scrollRef.current.scrollBy({
      left: direction === "right" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  };

  const getAlbumPriceDisplay = (album) => {
    if (album.price === 0) {
      return "subs..";
    }
    if (currentUser?.purchasedAlbums?.includes(album._id)) {
      return "Purchased";
    }
    return (
      <button
        className={`text-white sm:text-xs text-[10px] sm:mt-0 px-3 py-1 rounded transition-colors ${
          processingPayment || paymentLoading
            ? "bg-gray-500 cursor-not-allowed"
            : "bg-indigo-600 hover:bg-indigo-700"
        }`}
        onClick={() => onPurchaseClick(album, "album")}
        disabled={processingPayment || paymentLoading}
      >
        {processingPayment || paymentLoading ? "..." : `Buy ₹${album.price}`}
      </button>
    );
  };

  return (
    <>
      <div className="w-full flex justify-between items-center">
        <h2 className="md:text-xl text-lg font-semibold">
          new albums for you
        </h2>

        {/* Back and Next buttons (desktop) */}
        <div className="hidden md:flex items-center gap-2">
          <button
            type="button"
            className="text-white cursor-pointer text-lg hover:text-blue-400 transition-colors"
            onClick={() => handleScroll("left")}
            aria-label="Scroll left"
            title="Back"
          >
            <LuSquareChevronLeft />
          </button>
          <button
            type="button"
            className="text-white cursor-pointer text-lg hover:text-blue-400 transition-colors"
            onClick={() => handleScroll("right")}
            aria-label="Scroll right"
            title="Next"
          >
            <LuSquareChevronRight />
          </button>
        </div>
      </div>
      
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 no-scrollbar whitespace-nowrap min-h-[220px]"
      >
        {albumsStatus && allAlbums.length === 0
          ? [...Array(7)].map((_, idx) => (
              <div
                key={`playlist-skeleton-${idx}`}
                className="min-w=[160px] flex flex-col gap-2 skeleton-wrapper"
              >
                <Skeleton height={160} width={160} className="rounded-xl" />
                <Skeleton width={100} height={12} />
              </div>
            ))
          : allAlbums.map((album, idx) => (
              <div
                key={album._id}
                ref={idx === allAlbums.length - 1 ? lastElementRef : null}
              >
                <AlbumCard
                  tag={`#${album.title || "music"}`}
                  artists={album.artist?.name || "Various Artists"}
                  image={album.coverImage || "/images/placeholder.png"}
                  price={getAlbumPriceDisplay(album)}
                  onClick={() => navigate(`/album/${album.slug}`)}
                />
              </div>
            ))}
        
        {loadingMore && albumsPage < albumsTotalPages ? (
          <div className="min-w-[160px] flex flex-col gap-2 skeleton-wrapper">
            <Skeleton height={160} width={160} className="rounded-xl" />
            <Skeleton width={100} height={12} />
          </div>
        ) : null}
      </div>
    </>
  );
};

export default AlbumsSection;
