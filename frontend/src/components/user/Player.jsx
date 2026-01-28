// components/player/Player.jsx
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { usePlayer } from "../../hooks/usePlayer";
import PlayerUI from "./player/PlayerUI";

const Player = () => {
  const streamError = useSelector((state) => state.stream.error);
  const selectedSong = useSelector((state) => state.player.selectedSong);
  
  const player = usePlayer();

  // Handle stream errors
  useEffect(() => {
    if (
      streamError &&
      selectedSong &&
      streamError.songId === selectedSong._id
    ) {
      const toastId = `stream-error-${selectedSong._id}`;
      toast.warning(streamError.message, {
        id: toastId,
        duration: 1000,
      });
    }
  }, [streamError?.songId]);

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
      <PlayerUI {...player} />
    </>
  );
};

export default Player;