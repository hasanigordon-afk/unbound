import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, MapPin, Users, BookOpen, Target, AlertTriangle, Settings } from "lucide-react";

import VeteranOnboarding from "@/components/veterans/VeteranOnboarding";
import VeteransResources from "@/components/veterans/VeteransResources";
import VeteransCommunity from "@/components/veterans/VeteransCommunity";
import VeteranStoryTab from "@/components/veterans/VeteranStoryTab";
import ReintegrationTools from "@/components/veterans/ReintegrationTools";
import CrisisButton from "@/components/veterans/CrisisButton";
import { VET_COLORS, getBranch } from "@/components/veterans/veteransData";

const TODAY = () => new Date().toISOString().split("T")[0];

const MODULES = [
  { key: "resources", label: "Resources Near Me",     desc: "VA, mental health, housing, jobs",       icon: MapPin,         color: VET_COLORS.olive },
  { key: "community", label: "Veteran Community",      desc: "Connect with brothers & sisters",        icon: Users,          color: VET_COLORS.navy },
  { key: "story",     label: "Share Your Story",       desc: "Ah Ha Moment — Veteran Edition",         icon: BookOpen,       color: VET_COLORS.sand },
  { key: "tools",     label: "Reintegration Tools",    desc: "Daily check-in, mission, goals",         icon: Target,         color: "#7A9E7E" },
];

export default function VeteransDashboard() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [activeModule, setActiveModule] = useState(null);

  const { data: user, isLoading: uL } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: profile, isLoading: pL } = useQuery({
    queryKey: ["veteran-profile", user?.email],
    queryFn: async () => {
      const rows = await base44.entities.VeteranProfile.filter({ user_email: user.email });
      return rows[0] || null;
    },
    enabled: !!user?.email,
  });

  const { data: resources = [] } = useQuery({
    queryKey: ["veteran-resources"],
    queryFn: () => base44.entities.VeteranResource.list("-created_date", 200),
    enabled: activeModule === "resources",
  });

  const { data: posts = [] } = useQuery({
    queryKey: ["veteran-posts"],
    queryFn: () => base44.entities.VeteranPost.filter({ status: "active" }, "-created_date", 100),
    enabled: activeModule === "community",
  });

  const { data: myReactionsList = [] } = useQuery({
    queryKey: ["veteran-reactions", user?.email],
    queryFn: () => base44.entities.VeteranPostReaction.filter({ user_email: user.email }),
    enabled: !!user?.email && activeModule === "community",
  });

  const myReactions = Object.fromEntries(myReactionsList.map(r => [r.post_id, r.reaction_type]));

  const { data: myStories = [] } = useQuery({
    queryKey: ["veteran-stories", user?.email],
    queryFn: () => base44.entities.VeteranStory.filter({ user_email: user.email }, "-created_date", 50),
    enabled: !!user?.email && activeModule === "story",
  });

  const { data: missions = [] } = useQuery({
    queryKey: ["veteran-missions", user?.email],
    queryFn: () => base44.entities.VeteranMission.filter({ user_email: user.email, mission_date: TODAY() }),
    enabled: !!user?.email && activeModule === "tools",
  });
  const todayMission = missions[0] || null;

  const { data: goals = [] } = useQuery({
    queryKey: ["veteran-goals", user?.email],
    queryFn: () => base44.entities.VeteranGoal.filter({ user_email: user.email }, "-created_date", 50),
    enabled: !!user?.email && activeModule === "tools",
  });

  // ── Mutations ─────────────────────────────────────────────
  const createProfile = useMutation({
    mutationFn: (data) => base44.entities.VeteranProfile.create({ user_email: user.email, ...data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["veteran-profile"] }),
  });

  const createPost = useMutation({
    mutationFn: (data) => base44.entities.VeteranPost.create({
      user_email: user.email,
      branch: profile.branch,
      display_name: profile.first_name,
      ...data,
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["veteran-posts"] }),
  });

  const reactMutation = useMutation({
    mutationFn: async ({ post, reaction_type }) => {
      const existing = myReactionsList.find(r => r.post_id === post.id);
      const field = `reaction_${reaction_type}`;
      if (existing && existing.reaction_type === reaction_type) {
        // toggle off
        await base44.entities.VeteranPostReaction.delete(existing.id);
        await base44.entities.VeteranPost.update(post.id, { [field]: Math.max(0, (post[field] || 0) - 1) });
      } else if (existing) {
        // switch reaction
        const oldField = `reaction_${existing.reaction_type}`;
        await base44.entities.VeteranPostReaction.update(existing.id, { reaction_type });
        await base44.entities.VeteranPost.update(post.id, {
          [oldField]: Math.max(0, (post[oldField] || 0) - 1),
          [field]: (post[field] || 0) + 1,
        });
      } else {
        await base44.entities.VeteranPostReaction.create({ post_id: post.id, user_email: user.email, reaction_type });
        await base44.entities.VeteranPost.update(post.id, { [field]: (post[field] || 0) + 1 });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["veteran-posts"] });
      qc.invalidateQueries({ queryKey: ["veteran-reactions"] });
    },
  });

  const createStory = useMutation({
    mutationFn: (data) => base44.entities.VeteranStory.create({
      user_email: user.email,
      branch: profile.branch,
      status: data.visibility === "public" ? "pending" : "approved",
      ...data,
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["veteran-stories"] }),
  });

  const upsertMission = async (patch) => {
    if (todayMission) return base44.entities.VeteranMission.update(todayMission.id, patch);
    return base44.entities.VeteranMission.create({ user_email: user.email, mission_date: TODAY(), ...patch });
  };

  const setMood = useMutation({
    mutationFn: (v) => upsertMission({ mood_rating: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["veteran-missions"] }),
  });

  const toggleMission = useMutation({
    mutationFn: (missionText) => upsertMission({
      mission_text: missionText,
      mission_completed: !(todayMission?.mission_completed),
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["veteran-missions"] }),
  });

  const createGoal = useMutation({
    mutationFn: (data) => base44.entities.VeteranGoal.create({ user_email: user.email, ...data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["veteran-goals"] }),
  });

  const updateGoal = useMutation({
    mutationFn: ({ id, patch }) => base44.entities.VeteranGoal.update(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["veteran-goals"] }),
  });

  if (uL || pL) {
    return (
      <div style={{ background: VET_COLORS.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 style={{ width: 24, height: 24, color: VET_COLORS.olive }} className="animate-spin" />
      </div>
    );
  }

  const handleBack = () => {
    if (activeModule) setActiveModule(null);
    else navigate(-1);
  };

  const branch = profile ? getBranch(profile.branch) : null;

  return (
    <div style={{ background: VET_COLORS.bg, minHeight: "100vh", paddingBottom: 120 }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ padding: "48px 20px 20px", background: VET_COLORS.surface, borderBottom: `1px solid ${VET_COLORS.border}` }}>
          <button onClick={handleBack} style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "none", border: "none", cursor: "pointer",
            color: VET_COLORS.muted, fontSize: 13, fontWeight: 600, marginBottom: 14, padding: 0,
          }}>
            <ArrowLeft style={{ width: 15, height: 15 }} /> Back
          </button>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: VET_COLORS.olive, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 }}>
                🇺🇸 Veterans Hub
              </p>
              <h1 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: 24, fontWeight: 600, color: VET_COLORS.text, lineHeight: 1.2 }}>
                {activeModule
                  ? MODULES.find(m => m.key === activeModule)?.label
                  : (profile ? `Welcome back, ${branch?.label} Vet` : "Welcome, Veteran")}
              </h1>
            </div>
            {profile && !activeModule && (
              <div style={{
                width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                background: VET_COLORS.oliveDim, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
              }}>
                {branch?.emoji}
              </div>
            )}
          </div>
        </div>

        {/* Onboarding */}
        {!profile && (
          <VeteranOnboarding
            saving={createProfile.isPending}
            onSubmit={(data) => createProfile.mutate(data)}
          />
        )}

        {/* Dashboard */}
        {profile && !activeModule && (
          <div style={{ padding: "20px 16px 40px" }}>
            {/* Disclaimer */}
            <div style={{
              background: VET_COLORS.navyDim, border: `1px solid ${VET_COLORS.navy}30`,
              borderRadius: 12, padding: "12px 14px", marginBottom: 18,
              display: "flex", gap: 10,
            }}>
              <AlertTriangle style={{ width: 16, height: 16, color: VET_COLORS.navy, flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 11, color: VET_COLORS.muted, lineHeight: 1.55 }}>
                This platform provides peer support and resource guidance. It does not replace professional medical or mental health care.
              </p>
            </div>

            <p style={{ fontSize: 10, fontWeight: 700, color: VET_COLORS.dim, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 12 }}>
              What do you need today?
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {MODULES.map(m => {
                const Icon = m.icon;
                return (
                  <button key={m.key} onClick={() => setActiveModule(m.key)} style={{
                    width: "100%", background: VET_COLORS.surface,
                    border: `1px solid ${VET_COLORS.border}`, borderRadius: 14,
                    padding: "16px 18px", cursor: "pointer", textAlign: "left",
                    display: "flex", alignItems: "center", gap: 14,
                  }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                      background: `${m.color}15`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Icon style={{ width: 18, height: 18, color: m.color }} strokeWidth={1.8} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: VET_COLORS.text, marginBottom: 2 }}>{m.label}</p>
                      <p style={{ fontSize: 12, color: VET_COLORS.muted }}>{m.desc}</p>
                    </div>
                    <span style={{ color: VET_COLORS.dim, fontSize: 18 }}>›</span>
                  </button>
                );
              })}
            </div>

            <p style={{ fontSize: 11, color: VET_COLORS.dim, textAlign: "center", marginTop: 28, lineHeight: 1.6, fontStyle: "italic" }}>
              Built for those who served.
            </p>
          </div>
        )}

        {/* Modules */}
        {profile && activeModule === "resources" && (
          <VeteransResources resources={resources} profileZip={profile.zip_code} />
        )}
        {profile && activeModule === "community" && (
          <VeteransCommunity
            posts={posts}
            profile={profile}
            myReactions={myReactions}
            creating={createPost.isPending}
            onCreate={(data) => createPost.mutate(data)}
            onReact={(post, reaction_type) => reactMutation.mutate({ post, reaction_type })}
          />
        )}
        {profile && activeModule === "story" && (
          <VeteranStoryTab
            stories={myStories}
            profile={profile}
            saving={createStory.isPending}
            onSubmit={(data) => createStory.mutate(data)}
          />
        )}
        {profile && activeModule === "tools" && (
          <ReintegrationTools
            todayMission={todayMission}
            goals={goals}
            saving={createGoal.isPending || updateGoal.isPending}
            onSetMood={(v) => setMood.mutate(v)}
            onToggleMission={(text) => toggleMission.mutate(text)}
            onCreateGoal={(data) => createGoal.mutate(data)}
            onUpdateGoal={(id, patch) => updateGoal.mutate({ id, patch })}
          />
        )}
      </div>

      {profile && <CrisisButton />}
    </div>
  );
}