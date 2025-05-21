import mongoose from "mongoose";
import validator from "validator";

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        minlength: [2, "Name must be at least 2 characters long"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: "Please enter a valid email"
        }
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [8, "Password must be at least 8 characters long"],
        select: false
    },
    resetPasswordToken: {
    type: String,
},
resetPasswordExpire: {
    type: Date,
},

    dob: {
        type: Number,
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
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
}, { timestamps: true });

export const User = mongoose.model("User", schema);
