import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({ storage });

// This correctly expects two named fields: audio and coverImage
export const songUpload = upload.fields([
  { name: "audio", maxCount: 1 },
  { name: "coverImage", maxCount: 1 },
]);

export const albumUpload = upload.fields([
  { name: "coverImage", maxCount: 1 },
]);

export const artistUpload = upload.fields([
  { name: "image", maxCount: 1 },
]);
