import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  useWorkspaceMembers,
  useInviteWorkspaceMember,
  useUpdateWorkspaceMember,
  useRemoveWorkspaceMember,
} from "../../../hooks/api/useWorkspace";
import {
  LuUsers,
  LuUserPlus,
  LuMail,
  LuShield,
  LuTrash2,
  LuPencil,
  LuX,
  LuLoader,
  LuCircleAlert,
  LuLock,
  LuCheck,
  LuChevronDown,
} from "react-icons/lu";

// ── Shared panel styles (matches Analytics + Revenue tabs) ──────────────────
const innerPanel3dStyle = {
  background: "radial-gradient(ellipse at 50% 0%, #151e32 0%, #090e1a 100%)",
  boxShadow:
    "inset 0 3px 8px rgba(0,0,0,0.75), inset 0 1px 2px rgba(0,0,0,0.9), inset 0 -1px 1px rgba(255,255,255,0.05)",
};

const sunkenCardStyle = {
  background: "radial-gradient(ellipse at 50% 0%, #0d1527 0%, #050811 100%)",
  border: "1px solid rgba(0,0,0,0.95)",
  boxShadow:
    "inset 0 4px 8px rgba(0,0,0,0.9), inset 0 1px 3px rgba(0,0,0,0.95), inset 0 -1px 1px rgba(255,255,255,0.08), 0 1px 0 rgba(255,255,255,0.05)",
};

const MotionDiv = motion.div;

// ── Role & Permission config ────────────────────────────────────────────────
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
  viewPayments: "View Payments",
  changeSubscriptionPrice: "Set Sub Price",
  manageTeam: "Manage Team",
};

const ROLE_OPTIONS = [
  { value: "manager", label: "Manager", desc: "Full edit + team admin" },
  { value: "editor",  label: "Editor",  desc: "Upload & edit tracks"  },
  { value: "analyst", label: "Analyst", desc: "View statistics only"  },
  { value: "finance", label: "Finance", desc: "Revenue & payouts"     },
];

// ── Role badge colour map ───────────────────────────────────────────────────
const roleMeta = {
  owner:   { color: "text-slate-300",   bg: "",                  border: ""                      },
  manager: { color: "text-[#38bdf8]",   bg: "bg-[#0459FE]/10",   border: "border-[#0459FE]/20"   },
  editor:  { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  analyst: { color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/20"   },
  finance: { color: "text-rose-400",    bg: "bg-rose-500/10",    border: "border-rose-500/20"    },
};

// ── Reusable stat card (same as Revenue's 4-card row) ──────────────────────
function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="group relative rounded-2xl p-[1px] bg-gradient-to-b from-white/10 via-white/5 to-transparent shadow-md">
      <div
        className="h-full rounded-[15px] p-4 flex flex-col justify-start relative overflow-hidden"
        style={sunkenCardStyle}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {label}
          </span>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#0459FE]/15 border border-[#0459FE]/25 text-[#38bdf8]">
            <Icon className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1.5">
          {value}
        </div>
      </div>
    </div>
  );
}

// ── Modal shell (matches Revenue payout modal style) ───────────────────────
function ModalShell({ onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative rounded-2xl p-[1px] bg-gradient-to-b from-white/20 via-white/5 to-transparent w-full max-w-md shadow-2xl">
        <div className="rounded-2xl p-6 relative overflow-hidden" style={innerPanel3dStyle}>
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <LuX className="w-4 h-4" />
          </button>
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Permission toggle grid ─────────────────────────────────────────────────
function PermissionGrid({ permissions, onChange }) {
  return (
    <div className="rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3" style={sunkenCardStyle}>
      {Object.keys(PERMISSION_LABELS).map((key) => (
        <label
          key={key}
          className="flex items-center gap-3 text-sm text-slate-300 cursor-pointer select-none"
        >
          <input
            type="checkbox"
            checked={permissions[key] || false}
            onChange={(e) => onChange({ ...permissions, [key]: e.target.checked })}
            className="w-4 h-4 rounded text-[#3380FF] bg-black border-white/15 focus:ring-0 cursor-pointer"
          />
          <span>{PERMISSION_LABELS[key]}</span>
        </label>
      ))}
    </div>
  );
}

// ── Role select ────────────────────────────────────────────────────────────
function RoleSelect({ value, onChange }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#0459FE] focus:ring-1 focus:ring-[#0459FE] transition-colors cursor-pointer pr-10"
        style={{ background: "#050811", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        {ROLE_OPTIONS.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label} — {r.desc}
          </option>
        ))}
      </select>
      <LuChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function TeamComponent({ workspace }) {
  const workspaceId     = workspace?.workspaceId;
  const currentRole     = workspace?.role;
  const userPermissions = workspace?.permissions || {};
  const canManageTeam   = userPermissions.manageTeam || currentRole === "owner";

  const { data: members = [], isLoading, error } = useWorkspaceMembers(workspaceId);
  const inviteMutation  = useInviteWorkspaceMember(workspaceId);
  const updateMutation  = useUpdateWorkspaceMember(workspaceId);
  const removeMutation  = useRemoveWorkspaceMember(workspaceId);

  // Invite modal state
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole]   = useState("editor");
  const [invitePerms, setInvitePerms] = useState(ROLE_PRESETS.editor);

  // Edit modal state
  const [showEdit, setShowEdit]           = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [editRole, setEditRole]           = useState("editor");
  const [editPerms, setEditPerms]         = useState({});

  const handleInviteRoleChange = (role) => {
    setInviteRole(role);
    setInvitePerms(ROLE_PRESETS[role] || {});
  };

  const handleEditRoleChange = (role) => {
    setEditRole(role);
    setEditPerms(ROLE_PRESETS[role] || {});
  };

  const openEditModal = (member) => {
    setEditingMember(member);
    setEditRole(member.role);
    setEditPerms(member.permissions || {});
    setShowEdit(true);
  };

  const handleInviteSubmit = (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    const preset = ROLE_PRESETS[inviteRole] || {};
    const overrides = {};
    Object.keys(preset).forEach((k) => {
      if (invitePerms[k] !== preset[k]) overrides[k] = invitePerms[k];
    });
    inviteMutation.mutate(
      { workspaceId, email: inviteEmail, role: inviteRole, permissionsOverride: overrides },
      {
        onSuccess: () => {
          setShowInvite(false);
          setInviteEmail("");
          setInviteRole("editor");
          setInvitePerms(ROLE_PRESETS.editor);
        },
      }
    );
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingMember) return;
    const preset = ROLE_PRESETS[editRole] || {};
    const overrides = {};
    Object.keys(preset).forEach((k) => {
      if (editPerms[k] !== preset[k]) overrides[k] = editPerms[k];
    });
    updateMutation.mutate(
      { workspaceId, userId: editingMember.userId?._id, role: editRole, permissionsOverride: overrides },
      { onSuccess: () => { setShowEdit(false); setEditingMember(null); } }
    );
  };

  const handleRemove = (userId, name) => {
    if (window.confirm(`Remove ${name} from this workspace?`)) {
      removeMutation.mutate({ workspaceId, userId });
    }
  };

  // Stat counts
  const ownerCount  = members.filter((m) => m.role === "owner").length;
  const memberCount = members.filter((m) => m.role !== "owner").length;

  if (!workspaceId) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="animate-spin rounded-full h-7 w-7 border-2 border-white/20 border-t-[#38bdf8]" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 animate-dashboard-fade-in">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          {workspace?.name || "Team"}
        </h1>

        {canManageTeam && (
          <button
            onClick={() => setShowInvite(true)}
            className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-white hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
            style={{ background: "linear-gradient(45deg, #0F3272 0%, #1A5DB4 60%, #3380FF 100%)" }}
          >
            <LuUserPlus className="w-3.5 h-3.5" />
            Invite Member
          </button>
        )}
      </div>

      {/* ── Stat Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <StatCard label="Total Members"  value={members.length} icon={LuUsers}  />
        <StatCard label="Collaborators"  value={memberCount}    icon={LuShield} />
        <StatCard label="Owners"         value={ownerCount}     icon={LuCheck}  />
      </div>

      {/* ── Members Table ───────────────────────────────────────────────── */}
      <div className="rounded-2xl p-[1px] bg-gradient-to-b from-white/10 via-white/5 to-transparent">
        <div className="rounded-2xl flex flex-col overflow-hidden" style={innerPanel3dStyle}>

          {/* Panel header */}
          <div className="p-4 sm:p-5 border-b border-white/5 flex items-center justify-between gap-3">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Active Collaborators
            </h2>
            <span
              className="text-[11px] font-bold px-3 py-1 rounded-full text-[#38bdf8] border border-[#0459FE]/25"
              style={{ background: "rgba(4,89,254,0.08)" }}
            >
              {members.length} {members.length === 1 ? "Member" : "Members"}
            </span>
          </div>

          {/* Body states */}
          {isLoading ? (
            <div className="p-14 flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-7 w-7 border-2 border-white/20 border-t-[#38bdf8]" />
              <p className="text-sm text-slate-400 font-medium">Loading members...</p>
            </div>
          ) : error ? (
            <div className="p-10 text-center">
              <LuCircleAlert className="w-7 h-7 text-rose-400 mx-auto mb-2" />
              <p className="text-sm text-rose-300 font-medium">Failed to load team members.</p>
            </div>
          ) : members.length === 0 ? (
            <div className="p-14 text-center">
              <LuUsers className="w-8 h-8 text-slate-600 mx-auto mb-2 stroke-1" />
              <p className="text-sm text-slate-400 font-medium">No members yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black/30 border-b border-white/5">
                    <th className="p-4 text-xs font-bold text-slate-300 uppercase tracking-wider">Member</th>
                    <th className="p-4 text-xs font-bold text-slate-300 uppercase tracking-wider">Role</th>
                    <th className="p-4 text-xs font-bold text-slate-300 uppercase tracking-wider">Permissions</th>
                    <th className="p-4 text-xs font-bold text-slate-300 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {members.map((member) => {
                    const isOwner = member.role === "owner";
                    const isSelf  = member.userId?._id === workspace.userId;
                    const rm      = roleMeta[member.role] || roleMeta.editor;
                    const activePerms = Object.entries(member.permissions || {})
                      .filter(([, v]) => v === true)
                      .map(([k]) => k);

                    return (
                      <tr key={member._id} className="hover:bg-white/[0.03] transition-colors">

                        {/* Member */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-sm shrink-0"
                              style={{ background: "linear-gradient(135deg, #0F3272, #3380FF)" }}
                            >
                              {member.userId?.name?.charAt(0).toUpperCase() || "?"}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-white flex items-center gap-2">
                                {member.userId?.name || "Pending"}
                                {isSelf && (
                                  <span
                                    className="text-[10px] font-bold px-2 py-0.5 rounded text-[#38bdf8] border border-[#0459FE]/25"
                                    style={{ background: "rgba(4,89,254,0.1)" }}
                                  >
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                <LuMail className="w-3 h-3 opacity-60" />
                                {member.userId?.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="p-4">
                          {isOwner ? (
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                              Owner
                            </span>
                          ) : (
                            <span className={`inline-flex items-center capitalize text-xs font-bold px-2.5 py-1 rounded-full border ${rm.color} ${rm.bg} ${rm.border}`}>
                              {member.role}
                            </span>
                          )}
                        </td>

                        {/* Permissions */}
                        <td className="p-4 max-w-xs">
                          {isOwner ? (
                            <span className="text-xs text-slate-500 italic">All permissions</span>
                          ) : activePerms.length === 0 ? (
                            <span className="text-xs text-slate-600 italic">None</span>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {activePerms.map((k) => (
                                <span
                                  key={k}
                                  className="text-[10px] font-semibold px-2 py-0.5 rounded text-emerald-400 border border-emerald-500/25"
                                  style={{ background: "rgba(16,185,129,0.08)" }}
                                >
                                  {PERMISSION_LABELS[k] || k}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-right whitespace-nowrap">
                          {isOwner ? (
                            <div className="flex items-center justify-end gap-1 text-xs text-slate-500 italic">
                              <LuLock className="w-3 h-3" /> Owner
                            </div>
                          ) : canManageTeam && !isSelf ? (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => openEditModal(member)}
                                className="p-2 text-slate-400 hover:text-[#38bdf8] hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                                title="Edit Role & Permissions"
                              >
                                <LuPencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleRemove(member.userId?._id, member.userId?.name)}
                                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                                title="Remove Member"
                              >
                                <LuTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-600 italic">—</span>
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
      </div>

      {/* ══════════════════ INVITE MODAL ══════════════════ */}
      {showInvite && (
        <ModalShell onClose={() => setShowInvite(false)}>
          <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-white/5">
            <div className="w-8 h-8 rounded-xl bg-[#0459FE]/10 border border-[#0459FE]/20 text-[#38bdf8] flex items-center justify-center">
              <LuUserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Invite Member</h3>
              <p className="text-xs text-slate-400">Send an email invite to your workspace.</p>
            </div>
          </div>

          <form onSubmit={handleInviteSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <LuMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input
                  type="email"
                  required
                  placeholder="collaborator@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-[#050811] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#0459FE] focus:ring-1 focus:ring-[#0459FE] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Role
              </label>
              <RoleSelect value={inviteRole} onChange={handleInviteRoleChange} />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Permissions
              </label>
              <PermissionGrid permissions={invitePerms} onChange={setInvitePerms} />
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowInvite(false)}
                className="flex-1 py-2.5 px-4 text-sm font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={inviteMutation.isPending}
                className="flex-1 py-2.5 px-4 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:brightness-110 active:scale-[0.98]"
                style={{ background: "linear-gradient(45deg, #0F3272 0%, #1A5DB4 60%, #3380FF 100%)" }}
              >
                {inviteMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white/20 border-t-white" />
                    Inviting...
                  </>
                ) : (
                  "Send Invitation"
                )}
              </button>
            </div>
          </form>
        </ModalShell>
      )}

      {/* ══════════════════ EDIT MODAL ══════════════════ */}
      {showEdit && editingMember && (
        <ModalShell onClose={() => { setShowEdit(false); setEditingMember(null); }}>
          <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-white/5">
            <div className="w-8 h-8 rounded-xl bg-[#0459FE]/10 border border-[#0459FE]/20 text-[#38bdf8] flex items-center justify-center">
              <LuPencil className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Edit Permissions</h3>
              <p className="text-xs text-slate-400">{editingMember.userId?.name}</p>
            </div>
          </div>

          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Role
              </label>
              <RoleSelect value={editRole} onChange={handleEditRoleChange} />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Permissions
              </label>
              <PermissionGrid permissions={editPerms} onChange={setEditPerms} />
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => { setShowEdit(false); setEditingMember(null); }}
                className="flex-1 py-2.5 px-4 text-sm font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="flex-1 py-2.5 px-4 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:brightness-110 active:scale-[0.98]"
                style={{ background: "linear-gradient(45deg, #0F3272 0%, #1A5DB4 60%, #3380FF 100%)" }}
              >
                {updateMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white/20 border-t-white" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </ModalShell>
      )}

    </div>
  );
}
