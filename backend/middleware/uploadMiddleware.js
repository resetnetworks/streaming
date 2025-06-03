import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({ storage });

// This correctly expects two named fields: audio and coverImage
export const songUpload = upload.fields([
  { name: "audio", maxCount: 1 },
  { name: "coverImage", maxCount: 1 },
]);

export const singleImageUpload = upload.fields([
  { name: "coverImage", maxCount: 1 },
]);

