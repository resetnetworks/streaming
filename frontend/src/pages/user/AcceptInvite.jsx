import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAcceptWorkspaceInvite } from "../../hooks/api/useWorkspace";
import { selectIsAuthenticated } from "../../features/auth/authSelectors";
import { FaCheckCircle, FaExclamationCircle, FaUserPlus, FaSpinner } from "react-icons/fa";
import PageSEO from "../../components/PageSeo/PageSEO";

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { mutate: acceptInvite, isPending, isSuccess, error } = useAcceptWorkspaceInvite();
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // If not authenticated, save the token and prompt user to login
    if (!isAuthenticated && token) {
      localStorage.setItem("pendingInviteToken", token);
    }
  }, [isAuthenticated, token]);

  const handleAccept = () => {
    if (!token) {
      setErrorMessage("No token provided in the invitation link.");
      return;
    }
    acceptInvite(
      { token },
      {
        onSuccess: () => {
          setTimeout(() => {
            navigate("/home");
          }, 3000);
        },
        onError: (err) => {
          const msg = err?.response?.data?.message || err?.message || "Invalid or expired invitation token.";
          setErrorMessage(msg);
        },
      }
    );
  };

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  const handleRegisterRedirect = () => {
    navigate("/register");
  };

  // Error boundary checks
  const displayError = errorMessage || (error ? (error.response?.data?.message || error.message) : "");

  return (
    <>
      <PageSEO
        title="Accept Workspace Invitation - Reset Music"
        description="Accept your invitation to collaborate as a team member on Reset Music Streaming Platform."
        noIndex={true}
      />
      <div 
        className="min-h-screen flex items-center justify-center bg-[#020216] px-4 font-jura"
        style={{ fontFamily: "'Jura', sans-serif" }}
      >
        <div className="max-w-md w-full bg-[#0A0A23] bg-opacity-80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
          {/* Accent Glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#3380FF] opacity-10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#4DB3FF] opacity-10 rounded-full blur-3xl pointer-events-none"></div>

          {!token ? (
            <div className="py-6">
              <FaExclamationCircle className="text-5xl text-red-500 mx-auto mb-4 animate-pulse" />
              <h2 className="text-2xl font-bold text-white mb-2">Invalid Invite</h2>
              <p className="text-gray-400 mb-6">This invitation link is missing a security token or is malformed.</p>
              <button
                onClick={() => navigate("/")}
                className="px-6 py-2 bg-gradient-to-r from-[#0F3272] via-[#1A5DB4] to-[#3380FF] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Go to Homepage
              </button>
            </div>
          ) : !isAuthenticated ? (
            <div className="py-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#4DB3FF]/10 border border-[#4DB3FF]/20 mb-4">
                <FaUserPlus className="text-2xl text-[#4DB3FF]" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">You've Been Invited!</h2>
              <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                Someone has invited you to collaborate on their Reset Music workspace. Please log in or create an account to accept the invitation and start collaborating.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={handleLoginRedirect}
                  className="w-full py-3 bg-gradient-to-r from-[#0F3272] via-[#1A5DB4] to-[#3380FF] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity border border-white/10 cursor-pointer"
                >
                  Log In
                </button>
                <button
                  onClick={handleRegisterRedirect}
                  className="w-full py-3 bg-[#0A0A23] text-[#4DB3FF] border border-[#4DB3FF]/30 rounded-xl font-semibold hover:bg-[#4DB3FF]/5 transition-colors cursor-pointer"
                >
                  Create New Account
                </button>
              </div>
            </div>
          ) : isSuccess ? (
            <div className="py-6">
              <FaCheckCircle className="text-5xl text-green-400 mx-auto mb-4 animate-bounce" />
              <h2 className="text-2xl font-bold text-white mb-2">Welcome Aboard!</h2>
              <p className="text-gray-400 mb-6 text-sm">
                You have successfully accepted the workspace invitation. Redirecting you to the homepage...
              </p>
              <div className="flex justify-center">
                <FaSpinner className="animate-spin text-2xl text-[#4DB3FF]" />
              </div>
            </div>
          ) : displayError ? (
            <div className="py-6">
              <FaExclamationCircle className="text-5xl text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Invitation Failed</h2>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                {displayError}
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => setErrorMessage("")}
                  className="w-full py-2 bg-[#4DB3FF]/10 border border-[#4DB3FF]/20 text-[#4DB3FF] rounded-lg text-sm hover:bg-[#4DB3FF]/20 transition-all cursor-pointer"
                >
                  Try Again
                </button>
                <button
                  onClick={() => navigate("/home")}
                  className="w-full py-2 text-gray-400 text-sm hover:text-white transition-colors cursor-pointer"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          ) : (
            <div className="py-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#4DB3FF]/10 border border-[#4DB3FF]/20 mb-4 animate-pulse">
                <FaUserPlus className="text-2xl text-[#4DB3FF]" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Accept Invitation</h2>
              <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                You are currently logged in. Click below to accept the invitation and link this account to the workspace as a collaborator.
              </p>

              <button
                onClick={handleAccept}
                disabled={isPending}
                className="w-full py-3 bg-gradient-to-r from-[#0F3272] via-[#1A5DB4] to-[#3380FF] text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity border border-white/10 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isPending ? (
                  <>
                    <FaSpinner className="animate-spin" /> Accepting Invitation...
                  </>
                ) : (
                  "Accept Invitation"
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
