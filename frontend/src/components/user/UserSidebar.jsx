import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import IconHeader from "./IconHeader.jsx";
import { RxDashboard } from "react-icons/rx";
import { FaRegUser } from "react-icons/fa";
import MobileNavBar from "./MobileNavBar";
import MobilePlayer from "./MobilePlayer";
import { FiSearch, FiMusic, FiPlusCircle, FiHeart } from "react-icons/fi";
import { FaShoppingCart } from "react-icons/fa";
import Player from "./Player";

import { useSelector } from "react-redux";
import { selectAllSongs } from "../../features/songs/songSelectors.js"; // Adjust path as needed

const menuItems = [
  { name: "home", icon: <RxDashboard />, path: "/home" },
  { name: "artists", icon: <FaRegUser />, path: "/artists" },
  { name: "search", icon: <FiSearch />, path: "/search" },
  { name: "purchases", icon: <FaShoppingCart />, path: "/purchases" },
  { name: "liked songs", icon: <FiHeart />, path: "/liked-songs" },
];

const UserSidebar = () => {
  const songs = useSelector(selectAllSongs);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {!isMobile && (
        <aside className="h-screen sticky top-0 bg-[#0E1525] flex flex-col">
          {/* ✅ flex-shrink-0 — yeh kabhi squeeze nahi hoga */}
          <div className="flex-shrink-0">
            <IconHeader />
          </div>

          {/* ✅ Nav links — flex-shrink-0 */}
          <div className="w-64 text-white xl:p-4 px-4 pt-4 pb-2 flex-shrink-0">
            {menuItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 p-1 rounded-md mb-1 transition-all 
                  ${isActive
                    ? "bg-gradient-to-r from-[#0950D7] via-[#4197C8] to-[#040b1e00] border-l-4 text-white"
                    : "hover:bg-gray-800 text-gray-400"
                  }`
                }
                style={({ isActive }) =>
                  isActive
                    ? {
                        borderLeft: "3px solid",
                        borderImageSource:
                          "linear-gradient(90deg, #00B2FF 0%, #1D8FFF 50%, #0A0F3C 100%)",
                        borderImageSlice: 1,
                      }
                    : {}
                }
              >
                <span className="xl:text-sm text-xs">{item.icon}</span>
                <span className="capitalize xl:text-sm text-xs">{item.name}</span>
              </NavLink>
            ))}
          </div>

          {/* ✅ Player container — flex-1 + overflow-y-auto + min-h-0 
              min-h-0 zaroori hai flex child mein overflow kaam karne ke liye */}
          <div className="flex-1 min-h-0 overflow-y-auto flex flex-col pb-4 px-4 no-scrollbar">
            <Player />
          </div>
        </aside>
      )}

      {isMobile && (
        <>
          <MobilePlayer />
          <MobileNavBar />
        </>
      )}
    </>
  );
};

export default UserSidebar;