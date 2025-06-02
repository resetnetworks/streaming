import React from "react";
import { RiPlayFill } from "react-icons/ri";

const RecentPlays = ({
  title,
  singer,
  image,
  price = 60,
  onPlay,
  isSelected,
}) => {
  return (
    <div
      className="w-28 md:w-48 flex-shrink-0 cursor-pointer group p-2"
      onClick={onPlay}
    >
      <div
        className={`relative md:w-48 md:h-48 h-28 w-28 rounded-lg overflow-hidden 
          ${
            isSelected
              ? "border-2 border-blue-500 shadow-[0_0_8px_1px_#3b82f6]"
              : ""
          }`}
      >
        <img src={image} alt={title} className="w-full h-full object-cover" />

        <div className="absolute inset-0 group-hover:bg-black group-hover:bg-opacity-20 transition">
          <button className="absolute bottom-2 left-2 bg-gray-200 text-black p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition hover:scale-110">
            <RiPlayFill size={14} />
          </button>
        </div>
      </div>

      <div className="flex justify-between sm:items-center mt-2 sm:flex-row flex-col">
        <div className="leading-none">
          <p className="md:text-base text-sm font-medium">{title}</p>
          <span className="text-blue-500 text-xs">{singer}</span>
        </div>
        {price && (
          <p className="text-blue-500 text-xs font-semibold">${price}</p>
        )}
      </div>
    </div>
  );
};

export default RecentPlays;
