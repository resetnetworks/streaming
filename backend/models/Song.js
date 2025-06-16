import mongoose from "mongoose";
import slugify from "slugify";
import { customAlphabet } from "nanoid";

// Unique 6-character slug suffix
const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 6);

const songSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Song title is required"],
      trim: true,
      minlength: [2, "Song title must be at least 2 characters"],
      maxlength: [200, "Song title must be at most 200 characters"],
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, "Slug must be lowercase and URL-friendly"],
    },
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Artist",
      required: true,
    },
    album: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Album",
      default: null,
    },
    includeInSubscription: {
      type: Boolean,
      default: true,
    },
    genre: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    coverImage: {
      type: String,
      default: "",
      trim: true,
    },
    audioUrl: {
      type: String,
      required: [true, "Audio URL is required"],
      trim: true,
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    releaseDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true, versionKey: false }
);

// 🔁 Auto-generate slug from title + nanoid (just like album)
songSchema.pre("validate", function (next) {
  if (!this.slug && this.title) {
    const baseSlug = slugify(this.title, { lower: true, strict: true });
    this.slug = `${baseSlug}-${nanoid()}`;
  }
  next();
});

// Indexes for performance
songSchema.index({ genre: 1 });
songSchema.index({ title: 1 });
songSchema.index({ slug: 1 });

export const Song = mongoose.models.Song || mongoose.model("Song", songSchema);
