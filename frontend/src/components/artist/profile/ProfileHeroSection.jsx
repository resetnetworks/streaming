// src/components/ProfileHeroSection.jsx
import React, { useRef, useState } from "react";
import { FiEdit3 } from "react-icons/fi";
import { IoLogOutOutline } from "react-icons/io5";
import { IoAddCircleOutline } from "react-icons/io5";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useArtistProfile } from "../../../hooks/api/useArtistDashboard";
import { useS3Upload } from "../../../hooks/api/useS3Upload";
import { getS3Url } from "../../../utills/s3Utils";
import {  compressArtistCoverImage, compressProfileImage } from "../../../utills/imageCompression";
import { logoutUser } from "../../../features/auth/authSlice";
import { useDispatch } from "react-redux";

const ProfileHeroSection = () => {
  const navigate = useNavigate();
  
  const { data: artistProfile, isLoading, refetch } = useArtistProfile();
  const {
  uploadArtistImage,
  isArtistImageUploading: isUploading
} = useS3Upload();

  
  const profileImageInputRef = useRef(null);
  const coverImageInputRef = useRef(null);
  const [uploadType, setUploadType] = useState(null); // 'profile' or 'cover'
  const [showProfileEditIcon, setShowProfileEditIcon] = useState(false);
  const [showImagePreviewModal, setShowImagePreviewModal] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [selectedImageType, setSelectedImageType] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isEditingImage, setIsEditingImage] = useState(false); // To track if user clicked "Edit Image" in preview modal

  const dispatch = useDispatch();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const triggerImageUpload = (type) => {
    setUploadType(type);
    if (type === 'profile') {
      profileImageInputRef.current.click();
    } else {
      coverImageInputRef.current.click();
    }
  };

  const openPreviewModal = (type) => {
    setSelectedImageType(type);
    
    // Show current image as preview
    if (type === 'profile') {
      const currentImageUrl = artistProfile?.profileImage 
        ? getS3Url(artistProfile?.profileImage) 
        : null;
      setPreviewUrl(currentImageUrl);
    } else if (type === 'cover') {
      const currentImageUrl = artistProfile?.coverImage 
        ? getS3Url(artistProfile?.coverImage) 
        : null;
      setPreviewUrl(currentImageUrl);
    }
    
    setIsEditingImage(false);
    setSelectedImageFile(null);
    setShowImagePreviewModal(true);
  };

  const handleFileSelect = async (event, type) => {
    const file = event.target.files[0];
    if (!file) {
      setUploadType(null);
      return;
    }
    
    // Validation
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      setUploadType(null);
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size should be less than 10MB");
      setUploadType(null);
      return;
    }
    
    // Set selected file and show preview
    setSelectedImageFile(file);
    setSelectedImageType(type);
    setIsEditingImage(true); // User is now editing the image
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);
    
    // Show modal if not already shown
    if (!showImagePreviewModal) {
      setShowImagePreviewModal(true);
    }
    
    // Reset input
    event.target.value = '';
  };

  const handleCompressAndUpload = async () => {
    if (!selectedImageFile || !selectedImageType) return;
    
    setIsCompressing(true);
    let compressedFile;
    
    try {
      toast.loading('Compressing image...', { id: 'compressing' });
      
      // Compress based on image type
      if (selectedImageType === 'profile') {
        compressedFile = await compressProfileImage(selectedImageFile);
      } else if (selectedImageType === 'cover') {
        // For artist cover image, use compressArtistCoverImage
        compressedFile = await compressArtistCoverImage(selectedImageFile);
      }
      
      toast.dismiss('compressing');
      toast.loading('Uploading image...', { id: 'uploading' });
      
      // Create a new File object with webp extension for the compressed file
      // This is important because the backend checks file extension
      const webpFileName = `image_${Date.now()}.webp`;
      const webpFile = new File([compressedFile], webpFileName, {
        type: 'image/webp',
        lastModified: Date.now()
      });
      
      // Upload compressed file
      await uploadArtistImage({ 
        file: webpFile, 
        type: selectedImageType 
      });
      
      toast.dismiss('uploading');
      toast.success('Image updated successfully!');
      
      // Refetch profile data to get updated image
      await refetch();
      
      // Close modal
      closePreviewModal();
      
    } catch (error) {
      console.error('Image processing error:', error);
      toast.dismiss('compressing');
      toast.dismiss('uploading');
      
      if (error.message.includes('File extension does not match mime type')) {
        toast.error('File format error. Please try with a different image.');
      } else {
        toast.error('Failed to process image. Please try again.');
      }
    } finally {
      setIsCompressing(false);
    }
  };

  const closePreviewModal = () => {
    setShowImagePreviewModal(false);
    setSelectedImageFile(null);
    setSelectedImageType(null);
    setPreviewUrl(null);
    setUploadType(null);
    setIsEditingImage(false);
  };

  const handleEditImageClick = () => {
    setIsEditingImage(true);
    if (selectedImageType === 'profile') {
      profileImageInputRef.current.click();
    } else {
      coverImageInputRef.current.click();
    }
  };

  const calculateSubscriptionFees = () => {
    if (!artistProfile?.subscriptionPlans?.[0]?.basePrice) {
      return "$10.00 / month";
    }
    
    const amount = artistProfile.subscriptionPlans[0].basePrice.amount || 10;
    const cycle = artistProfile.monetization?.plans?.[0]?.cycle || "1m";
    
    switch(cycle) {
      case "1m":
        return `$${amount.toFixed(2)} / month`;
      case "3m":
        return `$${amount.toFixed(2)} / 3 months`;
      case "6m":
        return `$${amount.toFixed(2)} / 6 months`;
      default:
        return `$${amount.toFixed(2)} / month`;
    }
  };

  if (isLoading) {
    return (
      <div className="relative h-[16rem] sm:h-[20rem] md:h-[22rem] w-full bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  // Get S3 URLs
  const profileImageUrl = artistProfile?.profileImage 
    ? getS3Url(artistProfile?.profileImage) 
    : null;
  
  const coverImageUrl = artistProfile?.coverImage 
    ? getS3Url(artistProfile?.coverImage) 
    : null;

  return (
    <>
      <div className="relative h-[16rem] sm:h-[20rem] md:h-[22rem] w-full">
        {/* Background Image - Original UI */}
        {coverImageUrl ? (
          <img
            src={coverImageUrl}
            className="w-full h-full object-cover opacity-80"
            alt="Profile Background"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
            <button
              onClick={() => triggerImageUpload('cover')}
              className="flex flex-col items-center justify-center text-white/70 hover:text-white transition-colors"
              disabled={isUploading && uploadType === 'cover'}
            >
              {isUploading && uploadType === 'cover' ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2"></div>
              ) : (
                <IoAddCircleOutline className="text-4xl mb-2" />
              )}
              <span className="text-sm">
                {isUploading && uploadType === 'cover' ? 'Uploading...' : 'Add background image'}
              </span>
            </button>
          </div>
        )}
        
        {/* Gradients - Original UI */}
        <div className="absolute top-0 left-0 w-full h-16 sm:h-20 bg-gradient-to-b from-[#0f172a] to-transparent z-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-blue-900/30 z-10" />
        <div className="absolute bottom-0 left-0 w-full h-24 sm:h-32 bg-gradient-to-t from-black/70 to-transparent z-20" />
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent z-30"></div>
        
        {/* Edit Cover Button - Now opens preview modal */}
        <button 
          onClick={() => openPreviewModal('cover')}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 flex items-center bg-gradient-to-tl from-black to-gray-500 justify-center w-[30px] h-[30px] sm:w-[35px] sm:h-[35px] rounded-full backdrop-blur-md border border-white/20 text-white shadow-lg hover:shadow-2xl transition-all duration-200 group"
          title="Upload Cover Image"
          disabled={isUploading && uploadType === 'cover'}
        >
          {isUploading && uploadType === 'cover' ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <FiEdit3 className="text-lg sm:text-xl" />
          )}
        </button>
        
        {/* Hidden file inputs */}
        <input
          type="file"
          ref={profileImageInputRef}
          className="hidden"
          accept="image/*"
          onChange={(e) => handleFileSelect(e, 'profile')}
        />
        <input
          type="file"
          ref={coverImageInputRef}
          className="hidden"
          accept="image/*"
          onChange={(e) => handleFileSelect(e, 'cover')}
        />
        
        {/* Profile Content - Original UI */}
        <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-8 right-4 sm:right-8 z-30 flex flex-col sm:flex-row items-start sm:items-center justify-between text-white">
          {/* Left Side */}
          <div className="flex items-center gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-0">
            {/* Profile Image with Hover Edit Icon */}
            <div 
              className="relative group"
              onMouseEnter={() => setShowProfileEditIcon(true)}
              onMouseLeave={() => setShowProfileEditIcon(false)}
            >
              {profileImageUrl ? (
                <>
                  <img
                    src={profileImageUrl}
                    alt={artistProfile?.name || 'Artist'}
                    className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full object-cover border-2 border-blue-500 shadow-[0_0_10px_2px_#3b82f6] cursor-pointer"
                    onClick={() => openPreviewModal('profile')}
                  />
                  
                  {/* Hover Edit Icon Overlay */}
                  <div 
                    className={`absolute inset-0 flex items-center justify-center rounded-full bg-black/60 transition-all duration-300 cursor-pointer ${
                      showProfileEditIcon ? 'opacity-100' : 'opacity-0'
                    }`}
                    onClick={() => openPreviewModal('profile')}
                  >
                    {isUploading && uploadType === 'profile' ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    ) : (
                      <FiEdit3 className="text-2xl text-white" />
                    )}
                  </div>
                </>
              ) : (
                <div 
                  onClick={() => triggerImageUpload('profile')}
                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full border-2 border-dashed border-blue-500/50 flex items-center justify-center bg-gray-800/50 cursor-pointer hover:bg-gray-800/70 transition-colors relative"
                >
                  {isUploading && uploadType === 'profile' ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <IoAddCircleOutline className="text-2xl text-white/60" />
                      {/* Always show edit icon when no profile image */}
                      <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30 opacity-0 hover:opacity-100 transition-opacity duration-300">
                        <FiEdit3 className="text-xl text-white" />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
            
            {/* Profile Details */}
            <div>
              <div className="flex items-center gap-1 sm:gap-2 mb-1">
                <span className="text-xs sm:text-sm font-medium">artist</span>
                <img src="/Verified.svg" alt="verified badge" className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">
                {artistProfile?.name || 'Artist Name'}
              </h1>
              
              <div className="flex items-center gap-1 mt-1 sm:mt-2 text-gray-200">
                <span className="text-base text-blue-500 font-bold sm:text-xl">
                  {calculateSubscriptionFees()}
                </span>
              </div>
            </div>
          </div>
          
          {/* Right Side: Logout Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 md:gap-8 w-full sm:w-auto">
            <button 
              onClick={handleLogout}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 sm:px-6 sm:py-2.5 md:px-7 md:py-2.5 rounded-full font-medium transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] flex items-center gap-1.5 sm:gap-2 text-sm w-full sm:w-auto justify-center"
            >
              <span>Logout</span>
              <IoLogOutOutline className="text-base" />
            </button>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {showImagePreviewModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-md w-full overflow-hidden border border-gray-700">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  {isEditingImage ? 'Preview New ' : ''}{selectedImageType === 'profile' ? 'Profile' : 'Cover'} Image
                </h3>
                <button
                  onClick={closePreviewModal}
                  className="text-gray-400 hover:text-white transition-colors"
                  disabled={isCompressing}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Image Preview */}
            <div className="p-4">
              <div className="relative w-full h-64 bg-gray-800 rounded-lg overflow-hidden">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No image
                  </div>
                )}
                {isCompressing && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                      <p className="text-white">Processing image...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-800 flex justify-between gap-3">
              {isEditingImage ? (
                <>
                  <button
                    onClick={() => {
                      setIsEditingImage(false);
                      // Reset to current image
                      if (selectedImageType === 'profile') {
                        const currentImageUrl = artistProfile?.profileImage 
                          ? getS3Url(artistProfile?.profileImage) 
                          : null;
                        setPreviewUrl(currentImageUrl);
                      } else if (selectedImageType === 'cover') {
                        const currentImageUrl = artistProfile?.coverImage 
                          ? getS3Url(artistProfile?.coverImage) 
                          : null;
                        setPreviewUrl(currentImageUrl);
                      }
                      setSelectedImageFile(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isCompressing}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCompressAndUpload}
                    disabled={isCompressing}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCompressing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Processing...
                      </>
                    ) : (
                      'Update Image'
                    )}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={closePreviewModal}
                    className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleEditImageClick}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                  >
                    <FiEdit3 className="text-base" />
                    Edit Image
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileHeroSection;