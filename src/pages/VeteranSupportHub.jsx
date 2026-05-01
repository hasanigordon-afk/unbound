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
    <div style={{ background: C.cream, minHeight: "100vh", paddingBottom: 130 }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>

        {/* Pinned crisis strip */}
        <div ref={crisisRef} style={{
          position: "sticky", top: 0, zIndex: 40,
          padding: "10px 12px 6px",
          background: `linear-gradient(180deg, ${C.cream} 80%, rgba(246,244,239,0) 100%)`,
        }}>
          <CrisisStrip />
        </div>

        {/* Header */}
        <div style={{ padding: "16px 20px 8px" }}>
          <button onClick={() => navigate("/")}
            style={{
              background: "transparent", border: "none", padding: 0, cursor: "pointer",
              display: "inline-flex", alignItems: "center", gap: 6,
              color: C.muted, fontSize: 13, fontWeight: 600, marginBottom: 12,
            }}>
            <ArrowLeft style={{ width: 15, height: 15 }} /> Home
          </button>
          <h1 style={{
            fontFamily: "'Lora', Georgia, serif", fontSize: 30, fontWeight: 700,
            color: C.navy, lineHeight: 1.1, marginBottom: 6,
          }}>
            Veteran <span style={{ color: C.gold }}>Support Hub</span>
          </h1>
          <p style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.6 }}>
            You served your country. Now let us serve you.
          </p>
        </div>

        <div style={{ padding: "8px 16px 0", display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Primary actions */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 800, color: C.muted,
              letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 8 }}>Get help fast</p>
            <PrimaryActionGrid onPick={handlePickAction} />
          </div>

          {/* Map CTA */}
          <Link to="/VeteranResourceMap" style={{ textDecoration: "none" }}>
            <div style={{
              background: "#fff", border: `1px solid ${C.border}`,
              borderRadius: 18, padding: "14px 16px",
              display: "flex", alignItems: "center", gap: 12,
              boxShadow: "0 2px 10px rgba(15,30,61,0.05)",
            }}>
              <div style={{
                width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                background: "rgba(15,30,61,0.08)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <MapPin style={{ width: 20, height: 20, color: C.navy }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 11, fontWeight: 800, color: C.navy,
                  letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 2 }}>Map View</p>
                <p style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 2 }}>
                  Resources near you
                </p>
                <p style={{ fontSize: 11.5, color: C.dim }}>
                  VA hospitals, shelters, jobs · filter by distance →
                </p>
              </div>
            </div>
          </Link>

          {/* AI Assistant CTA */}
          <button onClick={openAssistant}
            style={{
              background: "linear-gradient(135deg,#0F1E3D 0%,#1A2E5C 100%)",
              border: "1px solid rgba(200,147,47,0.32)",
              borderRadius: 18, padding: "16px 18px", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 14, color: "#fff",
              boxShadow: "0 4px 16px rgba(15,30,61,0.18)",
              fontFamily: "'DM Sans', sans-serif", textAlign: "left",
            }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, flexShrink: 0,
              background: "rgba(200,147,47,0.20)",
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
          <p style={{ textAlign: "center", fontSize: 11, color: C.dim,
            lineHeight: 1.7, padding: "8px 12px 0" }}>
            Re-siliant is a support tool, not a medical or legal provider.<br/>
            In an emergency, call 911 or 988.
          </p>
        </div>
      </div>
    </div>
  );
}