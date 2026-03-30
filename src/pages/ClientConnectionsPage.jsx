import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { UserPlus, UserCheck, UserX, ChevronLeft, Shield, Eye, MessageCircle, Loader2 } from "lucide-react";
import { PageLoader } from "@/components/shared/LoadingSpinner";

const C = {
  teal:  "#2DD4BF",
  indigo:"#6366F1",
  red:   "#EF4444",
  glass: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" },
};

const PERMISSION_OPTIONS = [
  { value: "view_only",    label: "View Only",    icon: Eye,            desc: "Can see your streaks, check-ins, and progress." },
  { value: "limited_input",label: "Limited Input", icon: MessageCircle, desc: "Can also send you encouragement messages." },
];

export default function ClientConnectionsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [roleLabel, setRoleLabel] = useState("Counselor");
  const [permLevel, setPermLevel] = useState("view_only");
  const [inviteMsg, setInviteMsg] = useState("");

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: connections = [], isLoading: connLoading } = useQuery({
    queryKey: ["client-connections", user?.email],
    queryFn: () => base44.entities.ClientConnection.filter({ client_email: user.email }),
    enabled: !!user?.email,
  });

  const inviteMutation = useMutation({
    mutationFn: () => base44.entities.ClientConnection.create({
      client_email: user.email,
      support_user_email: inviteEmail.trim().toLowerCase(),
      support_user_role_label: roleLabel,
      connection_status: "pending",
      permission_level: permLevel,
      invite_message: inviteMsg,
      invite_code: Math.random().toString(36).slice(2, 8).toUpperCase(),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-connections"] });
      setShowInvite(false);
      setInviteEmail("");
      setInviteMsg("");
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (id) => base44.entities.ClientConnection.update(id, { connection_status: "revoked" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["client-connections"] }),
  });

  if (userLoading || connLoading) return (
    <div style={{ background: "#07090F", minHeight: "100vh" }}>
      <PageLoader label="Loading connections…" />
    </div>
  );

  const active = connections.filter(c => c.connection_status === "accepted");
  const pending = connections.filter(c => c.connection_status === "pending");

  return (
    <div style={{ background: "linear-gradient(170deg,#07090F 0%,#0B0F1A 100%)", minHeight: "100vh", paddingBottom: 100 }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ background: "linear-gradient(150deg,#0D1020 0%,#08091A 100%)", padding: "60px 24px 24px" }}>
          <button onClick={() => navigate(-1)} style={{ display: "flex", alignItems: "center", gap: 6,
            background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer",
            fontSize: 12, marginBottom: 16, padding: 0 }}>
            <ChevronLeft style={{ width: 15, height: 15 }} /> Back
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(45,212,191,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shield style={{ color: C.teal, width: 20, height: 20 }} />
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 900, color: "#fff", lineHeight: 1.1 }}>My Support Team</h1>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>You control who can see your data</p>
            </div>
          </div>
        </div>

        <div style={{ padding: "20px 16px" }}>

          {/* Security note */}
          <div style={{ padding: "12px 16px", borderRadius: 14, marginBottom: 20,
            background: "rgba(45,212,191,0.06)", border: "1px solid rgba(45,212,191,0.15)" }}>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
              🔒 Your data is private. Only people you invite can see your progress — and only at the level you choose.
            </p>
          </div>

          {/* Invite button */}
          <button onClick={() => setShowInvite(true)} style={{
            width: "100%", padding: "15px 20px", borderRadius: 16, border: "none", cursor: "pointer",
            background: `linear-gradient(135deg,${C.teal},#22C5B0)`,
            color: "#07090F", fontWeight: 800, fontSize: 15, marginBottom: 24,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            <UserPlus style={{ width: 18, height: 18 }} /> Invite Support Person
          </button>

          {/* Active connections */}
          {active.length > 0 && (
            <>
              <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase",
                letterSpacing: "1px", marginBottom: 10 }}>Active ({active.length})</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                {active.map(conn => (
                  <div key={conn.id} style={{ ...C.glass, borderRadius: 16, padding: "14px 16px",
                    display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(99,102,241,0.12)",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <UserCheck style={{ color: C.indigo, width: 16, height: 16 }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{conn.support_user_email}</p>
                      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                        {conn.support_user_role_label} · {conn.permission_level === "limited_input" ? "Limited Input" : "View Only"}
                      </p>
                    </div>
                    <button onClick={() => revokeMutation.mutate(conn.id)}
                      disabled={revokeMutation.isPending}
                      style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.25)",
                        background: "rgba(239,68,68,0.08)", color: C.red, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                      Revoke
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Pending connections */}
          {pending.length > 0 && (
            <>
              <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase",
                letterSpacing: "1px", marginBottom: 10 }}>Pending ({pending.length})</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                {pending.map(conn => (
                  <div key={conn.id} style={{ ...C.glass, borderRadius: 16, padding: "14px 16px",
                    display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(245,158,11,0.1)",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <UserPlus style={{ color: "#F59E0B", width: 16, height: 16 }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{conn.support_user_email}</p>
                      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                        Waiting for them to accept…
                      </p>
                    </div>
                    <button onClick={() => revokeMutation.mutate(conn.id)}
                      style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)",
                        background: "transparent", color: "rgba(255,255,255,0.4)", fontSize: 11, cursor: "pointer" }}>
                      Cancel
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {active.length === 0 && pending.length === 0 && (
            <div style={{ ...C.glass, borderRadius: 18, padding: "32px 20px", textAlign: "center" }}>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
                You haven't connected with anyone yet.<br />Invite a counselor, sponsor, or coach.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Invite modal */}
      {showInvite && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "flex-end",
          background: "rgba(0,0,0,0.7)" }} onClick={() => setShowInvite(false)}>
          <div style={{ width: "100%", maxWidth: 480, margin: "0 auto", borderRadius: "24px 24px 0 0",
            background: "#0D1117", padding: "24px 20px 40px", border: "1px solid rgba(255,255,255,0.08)" }}
            onClick={e => e.stopPropagation()}>
            <p style={{ fontSize: 17, fontWeight: 900, color: "#fff", marginBottom: 4 }}>Invite a Support Person</p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>
              They'll need to accept before they can see anything.
            </p>

            <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>Their Email</p>
            <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
              placeholder="support@example.com"
              style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: 14, boxSizing: "border-box",
                outline: "none", marginBottom: 14 }} />

            <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>Their Role</p>
            <select value={roleLabel} onChange={e => setRoleLabel(e.target.value)}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: 14, marginBottom: 14 }}>
              {["Counselor","Sponsor","Recovery Coach","Probation Officer","Case Manager","Family Member","Other"].map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>Permission Level</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
              {PERMISSION_OPTIONS.map(opt => {
                const Icon = opt.icon;
                const sel = permLevel === opt.value;
                return (
                  <button key={opt.value} onClick={() => setPermLevel(opt.value)}
                    style={{ padding: "12px 14px", borderRadius: 12, cursor: "pointer", textAlign: "left",
                      border: `1.5px solid ${sel ? C.teal : "rgba(255,255,255,0.08)"}`,
                      background: sel ? "rgba(45,212,191,0.07)" : "rgba(255,255,255,0.03)",
                      display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <Icon style={{ color: sel ? C.teal : "rgba(255,255,255,0.3)", width: 16, height: 16, marginTop: 1, flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: sel ? C.teal : "#fff", marginBottom: 2 }}>{opt.label}</p>
                      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{opt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>Message (optional)</p>
            <textarea value={inviteMsg} onChange={e => setInviteMsg(e.target.value)}
              placeholder="Hey, I'd like you to follow my progress on Rebos…"
              rows={2}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: 13, resize: "none",
                boxSizing: "border-box", outline: "none", marginBottom: 16 }} />

            <button onClick={() => inviteMutation.mutate()}
              disabled={!inviteEmail.includes("@") || inviteMutation.isPending}
              style={{ width: "100%", padding: "15px", borderRadius: 14, border: "none", cursor: "pointer",
                background: inviteEmail.includes("@") ? `linear-gradient(135deg,${C.teal},#22C5B0)` : "rgba(255,255,255,0.08)",
                color: inviteEmail.includes("@") ? "#07090F" : "rgba(255,255,255,0.3)",
                fontWeight: 800, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              {inviteMutation.isPending ? <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> : null}
              Send Invitation →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}