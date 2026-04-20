import React, { useState } from "react";
import { Loader2, Check, Lock, Eye } from "lucide-react";
import { VET_COLORS, STORY_PROMPTS, STORY_TAGS, getBranch } from "./veteransData";

export default function VeteranStoryTab({ stories, profile, onSubmit, saving }) {
  const [promptKey, setPromptKey] = useState(STORY_PROMPTS[0].key);
  const [text, setText] = useState("");
  const [tags, setTags] = useState([]);
  const [visibility, setVisibility] = useState("private");
  const [isAnon, setIsAnon] = useState(true);
  const [justSaved, setJustSaved] = useState(false);

  const toggleTag = (k) => setTags(t => t.includes(k) ? t.filter(x => x !== k) : [...t, k]);
  const prompt = STORY_PROMPTS.find(p => p.key === promptKey);

  const handleSubmit = () => {
    onSubmit({
      prompt_key: promptKey,
      story_text: text.trim(),
      tags,
      visibility,
      is_anonymous: isAnon,
      display_name: isAnon ? null : (profile?.first_name || null),
    });
    setText(""); setTags([]); setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2500);
  };

  // Voice-to-text via Web Speech API
  const [recording, setRecording] = useState(false);
  const startRecording = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Voice-to-text isn't supported on this device. Type your story instead."); return; }
    const rec = new SR();
    rec.lang = "en-US"; rec.continuous = true; rec.interimResults = false;
    rec.onresult = (e) => {
      let transcript = "";
      for (let i = e.resultIndex; i < e.results.length; i++) transcript += e.results[i][0].transcript + " ";
      setText(prev => (prev + " " + transcript).trim());
    };
    rec.onend = () => setRecording(false);
    rec.start();
    setRecording(true);
    window._vetRec = rec;
  };
  const stopRecording = () => { window._vetRec?.stop?.(); setRecording(false); };

  return (
    <div style={{ padding: "20px 16px 40px" }}>
      <p style={{ fontFamily: "'Lora', serif", fontSize: 22, fontWeight: 600, color: VET_COLORS.text, marginBottom: 4 }}>
        Ah Ha Moment — Veteran Edition
      </p>
      <p style={{ fontSize: 13, color: VET_COLORS.muted, marginBottom: 18, lineHeight: 1.5 }}>
        Your story matters. Share it when you're ready.
      </p>

      {/* Prompt selector */}
      <p style={{ fontSize: 10, fontWeight: 700, color: VET_COLORS.dim, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10 }}>
        Choose a prompt
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
        {STORY_PROMPTS.map(p => {
          const sel = promptKey === p.key;
          return (
            <button key={p.key} onClick={() => setPromptKey(p.key)} style={{
              textAlign: "left", padding: "12px 14px", borderRadius: 12, cursor: "pointer",
              background: sel ? VET_COLORS.oliveDim : VET_COLORS.surface,
              border: `1.5px solid ${sel ? VET_COLORS.olive : VET_COLORS.border}`,
              fontSize: 13, fontWeight: 600, lineHeight: 1.5,
              color: sel ? VET_COLORS.text : VET_COLORS.muted,
              fontFamily: "'Lora', serif",
            }}>
              {p.question}
            </button>
          );
        })}
      </div>

      {/* Story textarea */}
      <p style={{ fontSize: 10, fontWeight: 700, color: VET_COLORS.dim, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10 }}>
        Your story
      </p>
      <textarea
        value={text}
        onChange={e => setText(e.target.value.slice(0, 3000))}
        rows={7}
        placeholder={prompt.question}
        style={{
          width: "100%", padding: "14px", borderRadius: 12,
          border: `1px solid ${VET_COLORS.border}`, background: VET_COLORS.surface,
          fontSize: 14, outline: "none", resize: "none",
          boxSizing: "border-box", fontFamily: "inherit", lineHeight: 1.6, marginBottom: 8,
        }}
      />
      <button onClick={recording ? stopRecording : startRecording} style={{
        background: recording ? "rgba(184,92,92,0.10)" : VET_COLORS.bg,
        border: `1px solid ${recording ? "#B85C5C" : VET_COLORS.border}`,
        padding: "8px 14px", borderRadius: 50, fontSize: 12, fontWeight: 700,
        color: recording ? "#B85C5C" : VET_COLORS.muted,
        cursor: "pointer", marginBottom: 16,
      }}>
        {recording ? "● Stop Recording" : "🎙️ Voice to Text"}
      </button>

      {/* Tags */}
      <p style={{ fontSize: 10, fontWeight: 700, color: VET_COLORS.dim, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10 }}>
        Tags
      </p>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>
        {STORY_TAGS.map(t => {
          const sel = tags.includes(t.key);
          return (
            <button key={t.key} onClick={() => toggleTag(t.key)} style={{
              padding: "6px 12px", borderRadius: 20, cursor: "pointer", fontSize: 11, fontWeight: 600,
              background: sel ? VET_COLORS.oliveDim : VET_COLORS.surface,
              border: `1px solid ${sel ? VET_COLORS.olive : VET_COLORS.border}`,
              color: sel ? VET_COLORS.olive : VET_COLORS.muted,
            }}>{t.label}</button>
          );
        })}
      </div>

      {/* Visibility */}
      <p style={{ fontSize: 10, fontWeight: 700, color: VET_COLORS.dim, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10 }}>
        Visibility
      </p>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <button onClick={() => setVisibility("private")} style={{
          flex: 1, padding: 12, borderRadius: 12, cursor: "pointer",
          background: visibility === "private" ? VET_COLORS.oliveDim : VET_COLORS.surface,
          border: `1.5px solid ${visibility === "private" ? VET_COLORS.olive : VET_COLORS.border}`,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
        }}>
          <Lock style={{ width: 15, height: 15, color: visibility === "private" ? VET_COLORS.olive : VET_COLORS.dim }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: visibility === "private" ? VET_COLORS.olive : VET_COLORS.muted }}>Private</span>
        </button>
        <button onClick={() => setVisibility("public")} style={{
          flex: 1, padding: 12, borderRadius: 12, cursor: "pointer",
          background: visibility === "public" ? VET_COLORS.oliveDim : VET_COLORS.surface,
          border: `1.5px solid ${visibility === "public" ? VET_COLORS.olive : VET_COLORS.border}`,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
        }}>
          <Eye style={{ width: 15, height: 15, color: visibility === "public" ? VET_COLORS.olive : VET_COLORS.dim }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: visibility === "public" ? VET_COLORS.olive : VET_COLORS.muted }}>Public (after review)</span>
        </button>
      </div>

      {visibility === "public" && (
        <button onClick={() => setIsAnon(v => !v)} style={{
          width: "100%", background: VET_COLORS.surface, border: `1px solid ${VET_COLORS.border}`,
          borderRadius: 12, padding: "12px 14px", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16,
        }}>
          <span style={{ fontSize: 13, color: VET_COLORS.text, fontWeight: 600 }}>
            Post {isAnon ? "anonymously" : `as ${profile?.first_name || "yourself"}`}
          </span>
          <div style={{
            width: 34, height: 20, borderRadius: 10,
            background: isAnon ? VET_COLORS.olive : VET_COLORS.border,
            position: "relative",
          }}>
            <div style={{
              position: "absolute", top: 2, left: isAnon ? 16 : 2,
              width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s",
            }} />
          </div>
        </button>
      )}

      <button
        onClick={handleSubmit}
        disabled={!text.trim() || saving}
        style={{
          width: "100%", padding: 15, borderRadius: 50, border: "none",
          background: text.trim() ? VET_COLORS.olive : VET_COLORS.border,
          color: "#fff", fontWeight: 700, fontSize: 15,
          cursor: text.trim() ? "pointer" : "default", marginTop: 8,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}
      >
        {saving ? <Loader2 style={{ width: 15, height: 15 }} className="animate-spin" /> : justSaved ? <Check style={{ width: 15, height: 15 }} /> : null}
        {justSaved ? "Saved" : "Save Story"}
      </button>

      {/* User's own stories */}
      {stories.length > 0 && (
        <>
          <p style={{ fontSize: 10, fontWeight: 700, color: VET_COLORS.dim, textTransform: "uppercase", letterSpacing: ".1em", marginTop: 28, marginBottom: 10 }}>
            Your stories
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {stories.map(s => {
              const p = STORY_PROMPTS.find(x => x.key === s.prompt_key);
              return (
                <div key={s.id} style={{ background: VET_COLORS.surface, border: `1px solid ${VET_COLORS.border}`, borderRadius: 12, padding: "12px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    {s.visibility === "private"
                      ? <Lock style={{ width: 11, height: 11, color: VET_COLORS.dim }} />
                      : <Eye style={{ width: 11, height: 11, color: VET_COLORS.olive }} />}
                    <span style={{ fontSize: 10, fontWeight: 700, color: s.visibility === "public" ? VET_COLORS.olive : VET_COLORS.dim, textTransform: "uppercase", letterSpacing: ".05em" }}>
                      {s.visibility === "public" ? s.status : "Private"}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, fontStyle: "italic", color: VET_COLORS.muted, marginBottom: 4 }}>{p?.question}</p>
                  <p style={{ fontSize: 13, color: VET_COLORS.text, lineHeight: 1.55 }}>{s.story_text}</p>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}