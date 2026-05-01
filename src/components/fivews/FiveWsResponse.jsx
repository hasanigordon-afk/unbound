import React, { useState } from "react";
import { Star, Plus, Check, MessageCircle, Loader2 } from "lucide-react";

const NAVY  = "#0F1E3D";
const GOLD  = "#C8932F";
const TEXT  = "#1A1F2C";
const MUTED = "#4A5260";
const DIM   = "#6B7280";
const CARD  = "#FFFFFF";
const BORDER = "#E4DFD3";

/**
 * Renders the AI's response + the user's message + follow-up controls.
 * Used both during a fresh conversation and for revisiting saved entries.
 */
export default function FiveWsResponse({
  userInput,
  aiResponse,
  aiSummary,
  aiTakeaway,
  tags = [],
  mood,
  followUps = [],
  isFavorite = false,
  onSave,
  onToggleFavorite,
  onAskFollowUp,
  onDone,
  saving = false,
  saved = false,
  inHistoryView = false,
}) {
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [followUpText, setFollowUpText] = useState("");
  const [submittingFollowUp, setSubmittingFollowUp] = useState(false);

  const handleFollowUp = async () => {
    if (!followUpText.trim()) return;
    setSubmittingFollowUp(true);
    await onAskFollowUp(followUpText.trim());
    setFollowUpText("");
    setShowFollowUp(false);
    setSubmittingFollowUp(false);
  };

  return (
    <div>
      {/* User's message */}
      <div style={{
        background: "rgba(15,30,61,0.05)",
        border: "1px solid rgba(15,30,61,0.10)",
        borderRadius: 16, padding: "14px 16px", marginBottom: 14,
      }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: NAVY,
          textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 6 }}>You</p>
        <p style={{ fontSize: 14.5, color: TEXT, lineHeight: 1.65 }}>{userInput}</p>
      </div>

      {/* AI response */}
      <div style={{
        background: CARD,
        border: `1px solid ${BORDER}`,
        borderRadius: 18, padding: "18px 18px",
        boxShadow: "0 4px 14px rgba(15,30,61,0.05)",
        marginBottom: 14,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <div style={{
            width: 22, height: 22, borderRadius: 6,
            background: "rgba(200,147,47,0.16)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 800, color: GOLD,
          }}>5</div>
          <p style={{ fontSize: 11, fontWeight: 800, color: GOLD,
            textTransform: "uppercase", letterSpacing: ".12em" }}>5 Ws says</p>
        </div>

        <p style={{
          fontSize: 14.5, color: TEXT, lineHeight: 1.75, whiteSpace: "pre-wrap",
        }}>{aiResponse}</p>

        {aiTakeaway && (
          <div style={{
            marginTop: 14, padding: "12px 14px", borderRadius: 12,
            background: "rgba(200,147,47,0.08)", border: "1px solid rgba(200,147,47,0.22)",
          }}>
            <p style={{ fontSize: 10, fontWeight: 800, color: GOLD,
              textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 4 }}>Main takeaway</p>
            <p style={{ fontSize: 13.5, color: TEXT, lineHeight: 1.55, fontWeight: 600 }}>{aiTakeaway}</p>
          </div>
        )}

        {aiSummary && (
          <p style={{
            marginTop: 12, fontSize: 12.5, color: MUTED, lineHeight: 1.6,
            fontStyle: "italic", borderLeft: `2px solid ${GOLD}`, paddingLeft: 10,
          }}>
            {aiSummary}
          </p>
        )}

        {(tags.length > 0 || mood) && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
            {mood && (
              <span style={{
                fontSize: 11, fontWeight: 600, color: NAVY,
                background: "rgba(15,30,61,0.07)", border: "1px solid rgba(15,30,61,0.14)",
                padding: "3px 10px", borderRadius: 999,
              }}>{mood}</span>
            )}
            {tags.map(t => (
              <span key={t} style={{
                fontSize: 11, fontWeight: 600, color: GOLD,
                background: "rgba(200,147,47,0.10)", border: "1px solid rgba(200,147,47,0.24)",
                padding: "3px 10px", borderRadius: 999,
              }}>#{t}</span>
            ))}
          </div>
        )}
      </div>

      {/* Follow-ups thread */}
      {followUps.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          {followUps.map((fu, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{
                background: "rgba(15,30,61,0.05)",
                border: "1px solid rgba(15,30,61,0.10)",
                borderRadius: 16, padding: "12px 14px", marginBottom: 10,
              }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: NAVY,
                  textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 }}>You · follow-up</p>
                <p style={{ fontSize: 14, color: TEXT, lineHeight: 1.6 }}>{fu.user_input}</p>
              </div>
              <div style={{
                background: CARD, border: `1px solid ${BORDER}`,
                borderRadius: 16, padding: "14px 16px",
              }}>
                <p style={{ fontSize: 14, color: TEXT, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                  {fu.ai_response}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Follow-up composer */}
      {showFollowUp && (
        <div style={{
          background: CARD, border: `1px solid ${BORDER}`,
          borderRadius: 16, padding: "12px", marginBottom: 14,
        }}>
          <textarea
            autoFocus
            value={followUpText}
            onChange={(e) => setFollowUpText(e.target.value)}
            placeholder="Ask a follow-up…"
            rows={3}
            style={{
              width: "100%", border: "none", outline: "none", resize: "none",
              background: "transparent", color: TEXT, fontSize: 14,
              fontFamily: "inherit", lineHeight: 1.55, padding: 4, boxSizing: "border-box",
            }}
          />
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
            <button onClick={() => { setShowFollowUp(false); setFollowUpText(""); }}
              style={{ background: "transparent", border: "none", color: DIM,
                fontSize: 13, fontWeight: 600, cursor: "pointer", padding: "8px 12px" }}>
              Cancel
            </button>
            <button onClick={handleFollowUp} disabled={!followUpText.trim() || submittingFollowUp}
              style={{
                background: NAVY, color: "#fff", border: "none",
                padding: "8px 18px", borderRadius: 999, fontSize: 13, fontWeight: 700,
                cursor: !followUpText.trim() ? "default" : "pointer", opacity: !followUpText.trim() ? 0.5 : 1,
                display: "inline-flex", alignItems: "center", gap: 6,
              }}>
              {submittingFollowUp && <Loader2 className="animate-spin" style={{ width: 13, height: 13 }} />}
              Send
            </button>
          </div>
        </div>
      )}

      {/* Action row */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {!showFollowUp && (
          <button onClick={() => setShowFollowUp(true)}
            style={actionBtn(GOLD, "rgba(200,147,47,0.10)", "rgba(200,147,47,0.28)")}>
            <MessageCircle style={{ width: 14, height: 14 }} strokeWidth={2} />
            Ask a Follow-Up
          </button>
        )}

        {!inHistoryView && (
          <button onClick={onSave} disabled={saving || saved}
            style={actionBtn(NAVY, "rgba(15,30,61,0.07)", "rgba(15,30,61,0.18)")}>
            {saving ? <Loader2 className="animate-spin" style={{ width: 14, height: 14 }} />
              : saved ? <Check style={{ width: 14, height: 14 }} strokeWidth={2.4} />
              : <Plus style={{ width: 14, height: 14 }} strokeWidth={2.4} />}
            {saving ? "Saving…" : saved ? "Saved" : "Save Insight"}
          </button>
        )}

        {inHistoryView && (
          <button onClick={onToggleFavorite}
            style={actionBtn(GOLD, "rgba(200,147,47,0.10)", "rgba(200,147,47,0.28)")}>
            <Star style={{ width: 14, height: 14 }} strokeWidth={2}
              fill={isFavorite ? GOLD : "transparent"} />
            {isFavorite ? "Favorited" : "Favorite"}
          </button>
        )}

        {!inHistoryView && (
          <button onClick={onDone}
            style={actionBtn("#4A5260", "transparent", "#E4DFD3")}>
            Done for Now
          </button>
        )}
      </div>
    </div>
  );
}

function actionBtn(color, bg, border) {
  return {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "10px 16px", borderRadius: 999,
    background: bg, border: `1px solid ${border}`,
    color, fontSize: 13, fontWeight: 700,
    cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
  };
}