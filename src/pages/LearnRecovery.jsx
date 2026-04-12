import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ChevronLeft, BookOpen, X, Clock } from "lucide-react";
import { createPageUrl } from "./utils";

const C = {
  amber:   "#B8823A",
  green:   "#7A9E7E",
  indigo:  "#7B8FA8",
  muted:   "#9B8E83",
  text:    "#1C1410",
  bg:      "#F7F3EE",
  surface: "#FDFAF6",
  border:  "#E8E2D9",
};

const CATEGORIES = [
  { id: "all",           label: "All",           emoji: "📚", color: C.amber  },
  { id: "understanding", label: "Understanding", emoji: "🧠", color: C.indigo },
  { id: "tips",          label: "Recovery Tips", emoji: "💡", color: C.green  },
  { id: "motivation",    label: "Motivation",    emoji: "🌟", color: C.amber  },
  { id: "brain",         label: "Brain & Body",  emoji: "⚗️", color: C.indigo },
  { id: "relationships", label: "Relationships", emoji: "🤝", color: C.green  },
  { id: "myths",         label: "Myths & Facts", emoji: "🔍", color: C.amber  },
];

const STATIC_CONTENT = [
  { id: "s1",  title: "Cravings last about 20 minutes", body: "Research shows the peak of a craving typically lasts 15–20 minutes. If you can ride it out — by walking, calling someone, or using a breathing exercise — it will pass. You don't have to act on it.", category: "understanding", emoji: "⏱️", read_time_mins: 1, is_featured: true },
  { id: "s2",  title: "Your brain is literally healing", body: "Dopamine receptors damaged by substance use begin to recover within weeks of sobriety. Brain scans show measurable improvements in mood regulation, decision-making, and impulse control — often within 1–3 months.", category: "brain", emoji: "🧬", read_time_mins: 1, is_featured: true },
  { id: "s3",  title: "One tool: the 5-4-3-2-1 technique", body: "When anxiety or a craving hits: name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste. This grounds you in the present moment and interrupts the craving cycle.", category: "tips", emoji: "🖐️", read_time_mins: 1 },
  { id: "s4",  title: "Relapse doesn't mean failure", body: "Over 60% of people in recovery experience at least one relapse. It's a recognized part of the recovery process — not the end. What matters is what you do next: reach out, reset, and keep going.", category: "motivation", emoji: "🔄", read_time_mins: 1 },
  { id: "s5",  title: "Myth: Willpower is all you need", body: "Addiction changes brain chemistry in ways that make willpower alone insufficient. Treatment works best when it combines support, structure, and sometimes medication. Asking for help isn't weakness — it's strategy.", category: "myths", emoji: "❌", read_time_mins: 1 },
  { id: "s6",  title: "The HALT check-in", body: "Before giving into a craving, ask: Am I Hungry? Angry? Lonely? Tired? These four states are the most common triggers for relapse. Addressing the underlying need is more effective than white-knuckling it.", category: "tips", emoji: "🛑", read_time_mins: 1 },
  { id: "s7",  title: "Why connection is medicine", body: "Social isolation is one of the strongest predictors of relapse. Studies show that people with strong social support are significantly more likely to maintain long-term recovery. Even one trusted person makes a real difference.", category: "relationships", emoji: "🫂", read_time_mins: 1 },
  { id: "s8",  title: "Sleep is a recovery superpower", body: "Sleep deprivation increases craving intensity, lowers emotional resilience, and impairs decision-making. Prioritizing 7–9 hours of sleep is one of the highest-impact things you can do for your recovery.", category: "brain", emoji: "💤", read_time_mins: 1 },
  { id: "s9",  title: "Myth: You have to hit 'rock bottom'", body: "Recovery can begin at any stage. Waiting for things to get worse isn't necessary and can be dangerous. People who seek help earlier often have better outcomes. You don't have to earn help.", category: "myths", emoji: "🪨", read_time_mins: 1 },
  { id: "s10", title: "The 'urge surfing' technique", body: "Instead of fighting a craving, observe it like a wave — it rises, peaks, and fades. Notice where you feel it in your body. Don't try to stop it, just watch it. This mindfulness approach reduces its power over time.", category: "tips", emoji: "🌊", read_time_mins: 1 },
  { id: "s11", title: "Progress is not linear", body: "Recovery isn't a straight line. Good days and hard days will alternate — sometimes for months. This doesn't mean you're doing it wrong. It means you're human. Consistency over time matters more than perfection.", category: "motivation", emoji: "📈", read_time_mins: 1 },
  { id: "s12", title: "Exercise changes your brain chemistry", body: "Even a 20-minute walk releases dopamine, serotonin, and endorphins — the same chemicals your brain craves from substances. Regular movement reduces depression, anxiety, and cravings significantly.", category: "brain", emoji: "🏃", read_time_mins: 1 },
  { id: "s13", title: "How to talk to someone about your recovery", body: "You don't have to share everything. Start small: 'I'm working on some things' is enough. Choose people who have shown they're trustworthy. Disclosure on your own terms, at your own pace.", category: "relationships", emoji: "💬", read_time_mins: 1 },
  { id: "s14", title: "Myth: Recovery means no fun", body: "Early recovery can feel flat — this is real and temporary. As your brain heals, the ability to feel joy from everyday things returns. Many people describe a richness to sober life they didn't expect.", category: "myths", emoji: "🎉", read_time_mins: 1 },
  { id: "s15", title: "What triggers actually are", body: "Triggers are cues — people, places, feelings, or times — that your brain has linked to substance use through repetition. They're not your fault. But recognizing yours gives you a head start in planning around them.", category: "understanding", emoji: "🔗", read_time_mins: 1 },
  { id: "s16", title: "You are more than your history", body: "Who you were at your worst is not who you are. Identity shifts in recovery are real and documented. You're not 'an addict' — you're a person building a life, one day at a time.", category: "motivation", emoji: "✨", read_time_mins: 1 },
];

function ContentCard({ item, onClick }) {
  const cat = CATEGORIES.find(c => c.id === item.category) || CATEGORIES[1];
  return (
    <button onClick={() => onClick(item)}
      style={{ textAlign: "left", display: "block", width: "100%", padding: "16px 18px",
        borderRadius: 14, border: "none", cursor: "pointer",
        background: item.is_featured ? `${cat.color}08` : C.surface,
        border: `1px solid ${item.is_featured ? cat.color + "28" : C.border}`,
        marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0,
          background: cat.color + "12", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
          {item.emoji || cat.emoji}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
            {item.is_featured && (
              <span style={{ fontSize: 9, fontWeight: 700, color: cat.color,
                background: cat.color + "12", padding: "2px 7px", borderRadius: 10, letterSpacing: ".06em" }}>FEATURED</span>
            )}
            <span style={{ fontSize: 9, fontWeight: 700, color: cat.color, textTransform: "uppercase", letterSpacing: ".06em" }}>{cat.label}</span>
          </div>
          <p style={{ fontSize: 14, fontWeight: 700, color: C.text, lineHeight: 1.3, marginBottom: 6 }}>{item.title}</p>
          <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.5,
            overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
            {item.body}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8 }}>
            <Clock style={{ color: C.muted, width: 10, height: 10 }} />
            <span style={{ fontSize: 10, color: C.muted }}>{item.read_time_mins || 1} min read</span>
          </div>
        </div>
      </div>
    </button>
  );
}

function ContentModal({ item, onClose }) {
  const cat = CATEGORIES.find(c => c.id === item.category) || CATEGORIES[1];
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "flex-end",
      background: "rgba(28,20,16,0.5)" }} onClick={onClose}>
      <div style={{ width: "100%", maxWidth: 480, margin: "0 auto", borderRadius: "20px 20px 0 0",
        background: C.surface, padding: "24px 22px 48px",
        border: `1px solid ${C.border}`, maxHeight: "80vh", overflowY: "auto" }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: cat.color + "12",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
              {item.emoji || cat.emoji}
            </div>
            <div>
              <span style={{ fontSize: 10, fontWeight: 700, color: cat.color, textTransform: "uppercase", letterSpacing: ".07em" }}>{cat.label}</span>
              <p style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>{item.read_time_mins || 1} min read</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: C.bg, border: `1px solid ${C.border}`,
            borderRadius: "50%", width: 30, height: 30, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X style={{ color: C.muted, width: 14, height: 14 }} />
          </button>
        </div>

        <h2 style={{ fontFamily: "'Lora', serif", fontSize: 20, fontWeight: 600, color: C.text, lineHeight: 1.3, marginBottom: 16 }}>
          {item.title}
        </h2>

        <div style={{ height: 1, background: C.border, marginBottom: 16 }} />

        <p style={{ fontSize: 15, color: "#4A3F35", lineHeight: 1.8 }}>{item.body}</p>

        <div style={{ marginTop: 24, padding: "12px 16px", borderRadius: 12,
          background: cat.color + "07", border: `1px solid ${cat.color}20` }}>
          <p style={{ fontSize: 12, color: "#4A3F35", fontStyle: "italic" }}>
            💬 Take what's useful. Leave what isn't. Recovery is personal.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LearnRecovery() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selected, setSelected] = useState(null);

  const { data: dbContent = [] } = useQuery({
    queryKey: ["learn-recovery-content"],
    queryFn: () => base44.entities.LearnRecoveryContent.list("sort_order", 200),
  });

  const allContent = dbContent.length > 0 ? dbContent : STATIC_CONTENT;

  const filtered = useMemo(() =>
    activeCategory === "all" ? allContent : allContent.filter(c => c.category === activeCategory),
    [allContent, activeCategory]
  );

  const featured = filtered.filter(c => c.is_featured);
  const rest = filtered.filter(c => !c.is_featured);

  return (
    <div style={{ background: C.bg, minHeight: "100vh", paddingBottom: 100 }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "56px 24px 20px" }}>
          <Link to={createPageUrl("MyFoundation")} style={{ display: "inline-flex", alignItems: "center", gap: 6,
            color: C.muted, fontSize: 12, marginBottom: 16, textDecoration: "none", fontWeight: 600 }}>
            <ChevronLeft style={{ width: 15, height: 15 }} /> Back
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <BookOpen style={{ color: C.amber, width: 16, height: 16 }} />
            <p style={{ fontSize: 11, fontWeight: 700, color: C.amber, textTransform: "uppercase", letterSpacing: ".1em" }}>Learn Recovery</p>
          </div>
          <h1 style={{ fontFamily: "'Lora', serif", fontSize: 22, fontWeight: 600, color: C.text, lineHeight: 1.2, marginBottom: 6 }}>
            Understanding your recovery
          </h1>
          <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
            Short, real, no-fluff insights. Read one a day or browse when you're curious.
          </p>
        </div>

        {/* Category filters */}
        <div style={{ padding: "14px 0 0 16px", display: "flex", gap: 8, overflowX: "auto",
          scrollbarWidth: "none", paddingRight: 16, background: C.surface, borderBottom: `1px solid ${C.border}` }}>
          {CATEGORIES.map(cat => {
            const active = activeCategory === cat.id;
            return (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                style={{ padding: "7px 14px", borderRadius: 20, border: "none", cursor: "pointer",
                  flexShrink: 0, fontSize: 12, fontWeight: 700, marginBottom: 14,
                  background: active ? cat.color + "18" : C.bg,
                  border: `1.5px solid ${active ? cat.color + "45" : C.border}`,
                  color: active ? cat.color : C.muted }}>
                {cat.emoji} {cat.label}
              </button>
            );
          })}
        </div>

        <div style={{ padding: "16px 16px" }}>
          {featured.length > 0 && activeCategory === "all" && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase",
                letterSpacing: ".08em", marginBottom: 10 }}>⭐ Featured</p>
              {featured.map(item => <ContentCard key={item.id} item={item} onClick={setSelected} />)}
            </div>
          )}

          {activeCategory !== "all" && (
            <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase",
              letterSpacing: ".08em", marginBottom: 10 }}>
              {filtered.length} {filtered.length === 1 ? "article" : "articles"}
            </p>
          )}
          {activeCategory === "all" && rest.length > 0 && (
            <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase",
              letterSpacing: ".08em", marginBottom: 10 }}>More to explore</p>
          )}

          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px", background: C.surface,
              borderRadius: 14, border: `.5px solid ${C.border}` }}>
              <p style={{ fontSize: 14, color: C.muted }}>No content in this category yet.</p>
            </div>
          ) : (
            (activeCategory === "all" ? rest : filtered).map(item => (
              <ContentCard key={item.id} item={item} onClick={setSelected} />
            ))
          )}

          <p style={{ textAlign: "center", fontSize: 11, color: C.muted, lineHeight: 1.7, paddingTop: 12, fontStyle: "italic" }}>
            Content is educational, not a substitute for professional care.
          </p>
        </div>
      </div>

      {selected && <ContentModal item={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}