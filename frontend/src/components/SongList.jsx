import React from "react";
import { MdAccessTimeFilled } from "react-icons/md";
import { BsHeart, BsHeartFill } from "react-icons/bs";
import { FiMoreHorizontal } from "react-icons/fi";

const SongList = ({
  img,
  songName,
  singerName,
  seekTime,
  isSelected,
  onPlay,
}) => {
  const handleClick = (e) => {
    // Prevent triggering play when clicking on heart or more options
    if (!e.target.closest(".action-button")) {
      onPlay();
    }
  };

  return (
    <div
      className={`flex w-full justify-between p-2 cursor-pointer ${
        isSelected ? "border-b border-blue-500" : "border-b border-gray-600"
      }`}
      onClick={handleClick}
    >
      <div className="flex items-center">
        <img
          src={img}
          alt=""
          className={`w-10 h-10 rounded-lg object-cover ${
            isSelected ? "shadow-[0_0_5px_1px_#3b82f6]" : ""
          }`}
        />
        <div className="ml-4">
          <h3 className="text-white text-lg leading-none">{songName}</h3>
          <p className="text-gray-400 text-xs font-light mt-1">{singerName}</p>
        </div>
      </div>

      {isSelected ? (
        <div className="equalizer">
          <span className="equalizer-bar"></span>
          <span className="equalizer-bar"></span>
          <span className="equalizer-bar"></span>
          <span className="equalizer-bar"></span>
        </div>
      ) : (
        <div> </div>
      )}

      <div className="flex gap-6 items-center">
        <div className="flex items-center">
          <MdAccessTimeFilled
            className={`text-base 
            ${isSelected ? "text-blue-700" : "text-gray-500"}
            `}
          />
          <span className="ml-2">{seekTime}</span>
        </div>
        <BsHeart className="action-button text-white text-sm hover:cursor-pointer hover:text-red-700" />
        <FiMoreHorizontal className="action-button text-white text-lg hover:cursor-pointer" />
      </div>
    </div>
  );
};

export default SongList;
