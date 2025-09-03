import React, {
  useMemo,
  useRef,
  useCallback,
  useEffect,
  forwardRef,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { LuSquareChevronRight, LuSquareChevronLeft } from "react-icons/lu";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// --- TODO: Adjust these import paths to match your project structure ---
import {
  fetchAllArtists,
  loadFromCache,
} from "../../../features/artists/artistsSlice";
import {
  selectAllArtists,
  selectArtistLoading,
  selectArtistError,
  selectIsPageCached,
} from "../../../features/artists/artistsSelectors";

// --- NEW: Helper function inspired by your Artists.jsx to format plan cycles ---
const cycleLabel = (c) => {
  switch (String(c)) {
    case "1m":
      return "mo";
    case "3m":
      return "3m";
    case "6m":
      return "6m";
    case "12m":
      return "yr"; // Using 'yr' is shorter for the UI
    default:
      return c || "";
  }
};

// Lazy image component (No changes)
const LazyImg = ({ src, alt, className }) => {
  const imgRef = useRef(null);
  const [loadedSrc, setLoadedSrc] = useState(null);

  useEffect(() => setLoadedSrc(null), [src]);

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setLoadedSrc(src);
          io.unobserve(el);
        }
      },
      { rootMargin: "200px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [src]);

  return (
    <div
      ref={imgRef}
      className={`w-full h-full bg-slate-800 ${className}`}
      aria-busy={!loadedSrc}
    >
      {loadedSrc ? (
        <img
          src={loadedSrc}
          alt={alt}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <Skeleton
          circle={true}
          width="100%"
          height="100%"
          baseColor="#1e2b3b"
          highlightColor="#334155"
        />
      )}
    </div>
  );
};

// Artist Circle component
const ArtistCircle = forwardRef(function ArtistCircle(
  { artist, onClick },
  ref
) {
  // --- MODIFIED: This logic now finds the cheapest plan instead of just the monthly one ---
  const priceDisplay = useMemo(() => {
    const plans = artist?.subscriptionPlans;
    if (!plans || plans.length === 0) {
      return "Free";
    }

    // Filter for valid plans with a price and sort them to find the cheapest
    const sortedPlans = plans
      .filter((p) => p && typeof p.price === "number")
      .sort((a, b) => a.price - b.price);

    // If no valid plans are left after filtering, show Free
    if (sortedPlans.length === 0) {
      return "Free";
    }

    const cheapestPlan = sortedPlans[0];
    const label = cycleLabel(cheapestPlan.cycle);
    return `₹${cheapestPlan.price}/${label}`;
  }, [artist?.subscriptionPlans]);

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      className="group relative sm:w-48 sm:h-48 h-32 w-32 shrink-0 rounded-full focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/80 transition-shadow duration-300 ease-in-out shadow-[0_0_15px_rgba(59,130,246,0.15)] hover:shadow-[0_0_25px_rgba(59,130,246,0.4)]"
      aria-label={`Open artist ${artist?.name || ""}`}
    >
      <div className="absolute inset-0 rounded-full overflow-hidden">
        <LazyImg
          src={artist?.image || artist?.avatar || "/images/placeholder.png"}
          alt={artist?.name || "artist"}
          className="transition-transform duration-300 ease-in-out group-hover:scale-110"
        />
      </div>
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.15)_10%,_transparent_80%)]"></div>
      <div className="absolute inset-0 flex flex-col items-center justify-end p-4 text-center rounded-full bg-gradient-to-t from-black/80 to-transparent from-0% to-60%">
        <h3 className="w-full text-sm font-semibold text-white truncate text-shadow">
          {artist?.name || "Unknown Artist"}
        </h3>
        <p className="text-xs font-medium text-sky-300 group-hover:text-sky-200 transition-colors duration-300">
          {priceDisplay}
        </p>
      </div>
      <div className="absolute inset-0 transition-all duration-300 border-2 border-transparent rounded-full pointer-events-none group-hover:border-blue-500/80"></div>
    </button>
  );
});

// Main Section Component with Advanced Caching Logic (No other changes needed here)
const ArtistSection = ({ title = "Featured Artists", onNavigateArtist }) => {
  const dispatch = useDispatch();

  const artists = useSelector(selectAllArtists) || [];
  const loading = useSelector(selectArtistLoading);
  const error = useSelector(selectArtistError);

  const isPageOneCached = useSelector(selectIsPageCached(1));

  const scrollRef = useRef(null);

  useEffect(() => {
    if (isPageOneCached) {
      dispatch(loadFromCache(1));
    } else if (artists.length === 0) {
      dispatch(fetchAllArtists({ page: 1, limit: 12 }));
    }
  }, [dispatch, isPageOneCached, artists.length]);

  const handleScroll = (dir = "right") => {
    if (!scrollRef.current) return;
    const amount = 340;
    scrollRef.current.scrollBy({
      left: dir === "right" ? amount : -amount,
      behavior: "smooth",
    });
  };

  const onKeyDown = useCallback((e) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      handleScroll("right");
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      handleScroll("left");
    }
  }, []);

  return (
    <section className="w-full py-3" aria-label={title}>
      <div className="w-full flex justify-between items-center mb-2">
        <h2 className="md:text-xl text-lg font-semibold text-white">{title}</h2>
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
        className="flex sm:gap-6 gap-4 overflow-x-auto no-scrollbar py-4"
        style={{ scrollSnapType: "x proximity" }}
        role="region"
        aria-roledescription="carousel"
        aria-label="Artist carousel"
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        {loading ? (
          [...Array(8)].map((_, i) => (
            <div key={`artist-skel-${i}`} className="sm:w-48 sm:h-48 h-32 w-32 shrink-0">
              <Skeleton
                circle={true}
                height={160}
                width={160}
                baseColor="#1e2b3b"
                highlightColor="#334155"
              />
            </div>
          ))
        ) : error ? (
          <div className="w-full text-center py-10 px-4 bg-slate-800/50 rounded-lg">
            <p className="text-red-400">Could not load artists.</p>
          </div>
        ) : artists.length > 0 ? (
          artists.map((artist) => (
            <div
              key={artist._id || artist.slug}
              style={{ scrollSnapAlign: "start" }}
              className="shrink-0"
            >
              <ArtistCircle
                artist={artist}
                onClick={() => onNavigateArtist?.(artist)}
              />
            </div>
          ))
        ) : (
          <div className="w-full text-center py-10 px-4 bg-slate-800/50 rounded-lg">
            <p className="text-slate-400">No featured artists found.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ArtistSection;
