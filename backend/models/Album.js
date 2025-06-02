import mongoose from "mongoose";

const albumSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Album title is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    artist: {
      type: String,
      required: [true, "Artist name is required"],
    },
    coverImage: {
      type: String, // URL to album cover image
      default: "",
    },
    genre: [{
      type: String,
    }],
    releaseDate: {
      type: Date,
      default: Date.now,
    },
    songs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Song",
        required: true,
      },
    ],
    price: {
      type: Number,
      default: 0, // If album is free
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Album = mongoose.model("Album", albumSchema);
