// controllers/streamController.js

import { Song } from "../models/Song.js";
import { getSignedUrl } from "../utils/s3.js";
import { canStreamSong } from "../helpers/accessControl.js";
import { UnauthorizedError, NotFoundError } from "../errors/index.js";
import { Album } from "../models/Album.js";
import { canStreamAlbum } from "../helpers/accessControl.js";


export const streamSong = async (req, res) => {
  const { id: songId } = req.params;
  const userId = req.user._id;

  const allowed = await canStreamSong(userId, songId);
  if (!allowed) throw new UnauthorizedError("You do not have access to stream this song.");

  const song = await Song.findById(songId);
  if (!song) throw new NotFoundError("Song not found");

  const signedUrl = await getSignedUrl(song.audioKey); // audioKey = S3 key
  res.json({ url: signedUrl });
};


// controllers/streamController.js


export const streamAlbum = async (req, res) => {
  const { id: albumId } = req.params;
  const userId = req.user._id;

  const allowed = await canStreamAlbum(userId, albumId);
  if (!allowed) throw new UnauthorizedError("You do not have access to stream this album.");

  const album = await Album.findById(albumId).populate("songs");
  if (!album) throw new NotFoundError("Album not found");

  // Generate signed URLs for each song in album
  const urls = await Promise.all(
    album.songs.map((song) => getSignedUrl(song.audioKey))
  );

  res.json({ urls });
};
