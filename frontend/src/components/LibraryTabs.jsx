import { useState } from "react";

const tabs = ["albums", "songs", "artists", "playlists"];

export default function LibraryTabs() {
  const [activeTab, setActiveTab] = useState("albums");

  return (
    <div className="w-full p-6 text-white bg-transparent">
      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-700 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`capitalize pb-2 transition duration-300 relative group ${
              activeTab === tab
                ? "text-blue-700"
                : "text-gray-400 hover:text-blue-500"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute left-0 -bottom-[2px] w-full h-[2px] bg-blue-500 rounded-xl shadow-[0_0_10px_2px_#3b82f6]"></span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content with smooth fade-in */}
      <div className="transition-opacity duration-500 ease-in-out opacity-100">
        {activeTab === "albums" && (
          <div>
            <h1 className="text-center text-3xl text-white">
              This is Album Tab
            </h1>
          </div>
        )}
        {activeTab === "songs" && (
          <div>
            <h1 className="text-center text-3xl text-white">
              This is Song Tab
            </h1>
          </div>
        )}
        {activeTab === "artists" && (
          <div>
            <h1 className="text-center text-3xl text-white">
              This is Artists Tab
            </h1>
          </div>
        )}
        {activeTab === "playlists" && (
          <div>
            <h1 className="text-center text-3xl text-white">
              This is Playlists Tab
            </h1>
          </div>
        )}
      </div>
    </div>
  );
}
