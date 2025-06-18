import { User } from "../models/User.js";
import { hasAccessToSong } from "../utils/accessControl.js";
import {Song} from "../models/Song.js";
import { BadRequestError, NotFoundError } from "../errors/index.js";
import mongoose from "mongoose";
import { StatusCodes } from 'http-status-codes';


// @desc    Get all playlists for the authenticated user
// @route   GET /api/playlists
// @access  Private
export const getPlaylists = async (req, res) => {
  const user = await User.findById(req.user._id).select('playlist');
  if (!user) {
    throw new NotFoundError('User not found');
  }

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const totalPlaylists = user.playlist.length;
  const slicedPlaylists = user.playlist.slice(skip, skip + limit);

  const playlists = await Promise.all(
    slicedPlaylists.map(async (playlist) => {
      const songs = await Song.find({ _id: { $in: playlist.songs } })
        .populate('artist', 'name')
        .populate('album', 'title');

      const filteredSongs = await Promise.all(
        songs.map(async (song) => {
          const songObj = song.toObject();
          const hasAccess = await hasAccessToSong(req.user, song);
          if (!hasAccess) {
            songObj.audioUrl = null;
          }
          return songObj;
        })
      );

      return {
        _id: playlist._id,
        title: playlist.title,
        description: playlist.description,
        songs: filteredSongs,
      };
    })
  );

  res.status(StatusCodes.OK).json({
    success: true,
    playlist: playlists,
    pagination: {
      total: totalPlaylists,
      page,
      limit,
      totalPages: Math.ceil(totalPlaylists / limit),
    },
  });
};


// @desc    Create a new playlist for the authenticated user
// @route   POST /api/playlists
// @access  Private
export const createPlaylist = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Enforce a limit of 10 playlists per user
  if (user.playlist.length >= 10) {
    throw new BadRequestError('You can only create up to 10 playlists');
  }

  const { title, description = '' } = req.body;

  // Basic validation
  if (!title || typeof title !== 'string' || title.trim().length < 1) {
    throw new BadRequestError('Playlist title is required');
  }

  // Add playlist to user
  user.playlist.push({
    title: title.trim(),
    description: description.trim(),
    image: '', // Image upload not implemented here
    songs: [],
  });

  await user.save();

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Playlist created successfully',
    playlist: user.playlist,
  });
};



// ===================================================================
// @desc    Update a playlist (title/description) for the authenticated user
// @route   PATCH /api/playlists/:playlistId
// @access  Private
// ===================================================================
export const updatePlaylist = async (req, res) => {
  const { playlistId } = req.params;
  const { title, description } = req.body;

  // Validate user
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  // Find playlist by ID within user's playlists
  const playlist = user.playlist.id(playlistId);
  if (!playlist) {
    throw new NotFoundError("Playlist not found");
  }

  // Update fields only if provided
  if (title && typeof title === "string") {
    playlist.title = title.trim();
  }
  if (description && typeof description === "string") {
    playlist.description = description.trim();
  }

  // Save updated user document
  await user.save();

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Playlist updated successfully",
    playlist,
  });
};



// ===================================================================
// @desc    Delete a playlist by ID for the authenticated user
// @route   DELETE /api/playlists/:playlistId
// @access  Private
// ===================================================================
export const deletePlaylist = async (req, res) => {
  const { playlistId } = req.params;

  // Fetch user
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  // Locate the playlist by ID
  const playlist = user.playlist.id(playlistId);
  if (!playlist) {
    throw new NotFoundError("Playlist not found");
  }

  // Remove the playlist from user's subdocument array
  playlist.deleteOne(); // Mongoose method on subdocument
  await user.save();

  // Respond with success
  res.status(StatusCodes.Ok).json({
    success: true,
    message: "Playlist deleted successfully",
  });
};



// ===================================================================
// @desc    Get a specific playlist by ID for the authenticated user
// @route   GET /api/playlists/:playlistId
// @access  Private
// ===================================================================
export const getPlaylistById = async (req, res) => {
  const { playlistId } = req.params;

  // Fetch user with playlist field only
  const user = await User.findById(req.user._id).select("playlist");
  if (!user) {
    throw new NotFoundError("User not found");
  }

  // Locate playlist by ID
  const playlist = user.playlist.id(playlistId);
  if (!playlist) {
    throw new NotFoundError("Playlist not found");
  }

  // Populate songs
  const populatedSongs = await Song.find({ _id: { $in: playlist.songs } })
    .populate("artist", "name")
    .populate("album", "title");

  // Access control: Hide audio URL if user is unauthorized
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

  // Send response
  res.status(StatusCodes.OK).json({
    success: true,
    playlist: {
      _id: playlist._id,
      title: playlist.title,
      description: playlist.description,
      songs: songsWithAccessControl,
    },
  });
};


/**
 * @desc    Add a song to a user's playlist
 * @route   POST /api/playlists/:playlistId/songs
 * @access  Private (authenticated users only)
 */
export const addSongToPlaylist = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  const { playlistId } = req.params;
  const { songId } = req.body;

  if (!songId) {
    throw new BadRequestError("Song ID is required");
  }

  const playlist = user.playlist.id(playlistId);
  if (!playlist) {
    throw new NotFoundError("Playlist not found");
  }

  if (playlist.songs.includes(songId)) {
    throw new BadRequestError("Song already exists in playlist");
  }

  playlist.songs.push(songId);
  await user.save();

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Song added to playlist",
    playlist,
  });
};


/**
 * @desc    Remove a song from a user's playlist
 * @route   DELETE /api/playlists/:playlistId/songs/:songId
 * @access  Private (authenticated users only)
 */
export const removeSongFromPlaylist = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  const { playlistId, songId } = req.params;

  const playlist = user.playlist.id(playlistId);
  if (!playlist) {
    throw new NotFoundError("Playlist not found");
  }

  const originalLength = playlist.songs.length;
  playlist.songs = playlist.songs.filter(
    id => id.toString() !== songId
  );

  if (playlist.songs.length === originalLength) {
    throw new NotFoundError("Song not found in playlist");
  }

  await user.save();

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Song removed from playlist",
    playlist,
  });
};