// src/components/artist/referrals/ReferralCodeCard.jsx
import React, { useState } from "react";
import { useMyReferralCode } from "../../../hooks/api/useReferrals";
import {
  LuCopy,
  LuCheck,
  LuRefreshCw,
  LuShare2,
} from "react-icons/lu";
import { FaTwitter, FaEnvelope } from "react-icons/fa";
import { toast } from "sonner";

// Inner 3D panel style for main containers (matches Analytics & Revenue Dashboards)
const innerPanel3dStyle = {
  background: "radial-gradient(ellipse at 50% 0%, #151e32 0%, #090e1a 100%)",
  boxShadow:
    "inset 0 3px 8px rgba(0, 0, 0, 0.75), inset 0 1px 2px rgba(0, 0, 0, 0.9), inset 0 -1px 1px rgba(255, 255, 255, 0.05)",
};

// Reusable 3D sunken well style (matches CardStat & Revenue)
const sunkenCardStyle = {
  background: "radial-gradient(ellipse at 50% 0%, #0d1527 0%, #050811 100%)",
  border: "1px solid rgba(0, 0, 0, 0.95)",
  boxShadow:
    "inset 0 4px 8px rgba(0, 0, 0, 0.9), inset 0 1px 3px rgba(0, 0, 0, 0.95), inset 0 -1px 1px rgba(255, 255, 255, 0.08), 0 1px 0 rgba(255, 255, 255, 0.05)",
};

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
      toast.success("Referral code copied!");
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
      toast.success("Referral link copied!");
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const shareText = `Join me on Reset Music! Register as an artist with my referral code ${referralCode} and share your sound: ${referralLink}`;

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleShareEmail = () => {
    const subject = "Invitation to Join Reset Music as an Artist";
    const body = `Hey,\n\nI invite you to join Reset Music using my referral link:\n${referralLink}\n\nOr use my referral code: ${referralCode}\n\nOnce approved and after releasing your first music, you'll be part of the creator collective!`;
    const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
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
      <div className="rounded-2xl p-[1px] bg-gradient-to-b from-white/10 via-white/5 to-transparent shadow-md">
        <div className="h-44 rounded-2xl p-6 animate-pulse" style={innerPanel3dStyle} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl p-[1px] bg-gradient-to-b from-white/10 via-white/5 to-transparent shadow-md">
        <div className="rounded-2xl p-6 text-center" style={innerPanel3dStyle}>
          <p className="text-rose-400 text-sm font-medium mb-3">
            {error?.response?.data?.message || "Failed to load referral code."}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs transition-colors cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-[1px] bg-gradient-to-b from-white/10 via-white/5 to-transparent shadow-md">
      <div
        className="rounded-2xl p-5 md:p-6 relative overflow-hidden"
        style={innerPanel3dStyle}
      >
        {/* Header Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Referral Program
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Earn $10 for every 3 artists who join and release their first track
            </p>
          </div>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all duration-200 cursor-pointer active:scale-95"
            style={{
              background: "#060911",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow:
                "inset 0 2px 4px rgba(0, 0, 0, 0.8), 0 1px 0 rgba(255, 255, 255, 0.05)",
            }}
            title="Refresh code"
          >
            <LuRefreshCw
              className={`w-3.5 h-3.5 text-[#38bdf8] transition-transform ${
                isFetching ? "animate-spin" : ""
              }`}
            />
            <span>{isFetching ? "Syncing..." : "Refresh"}</span>
          </button>
        </div>

        {/* Code and Link Boxes */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
          {/* Referral Code Box */}
          <div className="lg:col-span-5 rounded-xl p-4 flex flex-col justify-between" style={sunkenCardStyle}>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Your Referral Code
            </span>
            <div className="flex items-center justify-between gap-3">
              <span className="text-2xl font-black tracking-wider text-[#38bdf8] select-all">
                {referralCode || "—"}
              </span>
              <button
                onClick={handleCopyCode}
                disabled={!referralCode}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer active:scale-95 shadow-md"
                style={{
                  background: "linear-gradient(45deg, #0F3272 0%, #1A5DB4 60%, #3380FF 100%)",
                  color: "white",
                }}
              >
                {copiedCode ? (
                  <>
                    <LuCheck className="w-3.5 h-3.5" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <LuCopy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Shareable Link Box */}
          <div className="lg:col-span-7 rounded-xl p-4 flex flex-col justify-between" style={sunkenCardStyle}>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Shareable Referral Link
            </span>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-[#050811] border border-white/10 rounded-xl px-3.5 py-2 overflow-hidden text-ellipsis whitespace-nowrap text-xs text-slate-300 select-all font-sans">
                {referralLink || "—"}
              </div>
              <button
                onClick={handleCopyLink}
                disabled={!referralLink}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer active:scale-95 flex-shrink-0 shadow-md"
                style={{
                  background: "linear-gradient(45deg, #0F3272 0%, #1A5DB4 60%, #3380FF 100%)",
                  color: "white",
                }}
              >
                {copiedLink ? (
                  <>
                    <LuCheck className="w-3.5 h-3.5" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <LuCopy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Minimal Quick Share Bar */}
        <div className="pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
              Share:
            </span>
            <button
              onClick={handleShareTwitter}
              title="Share on X / Twitter"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer text-xs"
            >
              <FaTwitter className="w-3 h-3" />
              <span>X / Twitter</span>
            </button>

            <button
              onClick={handleShareEmail}
              title="Share via Email"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer text-xs"
            >
              <FaEnvelope className="w-3 h-3" />
              <span>Email</span>
            </button>

            {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
              <button
                onClick={handleNativeShare}
                title="Share Options"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer text-xs"
              >
                <LuShare2 className="w-3 h-3 text-[#38bdf8]" />
                <span>Share</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralCodeCard;
