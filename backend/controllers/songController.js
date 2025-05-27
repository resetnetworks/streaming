import { Song } from "../models/Song.js";
import { uploadToS3 } from "../utils/s3Uploader.js";
import { convertAudio } from "../utils/convertAudio.js";
import path from "path";

function generateConvertedUrls(outputPrefix, baseFileName) {
  const region = process.env.AWS_REGION;
  const bucket = process.env.AWS_S3_BUCKET;

  return {
    "64kbps": `https://${bucket}.s3.${region}.amazonaws.com/${outputPrefix}/${baseFileName}_64kbps.m4a`,
    "128kbps": `https://${bucket}.s3.${region}.amazonaws.com/${outputPrefix}/${baseFileName}_128kbps.m4a`,
    "256kbps": `https://${bucket}.s3.${region}.amazonaws.com/${outputPrefix}/${baseFileName}_256kbps.m4a`,
  };
}


export const createSong = async (req, res) => {
  try {
    const { title, artist, genre, duration, price, isPremium, releaseDate } = req.body;

    const coverImageFile = req.files?.coverImage?.[0];
    const audioFile = req.files?.audio?.[0];

    if (!audioFile) {
      return res.status(400).json({ message: "Audio file is required" });
    }

    const audioUrl = await uploadToS3(audioFile, "songs");
    const coverImageUrl = coverImageFile ? await uploadToS3(coverImageFile, "covers") : "";

    const baseFileName = path.basename(audioUrl).split(".")[0];
    const outputPrefix = `converted/${baseFileName}`;

    await convertAudio(audioUrl, outputPrefix); // Use correct output path

    const convertedVersions = generateConvertedUrls(outputPrefix, baseFileName);

    const newSong = await Song.create({
      title,
      artist,
      genre,
      duration,
      price,
      isPremium,
      releaseDate,
      coverImage: coverImageUrl,
      audioUrl,
      convertedVersions,
    });

    res.status(201).json({ success: true, song: newSong });
  } catch (error) {
    console.error("Create Song Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ message: "Song not found" });

    const { title, artist, genre, duration, price, isPremium, releaseDate } = req.body;

    if (req.files?.coverImage?.[0]) {
      song.coverImage = await uploadToS3(req.files.coverImage[0], "covers");
    }

    if (req.files?.audio?.[0]) {
      const audioUrl = await uploadToS3(req.files.audio[0], "songs");
      song.audioUrl = audioUrl;

      const baseFileName = path.basename(audioUrl).split(".")[0];
      const outputPrefix = `converted/${baseFileName}`;

      await convertAudio(audioUrl, outputPrefix);

      song.convertedVersions = generateConvertedUrls(outputPrefix, baseFileName);
    }

    Object.assign(song, { title, artist, genre, duration, price, isPremium, releaseDate });

    await song.save();

    res.status(200).json({ success: true, song });
  } catch (error) {
    console.error("Update Song Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteSong = async (req, res) => {
  try {
    const song = await Song.findByIdAndDelete(req.params.id);
    if (!song) return res.status(404).json({ message: "Song not found" });

    res.status(200).json({ success: true, message: "Song deleted successfully" });
  } catch (error) {
    console.error("Delete Song Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllSongs = async (req, res) => {
  try {
    const songs = await Song.find().sort({ createdAt: -1 }); // latest first
    res.status(200).json({ success: true, songs });
  } catch (error) {
    console.error("Get All Songs Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const getSongById = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ message: "Song not found" });

    res.status(200).json({ success: true, song });
  } catch (error) {
    console.error("Get Song By ID Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
