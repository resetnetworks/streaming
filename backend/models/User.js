import mongoose from "mongoose";
import validator from "validator";

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      validate: {
        validator: validator.isEmail,
        message: "Please enter a valid email",
      },
    },
    password: {
      type: String,
      minlength: [8, "Password must be at least 8 characters long"],
      select: false,
      required: function () {
        return !this.googleId;
      },
    },
    googleId: {
      type: String,
    },

    facebookId: {
      type: String,
    },
    appleId: {
      type: String,
    },

    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpire: {
      type: Date,
    },

    dob: {
      type: Date,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    profileImage: {
      type: String,
      default: "",
    },
    playlist: [
      {
        type: String,
        required: true,
      },
    ],
    likedsong: [
      {
        type: String,
        required: true,
      },
    ],

    preferredGenres: [
      {
        type: String,
        trim: true,
      },
    ],

    purchasedSongs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Song",
      },
    ],
    purchasedAlbums: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Album",
      },
    ],
    subscribedArtists: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Artist",
      },
    ],

    purchaseHistory: [
      {
        itemType: {
          type: String,
          enum: ["song", "album"],
          required: true,
        },
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          refPath: "purchaseHistory.itemType",
        },
        price: {
          type: Number,
          required: true,
        },
        paymentId: {
          type: String,
          required: true,
        },
        purchasedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

export const User = mongoose.model("User", schema);
