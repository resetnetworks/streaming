import React, { useCallback, useState, useEffect } from "react";
import { MdAccessTimeFilled } from "react-icons/md";
import { BsHeart, BsHeartFill } from "react-icons/bs";
import { FiMoreHorizontal } from "react-icons/fi";
import { FaCopy } from "react-icons/fa";
import { FaXTwitter, FaFacebook, FaWhatsapp } from "react-icons/fa6";
import { BsShare } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { toggleLikeSong } from "../../features/auth/authSlice";
import { selectLikedSongIds } from "../../features/auth/authSelectors";
import { toast } from "sonner";
import debounce from "lodash.debounce";

const handleFeatureSoon = () => {
  toast.success("This feature will be available soon");
};

const SongList = ({
  img,
  songName,
  singerName,
  seekTime,
  isSelected,
  onTitleClick,
  onPlay,
  songId,
  songSlug,
  shareUrl,
  // ✅ NEW PROPS for parent-controlled share dropdown
  isShareDropdownOpen,
  onShareDropdownToggle,
  onShareMenuClose,
}) => {
  const dispatch = useDispatch();
  const shareMenuRef = React.useRef(null);
  
  // Local state for backward compatibility
  const [localShowShareMenu, setLocalShowShareMenu] = useState(false);
  
  // Use parent-controlled state if provided, otherwise use local state
  const showShareMenu = isShareDropdownOpen !== undefined 
    ? isShareDropdownOpen 
    : localShowShareMenu;

  // ✅ Get the liked song IDs just once
  const likedSongIds = useSelector(selectLikedSongIds);
  const isLiked = likedSongIds.includes(songId);

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target)) {
        handleCloseShareMenu();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onShareMenuClose]);

  const handleClick = (e) => {
    if (!e.target.closest(".action-button") && !e.target.closest(".share-menu")) {
      onPlay();
    }
  };

  // ✅ ADD TITLE CLICK HANDLER
  const handleTitleClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (onTitleClick) {
      onTitleClick();
    }
  };

  // ✅ SHARE MENU HANDLERS
  const handleShareMenuToggle = (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (onShareDropdownToggle) {
      // Parent component को notify करें
      onShareDropdownToggle();
    } else {
      // Local state का उपयोग करें (backward compatibility)
      setLocalShowShareMenu(!localShowShareMenu);
    }
  };

  const handleCloseShareMenu = () => {
    if (onShareMenuClose) {
      onShareMenuClose();
    } else {
      setLocalShowShareMenu(false);
    }
  };

  // ✅ SHARE ACTIONS
  const handleCopyUrl = async () => {
    const url = shareUrl || `${window.location.origin}/song/${songSlug || songId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
      handleCloseShareMenu();
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleShare = (platform) => {
    const url = shareUrl || `${window.location.origin}/song/${songSlug || songId}`;
    const shareText = `Listen to "${songName}" by ${singerName} on Reset Music`;

    switch (platform) {
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`,
          '_blank'
        );
        break;
      case 'facebook':
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          '_blank'
        );
        break;
      case 'whatsapp':
        window.open(
          `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + url)}`,
          '_blank'
        );
        break;
      default:
        if (navigator.share) {
          navigator.share({
            title: songName,
            text: shareText,
            url: url,
          });
        } else {
          handleCopyUrl();
        }
    }
    handleCloseShareMenu();
  };

  // ✅ LIKE HANDLER
  const debouncedLikeToggle = useCallback(
    debounce(async (songId, wasLiked) => {
      try {
        const resultAction = await dispatch(toggleLikeSong(songId));
        if (toggleLikeSong.fulfilled.match(resultAction)) {
          toast.success(
            wasLiked ? "Removed from Liked Songs" : "Added to Liked Songs"
          );
        } else if (toggleLikeSong.rejected.match(resultAction)) {
          toast.error(resultAction.payload || "Failed to update like");
        }
      } catch (err) {
        toast.error("Something went wrong");
      }
    }, 500),
    [dispatch]
  );

  const handleToggleLike = (e) => {
    e.stopPropagation();
    e.preventDefault();
    debouncedLikeToggle(songId, isLiked);
  };

  return (
    <div
      className={`flex w-full justify-between p-2 cursor-pointer relative ${
        isSelected ? "border-b border-blue-500" : "border-b border-gray-600"
      }`}
      onClick={handleClick}
    >
      <div className="flex items-center">
        <img
          src={img}
          alt=""
          className={`w-10 h-10 rounded-lg object-cover ${
            isSelected ? "shadow-[0_0_5px_1px_#3b82f6]" : ""
          }`}
        />
        <div className="mx-4 max-w-[160px] md:max-w-[300px] lg:max-w-[400px] xl:max-w-[500px]">
          {/* ✅ MAKE SONG TITLE CLICKABLE */}
          <button
            onClick={handleTitleClick}
            className="text-left w-full"
          >
            <h3 className="text-white text-lg leading-none sm:truncate">
              <span className="block sm:hidden hover:underline">
                {songName.length > 12 ? songName.slice(0, 7) + "..." : songName}
              </span>
              <span className="hidden sm:block hover:underline">{songName}</span>
            </h3>
          </button>
        </div>
      </div>

      <div className="flex gap-6 ml-4 items-center">
        <div className="flex items-center">
          <MdAccessTimeFilled
            className={`text-base ${
              isSelected ? "text-blue-700" : "text-gray-500"
            }`}
          />
          <span className="ml-2">{seekTime}</span>
        </div>

        <button
          type="button"
          className="action-button"
          onClick={handleToggleLike}
        >
          {isLiked ? (
            <BsHeartFill className="text-red-600 text-md" />
          ) : (
            <BsHeart className="text-white text-md hover:text-red-700" />
          )}
        </button>

        {/* ✅ SHARE DROPDOWN */}
        <div className="relative share-menu" ref={shareMenuRef}>
          <button
            className="action-button"
            onClick={handleShareMenuToggle}
          >
            <FiMoreHorizontal
              className={`text-lg hover:cursor-pointer ${
                showShareMenu ? "text-blue-400" : "text-white"
              }`}
            />
          </button>

          {showShareMenu && (
            <div className="absolute right-0 top-full mt-1 bg-gradient-to-tr from-blue-950 to-black rounded-xl border border-gray-700 py-2 min-w-[160px] z-50 shadow-2xl">
              <div className="px-3 py-1.5 border-b border-gray-700">
                <p className="text-xs font-semibold text-gray-300">Share</p>
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyUrl();
                }}
                className="w-full px-3 py-2 flex items-center gap-2 hover:bg-blue-800/50 transition-colors text-sm"
              >
                <FaCopy className="w-3 h-3 text-blue-400" />
                <span>Copy Link</span>
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare('twitter');
                }}
                className="w-full px-3 py-2 flex items-center gap-2 hover:bg-blue-800/50 transition-colors text-sm"
              >
                <FaXTwitter className="w-3 h-3 text-gray-300" />
                <span>Twitter</span>
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare('facebook');
                }}
                className="w-full px-3 py-2 flex items-center gap-2 hover:bg-blue-800/50 transition-colors text-sm"
              >
                <FaFacebook className="w-3 h-3 text-blue-600" />
                <span>Facebook</span>
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare('whatsapp');
                }}
                className="w-full px-3 py-2 flex items-center gap-2 hover:bg-blue-800/50 transition-colors text-sm"
              >
                <FaWhatsapp className="w-3 h-3 text-green-500" />
                <span>WhatsApp</span>
              </button>
            
              {navigator.share && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShare('native');
                  }}
                  className="w-full px-3 py-2 flex items-center gap-2 hover:bg-blue-800/50 transition-colors text-sm border-t border-gray-700 mt-1"
                >
                  <BsShare className="w-3 h-3 text-purple-400" />
                  <span>Share via...</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SongList;