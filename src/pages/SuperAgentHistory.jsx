import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Loader2, X } from "lucide-react";
import { SA_COLORS as C, SA_CATEGORIES } from "@/lib/superAgentConfig";
import SAConversationCard from "@/components/superagent/SAConversationCard";

export default function SuperAgentHistory() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ["sa-conversations-all", user?.email],
    queryFn: () => base44.entities.SuperAgentConversation.filter(
      { user_email: user.email }, "-created_date", 200
    ),
    enabled: !!user?.email,
  });

  const filtered = useMemo(() => {
    return conversations.filter(c => {
      if (catFilter && c.category !== catFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const hay = `${c.user_message} ${c.ai_response} ${c.ai_summary || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [conversations, search, catFilter]);

  return (
    <div style={{ background: C.cream, minHeight: "100vh", paddingBottom: 120 }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <div style={{ padding: "44px 20px 18px", background: "#fff", borderBottom: `1px solid ${C.border}` }}>
          <button onClick={() => navigate("/SuperAgent")} style={{
            background: "transparent", border: "none", padding: 0, cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: 6,
            color: C.muted, fontSize: 13, fontWeight: 600, marginBottom: 10,
          }}>
            <ArrowLeft style={{ width: 15, height: 15 }} /> SuperAgent
          </button>
          <h1 style={{
            fontFamily: "'Lora', Georgia, serif", fontSize: 26, fontWeight: 700,
            color: C.text, lineHeight: 1.2, marginBottom: 4,
          }}>
            My SuperAgent History
          </h1>
          <p style={{ fontSize: 13, color: C.dim }}>
            {conversations.length} {conversations.length === 1 ? "conversation" : "conversations"} saved
          </p>
        </div>

        <div style={{ padding: "16px" }}>
          {/* Search */}
          <div style={{
            background: "#fff", border: `1px solid ${C.border}`, borderRadius: 12,
            padding: "10px 14px", display: "flex", alignItems: "center", gap: 8, marginBottom: 12,
          }}>
            <Search style={{ width: 15, height: 15, color: C.dim }} />
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations…"
              style={{ flex: 1, border: "none", outline: "none", background: "transparent",
                fontSize: 14, color: C.text, padding: 0 }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>
                <X style={{ width: 14, height: 14, color: C.dim }} />
              </button>
            )}
          </div>

          {/* Category filter pills */}
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 6, marginBottom: 14 }}>
            <Pill label="All" active={!catFilter} onClick={() => setCatFilter("")} />
            {SA_CATEGORIES.map(cat => (
              <Pill key={cat.key} label={cat.label}
                active={catFilter === cat.key}
                onClick={() => setCatFilter(catFilter === cat.key ? "" : cat.key)} />
            ))}
          </div>

          {isLoading ? (
            <div style={{ textAlign: "center", padding: 40 }}>
              <Loader2 className="animate-spin" style={{ width: 22, height: 22, color: C.gold }} />
            </div>
          ) : filtered.length === 0 ? (
            <div style={{
              background: "#fff", border: `1px dashed ${C.border}`, borderRadius: 16,
              padding: "32px 20px", textAlign: "center",
            }}>
              <p style={{ fontSize: 14, color: C.text, fontWeight: 600, marginBottom: 6 }}>
                {conversations.length === 0 ? "No conversations yet" : "No matches"}
              </p>
              <p style={{ fontSize: 12.5, color: C.dim, lineHeight: 1.6 }}>
                {conversations.length === 0
                  ? "Save a SuperAgent conversation and it will appear here."
                  : "Try clearing your filters."}
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filtered.map(c => (
                <SAConversationCard key={c.id} conv={c}
                  onClick={() => navigate(`/SuperAgentChat?id=${c.id}`)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Pill({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      flexShrink: 0, padding: "6px 13px", borderRadius: 999,
      background: active ? C.navy : "#fff",
      border: `1px solid ${active ? C.navy : C.border}`,
      color: active ? "#fff" : C.muted,
      fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {label}
    </button>
  );
}