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
      type: mongoose.Schema.Types.ObjectId,
      ref: "Artist", // <-- This enables population and correct referencing
      required: [true, "Artist is required"],
    },
    coverImage: {
      type: String,
      default: "",
    },
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
      default: 0,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Album = mongoose.model("Album", albumSchema);