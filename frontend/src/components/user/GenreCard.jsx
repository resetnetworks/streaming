import React from "react";
import { useNavigate } from "react-router-dom";

const GenreCard = ({ cards = [] }) => {
  const navigate = useNavigate();
  const [first, ...rest] = cards;

  const handleClick = (title, image) => {
    if (!title) return;
    // Pass both title and image so Genre page can render exact header art
    navigate(`/genre/${encodeURIComponent(title)}`, { state: { title, image } });
  };

  return (
    <div className="flex flex-shrink-0 gap-4">
      {/* Left Large Image */}
      {first && (
        <div
          onClick={() => handleClick(first.title, first.image)}
          className="sm:h-72 h-60 w-52 sm:w-56 cursor-pointer rounded-xl overflow-hidden shadow-lg relative"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && handleClick(first.title, first.image)}
          aria-label={`Open genre ${first.title}`}
        >
          <div className="relative h-full">
            <img
              src={first.image}
              alt={first.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#10153e8f] to-[#0E43CA]" />
            <p className="absolute text-nowrap bottom-2 left-1/2 transform -translate-x-1/2 text-white font-semibold text-sm">
              {first.title}
            </p>
          </div>
        </div>
      )}

      {/* Right Two Small Images in Column */}
      <div className="flex flex-col gap-4">
        {rest.map((card, index) => (
          <div
            key={`${card.title}-${index}`}
            onClick={() => handleClick(card.title, card.image)}
            className="sm:h-[136px] h-28 w-64 sm:w-72 cursor-pointer rounded-xl overflow-hidden shadow-lg relative"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && handleClick(card.title, card.image)}
            aria-label={`Open genre ${card.title}`}
          >
            <div className="relative h-full">
              <img
                src={card.image}
                alt={card.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#10153e8f] to-[#0E43CA]" />
              <p className="absolute text-nowrap bottom-2 left-1/2 transform -translate-x-1/2 text-white font-semibold text-sm">
                {card.title}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GenreCard;
