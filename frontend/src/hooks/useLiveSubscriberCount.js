// src/hooks/useLiveSubscriberCount.js
import { useState, useEffect } from "react";

export const useLiveSubscriberCount = (initialCount, isInView, artistId) => {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentArtistId, setCurrentArtistId] = useState(null);

  // Reset count when artist changes
  useEffect(() => {
    if (artistId !== currentArtistId) {
      setCount(initialCount || 0);
      setHasStarted(false);
      setCurrentArtistId(artistId);
    }
  }, [artistId, currentArtistId, initialCount]);

  // Update count when initialCount changes for the same artist
  useEffect(() => {
    if (artistId === currentArtistId && initialCount !== undefined) {
      setCount(initialCount);
    }
  }, [initialCount, artistId, currentArtistId]);

  useEffect(() => {
    if (isInView && !hasStarted && initialCount > 0 && artistId === currentArtistId) {
      setHasStarted(true);
      
      // Start live increments after initial load
      const liveInterval = setInterval(() => {
        setCount(prev => prev + Math.floor(Math.random() * 3) + 1); // Random increment 1-3
      }, 3000); // Every 3 seconds

      return () => clearInterval(liveInterval);
    }
  }, [isInView, hasStarted, initialCount, artistId, currentArtistId]);

  return count;
};
