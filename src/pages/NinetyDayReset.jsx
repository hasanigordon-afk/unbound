import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";

import ResetIntro from "@/components/mindbody/reset/ResetIntro";
import ResetDashboard from "@/components/mindbody/reset/ResetDashboard";

const today = () => new Date().toISOString().split("T")[0];

export default function NinetyDayReset() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: user, isLoading: uL } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: program, isLoading: pL } = useQuery({
    queryKey: ["reset-program", user?.email],
    queryFn: async () => {
      const rows = await base44.entities.ResetProgram.filter(
        { user_email: user.email, status: "active" },
        "-created_date",
        1
      );
      if (rows[0]) return rows[0];
      const paused = await base44.entities.ResetProgram.filter(
        { user_email: user.email, status: "paused" },
        "-created_date",
        1
      );
      return paused[0] || null;
    },
    enabled: !!user?.email,
  });

  const { data: logs = [], isLoading: lL } = useQuery({
    queryKey: ["mindbody-logs", user?.email],
    queryFn: () => base44.entities.MindBodyLog.filter({ user_email: user.email }, "-log_date", 100),
    enabled: !!user?.email,
  });

  const todayLog = logs.find(l => l.log_date === today()) || null;

  const upsertTodayLog = async (patch) => {
    if (todayLog) return base44.entities.MindBodyLog.update(todayLog.id, patch);
    return base44.entities.MindBodyLog.create({
      user_email: user.email,
      log_date: today(),
      ...patch,
    });
  };

  const startMutation = useMutation({
    mutationFn: ({ fasting_enabled }) =>
      base44.entities.ResetProgram.create({
        user_email: user.email,
        started_at: today(),
        status: "active",
        fasting_enabled,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reset-program"] }),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ key, value }) => upsertTodayLog({ [key]: value }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mindbody-logs"] }),
  });

  const pauseMutation = useMutation({
    mutationFn: async () => {
      const next = program.status === "active" ? "paused" : "active";
      return base44.entities.ResetProgram.update(program.id, { status: next });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reset-program"] }),
  });

  const reflectionMutation = useMutation({
    mutationFn: async ({ text, mood }) => {
      const patches = [];
      if (text) patches.push(base44.entities.ResetProgram.update(program.id, { last_reflection: text }));
      const logPatch = {};
      if (mood) logPatch.post_activity_mood = mood;
      if (mood) logPatch.mental_checkin = true;
      if (Object.keys(logPatch).length > 0) patches.push(upsertTodayLog(logPatch));
      await Promise.all(patches);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reset-program"] });
      qc.invalidateQueries({ queryKey: ["mindbody-logs"] });
    },
  });

  if (uL || pL || lL) {
    return (
      <div style={{ background: "#F7F3EE", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 style={{ width: 24, height: 24, color: "#B8823A" }} className="animate-spin" />
      </div>
    );
  }

  return (
    <div style={{ background: "#F7F3EE", minHeight: "100vh", paddingBottom: 120 }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ padding: "48px 20px 16px", background: "#FDFAF6", borderBottom: "1px solid #E8E2D9" }}>
          <button onClick={() => navigate(-1)} style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "none", border: "none", cursor: "pointer",
            color: "#4A3F35", fontSize: 13, fontWeight: 600, marginBottom: 14, padding: 0,
          }}>
            <ArrowLeft style={{ width: 15, height: 15 }} /> Back
          </button>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#B8823A", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 }}>
            Guided Program
          </p>
          <h1 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: 26, fontWeight: 600, color: "#1C1410", lineHeight: 1.2 }}>
            90-Day Mind-Body Reset
          </h1>
        </div>

        {!program ? (
          <ResetIntro
            onStart={(opts) => startMutation.mutate(opts)}
            starting={startMutation.isPending}
          />
        ) : (
          <ResetDashboard
            program={program}
            logs={logs}
            todayLog={todayLog}
            saving={toggleMutation.isPending || pauseMutation.isPending || reflectionMutation.isPending}
            onToggle={(key, value) => toggleMutation.mutate({ key, value })}
            onTogglePause={() => pauseMutation.mutate()}
            onSaveReflection={(text, mood) => reflectionMutation.mutate({ text, mood })}
          />
        )}
      </div>
    </div>
  );
}