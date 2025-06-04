import { User } from "../models/User.js";
import TryCatch from "../utils/TryCatch.js";
import { hasAccessToSong } from "../utils/accessControl.js";
import {Song} from "../models/Song.js";

// GEt all playlists for the authenticated user
export const getPlaylists = TryCatch(async (req, res) => {
  const user = await User.findById(req.user._id).select("playlist");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Deep clone and populate songs for each playlist
  const playlistsWithPopulatedSongs = await Promise.all(
    user.playlist.map(async (playlist) => {
      const populatedSongs = await Song.find({ _id: { $in: playlist.songs } })
        .populate("artist", "name")
        .populate("album", "title");

      const songsWithAccessControl = await Promise.all(
        populatedSongs.map(async (song) => {
          const songData = song.toObject();
          const hasAccess = await hasAccessToSong(req.user, song);
          if (!hasAccess) {
            songData.audioUrl = null;
          }
          return songData;
        })
      );

      return {
        _id: playlist._id,
        title: playlist.title,
        description: playlist.description,
        songs: songsWithAccessControl,
      };
    })
  );

  res.json({ success: true, playlist: playlistsWithPopulatedSongs });
});


// Create a new playlist for the authenticated user
export const createPlaylist = TryCatch(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.playlist.length >= 10) {
    return res.status(400).json({ message: "You can only create up to 10 playlists" });
  }

  const { title, description = "" } = req.body;
  if (!title) {
    return res.status(400).json({ message: "Playlist title is required" });
  }

  // No image upload here, so image is always empty string
  user.playlist.push({ title, description, image: "" });
  await user.save();

  res.status(201).json({ success: true, message: "Playlist created", playlist: user.playlist });
});

// Update an existing playlist
export const updatePlaylist = TryCatch(async (req, res) => {
  const { playlistId } = req.params;
  const { title, description } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const playlist = user.playlist.id(playlistId);
  if (!playlist) {
    return res.status(404).json({ message: "Playlist not found" });
  }
  if (title) {
    playlist.title = title;
  }
  if (description) {
    playlist.description = description;
  }
  await user.save();
  res.json({ success: true, message: "Playlist updated", playlist });
});

// Delete a playlist by ID for the authenticated user
export const deletePlaylist = TryCatch(async (req, res) => {
  const { playlistId } = req.params;

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const playlistExists = user.playlist.some(item => item._id.toString() === playlistId);
  if (!playlistExists) {
    return res.status(404).json({ message: "Playlist not found" });
  }

  user.playlist = user.playlist.filter(item => item._id.toString() !== playlistId);
  await user.save();

  res.json({ success: true, message: "Playlist deleted" });
});

// get a specific playlist by ID for the authenticated user
export const getPlaylistById = TryCatch(async (req, res) => {
  const { playlistId } = req.params;

  const user = await User.findById(req.user._id).select("playlist");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const playlist = user.playlist.id(playlistId);
  if (!playlist) {
    return res.status(404).json({ message: "Playlist not found" });
  }

  // Populate songs with access control
  const populatedSongs = await Song.find({ _id: { $in: playlist.songs } })
    .populate("artist", "name")
    .populate("album", "title");

  const songsWithAccessControl = await Promise.all(
    populatedSongs.map(async (song) => {
      const songData = song.toObject();
      const hasAccess = await hasAccessToSong(req.user, song);
      if (!hasAccess) {
        songData.audioUrl = null;
      }
      return songData;
    })
  );

  res.json({
    success: true,
    playlist: {
      _id: playlist._id,
      title: playlist.title,
      description: playlist.description,
      songs: songsWithAccessControl,
    },
  });
});

// Add a song to a playlist for the authenticated user
export const addSongToPlaylist = TryCatch(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const { playlistId } = req.params;
  const { songId } = req.body;

  if (!songId) {
    return res.status(400).json({ message: "Song ID is required" });
  }

  // Find the playlist by ID
  const playlist = user.playlist.id(playlistId);

  if (!playlist) {
    return res.status(404).json({ message: "Playlist not found" });
  }

  // Check if song already exists in playlist
  if (playlist.songs.includes(songId)) {
    return res.status(400).json({ message: "Song already exists in playlist" });
  }

  // Add song
  playlist.songs.push(songId);
  await user.save();

  res.json({ success: true, message: "Song added to playlist", playlist });
});

// Remove a song from a playlist for the authenticated user
export const removeSongFromPlaylist = TryCatch(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const { playlistId, songId } = req.params;

  const playlist = user.playlist.id(playlistId);
  if (!playlist) {
    return res.status(404).json({ message: "Playlist not found" });
  }

  playlist.songs = playlist.songs.filter(
    id => id.toString() !== songId
  );

  await user.save();

  res.json({ success: true, message: "Song removed from playlist", playlist });
});
