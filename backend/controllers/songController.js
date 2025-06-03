import { Song } from "../models/Song.js";
import { uploadToS3 } from "../utils/s3Uploader.js";
import { Album } from "../models/Album.js";
import { Artist } from "../models/Artist.js";
import { Transaction } from "../models/Transaction.js"
import { User } from "../models/User.js";
import { hasAccessToSong } from "../utils/accessControl.js";



const isAdmin = (user) => user?.role === "admin";

// Song Controller
export const createSong = async (req, res) => {
  
  if (!isAdmin(req.user)) {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }

  try {
    let {
      title,
      artist,
      genre,
      duration,
      price,
      isPremium,
      includeInSubscription,
      releaseDate,
      album,
    } = req.body;

    if (typeof genre === "string") {
      genre = genre.split(",").map((g) => g.trim());
    }

    const coverImageFile = req.files?.coverImage?.[0];
    const audioFile = req.files?.audio?.[0];

    if (!audioFile) {
      return res.status(400).json({ message: "Audio file is required" });
    }

    const audioUrl = await uploadToS3(audioFile, "songs");
    const coverImageUrl = coverImageFile ? await uploadToS3(coverImageFile, "covers") : "";

    const newSong = await Song.create({
      title,
      artist,
      album: album || null,
      genre,
      duration,
      price,
      isPremium,
      includeInSubscription: includeInSubscription ?? true,
      releaseDate,
      coverImage: coverImageUrl,
      audioUrl,
    });

    // 👉 If song is part of an album, push to album.songs[]
    if (album) {
      await Album.findByIdAndUpdate(album, {
        $push: { songs: newSong._id },
      });
    }

    res.status(201).json({ success: true, song: newSong });
  } catch (error) {
    console.error("Create Song Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateSong = async (req, res) => {

  if (!isAdmin(req.user)) {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }

  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ message: "Song not found" });

    let {
      title,
      artist,
      genre,
      duration,
      price,
      isPremium,
      includeInSubscription,
      releaseDate,
      album,
    } = req.body;

    if (typeof genre === "string") {
      genre = genre.split(",").map((g) => g.trim());
    }

    if (req.files?.coverImage?.[0]) {
      song.coverImage = await uploadToS3(req.files.coverImage[0], "covers");
    }

    if (req.files?.audio?.[0]) {
      song.audioUrl = await uploadToS3(req.files.audio[0], "songs");
    }

    const oldAlbumId = song.album?.toString();
    const newAlbumId = album || null;

    Object.assign(song, {
      title,
      artist,
      genre,
      duration,
      price,
      isPremium,
      includeInSubscription: includeInSubscription ?? song.includeInSubscription,
      releaseDate,
      album: newAlbumId,
    });

    await song.save();

    // 👉 Update album relations if changed
    if (oldAlbumId && oldAlbumId !== newAlbumId) {
      await Album.findByIdAndUpdate(oldAlbumId, {
        $pull: { songs: song._id },
      });
    }

    if (newAlbumId && oldAlbumId !== newAlbumId) {
      await Album.findByIdAndUpdate(newAlbumId, {
        $addToSet: { songs: song._id }, // use addToSet to avoid duplicates
      });
    }

    res.status(200).json({ success: true, song });
  } catch (error) {
    console.error("Update Song Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteSong = async (req, res) => {

  if (!isAdmin(req.user)) {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }

  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ message: "Song not found" });

    // 👉 If song belongs to an album, remove its reference from that album
    if (song.album) {
      await Album.findByIdAndUpdate(song.album, {
        $pull: { songs: song._id },
      });
    }

    await song.deleteOne(); // actually delete the song

    res.status(200).json({ success: true, message: "Song deleted successfully" });
  } catch (error) {
    console.error("Delete Song Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllSongs = async (req, res) => {
  try {
    const user = req.user;

    const songs = await Song.find()
      .sort({ createdAt: -1 })
      .populate("artist", "name")
      .populate("album", "title");

    const updatedSongs = await Promise.all(
      songs.map(async (song) => {
        const hasAccess = await hasAccessToSong(user, song);
        const songData = song.toObject();

        if (!hasAccess) {
          songData.audioUrl = null;
        }

        return songData;
      })
    );

    res.status(200).json({ success: true, songs: updatedSongs });
  } catch (error) {
    console.error("Get All Songs Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getSongById = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id)
      .populate("artist", "name image")
      .populate("album", "title coverImage");

    if (!song) return res.status(404).json({ message: "Song not found" });

    const hasAccess = await hasAccessToSong(req.user, song);
    const songData = song.toObject();

    if (!hasAccess) {
      songData.audioUrl = null;
    }

    res.status(200).json({ success: true, song: songData });
  } catch (error) {
    console.error("Get Song By ID Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const getSongsMatchingUserGenres = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: "purchasedSongs",
        select: "genre _id",
      });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Step 1: Merge purchasedGenres and preferredGenres
    const genreSet = new Set();

    // From purchased songs
    user.purchasedSongs.forEach((song) => {
      const genres = Array.isArray(song.genre)
        ? song.genre
        : typeof song.genre === "string"
        ? [song.genre]
        : [];

      genres.forEach((g) => {
        if (g) genreSet.add(g.trim().toLowerCase());
      });
    });

    // From preferredGenres
    if (Array.isArray(user.preferredGenres)) {
      user.preferredGenres.forEach((g) => {
        if (g) genreSet.add(g.trim().toLowerCase());
      });
    }

    const genreArray = [...genreSet];
    if (genreArray.length === 0) {
      return res.status(200).json({
        success: true,
        matchingGenres: [],
        songs: [],
      });
    }

    // Step 2: Fetch all songs that match those genres
    const allGenreSongs = await Song.find({
      genre: { $in: genreArray },
    })
      .populate("artist", "name image")
      .populate("album", "title coverImage")
      .sort({ createdAt: -1 });

    // Step 3: Apply access control logic
    const updatedSongs = await Promise.all(
      allGenreSongs.map(async (song) => {
        const songData = song.toObject();
        const hasAccess = await hasAccessToSong(user, song);
        if (!hasAccess) {
          songData.audioUrl = null;
        }
        return songData;
      })
    );

    return res.status(200).json({
      success: true,
      matchingGenres: genreArray,
      songs: updatedSongs,
    });
  } catch (err) {
    console.error("getSongsMatchingUserGenres Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};






// Album Controllers
export const createAlbum = async (req, res) => {
  if (!isAdmin(req.user)) {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }

  try {
    const { title, description, artist, releaseDate, price, isPremium } = req.body;

    const coverImageFile = req.files?.coverImage?.[0];
    const coverImageUrl = coverImageFile ? await uploadToS3(coverImageFile, "covers") : "";

    const newAlbum = await Album.create({
      title,
      description,
      artist,
      releaseDate,
      price,
      isPremium,
      coverImage: coverImageUrl,
    });
    
     if (typeof genre === "string") {
      genre = genre.split(",").map((g) => g.trim());
    }

    res.status(201).json({ success: true, album: newAlbum });
  } catch (error) {
    console.error("Create Album Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAlbums = async (req, res) => {
  try {
    const albums = await Album.find()
      .sort({ createdAt: -1 })
      .populate("songs", "title duration coverImage"); // include basic song info

    res.status(200).json({ success: true, albums });
  } catch (error) {
    console.error("Get Albums Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteAlbum = async (req, res) => {
  if (!isAdmin(req.user)) {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }

  try {
    const album = await Album.findById(req.params.id);
    if (!album) return res.status(404).json({ message: "Album not found" });

    // Optional: Remove album reference from its songs
    await Song.updateMany(
      { _id: { $in: album.songs } },
      { $unset: { album: "" } }
    );

    await album.deleteOne();

    res.status(200).json({ success: true, message: "Album deleted successfully" });
  } catch (error) {
    console.error("Delete Album Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// Artist Controller 
export const createArtist = async (req, res) => {
  if (!isAdmin(req.user)) {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }

  try {
    const { name, bio,subscriptionPrice } = req.body;
    const imageFile = req.files?.image?.[0];
    const imageUrl = imageFile ? await uploadToS3(imageFile, "artists") : "";

    const newArtist = await Artist.create({
      name,
      bio,
      subscriptionPrice,
      image: imageUrl,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, artist: newArtist });
  } catch (error) {
    console.error("Create Artist Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateArtist = async (req, res) => {
  if (!isAdmin(req.user)) {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }

  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist) return res.status(404).json({ message: "Artist not found" });

    const { name, bio,subscriptionPrice } = req.body;

    if (name) artist.name = name;
    if (bio) artist.bio = bio;
    if (subscriptionPrice) artist.subscriptionPrice = subscriptionPrice;

    const imageFile = req.files?.image?.[0];
    if (imageFile) {
      artist.image = await uploadToS3(imageFile, "artists");
    }

    await artist.save();

    res.status(200).json({ success: true, artist });
  } catch (error) {
    console.error("Update Artist Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteArtist = async (req, res) => {
  if (!isAdmin(req.user)) {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }

  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist) return res.status(404).json({ message: "Artist not found" });

    await artist.deleteOne();

    res.status(200).json({ success: true, message: "Artist deleted successfully" });
  } catch (error) {
    console.error("Delete Artist Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllArtists = async (req, res) => {
  try {
    const artists = await Artist.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, artists });
  } catch (error) {
    console.error("Get All Artists Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getArtistById = async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist) return res.status(404).json({ message: "Artist not found" });

    res.status(200).json({ success: true, artist });
  } catch (error) {
    console.error("Get Artist By ID Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};