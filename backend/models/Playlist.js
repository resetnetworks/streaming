// models/Playlist.js
import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: "", trim: true },
  image: { type: String, default: "" },
  songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

export const Playlist = mongoose.model("Playlist", playlistSchema);
