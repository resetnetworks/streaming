import React, { useState, useEffect } from "react";
import UploadForm from "../../components/artist/upload/UploadForm";
import { useDispatch, useSelector } from "react-redux";
import { createSong, resetUploadState, prepareSongFormData } from "../../features/artistSong/artistSongSlice";

const SingleUpload = ({ onCancel }) => {
  const dispatch = useDispatch();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Redux state se data lo
  const {
    uploadLoading,
    uploadError,
    uploadedSong,
  } = useSelector(state => state.artistSongs);

  // Handle loading state changes
  useEffect(() => {
    if (uploadLoading && !isSubmitting) {
      setIsSubmitting(true);
    }
    
    if (!uploadLoading && isSubmitting) {
      const timer = setTimeout(() => {
        setIsSubmitting(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [uploadLoading, isSubmitting]);

  // Auto close when upload is successful
  useEffect(() => {
    if (uploadedSong && !uploadLoading) {
      // Success message show karo
      setShowSuccessMessage(true);
      
      // 1 second baad auto close
      const timer = setTimeout(() => {
        if (onCancel) onCancel();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [uploadedSong, uploadLoading, onCancel]);

  const handleSubmit = async (formData) => {
    if (isSubmitting) {
      return;
    }

    

    const track = formData.tracks[0];
    const audioFile = track.file;

    if (!audioFile) {
      alert("Please select an audio file!");
      return;
    }

    let durationInSeconds = 0;
    if (track.duration && track.duration !== "Loading...") {
      try {
        const [minutes, seconds] = track.duration.split(":").map(Number);
        durationInSeconds = (minutes * 60) + seconds;
      } catch (error) {
        console.warn("Could not parse duration, using default");
        durationInSeconds = 180;
      }
    } else {
      durationInSeconds = 180;
    }

    const songData = {
      title: formData.title || track.name,
      duration: durationInSeconds,
      accessType: formData.accessType || "subscription",
      genre: formData.genres?.join(",") || "",
      releaseDate: formData.date,
      albumOnly: false,
      description: formData.description || "",
    };

    if (formData.accessType === "purchase-only" && formData.basePrice) {
      const priceAmount = parseFloat(formData.basePrice.amount);
      if (isNaN(priceAmount) || priceAmount <= 0) {
        alert("Please enter a valid price greater than 0!");
        return;
      }
      
      songData.basePrice = {
        amount: priceAmount,
        currency: "USD"
      };
      
    }


    const uploadFormData = prepareSongFormData(
      songData,
      audioFile,
      formData.coverImage
    );

    try {
      setIsSubmitting(true);
      
      await dispatch(createSong(uploadFormData)).unwrap();
      
      
    } catch (error) {
      console.error("Upload failed:", error);
      
      if (error && typeof error === 'string') {
        if (error.includes("Invalid price format")) {
          alert("Please enter a valid price (e.g., 1.99, 2.50)");
        } else if (error.includes("Unauthorized") || error.includes("401")) {
          alert("Session expired. Please login again.");
          window.location.href = "/login";
        } else {
          alert(`Upload failed: ${error}`);
        }
      } else if (error && typeof error === 'object') {
        if (error.message) {
          alert(`Upload failed: ${error.message}`);
        }
      } else {
        alert("Upload failed. Please try again.");
      }
    }
  };

  useEffect(() => {
    return () => {
      dispatch(resetUploadState());
    };
  }, [dispatch]);

  return (
    <div className="p-6 relative">
      {isSubmitting && (
        <div className="absolute top-4 right-4 bg-blue-900/50 backdrop-blur-sm text-blue-300 px-4 py-2 rounded-lg flex items-center gap-2 z-50">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-300 border-t-transparent"></div>
          <span className="text-sm">Uploading, please wait...</span>
        </div>
      )}

      {showSuccessMessage && (
        <div className="absolute top-4 right-4 bg-green-900/50 backdrop-blur-sm text-green-300 px-4 py-2 rounded-lg flex items-center gap-2 z-50">
          <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
            <span className="text-white text-xs">✓</span>
          </div>
          <span className="text-sm">Upload Successful!</span>
        </div>
      )}

      {uploadError && (
        <div className="absolute top-4 right-4 bg-red-900/50 backdrop-blur-sm text-red-300 px-4 py-2 rounded-lg z-50 flex items-center gap-2">
          <span className="text-sm">Error: {uploadError}</span>
        </div>
      )}

      <UploadForm 
        type="song"
        onCancel={onCancel}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        initialData={{
          title: "",
          date: new Date().toISOString().split("T")[0],
          genres: [],
          tracks: [],
          accessType: "subscription"
        }}
      />
    </div>
  );
};

export default SingleUpload;