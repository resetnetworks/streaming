import React from "react";
import { getGradient } from "../../utills/avatarGenerator";

const Avatar = ({ name = "Artist", className = "" }) => {
  const gradient = getGradient(name);

  return (
    <div
      className={`relative w-full h-full ${className}`}
      style={{
        background: gradient,
      }}
    >
      {/* overlay */}
      <div className="absolute inset-0 opacity-30 mix-blend-overlay bg-[radial-gradient(circle_at_30%_30%,white,transparent)]" />

      {/* shine */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20" />
    </div>
  );
};

export default Avatar;