import React, { useState, useEffect, useRef } from "react";

const DURATIONS = [
  { mins: 5,  label: "5 min",  desc: "Quick reset"       },
  { mins: 10, label: "10 min", desc: "Deep breath"        },
  { mins: 15, label: "15 min", desc: "Full reset"         },
];

const MESSAGES = [
  "This feeling is temporary. It will pass.",
  "You've gotten through hard moments before. This is one more.",
  "Your brain is looking for relief. Give it time — not the urge.",
  "Every minute you wait is a win. Keep going.",
  "You are stronger than this moment.",
  "Urges peak and fade. You're in the peak right now.",
  "Breathe. You don't have to act on this.",
  "This discomfort won't last forever. You will.",
];

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function UrgeTimer() {
  const [selected, setSelected] = useState(DURATIONS[0]);
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(DURATIONS[0].mins * 60);
  const [msgIdx, setMsgIdx] = useState(0);
  const [done, setDone] = useState(false);
  const intervalRef = useRef(null);

  const total = selected.mins * 60;
  const progress = 1 - remaining / total;

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining(r => {
          if (r <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            setDone(true);
            return 0;
          }
          // Rotate message every 30s
          if ((total - r + 1) % 30 === 0) setMsgIdx(i => (i + 1) % MESSAGES.length);
          return r - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const start = () => { setDone(false); setRunning(true); };
  const reset = () => {
    clearInterval(intervalRef.current);
    setRunning(false); setDone(false);
    setRemaining(selected.mins * 60); setMsgIdx(0);
  };
  const selectDuration = (d) => { setSelected(d); setRemaining(d.mins * 60); setRunning(false); setDone(false); setMsgIdx(0); };

  const circumference = 2 * Math.PI * 54;
  const strokeDash = circumference * (1 - progress);

  if (done) return (
    <div style={{ textAlign: "center", padding: "16px 0" }}>
      <p style={{ fontSize: 40, marginBottom: 12 }}>🌟</p>
      <p style={{ fontSize: 20, fontWeight: 900, color: "#2DD4BF", marginBottom: 8 }}>You made it through.</p>
      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, marginBottom: 20 }}>
        The urge is weaker now. You chose yourself over the craving. That's huge.
      </p>
      <button onClick={reset}
        style={{ padding: "12px 28px", borderRadius: 14, border: "none", cursor: "pointer",
          background: "rgba(45,212,191,0.15)", color: "#2DD4BF", fontWeight: 800, fontSize: 14 }}>
        Reset Timer
      </button>
    </div>
  );

  return (
    <div>
      {/* Duration picker */}
      {!running && (
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {DURATIONS.map(d => (
            <button key={d.mins} onClick={() => selectDuration(d)}
              style={{ flex: 1, padding: "10px 6px", borderRadius: 14, border: "none", cursor: "pointer",
                background: selected.mins === d.mins ? "rgba(45,212,191,0.12)" : "rgba(255,255,255,0.05)",
                border: `1.5px solid ${selected.mins === d.mins ? "rgba(45,212,191,0.4)" : "rgba(255,255,255,0.08)"}` }}>
              <p style={{ fontSize: 15, fontWeight: 800, color: selected.mins === d.mins ? "#2DD4BF" : "rgba(255,255,255,0.6)" }}>{d.label}</p>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{d.desc}</p>
            </button>
          ))}
        </div>
      )}

      {/* Circular timer */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
        <div style={{ position: "relative", width: 140, height: 140, marginBottom: 20 }}>
          <svg width="140" height="140" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="70" cy="70" r="54" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8" />
            <circle cx="70" cy="70" r="54" fill="none" stroke="#2DD4BF" strokeWidth="8"
              strokeDasharray={circumference} strokeDashoffset={running || progress > 0 ? circumference - circumference * progress : circumference}
              strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s linear" }} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center" }}>
            <p style={{ fontSize: 26, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{formatTime(remaining)}</p>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 3 }}>remaining</p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={running ? () => { clearInterval(intervalRef.current); setRunning(false); } : start}
            style={{ padding: "13px 32px", borderRadius: 14, border: "none", cursor: "pointer",
              background: running ? "rgba(255,255,255,0.08)" : "linear-gradient(135deg,#2DD4BF,#22C5B0)",
              color: running ? "rgba(255,255,255,0.6)" : "#07090F", fontWeight: 800, fontSize: 15 }}>
            {running ? "Pause" : remaining < total ? "Resume" : "Start"}
          </button>
          {(running || progress > 0) && (
            <button onClick={reset}
              style={{ padding: "13px 20px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.1)",
                background: "transparent", color: "rgba(255,255,255,0.4)", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Calming message */}
      <div style={{ borderRadius: 14, padding: "14px 18px",
        background: "rgba(45,212,191,0.06)", border: "1px solid rgba(45,212,191,0.15)" }}>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", fontStyle: "italic", lineHeight: 1.7, textAlign: "center" }}>
          "{MESSAGES[msgIdx]}"
        </p>
      </div>
    </div>
  );
}