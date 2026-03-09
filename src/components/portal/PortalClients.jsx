import React, { useState } from "react";
import { Search, ChevronRight, MessageSquare, FileText, TrendingUp } from "lucide-react";

const STATUS_CONFIG = {
  at_risk:         { label: "At Risk",         bg: "#FEF2F2", border: "#FECACA", text: "#DC2626" },
  needs_attention: { label: "Needs Attention", bg: "#FFFBEB", border: "#FDE68A", text: "#92400E" },
  stable:          { label: "Stable",          bg: "#F0FDF4", border: "#BBF7D0", text: "#166534" },
  new:             { label: "New",             bg: "#EFF6FF", border: "#BFDBFE", text: "#1D4ED8" },
  inactive:        { label: "Inactive",        bg: "#F8FAFC", border: "#E2E8F0", text: "#475569" },
};

function ClientRow({ client, onView, onMessage, onNote, onProgress }) {
  const cfg = STATUS_CONFIG[client.status] || STATUS_CONFIG.stable;
  const lastSeen = client.lastCheckIn
    ? `${Math.floor((new Date() - new Date(client.lastCheckIn)) / 86400000)}d ago`
    : "Never checked in";

  return (
    <div style={{
      background: "#FFF", border: "1px solid #E2E8F0", borderRadius: 12,
      padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
    }}>
      {/* Avatar */}
      <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <span style={{ fontWeight: 700, fontSize: 16, color: "#3B82F6" }}>{client.displayName.charAt(0).toUpperCase()}</span>
      </div>

      {/* Name + badges */}
      <div style={{ flex: 1, minWidth: 160 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
          <p style={{ fontWeight: 700, fontSize: 15, color: "#0F172A" }}>{client.displayName}</p>
          <span style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.text, borderRadius: 20, padding: "2px 9px", fontSize: 11, fontWeight: 700 }}>
            {cfg.label}
          </span>
        </div>
        <p style={{ fontSize: 12, color: "#94A3B8" }}>
          {client.engagement}% check-ins this week · Last seen: {lastSeen} · {client.program_type?.replace(/_/g, " ") || "No program"}
        </p>
      </div>

      {/* Quick Actions */}
      <div style={{ display: "flex", gap: 8, flexShrink: 0, flexWrap: "wrap" }}>
        <ActionBtn icon={<MessageSquare className="w-4 h-4" />} label="Message" onClick={onMessage} />
        <ActionBtn icon={<FileText className="w-4 h-4" />} label="Note" onClick={onNote} />
        <ActionBtn icon={<TrendingUp className="w-4 h-4" />} label="Progress" onClick={onProgress} />
        <button onClick={onView}
          style={{ background: "#3B82F6", color: "#FFF", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
          View Profile <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

function ActionBtn({ icon, label, onClick }) {
  return (
    <button onClick={onClick}
      style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, color: "#475569", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
      {icon} {label}
    </button>
  );
}

export default function PortalClients({ participants, onSelectClient, onNavigate }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("status");

  const filtered = participants
    .filter(p => {
      const matchSearch = p.displayName.toLowerCase().includes(search.toLowerCase()) ||
        p.participant_email.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || p.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === "status") {
        const order = { at_risk: 0, needs_attention: 1, new: 2, stable: 3, inactive: 4 };
        return (order[a.status] ?? 5) - (order[b.status] ?? 5);
      }
      if (sortBy === "name") return a.displayName.localeCompare(b.displayName);
      if (sortBy === "recent") return (b.lastCheckIn || 0) > (a.lastCheckIn || 0) ? 1 : -1;
      if (sortBy === "engagement") return b.engagement - a.engagement;
      return 0;
    });

  return (
    <div style={{ padding: "28px 28px 40px", maxWidth: 960, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>My Clients</h1>
        <p style={{ color: "#64748B", fontSize: 14 }}>{participants.length} people assigned to you</p>
      </div>

      {/* Filters */}
      <div style={{ background: "#FFF", border: "1px solid #E2E8F0", borderRadius: 12, padding: "16px 20px", marginBottom: 20, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
          <Search className="w-4 h-4" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            style={{ width: "100%", paddingLeft: 32, paddingRight: 12, height: 38, border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 13, color: "#1E293B", outline: "none", background: "#F8FAFC", boxSizing: "border-box" }} />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          style={{ height: 38, border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 13, color: "#1E293B", padding: "0 12px", background: "#F8FAFC", outline: "none" }}>
          <option value="all">All Statuses</option>
          <option value="at_risk">At Risk</option>
          <option value="needs_attention">Needs Attention</option>
          <option value="stable">Stable</option>
          <option value="new">New</option>
          <option value="inactive">Inactive</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          style={{ height: 38, border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 13, color: "#1E293B", padding: "0 12px", background: "#F8FAFC", outline: "none" }}>
          <option value="status">Sort by Status</option>
          <option value="name">Sort by Name</option>
          <option value="recent">Most Recent</option>
          <option value="engagement">Engagement</option>
        </select>
      </div>

      {/* Client list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map(client => (
          <ClientRow
            key={client.id}
            client={client}
            onView={() => onSelectClient(client)}
            onMessage={() => onSelectClient({ ...client, _openTab: "messages" })}
            onNote={() => onSelectClient({ ...client, _openTab: "notes" })}
            onProgress={() => onSelectClient({ ...client, _openTab: "progress" })}
          />
        ))}
        {filtered.length === 0 && (
          <div style={{ background: "#FFF", border: "1px solid #E2E8F0", borderRadius: 12, padding: 48, textAlign: "center" }}>
            <p style={{ color: "#94A3B8", fontSize: 14 }}>No clients match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}