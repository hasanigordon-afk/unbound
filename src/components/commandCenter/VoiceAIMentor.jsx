import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Mic, Send } from "lucide-react";

export default function VoiceAIMentor({ context }) {
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const listen = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.onresult = (event) => setMessage(event.results[0][0].transcript);
    recognition.start();
  };

  const send = async () => {
    if (!message.trim()) return;
    setLoading(true);
    const reply = await base44.integrations.Core.InvokeLLM({ prompt: `Respond like a trusted, supportive, non-clinical mentor. Keep it practical, calm, and motivating. User said: ${message}. Context: ${JSON.stringify(context || {})}` });
    setHistory([...history, { role: "user", text: message }, { role: "ai", text: reply }]);
    setMessage("");
    setLoading(false);
  };

  return (
    <section className="card p-6 space-y-4">
      <p className="section-label">Voice AI Mode</p>
      <h2 className="text-2xl font-serif font-semibold text-[var(--text)]">Talk naturally when you need direction.</h2>
      <div className="flex gap-2">
        <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="I'm struggling today... I need a job... What should I do?" />
        <button onClick={listen} className="btn-ghost min-h-0 px-4"><Mic className="w-4 h-4" /></button>
        <button onClick={send} disabled={loading} className="btn-primary min-h-0 px-4"><Send className="w-4 h-4" /></button>
      </div>
      <div className="space-y-3 max-h-80 overflow-auto">
        {history.map((item, index) => <div key={index} className={`rounded-2xl p-4 text-sm ${item.role === "user" ? "bg-[var(--navy-dim)] text-[var(--text)]" : "bg-white/5 text-[var(--text-muted)]"}`}>{item.text}</div>)}
      </div>
    </section>
  );
}