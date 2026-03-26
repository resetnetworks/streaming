// src/pages/AcceptInvitePage.jsx
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAcceptInvite } from "../../hooks/api/useWorkspaces";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../features/auth//authSelectors";

const AcceptInvitePage = () => {
  const [searchParams]              = useSearchParams();
  const navigate                    = useNavigate();
  const token                       = searchParams.get("token");
  const user                        = useSelector(selectCurrentUser);

  const { mutate: acceptInvite, isPending } = useAcceptInvite();

  const [status, setStatus] = useState("idle"); // idle | success | error
  const [errorMsg, setErrorMsg] = useState("");

  // Agar user logged in nahi hai toh login pe bhejo, token preserve karke
  useEffect(() => {
    if (!user && token) {
      navigate(`/login?redirect=/accept-invite?token=${token}`);
    }
  }, [user, token, navigate]);

  // Token nahi hai URL mein
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-sm w-full text-center">
          <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <h2 className="text-white text-lg font-medium mb-2">Invalid invite link</h2>
          <p className="text-gray-400 text-sm mb-6">
            This invite link is missing or broken. Ask the artist to send a new invite.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors w-full"
          >
            Go to home
          </button>
        </div>
      </div>
    );
  }

  const handleAccept = () => {
    acceptInvite(token, {
      onSuccess: () => {
        setStatus("success");
        // 2 second baad dashboard pe bhejo
        setTimeout(() => navigate("/dashboard"), 2000);
      },
      onError: (err) => {
        setStatus("error");
        setErrorMsg(
          err?.response?.data?.message ||
          err?.message ||
          "This invite may have expired or already been used."
        );
      },
    });
  };

  // Success state
  if (status === "success") {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-sm w-full text-center">
          <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="text-white text-lg font-medium mb-2">You're in!</h2>
          <p className="text-gray-400 text-sm">
            You've successfully joined the workspace. Redirecting to dashboard...
          </p>
          <div className="mt-4 flex justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (status === "error") {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-sm w-full text-center">
          <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <line x1="15" y1="9" x2="9" y2="15" strokeWidth="2" strokeLinecap="round" />
              <line x1="9" y1="9" x2="15" y2="15" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h2 className="text-white text-lg font-medium mb-2">Invite failed</h2>
          <p className="text-gray-400 text-sm mb-6">{errorMsg}</p>
          <button
            onClick={() => navigate("/")}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors w-full"
          >
            Go to home
          </button>
        </div>
      </div>
    );
  }

  // Default — Accept screen
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-sm w-full text-center">

        {/* Icon */}
        <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-5">
          <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>

        <h2 className="text-white text-xl font-medium mb-2">
          You've been invited!
        </h2>
        <p className="text-gray-400 text-sm mb-1">
          Logged in as
        </p>
        <p className="text-white text-sm font-medium mb-6">
          {user?.email}
        </p>

        <p className="text-gray-400 text-sm mb-8">
          Accept this invite to join the workspace and start collaborating.
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleAccept}
            disabled={isPending}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Joining...
              </>
            ) : (
              "Accept invite"
            )}
          </button>

          <button
            onClick={() => navigate("/")}
            disabled={isPending}
            className="w-full py-3 border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-white text-sm rounded-xl transition-colors disabled:opacity-60"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
};

export default AcceptInvitePage;