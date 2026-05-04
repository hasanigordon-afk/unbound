import React from "react";
import { SA_COLORS as C, SA_QUICK_ACTIONS } from "@/lib/superAgentConfig";

export default function SAQuickActions({ onAction, busyKey, savedKey }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
      {SA_QUICK_ACTIONS.map(qa => {
        const isBusy = busyKey === qa.key;
        const isSaved = savedKey === qa.key;
        return (
          <button key={qa.key} onClick={() => onAction(qa.key)} disabled={isBusy}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "7px 12px", borderRadius: 999,
              background: isSaved ? C.green : "#fff",
              color: isSaved ? "#fff" : C.muted,
              border: `1px solid ${isSaved ? C.green : C.border}`,
              fontSize: 12, fontWeight: 600, cursor: isBusy ? "default" : "pointer",
              opacity: isBusy ? 0.6 : 1,
              fontFamily: "'DM Sans', sans-serif",
            }}>
            <span style={{ fontSize: 13 }}>{qa.icon}</span>
            {isSaved ? "Saved ✓" : qa.label}
          </button>
        );
      })}
    </div>
  );
}