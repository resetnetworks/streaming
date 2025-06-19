import React from "react";
import UserSidebar from "./UserSidebar";

const UserLayout = ({ children }) => {
  return (
    <div className="min-h-lvh bg-black bg-image sm:pb-0 pb-36">
      <div className="flex">
        <UserSidebar />
        <div className="w-full  overflow-auto text-white">{children}</div>
      </div>
    </div>
  );
};

export default UserLayout;
