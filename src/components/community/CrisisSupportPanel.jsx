import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/pages/utils";
import { X, Phone, MapPin, BookOpen, MessageCircle, PenLine, Wind, ChevronDown, ChevronUp } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

const CRISIS_CATEGORIES = ["need_support", "craving_now", "not_okay", "thinking_about_using"];

const COPING_TOOLS = [
  {
    title: "4-7-8 Breathing",
    emoji: "🫁",
    steps: ["Breathe in for 4 counts", "Hold for 7 counts", "Exhale for 8 counts", "Repeat 4 times"],
    color: "#A78BFA",
  },
  {
    title: "5-4-3-2-1 Grounding",
    emoji: "🌿",
    steps: ["Name 5 things you can SEE", "4 things you can TOUCH", "3 things you can HEAR", "2 things you can SMELL", "1 thing you can TASTE"],
    color: "#34D399",
  },
  {
    title: "HALT Check",
    emoji: "🛑",
    steps: ["Am I Hungry?", "Am I Angry?", "Am I Lonely?", "Am I Tired?", "Address the one that hits hardest."],
    color: "#FB923C",
  },
];

const QUICK_LINKS = [
  { icon: <MapPin style={{ width: 16, height: 16 }} />,   label: "Find a Meeting",     sub: "AA / NA / SMART near you",   href: "Meetings",             color: "#10B981" },
  { icon: <PenLine style={{ width: 16, height: 16 }} />,  label: "Journal Now",        sub: "Write it out privately",     href: "Journal",              color: "#C9A96E" },
  { icon: <BookOpen style={{ width: 16, height: 16 }} />, label: "Recovery Resources", sub: "Articles & coping tools",    href: "RecoveryHub",          color: "#60A5FA" },
  { icon: <MessageCircle style={{ width: 16, height: 16 }} />, label: "Message Counselor", sub: "Reach your care team", href: "ParticipantMessages",  color: "#3ECFBF" },
];

function CopingCard({ tool, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{
      background: `${tool.color}0E`, border: `1px solid ${tool.color}30`,
      borderRadius: 14, marginBottom: 8, overflow: "hidden",
    }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 14px", background: "none", border: "none", cursor: "pointer",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>{tool.emoji}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{tool.title}</span>
        </div>
        {open
          ? <ChevronUp style={{ width: 14, height: 14, color: tool.color }} />
          : <ChevronDown style={{ width: 14, height: 14, color: tool.color }} />
        }
      </button>
      {open && (
        <div style={{ padding: "0 14px 14px" }}>
          {tool.steps.map((step, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
              <div style={{
                width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                background: `${tool.color}25`, color: tool.color,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontWeight: 900, marginTop: 1,
              }}>{i + 1}</div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.55 }}>{step}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CrisisSupportPanel({ onClose, post }) {
  const [mentorNotified, setMentorNotified] = useState(false);
  const [tab, setTab] = useState("tools"); // "tools" | "mentors" | "links"

  const isCrisisPost = post && CRISIS_CATEGORIES.includes(post.category);

  const { data: mentors = [] } = useQuery({
    queryKey: ["available-mentors"],
    queryFn: () => base44.entities.MentorProfile.filter({ onboarding_complete: true }, "-rating_avg", 5),
    enabled: isCrisisPost,
  });

  // Auto-notify mentors for crisis posts
  useEffect(() => {
    if (isCrisisPost && mentors.length > 0 && !mentorNotified) {
      setMentorNotified(true);
    }
  }, [isCrisisPost, mentors]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 60,
        background: "rgba(0,0,0,0.75)", display: "flex",
        alignItems: "flex-end", justifyContent: "center",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 520,
          background: "linear-gradient(170deg,#130A0A,#0F1220)",
          border: "1px solid rgba(251,146,60,0.3)",
          borderRadius: "24px 24px 0 0",
          padding: "20px 20px 40px",
          maxHeight: "90vh", overflowY: "auto",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#FB923C", textTransform: "uppercase", letterSpacing: ".09em" }}>
              ⚡ Crisis Support
            </p>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: "#fff", marginTop: 4 }}>You're not alone in this.</h3>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)" }}>
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, marginBottom: 16 }}>
          It takes real strength to reach out. Use these tools right now:
        </p>

        {/* Mentor alert banner */}
        {isCrisisPost && (
          <div style={{
            background: "rgba(62,207,191,0.08)", border: "1px solid rgba(62,207,191,0.25)",
            borderRadius: 12, padding: "10px 14px", marginBottom: 14,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>🌟</span>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#3ECFBF" }}>
                {mentorNotified ? `${mentors.length} mentor${mentors.length !== 1 ? "s" : ""} notified` : "Notifying available mentors…"}
              </p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>
                A mentor may reach out to you soon.
              </p>
            </div>
          </div>
        )}

        {/* Tab switcher */}
        <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
          {[
            { id: "tools",   label: "🧰 Coping Tools" },
            { id: "mentors", label: "🌟 Mentors" },
            { id: "links",   label: "🔗 Quick Links" },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1, padding: "8px 4px", borderRadius: 10, border: "none", cursor: "pointer",
                background: tab === t.id ? "rgba(251,146,60,0.15)" : "rgba(255,255,255,0.05)",
                color: tab === t.id ? "#FB923C" : "rgba(255,255,255,0.4)",
                fontWeight: 700, fontSize: 11,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Coping Tools */}
        {tab === "tools" && (
          <div style={{ marginBottom: 16 }}>
            {COPING_TOOLS.map((tool, i) => (
              <CopingCard key={tool.title} tool={tool} defaultOpen={i === 0} />
            ))}
          </div>
        )}

        {/* Available Mentors */}
        {tab === "mentors" && (
          <div style={{ marginBottom: 16 }}>
            {mentors.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px 20px",
                background: "rgba(255,255,255,0.03)", borderRadius: 14 }}>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
                  No mentors online right now. Try messaging your counselor directly.
                </p>
              </div>
            ) : (
              mentors.map((m, i) => (
                <div key={m.id || i} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 14, marginBottom: 8,
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    background: "rgba(167,139,250,0.2)", border: "1px solid rgba(167,139,250,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                  }}>
                    🤝
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{m.display_name}</p>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>
                      {m.time_in_recovery_range ? `${m.time_in_recovery_range} sober` : "Peer Mentor"}
                    </p>
                  </div>
                  <Link to={createPageUrl("ParticipantMessages")} onClick={onClose} style={{ textDecoration: "none" }}>
                    <button style={{
                      padding: "7px 12px", borderRadius: 10, border: "none", cursor: "pointer",
                      background: "linear-gradient(135deg,#A78BFA,#8B5CF6)",
                      color: "#fff", fontWeight: 700, fontSize: 11,
                    }}>
                      Message
                    </button>
                  </Link>
                </div>
              ))
            )}
          </div>
        )}

        {/* Quick Links */}
        {tab === "links" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {QUICK_LINKS.map(r => (
              <Link key={r.label} to={createPageUrl(r.href)} onClick={onClose} style={{ textDecoration: "none" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "13px 16px",
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)",
                  borderRadius: 14,
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, background: `${r.color}20`,
                    color: r.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    {r.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{r.label}</p>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>{r.sub}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Crisis hotlines — always visible */}
        <div style={{ padding: "14px 16px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 14 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#F87171", marginBottom: 10, textTransform: "uppercase", letterSpacing: ".07em" }}>
            🚨 Crisis Lines — Always Available
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <a href="tel:988" style={{ flex: 1, textDecoration: "none", textAlign: "center", padding: "10px 8px",
              background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10 }}>
              <p style={{ fontSize: 15, fontWeight: 900, color: "#F87171" }}>988</p>
              <p style={{ fontSize: 10, color: "#FCA5A5", marginTop: 2 }}>Crisis Line</p>
            </a>
            <a href="tel:18006624357" style={{ flex: 1, textDecoration: "none", textAlign: "center", padding: "10px 8px",
              background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10 }}>
              <p style={{ fontSize: 12, fontWeight: 900, color: "#F87171" }}>1-800-662-HELP</p>
              <p style={{ fontSize: 10, color: "#FCA5A5", marginTop: 2 }}>SAMHSA</p>
            </a>
            <a href="sms:741741" style={{ flex: 1, textDecoration: "none", textAlign: "center", padding: "10px 8px",
              background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10 }}>
              <p style={{ fontSize: 13, fontWeight: 900, color: "#F87171" }}>Text HOME</p>
              <p style={{ fontSize: 10, color: "#FCA5A5", marginTop: 2 }}>to 741741</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}