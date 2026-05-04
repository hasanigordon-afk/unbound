import React from "react";
import { SA_COLORS as C } from "@/lib/superAgentConfig";
import SACategoryPill from "./SACategoryPill";
import SAQuickActions from "./SAQuickActions";
import { AlertTriangle, ArrowRight } from "lucide-react";

export default function SAResponseCard({
  userMessage, response, summary, category, nextSteps = [], resources = [],
  isCrisis, onQuickAction, busyKey, savedKey, followUps = [],
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

      {/* User message bubble */}
      <div style={{
        background: C.navy, color: "#fff", padding: "12px 16px",
        borderRadius: "18px 18px 4px 18px", alignSelf: "flex-end", maxWidth: "88%",
        fontSize: 14, lineHeight: 1.55,
      }}>
        {userMessage}
      </div>

      {/* Crisis banner */}
      {isCrisis && (
        <div style={{
          background: "rgba(181,72,61,0.10)",
          border: `1px solid ${C.red}55`,
          borderRadius: 14, padding: "12px 14px",
          display: "flex", alignItems: "flex-start", gap: 10,
        }}>
          <AlertTriangle style={{ width: 18, height: 18, color: C.red, flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ fontSize: 12, fontWeight: 800, color: C.red, marginBottom: 4, textTransform: "uppercase", letterSpacing: ".1em" }}>
              You're not alone — get help right now
            </p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <a href="tel:911" style={crisisBtn(C.red)}>Call 911</a>
              <a href="tel:988" style={crisisBtn(C.red)}>Call 988</a>
              <a href="sms:741741" style={crisisBtn(C.red)}>Text HOME → 741741</a>
            </div>
          </div>
        </div>
      )}

      {/* AI response */}
      <div style={{
        background: "#fff", border: `1px solid ${C.border}`, borderRadius: "18px 18px 18px 4px",
        padding: "16px 18px", maxWidth: "92%", alignSelf: "flex-start",
        boxShadow: "0 4px 14px rgba(15,30,61,0.05)",
      }}>
        {category && (
          <div style={{ marginBottom: 10 }}>
            <SACategoryPill categoryKey={category} />
          </div>
        )}

        <p style={{ fontSize: 14.5, color: C.text, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
          {response}
        </p>

        {nextSteps.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <p style={{ fontSize: 10.5, fontWeight: 800, color: C.gold,
              textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 8 }}>
              Next steps
            </p>
            <ol style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6 }}>
              {nextSteps.map((s, i) => (
                <li key={i} style={{ fontSize: 13, color: C.text, lineHeight: 1.55 }}>{s}</li>
              ))}
            </ol>
          </div>
        )}

        {resources.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <p style={{ fontSize: 10.5, fontWeight: 800, color: C.navy,
              textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 8 }}>
              Resources
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {resources.map((r, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: C.cream, padding: "8px 12px", borderRadius: 10,
                  border: `1px solid ${C.border}`,
                }}>
                  <ArrowRight style={{ width: 13, height: 13, color: C.gold }} />
                  <span style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>{r}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <SAQuickActions onAction={onQuickAction} busyKey={busyKey} savedKey={savedKey} />
      </div>

      {/* Follow-up turns */}
      {followUps.map((f, i) => (
        <React.Fragment key={i}>
          <div style={{
            background: C.navy, color: "#fff", padding: "12px 16px",
            borderRadius: "18px 18px 4px 18px", alignSelf: "flex-end", maxWidth: "88%",
            fontSize: 14, lineHeight: 1.55,
          }}>
            {f.user_message}
          </div>
          <div style={{
            background: "#fff", border: `1px solid ${C.border}`, borderRadius: "18px 18px 18px 4px",
            padding: "14px 16px", maxWidth: "92%", alignSelf: "flex-start",
          }}>
            <p style={{ fontSize: 14, color: C.text, lineHeight: 1.65, whiteSpace: "pre-wrap" }}>{f.ai_response}</p>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

function crisisBtn(color) {
  return {
    fontSize: 12, fontWeight: 700, color: "#fff", background: color,
    padding: "6px 12px", borderRadius: 999, textDecoration: "none",
  };
}