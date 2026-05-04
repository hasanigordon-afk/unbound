import React from "react";
import { Star } from "lucide-react";
import { SA_COLORS as C } from "@/lib/superAgentConfig";
import SACategoryPill from "./SACategoryPill";

export default function SAConversationCard({ conv, onClick }) {
  return (
    <button onClick={onClick} style={{
      textAlign: "left", background: "#fff", border: `1px solid ${C.border}`,
      borderRadius: 14, padding: "14px 16px", cursor: "pointer", width: "100%",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, gap: 8 }}>
        <SACategoryPill categoryKey={conv.category} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {conv.is_favorite && <Star style={{ width: 13, height: 13, color: C.gold }} fill={C.gold} />}
          <span style={{ fontSize: 11, color: C.dim }}>
            {new Date(conv.created_date).toLocaleDateString([], { month: "short", day: "numeric" })}
          </span>
        </div>
      </div>
      <p style={{
        fontSize: 14, color: C.text, fontWeight: 600, lineHeight: 1.5, marginBottom: 4,
        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
      }}>
        {conv.user_message}
      </p>
      {conv.ai_summary && (
        <p style={{ fontSize: 12, color: C.dim, lineHeight: 1.5,
          display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {conv.ai_summary}
        </p>
      )}
    </button>
  );
}