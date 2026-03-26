// src/components/CollaboratorsPanel.jsx
import { useState } from "react";
import { HiUserAdd, HiUsers } from "react-icons/hi";
import { HiTrash, HiPencil, HiCheck, HiX } from "react-icons/hi";
import { useRemoveMember, useUpdateMember } from "../../../hooks/api/useWorkspaces";
import { useCurrentWorkspace } from "../../../hooks/api/useCurrentWorkspace";

// ─── Constants ────────────────────────────────────────────────────────────────
const ROLE_COLORS = {
  owner:   { dot: "bg-yellow-400", badge: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
  manager: { dot: "bg-blue-400",   badge: "bg-blue-500/15   text-blue-400   border-blue-500/30"   },
  editor:  { dot: "bg-purple-400", badge: "bg-purple-500/15 text-purple-400 border-purple-500/30" },
  analyst: { dot: "bg-green-400",  badge: "bg-green-500/15  text-green-400  border-green-500/30"  },
  finance: { dot: "bg-orange-400", badge: "bg-orange-500/15 text-orange-400 border-orange-500/30" },
};

const ROLE_OPTIONS = ["manager", "editor", "analyst", "finance"];

const ROLE_DESC = {
  manager: "Upload, edit, delete songs & manage team",
  editor:  "Upload & edit songs only",
  analyst: "View analytics only",
  finance: "View payments only",
};

const AVATAR_GRADIENTS = [
  "from-blue-500 to-indigo-600",
  "from-violet-500 to-purple-600",
  "from-teal-500 to-cyan-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
];

export const getInitials = (name = "") =>
  name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "?";

// ─── Remove confirm dialog ────────────────────────────────────────────────────
const RemoveConfirmDialog = ({ member, workspaceId, onCancel, onDone }) => {
  const { mutate: removeMember, isPending } = useRemoveMember();

  const handleRemove = () => {
    removeMember(
      { workspaceId, userId: member.userId._id },
      { onSuccess: onDone }
    );
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70">
      <div className="bg-[#111827] border border-gray-700/80 rounded-2xl p-6 max-w-xs w-full text-center shadow-2xl">
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
          <HiTrash className="text-red-400 text-lg" />
        </div>
        <h4 className="text-white font-semibold text-base mb-1">Remove collaborator?</h4>
        <p className="text-sm text-gray-400 mb-1">
          <span className="text-white font-medium">{member.userId?.name || "This person"}</span>
        </p>
        <p className="text-xs text-gray-500 mb-6">
          They will lose all access to this workspace immediately.
        </p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="flex-1 py-2.5 border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-white text-sm rounded-xl transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleRemove}
            disabled={isPending}
            className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isPending
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : "Remove"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Member card ──────────────────────────────────────────────────────────────
const MemberCard = ({ member, workspaceId, canManageTeam, index }) => {
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [isEditRole,   setIsEditRole]   = useState(false);
  const [selectedRole, setSelectedRole] = useState(member.role);

  const { mutate: updateMember, isPending: isUpdating } = useUpdateMember();

  const gradient  = AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length];
  const roleStyle = ROLE_COLORS[member.role] || ROLE_COLORS.editor;

  // Owner can never be edited/removed
  const isOwner       = member.role === "owner";
  // Can this logged-in user edit/remove this member?
  const showActions   = canManageTeam && !isOwner;

  const handleUpdateRole = () => {
    if (selectedRole === member.role) { setIsEditRole(false); return; }
    updateMember(
      { workspaceId, userId: member.userId._id, data: { role: selectedRole } },
      {
        onSuccess: () => setIsEditRole(false),
        onError:   () => setSelectedRole(member.role),
      }
    );
  };

  const handleCancelEdit = () => {
    setSelectedRole(member.role);
    setIsEditRole(false);
  };

  return (
    <>
      <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl hover:border-gray-600/60 transition-all duration-200">
        <div className="p-4">

          {/* ── View mode ── */}
          {!isEditRole ? (
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-sm font-bold text-white flex-shrink-0 shadow-md`}>
                {getInitials(member.userId?.name)}
              </div>

              {/* Name + email */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {member.userId?.name || "Unknown"}
                </p>
                <p className="text-xs text-gray-500 truncate mt-0.5">
                  {member.userId?.email}
                </p>
              </div>

              {/* Role badge + action buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${roleStyle.badge}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${roleStyle.dot}`} />
                  {member.role}
                </span>

                {/* Only show edit/remove if current user has manageTeam permission AND member is not owner */}
                {showActions && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setIsEditRole(true)}
                      disabled={isUpdating}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                      title="Change role"
                    >
                      <HiPencil size={15} />
                    </button>
                    <button
                      onClick={() => setShowConfirm(true)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      title="Remove member"
                    >
                      <HiTrash size={15} />
                    </button>
                  </div>
                )}
              </div>
            </div>

          ) : (
            /* ── Edit mode ── */
            <div className="space-y-3">
              {/* Avatar + name header */}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-sm font-bold text-white flex-shrink-0 shadow-md`}>
                  {getInitials(member.userId?.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{member.userId?.name || "Unknown"}</p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{member.userId?.email}</p>
                </div>
              </div>

              {/* Role selector */}
              <div className="border-t border-gray-700/50 pt-3 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <label className="text-xs text-gray-400">Role:</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    disabled={isUpdating}
                    className="bg-gray-800 border border-gray-700 rounded-md text-sm text-white px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r} value={r}>
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-gray-500">{ROLE_DESC[selectedRole]}</p>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleCancelEdit}
                    disabled={isUpdating}
                    className="flex items-center gap-1 px-3 py-1.5 border border-gray-700 rounded-lg text-xs text-gray-400 hover:text-white hover:border-gray-500 transition-all"
                  >
                    <HiX size={12} /> Cancel
                  </button>
                  <button
                    onClick={handleUpdateRole}
                    disabled={isUpdating || selectedRole === member.role}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 rounded-lg text-xs text-white hover:bg-blue-500 transition-all disabled:opacity-50"
                  >
                    {isUpdating
                      ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <><HiCheck size={12} /> Save</>}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showConfirm && (
        <RemoveConfirmDialog
          member={member}
          workspaceId={workspaceId}
          onCancel={() => setShowConfirm(false)}
          onDone={() => setShowConfirm(false)}
        />
      )}
    </>
  );
};

// ─── Main CollaboratorsPanel ──────────────────────────────────────────────────
const CollaboratorsPanel = ({ members, isLoading, workspaceId, onClose, onInvite }) => {
  // Get current logged-in user's permissions from their workspace membership
  const { permissions } = useCurrentWorkspace();

  // Only show invite button and edit/remove actions if user has manageTeam permission
  const canManageTeam = permissions?.manageTeam === true;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div
        className="relative w-full max-w-sm h-full bg-[#0d1117] border-l border-gray-800 flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="text-white font-semibold text-base">Collaborators</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {isLoading
                ? "Loading..."
                : `${members.length} member${members.length !== 1 ? "s" : ""} in this workspace`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Invite button — only for manageTeam users */}
            {canManageTeam && (
              <button
                onClick={onInvite}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors"
              >
                <HiUserAdd size={13} />
                Invite
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
            >
              <HiX size={14} />
            </button>
          </div>
        </div>

        {/* Member list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-700" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-gray-700 rounded-lg w-2/3" />
                    <div className="h-2.5 bg-gray-700 rounded-lg w-1/2" />
                  </div>
                  <div className="w-16 h-6 bg-gray-700 rounded-full" />
                </div>
              </div>
            ))
          ) : members.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-gray-800/60 border border-gray-700/50 flex items-center justify-center">
                <HiUsers className="text-gray-500 text-2xl" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-300 mb-1">No collaborators yet</p>
                <p className="text-xs text-gray-600">
                  {canManageTeam
                    ? "Invite someone to start collaborating"
                    : "No team members have been added yet"}
                </p>
              </div>
              {canManageTeam && (
                <button
                  onClick={onInvite}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
                >
                  <HiUserAdd size={15} />
                  Send first invite
                </button>
              )}
            </div>
          ) : (
            members.map((m, i) => (
              <MemberCard
                key={m._id || i}
                member={m}
                workspaceId={workspaceId}
                canManageTeam={canManageTeam}
                index={i}
              />
            ))
          )}
        </div>

        {/* Footer invite button — only for manageTeam */}
        {!isLoading && members.length > 0 && canManageTeam && (
          <div className="p-4 border-t border-gray-800 flex-shrink-0">
            <button
              onClick={onInvite}
              className="w-full py-3 border border-dashed border-gray-700 hover:border-blue-500/50 hover:bg-blue-500/5 text-gray-500 hover:text-blue-400 text-sm rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <HiUserAdd size={15} />
              Invite another collaborator
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollaboratorsPanel;