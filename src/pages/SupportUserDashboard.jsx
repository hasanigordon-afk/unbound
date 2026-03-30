import React, { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Users, Activity, AlertTriangle, MessageCircle,
  CheckCircle2, ChevronRight, Flame, Clock, UserCheck, LogOut
} from "lucide-react";
import { PageLoader } from "@/components/shared/LoadingSpinner";

const C = {
  teal:    "#2DD4BF",
  amber:   "#F59E0B",
  emerald: "#10B981",
  red:     "#EF4444",
  indigo:  "#6366F1",
  glass:   { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" },
};

function StatCard({ label, value, color, sub }) {
  return (
    <div style={{ ...C.glass, borderRadius: 14, padding: "14px 16px", flex: 1 }}>
      <p style={{ fontSize: 28, fontWeight: 900, color, lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4, fontWeight: 600,
        textTransform: "uppercase", letterSpacing: ".06em" }}>{label}</p>
      {sub && <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 2 }}>{sub}</p>}
    </div>
  );
}

function ClientCard({ connection, checkIns = [], navigate }) {
  const today = new Date().toISOString().split("T")[0];
  const clientCheckins = checkIns.filter(c => c.participant_email === connection.client_email);
  const checkedToday = clientCheckins.some(c => c.check_in_date === today);

  const sevenAgo = new Date(); sevenAgo.setDate(sevenAgo.getDate() - 7);
  const last7 = clientCheckins.filter(c => new Date(c.check_in_date) >= sevenAgo);
  const avgCraving = last7.length
    ? last7.reduce((s, c) => s + (c.craving_intensity ?? 5), 0) / last7.length
    : null;

  const sorted = [...clientCheckins].sort((a, b) => new Date(b.check_in_date) - new Date(a.check_in_date));
  let streak = 0;
  let cur = new Date(); cur.setHours(0, 0, 0, 0);
  for (const c of sorted) {
    const d = new Date(c.check_in_date); d.setHours(0, 0, 0, 0);
    if (Math.round((cur - d) / 86400000) <= 1) { streak++; cur = d; } else break;
  }

  const isAtRisk = avgCraving !== null && avgCraving >= 7;
  const handle = connection.client_email?.split("@")[0] || "Client";

  return (
    <div style={{ ...C.glass, borderRadius: 18, padding: "16px 18px", cursor: "pointer" }}
      onClick={() => navigate(`/SupportClientView?client=${encodeURIComponent(connection.client_email)}`)}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <div style={{ width: 42, height: 42, borderRadius: "50%", background: "rgba(45,212,191,0.12)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 18 }}>👤</span>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{handle}</p>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
            {connection.permission_level === "limited_input" ? "Limited Input" : "View Only"}
          </p>
        </div>
        {isAtRisk && (
          <div style={{ padding: "4px 10px", borderRadius: 20, background: "rgba(239,68,68,0.15)",
            border: "1px solid rgba(239,68,68,0.3)" }}>
            <p style={{ fontSize: 10, fontWeight: 800, color: C.red }}>At Risk</p>
          </div>
        )}
        <ChevronRight style={{ color: "rgba(255,255,255,0.2)", width: 16, height: 16 }} />
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ flex: 1, padding: "8px 10px", borderRadius: 10,
          background: checkedToday ? "rgba(16,185,129,0.08)" : "rgba(255,255,255,0.03)",
          border: `1px solid ${checkedToday ? "rgba(16,185,129,0.25)" : "rgba(255,255,255,0.06)"}` }}>
          {checkedToday
            ? <CheckCircle2 style={{ color: C.emerald, width: 14, height: 14, marginBottom: 3 }} />
            : <Clock style={{ color: "rgba(255,255,255,0.25)", width: 14, height: 14, marginBottom: 3 }} />}
          <p style={{ fontSize: 10, color: checkedToday ? C.emerald : "rgba(255,255,255,0.3)", fontWeight: 700 }}>
            {checkedToday ? "Checked In" : "Not Checked In"}
          </p>
        </div>
        <div style={{ flex: 1, padding: "8px 10px", borderRadius: 10,
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 3 }}>
            <Flame style={{ color: C.teal, width: 12, height: 12 }} />
            <p style={{ fontSize: 14, fontWeight: 900, color: C.teal, lineHeight: 1 }}>{streak}</p>
          </div>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 700 }}>Day Streak</p>
        </div>
        <div style={{ flex: 1, padding: "8px 10px", borderRadius: 10,
          background: avgCraving >= 7 ? "rgba(239,68,68,0.06)" : "rgba(255,255,255,0.03)",
          border: `1px solid ${avgCraving >= 7 ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.06)"}` }}>
          <p style={{ fontSize: 14, fontWeight: 900, color: avgCraving >= 7 ? C.red : C.teal, lineHeight: 1, marginBottom: 3 }}>
            {avgCraving !== null ? avgCraving.toFixed(1) : "—"}
          </p>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 700 }}>Avg Craving</p>
        </div>
      </div>
    </div>
  );
}

export default function SupportUserDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("clients");

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: connections = [], isLoading: connLoading } = useQuery({
    queryKey: ["support-connections", user?.email],
    queryFn: () => base44.entities.ClientConnection.filter({
      support_user_email: user.email,
      connection_status: "accepted",
    }),
    enabled: !!user?.email,
  });

  const { data: pendingConnections = [] } = useQuery({
    queryKey: ["support-pending", user?.email],
    queryFn: () => base44.entities.ClientConnection.filter({
      support_user_email: user.email,
      connection_status: "pending",
    }),
    enabled: !!user?.email,
  });

  const clientEmails = connections.map(c => c.client_email);

  const { data: allCheckIns = [] } = useQuery({
    queryKey: ["support-checkins", clientEmails.join(",")],
    queryFn: () => base44.entities.DailyCheckIn.list("-check_in_date", 300),
    enabled: clientEmails.length > 0,
    select: data => data.filter(c => clientEmails.includes(c.participant_email)),
  });

  const atRiskCount = useMemo(() => {
    const sevenAgo = new Date(); sevenAgo.setDate(sevenAgo.getDate() - 7);
    const atRisk = new Set();
    allCheckIns.filter(c => new Date(c.check_in_date) >= sevenAgo && (c.craving_intensity ?? 0) >= 7)
      .forEach(c => atRisk.add(c.participant_email));
    return atRisk.size;
  }, [allCheckIns]);

  const today = new Date().toISOString().split("T")[0];
  const checkedInToday = new Set(allCheckIns.filter(c => c.check_in_date === today).map(c => c.participant_email)).size;

  const firstName = user?.full_name?.split(" ")[0] || "there";

  if (userLoading || connLoading) return (
    <div style={{ background: "#07090F", minHeight: "100vh" }}>
      <PageLoader label="Loading your dashboard…" />
    </div>
  );

  return (
    <div style={{ background: "linear-gradient(170deg,#07090F 0%,#0B0F1A 100%)", minHeight: "100vh", paddingBottom: 100 }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ background: "linear-gradient(150deg,#0D1020 0%,#08091A 100%)", padding: "60px 24px 28px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -60, right: -60, width: 240, height: 240, borderRadius: "50%",
            background: "radial-gradient(circle,rgba(99,102,241,0.12) 0%,transparent 70%)", pointerEvents: "none" }} />

          {/* Role badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 20,
            background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", marginBottom: 12 }}>
            <UserCheck style={{ color: C.indigo, width: 12, height: 12 }} />
            <p style={{ fontSize: 10, fontWeight: 800, color: C.indigo, letterSpacing: ".08em", textTransform: "uppercase" }}>Support User</p>
          </div>

          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#fff", lineHeight: 1.1, marginBottom: 4 }}>
            Hi, {firstName}
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 24 }}>
            Here's how your clients are doing today.
          </p>

          <div style={{ display: "flex", gap: 10 }}>
            <StatCard label="Clients" value={connections.length} color={C.teal} />
            <StatCard label="Checked In" value={`${checkedInToday}/${connections.length}`} color={C.emerald} sub="today" />
            <StatCard label="At Risk" value={atRiskCount} color={atRiskCount > 0 ? C.red : C.emerald} sub="7-day avg craving ≥7" />
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", padding: "10px 16px 0", background: "rgba(7,9,15,0.6)", gap: 4 }}>
          {[{ id: "clients", label: "My Clients" }, { id: "pending", label: `Pending${pendingConnections.length ? ` (${pendingConnections.length})` : ""}` }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, padding: "10px 6px", borderRadius: "10px 10px 0 0", border: "none", cursor: "pointer",
              background: tab === t.id ? "rgba(255,255,255,0.05)" : "transparent",
              borderBottom: tab === t.id ? `2px solid ${C.indigo}` : "2px solid transparent",
              color: tab === t.id ? C.indigo : "rgba(255,255,255,0.35)",
              fontWeight: tab === t.id ? 700 : 500, fontSize: 14,
            }}>{t.label}</button>
          ))}
        </div>

        <div style={{ padding: "20px 16px" }}>

          {tab === "clients" && (
            <>
              {connections.length === 0 ? (
                <div style={{ ...C.glass, borderRadius: 18, padding: "36px 24px", textAlign: "center" }}>
                  <Users style={{ color: "rgba(255,255,255,0.2)", width: 36, height: 36, margin: "0 auto 12px" }} />
                  <p style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 6 }}>No clients yet</p>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
                    Ask your clients to invite you via their Connections page, or share your email so they can add you.
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {connections.map(conn => (
                    <ClientCard key={conn.id} connection={conn} checkIns={allCheckIns} navigate={navigate} />
                  ))}
                </div>
              )}
            </>
          )}

          {tab === "pending" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {pendingConnections.length === 0 ? (
                <div style={{ ...C.glass, borderRadius: 18, padding: "36px 24px", textAlign: "center" }}>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>No pending invitations.</p>
                </div>
              ) : pendingConnections.map(conn => (
                <div key={conn.id} style={{ ...C.glass, borderRadius: 18, padding: "16px 18px" }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 4 }}>
                    {conn.client_email?.split("@")[0]}
                  </p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 12 }}>
                    wants to connect with you · {conn.permission_level === "limited_input" ? "Limited Input" : "View Only"}
                  </p>
                  {conn.invite_message && (
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", fontStyle: "italic", marginBottom: 12 }}>
                      "{conn.invite_message}"
                    </p>
                  )}
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={async () => {
                      await base44.entities.ClientConnection.update(conn.id, { connection_status: "accepted" });
                    }} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", cursor: "pointer",
                      background: "rgba(16,185,129,0.15)", color: C.emerald, fontWeight: 700, fontSize: 13 }}>
                      Accept
                    </button>
                    <button onClick={async () => {
                      await base44.entities.ClientConnection.update(conn.id, { connection_status: "revoked" });
                    }} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)",
                      cursor: "pointer", background: "transparent", color: "rgba(255,255,255,0.4)", fontWeight: 600, fontSize: 13 }}>
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Sign out */}
          <button onClick={() => base44.auth.logout()} style={{
            width: "100%", marginTop: 24, padding: "14px", borderRadius: 14,
            background: "transparent", border: "1px solid rgba(255,255,255,0.07)",
            color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 13, fontWeight: 600,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            <LogOut style={{ width: 14, height: 14 }} /> Sign out
          </button>
        </div>
      </div>
    </div>
  );
}