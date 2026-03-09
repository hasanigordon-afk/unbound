import React from "react";
import { AlertTriangle, Users, MessageSquare, TrendingUp, ChevronRight, Clock } from "lucide-react";

function StatCard({ value, label, color = "#3B82F6", sub }) {
  return (
    <div style={{ background: "#FFF", border: "1px solid #E2E8F0", borderRadius: 12, padding: "20px 24px" }}>
      <p style={{ fontSize: 32, fontWeight: 800, color, lineHeight: 1, marginBottom: 4 }}>{value}</p>
      <p style={{ fontSize: 12, fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</p>
      {sub && <p style={{ fontSize: 12, color: "#94A3B8", marginTop: 4 }}>{sub}</p>}
    </div>
  );
}

const STATUS_CONFIG = {
  at_risk:         { label: "At Risk",         color: "#FEF2F2", border: "#FECACA", text: "#DC2626", dot: "#EF4444" },
  needs_attention: { label: "Needs Attention", color: "#FFFBEB", border: "#FDE68A", text: "#92400E", dot: "#F59E0B" },
  stable:          { label: "Stable",          color: "#F0FDF4", border: "#BBF7D0", text: "#166534", dot: "#22C55E" },
  new:             { label: "New",             color: "#EFF6FF", border: "#BFDBFE", text: "#1D4ED8", dot: "#3B82F6" },
  inactive:        { label: "Inactive",        color: "#F8FAFC", border: "#E2E8F0", text: "#475569", dot: "#94A3B8" },
};

function ClientAttentionRow({ client, onSelectClient }) {
  const cfg = STATUS_CONFIG[client.status] || STATUS_CONFIG.stable;
  const lastSeen = client.lastCheckIn
    ? `${Math.floor((new Date() - new Date(client.lastCheckIn)) / 86400000)}d ago`
    : "Never";

  return (
    <button
      onClick={() => onSelectClient(client)}
      style={{
        display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
        background: "#FFF", border: "1px solid #E2E8F0", borderRadius: 10,
        width: "100%", textAlign: "left", cursor: "pointer",
        transition: "border-color 0.15s",
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "#CBD5E1"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "#E2E8F0"}
    >
      <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: "#3B82F6" }}>
          {client.displayName.charAt(0).toUpperCase()}
        </span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 600, fontSize: 14, color: "#0F172A", marginBottom: 3 }}>{client.displayName}</p>
        <p style={{ fontSize: 12, color: "#94A3B8" }}>
          {client.engagement}% check-ins · Last seen {lastSeen}
        </p>
      </div>
      <span style={{ background: cfg.color, border: `1px solid ${cfg.border}`, color: cfg.text, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
        {cfg.label}
      </span>
      <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: "#CBD5E1" }} />
    </button>
  );
}

export default function PortalDashboard({ participants, activeAlerts, onSelectClient, onNavigate, counselorProfile }) {
  const needsAttention = participants.filter(p => p.status === "at_risk" || p.status === "needs_attention")
    .sort((a, b) => (a.status === "at_risk" ? -1 : 1));
  const stable = participants.filter(p => p.status === "stable").length;
  const inactive = participants.filter(p => p.status === "inactive").length;
  const newClients = participants.filter(p => p.status === "new").length;
  const today = new Date().toISOString().split("T")[0];
  const checkedInToday = participants.filter(p =>
    p.last7CheckIns?.some(c => c.check_in_date === today)
  ).length;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const roleLabel = counselorProfile?.role_type?.replace("_", " ") || "professional";

  return (
    <div style={{ padding: "28px 28px 40px", maxWidth: 960, margin: "0 auto" }}>
      {/* Welcome */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>
          {greeting} 👋
        </h1>
        <p style={{ color: "#64748B", fontSize: 14 }}>
          Here's a quick overview of your clients today.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 28 }}>
        <StatCard value={participants.length} label="My Clients" color="#3B82F6" />
        <StatCard value={checkedInToday} label="Checked In Today" color="#22C55E" sub={`out of ${participants.length}`} />
        <StatCard value={needsAttention.length} label="Need Attention" color="#F59E0B" />
        <StatCard value={activeAlerts.length} label="Active Alerts" color="#EF4444" />
      </div>

      {/* Needs Attention */}
      {needsAttention.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <AlertTriangle className="w-4 h-4" style={{ color: "#F59E0B" }} />
              <p style={{ fontWeight: 700, fontSize: 13, color: "#0F172A" }}>Needs Attention</p>
            </div>
            <button onClick={() => onNavigate("clients")}
              style={{ fontSize: 13, color: "#3B82F6", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>
              See all clients →
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {needsAttention.slice(0, 6).map(c => (
              <ClientAttentionRow key={c.id} client={c} onSelectClient={onSelectClient} />
            ))}
          </div>
        </div>
      )}

      {/* Quick Overview */}
      <div style={{ background: "#FFF", border: "1px solid #E2E8F0", borderRadius: 12, padding: "20px 24px", marginBottom: 28 }}>
        <p style={{ fontWeight: 700, fontSize: 13, color: "#0F172A", marginBottom: 16 }}>Client Summary</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
          {[
            { label: "Stable", value: stable, color: "#22C55E" },
            { label: "Needs Attention", value: needsAttention.filter(p => p.status === "needs_attention").length, color: "#F59E0B" },
            { label: "At Risk", value: needsAttention.filter(p => p.status === "at_risk").length, color: "#EF4444" },
            { label: "New", value: newClients, color: "#3B82F6" },
            { label: "Inactive", value: inactive, color: "#94A3B8" },
          ].map(item => (
            <div key={item.label} style={{ textAlign: "center" }}>
              <p style={{ fontSize: 26, fontWeight: 800, color: item.color, lineHeight: 1 }}>{item.value}</p>
              <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 4 }}>{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <p style={{ fontWeight: 700, fontSize: 13, color: "#0F172A", marginBottom: 12 }}>Quick Access</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
          {[
            { icon: "💬", label: "Send a Message",     section: "messages" },
            { icon: "🔔", label: "View Alerts",         section: "alerts" },
            { icon: "📝", label: "Add a Note",          section: "notes" },
            { icon: "📊", label: "Review Progress",     section: "progress" },
            { icon: "🔗", label: "Find Resources",      section: "resources" },
          ].map(q => (
            <button key={q.section} onClick={() => onNavigate(q.section)}
              style={{
                background: "#FFF", border: "1px solid #E2E8F0", borderRadius: 10,
                padding: "16px", textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#F8FAFC"}
              onMouseLeave={e => e.currentTarget.style.background = "#FFF"}
            >
              <span style={{ fontSize: 20 }}>{q.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#1E293B" }}>{q.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}