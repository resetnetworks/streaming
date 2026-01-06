import React from "react";
import { Link } from "react-router-dom";

const ListItem = ({ItemName="top songs"}) => {
  const songs = [
    { rank: 1, title: "Not Today", plays: "3.1K", image: "/images/genre3.jpg" },
    { rank: 2, title: "Spring Day", plays: "2.8K", image: "/images/genre4.jpg" },
    { rank: 3, title: "Runer", plays: "2.1K", image: "/images/genre5.jpg" },
    { rank: 4, title: "My Universe", plays: "1.9K", image: "/images/genre6.jpg" },
    { rank: 5, title: "Euphoria", plays: "1.6K", image: "/images/genre7.jpg" },
    { rank: 6, title: "Not Today", plays: "1.2K", image: "/images/genre8.jpg" },
  ];

  return (
    <div className="md:w-[500px] w-[350px] flex-shrink-0 bg-transparent pt-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-white text-xl font-semibold mb-4">{ItemName}</h2>
        <Link to="/" className="text-blue-600 text-sm hover:underline">show all</Link>
      </div>
      
      {/* Songs List with Gradient Border */}
      <div className="space-y-2 rounded-[12px] p-[1px] bg-gradient-to-br from-white to-[#0c0d0d]">
        <div className="space-y-2 border border-transparent px-4 py-0 rounded-[10px] bg-gradient-to-br from-[#1e293b] to-[#0f172a]">
          {songs.map((song) => (
            <div 
              key={song.rank}
              className="flex items-center justify-between text-white py-3 border-b border-gray-600 last:border-none"
            >
              {/* Left side - Rank, Image and Title */}
              <div className="flex items-center gap-4">
                <span className="text-gray-400 w-6 text-sm">{song.rank}</span>
                {/* Song Image */}
                <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-700 flex-shrink-0">
                  <img 
                    src={song.image} 
                    alt={song.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  {/* Fallback if image doesn't load */}
                  <div 
                    className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 items-center justify-center text-white text-xs font-bold hidden"
                  >
                    {song.title.charAt(0)}
                  </div>
                </div>
                <span className="text-white">{song.title}</span>
              </div>
              
              {/* Right side - Plays */}
              <span className="text-gray-400 text-sm">{song.plays}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ListItem;