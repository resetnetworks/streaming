// src/components/ProfileHeroSection.jsx
import React, { useRef, useState } from "react";
import { FiEdit3 } from "react-icons/fi";
import { IoLogOutOutline } from "react-icons/io5";
import { IoAddCircleOutline } from "react-icons/io5";
import { HiUserAdd, HiUsers } from "react-icons/hi";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useArtistProfile } from "../../../hooks/api/useArtistDashboard";
import { useS3Upload } from "../../../hooks/api/useS3Upload";
import { getS3Url } from "../../../utills/s3Utils";
import { compressArtistCoverImage, compressProfileImage } from "../../../utills/imageCompression";
import { logoutUser } from "../../../features/auth/authSlice";
import { useDispatch } from "react-redux";
import InviteCollaboratorModal from "./InviteCollaboratorModal";
import CollaboratorsPanel, { getInitials } from "./CollaboratorsPanel";
import { useCurrentWorkspace } from "../../../hooks/api/useCurrentWorkspace";
import { useWorkspaceMembers } from "../../../hooks/api/useWorkspaces";

// ─── Avatar Stack ─────────────────────────────────────────────────────────────
const AvatarStack = ({ members, max = 4, onClick }) => {
  const visible = members.slice(0, max);
  const extra   = members.length - max;

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 group"
      title="View all collaborators"
    >
      <div className="flex -space-x-2">
        {visible.map((m, i) => (
          <div
            key={m._id || i}
            style={{ zIndex: visible.length - i }}
            className="w-7 h-7 rounded-full border-2 border-gray-900 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-[10px] font-semibold text-white flex-shrink-0 group-hover:ring-1 group-hover:ring-white/30 transition-all"
            title={m.userId?.name || "Member"}
          >
            {getInitials(m.userId?.name)}
          </div>
        ))}
        {extra > 0 && (
          <div
            style={{ zIndex: 0 }}
            className="w-7 h-7 rounded-full border-2 border-gray-900 bg-gray-700 flex items-center justify-center text-[10px] font-semibold text-gray-300 flex-shrink-0"
          >
            +{extra}
          </div>
        )}
      </div>
      <span className="text-xs text-white/70 group-hover:text-white transition-colors">
        {members.length} {members.length === 1 ? "collaborator" : "collaborators"}
      </span>
    </button>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ProfileHeroSection = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { data: artistProfile, isLoading, refetch } = useArtistProfile();
  const { uploadArtistImage, isArtistImageUploading: isUploading } = useS3Upload();

  // ── Workspace permissions ────────────────────────────────────────────────────
  const { workspaceId, permissions, role } = useCurrentWorkspace();

  // Invite button sirf owner aur manageTeam permission wale ko dikhega
  const canManageTeam = role === "owner" || permissions?.manageTeam === true;

  const { data: members = [], isLoading: membersLoading } = useWorkspaceMembers(workspaceId);

  const profileImageInputRef = useRef(null);
  const coverImageInputRef   = useRef(null);

  const [uploadType,            setUploadType]            = useState(null);
  const [showProfileEditIcon,   setShowProfileEditIcon]   = useState(false);
  const [showImagePreviewModal, setShowImagePreviewModal] = useState(false);
  const [selectedImageFile,     setSelectedImageFile]     = useState(null);
  const [selectedImageType,     setSelectedImageType]     = useState(null);
  const [previewUrl,            setPreviewUrl]            = useState(null);
  const [isCompressing,         setIsCompressing]         = useState(false);
  const [isEditingImage,        setIsEditingImage]        = useState(false);
  const [showInviteModal,       setShowInviteModal]       = useState(false);
  const [showMembersPanel,      setShowMembersPanel]      = useState(false);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const triggerImageUpload = (type) => {
    setUploadType(type);
    if (type === "profile") profileImageInputRef.current.click();
    else coverImageInputRef.current.click();
  };

  const openPreviewModal = (type) => {
    setSelectedImageType(type);
    const key = type === "profile" ? "profileImage" : "coverImage";
    setPreviewUrl(artistProfile?.[key] ? getS3Url(artistProfile[key]) : null);
    setIsEditingImage(false);
    setSelectedImageFile(null);
    setShowImagePreviewModal(true);
  };

  const handleFileSelect = async (event, type) => {
    const file = event.target.files[0];
    if (!file) { setUploadType(null); return; }

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

    setSelectedImageFile(file);
    setSelectedImageType(type);
    setIsEditingImage(true);

    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target.result);
    reader.readAsDataURL(file);

    if (!showImagePreviewModal) setShowImagePreviewModal(true);
    event.target.value = "";
  };

  const handleCompressAndUpload = async () => {
    if (!selectedImageFile || !selectedImageType) return;
    setIsCompressing(true);
    try {
      toast.loading("Compressing image...", { id: "compressing" });
      const compressedFile = selectedImageType === "profile"
        ? await compressProfileImage(selectedImageFile)
        : await compressArtistCoverImage(selectedImageFile);

      toast.dismiss("compressing");
      toast.loading("Uploading image...", { id: "uploading" });

      const webpFile = new File(
        [compressedFile],
        `image_${Date.now()}.webp`,
        { type: "image/webp", lastModified: Date.now() }
      );
      await uploadArtistImage({ file: webpFile, type: selectedImageType });

      toast.dismiss("uploading");
      toast.success("Image updated successfully!");
      await refetch();
      closePreviewModal();
    } catch (error) {
      console.error("Image processing error:", error);
      toast.dismiss("compressing");
      toast.dismiss("uploading");
      toast.error(
        error.message.includes("File extension does not match mime type")
          ? "File format error. Please try with a different image."
          : "Failed to process image. Please try again."
      );
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
    if (selectedImageType === "profile") profileImageInputRef.current.click();
    else coverImageInputRef.current.click();
  };

  const calculateSubscriptionFees = () => {
    if (!artistProfile?.subscriptionPlans?.[0]?.basePrice) return "$10.00 / month";
    const amount = artistProfile.subscriptionPlans[0].basePrice.amount || 10;
    const cycle  = artistProfile.monetization?.plans?.[0]?.cycle || "1m";
    const map    = { "1m": "month", "3m": "3 months", "6m": "6 months" };
    return `$${amount.toFixed(2)} / ${map[cycle] || "month"}`;
  };

  const collaborators = members.filter((m) => m.role !== "owner");

  // ── Early return ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="relative h-[16rem] sm:h-[20rem] md:h-[22rem] w-full bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
      </div>
    );
  }

  const profileImageUrl = artistProfile?.profileImage ? getS3Url(artistProfile.profileImage) : null;
  const coverImageUrl   = artistProfile?.coverImage   ? getS3Url(artistProfile.coverImage)   : null;

  return (
    <>
      <div className="relative h-[16rem] sm:h-[20rem] md:h-[22rem] w-full">

        {/* ── Cover image ── */}
        {coverImageUrl ? (
          <img src={coverImageUrl} className="w-full h-full object-cover opacity-80" alt="Profile Background" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
            <button
              onClick={() => triggerImageUpload("cover")}
              className="flex flex-col items-center justify-center text-white/70 hover:text-white transition-colors"
              disabled={isUploading && uploadType === "cover"}
            >
              {isUploading && uploadType === "cover"
                ? <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2" />
                : <IoAddCircleOutline className="text-4xl mb-2" />}
              <span className="text-sm">
                {isUploading && uploadType === "cover" ? "Uploading..." : "Add background image"}
              </span>
            </button>
          </div>
        )}

        {/* ── Gradients ── */}
        <div className="absolute top-0 left-0 w-full h-16 sm:h-20 bg-gradient-to-b from-[#0f172a] to-transparent z-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-blue-900/30 z-10" />
        <div className="absolute bottom-0 left-0 w-full h-24 sm:h-32 bg-gradient-to-t from-black/70 to-transparent z-20" />
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent z-30" />

        {/* ── Edit cover button ── */}
        <button
          onClick={() => openPreviewModal("cover")}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 flex items-center bg-gradient-to-tl from-black to-gray-500 justify-center w-[30px] h-[30px] sm:w-[35px] sm:h-[35px] rounded-full backdrop-blur-md border border-white/20 text-white shadow-lg hover:shadow-2xl transition-all duration-200"
          title="Upload Cover Image"
          disabled={isUploading && uploadType === "cover"}
        >
          {isUploading && uploadType === "cover"
            ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            : <FiEdit3 className="text-lg sm:text-xl" />}
        </button>

        {/* ── Hidden file inputs ── */}
        <input type="file" ref={profileImageInputRef} className="hidden" accept="image/*"
          onChange={(e) => handleFileSelect(e, "profile")} />
        <input type="file" ref={coverImageInputRef}   className="hidden" accept="image/*"
          onChange={(e) => handleFileSelect(e, "cover")} />

        {/* ── Bottom content row ── */}
        <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-8 right-4 sm:right-8 z-30 flex flex-col sm:flex-row items-start sm:items-end justify-between text-white gap-3">

          {/* Left — Avatar + name + collaborators */}
          <div className="flex items-center gap-3 sm:gap-4 md:gap-6">

            {/* Profile image */}
            <div
              className="relative group flex-shrink-0"
              onMouseEnter={() => setShowProfileEditIcon(true)}
              onMouseLeave={() => setShowProfileEditIcon(false)}
            >
              {profileImageUrl ? (
                <>
                  <img
                    src={profileImageUrl}
                    alt={artistProfile?.name || "Artist"}
                    className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full object-cover border-2 border-blue-500 shadow-[0_0_10px_2px_#3b82f6] cursor-pointer"
                    onClick={() => openPreviewModal("profile")}
                  />
                  <div
                    className={`absolute inset-0 flex items-center justify-center rounded-full bg-black/60 transition-all duration-300 cursor-pointer ${
                      showProfileEditIcon ? "opacity-100" : "opacity-0"
                    }`}
                    onClick={() => openPreviewModal("profile")}
                  >
                    {isUploading && uploadType === "profile"
                      ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                      : <FiEdit3 className="text-2xl text-white" />}
                  </div>
                </>
              ) : (
                <div
                  onClick={() => triggerImageUpload("profile")}
                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full border-2 border-dashed border-blue-500/50 flex items-center justify-center bg-gray-800/50 cursor-pointer hover:bg-gray-800/70 transition-colors relative"
                >
                  {isUploading && uploadType === "profile"
                    ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                    : (
                      <>
                        <IoAddCircleOutline className="text-2xl text-white/60" />
                        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30 opacity-0 hover:opacity-100 transition-opacity duration-300">
                          <FiEdit3 className="text-xl text-white" />
                        </div>
                      </>
                    )}
                </div>
              )}
            </div>

            {/* Name + subscription + collaborators */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="text-xs sm:text-sm font-medium">artist</span>
                <img src="/Verified.svg" alt="verified badge" className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">
                {artistProfile?.name || "Artist Name"}
              </h1>

              <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                <span className="text-base text-blue-500 font-bold sm:text-xl">
                  {calculateSubscriptionFees()}
                </span>

                {/* ── Collaborators avatar stack ── */}
                {workspaceId && (
                  <>
                    <span className="w-px h-4 bg-white/20 hidden sm:block" />

                    {membersLoading ? (
                      <div className="flex items-center gap-1.5">
                        <div className="flex -space-x-2">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="w-7 h-7 rounded-full bg-gray-600/70 animate-pulse border-2 border-gray-900" />
                          ))}
                        </div>
                        <span className="text-xs text-white/40 animate-pulse">Loading...</span>
                      </div>
                    ) : collaborators.length > 0 ? (
                      <AvatarStack
                        members={collaborators}
                        onClick={() => setShowMembersPanel(true)}
                      />
                    ) : (
                      // "No collaborators yet" — sirf manageTeam wale ko clickable dikhega
                      canManageTeam ? (
                        <button
                          onClick={() => setShowInviteModal(true)}
                          className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 transition-colors"
                        >
                          <HiUsers className="text-sm" />
                          <span>No collaborators yet</span>
                        </button>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs text-white/40">
                          <HiUsers className="text-sm" />
                          <span>No collaborators yet</span>
                        </span>
                      )
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ── Right — Invite + Logout ── */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">

            {/* ✅ Invite button — only for owner / manageTeam */}
            {canManageTeam && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="border border-white/30 hover:bg-white/10 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-full font-medium transition-all flex items-center gap-1.5 sm:gap-2 text-sm w-full sm:w-auto justify-center"
              >
                <HiUserAdd className="text-base flex-shrink-0" />
                <span>Invite collaborator</span>
              </button>
            )}

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

      {/* ── Image Preview Modal ── */}
      {showImagePreviewModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-md w-full overflow-hidden border border-gray-700">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                {isEditingImage ? "Preview New " : ""}
                {selectedImageType === "profile" ? "Profile" : "Cover"} Image
              </h3>
              <button
                onClick={closePreviewModal}
                disabled={isCompressing}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4">
              <div className="relative w-full h-64 bg-gray-800 rounded-lg overflow-hidden">
                {previewUrl
                  ? <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                  : <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>}
                {isCompressing && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
                      <p className="text-white">Processing image...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-gray-800 flex justify-between gap-3">
              {isEditingImage ? (
                <>
                  <button
                    onClick={() => {
                      setIsEditingImage(false);
                      const key = selectedImageType === "profile" ? "profileImage" : "coverImage";
                      setPreviewUrl(artistProfile?.[key] ? getS3Url(artistProfile[key]) : null);
                      setSelectedImageFile(null);
                    }}
                    disabled={isCompressing}
                    className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCompressAndUpload}
                    disabled={isCompressing}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCompressing
                      ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Processing...</>
                      : "Update Image"}
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

      {/* ── Collaborators Panel ── */}
      {showMembersPanel && (
        <CollaboratorsPanel
          members={members}
          isLoading={membersLoading}
          workspaceId={workspaceId}
          onClose={() => setShowMembersPanel(false)}
          onInvite={() => {
            setShowMembersPanel(false);
            setShowInviteModal(true);
          }}
        />
      )}

      {/* ── Invite Modal — only renders if canManageTeam ── */}
      {showInviteModal && canManageTeam && (
        <InviteCollaboratorModal onClose={() => setShowInviteModal(false)} />
      )}
    </>
  );
};

export default ProfileHeroSection;