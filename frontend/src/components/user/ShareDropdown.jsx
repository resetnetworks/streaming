import React, { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCopy,
  FaFacebook,
  FaWhatsapp,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { BsShare, BsTelegram } from "react-icons/bs";
import {
  MdAlbum,
  MdMusicNote,
  MdPerson,
  MdShare,
  MdSkipNext,
  MdQueueMusic,
  MdClose,
} from "react-icons/md";
import { toast } from "sonner";

/* ─────────────────────────────────────────────
   ShareModal — opens when "Share" is clicked
───────────────────────────────────────────── */
const ShareModal = ({ isOpen, onClose, url, songName, singerName }) => {
  const shareUrl = url || window.location.href;
  const shareText = `Listen to "${songName}" by ${singerName}`;

  const platforms = [
    {
      key: "copy",
      label: "Copy Link",
      icon: <FaCopy className="w-4 h-4" />,
      color: "text-blue-400",
      bg: "hover:bg-blue-500/20",
      action: async () => {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied!");
        onClose();
      },
    },
    {
      key: "twitter",
      label: "Twitter / X",
      icon: <FaXTwitter className="w-4 h-4" />,
      color: "text-gray-200",
      bg: "hover:bg-white/10",
      action: () => {
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
          "_blank"
        );
        onClose();
      },
    },
    {
      key: "facebook",
      label: "Facebook",
      icon: <FaFacebook className="w-4 h-4" />,
      color: "text-blue-500",
      bg: "hover:bg-blue-600/20",
      action: () => {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
          "_blank"
        );
        onClose();
      },
    },
    {
      key: "whatsapp",
      label: "WhatsApp",
      icon: <FaWhatsapp className="w-4 h-4" />,
      color: "text-green-400",
      bg: "hover:bg-green-500/20",
      action: () => {
        window.open(
          `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`,
          "_blank"
        );
        onClose();
      },
    },
    {
      key: "telegram",
      label: "Telegram",
      icon: <BsTelegram className="w-4 h-4" />,
      color: "text-sky-400",
      bg: "hover:bg-sky-500/20",
      action: () => {
        window.open(
          `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
          "_blank"
        );
        onClose();
      },
    },
    ...(navigator.share
      ? [
          {
            key: "native",
            label: "More options…",
            icon: <BsShare className="w-4 h-4" />,
            color: "text-purple-400",
            bg: "hover:bg-purple-500/20",
            action: async () => {
              await navigator.share({ title: songName, text: shareText, url: shareUrl });
              onClose();
            },
          },
        ]
      : []),
  ];

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed sm:left-1/2 left-[12%] top-[30%] -translate-x-1/2 -translate-y-1/2 z-[100000]
                       w-[90vw] max-w-xs bg-[#0b0f1a] border border-white/10
                       rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div>
                <p className="text-sm font-semibold text-white">Share</p>
                {songName && (
                  <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[180px]">
                    {songName}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
              >
                <MdClose className="w-4 h-4" />
              </button>
            </div>

            {/* Platform grid */}
            <div className="p-3 grid grid-cols-3 gap-2">
              {platforms.map((p) => (
                <button
                  key={p.key}
                  onClick={p.action}
                  className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl
                              border border-white/5 ${p.bg} transition-all duration-150
                              active:scale-95`}
                >
                  <span className={p.color}>{p.icon}</span>
                  <span className="text-[10px] text-gray-300 leading-tight text-center">
                    {p.label}
                  </span>
                </button>
              ))}
            </div>

            {/* URL bar */}
            <div className="px-3 pb-3">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10
                              rounded-xl px-3 py-2">
                <span className="text-xs text-gray-400 truncate flex-1">{shareUrl}</span>
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(shareUrl);
                    toast.success("Copied!");
                  }}
                  className="text-blue-400 hover:text-blue-300 transition-colors shrink-0"
                >
                  <FaCopy className="w-3 h-3" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

/* ─────────────────────────────────────────────
   PortalDropdown — renders the menu via portal
   so it's never clipped by any parent overflow
───────────────────────────────────────────── */
const DROPDOWN_WIDTH = 192; // w-48 = 12rem = 192px

const PortalDropdown = ({ isOpen, anchorRef, onClose, children, placement = "bottom-right" }) => {
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef(null);

  // Recalculate position whenever dropdown opens
  useEffect(() => {
    if (!isOpen || !anchorRef?.current) return;

    const rect = anchorRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const DROPDOWN_HEIGHT = 280; // approximate max height
    const GAP = 6;

    let top = rect.bottom + GAP;
    let left =
      placement === "bottom-left"
        ? rect.left
        : rect.right - DROPDOWN_WIDTH;

    // Flip up if not enough space below
    if (top + DROPDOWN_HEIGHT > viewportHeight) {
      top = rect.top - DROPDOWN_HEIGHT - GAP;
    }

    // Clamp horizontally so it never goes off-screen
    if (left + DROPDOWN_WIDTH > viewportWidth) {
      left = viewportWidth - DROPDOWN_WIDTH - 8;
    }
    if (left < 8) left = 8;

    setCoords({ top, left });
  }, [isOpen, anchorRef, placement]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        anchorRef?.current &&
        !anchorRef.current.contains(e.target)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose, anchorRef]);

  // Close on scroll so position doesn't drift
  useEffect(() => {
    if (!isOpen) return;
    const handler = () => onClose();
    window.addEventListener("scroll", handler, true);
    return () => window.removeEventListener("scroll", handler, true);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: -6, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.96 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          style={{
            position: "fixed",
            top: coords.top,
            left: coords.left,
            width: DROPDOWN_WIDTH,
            zIndex: 9999,
          }}
          className="bg-[#0b0f1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

/* ─────────────────────────────────────────────
   ShareDropdown — main reusable component

   Props:
   - isOpen: boolean
   - onClose: () => void
   - triggerRef: ref to the trigger button (NEW — required for portal positioning)
   - songName, singerName: string
   - songSlug, artistSlug, albumSlug: string
   - shareUrl: string
   - onAddToQueue: () => void
   - onPlayNext: () => void
   - isPlayerContext: boolean
   - placement: "bottom-right" | "bottom-left"
───────────────────────────────────────────── */
const ShareDropdown = ({
  isOpen,
  onClose,
  triggerRef,           // ← NEW: ref to the ⋯ button
  songName,
  singerName,
  songSlug,
  artistSlug,
  albumSlug,
  shareUrl,
  onAddToQueue,
  onPlayNext,
  isPlayerContext = false,
  placement = "bottom-right",
  navigate,
}) => {
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const handleNav = (path) => {
    if (navigate) navigate(path);
    onClose();
  };

  const menuItems = [
    {
      key: "album",
      label: "Go to Album",
      icon: <MdAlbum className="w-4 h-4" />,
      onClick: () => albumSlug && handleNav(`/album/${albumSlug}`),
      show: !!albumSlug,
    },
    {
      key: "song",
      label: "Go to Song",
      icon: <MdMusicNote className="w-4 h-4" />,
      onClick: () => songSlug && handleNav(`/song/${songSlug}`),
      show: !!songSlug,
    },
    {
      key: "artist",
      label: "Go to Artist",
      icon: <MdPerson className="w-4 h-4" />,
      onClick: () => artistSlug && handleNav(`/artist/${artistSlug}`),
      show: !!artistSlug,
    },
    {
      key: "divider1",
      divider: true,
      show: !!(albumSlug || songSlug || artistSlug),
    },
    {
      key: "share",
      label: "Share",
      icon: <MdShare className="w-4 h-4" />,
      onClick: () => setShareModalOpen(true),
      show: true,
    },
    { key: "divider2", divider: true, show: !isPlayerContext },
    {
      key: "playNext",
      label: "Play Next",
      icon: <MdSkipNext className="w-4 h-4" />,
      onClick: () => { onPlayNext?.(); onClose(); },
      show: !isPlayerContext,
    },
    {
      key: "queue",
      label: "Add to Queue",
      icon: <MdQueueMusic className="w-4 h-4" />,
      onClick: () => { onAddToQueue?.(); onClose(); },
      show: !isPlayerContext,
    },
  ];

  return (
    <>
      {/* Portal-rendered dropdown — escapes all parent overflow/clip */}
      <PortalDropdown
        isOpen={isOpen}
        anchorRef={triggerRef}
        onClose={onClose}
        placement={placement}
      >
        {menuItems
          .filter((item) => item.show)
          .map((item) =>
            item.divider ? (
              <div key={item.key} className="border-t border-white/5 my-1" />
            ) : (
              <button
                key={item.key}
                onClick={(e) => {
                  e.stopPropagation();
                  item.onClick();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5
                           text-white text-left hover:bg-gray-600 transition-colors duration-100"
              >
                {item.icon}
                <span className="text-sm text-gray-200">{item.label}</span>
              </button>
            )
          )}
      </PortalDropdown>

      {/* Share sub-modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => {
          setShareModalOpen(false);
          onClose();
        }}
        url={shareUrl}
        songName={songName}
        singerName={singerName}
        className="right-0"
      />
    </>
  );
};

export { ShareModal };
export default ShareDropdown;