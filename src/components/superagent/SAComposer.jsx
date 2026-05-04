import React, { useState, useRef, useEffect } from "react";
import { Mic, Pencil, Square, Send, Loader2 } from "lucide-react";
import { SA_COLORS as C } from "@/lib/superAgentConfig";
import SAVoiceWaveform from "./SAVoiceWaveform";

const SR = typeof window !== "undefined"
  ? window.SpeechRecognition || window.webkitSpeechRecognition
  : null;

export default function SAComposer({ onSubmit, thinking, mode, setMode }) {
  const [text, setText] = useState("");
  const [voiceText, setVoiceText] = useState("");
  const [interim, setInterim] = useState("");
  const [listening, setListening] = useState(false);
  const recRef = useRef(null);

  const stop = () => {
    if (recRef.current) { recRef.current.stop(); recRef.current = null; }
    setListening(false);
  };

  const start = () => {
    if (!SR) {
      alert("Voice input isn't supported in this browser. Use 'Write' instead.");
      return;
    }
    setVoiceText(""); setInterim("");
    const rec = new SR();
    rec.continuous = true; rec.interimResults = true; rec.lang = "en-US";
    rec.onresult = (e) => {
      let f = "", it = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) f += t; else it += t;
      }
      if (f) setVoiceText(prev => (prev + " " + f).trim());
      setInterim(it);
    };
    rec.onerror = () => stop();
    rec.onend = () => { setListening(false); setInterim(""); recRef.current = null; };
    recRef.current = rec; rec.start(); setListening(true);
  };

  useEffect(() => () => { if (recRef.current) recRef.current.stop(); }, []);

  const submitVoice = () => {
    stop();
    const final = (voiceText + " " + interim).trim();
    if (!final) return;
    onSubmit(final, "voice");
    setVoiceText(""); setInterim("");
  };

  const submitText = () => {
    const v = text.trim();
    if (!v) return;
    onSubmit(v, "text");
    setText("");
  };

  if (!mode) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {/* Talk */}
        <button onClick={() => { setMode("voice"); setTimeout(start, 100); }}
          style={{
            background: C.navy, border: "none", borderRadius: 22, padding: "26px 18px",
            cursor: "pointer", color: "#fff", display: "flex", flexDirection: "column",
            alignItems: "center", gap: 12, boxShadow: "0 6px 20px rgba(15,30,61,0.20)",
            fontFamily: "'DM Sans', sans-serif",
          }}>
          <div style={{
            width: 54, height: 54, borderRadius: "50%", background: "rgba(200,147,47,0.20)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Mic style={{ width: 26, height: 26, color: C.gold }} strokeWidth={2} />
          </div>
          <p style={{ fontSize: 16, fontWeight: 700 }}>Talk to SuperAgent</p>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", textAlign: "center", lineHeight: 1.5 }}>
            Speak freely. We'll listen.
          </p>
        </button>

        {/* Write */}
        <button onClick={() => setMode("text")}
          style={{
            background: "#fff", border: `1px solid ${C.border}`, borderRadius: 22, padding: "26px 18px",
            cursor: "pointer", display: "flex", flexDirection: "column",
            alignItems: "center", gap: 12, boxShadow: "0 4px 16px rgba(15,30,61,0.06)",
            fontFamily: "'DM Sans', sans-serif",
          }}>
          <div style={{
            width: 54, height: 54, borderRadius: "50%", background: "rgba(15,30,61,0.07)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Pencil style={{ width: 24, height: 24, color: C.navy }} strokeWidth={2} />
          </div>
          <p style={{ fontSize: 16, fontWeight: 700, color: C.text }}>Write to SuperAgent</p>
          <p style={{ fontSize: 12, color: C.dim, textAlign: "center", lineHeight: 1.5 }}>
            Type what's on your mind.
          </p>
        </button>
      </div>
    );
  }

  if (mode === "voice") {
    return (
      <div style={{
        background: "#fff", border: `1px solid ${C.border}`, borderRadius: 22,
        padding: "24px 22px", textAlign: "center",
        boxShadow: "0 4px 16px rgba(15,30,61,0.05)",
      }}>
        <p style={{ fontSize: 11, fontWeight: 800, color: C.gold,
          textTransform: "uppercase", letterSpacing: ".14em", marginBottom: 12 }}>
          Talking to SuperAgent
        </p>
        <SAVoiceWaveform active={listening} />
        <p style={{ fontSize: 13, color: listening ? C.navy : C.dim, marginTop: 12,
          fontWeight: 600, lineHeight: 1.55 }}>
          {listening ? "Listening… speak freely." : "Tap the mic to start."}
        </p>
        {(voiceText || interim) && (
          <div style={{
            marginTop: 14, padding: "12px 14px", borderRadius: 12,
            background: C.cream, border: `1px solid ${C.border}`, textAlign: "left",
          }}>
            <p style={{ fontSize: 14, color: C.text, lineHeight: 1.6 }}>
              {voiceText}
              {interim && <span style={{ color: C.dim, fontStyle: "italic" }}> {interim}</span>}
            </p>
          </div>
        )}
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 16, flexWrap: "wrap" }}>
          {!listening
            ? <button onClick={start} style={btn(C.navy)}><Mic style={{ width: 14, height: 14 }} /> Start</button>
            : <button onClick={submitVoice} style={btn(C.gold)} disabled={thinking}>
                {thinking ? <Loader2 className="animate-spin" style={{ width: 14, height: 14 }} /> : <Square style={{ width: 13, height: 13 }} fill="#fff" />}
                Stop & Send
              </button>}
          <button onClick={() => { stop(); setMode(null); }} style={ghost()}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: "#fff", border: `1px solid ${C.border}`, borderRadius: 22, padding: "18px",
      boxShadow: "0 4px 16px rgba(15,30,61,0.05)",
    }}>
      <p style={{ fontSize: 11, fontWeight: 800, color: C.navy,
        textTransform: "uppercase", letterSpacing: ".14em", marginBottom: 10 }}>
        Writing to SuperAgent
      </p>
      <textarea
        autoFocus value={text} onChange={(e) => setText(e.target.value)}
        placeholder="What do you need help figuring out?"
        rows={5}
        style={{
          width: "100%", border: "none", outline: "none", resize: "none",
          background: "transparent", color: C.text, fontSize: 15,
          fontFamily: "inherit", lineHeight: 1.6, padding: 0, boxSizing: "border-box",
        }}
      />
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
        <button onClick={() => setMode(null)} style={ghost()}>Cancel</button>
        <button onClick={submitText} disabled={!text.trim() || thinking}
          style={{ ...btn(C.navy), opacity: !text.trim() || thinking ? 0.5 : 1 }}>
          {thinking ? <Loader2 className="animate-spin" style={{ width: 14, height: 14 }} /> : <Send style={{ width: 14, height: 14 }} />}
          Send
        </button>
      </div>
    </div>
  );
}

function btn(bg) {
  return {
    background: bg, color: "#fff", border: "none",
    padding: "11px 20px", borderRadius: 999, fontSize: 14, fontWeight: 700,
    cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
    display: "inline-flex", alignItems: "center", gap: 6,
  };
}
function ghost() {
  return {
    background: "transparent", color: "#4A5260", border: `1px solid ${"#E4DFD3"}`,
    padding: "11px 18px", borderRadius: 999, fontSize: 14, fontWeight: 600,
    cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
  };
}