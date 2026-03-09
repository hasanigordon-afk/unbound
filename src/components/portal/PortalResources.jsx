import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Search, Send, ExternalLink } from "lucide-react";

const CATEGORIES = ["All", "Housing", "Food Pantry", "Employment Assistance", "Addiction Treatment", "Mental Health", "Reentry Services", "Legal Aid", "Transportation", "Peer Support"];

const CAT_EMOJI = {
  Housing: "🏠", "Food Pantry": "🍽️", "Employment Assistance": "💼",
  "Addiction Treatment": "💊", "Mental Health": "🧠", "Reentry Services": "🔓",
  "Legal Aid": "⚖️", Transportation: "🚌", "Peer Support": "🤝",
};

export default function PortalResources({ facilityId, user, participants }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sendTarget, setSendTarget] = useState(null);
  const [sendingId, setSendingId] = useState(null);

  const { data: resources = [] } = useQuery({
    queryKey: ["portal-resources"],
    queryFn: () => base44.entities.USRecoveryResource.list("-created_date", 200),
  });

  const sendResource = useMutation({
    mutationFn: ({ resource, clientEmail }) =>
      base44.entities.CounselorMessage.create({
        facility_id: facilityId,
        counselor_email: user.email,
        participant_email: clientEmail,
        message: `Resource recommendation: ${resource.organization_name} — ${resource.description || resource.resource_category}. ${resource.phone ? `Call: ${resource.phone}` : ""} ${resource.website ? `Website: ${resource.website}` : ""}`.trim(),
        message_type: "message",
      }),
    onSuccess: () => { setSendTarget(null); setSendingId(null); },
  });

  const filtered = resources.filter(r => {
    const matchSearch = !search ||
      r.organization_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase()) ||
      r.city?.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || r.resource_category === category;
    return matchSearch && matchCat;
  });

  return (
    <div style={{ padding: "28px 28px 40px", maxWidth: 960, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>Resources</h1>
        <p style={{ color: "#64748B", fontSize: 14 }}>Find and send support resources directly to your clients.</p>
      </div>

      <div style={{ background: "#FFF", border: "1px solid #E2E8F0", borderRadius: 12, padding: "16px 20px", marginBottom: 20, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
          <Search className="w-4 h-4" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, description, city…"
            style={{ width: "100%", paddingLeft: 32, height: 38, border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 13, color: "#1E293B", outline: "none", boxSizing: "border-box" }} />
        </div>
        <select value={category} onChange={e => setCategory(e.target.value)}
          style={{ height: 38, border: "1px solid #E2E8F0", borderRadius: 8, padding: "0 12px", fontSize: 13, color: "#1E293B", background: "#FFF", outline: "none" }}>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
        {filtered.slice(0, 40).map(r => (
          <div key={r.id} style={{ background: "#FFF", border: "1px solid #E2E8F0", borderRadius: 12, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ fontSize: 22, flexShrink: 0, lineHeight: 1 }}>{CAT_EMOJI[r.resource_category] || "📌"}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: 14, color: "#0F172A", lineHeight: 1.3, marginBottom: 3 }}>{r.organization_name}</p>
                <p style={{ fontSize: 11, color: "#94A3B8" }}>{r.resource_category} · {r.city}{r.county ? `, ${r.county} Co.` : ""}</p>
              </div>
            </div>
            {r.description && (
              <p style={{ fontSize: 12, color: "#64748B", lineHeight: 1.55 }}>{r.description.slice(0, 120)}{r.description.length > 120 ? "…" : ""}</p>
            )}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: "auto" }}>
              {r.phone && (
                <a href={`tel:${r.phone}`} style={{ background: "#F1F5F9", border: "1px solid #E2E8F0", borderRadius: 8, padding: "5px 10px", fontSize: 11, fontWeight: 600, color: "#475569", textDecoration: "none" }}>
                  📞 {r.phone}
                </a>
              )}
              {r.website && (
                <a href={r.website} target="_blank" rel="noreferrer"
                  style={{ background: "#F1F5F9", border: "1px solid #E2E8F0", borderRadius: 8, padding: "5px 10px", fontSize: 11, fontWeight: 600, color: "#475569", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                  <ExternalLink className="w-3 h-3" /> Website
                </a>
              )}
              <button onClick={() => sendTarget?.id === r.id ? setSendTarget(null) : setSendTarget(r)}
                style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 8, padding: "5px 10px", fontSize: 11, fontWeight: 600, color: "#2563EB", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                <Send className="w-3 h-3" /> Send to Client
              </button>
            </div>

            {sendTarget?.id === r.id && (
              <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: 10 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#0F172A", marginBottom: 8 }}>Send to which client?</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 160, overflowY: "auto" }}>
                  {participants.map(p => (
                    <button key={p.id} onClick={() => { setSendingId(r.id); sendResource.mutate({ resource: r, clientEmail: p.participant_email }); }}
                      style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, padding: "8px 12px", fontSize: 13, fontWeight: 600, color: "#1E293B", cursor: "pointer", textAlign: "left" }}>
                      {p.displayName}
                    </button>
                  ))}
                </div>
                {sendResource.isPending && sendingId === r.id && <p style={{ fontSize: 12, color: "#94A3B8", marginTop: 6 }}>Sending…</p>}
                {sendResource.isSuccess && sendingId === r.id && <p style={{ fontSize: 12, color: "#22C55E", marginTop: 6 }}>Sent ✓</p>}
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn: "1/-1", background: "#FFF", border: "1px solid #E2E8F0", borderRadius: 12, padding: 48, textAlign: "center" }}>
            <p style={{ color: "#94A3B8", fontSize: 14 }}>Nothing matched your search. Try a different term.</p>
          </div>
        )}
      </div>
    </div>
  );
}