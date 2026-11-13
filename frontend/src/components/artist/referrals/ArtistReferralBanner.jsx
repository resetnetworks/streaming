// src/components/artist/referrals/ArtistReferralBanner.jsx
import React, { useState } from "react";
import { useMyReferralCode } from "../../../hooks/api/useReferrals";
import { LuGift, LuCopy, LuCheck, LuArrowRight } from "react-icons/lu";
import { toast } from "sonner";

export default function ArtistReferralBanner({ onNavigate }) {
  const { data: referralData } = useMyReferralCode();
  const referralCode = referralData?.referralCode || "";
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = async (e) => {
    e?.stopPropagation();
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

  return (
    <div className="w-full">
      <div className="rounded-2xl p-[1px] bg-gradient-to-b from-white/10 via-white/5 to-transparent shadow-md">
        <div
          className="rounded-2xl p-3 sm:px-5 sm:py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative overflow-hidden"
          style={{
            background: "radial-gradient(ellipse at 50% 0%, #151e32 0%, #090e1a 100%)",
            boxShadow:
              "inset 0 3px 8px rgba(0, 0, 0, 0.75), inset 0 1px 2px rgba(0, 0, 0, 0.9), inset 0 -1px 1px rgba(255, 255, 255, 0.05)",
          }}
        >
          {/* Left Info */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#0459FE]/15 border border-[#0459FE]/25 text-[#38bdf8] shrink-0">
              <LuGift className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-white tracking-tight">
                  Referral Program
                </span>
                <span className="text-xs font-semibold text-[#4DB3FF]">
                  Earn $10
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                Invite artists & earn $10 for every 3 who release their first track.
              </p>
            </div>
          </div>

          {/* Right Action & Code */}
          <div className="flex items-center gap-4 self-start sm:self-auto shrink-0">
            {referralCode && (
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs"
                style={{
                  background: "radial-gradient(ellipse at 50% 0%, #0d1527 0%, #050811 100%)",
                  border: "1px solid rgba(0, 0, 0, 0.95)",
                  boxShadow:
                    "inset 0 2px 4px rgba(0, 0, 0, 0.9), 0 1px 0 rgba(255, 255, 255, 0.05)",
                }}
              >
                <span className="text-slate-400 font-medium text-[11px]">Code:</span>
                <span className="font-bold text-[#38bdf8] tracking-wider select-all font-mono text-xs">
                  {referralCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="text-slate-400 hover:text-white transition-colors p-0.5 cursor-pointer"
                  title="Copy code"
                >
                  {copiedCode ? (
                    <LuCheck className="w-3.5 h-3.5 text-[#4DB3FF]" />
                  ) : (
                    <LuCopy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onNavigate}
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#38bdf8] hover:text-[#4DB3FF] hover:underline transition-colors cursor-pointer py-1"
            >
              <span>View Program</span>
              <LuArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

