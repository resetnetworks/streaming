import React, { useState } from "react";
import {
  useWorkspaceMembers,
  useInviteWorkspaceMember,
  useUpdateWorkspaceMember,
  useRemoveWorkspaceMember,
} from "../../../hooks/api/useWorkspace";
import {
  FaUserShield,
  FaUserPlus,
  FaTrashAlt,
  FaEdit,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaEnvelope,
  FaUser,
  FaTimes,
  FaLock,
} from "react-icons/fa";

const ROLE_PRESETS = {
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

const PERMISSION_LABELS = {
  uploadSong: "Upload Track",
  editSong: "Edit Track",
  deleteSong: "Delete Track",
  viewAnalytics: "View Analytics",
  viewPayments: "View Payments & Revenue",
  changeSubscriptionPrice: "Set Sub Price",
  manageTeam: "Manage Team Members",
};

export default function TeamComponent({ workspace }) {
  const workspaceId = workspace?.workspaceId;
  const currentRole = workspace?.role;
  const userPermissions = workspace?.permissions || {};

  // Check if current user has permission to manage team
  const canManageTeam = userPermissions.manageTeam || currentRole === "owner";

  // Queries & Mutations
  const { data: members = [], isLoading, error } = useWorkspaceMembers(workspaceId);
  const inviteMutation = useInviteWorkspaceMember(workspaceId);
  const updateMutation = useUpdateWorkspaceMember(workspaceId);
  const removeMutation = useRemoveWorkspaceMember(workspaceId);

  // Modal / Form state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("editor");
  const [invitePermissions, setInvitePermissions] = useState(ROLE_PRESETS.editor);

  // Edit member state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [editRole, setEditRole] = useState("editor");
  const [editPermissions, setEditPermissions] = useState({});

  // handle invite role change to pre-fill standard permissions
  const handleInviteRoleChange = (role) => {
    setInviteRole(role);
    setInvitePermissions(ROLE_PRESETS[role]);
  };

  // handle edit role change
  const handleEditRoleChange = (role) => {
    setEditRole(role);
    setEditPermissions(ROLE_PRESETS[role]);
  };

  const handleInviteSubmit = (e) => {
    e.preventDefault();
    if (!inviteEmail) return;

    // Calculate overrides (permissions that differ from role preset)
    const preset = ROLE_PRESETS[inviteRole];
    const permissionsOverride = {};
    Object.keys(preset).forEach((key) => {
      if (invitePermissions[key] !== preset[key]) {
        permissionsOverride[key] = invitePermissions[key];
      }
    });

    inviteMutation.mutate(
      {
        workspaceId,
        email: inviteEmail,
        role: inviteRole,
        permissionsOverride,
      },
      {
        onSuccess: () => {
          setShowInviteModal(false);
          setInviteEmail("");
          setInviteRole("editor");
          setInvitePermissions(ROLE_PRESETS.editor);
        },
      }
    );
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingMember) return;

    const preset = ROLE_PRESETS[editRole];
    const permissionsOverride = {};
    Object.keys(preset).forEach((key) => {
      if (editPermissions[key] !== preset[key]) {
        permissionsOverride[key] = editPermissions[key];
      }
    });

    updateMutation.mutate(
      {
        workspaceId,
        userId: editingMember.userId?._id,
        role: editRole,
        permissionsOverride,
      },
      {
        onSuccess: () => {
          setShowEditModal(false);
          setEditingMember(null);
        },
      }
    );
  };

  const handleRemoveMember = (userId, name) => {
    const confirmed = window.confirm(`Are you sure you want to remove ${name} from this workspace?`);
    if (confirmed) {
      removeMutation.mutate({ workspaceId, userId });
    }
  };

  const openEditModal = (member) => {
    setEditingMember(member);
    setEditRole(member.role);
    setEditPermissions(member.permissions);
    setShowEditModal(true);
  };

  if (!workspaceId) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-gray-400 font-jura">
        <FaSpinner className="animate-spin text-4xl text-[#4DB3FF] mb-4" />
        <p>Loading Workspace Context...</p>
      </div>
    );
  }

  return (
    <div 
      className="p-4 md:p-6 text-white min-h-screen font-jura"
      style={{ fontFamily: "'Jura', sans-serif" }}
    >
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-[#0A0A23]/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -top-16 -left-16 w-32 h-32 bg-[#4DB3FF] opacity-10 rounded-full blur-2xl"></div>
        <div>
          <h1 className="text-3xl font-bold tracking-wide mb-1 text-white">
            Workspace: <span className="text-[#4DB3FF]">{workspace?.name || "Reset Team"}</span>
          </h1>
          <p className="text-gray-400 text-sm">
            Manage your collaborators, invite team members and configure custom permissions.
          </p>
        </div>
        {canManageTeam && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#0F3272] via-[#1A5DB4] to-[#3380FF] hover:opacity-90 text-white rounded-xl transition-all shadow-lg font-semibold border border-white/10 cursor-pointer self-start md:self-auto"
          >
            <FaUserPlus /> Invite Collaborator
          </button>
        )}
      </div>

      {/* Main Members Panel */}
      <div className="bg-[#0A0A23]/40 backdrop-blur-lg border border-white/10 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-2">
            <FaUserShield className="text-[#4DB3FF] text-xl" />
            <h2 className="text-xl font-semibold">Active Collaborators</h2>
          </div>
          <span className="bg-[#4DB3FF]/10 text-[#4DB3FF] text-xs font-bold px-3 py-1 rounded-full border border-[#4DB3FF]/20">
            {members.length} {members.length === 1 ? "Member" : "Members"}
          </span>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-16">
            <FaSpinner className="animate-spin text-4xl text-[#4DB3FF] mb-4" />
            <p className="text-gray-400 text-sm">Loading team members...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-400">
            <FaTimesCircle className="text-4xl mx-auto mb-3" />
            <p>Failed to load collaborators.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-gray-400 text-xs tracking-wider bg-white/[0.02]">
                  <th className="py-4 px-6 font-semibold">User</th>
                  <th className="py-4 px-6 font-semibold">Role</th>
                  <th className="py-4 px-6 font-semibold">Permissions</th>
                  <th className="py-4 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {members.map((member) => {
                  const isOwner = member.role === "owner";
                  const isSelf = member.userId?._id === workspace.userId;

                  return (
                    <tr key={member._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0F3272] to-[#3380FF] flex items-center justify-center font-bold text-white text-sm">
                            {member.userId?.name?.charAt(0).toUpperCase() || "U"}
                          </div>
                          <div>
                            <div className="font-semibold text-white flex items-center gap-2">
                              {member.userId?.name || "Pending User"}
                              {isSelf && (
                                <span className="bg-[#4DB3FF]/15 text-[#4DB3FF] text-[10px] font-bold px-2 py-0.5 rounded border border-[#4DB3FF]/20">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-gray-400 text-xs flex items-center gap-1">
                              <FaEnvelope size={10} className="opacity-60" />
                              {member.userId?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 capitalize text-xs font-semibold px-2.5 py-1 rounded-full border ${
                          isOwner 
                            ? "bg-purple-500/10 text-purple-400 border-purple-500/20" 
                            : member.role === "manager"
                            ? "bg-[#3380FF]/10 text-[#4DB3FF] border-[#3380FF]/20"
                            : "bg-gray-500/10 text-gray-400 border-gray-500/20"
                        }`}>
                          {member.role}
                        </span>
                      </td>
                      <td className="py-4 px-6 max-w-md">
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(member.permissions || {})
                            .filter(([, value]) => value === true)
                            .map(([key]) => (
                              <span
                                key={key}
                                className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-[10px] px-2 py-0.5 rounded"
                              >
                                {PERMISSION_LABELS[key] || key}
                              </span>
                            ))}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {isOwner ? (
                          <div className="text-xs text-gray-500 italic flex items-center justify-end gap-1">
                            <FaLock size={10} /> Owner
                          </div>
                        ) : canManageTeam && !isSelf ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(member)}
                              className="p-2 text-gray-400 hover:text-[#4DB3FF] hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                              title="Edit Member Role / Permissions"
                            >
                              <FaEdit size={16} />
                            </button>
                            <button
                              onClick={() => handleRemoveMember(member.userId?._id, member.userId?.name)}
                              className="p-2 text-gray-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                              title="Remove Member"
                            >
                              <FaTrashAlt size={15} />
                            </button>
                          </div>
                        ) : (
                          <div className="text-xs text-gray-600 italic">No Permissions</div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ==================== INVITE MODAL ==================== */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#0A0A23] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
            <div className="absolute top-4 right-4">
              <button 
                onClick={() => setShowInviteModal(false)}
                className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/5 transition-colors cursor-pointer"
              >
                <FaTimes size={18} />
              </button>
            </div>
            
            <form onSubmit={handleInviteSubmit} className="p-6">
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                <FaUserPlus className="text-[#4DB3FF]" /> Invite Member
              </h2>
              <p className="text-gray-400 text-sm mb-6">
                Send an email invite to join your music production workspace.
              </p>

              {/* Email */}
              <div className="mb-4">
                <label className="block text-gray-300 text-xs font-semibold uppercase tracking-wider mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="collaborator@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-[#020216] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#4DB3FF]/50 transition-colors text-sm"
                />
              </div>

              {/* Role */}
              <div className="mb-6">
                <label className="block text-gray-300 text-xs font-semibold uppercase tracking-wider mb-2">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => handleInviteRoleChange(e.target.value)}
                  className="w-full bg-[#020216] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#4DB3FF]/50 transition-colors text-sm capitalize"
                >
                  <option value="manager">Manager (Full edit rights, team administration)</option>
                  <option value="editor">Editor (Upload and edit tracks)</option>
                  <option value="analyst">Analyst (View only statistics and analytics)</option>
                  <option value="finance">Finance (Manage payouts and view revenue)</option>
                </select>
              </div>

              {/* Permissions Configurer */}
              <div className="mb-6 bg-white/[0.02] border border-white/5 rounded-xl p-4">
                <div className="text-xs font-semibold uppercase text-gray-400 mb-3 tracking-wide">
                  Customize Role Permissions
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.keys(invitePermissions).map((permission) => (
                    <label key={permission} className="flex items-center gap-3 text-sm text-gray-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={invitePermissions[permission]}
                        onChange={(e) => {
                          setInvitePermissions({
                            ...invitePermissions,
                            [permission]: e.target.checked,
                          });
                        }}
                        className="w-4 h-4 rounded text-[#3380FF] bg-black border-white/15 focus:ring-0 cursor-pointer"
                      />
                      <span>{PERMISSION_LABELS[permission] || permission}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 py-3 text-gray-400 hover:text-white transition-colors cursor-pointer border border-white/5 rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviteMutation.isPending}
                  className="flex-1 py-3 bg-gradient-to-r from-[#0F3272] via-[#1A5DB4] to-[#3380FF] text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  {inviteMutation.isPending ? (
                    <>
                      <FaSpinner className="animate-spin" /> Inviting...
                    </>
                  ) : (
                    "Send Invitation"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== EDIT MODAL ==================== */}
      {showEditModal && editingMember && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#0A0A23] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
            <div className="absolute top-4 right-4">
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/5 transition-colors cursor-pointer"
              >
                <FaTimes size={18} />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6">
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                <FaEdit className="text-[#4DB3FF]" /> Edit Role & Permissions
              </h2>
              <p className="text-gray-400 text-sm mb-6">
                Update credentials for: <span className="text-white font-semibold">{editingMember.userId?.name}</span>
              </p>

              {/* Role */}
              <div className="mb-6">
                <label className="block text-gray-300 text-xs font-semibold uppercase tracking-wider mb-2">Role</label>
                <select
                  value={editRole}
                  onChange={(e) => handleEditRoleChange(e.target.value)}
                  className="w-full bg-[#020216] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#4DB3FF]/50 transition-colors text-sm capitalize"
                >
                  <option value="manager">Manager (Full edit rights, team administration)</option>
                  <option value="editor">Editor (Upload and edit tracks)</option>
                  <option value="analyst">Analyst (View only statistics and analytics)</option>
                  <option value="finance">Finance (Manage payouts and view revenue)</option>
                </select>
              </div>

              {/* Permissions Configurer */}
              <div className="mb-6 bg-white/[0.02] border border-white/5 rounded-xl p-4">
                <div className="text-xs font-semibold uppercase text-gray-400 mb-3 tracking-wide">
                  Customize Role Permissions
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.keys(ROLE_PRESETS.editor).map((permission) => (
                    <label key={permission} className="flex items-center gap-3 text-sm text-gray-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={editPermissions[permission] || false}
                        onChange={(e) => {
                          setEditPermissions({
                            ...editPermissions,
                            [permission]: e.target.checked,
                          });
                        }}
                        className="w-4 h-4 rounded text-[#3380FF] bg-black border-white/15 focus:ring-0 cursor-pointer"
                      />
                      <span>{PERMISSION_LABELS[permission] || permission}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-3 text-gray-400 hover:text-white transition-colors cursor-pointer border border-white/5 rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex-1 py-3 bg-gradient-to-r from-[#0F3272] via-[#1A5DB4] to-[#3380FF] text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  {updateMutation.isPending ? (
                    <>
                      <FaSpinner className="animate-spin" /> Updating...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
