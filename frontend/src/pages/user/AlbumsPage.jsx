// src/pages/AlbumsPage.jsx
import React, { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaSearch, 
  FaFilter, 
  FaTh, 
  FaList, 
  FaSortAmountDown, 
  FaCalendarAlt, 
  FaCalendar, 
  FaSortAlphaDown, 
  FaSortAlphaUp, 
  FaMusic, 
  FaArrowUp, 
  FaSpinner,
  FaTimes,
  FaSync,
  FaInfoCircle
} from "react-icons/fa";
import { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import PageSEO from "../../components/PageSeo/PageSEO";
import UserHeader from "../../components/user/UserHeader";
import AlbumCard from "../../components/user/AlbumCard";
import { useAlbumsInfinite } from "../../hooks/api/useAlbums";
import LoadingOverlay from "../../components/user/Home/LoadingOverlay";

// ✅ Custom Debounce Hook Definition
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const AlbumsPage = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  
  // ✅ Using custom debounce hook (500ms delay)
  const debouncedSearch = useDebounce(searchQuery, 500);
  
  const [sortBy, setSortBy] = useState("newest");
  const [filterGenre, setFilterGenre] = useState("all");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const scrollContainerRef = useRef(null);

  // React Query for infinite scroll
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useAlbumsInfinite(12);

  // Flatten all albums from pages
  const allAlbums = data?.pages?.flatMap(page => page?.data ?? []) ?? [];

  // Get unique genres for filter dropdown
  const uniqueGenres = React.useMemo(() => {
    const genres = ["all"];
    allAlbums.forEach(album => {
      if (album.genre && !genres.includes(album.genre)) {
        genres.push(album.genre);
      }
    });
    return genres;
  }, [allAlbums]);

  // Update active filters when genre changes
  useEffect(() => {
    if (filterGenre !== "all") {
      setActiveFilters([`Genre: ${filterGenre}`]);
    } else {
      setActiveFilters([]);
    }
  }, [filterGenre]);

  // Filter and sort albums
  const filteredAlbums = React.useMemo(() => {
    return allAlbums
      .filter(album => {
        // Search filter
        const matchesSearch = debouncedSearch === "" || 
          album.title?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          album.artist?.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          album.genre?.toLowerCase().includes(debouncedSearch.toLowerCase());
        
        // Genre filter
        const matchesGenre = filterGenre === "all" || album.genre === filterGenre;
        
        return matchesSearch && matchesGenre;
      })
      .sort((a, b) => {
        // Sorting logic
        switch (sortBy) {
          case "newest":
            return new Date(b.createdAt || b.releaseDate || 0) - new Date(a.createdAt || a.releaseDate || 0);
          case "oldest":
            return new Date(a.createdAt || a.releaseDate || 0) - new Date(b.createdAt || b.releaseDate || 0);
          case "title-asc":
            return (a.title || "").localeCompare(b.title || "");
          case "title-desc":
            return (b.title || "").localeCompare(a.title || "");
          default:
            return 0;
        }
      });
  }, [allAlbums, debouncedSearch, filterGenre, sortBy]);

  // Handle scroll for infinite loading
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    
    // Show/Hide scroll to top button
    setShowScrollTop(scrollTop > 300);
    
    // Load more when near bottom
    if (scrollHeight - scrollTop <= clientHeight + 200 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Scroll to top function
  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Add scroll event listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // Truncate title helper
  const truncateTitle = (title, maxLength = 40) => {
    if (!title) return "Untitled Album";
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + "...";
  };

  // Handle album click
  const handleAlbumClick = (album) => {
    if (album.slug) {
      navigate(`/album/${album.slug}`);
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery("");
    setFilterGenre("all");
    setSortBy("newest");
  };

  // Remove specific filter
  const removeFilter = (filter) => {
    if (filter.startsWith("Genre:")) {
      setFilterGenre("all");
    }
  };

  // Get sort icon based on current sort
  const getSortIcon = () => {
    switch (sortBy) {
      case "newest":
        return <FaCalendarAlt className="mr-2" />;
      case "oldest":
        return <FaCalendar className="mr-2" />;
      case "title-asc":
        return <FaSortAlphaDown className="mr-2" />;
      case "title-desc":
        return <FaSortAlphaUp className="mr-2" />;
      default:
        return <FaSortAmountDown className="mr-2" />;
    }
  };

  // Get sort options with icons
  const sortOptions = [
    { value: "newest", label: "Newest First", icon: <FaCalendarAlt /> },
    { value: "oldest", label: "Oldest First", icon: <FaCalendar /> },
    { value: "title-asc", label: "Title A-Z", icon: <FaSortAlphaDown /> },
    { value: "title-desc", label: "Title Z-A", icon: <FaSortAlphaUp /> },
  ];

  return (
    <>
      <PageSEO
        title="All Albums - Reset Music"
        description="Browse all albums on Reset Music. Discover new music from various artists and genres."
        canonicalUrl="https://musicreset.com/albums"
        noIndex={false}
      />
      
      <UserHeader />
      
      <SkeletonTheme baseColor="#1f2937" highlightColor="#374151">
        <div className="min-h-screen text-white">
          {/* Hero Section */}
          <div className="relative bg-gradient-to-r from-blue-900/80 to-indigo-900/80 py-12 px-4 backdrop-blur-sm">
            <div className="container mx-auto relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center mb-4">
                    <h1 className="text-4xl md:text-5xl font-bold">
                      All Albums
                    </h1>
                  </div>
                  <p className="text-lg text-gray-200 max-w-2xl">
                    Explore our complete music library. {allAlbums.length > 0 ? `${allAlbums.length}+ albums` : 'Discover amazing music'} from talented artists worldwide.
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="md:hidden flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    <FaFilter />
                    Filters
                  </button>
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
          </div>

          {/* Active Filters Bar */}
          {(activeFilters.length > 0 || searchQuery) && (
            <div className="bg-gray-900/50 border-b border-gray-800">
              <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-gray-400">Active filters:</span>
                    
                    {/* Search query filter */}
                    {searchQuery && (
                      <div className="flex items-center gap-1 px-3 py-1 bg-blue-900/30 rounded-full">
                        <span className="text-xs">Search: "{searchQuery}"</span>
                        <button
                          onClick={() => setSearchQuery("")}
                          className="text-gray-400 hover:text-white"
                        >
                          <FaTimes size={12} />
                        </button>
                      </div>
                    )}
                    
                    {/* Genre filter */}
                    {filterGenre !== "all" && (
                      <div className="flex items-center gap-1 px-3 py-1 bg-purple-900/30 rounded-full">
                        <span className="text-xs">Genre: {filterGenre}</span>
                        <button
                          onClick={() => setFilterGenre("all")}
                          className="text-gray-400 hover:text-white"
                        >
                          <FaTimes size={12} />
                        </button>
                      </div>
                    )}
                    
                    {/* Sort filter */}
                    {sortBy !== "newest" && (
                      <div className="flex items-center gap-1 px-3 py-1 bg-green-900/30 rounded-full">
                        <span className="text-xs">
                          Sort: {sortOptions.find(opt => opt.value === sortBy)?.label}
                        </span>
                        <button
                          onClick={() => setSortBy("newest")}
                          className="text-gray-400 hover:text-white"
                        >
                          <FaTimes size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
                  >
                    <FaTimes />
                    Clear all
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Filters and Controls */}
          <div className={`sticky top-0 z-20 bg-gray-900/95 backdrop-blur-md border-b border-gray-800 shadow-lg transition-all duration-300 ${showFilters ? '' : 'md:block hidden'}`}>
            <div className="container mx-auto px-4 py-3">
              <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md w-full">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search albums, artists, or genres..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                  />
                  
                  {/* Search status indicator */}
                  {searchQuery && searchQuery !== debouncedSearch && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                      <div className="animate-pulse w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-xs text-gray-400">Searching...</span>
                    </div>
                  )}
                </div>

                {/* View Toggle */}
                <div className="flex items-center gap-1 bg-gray-800 p-1 rounded-lg">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-md transition-all ${viewMode === "grid" ? "bg-blue-600 text-white shadow-md" : "text-gray-400 hover:bg-gray-700"}`}
                    title="Grid View"
                  >
                    <FaTh />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-md transition-all ${viewMode === "list" ? "bg-blue-600 text-white shadow-md" : "text-gray-400 hover:bg-gray-700"}`}
                    title="List View"
                  >
                    <FaList />
                  </button>
                </div>

                {/* Sort Dropdown */}
                <div className="relative group">
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors">
                    {getSortIcon()}
                    <span className="hidden sm:inline">
                      {sortOptions.find(opt => opt.value === sortBy)?.label || "Sort By"}
                    </span>
                    <FaSortAmountDown className="ml-1" />
                  </button>
                  <div className="absolute right-0 mt-1 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSortBy(option.value)}
                        className={`w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-700 transition-colors ${sortBy === option.value ? 'bg-blue-900/30 text-blue-300' : 'text-gray-300'}`}
                      >
                        {option.icon}
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Genre Filter */}
                <div className="relative">
                  <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    value={filterGenre}
                    onChange={(e) => setFilterGenre(e.target.value)}
                    className="pl-10 pr-8 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
                  >
                    {uniqueGenres.map(genre => (
                      <option key={genre} value={genre} className="bg-gray-800">
                        {genre === "all" ? "All Genres" : genre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="bg-gray-900/50 border-b border-gray-800">
            <div className="container mx-auto px-4 py-2">
              <div className="flex items-center justify-between text-sm text-gray-400">
                <div className="flex items-center gap-4">
                  <span>
                    <span className="text-blue-300 font-semibold">{filteredAlbums.length}</span> albums found
                    {filteredAlbums.length !== allAlbums.length && (
                      <span className="ml-2 text-gray-500">
                        (of {allAlbums.length} total)
                      </span>
                    )}
                  </span>
                  {debouncedSearch && (
                    <span className="flex items-center gap-1">
                      <FaSearch size={12} />
                      Searching: "{debouncedSearch}"
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-gray-800 rounded text-xs">
                    {viewMode === "grid" ? "Grid View" : "List View"}
                  </span>
                  {isLoading && (
                    <span className="flex items-center gap-1 text-blue-400">
                      <FaSpinner className="animate-spin" />
                      Loading...
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Albums Grid/List */}
            <div 
              ref={scrollContainerRef}
              className="container mx-auto px-4 py-6 custom-scrollbar"
              style={{ 
                maxHeight: "calc(100vh - 240px)", 
                overflowY: "auto",
                scrollBehavior: "smooth"
              }}
            >
              {isLoading && allAlbums.length === 0 ? (
                // Initial Loading Skeleton
                <div className={`${viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" : "space-y-4"} gap-6`}>
                  {[...Array(10)].map((_, idx) => (
                    viewMode === "grid" ? (
                      <div key={idx} className="animate-pulse">
                        <div className="bg-gray-800 rounded-xl h-60 mb-3"></div>
                        <div className="h-5 bg-gray-800 rounded w-4/5 mb-2"></div>
                        <div className="h-4 bg-gray-800 rounded w-3/5"></div>
                      </div>
                    ) : (
                      <div key={idx} className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg animate-pulse">
                        <div className="w-16 h-16 bg-gray-800 rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-5 bg-gray-800 rounded w-1/3"></div>
                          <div className="h-4 bg-gray-800 rounded w-1/4"></div>
                        </div>
                        <div className="h-6 bg-gray-800 rounded w-20"></div>
                      </div>
                    )
                  ))}
                </div>
              ) : filteredAlbums.length === 0 ? (
                // No Results
                <div className="text-center py-16">
                  <div className="inline-block p-8 bg-gray-800/50 rounded-full mb-6 backdrop-blur-sm">
                    <FaSearch className="text-gray-400 text-5xl" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">No Albums Found</h3>
                  <p className="text-gray-400 mb-8 max-w-md mx-auto">
                    {searchQuery 
                      ? `No albums match "${searchQuery}". Try searching with different keywords.`
                      : filterGenre !== "all"
                        ? `No albums found in ${filterGenre} genre.`
                        : "No albums available at the moment."
                    }
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <FaTimes />
                        Clear Search
                      </button>
                    )}
                    {filterGenre !== "all" && (
                      <button
                        onClick={() => setFilterGenre("all")}
                        className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <FaFilter />
                        Clear Filter
                      </button>
                    )}
                    {(searchQuery || filterGenre !== "all") && (
                      <button
                        onClick={clearAllFilters}
                        className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <FaTimes />
                        Clear All Filters
                      </button>
                    )}
                  </div>
                </div>
              ) : viewMode === "grid" ? (
                // Grid View
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {filteredAlbums.map((album, index) => (
                      <div 
                        key={album._id || index}
                      >
                        <AlbumCard
                          tag={truncateTitle(album.title)}
                          artists={album.artist?.name || "Various Artists"}
                          image={album.coverImage || "/images/album-placeholder.jpg"}
                          onClick={() => handleAlbumClick(album)}
                          price={album.accessType === "purchase-only" ? "Premium" : "sub.."}
                        />
                      </div>
                    ))}
                  </div>
                  
                  {/* Loading More Indicator */}
                  {isFetchingNextPage && (
                    <div className="text-center py-10">
                      <div className="inline-flex items-center gap-3 px-6 py-3 bg-gray-800/50 rounded-full">
                        <FaSpinner className="animate-spin text-blue-400" />
                        <span className="text-gray-300">Loading more albums...</span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                // List View
                <>
                  <div className="space-y-3">
                    {filteredAlbums.map((album, index) => (
                      <div
                        key={album._id || index}
                        onClick={() => handleAlbumClick(album)}
                        className="flex items-center gap-4 p-4 bg-gray-800/30 hover:bg-gray-800/70 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-blue-900/10 group border border-transparent hover:border-gray-700"
                      >
                        <div className="relative flex-shrink-0">
                          <img
                            src={album.coverImage || "/images/album-placeholder.jpg"}
                            alt={album.title}
                            className="w-16 h-16 rounded-lg object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-blue-500/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg truncate group-hover:text-blue-300 transition-colors">
                            {album.title || "Untitled Album"}
                          </h3>
                          <p className="text-gray-400 text-sm truncate">
                            {album.artist?.name || "Various Artists"}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs ${
                            album.accessType === "purchase-only" 
                              ? "bg-yellow-900/30 text-yellow-300 border border-yellow-900/50" 
                              : "bg-green-900/30 text-green-300 border border-green-900/50"
                          }`}>
                            {album.accessType === "purchase-only" ? "Premium" : "sub.."}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Loading More Indicator for List View */}
                  {isFetchingNextPage && (
                    <div className="mt-6 text-center">
                      <div className="inline-flex items-center gap-3 px-6 py-3 bg-gray-800/50 rounded-full">
                        <FaSpinner className="animate-spin text-blue-400" />
                        <span className="text-gray-300">Loading more albums...</span>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* End of Results Message */}
              {!hasNextPage && filteredAlbums.length > 0 && (
                <div className="text-center py-10 mt-4 border-t border-gray-800/50">
                  <div className="inline-block p-4 rounded-full bg-gradient-to-r from-blue-900/20 to-purple-900/20 mb-3">
                    <FaMusic className="text-blue-300 text-3xl" />
                  </div>
                  <p className="text-gray-400 mb-2">
                    You've reached the end. <span className="text-blue-300 font-semibold">{filteredAlbums.length}</span> albums loaded.
                  </p>
                  <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
                    <FaInfoCircle />
                    {allAlbums.length} total albums in library
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </SkeletonTheme>
      
      {/* Mobile Filters Toggle */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="fixed bottom-6 left-6 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-50 md:hidden"
        aria-label="Toggle filters"
      >
        <FaFilter />
      </button>
    </>
  );
};

export default AlbumsPage;