// hooks/usePlaybackControl.js
import { useDispatch, useSelector } from "react-redux";

export const usePlaybackControl = () => {
  const isPlaying = useSelector((state) => state.player.isPlaying);
  const selectedSong = useSelector((state) => state.player.selectedSong);

  const togglePlayback = () => {
    window.dispatchEvent(new CustomEvent("toggle-playback"));
  };

  const pausePlayback = () => {
    window.dispatchEvent(new CustomEvent("toggle-playback", { detail: { action: "pause" } }));
  };

  const resumePlayback = () => {
    window.dispatchEvent(new CustomEvent("toggle-playback", { detail: { action: "play" } }));
  };

  const isSongPlaying = (songId) => {
    return selectedSong?._id === songId && isPlaying;
  };

  const isSongSelected = (songId) => {
    return selectedSong?._id === songId;
  };

  return {
    isPlaying,
    selectedSong,
    togglePlayback,
    pausePlayback,
    resumePlayback,
    isSongPlaying,
    isSongSelected,
  };
};