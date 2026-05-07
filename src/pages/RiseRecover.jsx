import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Sparkles, Plus, Bookmark } from "lucide-react";
import { useNavigate } from "react-router-dom";

import RRVideoCard from "@/components/riserecover/RRVideoCard";
import RRVideoPlayer from "@/components/riserecover/RRVideoPlayer";
import RRSubmitModal from "@/components/riserecover/RRSubmitModal";
import {
  RR_CATEGORIES, RR_SEED_VIDEOS, recommendVideos, CAT_BY_KEY,
} from "@/lib/riseRecoverData";

export default function RiseRecover() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [activeCat, setActiveCat] = useState("all");
  const [playing, setPlaying] = useState(null);
  const [showSubmit, setShowSubmit] = useState(false);

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me(), retry: false });

  const { data: vetProfile } = useQuery({
    queryKey: ["vet-profile", user?.email],
    queryFn: async () => {
      const list = await base44.entities.VeteranProfile.filter({ user_email: user.email });
      return list?.[0] || null;
    },
    enabled: !!user?.email,
  });

  const { data: focus } = useQuery({
    queryKey: ["recovery-focus", user?.email],
    queryFn: async () => {
      const list = await base44.entities.RecoveryFocus.filter({ user_email: user.email, is_primary: true });
      return list?.[0] || null;
    },
    enabled: !!user?.email,
  });

  const { data: saves = [] } = useQuery({
    queryKey: ["rr-saves", user?.email],
    queryFn: () => base44.entities.RiseVideoSave.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const savedSet = useMemo(() => new Set(saves.map(s => s.video_id)), [saves]);

  // Treat seed videos as the source. Use title as stable id.
  const allVideos = useMemo(
    () => RR_SEED_VIDEOS.map((v, i) => ({ ...v, id: v.id || `seed-${i}` })),
    []
  );

  const recommended = useMemo(() => {
    const isVeteran = !!vetProfile;
    const stage = isVeteran ? "veteran" : "any";
    const mood  = focus?.is_crisis_category ? "discouraged" : null;
    return recommendVideos({ videos: allVideos, stage, isVeteran, mood, limit: 6 });
  }, [allVideos, vetProfile, focus]);

  const featured = allVideos.find(v => v.is_featured) || allVideos[0];

  const filtered = activeCat === "all"
    ? allVideos
    : allVideos.filter(v => v.category === activeCat);

  // Save mutation
  const saveMut = useMutation({
    mutationFn: async (video) => {
      const existing = saves.find(s => s.video_id === video.id);
      if (existing) {
        return base44.entities.RiseVideoSave.delete(existing.id);
      }
      return base44.entities.RiseVideoSave.create({
        user_email: user.email,
        video_id: video.id,
        video_title: video.title,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rr-saves"] }),
  });

  const reactMut = useMutation({
    mutationFn: async ({ video, key }) => {
      const existing = saves.find(s => s.video_id === video.id);
      if (existing) {
        return base44.entities.RiseVideoSave.update(existing.id, { reaction: key, watched: true });
      }
      return base44.entities.RiseVideoSave.create({
        user_email: user.email,
        video_id: video.id,
        video_title: video.title,
        watched: true,
        reaction: key,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rr-saves"] }),
  });

  return (
    <div style={{ minHeight: "100vh", paddingBottom: 130, color: "var(--text)" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 18px" }}>

        {/* Back */}
        <button onClick={() => navigate(-1)}
          style={{
            background: "transparent", border: "none", padding: "20px 0 0",
            color: "var(--text-muted)", cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 13, fontWeight: 600,
          }}>
          <ArrowLeft style={{ width: 15, height: 15 }} /> Back
        </button>

        {/* Hero */}
        <div className="fade-up" style={{ position: "relative", padding: "24px 0 8px" }}>
          <div aria-hidden style={{
            position: "absolute", top: 30, left: -50, width: 280, height: 280,
            borderRadius: "50%",
            background: "radial-gradient(circle, var(--ambient-2) 0%, transparent 70%)",
            filter: "blur(20px)", pointerEvents: "none",
          }} />
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "5px 12px", borderRadius: 999,
            background: "var(--surface)",
            border: "1px solid var(--border-glow)",
            backdropFilter: "blur(14px)",
            marginBottom: 14,
            boxShadow: "var(--glow)",
            fontSize: 10.5, fontWeight: 700, color: "var(--accent)",
            letterSpacing: ".18em", textTransform: "uppercase",
            fontFamily: "'Space Grotesk', 'DM Sans', sans-serif",
          }}>
            <Sparkles style={{ width: 12, height: 12 }} />
            Cinematic Recovery Stories
          </span>
          <h1 style={{
            fontFamily: "'Lora', Georgia, serif",
            fontSize: 40, fontWeight: 700, lineHeight: 1.05,
            letterSpacing: "-.02em", marginBottom: 12,
          }}>
            Rise <span style={{
              background: "linear-gradient(90deg, var(--accent), var(--purple))",
              WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
            }}>& Recover</span>
          </h1>
          <p style={{
            fontFamily: "'Lora', Georgia, serif",
            fontStyle: "italic",
            fontSize: 16, color: "var(--text-muted)",
            lineHeight: 1.6, maxWidth: 480,
          }}>
            Stories of struggle, survival, healing, and transformation.
          </p>
        </div>

        {/* Featured cinematic banner */}
        {featured && (
          <div style={{ marginTop: 18, marginBottom: 26 }}>
            <p style={{
              fontFamily: "'Space Grotesk', 'DM Sans', sans-serif",
              fontSize: 10.5, fontWeight: 700,
              color: "var(--gold)",
              letterSpacing: ".22em", textTransform: "uppercase",
              marginBottom: 10,
            }}>★ Featured Story</p>
            <RRVideoCard video={featured} size="lg" onClick={setPlaying} />
          </div>
        )}

        {/* Recommended (AI) */}
        {recommended.length > 0 && (
          <Section title="Picked For You" subtitle="Based on your recovery journey & focus.">
            <Carousel>
              {recommended.map(v => (
                <RRVideoCard key={v.id} video={v} onClick={setPlaying} />
              ))}
            </Carousel>
          </Section>
        )}

        {/* Submit your story CTA */}
        <button onClick={() => user ? setShowSubmit(true) : base44.auth.redirectToLogin("/RiseRecover")}
          style={{
            width: "100%",
            background: "linear-gradient(135deg, var(--bg-2), rgba(167,139,250,0.10))",
            border: "1px solid var(--border-glow)",
            borderRadius: 22, padding: "18px 18px",
            cursor: "pointer", display: "flex", alignItems: "center", gap: 14,
            backdropFilter: "blur(18px)",
            boxShadow: "var(--glow), var(--shadow-card)",
            color: "var(--text)", textAlign: "left",
            fontFamily: "'DM Sans', sans-serif",
            margin: "20px 0 26px",
          }}>
          <div style={{
            width: 46, height: 46, borderRadius: 14, flexShrink: 0,
            background: "linear-gradient(135deg, var(--accent), var(--purple))",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "var(--glow)",
          }}>
            <Plus style={{ width: 22, height: 22, color: "#fff" }} strokeWidth={2.4} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{
              fontSize: 10.5, fontWeight: 800, color: "var(--accent)",
              letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 3,
            }}>Share Your Comeback</p>
            <p style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.3, marginBottom: 2 }}>
              Your story could change someone's life.
            </p>
            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
              Video, audio, or written. Anonymous if you want.
            </p>
          </div>
        </button>

        {/* Category filter */}
        <div style={{
          display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4,
          marginBottom: 16, scrollbarWidth: "none",
        }}>
          <CatPill active={activeCat === "all"} onClick={() => setActiveCat("all")}>
            All
          </CatPill>
          {RR_CATEGORIES.map(c => (
            <CatPill key={c.key} active={activeCat === c.key} accent={c.accent}
              onClick={() => setActiveCat(c.key)}>
              <span>{c.emoji}</span> {c.label}
            </CatPill>
          ))}
        </div>

        {/* Sections */}
        {activeCat === "all" ? (
          RR_CATEGORIES.map(cat => {
            const vids = allVideos.filter(v => v.category === cat.key);
            if (!vids.length) return null;
            return (
              <Section key={cat.key} title={`${cat.emoji} ${cat.label}`} subtitle={cat.blurb}>
                <Carousel>
                  {vids.map(v => <RRVideoCard key={v.id} video={v} onClick={setPlaying} />)}
                </Carousel>
              </Section>
            );
          })
        ) : (
          <Section title={CAT_BY_KEY[activeCat]?.label} subtitle={CAT_BY_KEY[activeCat]?.blurb}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
              {filtered.map(v => <RRVideoCard key={v.id} video={v} onClick={setPlaying} />)}
            </div>
          </Section>
        )}

        {/* Saved strip */}
        {saves.length > 0 && (
          <Section title="Your Saved Stories" icon={<Bookmark style={{ width: 14, height: 14, color: "var(--gold)" }} />}>
            <Carousel>
              {allVideos.filter(v => savedSet.has(v.id)).map(v => (
                <RRVideoCard key={v.id} video={v} onClick={setPlaying} />
              ))}
            </Carousel>
          </Section>
        )}

        <p style={{
          textAlign: "center", marginTop: 30, fontSize: 11,
          color: "var(--text-dim)", lineHeight: 1.7,
        }}>
          These stories are shared to inspire. Recovery is a journey — please reach out for professional support when needed.<br/>
          In an emergency, call 911 or 988.
        </p>
      </div>

      {playing && (
        <RRVideoPlayer
          video={playing}
          isSaved={savedSet.has(playing.id)}
          onClose={() => setPlaying(null)}
          onSave={(v) => user ? saveMut.mutate(v) : base44.auth.redirectToLogin("/RiseRecover")}
          onReact={(video, key) => user && reactMut.mutate({ video, key })}
        />
      )}

      {showSubmit && user && (
        <RRSubmitModal
          user={user}
          onClose={() => setShowSubmit(false)}
        />
      )}
    </div>
  );
}

function Section({ title, subtitle, icon, children }) {
  return (
    <div style={{ marginBottom: 26 }}>
      <div style={{ marginBottom: 12 }}>
        <p style={{
          fontFamily: "'Lora', Georgia, serif",
          fontSize: 22, fontWeight: 700, color: "var(--text)",
          lineHeight: 1.2, letterSpacing: "-.01em",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          {icon} {title}
        </p>
        {subtitle && (
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

function Carousel({ children }) {
  return (
    <div style={{
      display: "flex", gap: 12, overflowX: "auto", paddingBottom: 6,
      scrollSnapType: "x mandatory", scrollbarWidth: "none",
    }}>
      {React.Children.map(children, (c, i) => (
        <div key={i} style={{ scrollSnapAlign: "start", flexShrink: 0 }}>{c}</div>
      ))}
    </div>
  );
}

function CatPill({ active, accent = "var(--accent)", onClick, children }) {
  return (
    <button onClick={onClick} style={{
      flexShrink: 0,
      padding: "8px 14px", borderRadius: 999,
      background: active ? "linear-gradient(135deg, var(--accent), var(--purple))" : "var(--surface)",
      color: active ? "#fff" : "var(--text)",
      border: active ? "1px solid transparent" : "1px solid var(--border)",
      fontSize: 12, fontWeight: 600, cursor: "pointer",
      display: "inline-flex", alignItems: "center", gap: 5,
      backdropFilter: "blur(10px)",
      boxShadow: active ? `0 0 18px ${accent}` : "none",
      fontFamily: "'DM Sans', sans-serif",
      transition: "all .18s",
    }}>{children}</button>
  );
}