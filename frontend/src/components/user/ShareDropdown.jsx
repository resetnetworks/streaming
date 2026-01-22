import React from "react";
import { 
  FaCopy, 
  FaFacebook, 
  FaWhatsapp, 
  FaTelegram,
} from "react-icons/fa";
import { BsShare } from "react-icons/bs";
import { FaXTwitter } from "react-icons/fa6";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const ShareDropdown = ({ 
  url, 
  title, 
  text, 
  isOpen, 
  onClose, 
  className = "" 
}) => {
  const handleShare = async (platform) => {
    const shareUrl = url || window.location.href;
    const shareText = text || `Check this out: ${title}`;
    const fullText = `${shareText} ${shareUrl}`;

    try {
      switch (platform) {
        case 'copy':
          await navigator.clipboard.writeText(shareUrl);
          toast.success('Link copied to clipboard!');
          break;
        case 'twitter':
          window.open(
            `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, 
            '_blank'
          );
          break;
        case 'facebook':
          window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, 
            '_blank'
          );
          break;
        case 'whatsapp':
          window.open(
            `https://wa.me/?text=${encodeURIComponent(fullText)}`, 
            '_blank'
          );
          break;
        default:
          if (navigator.share) {
            await navigator.share({
              title: title,
              text: shareText,
              url: shareUrl,
            });
          } else {
            await navigator.clipboard.writeText(shareUrl);
            toast.success('Link copied to clipboard!');
          }
      }
    } catch (error) {
      console.error('Share failed:', error);
    } finally {
      onClose();
    }
  };

  // Dropdown animation variants
  const dropdownVariants = {
    hidden: {
      opacity: 0,
      y: -10,
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
      y: -10,
      scale: 0.95,
      transition: {
        duration: 0.15,
        ease: "easeIn",
      }
    }
  };

  // Button hover animation variants
  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.02 },
    tap: { scale: 0.98 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={dropdownVariants}
          className={`absolute left-0 top-full mt-2 bg-gradient-to-tr from-blue-950 to-black rounded-xl border border-gray-700 py-2 min-w-[200px] z-50 shadow-2xl ${className}`}
        >
          <div className="px-4 py-2 border-b border-gray-700">
            <p className="text-sm font-semibold text-gray-300">Share</p>
          </div>
          
          <motion.button
            variants={buttonVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            onClick={() => handleShare('copy')}
            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-blue-800/50 transition-colors"
          >
            <FaCopy className="w-4 h-4 text-blue-400" />
            <span className="text-sm">Copy Link</span>
          </motion.button>
          
          <motion.button
            variants={buttonVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            onClick={() => handleShare('twitter')}
            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-blue-800/50 transition-colors"
          >
            <FaXTwitter className="w-4 h-4 text-gray-300" />
            <span className="text-sm">Twitter</span>
          </motion.button>
          
          <motion.button
            variants={buttonVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            onClick={() => handleShare('facebook')}
            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-blue-800/50 transition-colors"
          >
            <FaFacebook className="w-4 h-4 text-blue-600" />
            <span className="text-sm">Facebook</span>
          </motion.button>
          
          <motion.button
            variants={buttonVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            onClick={() => handleShare('whatsapp')}
            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-blue-800/50 transition-colors"
          >
            <FaWhatsapp className="w-4 h-4 text-green-500" />
            <span className="text-sm">WhatsApp</span>
          </motion.button>
        
          {navigator.share && (
            <motion.button
              variants={buttonVariants}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
              onClick={() => handleShare('native')}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-blue-800/50 transition-colors border-t border-gray-700 mt-1"
            >
              <BsShare className="w-4 h-4 text-purple-400" />
              <span className="text-sm">Share via...</span>
            </motion.button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShareDropdown;