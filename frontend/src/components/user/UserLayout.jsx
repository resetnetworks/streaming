import React from "react";
import { Outlet } from "react-router-dom";
import UserSidebar from "./UserSidebar";
import Footer from "./Footer";
import BackgroundWrapper from "../BackgroundWrapper";

const UserLayout = () => {
  return (
    <BackgroundWrapper className="sm:pb-0 pb-36">
      <div className="flex">
        <UserSidebar />
        <div className="w-full overflow-auto text-white">
          <Outlet />
        </div>
      </div>
      <Footer/>
    </BackgroundWrapper>
  );
};

export default UserLayout;
