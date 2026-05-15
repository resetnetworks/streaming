import React from "react";
import { Outlet } from "react-router-dom";
import UserSidebar from "./UserSidebar";
import Footer from "./Footer";


const UserLayout = () => {
  return (

    <div className="flex flex-col md:flex-row md:h-screen md:overflow-hidden">
      {/* Sidebar desktop par sticky, mobile par hidden (UserSidebar khud handle karta hai) */}
      <UserSidebar />

      {/* Main content + Footer */}
      <div className="flex-1 flex flex-col no-scrollbar md:overflow-y-auto">
        <div className="flex-1">
          <Outlet />
          <Footer />
        </div>
      </div>
    </div>

  );
};

export default UserLayout;