import React from "react";
import { NavLink } from "react-router-dom";
import { FaRegUser } from "react-icons/fa";
import {
  RxDashboard,
  RxMagnifyingGlass,
  RxHeart,
} from "react-icons/rx";
import { FaShoppingCart } from "react-icons/fa";
const menuItems = [
  { name: "Home", icon: <RxDashboard size={24} />, path: "/" },
  { name: "artists", icon: <FaRegUser />, path: "/artists" },
  { name: "Search", icon: <RxMagnifyingGlass size={24} />, path: "/search" },
  { name: "purchases", icon: <FaShoppingCart size={20} />, path: "/purchases" },
  { name: "Liked", icon: <RxHeart size={24} />, path: "/liked-songs" },
];

const MobileNavBar = () => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0E1525] border-t border-gray-800 z-50">
      <div className="flex justify-around items-center py-3">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center justify-center p-2 rounded-full transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`
            }
          >
            <span className="sr-only">{item.name}</span>
            {item.icon}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default MobileNavBar;
