import imageCompression from "browser-image-compression";

export const compressCoverImage = async (file) => {
  const options = {
    maxWidthOrHeight: 600,
    maxSizeMB: 0.3,
    useWebWorker: true,
    fileType: "image/webp",
    initialQuality: 0.8,
  };

  try {
    return await imageCompression(file, options);
  } catch (error) {
    console.error("Image compression failed", error);
    throw error;
  }
};


export const compressArtistCoverImage = async (file) => {
  const options = {
    maxWidthOrHeight: 1000,
    maxSizeMB: 0.4,
    useWebWorker: true,
    fileType: "image/webp",
    initialQuality: 0.8,
  };

  try {
    return await imageCompression(file, options);
  } catch (error) {
    console.error("Image compression failed", error);
    throw error;
  }
};

export const compressProfileImage = async (file) => {
  const options = {
    maxWidthOrHeight: 500,
    maxSizeMB: 0.2,
    useWebWorker: true,
    fileType: "image/webp",
    initialQuality: 0.8,
  };

  try {
    return await imageCompression(file, options);
  } catch (error) {
    console.error("Image compression failed", error);
    throw error;
  }
};
