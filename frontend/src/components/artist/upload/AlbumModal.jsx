// AlbumModal.jsx - ✅ SEPARATE MODAL COMPONENT WITH REAL SONGS
import React, { useEffect } from "react";
import { FiX } from "react-icons/fi";
import { useAlbum } from "../../../hooks/api/useAlbums";


const AlbumModal = ({ isOpen, onClose, album }) => {
  const { data: albumDetails, isLoading } = useAlbum(album?.id, {
  enabled: isOpen && !!album?.id,
});



  if (!isOpen || !album) return null;

  const songs = albumDetails?.songs || [];
  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#020617] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-scaleIn">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-purple-500/30 to-blue-500/30">
              {album.image ? (
                <img 
                  src={album.image} 
                  alt={album.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-500/50 to-blue-500/50 flex items-center justify-center text-white text-sm font-bold">
                  {album.title?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white lowercase">{album.title}</h2>
              <p className="text-white/60 text-sm">
  {isLoading ? "Loading..." : `${songs.length} songs`}
</p>

            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors group"
          >
            <FiX className="w-5 h-5 text-white/60 group-hover:text-white" />
          </button>
        </div>

        {/* Songs List */}
        <div className="p-6 max-h-[500px] overflow-y-auto">
          {songs.length === 0 ? (
            <div className="text-center text-white/40 py-8">
              No songs in this album
            </div>
          ) : (
            <div className="space-y-3">
              {songs.map((song, index) => (
                <div
                  key={song._id}
                  className="group flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 hover:border-white/20 border border-transparent transition-all duration-300"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center text-xs font-bold text-blue-300">
                      <img src={album.image || ""} alt={song.title} className="w-full h-full object-cover rounded-lg" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium lowercase text-sm group-hover:text-blue-300 transition-colors truncate">
                        {song.title}
                      </p>
                      <span className="text-xs text-white/50">{formatDuration(song.duration)}</span>
                    </div>
                  </div>
                  
                  {/* ✅ ACCESS TYPE REMOVED - Only show duration */}
                  <span className="text-white/50 text-sm font-medium">
                    {formatDuration(song.duration)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlbumModal;