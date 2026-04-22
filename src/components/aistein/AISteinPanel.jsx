// AI Stein — expanded panel: search, mic, chips, response
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { X, Send, Mic, MicOff, Sparkles, ArrowRight, Phone } from "lucide-react";
import { AIS, QUICK_ACTIONS, TAGLINE, detectCrisis } from "./aiSteinConfig";
import { askAIStein } from "./aiSteinBrain";
import { useVoiceInput } from "./useVoiceInput";
import { useCurrentUser } from "@/lib/useCurrentUser";

const timeOfDay = () => {
  const h = new Date().getHours();
  if (h < 5)  return "late night";
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  if (h < 21) return "evening";
  return "night";
};

export default function AISteinPanel({ open, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useCurrentUser();

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const inputRef = useRef(null);

  const { listening, supported, start, stop } = useVoiceInput({
    onResult: (text) => { setQuery(text); setTimeout(() => submit(text), 60); },
  });

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120);
  }, [open]);

  const context = useMemo(() => ({
    currentPath: location.pathname,
    timeOfDay:   timeOfDay(),
  }), [location.pathname]);

  const submit = async (overrideText) => {
    const q = (overrideText ?? query).trim();
    if (!q || loading) return;
    setLoading(true);
    setResponse(null);
    const res = await askAIStein({ query: q, user, context });
    setResponse(res);
    setLoading(false);
  };

  const goRoute = (route) => {
    if (!route) return;
    navigate(route);
    onClose?.();
  };

  const handleChip = (chip) => {
    setQuery(chip.label);
    navigate(chip.route);
    onClose?.();
  };

  const reset = () => { setQuery(""); setResponse(null); };

  if (!open) return null;

  const crisis = response?.crisis || detectCrisis(query);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(28,20,16,0.45)",
        backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        animation: "aisteinFade 0.2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 480,
          background: AIS.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24,
          boxShadow: "0 -20px 60px rgba(0,0,0,0.25)",
          maxHeight: "88vh", display: "flex", flexDirection: "column",
          animation: "aisteinSlide 0.32s cubic-bezier(0.2,0.8,0.2,1)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        {/* Grabber */}
        <div style={{ padding: "10px 0 4px", display: "flex", justifyContent: "center" }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: AIS.border }} />
        </div>

        {/* Header */}
        <div style={{ padding: "8px 20px 14px", display: "flex", alignItems: "center", gap: 12, borderBottom: `1px solid ${AIS.border}` }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12,
            background: `linear-gradient(135deg, ${AIS.accent} 0%, #8B6228 100%)`,
            display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
          }}>
            <Sparkles style={{ width: 18, height: 18 }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: AIS.text, fontFamily: "'Lora', serif", lineHeight: 1.15 }}>AI Stein</p>
            <p style={{ fontSize: 11, color: AIS.dim, marginTop: 2 }}>{TAGLINE}</p>
          </div>
          <button onClick={onClose} aria-label="Close"
            style={{ background: "transparent", border: "none", color: AIS.muted, cursor: "pointer", padding: 6 }}>
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>

        {/* Input */}
        <div style={{ padding: "14px 16px 8px" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 12px", background: AIS.surface,
            border: `1px solid ${AIS.border}`, borderRadius: 14,
          }}>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="Ask, search, or speak…"
              style={{
                flex: 1, border: "none", outline: "none", background: "transparent",
                fontSize: 15, color: AIS.text, fontFamily: "inherit", padding: 0,
              }}
            />
            {supported && (
              <button
                onClick={listening ? stop : start}
                aria-label={listening ? "Stop listening" : "Start voice input"}
                style={{
                  width: 34, height: 34, borderRadius: 10, border: "none", cursor: "pointer",
                  background: listening ? AIS.red : AIS.accentDim,
                  color: listening ? "#fff" : AIS.accent,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.15s",
                }}
              >
                {listening ? <MicOff style={{ width: 16, height: 16 }} /> : <Mic style={{ width: 16, height: 16 }} />}
              </button>
            )}
            <button
              onClick={() => submit()}
              disabled={!query.trim() || loading}
              aria-label="Send"
              style={{
                width: 34, height: 34, borderRadius: 10, border: "none",
                cursor: query.trim() && !loading ? "pointer" : "not-allowed",
                background: query.trim() && !loading ? AIS.accent : AIS.border,
                color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Send style={{ width: 15, height: 15 }} />
            </button>
          </div>
          {listening && (
            <p style={{ fontSize: 11, color: AIS.accent, textAlign: "center", marginTop: 6, fontWeight: 600 }}>
              Listening…
            </p>
          )}
        </div>

        {/* Scroll region */}
        <div style={{ flex: 1, overflowY: "auto", padding: "6px 16px 20px" }}>

          {/* Response or empty state */}
          {!response && !loading && (
            <div style={{
              padding: "16px 16px", borderRadius: 14,
              background: AIS.accentDim, border: `1px solid ${AIS.border}`,
              marginBottom: 14,
            }}>
              <p style={{ fontSize: 13, color: AIS.muted, lineHeight: 1.55 }}>
                Hey{user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}. What do you need right now? Tap a chip below, type a question, or press the mic.
              </p>
            </div>
          )}

          {loading && (
            <div style={{ padding: "18px 14px", display: "flex", alignItems: "center", gap: 10, color: AIS.muted }}>
              <div style={{
                width: 16, height: 16, borderRadius: "50%",
                border: `2px solid ${AIS.accentDim}`, borderTopColor: AIS.accent,
                animation: "aisteinSpin 0.8s linear infinite",
              }} />
              <span style={{ fontSize: 13 }}>Thinking…</span>
            </div>
          )}

          {response && (
            <div style={{
              padding: "14px 16px", borderRadius: 14, marginBottom: 12,
              background: crisis ? "rgba(201,83,79,0.06)" : AIS.surface,
              border: `1px solid ${crisis ? "rgba(201,83,79,0.3)" : AIS.border}`,
            }}>
              <p style={{ fontSize: 14, color: AIS.text, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                {response.message}
              </p>

              {response.steps?.length > 0 && (
                <ol style={{ marginTop: 12, paddingLeft: 20 }}>
                  {response.steps.map((s, i) => (
                    <li key={i} style={{ fontSize: 13, color: AIS.muted, lineHeight: 1.6, marginBottom: 4 }}>{s}</li>
                  ))}
                </ol>
              )}

              <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                {crisis && (
                  <a href="tel:988" style={{ textDecoration: "none" }}>
                    <button style={{
                      padding: "9px 14px", borderRadius: 20, border: "none", cursor: "pointer",
                      background: AIS.red, color: "#fff", fontWeight: 700, fontSize: 13,
                      display: "inline-flex", alignItems: "center", gap: 6,
                    }}>
                      <Phone style={{ width: 13, height: 13 }} /> Call 988
                    </button>
                  </a>
                )}
                {response.route && (
                  <button onClick={() => goRoute(response.route)} style={{
                    padding: "9px 14px", borderRadius: 20, border: "none", cursor: "pointer",
                    background: AIS.accent, color: "#fff", fontWeight: 700, fontSize: 13,
                    display: "inline-flex", alignItems: "center", gap: 6,
                  }}>
                    Take me there <ArrowRight style={{ width: 13, height: 13 }} />
                  </button>
                )}
                <button onClick={reset} style={{
                  padding: "9px 14px", borderRadius: 20, border: `1px solid ${AIS.border}`,
                  background: AIS.surface, color: AIS.muted, fontWeight: 600, fontSize: 13, cursor: "pointer",
                }}>
                  Ask something else
                </button>
              </div>
            </div>
          )}

          {/* Chips */}
          <p style={{
            fontSize: 10, fontWeight: 700, color: AIS.dim, textTransform: "uppercase",
            letterSpacing: ".1em", margin: "6px 0 10px",
          }}>
            Quick actions
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {QUICK_ACTIONS.map(c => (
              <button key={c.key} onClick={() => handleChip(c)} style={{
                padding: "9px 14px", borderRadius: 20,
                background: AIS.surface, border: `1px solid ${AIS.border}`,
                color: AIS.text, fontSize: 13, fontWeight: 600, cursor: "pointer",
                display: "inline-flex", alignItems: "center", gap: 6,
                transition: "all 0.15s",
              }}>
                <span>{c.emoji}</span>{c.label}
              </button>
            ))}
          </div>

          {/* Footer disclaimer */}
          <p style={{
            fontSize: 10, color: AIS.dim, textAlign: "center",
            marginTop: 18, lineHeight: 1.5, fontStyle: "italic",
          }}>
            AI Stein offers guidance only — not medical, clinical, or legal advice. In a crisis, call 911 or 988.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes aisteinFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes aisteinSlide { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes aisteinSpin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}