import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles, Loader2, RefreshCw, Check, X } from "lucide-react";

const C = {
  amber: "#B8823A",
  surface: "rgba(184,130,58,0.08)",
  border: "rgba(184,130,58,0.25)",
};

/**
 * AI suggestion button + inline preview for a single text field.
 * Props:
 *  - fieldLabel: string (e.g. "bio")
 *  - currentValue: string
 *  - profile: partial profile object for context
 *  - onApply: (newValue: string) => void
 *  - promptType: "bio" | "quote" | "grounding" | "building" | "roots"
 */
export function AISuggestionButton({ fieldLabel, currentValue, profile, onApply, promptType }) {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState(null);

  const buildPrompt = () => {
    const context = [
      profile.hobbies?.length ? `Hobbies: ${profile.hobbies.join(", ")}` : "",
      profile.hometown ? `From: ${profile.hometown}` : "",
      profile.stage ? `Recovery stage: ${profile.stage}` : "",
      profile.what_im_building ? `Working on: ${profile.what_im_building}` : "",
      profile.motivation ? `Motivated by: ${profile.motivation}` : "",
    ].filter(Boolean).join(". ");

    const prompts = {
      bio: `You are a compassionate writing coach specializing in recovery narratives. 
Improve this personal bio for a recovery app profile. Make it warm, authentic, and human — not clinical. 
Keep it under 80 words. Focus on identity beyond the struggle.
${currentValue ? `Current bio: "${currentValue}"` : "The user has not written a bio yet."}
${context ? `Context about them: ${context}` : ""}
Return ONLY the improved bio text, nothing else.`,

      quote: `You are a writer specializing in recovery and resilience. 
Create an inspiring, personal quote for a recovery journey profile. 
It should feel authentic, not preachy or generic. Under 20 words. First person.
${currentValue ? `Current quote: "${currentValue}"` : ""}
${context ? `About them: ${context}` : ""}
Return ONLY the quote text, no quotation marks, nothing else.`,

      grounding: `You are a recovery-informed writing coach.
Improve this "what keeps me grounded" field for a recovery profile. 
Make it feel personal, grounded, and real. Under 60 words.
${currentValue ? `Current text: "${currentValue}"` : "The user hasn't filled this in yet."}
${context ? `About them: ${context}` : ""}
Return ONLY the improved text, nothing else.`,

      building: `You are a recovery-informed writing coach.
Improve this "what I'm building" / goals section. Make it sound motivated and forward-looking. Under 60 words.
${currentValue ? `Current text: "${currentValue}"` : "The user hasn't filled this in yet."}
${context ? `About them: ${context}` : ""}
Return ONLY the improved text, nothing else.`,

      roots: `You are a recovery-informed writing coach.
Improve this "my roots / what shaped me" field. Make it feel grounded and personal. Under 60 words.
${currentValue ? `Current text: "${currentValue}"` : "The user hasn't filled this in yet."}
${context ? `About them: ${context}` : ""}
Return ONLY the improved text, nothing else.`,
    };

    return prompts[promptType] || prompts.bio;
  };

  const getSuggestion = async () => {
    setLoading(true);
    setSuggestion(null);
    const result = await base44.integrations.Core.InvokeLLM({ prompt: buildPrompt() });
    setSuggestion(typeof result === "string" ? result.trim() : result?.response?.trim() || "");
    setLoading(false);
  };

  return (
    <div style={{ marginTop: 6 }}>
      {!suggestion && !loading && (
        <button
          onClick={getSuggestion}
          type="button"
          style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "5px 12px", borderRadius: 20, cursor: "pointer",
            background: C.surface, border: `1px solid ${C.border}`,
            color: C.amber, fontSize: 12, fontWeight: 700,
          }}
        >
          <Sparkles style={{ width: 11, height: 11 }} />
          AI Suggestion
        </button>
      )}

      {loading && (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6,
          padding: "5px 12px", color: C.amber, fontSize: 12, fontWeight: 600 }}>
          <Loader2 style={{ width: 12, height: 12 }} className="animate-spin" />
          Generating…
        </div>
      )}

      {suggestion && (
        <div style={{
          marginTop: 8, padding: "12px 14px", borderRadius: 12,
          background: "rgba(184,130,58,0.07)", border: `1px solid ${C.border}`,
        }}>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 1.65, marginBottom: 10, fontStyle: "italic" }}>
            "{suggestion}"
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => { onApply(suggestion); setSuggestion(null); }}
              type="button"
              style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "6px 14px", borderRadius: 20, cursor: "pointer",
                background: C.amber, border: "none",
                color: "#fff", fontSize: 12, fontWeight: 700,
              }}
            >
              <Check style={{ width: 11, height: 11 }} /> Use This
            </button>
            <button
              onClick={getSuggestion}
              type="button"
              style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "6px 12px", borderRadius: 20, cursor: "pointer",
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 600,
              }}
            >
              <RefreshCw style={{ width: 10, height: 10 }} /> Try Again
            </button>
            <button
              onClick={() => setSuggestion(null)}
              type="button"
              style={{
                display: "inline-flex", alignItems: "center",
                padding: "6px 8px", borderRadius: 20, cursor: "pointer",
                background: "none", border: "none",
                color: "rgba(255,255,255,0.3)", fontSize: 12,
              }}
            >
              <X style={{ width: 11, height: 11 }} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Keyword-based quote generator — standalone widget.
 * Props:
 *  - onApply: (quote: string) => void
 */
export function AIQuoteGenerator({ onApply }) {
  const [keywords, setKeywords] = useState("");
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState(null);
  const [open, setOpen] = useState(false);

  const generate = async () => {
    if (!keywords.trim()) return;
    setLoading(true);
    setQuote(null);
    const prompt = `You are a poet and recovery writer. 
Create a short, powerful personal quote (under 20 words, first person) inspired by these keywords: "${keywords}".
It should feel authentic, not cliché, and reflect a recovery or resilience journey.
Return ONLY the quote text, no quotation marks, nothing else.`;
    const result = await base44.integrations.Core.InvokeLLM({ prompt });
    setQuote(typeof result === "string" ? result.trim() : result?.response?.trim() || "");
    setLoading(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        type="button"
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "6px 14px", borderRadius: 20, cursor: "pointer",
          background: "rgba(184,130,58,0.10)", border: "1px solid rgba(184,130,58,0.3)",
          color: C.amber, fontSize: 12, fontWeight: 700, marginTop: 6,
        }}
      >
        <Sparkles style={{ width: 12, height: 12 }} />
        Generate from keywords
      </button>
    );
  }

  return (
    <div style={{
      marginTop: 10, padding: "14px", borderRadius: 14,
      background: "rgba(184,130,58,0.06)", border: "1px solid rgba(184,130,58,0.2)",
    }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: C.amber, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>
        ✨ Quote Generator
      </p>
      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 8 }}>
        Enter a few words that describe your journey (e.g. "faith, family, second chance")
      </p>
      <input
        value={keywords}
        onChange={e => setKeywords(e.target.value)}
        onKeyDown={e => e.key === "Enter" && generate()}
        placeholder="faith, resilience, starting over…"
        style={{
          width: "100%", padding: "10px 12px", borderRadius: 10, boxSizing: "border-box",
          background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
          color: "#fff", fontSize: 13, outline: "none", marginBottom: 10,
        }}
      />
      <div style={{ display: "flex", gap: 8, marginBottom: quote ? 12 : 0 }}>
        <button
          onClick={generate}
          disabled={!keywords.trim() || loading}
          type="button"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "8px 16px", borderRadius: 20, cursor: "pointer",
            background: keywords.trim() ? C.amber : "rgba(255,255,255,0.1)",
            border: "none", color: "#fff", fontSize: 12, fontWeight: 700,
          }}
        >
          {loading ? <Loader2 style={{ width: 12, height: 12 }} className="animate-spin" /> : <Sparkles style={{ width: 12, height: 12 }} />}
          {loading ? "Generating…" : "Generate"}
        </button>
        <button
          onClick={() => { setOpen(false); setQuote(null); setKeywords(""); }}
          type="button"
          style={{ padding: "8px 12px", borderRadius: 20, cursor: "pointer",
            background: "none", border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.35)", fontSize: 12 }}
        >
          Cancel
        </button>
      </div>

      {quote && (
        <div style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", fontStyle: "italic", lineHeight: 1.6, marginBottom: 10 }}>
            "{quote}"
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => { onApply(quote); setOpen(false); setQuote(null); setKeywords(""); }}
              type="button"
              style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "6px 14px", borderRadius: 20, cursor: "pointer",
                background: C.amber, border: "none", color: "#fff", fontSize: 12, fontWeight: 700,
              }}
            >
              <Check style={{ width: 11, height: 11 }} /> Use This
            </button>
            <button
              onClick={generate}
              type="button"
              style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "6px 12px", borderRadius: 20, cursor: "pointer",
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.6)", fontSize: 12,
              }}
            >
              <RefreshCw style={{ width: 10, height: 10 }} /> Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}