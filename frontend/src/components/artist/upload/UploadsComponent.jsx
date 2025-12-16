// UploadsComponent.jsx
import React, { useState } from "react";
import { LuCalendarDays } from "react-icons/lu";
import { FiSearch, FiMenu } from "react-icons/fi";
import { IoFilterOutline } from "react-icons/io5";

const songsData = [
  { id: 1, rank: 1, title: "Runer", plays: "4.6K", date: "8 Apr, 2022", image: "/images/genre5.jpg" },
  { id: 2, rank: 2, title: "Not Today", plays: "5.3K", date: "1 Apr, 2022", image: "/images/genre3.jpg" },
  { id: 3, rank: 3, title: "Spring Day", plays: "5.1K", date: "7 Apr, 2022", image: "/images/genre4.jpg" },
  { id: 4, rank: 4, title: "My Universe", plays: "4.2K", date: "10 Apr, 2022", image: "/images/genre6.jpg" },
  { id: 5, rank: 5, title: "Euphoria", plays: "4.1K", date: "12 Apr, 2022", image: "/images/genre7.jpg" },
  { id: 6, rank: 6, title: "Runer", plays: "4.6K", date: "8 Apr, 2022", image: "/images/genre5.jpg" },
  { id: 7, rank: 7, title: "Not Today", plays: "5.3K", date: "1 Apr, 2022", image: "/images/genre3.jpg" },
  { id: 8, rank: 8, title: "Spring Day", plays: "5.1K", date: "7 Apr, 2022", image: "/images/genre4.jpg" },
  { id: 9, rank: 9, title: "My Universe", plays: "4.2K", date: "10 Apr, 2022", image: "/images/genre6.jpg" },
  { id: 10, rank: 10, title: "Euphoria", plays: "4.1K", date: "12 Apr, 2022", image: "/images/genre7.jpg" },
];

const albumsData = [
  { id: 1, rank: 1, title: "Album One", plays: "9.3K", date: "3 Apr, 2022", image: "/images/genre1.jpg" },
  { id: 2, rank: 2, title: "Album Two", plays: "7.8K", date: "6 Apr, 2022", image: "/images/genre2.jpg" },
];

const UploadsComponent = () => {
  const [activeTab, setActiveTab] = useState("songs");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("lastMonth");
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  const data = activeTab === "songs" ? songsData : albumsData;

  const filtered = data.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6">
      <div className="w-full h-full text-white">
        {/* Mobile Header - Only shown on small screens */}
        <div className="flex items-center justify-between mb-6 md:hidden">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab("songs")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === "songs"
                      ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      : "bg-white/5 text-white/60"
                  }`}
                >
                  Songs
                </button>
                <button
                  onClick={() => setActiveTab("albums")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === "albums"
                      ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      : "bg-white/5 text-white/60"
                  }`}
                >
                  Albums
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="p-2 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
            >
              <FiSearch className="text-lg" />
            </button>
            <button
              onClick={() => setShowMobileFilter(!showMobileFilter)}
              className="p-2 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
            >
              <IoFilterOutline className="text-lg" />
            </button>
          </div>
        </div>

        {/* Mobile Search Input - Slides down */}
        {showMobileSearch && (
          <div className="mb-4 md:hidden animate-fadeIn">
            <div className="relative">
              <input
                type="text"
                placeholder="Search songs or albums..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#020617] border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 pl-12"
              />
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 text-lg" />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}

        {/* Mobile Filter Dropdown - Slides down */}
        {showMobileFilter && (
          <div className="mb-4 md:hidden animate-fadeIn">
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full bg-[#1063F780] border border-white/10 rounded-lg px-4 py-3 text-sm pr-12 pl-12 focus:outline-none focus:border-blue-500 appearance-none"
              >
                <option value="lastMonth">Last Month</option>
                <option value="lastWeek">Last Week</option>
                <option value="allTime">All Time</option>
              </select>
              <LuCalendarDays className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 text-lg" />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-5 h-5 text-white/60"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Desktop Header - Hidden on mobile */}
        <div className="hidden md:flex items-center justify-between mb-8 pb-4 border-b border-gray-500/50">
          {/* Tabs */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-1 relative">
              <button
                onClick={() => setActiveTab("songs")}
                className={`pb-2 text-lg relative z-10 px-2 ${
                  activeTab === "songs" ? "text-[#0687F5]" : "text-white/50 hover:text-white/80"
                } transition-colors`}
              >
                songs
                {activeTab === "songs" && (
                  <div className="absolute -bottom-[17px] left-0 w-full h-0.5 rounded-lg bg-blue-400 transform translate-y-[calc(100%+1px)] shadow-[0_0_10px_#60a5fa,0_0_20px_#3b82f6]" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("albums")}
                className={`pb-2 text-lg relative z-10 px-2 ${
                  activeTab === "albums" ? "text-[#0687F5]" : "text-white/50 hover:text-white/80"
                } transition-colors`}
              >
                albums
                {activeTab === "albums" && (
                  <div className="absolute -bottom-[17px] left-0 w-full h-0.5 rounded-lg bg-blue-400 transform translate-y-[calc(100%+1px)] shadow-[0_0_10px_#60a5fa,0_0_20px_#3b82f6]" />
                )}
              </button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="search here..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-[280px] bg-[#020617] border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
              />
              <FiSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40" />
            </div>

            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-[#1063F780] border border-white/10 rounded-lg px-4 py-2.5 text-sm pr-12 pl-12 focus:outline-none focus:border-blue-500 appearance-none min-w-[160px]"
              >
                <option value="lastMonth">last Month</option>
                <option value="lastWeek">last Week</option>
                <option value="allTime">all Time</option>
              </select>
              <LuCalendarDays className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 text-sm" />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-4 h-4 text-white/60"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Table Header - Desktop */}
        <div className="hidden md:block px-6 border-b border-gray-500/50 pb-4 mb-2">
          <div className="grid grid-cols-[60px_1fr_120px_140px] text-sm text-white/60 font-medium">
            <span>#</span>
            <span>title</span>
            <span className="text-right">streams</span>
            <span className="text-right">added on</span>
          </div>
        </div>

        {/* Content List */}
        <div className="space-y-2 md:space-y-0">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`
                group
                flex flex-col md:grid md:grid-cols-[60px_1fr_120px_140px]
                p-4 md:p-6
                border-b border-gray-500/30 last:border-b-0
                hover:bg-gradient-to-r hover:from-[#020617] hover:via-[#001b3d] hover:to-[#020617]
                transition-all duration-300
                rounded-lg md:rounded-none
                bg-white/5 md:bg-transparent
              `}
            >
              {/* Mobile View */}
              <div className="md:hidden">
                <div className="flex items-start gap-4">
                  {/* Album Art */}
                  <div className="relative">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                          if (e.target.nextSibling) {
                            e.target.nextSibling.style.display = "flex";
                          }
                        }}
                      />
                      <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 items-center justify-center text-white text-base font-bold hidden">
                        {item.title.charAt(0)}
                      </div>
                    </div>
                    <div className="absolute -top-2 -left-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold">
                      {item.rank}
                    </div>
                  </div>

                  {/* Song Info */}
                  <div className="flex-1">
                    <h3 className="text-white font-medium text-base mb-1">{item.title}</h3>
                    
                    <div className="flex items-center justify-between text-sm text-white/60">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                          </svg>
                          {item.plays}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <LuCalendarDays className="w-3 h-3" />
                        <span>{item.date}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop View */}
              <div className="hidden md:contents">
                <span className="text-white/70 flex items-center">{item.rank}</span>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-md overflow-hidden bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.style.display = "none";
                        if (e.target.nextSibling) {
                          e.target.nextSibling.style.display = "flex";
                        }
                      }}
                    />
                    <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 items-center justify-center text-white text-xs font-bold hidden">
                      {item.title.charAt(0)}
                    </div>
                  </div>
                  <span className="truncate text-white group-hover:text-blue-300 transition-colors">
                    {item.title}
                  </span>
                </div>

                <span className="text-right text-white/60 group-hover:text-white transition-colors">
                  {item.plays}
                </span>
                <span className="text-right text-white/40 group-hover:text-white/60 transition-colors">
                  {item.date}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-block p-6 bg-white/5 rounded-2xl border border-white/10">
              <FiSearch className="w-12 h-12 text-white/30 mx-auto mb-4" />
              <p className="text-white/60">No results found for "{search}"</p>
              <p className="text-white/40 text-sm mt-2">Try a different search term</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadsComponent;