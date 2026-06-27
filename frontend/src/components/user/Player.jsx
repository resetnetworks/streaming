// components/player/Player.jsx
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { usePlayer } from "../../hooks/usePlayer";
import PlayerUI from "./player/PlayerUI";

const Player = () => {
  const player = usePlayer();
  const { streamError, selectedSong } = player;
  
  // Handle stream errors
  useEffect(() => {
    if (
      streamError &&
      selectedSong
    ) {
      const errorMessage = streamError.response?.data?.message || streamError.message || "Failed to load audio stream";
      const toastId = `stream-error-${selectedSong._id}`;
      toast.warning(errorMessage, {
        id: toastId,
        duration: 1000,
      });
    }
  }, [streamError, selectedSong]);

  // Hidden video element for HLS
  return (
    <>
      <video
        ref={player.videoRef}
        style={{ display: "none" }}
        muted={player.isMuted}
        preload="auto"
        playsInline
        crossOrigin="anonymous"
      />
      <PlayerUI {...player} 
      // isPreview={streamData?.isPreview}
      />
    </>
  );
};

export default Player;