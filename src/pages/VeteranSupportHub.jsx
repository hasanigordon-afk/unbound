import React, { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, MessageCircle, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

import CrisisStrip from "@/components/veteranhub/CrisisStrip";
import PrimaryActionGrid from "@/components/veteranhub/PrimaryActionGrid";
import SmartFilters from "@/components/veteranhub/SmartFilters";
import CategoryCard from "@/components/veteranhub/CategoryCard";
import MilestoneTracker from "@/components/veteranhub/MilestoneTracker";
import VeteranModeBanner from "@/components/veteranhub/VeteranModeBanner";
import { CATEGORIES, VH_COLORS as C } from "@/components/veteranhub/vetHubData";

const ACTION_TO_CATEGORY = {
  crisis:     null, // scroll to top crisis strip
  housing:    "housing",
  employment: "employment",
  mental:     "mental",
  financial:  "financial",
  community:  "community",
};

export default function VeteranSupportHub() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const sectionRefs = useRef({});
  const crisisRef = useRef(null);

  const [filters, setFilters] = useState({ need: "all", branch: "all" });
  const [location, setLocation] = useState(null);
  const [locating, setLocating] = useState(false);

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me(), retry: false });

  const { data: vetProfile } = useQuery({
    queryKey: ["vet-profile", user?.email],
    queryFn: async () => {
      const list = await base44.entities.VeteranProfile.filter({ user_email: user.email });
      return list?.[0] || null;
    },
    enabled: !!user?.email,
  });

  const { data: milestones = [] } = useQuery({
    queryKey: ["vet-milestones", user?.email],
    queryFn: () => base44.entities.VeteranMilestone.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const completedKeys = useMemo(
    () => milestones.filter((m) => m.completed).map((m) => m.milestone_key),
    [milestones]
  );

  // Veteran Mode toggle — persisted on VeteranProfile.veteran_mode_complete
  const veteranModeOn = !!vetProfile?.veteran_mode_complete;

  const toggleVeteranMode = useMutation({
    mutationFn: async () => {
      if (vetProfile) {
        return base44.entities.VeteranProfile.update(vetProfile.id, {
          veteran_mode_complete: !veteranModeOn,
        });
      }
      return base44.entities.VeteranProfile.create({
        user_email: user.email,
        veteran_mode_complete: true,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vet-profile"] }),
  });

  const toggleMilestone = useMutation({
    mutationFn: async ({ key, isDone }) => {
      const existing = milestones.find((m) => m.milestone_key === key);
      if (existing) {
        return base44.entities.VeteranMilestone.update(existing.id, {
          completed: !isDone,
          completed_at: !isDone ? new Date().toISOString() : null,
        });
      }
      return base44.entities.VeteranMilestone.create({
        user_email: user.email,
        milestone_key: key,
        completed: true,
        completed_at: new Date().toISOString(),
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vet-milestones"] }),
  });

  // GPS location for "Use my location"
  const handleLocate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocation({ lat: coords.latitude, lng: coords.longitude });
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 8000 }
    );
  };

  // Filter categories based on smart filters
  const filteredCategories = useMemo(() => {
    if (filters.need === "all") return CATEGORIES;
    return CATEGORIES.filter((c) => c.needs.includes(filters.need));
  }, [filters.need]);

  // Smooth-scroll on action panel pick
  const handlePickAction = (action) => {
    if (action.key === "crisis") {
      crisisRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    const catKey = ACTION_TO_CATEGORY[action.key];
    if (catKey) {
      const el = document.getElementById(`vh-cat-${catKey}`);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Open AI Stein assistant (already mounted globally)
  const openAssistant = () => {
    const bubble = document.querySelector('[aria-label="Open AI Stein"]') ||
                   document.querySelector('[data-aistein-bubble]');
    if (bubble) bubble.click();
  };

  // Auto-scroll to category if URL has ?focus=
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const focus = params.get("focus");
    if (focus) {
      setTimeout(() => {
        document.getElementById(`vh-cat-${focus}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 250);
    }
  }, []);

  return (
    <div className="vet-hub-premium-shell" style={{ minHeight: "100vh", paddingBottom: 130 }}>
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "0 18px" }}>

        {/* Pinned crisis strip */}
        <div ref={crisisRef} style={{
          position: "sticky", top: 0, zIndex: 40,
          padding: "10px 12px 6px",
          background: "linear-gradient(180deg, rgba(7,10,20,.94) 72%, rgba(7,10,20,0) 100%)",
        }}>
          <CrisisStrip />
        </div>

        {/* Header */}
        <div className="vet-hub-hero" style={{ padding: "28px 24px 24px", marginTop: 10 }}>
          <button onClick={() => navigate("/")}
            style={{
              background: "transparent", border: "none", padding: 0, cursor: "pointer",
              display: "inline-flex", alignItems: "center", gap: 6,
              color: "var(--text-muted)", fontSize: 13, fontWeight: 800, marginBottom: 14,
            }}>
            <ArrowLeft style={{ width: 15, height: 15 }} /> Home
          </button>
          <h1 style={{
            fontFamily: "'Lora', Georgia, serif", fontSize: 30, fontWeight: 700,
            color: "var(--text)", lineHeight: 0.98, marginBottom: 10, letterSpacing: "-.045em",
          }}>
            Veteran <span style={{ color: "var(--gold)", textShadow: "0 0 28px rgba(240,183,83,.24)" }}>Support Hub</span>
          </h1>
          <p style={{ fontSize: 16, color: "var(--text-muted)", lineHeight: 1.7, maxWidth: 680 }}>
            You served your country. Now let ReZilient help you find support, structure, benefits, housing, work, healing, and community.
          </p>
        </div>

        <div style={{ padding: "8px 16px 0", display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Primary actions */}
          <div>
            <p className="section-label">Get help fast</p>
            <PrimaryActionGrid onPick={handlePickAction} />
          </div>

          {/* Map CTA */}
          <Link to="/VeteranResourceMap" style={{ textDecoration: "none" }}>
            <div style={{
              background: "linear-gradient(145deg, rgba(255,255,255,.10), rgba(13,18,32,.72))", border: "1px solid rgba(190,225,255,.16)",
              borderRadius: 24, padding: "18px 20px",
              display: "flex", alignItems: "center", gap: 14,
              boxShadow: "0 18px 48px rgba(0,0,0,.30), inset 0 1px 0 rgba(255,255,255,.10)", backdropFilter: "blur(24px) saturate(160%)",
            }}>
              <div style={{
                width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                background: "rgba(34,211,238,0.10)", border: "1px solid rgba(34,211,238,.22)", boxShadow: "0 0 24px rgba(34,211,238,.14)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <MapPin style={{ width: 20, height: 20, color: "#22D3EE" }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 11, fontWeight: 900, color: "#22D3EE",
                  letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 2 }}>Map View</p>
                <p style={{ fontSize: 15, fontWeight: 900, color: "var(--text)", marginBottom: 2 }}>
                  Resources near you
                </p>
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  VA hospitals, shelters, jobs · filter by distance →
                </p>
              </div>
            </div>
          </Link>

          {/* AI Assistant CTA */}
          <button onClick={openAssistant}
            style={{
              background: "linear-gradient(135deg, rgba(91,141,239,.92), rgba(34,211,238,.42), rgba(167,139,250,.68))",
              border: "1px solid rgba(220,245,255,0.28)",
              borderRadius: 24, padding: "18px 20px", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 14, color: "#fff",
              boxShadow: "0 0 34px rgba(91,141,239,.28), 0 18px 48px rgba(0,0,0,.32), inset 0 1px 0 rgba(255,255,255,.20)",
              fontFamily: "'DM Sans', sans-serif", textAlign: "left",
            }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, flexShrink: 0,
              background: "rgba(240,183,83,0.18)", border: "1px solid rgba(240,183,83,.28)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <MessageCircle style={{ width: 20, height: 20, color: C.gold }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 11, fontWeight: 800, color: C.gold,
                letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 2 }}>AI Assistant</p>
              <p style={{ fontSize: 14.5, fontWeight: 800, marginBottom: 2 }}>Talk to Someone Who Understands</p>
              <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.72)" }}>
                Benefits questions, resource navigation, anything →
              </p>
            </div>
          </button>

          {/* Veteran Mode banner */}
          <VeteranModeBanner
            active={veteranModeOn}
            saving={toggleVeteranMode.isPending}
            onToggle={() => toggleVeteranMode.mutate()}
          />

          {/* Smart filters */}
          <SmartFilters
            filters={filters}
            setFilters={setFilters}
            location={location}
            onLocate={handleLocate}
            locating={locating}
          />

          {/* Resource categories */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filteredCategories.length === 0 ? (
              <div style={{
                background: "#fff", border: `1px solid ${C.border}`,
                borderRadius: 18, padding: 24, textAlign: "center",
              }}>
                <p style={{ fontSize: 13, color: C.muted }}>No categories match that filter.</p>
              </div>
            ) : (
              filteredCategories.map((cat) => (
                <CategoryCard
                  key={cat.key}
                  category={cat}
                  sectionRef={(el) => (sectionRefs.current[cat.key] = el)}
                />
              ))
            )}
          </div>

          {/* Milestone tracker */}
          {user && (
            <MilestoneTracker
              completedKeys={completedKeys}
              saving={toggleMilestone.isPending}
              onToggle={(key, isDone) => toggleMilestone.mutate({ key, isDone })}
            />
          )}

          {/* Footer disclaimer */}
          <p style={{ textAlign: "center", fontSize: 11, color: "var(--text-dim)",
            lineHeight: 1.7, padding: "10px 12px 0", fontWeight: 800, letterSpacing: ".04em" }}>
            ReZilient is a support tool, not a medical or legal provider.<br/>
            In an emergency, call 911 or 988.
          </p>

          <style>{`
            .vet-hub-premium-shell {
              position: relative;
              overflow: hidden;
              background:
                radial-gradient(circle at 18% 4%, rgba(34,211,238,.15), transparent 30%),
                radial-gradient(circle at 88% 12%, rgba(240,183,83,.10), transparent 28%),
                linear-gradient(180deg, #070A14 0%, #0A1020 54%, #070A14 100%);
              color: var(--text);
            }
            .vet-hub-premium-shell:before {
              content: '';
              position: fixed;
              inset: 0;
              pointer-events: none;
              opacity: .10;
              background-image:
                linear-gradient(rgba(255,255,255,.12) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,.12) 1px, transparent 1px),
                radial-gradient(circle, rgba(255,255,255,.8) 0 1px, transparent 1.5px);
              background-size: 70px 70px, 70px 70px, 58px 58px;
              animation: vetHubDrift 28s linear infinite;
            }
            .vet-hub-hero {
              position: relative;
              overflow: hidden;
              border-radius: 34px;
              background: linear-gradient(145deg, rgba(255,255,255,.105), rgba(13,18,32,.78));
              border: 1px solid rgba(190,225,255,.16);
              box-shadow: 0 24px 70px rgba(0,0,0,.38), inset 0 1px 0 rgba(255,255,255,.10);
              backdrop-filter: blur(28px) saturate(165%);
            }
            .vet-hub-hero:before {
              content: '';
              position: absolute;
              inset: 0;
              pointer-events: none;
              background: radial-gradient(circle at 78% 10%, rgba(34,211,238,.16), transparent 34%), radial-gradient(circle at 8% 100%, rgba(240,183,83,.10), transparent 38%);
            }
            .vet-hub-hero > * { position: relative; z-index: 1; }
            @keyframes vetHubDrift { from { transform: translate3d(0,0,0); } to { transform: translate3d(-70px,-70px,0); } }
          `}</style>
        </div>
      </div>
    </div>
  );
}