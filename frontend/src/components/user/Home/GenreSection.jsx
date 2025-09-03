import React, { useRef } from "react";
import { LuSquareChevronRight, LuSquareChevronLeft } from "react-icons/lu";
import GenreCard from "../GenreCard";

// Example data; replace with dynamic list from CMS/db if needed
const genreDecks = [
  {
    cards: [
      { title: "electronic", image: "/images/genre1.jpg" },
      { title: "ambient", image: "/images/genre2.jpg" },
      { title: "idm", image: "/images/genre3.jpg" },
    ],
  },
  {
    cards: [
      { title: "experimental", image: "/images/genre4.jpg" },
      { title: "avant garde", image: "/images/genre5.jpg" },
      { title: "noise", image: "/images/genre6.jpg" },
    ],
  },
  {
    cards: [
      { title: "downtempo", image: "/images/genre7.jpg" },
      { title: "soundtrack", image: "/images/genre8.jpg" },
      { title: "industrial", image: "/images/genre9.jpg" },
    ],
  },
  {
    cards: [
        { title: "ebm", image: "/images/genre10.jpg" },
        { title: "electro", image: "/images/genre12.jpg" },
      { title: "techno", image: "/images/genre11.jpg" },
    ],
  },
  {
    cards: [
      { title: "dance", image: "/images/genre13.jpg" },
      { title: "electronica", image: "/images/genre14.jpg" },
      { title: "sound art", image: "/images/genre15.jpg" },
    ],
  },
  {
    cards: [
      { title: "jazz", image: "/images/genre16.jpg" },
      { title: "classical", image: "/images/genre17.jpg" },
      { title: "classical crossover", image: "/images/genre18.jpg" },
    ],
  },
  {
    cards: [
      { title: "soundscapes", image: "/images/genre19.jpg" },
      { title: "field recordings", image: "/images/genre20.jpg" },
      { title: "noise", image: "/images/genre6.jpg" },
    ],
  },
];

const GenreSection = () => {
  const scrollRef = useRef(null);

  const handleScroll = (direction = "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 200;
    scrollRef.current.scrollBy({
      left: direction === "right" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className="w-full py-0">
      {/* Header with Back and Next */}
      <div className="w-full flex justify-between items-center mb-4">
        <h2 className="md:text-xl text-lg font-semibold text-white">Explore by Genre</h2>

        <div className="hidden md:flex items-center gap-2">
          <button
            type="button"
            className="text-white cursor-pointer text-lg hover:text-blue-400 transition-colors"
            onClick={() => handleScroll("left")}
            aria-label="Scroll left"
            title="Back"
          >
            <LuSquareChevronLeft />
          </button>
          <button
            type="button"
            className="text-white cursor-pointer text-lg hover:text-blue-400 transition-colors"
            onClick={() => handleScroll("right")}
            aria-label="Scroll right"
            title="Next"
          >
            <LuSquareChevronRight />
          </button>
        </div>
      </div>

      {/* Row */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto no-scrollbar pb-2"
        style={{ scrollSnapType: "x proximity" }}
      >
        {genreDecks.map((deck, idx) => (
          <div key={`genre-deck-${idx}`} style={{ scrollSnapAlign: "start" }}>
            <GenreCard cards={deck.cards} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default GenreSection;
