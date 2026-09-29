import React, { useRef, useLayoutEffect, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import UserSidebar from "./UserSidebar";
import Footer from "./Footer";

const UserLayout = () => {
  const scrollRef = useRef(null);
  const { pathname, search } = useLocation();

  useLayoutEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [pathname, search]);

  useEffect(() => {
    const timers = [0, 50, 150, 300].map((delay) =>
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = 0;
        }
      }, delay)
    );
    return () => timers.forEach(clearTimeout);
  }, [pathname, search]);

  return (
    <div className="flex flex-col md:flex-row md:h-screen md:overflow-hidden">
      {/* Sidebar desktop par sticky, mobile par hidden (UserSidebar khud handle karta hai) */}
      <UserSidebar />

      {/* Main content + Footer */}
      <div
        ref={scrollRef}
        id="main-scroll-container"
        className="flex-1 flex flex-col no-scrollbar md:overflow-y-auto"
      >
        <div className="flex-1">
          <Outlet />
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default UserLayout;