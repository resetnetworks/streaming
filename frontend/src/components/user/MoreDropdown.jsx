import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { 
  FaPlay, 
  FaPlus, 
  FaList, 
  FaUser, 
  FaFlag,
  FaChevronRight,
  FaCopyright,
  FaExclamationTriangle,
  FaInfoCircle
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

// Redux imports
import { 
  addToQueue, 
  playNext,
  setSelectedSong 
} from "../../features/playback/playerSlice";

const MoreDropdown = ({ 
  song,
  isOpen,
  onClose,
  className = ""
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showReportSubmenu, setShowReportSubmenu] = React.useState(false);

  // Animation variants
  const dropdownVariants = {
    hidden: {
      opacity: 0,
      y: -8,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.2,
        ease: "easeOut",
      }
    },
    exit: {
      opacity: 0,
      y: -8,
      scale: 0.95,
      transition: {
        duration: 0.15,
        ease: "easeIn",
      }
    }
  };

  const submenuVariants = {
    hidden: {
      opacity: 0,
      x: -10,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.2,
      }
    },
    exit: {
      opacity: 0,
      x: -10,
      transition: {
        duration: 0.15,
      }
    }
  };

  const handlePlayNext = () => {
    if (song) {
      dispatch(playNext(song));
      toast.success(`"${song.title}" added to play next`);
      onClose();
    }
  };

  const handleAddToQueue = () => {
    if (song) {
      dispatch(addToQueue(song));
      toast.success(`"${song.title}" added to queue`);
      onClose();
    }
  };

  const handleGoToArtist = () => {
    if (song?.artist?.slug) {
      navigate(`/artist/${song.artist.slug}`);
      onClose();
    } else if (song?.artist?._id) {
      navigate(`/artist/${song.artist._id}`);
      onClose();
    }
  };

  const handleReport = (type) => {
    // Implement report functionality
    const reportTypes = {
      copyright: "Copyright infringement",
      quality: "Poor audio quality",
      metadata: "Incorrect metadata"
    };
    
    toast.info(`Reported for ${reportTypes[type]}`);
    setShowReportSubmenu(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={dropdownVariants}
          className={`absolute left-0 top-full mt-2 bg-gradient-to-tr from-gray-900 to-black rounded-xl border border-gray-700 py-2 min-w-[220px] z-50 shadow-2xl ${className}`}
        >
          {!showReportSubmenu ? (
            <>
              <div className="px-4 py-2 border-b border-gray-700">
                <p className="text-sm font-semibold text-gray-300">More Options</p>
              </div>
              
              <button
                onClick={handlePlayNext}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FaPlay className="w-4 h-4 text-green-400" />
                  <span className="text-sm">Play Next</span>
                </div>
              </button>
              
              <button
                onClick={handleAddToQueue}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FaPlus className="w-4 h-4 text-blue-400" />
                  <span className="text-sm">Add to Queue</span>
                </div>
              </button>
              
              <button
                onClick={handleGoToArtist}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FaUser className="w-4 h-4 text-purple-400" />
                  <span className="text-sm">Artist Profile</span>
                </div>
              </button>
              
              <button
                onClick={() => setShowReportSubmenu(true)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-800/50 transition-colors border-t border-gray-700 mt-1"
              >
                <div className="flex items-center gap-3">
                  <FaFlag className="w-4 h-4 text-red-400" />
                  <span className="text-sm">Report Track</span>
                </div>
                <FaChevronRight className="w-3 h-3 text-gray-400" />
              </button>
            </>
          ) : (
            <>
              <div className="px-4 py-2 border-b border-gray-700 flex items-center">
                <button
                  onClick={() => setShowReportSubmenu(false)}
                  className="mr-2 p-1 hover:bg-gray-800 rounded"
                >
                  <FaChevronRight className="w-3 h-3 text-gray-400 rotate-180" />
                </button>
                <p className="text-sm font-semibold text-gray-300">Report Issue</p>
              </div>
              
              <button
                onClick={() => handleReport('copyright')}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-800/50 transition-colors"
              >
                <FaCopyright className="w-4 h-4 text-yellow-400" />
                <div className="text-left">
                  <span className="text-sm block">Copyright</span>
                  <span className="text-xs text-gray-400">Infringement issue</span>
                </div>
              </button>
              
              <button
                onClick={() => handleReport('quality')}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-800/50 transition-colors"
              >
                <FaExclamationTriangle className="w-4 h-4 text-orange-400" />
                <div className="text-left">
                  <span className="text-sm block">Poor Quality</span>
                  <span className="text-xs text-gray-400">Audio quality issue</span>
                </div>
              </button>
              
              <button
                onClick={() => handleReport('metadata')}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-800/50 transition-colors border-t border-gray-700 mt-1"
              >
                <FaInfoCircle className="w-4 h-4 text-cyan-400" />
                <div className="text-left">
                  <span className="text-sm block">Wrong Metadata</span>
                  <span className="text-xs text-gray-400">Incorrect information</span>
                </div>
              </button>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MoreDropdown;