import React from "react";

const GenreCard = ({ cards }) => {
  const [first, ...rest] = cards;

  return (
    <div className="flex flex-shrink-0 gap-4">
      {/* Left Large Image */}
      {first && (
        <div className="h-72 w-56 cursor-pointer rounded-xl overflow-hidden shadow-lg relative">
          <div className="relative h-full">
            <img
              src={first.image}
              alt={first.title}
              className="w-full h-full object-cover"
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
            key={index}
            className="h-[136px] w-72 cursor-pointer rounded-xl overflow-hidden shadow-lg relative"
          >
            <div className="relative h-full">
              <img
                src={card.image}
                alt={card.title}
                className="w-full h-full object-cover"
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
