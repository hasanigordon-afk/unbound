import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { Mic, Pencil, ArrowLeft, Loader2, Square, History, Sparkles } from "lucide-react";
import FiveWsTipsBanner from "@/components/fivews/FiveWsTipsBanner";
import FiveWsResponse  from "@/components/fivews/FiveWsResponse";
import FiveWsStreak    from "@/components/fivews/FiveWsStreak";
import VoiceWaveform   from "@/components/fivews/VoiceWaveform";
import { generateFiveWsResponse } from "@/components/fivews/fiveWsAI";

const NAVY  = "#0F1E3D";
const GOLD  = "#C8932F";
const CREAM = "#F6F4EF";
const TEXT  = "#1A1F2C";
const MUTED = "#4A5260";
const DIM   = "#6B7280";
const CARD  = "#FFFFFF";
const BORDER = "#E4DFD3";

const SpeechRecognition = typeof window !== "undefined"
  ? window.SpeechRecognition || window.webkitSpeechRecognition
  : null;

const DAILY_PROMPT = "What's one thing on your mind today?";

export default function FiveWs() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [mode, setMode] = useState(null);                // null | "voice" | "text"
  const [textInput, setTextInput] = useState("");
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceInterim, setVoiceInterim] = useState("");
  const [listening, setListening] = useState(false);

  const [conversation, setConversation] = useState(null); // { user_input, ai_response, summary, takeaway, tags, mood, follow_ups: [] }
  const [thinking, setThinking] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedEntryId, setSavedEntryId] = useState(null);

  const recognitionRef = useRef(null);

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: entries = [] } = useQuery({
    queryKey: ["fivews-entries", user?.email],
    queryFn: () => base44.entities.FiveWsEntry.filter({ user_email: user.email }, "-created_date", 90),
    enabled: !!user?.email,
  });

  /* ── Voice recording ─────────────────────────────────────────────────── */
  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setListening(false);
  };

  const startRecording = () => {
    if (!SpeechRecognition) {
      alert("Voice input isn't supported in this browser. Try the 'Write It Out' option.");
      return;
    }
    setVoiceTranscript("");
    setVoiceInterim("");
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onresult = (e) => {
      let finalText = "";
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t;
        else interimText += t;
      }
      if (finalText) setVoiceTranscript(prev => (prev + " " + finalText).trim());
      setVoiceInterim(interimText);
    };
    rec.onerror = () => stopRecording();
    rec.onend = () => {
      setListening(false);
      setVoiceInterim("");
      recognitionRef.current = null;
    };

    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  };

  // Auto-submit when user stops speaking voice mode
  const handleStopAndSubmit = async () => {
    stopRecording();
    const finalText = (voiceTranscript + " " + voiceInterim).trim();
    if (!finalText) return;
    await submitToAI(finalText, "voice");
  };

  useEffect(() => () => { if (recognitionRef.current) recognitionRef.current.stop(); }, []);

  /* ── Submit ──────────────────────────────────────────────────────────── */
  const submitToAI = async (input, inputType) => {
    setThinking(true);
    const result = await generateFiveWsResponse({ userInput: input });
    setConversation({
      user_input: input,
      input_type: inputType,
      ai_response: result.response,
      ai_summary: result.summary,
      ai_takeaway: result.takeaway,
      ai_tags: result.tags,
      mood_tag: result.mood,
      follow_ups: [],
    });
    setThinking(false);
  };

  const handleTextSubmit = async () => {
    const input = textInput.trim();
    if (!input) return;
    await submitToAI(input, "text");
  };

  /* ── Save / favorite / follow-up ─────────────────────────────────────── */
  const handleSave = async () => {
    if (!conversation || !user?.email) return;
    setSaving(true);
    const created = await base44.entities.FiveWsEntry.create({
      user_email: user.email,
      input_type: conversation.input_type,
      user_input: conversation.user_input,
      ai_response: conversation.ai_response,
      ai_summary: conversation.ai_summary,
      ai_takeaway: conversation.ai_takeaway,
      ai_tags: conversation.ai_tags,
      mood_tag: conversation.mood_tag,
      follow_ups: conversation.follow_ups,
      is_favorite: false,
    });
    setSavedEntryId(created?.id || null);
    setSaved(true);
    setSaving(false);
    queryClient.invalidateQueries({ queryKey: ["fivews-entries"] });
  };

  const handleFollowUp = async (followUpInput) => {
    const history = [
      { user_input: conversation.user_input, ai_response: conversation.ai_response },
      ...conversation.follow_ups.map(f => ({ user_input: f.user_input, ai_response: f.ai_response })),
    ];
    const result = await generateFiveWsResponse({ userInput: followUpInput, history });
    const newFollowUp = {
      user_input: followUpInput,
      ai_response: result.response,
      timestamp: new Date().toISOString(),
    };
    const updated = {
      ...conversation,
      follow_ups: [...conversation.follow_ups, newFollowUp],
    };
    setConversation(updated);

    // If already saved, update the stored entry too
    if (savedEntryId) {
      await base44.entities.FiveWsEntry.update(savedEntryId, { follow_ups: updated.follow_ups });
      queryClient.invalidateQueries({ queryKey: ["fivews-entries"] });
    }
  };

  const resetAll = () => {
    setMode(null);
    setTextInput("");
    setVoiceTranscript("");
    setVoiceInterim("");
    setConversation(null);
    setSaved(false);
    setSavedEntryId(null);
    stopRecording();
  };

  /* ── Render ──────────────────────────────────────────────────────────── */
  return (
    <div style={{ background: CREAM, minHeight: "100vh", paddingBottom: 120 }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>

        {/* Header */}
        <div style={{
          padding: "44px 20px 22px",
          background: `linear-gradient(180deg, #fff 0%, ${CREAM} 100%)`,
          borderBottom: `1px solid ${BORDER}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <button onClick={() => conversation ? resetAll() : navigate(-1)}
              style={{
                background: "transparent", border: "none", cursor: "pointer", padding: 0,
                display: "inline-flex", alignItems: "center", gap: 6,
                color: MUTED, fontSize: 13, fontWeight: 600,
              }}>
              <ArrowLeft style={{ width: 15, height: 15 }} /> {conversation ? "Start over" : "Back"}
            </button>
            <Link to="/FiveWsHistory" style={{ textDecoration: "none" }}>
              <button style={{
                background: "rgba(15,30,61,0.06)", border: "1px solid rgba(15,30,61,0.14)",
                borderRadius: 999, padding: "7px 13px",
                display: "inline-flex", alignItems: "center", gap: 6,
                color: NAVY, fontSize: 12.5, fontWeight: 700, cursor: "pointer",
              }}>
                <History style={{ width: 13, height: 13 }} /> My History
              </button>
            </Link>
          </div>

          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 6 }}>
            <h1 style={{
              fontFamily: "'Lora', Georgia, serif",
              fontSize: 36, fontWeight: 700, color: NAVY, lineHeight: 1, letterSpacing: "-.01em",
            }}>
              5 W<span style={{ color: GOLD }}>s</span>
            </h1>
            <FiveWsStreak entries={entries} />
          </div>
          <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.55, marginBottom: 4, fontWeight: 600 }}>
            Talk it out. Write it out. Figure it out.
          </p>
          <p style={{ fontSize: 13, color: DIM, lineHeight: 1.6 }}>
            Ask anything on your mind. Big or small — we'll break it down together.
          </p>
        </div>

        <div style={{ padding: "20px 16px" }}>

          {!conversation && !thinking && <FiveWsTipsBanner />}

          {/* ── Idle: choose mode ───────────────────────────────────────── */}
          {!mode && !conversation && !thinking && (
            <>
              {/* Daily prompt */}
              <div style={{
                background: "rgba(200,147,47,0.08)",
                border: "1px solid rgba(200,147,47,0.22)",
                borderRadius: 16, padding: "14px 16px", marginBottom: 18,
                display: "flex", alignItems: "flex-start", gap: 10,
              }}>
                <Sparkles style={{ width: 16, height: 16, color: GOLD, flexShrink: 0, marginTop: 2 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 11, fontWeight: 800, color: GOLD,
                    textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 4 }}>
                    Today's prompt
                  </p>
                  <p style={{ fontSize: 14, color: TEXT, lineHeight: 1.55, fontWeight: 600 }}>{DAILY_PROMPT}</p>
                </div>
              </div>

              <p style={{ fontSize: 10, fontWeight: 700, color: DIM,
                textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 12 }}>
                How do you want to start?
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
                {/* Talk It Out */}
                <button onClick={() => { setMode("voice"); setTimeout(() => startRecording(), 100); }}
                  style={{
                    background: NAVY, border: "none", borderRadius: 22,
                    padding: "26px 18px", cursor: "pointer", color: "#fff",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
                    boxShadow: "0 6px 20px rgba(15,30,61,0.20)",
                    fontFamily: "'DM Sans', sans-serif",
                  }}>
                  <div style={{
                    width: 54, height: 54, borderRadius: "50%",
                    background: "rgba(200,147,47,0.20)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Mic style={{ width: 26, height: 26, color: GOLD }} strokeWidth={2} />
                  </div>
                  <p style={{ fontSize: 16, fontWeight: 700 }}>Talk It Out</p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", textAlign: "center", lineHeight: 1.5 }}>
                    Speak freely. We'll listen.
                  </p>
                </button>

                {/* Write It Out */}
                <button onClick={() => setMode("text")}
                  style={{
                    background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 22,
                    padding: "26px 18px", cursor: "pointer",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
                    boxShadow: "0 4px 16px rgba(15,30,61,0.06)",
                    fontFamily: "'DM Sans', sans-serif",
                  }}>
                  <div style={{
                    width: 54, height: 54, borderRadius: "50%",
                    background: "rgba(15,30,61,0.07)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Pencil style={{ width: 24, height: 24, color: NAVY }} strokeWidth={2} />
                  </div>
                  <p style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>Write It Out</p>
                  <p style={{ fontSize: 12, color: DIM, textAlign: "center", lineHeight: 1.5 }}>
                    Type what's on your mind.
                  </p>
                </button>
              </div>

              <p style={{ textAlign: "center", fontSize: 12, color: DIM, lineHeight: 1.65,
                fontStyle: "italic", padding: "0 12px" }}>
                You're not alone in this.
              </p>
            </>
          )}

          {/* ── Voice mode ──────────────────────────────────────────────── */}
          {mode === "voice" && !conversation && !thinking && (
            <div style={{
              background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 22,
              padding: "26px 22px", textAlign: "center",
              boxShadow: "0 4px 16px rgba(15,30,61,0.05)",
            }}>
              <p style={{ fontSize: 11, fontWeight: 800, color: GOLD,
                textTransform: "uppercase", letterSpacing: ".14em", marginBottom: 12 }}>
                Talk It Out
              </p>
              <VoiceWaveform active={listening} />
              <p style={{ fontSize: 13, color: listening ? NAVY : DIM, marginTop: 14,
                fontWeight: 600, lineHeight: 1.55 }}>
                {listening ? "Listening… speak freely." : "Tap the mic to start."}
              </p>

              {(voiceTranscript || voiceInterim) && (
                <div style={{
                  marginTop: 16, padding: "14px 16px", borderRadius: 14,
                  background: CREAM, border: `1px solid ${BORDER}`,
                  textAlign: "left",
                }}>
                  <p style={{ fontSize: 14, color: TEXT, lineHeight: 1.65 }}>
                    {voiceTranscript}
                    {voiceInterim && (
                      <span style={{ color: DIM, fontStyle: "italic" }}> {voiceInterim}</span>
                    )}
                  </p>
                </div>
              )}

              <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 20, flexWrap: "wrap" }}>
                {!listening ? (
                  <button onClick={startRecording}
                    style={primaryBtn(NAVY)}>
                    <Mic style={{ width: 14, height: 14 }} /> Start
                  </button>
                ) : (
                  <button onClick={handleStopAndSubmit}
                    style={primaryBtn(GOLD)}>
                    <Square style={{ width: 13, height: 13 }} fill="currentColor" /> Stop & Send
                  </button>
                )}
                <button onClick={resetAll} style={ghostBtn()}>Cancel</button>
              </div>
            </div>
          )}

          {/* ── Text mode ───────────────────────────────────────────────── */}
          {mode === "text" && !conversation && !thinking && (
            <div style={{
              background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 22,
              padding: "20px", boxShadow: "0 4px 16px rgba(15,30,61,0.05)",
            }}>
              <p style={{ fontSize: 11, fontWeight: 800, color: NAVY,
                textTransform: "uppercase", letterSpacing: ".14em", marginBottom: 12 }}>
                Write It Out
              </p>
              <textarea
                autoFocus
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="What's on your mind? Ask anything…"
                rows={7}
                style={{
                  width: "100%", border: "none", outline: "none", resize: "none",
                  background: "transparent", color: TEXT, fontSize: 16,
                  fontFamily: "inherit", lineHeight: 1.65, padding: 0,
                  boxSizing: "border-box",
                }}
              />
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 14 }}>
                <button onClick={resetAll} style={ghostBtn()}>Cancel</button>
                <button onClick={handleTextSubmit} disabled={!textInput.trim()}
                  style={{
                    ...primaryBtn(NAVY),
                    opacity: !textInput.trim() ? 0.5 : 1,
                    cursor: !textInput.trim() ? "default" : "pointer",
                  }}>
                  Let's figure it out →
                </button>
              </div>
            </div>
          )}

          {/* ── Thinking ────────────────────────────────────────────────── */}
          {thinking && (
            <div style={{
              background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 22,
              padding: "40px 22px", textAlign: "center",
              boxShadow: "0 4px 16px rgba(15,30,61,0.05)",
            }}>
              <Loader2 className="animate-spin" style={{ width: 28, height: 28, color: GOLD, margin: "0 auto 14px" }} />
              <p style={{ fontSize: 14, color: TEXT, fontWeight: 600, marginBottom: 4 }}>Thinking it through…</p>
              <p style={{ fontSize: 12, color: DIM, lineHeight: 1.6 }}>Breaking it down — one moment.</p>
            </div>
          )}

          {/* ── Conversation ────────────────────────────────────────────── */}
          {conversation && !thinking && (
            <FiveWsResponse
              userInput={conversation.user_input}
              aiResponse={conversation.ai_response}
              aiSummary={conversation.ai_summary}
              aiTakeaway={conversation.ai_takeaway}
              tags={conversation.ai_tags}
              mood={conversation.mood_tag}
              followUps={conversation.follow_ups}
              onSave={handleSave}
              onAskFollowUp={handleFollowUp}
              onDone={resetAll}
              saving={saving}
              saved={saved}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function primaryBtn(bg) {
  return {
    background: bg, color: "#fff", border: "none",
    padding: "12px 22px", borderRadius: 999, fontSize: 14, fontWeight: 700,
    cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
    display: "inline-flex", alignItems: "center", gap: 6,
  };
}
function ghostBtn() {
  return {
    background: "transparent", color: "#4A5260", border: `1px solid ${BORDER}`,
    padding: "12px 20px", borderRadius: 999, fontSize: 14, fontWeight: 600,
    cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
  };
}