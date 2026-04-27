import React, { useState, useRef, useCallback, useEffect } from "react";
import { Mic, MicOff, Square } from "lucide-react";

const SpeechRecognition = typeof window !== "undefined"
  ? window.SpeechRecognition || window.webkitSpeechRecognition
  : null;

export default function VoiceRecorder({ onTranscript }) {
  const [listening, setListening] = useState(false);
  const [supported] = useState(!!SpeechRecognition);
  const [interim, setInterim] = useState("");
  const recognitionRef = useRef(null);

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setListening(false);
    setInterim("");
  }, []);

  const start = useCallback(() => {
    if (!SpeechRecognition) return;
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onresult = (e) => {
      let finalText = "";
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          finalText += t;
        } else {
          interimText += t;
        }
      }
      if (finalText) {
        onTranscript(finalText);
      }
      setInterim(interimText);
    };

    rec.onerror = () => stop();
    rec.onend = () => {
      setListening(false);
      setInterim("");
      recognitionRef.current = null;
    };

    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  }, [onTranscript, stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  if (!supported) return null;

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button
          type="button"
          onClick={listening ? stop : start}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 18px",
            borderRadius: 999,
            background: listening ? "rgba(224,122,108,0.12)" : "rgba(46,125,122,0.10)",
            border: `1px solid ${listening ? "rgba(224,122,108,0.30)" : "rgba(46,125,122,0.22)"}`,
            color: listening ? "#E07A6C" : "#2E7D7A",
            fontWeight: 600,
            fontSize: 13,
            fontFamily: "'DM Sans', sans-serif",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          {listening ? (
            <>
              <Square style={{ width: 14, height: 14 }} strokeWidth={2.2} fill="currentColor" />
              Stop Recording
            </>
          ) : (
            <>
              <Mic style={{ width: 14, height: 14 }} strokeWidth={2.2} />
              Speak Your Thoughts
            </>
          )}
        </button>

        {listening && (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 12, color: "#E07A6C", fontWeight: 600,
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%", background: "#E07A6C",
              animation: "pulse-dot 1.2s ease-in-out infinite",
            }} />
            Listening…
          </span>
        )}
      </div>

      {/* Interim preview */}
      {interim && (
        <p style={{
          marginTop: 8, padding: "10px 14px",
          borderRadius: 12, background: "rgba(46,125,122,0.06)",
          border: "1px solid rgba(46,125,122,0.14)",
          fontSize: 13, color: "#4A5763", lineHeight: 1.55,
          fontStyle: "italic",
        }}>
          {interim}
        </p>
      )}

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.4; transform: scale(0.75); }
        }
      `}</style>
    </div>
  );
}