import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import IconHeader from "./IconHeader.jsx"
import { RxDashboard } from "react-icons/rx";
import { FaRegUser } from "react-icons/fa";
import MobileNavBar from "./MobileNavBar";
import MobilePlayer from "./MobilePlayer";
import { FiSearch, FiMusic, FiPlusCircle, FiHeart } from "react-icons/fi";
import Player from "./Player";

import { useSelector } from "react-redux";
import { selectAllSongs } from "../../features/songs/songSelectors.js";  // Adjust path as needed

const menuItems = [
  { name: "home", icon: <RxDashboard />, path: "/" },
  { name: "artists", icon: <FaRegUser />, path: "/artists" },
  { name: "search", icon: <FiSearch />, path: "/search" },
  { name: "library", icon: <FiMusic />, path: "/library" },
  { name: "liked songs", icon: <FiHeart />, path: "/liked-songs" },
];

const UserSidebar = () => {
  // Use Redux selector instead of context
  const songs = useSelector(selectAllSongs);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {!isMobile && (
        <aside className="w-80 min-h-screen bg-[#0E1525] rounded-tr-[50px] rounded-br-[50px] pb-4">
          <IconHeader />

          <div className="w-64 text-white p-4">
            {menuItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 p-1 rounded-md mb-1 transition-all 
                ${
                  isActive
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
                <span className="text-sm">{item.icon}</span>
                <span className="capitalize text-sm">{item.name}</span>
              </NavLink>
            ))}
          </div>

          {/* You still have access to songs here if you want to do something with them */}
          {/* But UI remains unchanged */}

          <div className="flex justify-center pr-2">
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
