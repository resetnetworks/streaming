// src/components/user/Artist/ArtistAlbumsSection.jsx
import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { LuSquareChevronRight, LuSquareChevronLeft } from "react-icons/lu";
import Skeleton from "react-loading-skeleton";
import AlbumCard from "../AlbumCard";
import { getAlbumsByArtist } from "../../../features/albums/albumsSlice";
import {
  selectArtistAlbums,
  selectArtistAlbumPagination,
} from "../../../features/albums/albumsSelector";
import { useInfiniteScroll } from "../../../hooks/useInfiniteScroll";

const ArtistAlbumsSection = ({ artistId, currentUser, onPurchaseClick }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const recentScrollRef = useRef(null);
  const [albumsPage, setAlbumsPage] = useState(1);
  const [albumsStatus, setAlbumsStatus] = useState("idle");
  const [hasMoreAlbums, setHasMoreAlbums] = useState(true);

  const artistAlbums = useSelector(selectArtistAlbums);
  const artistAlbumPagination = useSelector(selectArtistAlbumPagination);

  const { lastElementRef: albumsLastRef } = useInfiniteScroll({
    hasMore: hasMoreAlbums && albumsPage < artistAlbumPagination.totalPages,
    loading: albumsStatus === "loading",
    onLoadMore: () => setAlbumsPage(prev => prev + 1)
  });

  useEffect(() => {
    setAlbumsPage(1);
    setHasMoreAlbums(true);
    setAlbumsStatus("idle");
  }, [artistId]);

  const fetchAlbums = async (page) => {
    if (albumsStatus === "loading") return;
    setAlbumsStatus("loading");
    try {
      await dispatch(getAlbumsByArtist({ artistId, page, limit: 10 })).unwrap();
      if (page >= artistAlbumPagination.totalPages) {
        setHasMoreAlbums(false);
      }
    } catch (error) {
      console.error("Failed to fetch albums:", error);
    } finally {
      setAlbumsStatus("idle");
    }
  };

  useEffect(() => {
    if (albumsPage > 1 && hasMoreAlbums) {
      fetchAlbums(albumsPage);
    }
  }, [albumsPage, hasMoreAlbums]);

  const handleScroll = (direction = "right") => {
    const scrollAmount = direction === "right" ? 200 : -200;
    recentScrollRef?.current?.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  return (
    <>
      <div className="flex justify-between mt-6 px-6 text-lg text-white items-center">
        <h2>Albums</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">
            Page {artistAlbumPagination.page} of {artistAlbumPagination.totalPages}
          </span>
          <LuSquareChevronLeft
            className="text-white cursor-pointer hover:text-blue-800 text-lg"
            onClick={() => handleScroll("left")}
          />
          <LuSquareChevronRight
            className="text-white cursor-pointer hover:text-blue-800 text-lg"
            onClick={() => handleScroll("right")}
          />
        </div>
      </div>
      
      <div className="px-6 py-2">
        <div
          ref={recentScrollRef}
          className="flex gap-4 overflow-x-auto pb-2 no-scrollbar whitespace-nowrap min-h-[220px]"
        >
          {albumsStatus === "loading" && artistAlbums.length === 0 ? (
            [...Array(5)].map((_, idx) => (
              <div key={`album-skeleton-${idx}`} className="min-w-[160px]">
                <Skeleton height={160} width={160} className="rounded-xl" />
                <Skeleton width={120} height={16} className="mt-2" />
              </div>
            ))
          ) : artistAlbums.length > 0 ? (
            <>
              {artistAlbums.map((album, idx) => (
                <AlbumCard
                  key={album._id}
                  ref={idx === artistAlbums.length - 1 ? albumsLastRef : null}
                  tag={`#${album.title || "music"}`}
                  artists={album.artist?.name || "Various Artists"}
                  image={album.coverImage || "/images/placeholder.png"}
                  price={
                    album.price === 0 ? (
                      "subs.."
                    ) : currentUser?.purchasedAlbums?.includes(album._id) ? (
                      "Purchased"
                    ) : (
                      <button
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-2 py-1 rounded disabled:opacity-50"
                        onClick={() => onPurchaseClick(album, "album")}
                      >
                        Buy for $${album.price}
                      </button>
                    )
                  }
                  onClick={() => navigate(`/album/${album.slug}`)}
                />
              ))}
              {albumsStatus === "loading" &&
                hasMoreAlbums &&
                [...Array(2)].map((_, idx) => (
                  <div key={`album-loading-${idx}`} className="min-w-[160px]">
                    <Skeleton height={160} width={160} className="rounded-xl" />
                    <Skeleton width={120} height={16} className="mt-2" />
                  </div>
                ))}
            </>
          ) : (
            <p className="text-white text-sm">No albums found.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default ArtistAlbumsSection;
