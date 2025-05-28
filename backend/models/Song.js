import mongoose from "mongoose";

const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Song title is required"],
    trim: true,
  },
  artist: {
    type: String,
    required: [true, "Artist name is required"],
  },
  album: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Album",
    default: null,
  },
  genre: [{
    type: String,
    required: true,
  }],
  duration: {
    type: Number, // duration in seconds
    required: true,
  },
  coverImage: {
    type: String,
    default: "",
  },
  audioUrl: {
    type: String,
    required: [true, "Audio URL is required"],
  },
  price: {
    type: Number,
    default: 0,
  },
  isPremium: {
    type: Boolean,
    default: false,
  },
  releaseDate: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

export const Song = mongoose.model("Song", songSchema);
