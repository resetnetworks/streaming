// src/components/artist/referrals/ReferralCodeCard.jsx
import React, { useState } from "react";
import { useMyReferralCode } from "../../../hooks/api/useReferrals";
import {
  MdContentCopy,
  MdCheck,
  MdCardGiftcard,
  MdRefresh,
  MdShare,
  MdInfoOutline
} from "react-icons/md";
import { FaWhatsapp, FaTwitter, FaEnvelope } from "react-icons/fa";
import { toast } from "sonner";

const ReferralCodeCard = () => {
  const { data, isLoading, isError, error, refetch, isFetching } = useMyReferralCode();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const referralCode = data?.referralCode || "";
  const referralLink =
    data?.referralLink ||
    (referralCode ? `${window.location.origin}/artist/register/apply?ref=${referralCode}` : "");

  const handleCopyCode = async () => {
    if (!referralCode) return;
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopiedCode(true);
      toast.success("Referral code copied to clipboard!");
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      toast.error("Failed to copy code");
    }
  };

  const handleCopyLink = async () => {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopiedLink(true);
      toast.success("Referral link copied to clipboard!");
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const shareText = `Join me on Reset Music! Register as an artist with my referral code ${referralCode} and share your sound with the world: ${referralLink}`;

  // const handleShareWhatsApp = () => {
  //   const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
  //   window.open(url, "_blank", "noopener,noreferrer");
  // };

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleShareEmail = () => {
    const subject = "Invitation to Join Reset Music as an Artist";
    const body = `Hey,\n\nI invite you to join Reset Music using my referral link:\n${referralLink}\n\nOr use my referral code: ${referralCode}\n\nOnce approved and after uploading your first music, you'll be part of the creator collective!`;
    const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join Reset Music as an Artist",
          text: shareText,
          url: referralLink,
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Native share error:", err);
        }
      }
    } else {
      handleCopyLink();
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-900/90 to-black border border-gray-800 shadow-xl animate-pulse">
        <div className="h-6 w-48 bg-gray-800 rounded mb-4" />
        <div className="h-4 w-72 bg-gray-800/60 rounded mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-14 bg-gray-800/40 rounded-xl" />
          <div className="h-14 bg-gray-800/40 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 rounded-2xl bg-gradient-to-br from-red-950/20 to-black border border-red-900/40 text-center">
        <p className="text-red-400 font-medium mb-3">
          {error?.response?.data?.message || "Failed to load referral code."}
        </p>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-900/40 hover:bg-red-800/60 text-red-200 rounded-lg text-sm transition-colors border border-red-700/50"
        >
          <MdRefresh className={isFetching ? "animate-spin" : ""} />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div
      className="p-6 md:p-8 rounded-2xl border text-white relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(13, 27, 63, 0.95) 0%, rgba(10, 10, 35, 0.95) 100%)",
        borderColor: "rgba(59, 130, 246, 0.2)",
        boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
      }}
    >
      {/* Decorative gradient glow */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400">
              <MdCardGiftcard className="w-5 h-5" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              My Referral Code & Link
            </h2>
          </div>
          <p className="text-slate-400 text-sm">
            Invite fellow artists to Reset Music. Earn <span className="text-green-400 font-semibold">$10</span> for every 3 qualified artists who join and release music.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          title="Refresh code"
          className="self-start md:self-auto flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-slate-300 transition-colors"
        >
          <MdRefresh className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Code and Link Boxes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6 relative z-10">
        {/* Referral Code Box */}
        <div className="lg:col-span-5 p-4 bg-slate-950/60 rounded-xl border border-blue-500/20 flex flex-col justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-2">
            Your Unique Code
          </span>
          <div className="flex items-center justify-between gap-3">
            <span className="text-2xl font-mono font-extrabold tracking-wider bg-gradient-to-r from-blue-300 via-blue-400 to-indigo-300 bg-clip-text text-transparent select-all">
              {referralCode || "—"}
            </span>
            <button
              onClick={handleCopyCode}
              disabled={!referralCode}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-semibold transition-all active:scale-95 cursor-pointer"
            >
              {copiedCode ? (
                <>
                  <MdCheck className="w-4 h-4 text-green-400" />
                  <span className="text-green-400">Copied</span>
                </>
              ) : (
                <>
                  <MdContentCopy className="w-4 h-4" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Shareable Link Box */}
        <div className="lg:col-span-7 p-4 bg-slate-950/60 rounded-xl border border-blue-500/20 flex flex-col justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-2">
            Shareable Referral Link
          </span>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-black/40 border border-slate-800 rounded-lg px-3 py-2 overflow-hidden text-ellipsis whitespace-nowrap text-xs font-mono text-slate-300 select-all">
              {referralLink || "—"}
            </div>
            <button
              onClick={handleCopyLink}
              disabled={!referralLink}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-all active:scale-95 shadow-lg shadow-blue-600/20 cursor-pointer flex-shrink-0"
            >
              {copiedLink ? (
                <>
                  <MdCheck className="w-4 h-4 text-white" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <MdContentCopy className="w-4 h-4" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Social Share & Quick Action Bar */}
      <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400 mr-1">
            Quick Share:
          </span>
          {/* <button
            onClick={handleShareWhatsApp}
            title="Share via WhatsApp"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30 rounded-lg text-xs font-medium transition-all active:scale-95 cursor-pointer"
          >
            <FaWhatsapp className="w-4 h-4" />
            <span>WhatsApp</span>
          </button> */}

          <button
            onClick={handleShareTwitter}
            title="Share on Twitter / X"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-lg text-xs font-medium transition-all active:scale-95 cursor-pointer"
          >
            <FaTwitter className="w-4 h-4" />
            <span>Twitter / X</span>
          </button>

          <button
            onClick={handleShareEmail}
            title="Share via Email"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/70 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-all active:scale-95 cursor-pointer"
          >
            <FaEnvelope className="w-3.5 h-3.5" />
            <span>Email</span>
          </button>

          {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
            <button
              onClick={handleNativeShare}
              title="More Share Options"
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800/50 hover:bg-slate-700 text-slate-300 border border-slate-700/60 rounded-lg text-xs font-medium transition-all cursor-pointer"
            >
              <MdShare className="w-3.5 h-3.5" />
              <span>More</span>
            </button>
          )}
        </div>

        {/* Milestone info hint */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <MdInfoOutline className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <span>Code is permanently bound to your artist account.</span>
        </div>
      </div>
    </div>
  );
};

export default ReferralCodeCard;
