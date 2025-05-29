
import {Album} from '../models/Album.js'
import { uploadToS3 } from "../utils/s3Uploader.js"; // Make sure this function exists
import mongoose from 'mongoose'


export const createAlbum = async (req, res) => {
    try{   
       let { title, description, artist, genre, releaseDate, songs, price, isPremium } = req.body;
       console.log(req.body)

    // Normalize genre if needed (depending on schema structure)
    if (typeof genre === "string") {
      genre = genre.trim();
    }

    // Normalize songs to an array of ObjectIds
    if (typeof songs === "string") {
      songs = songs.split(",").map((id) => new mongoose.Types.ObjectId(id.trim()));
    }

    const coverImageFile = req.files?.coverImage?.[0];
    const coverImageUrl = coverImageFile ? await uploadToS3(coverImageFile, "covers") : "";

    const newAlbum = await Album.create({
      title,
      description,
      artist,
      genre,
      releaseDate,
      songs,
      price,
      isPremium,
      coverImage: coverImageUrl,
    });

    res.status(201).json({ success: true, album: newAlbum });
  } catch (error) {
    console.error("Create Album Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
export const getAllAlbums = async (req, res) => {
    try {
      const albums = await Album.find().sort({ createdAt: -1 }); // latest first
      res.status(200).json({ success: true, albums });
    } catch (error) {
      console.error("Get All Albums Error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
}
export const getAlbumById = async (req, res) => {
   try {
       const album = await Album.findById(req.params.id);
       if (!album) return res.status(404).json({ message: "Album not found" });
   
       res.status(200).json({ success: true, album });
     } catch (error) {
       console.error("Get Album By ID Error:", error);
       res.status(500).json({ message: "Internal server error" });
     }
}
export const updateAlbum = async (req, res) => {
    try{
       res.send('update Album')
    }
    catch(err)
    {
        res.send("something went wrong")
    }
}
export const deleteAlbum = async (req, res) => {
    try {
        const album = await Album.findByIdAndDelete(req.params.id);
        if (!album) return res.status(404).json({ message: "Album not found" });
    
        res.status(200).json({ success: true, message: "Album deleted successfully" });
      } catch (error) {
        console.error("Delete Album Error:", error);
        res.status(500).json({ message: "Internal server error" });
      }
}


