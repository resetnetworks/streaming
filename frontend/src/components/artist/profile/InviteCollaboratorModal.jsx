// src/components/InviteCollaboratorModal.jsx
import { useState } from "react";
import { FiX, FiSend } from "react-icons/fi";
import { useInviteMember } from "../../../hooks/api/useWorkspaces";
import { useCurrentWorkspace } from "../../../hooks/api/useCurrentWorkspace";

const ROLE_PERMISSIONS = {
  manager: {
    uploadSong: true,
    editSong: true,
    deleteSong: true,
    viewAnalytics: true,
    viewPayments: false,
    changeSubscriptionPrice: false,
    manageTeam: true,
  },
  editor: {
    uploadSong: true,
    editSong: true,
    deleteSong: false,
    viewAnalytics: false,
    viewPayments: false,
    changeSubscriptionPrice: false,
    manageTeam: false,
  },
  analyst: {
    uploadSong: false,
    editSong: false,
    deleteSong: false,
    viewAnalytics: true,
    viewPayments: false,
    changeSubscriptionPrice: false,
    manageTeam: false,
  },
  finance: {
    uploadSong: false,
    editSong: false,
    deleteSong: false,
    viewAnalytics: false,
    viewPayments: true,
    changeSubscriptionPrice: false,
    manageTeam: false,
  },
};

const PERM_LABELS = {
  uploadSong: "Upload",
  editSong: "Edit",
  deleteSong: "Delete",
  viewAnalytics: "Analytics",
  viewPayments: "Payments",
  changeSubscriptionPrice: "Pricing",
  manageTeam: "Team",
};

const ROLES = [
  { value: "manager", label: "Manager", desc: "Upload, edit, delete & manage team" },
  { value: "editor", label: "Editor", desc: "Upload & edit songs" },
  { value: "analyst", label: "Analyst", desc: "View analytics only" },
  { value: "finance", label: "Finance", desc: "View payments only" },
];

const InviteCollaboratorModal = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("manager");
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { workspaceId, isLoading: wsLoading } = useCurrentWorkspace();
  const { mutate: inviteMember, isPending } = useInviteMember();

  const permissions = ROLE_PERMISSIONS[role];
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = () => {
    setErrorMsg("");

    if (!workspaceId) {
      setErrorMsg("Workspace not found. Please refresh and try again.");
      return;
    }

    if (!isValidEmail) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    inviteMember(
      { workspaceId, data: { email, role } },
      {
        onSuccess: () => {
          setSuccess(true);
          setErrorMsg("");
        },
        onError: (err) => {
          const msg =
            err?.response?.data?.message ||
            err?.message ||
            "Failed to send invite. Please try again.";
          setErrorMsg(msg);
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-md w-full border border-gray-700 overflow-hidden">

        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex items-start justify-between">
          <div>
            <h3 className="text-base font-medium text-white">Invite collaborator</h3>
            <p className="text-xs text-gray-400 mt-0.5">Send an invite link to their email</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors mt-0.5"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Success State */}
        {success ? (
          <div className="p-8 flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <polyline
                  points="20 6 9 17 4 12"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="text-white font-medium">Invite sent!</p>
            <p className="text-sm text-gray-400">
              Sent to <span className="text-white">{email}</span> as{" "}
              <span className="text-blue-400">{role}</span>
            </p>
            <button
              onClick={onClose}
              className="mt-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="p-4 flex flex-col gap-4">

              {/* Workspace loading warning */}
              {wsLoading && (
                <div className="flex items-center gap-2 text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2">
                  <div className="w-3 h-3 border-2 border-yellow-400/40 border-t-yellow-400 rounded-full animate-spin flex-shrink-0" />
                  Loading workspace info...
                </div>
              )}

              {/* No workspace found warning */}
              {!wsLoading && !workspaceId && (
                <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  Workspace not found. Make sure your artist profile is set up correctly.
                </div>
              )}

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMsg("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder="collaborator@example.com"
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>

              {/* Role picker */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">Role</label>
                <div className="grid grid-cols-2 gap-2">
                  {ROLES.map((r) => (
                    <button
                      key={r.value}
                      onClick={() => setRole(r.value)}
                      className={`text-left px-3 py-2.5 rounded-lg border transition-all ${
                        role === r.value
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-gray-700 hover:border-gray-600 bg-gray-800/50"
                      }`}
                    >
                      <p className="text-sm font-medium text-white">{r.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{r.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Permissions preview */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">Permissions</label>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(permissions).map(([key, val]) => (
                    <span
                      key={key}
                      className={`text-xs px-2.5 py-1 rounded-full border ${
                        val
                          ? "bg-green-500/10 text-green-400 border-green-500/30"
                          : "bg-gray-800 text-gray-600 border-gray-700"
                      }`}
                    >
                      {PERM_LABELS[key]}
                    </span>
                  ))}
                </div>
              </div>

              {/* Error message */}
              {errorMsg && (
                <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {errorMsg}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-800 flex justify-end gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                disabled={isPending}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!isValidEmail || isPending || wsLoading || !workspaceId}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <FiSend size={14} />
                    Send invite
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InviteCollaboratorModal;