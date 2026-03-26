// src/components/artist/dashboard/Sidebar.jsx
import React, { useEffect, useState } from "react";
import IconHeader from "../../user/IconHeader";
import { FaRegUserCircle, FaBars, FaTimes, FaWallet } from "react-icons/fa";
import { FiMusic } from "react-icons/fi";
import { RxDashboard } from "react-icons/rx";
import { useSelector, useDispatch } from "react-redux";
import { fetchArtistProfile } from "../../../features/artists/artistsSlice";
import { useCurrentWorkspace } from "../../../hooks/api/useCurrentWorkspace";
import { getS3Url } from "../../../utills/s3Utils";

// ─── All possible menu items ──────────────────────────────────────────────────
const ALL_MENU_ITEMS = [
  { name: "profile",   icon: <FaRegUserCircle size={20} />,              permission: null              },
  { name: "uploads",   icon: <FiMusic size={20} strokeWidth={1.5} />,    permission: "uploadSong"      },
  { name: "dashboard", icon: <RxDashboard size={20} />,                  permission: "viewAnalytics"   },
  { name: "revenue",   icon: <FaWallet size={20} />,                     permission: "viewPayments"    },
];

// ─── Tab button ───────────────────────────────────────────────────────────────
const TabButton = ({ item, isActive, onClick, isMobile }) => (
  <button
    onClick={() => onClick(item.name)}
    className={`flex items-center gap-4 px-5 ${isMobile ? "py-3" : "py-2"} mb-2 w-full transition-all focus:outline-none cursor-pointer ${
      isActive
        ? "bg-gradient-to-r from-[#0950D7] via-[#4197C8] to-[#0950D7] text-white shadow-lg border-r-4 border-blue-900"
        : "hover:bg-gray-800 text-gray-400"
    }`}
  >
    <span className={`flex-shrink-0 w-5 h-5 flex items-center justify-center ${isActive ? "text-white" : "text-gray-300"}`}>
      {item.icon}
    </span>
    <span className="text-sm font-medium flex-1 text-left capitalize">
      {item.name}
    </span>
  </button>
);

// ─── Profile avatar section ───────────────────────────────────────────────────
const ProfileSection = ({ imageUrl, name, role, onClick, isMobile }) => (
  <div
    className={`flex flex-col items-center px-2 cursor-pointer group ${isMobile ? "mb-40" : "sticky bottom-64"}`}
    onClick={onClick}
  >
    <div className="w-16 h-16 rounded-full border-2 border-blue-500 overflow-hidden mb-2 flex-shrink-0 group-hover:border-blue-400 transition-colors">
      {imageUrl ? (
        <img src={imageUrl} alt="Profile" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">
          {name?.charAt(0)?.toUpperCase() || "?"}
        </div>
      )}
    </div>
    <span className="text-white text-sm tracking-wide text-center max-w-full group-hover:text-blue-400 transition-colors truncate w-full px-1">
      {name || "Artist"}
    </span>
    {/* Role badge — only shown for collaborators */}
    {role && role !== "owner" && (
      <span className="mt-1 text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-medium capitalize">
        {role}
      </span>
    )}
  </div>
);

// ─── Main Sidebar ─────────────────────────────────────────────────────────────
const Sidebar = ({ selectedTab, setSelectedTab, currentUploadPage, onUploadSelect, isMonetized, permissions, isCollaborator }) => {
  const dispatch = useDispatch();
  const [isMobile,     setIsMobile]     = useState(window.innerWidth < 768);
  const [sidebarOpen,  setSidebarOpen]  = useState(false);

  // ── Artist profile — only fetch for owners, not collaborators ────────────────
  const { artistProfile } = useSelector((state) => state.artists);

  useEffect(() => {
    // Collaborators don't have an artist profile — skip this call
    if (!isCollaborator) {
      dispatch(fetchArtistProfile());
    }
  }, [dispatch, isCollaborator]);

  // ── For collaborators: get their name from Redux auth ────────────────────────
  const authUser = useSelector((state) => state.auth.user);

  const displayName  = isCollaborator ? (authUser?.name || "Collaborator") : (artistProfile?.name || "Artist");
  const rawImageUrl  = isCollaborator ? null : artistProfile?.profileImage;
  const imageUrl     = rawImageUrl ? getS3Url(rawImageUrl) : null;

  // ── Workspace role for badge ─────────────────────────────────────────────────
  const { role } = useCurrentWorkspace();

  // ── Filter menu items based on permissions ───────────────────────────────────
  const visibleMenuItems = ALL_MENU_ITEMS.filter((item) => {
    if (!item.permission) return true;               // no permission required (profile)
    if (!isCollaborator)  return true;               // owner sees everything
    return permissions?.[item.permission] === true;  // collaborator — check permission
  });

  // ── Resize handler ───────────────────────────────────────────────────────────
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ── Close sidebar on outside click ──────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && sidebarOpen) {
        const sidebar    = document.getElementById("sidebar");
        const hamburger  = document.getElementById("hamburger-btn");
        if (sidebar && !sidebar.contains(event.target) &&
            hamburger && !hamburger.contains(event.target)) {
          setSidebarOpen(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, sidebarOpen]);

  // ── Tab click handler ────────────────────────────────────────────────────────
  const handleMenuItemClick = (itemName) => {
    setSelectedTab(itemName);
    if (isMobile) setSidebarOpen(false);
  };

  // ── Mobile ───────────────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <>
        <button
          id="hamburger-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed top-4 left-4 z-50 p-2 bg-[#222126] rounded-md text-white shadow-lg"
        >
          {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>

        {sidebarOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] md:hidden">
            <aside
              id="sidebar"
              className="w-64 bg-[#222126] flex flex-col justify-between pb-4 min-h-screen"
            >
              <div>
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                  <div />
                  <button onClick={() => setSidebarOpen(false)} className="p-2 text-gray-400 hover:text-white">
                    <FaTimes size={20} />
                  </button>
                </div>
                <div className="w-full mt-6">
                  {visibleMenuItems.map((item) => (
                    <TabButton
                      key={item.name}
                      item={item}
                      isActive={selectedTab === item.name}
                      onClick={handleMenuItemClick}
                      isMobile
                    />
                  ))}
                </div>
              </div>

              <ProfileSection
                imageUrl={imageUrl}
                name={displayName}
                role={role}
                onClick={() => handleMenuItemClick("profile")}
                isMobile
              />
            </aside>
          </div>
        )}
      </>
    );
  }

  // ── Desktop ──────────────────────────────────────────────────────────────────
  return (
    <aside
      className="w-48 bg-[#222126B2] flex flex-col justify-between pb-4 border-r border-gray-500 min-h-screen"
      style={{ width: "12rem" }}
    >
      <div>
        <IconHeader />
        <div className="w-full mt-6">
          {visibleMenuItems.map((item) => (
            <TabButton
              key={item.name}
              item={item}
              isActive={selectedTab === item.name}
              onClick={handleMenuItemClick}
              isMobile={false}
            />
          ))}
        </div>
      </div>

      <ProfileSection
        imageUrl={imageUrl}
        name={displayName}
        role={role}
        onClick={() => setSelectedTab("profile")}
        isMobile={false}
      />
    </aside>
  );
};

export default Sidebar;