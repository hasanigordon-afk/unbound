// ReZilient AI — Web Speech API voice input hook (no extra deps)
import { useEffect, useRef, useState } from "react";

export function useVoiceInput({ onResult }) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recogRef = useRef(null);

  useEffect(() => {
    const SR = typeof window !== "undefined"
      ? (window.SpeechRecognition || window.webkitSpeechRecognition)
      : null;
    if (!SR) { setSupported(false); return; }
    const r = new SR();
    r.continuous = false;
    r.interimResults = false;
    r.lang = "en-US";
    r.onresult = (ev) => {
      const text = ev.results?.[0]?.[0]?.transcript || "";
      if (text && onResult) onResult(text);
    };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    recogRef.current = r;
    return () => { try { r.stop(); } catch {} };
  }, [onResult]);

  const start = () => {
    if (!supported || !recogRef.current) return;
    try { recogRef.current.start(); setListening(true); } catch {}
  };
  const stop = () => {
    try { recogRef.current?.stop(); } catch {}
    setListening(false);
  };

  return { listening, supported, start, stop };
}