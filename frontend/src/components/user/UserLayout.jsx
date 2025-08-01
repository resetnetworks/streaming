import React from "react";
import { Outlet } from "react-router-dom";
import UserSidebar from "./UserSidebar";
import Footer from "./Footer";

const UserLayout = () => {
  return (
    <div className="min-h-lvh bg-black bg-image sm:pb-0 pb-36">
      <div className="flex">
        <UserSidebar />
        <div className="w-full overflow-auto text-white">
          <Outlet />
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default UserLayout;
