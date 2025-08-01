import mongoose from "mongoose";
import slugify from "slugify";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 6);

const artistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Artist name is required"],
      trim: true,
      minlength: [2, "Artist name must be at least 2 characters"],
      maxlength: [100, "Artist name must be at most 100 characters"],
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, "Slug must be lowercase and URL-friendly"],
    },
    location: {
      type: String,
      maxlength: 100,
      default: "",
      trim: true,
      minlength: 2,
    },
    bio: {
      type: String,
      maxlength: 500,
      default: "",
      trim: true,
    },
    image: {
      type: String,
      default: "",
      trim: true,
    },
    subscriptionPrice: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    stripePriceId: {
      type: String,
      default: null,
      trim: true,
    },
    razorpayPlanId: { 
      type:String , 
      default: null,
      trim: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subscribers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true, versionKey: false }
);


// 🔁 Auto-generate unique slug before validation
artistSchema.pre("validate", function (next) {
  if (!this.slug && this.name) {
    const baseSlug = slugify(this.name, { lower: true, strict: true });
    this.slug = `${baseSlug}-${nanoid()}`;
  }
  next();
});

// Indexes for fast lookup
artistSchema.index({ name: 1 });
artistSchema.index({ slug: 1 });

export const Artist = mongoose.models.Artist || mongoose.model("Artist", artistSchema);
