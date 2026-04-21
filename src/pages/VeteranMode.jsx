import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import VMStepEntry     from "@/components/veteranmode/VMStepEntry";
import VMStepService   from "@/components/veteranmode/VMStepService";
import VMStepFocus     from "@/components/veteranmode/VMStepFocus";
import VMStepStructure from "@/components/veteranmode/VMStepStructure";
import VMStepResources from "@/components/veteranmode/VMStepResources";
import VMStepPrivacy   from "@/components/veteranmode/VMStepPrivacy";
import VMDashboard     from "@/components/veteranmode/VMDashboard";
import { VM } from "@/components/veteranmode/vmData";

const TODAY = () => new Date().toISOString().split("T")[0];

export default function VeteranMode() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [step, setStep] = useState(0); // 0 entry, 1 service, 2 focus, 3 structure, 4 resources, 5 privacy

  const [form, setForm] = useState({
    branch: null,
    service_years: "",
    combat_experience: null,
    support_style: "guided",
    current_focus: [],
    checkin_time: "08:00",
    notification_tone: "direct",
    resource_priority: [],
  });

  const { data: user, isLoading: uL } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: profile, isLoading: pL } = useQuery({
    queryKey: ["vm-profile", user?.email],
    queryFn: async () => {
      const rows = await base44.entities.VeteranProfile.filter({ user_email: user.email });
      return rows[0] || null;
    },
    enabled: !!user?.email,
  });

  const { data: missions = [] } = useQuery({
    queryKey: ["vm-mission", user?.email, TODAY()],
    queryFn: () => base44.entities.VeteranMission.filter({ user_email: user.email, mission_date: TODAY() }),
    enabled: !!user?.email && !!profile?.veteran_mode_complete,
  });
  const todayMission = missions[0] || null;

  const { data: checkIns = [] } = useQuery({
    queryKey: ["vm-checkins", user?.email],
    queryFn: () => base44.entities.DailyCheckIn.filter({ participant_email: user.email }, "-check_in_date", 60),
    enabled: !!user?.email && !!profile?.veteran_mode_complete,
  });

  const { data: resources = [] } = useQuery({
    queryKey: ["vm-resources"],
    queryFn: () => base44.entities.VeteranResource.list("-created_date", 100),
    enabled: !!profile?.veteran_mode_complete,
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ["vm-favorites", user?.email],
    queryFn: () => base44.entities.VeteranResourceFavorite.filter({ user_email: user.email }),
    enabled: !!user?.email && !!profile?.veteran_mode_complete,
  });

  const savedIds = useMemo(() => new Set(favorites.map(f => f.resource_id)), [favorites]);

  const weekCheckins = useMemo(() => {
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 7); cutoff.setHours(0, 0, 0, 0);
    return checkIns.filter(c => new Date(c.check_in_date) >= cutoff).length;
  }, [checkIns]);

  const { data: completedMissions = [] } = useQuery({
    queryKey: ["vm-missions-done", user?.email],
    queryFn: () => base44.entities.VeteranMission.filter({ user_email: user.email, mission_completed: true }, "-mission_date", 50),
    enabled: !!user?.email && !!profile?.veteran_mode_complete,
  });

  const tasksDone = completedMissions.length;
  const supportActions = checkIns.filter(c => c.connected_with_sponsor || c.attended_meeting).length;

  const streak = useMemo(() => {
    const sorted = [...checkIns].sort((a, b) => new Date(b.check_in_date) - new Date(a.check_in_date));
    let n = 0, cur = new Date(); cur.setHours(0, 0, 0, 0);
    for (const c of sorted) {
      const d = new Date(c.check_in_date); d.setHours(0, 0, 0, 0);
      if (Math.round((cur - d) / 86400000) <= 1) { n++; cur = d; } else break;
    }
    return n;
  }, [checkIns]);

  const todaysCheckin = checkIns.find(c => c.check_in_date === TODAY());

  const saveProfile = useMutation({
    mutationFn: async () => {
      const payload = {
        user_email: user.email,
        branch: form.branch || undefined,
        service_years: form.service_years || undefined,
        combat_experience: form.combat_experience || undefined,
        support_style: form.support_style,
        current_focus: form.current_focus,
        checkin_time: form.checkin_time,
        notification_tone: form.notification_tone,
        resource_priority: form.resource_priority,
        veteran_mode_complete: true,
      };
      // Drop undefined keys
      Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);

      if (profile) return base44.entities.VeteranProfile.update(profile.id, payload);
      return base44.entities.VeteranProfile.create(payload);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vm-profile"] }),
  });

  const setMood = useMutation({
    mutationFn: async (mood) => {
      if (todaysCheckin) {
        return base44.entities.DailyCheckIn.update(todaysCheckin.id, { mood_rating: mood });
      }
      return base44.entities.DailyCheckIn.create({
        participant_email: user.email,
        check_in_date: TODAY(),
        mood_rating: mood,
        attended_meeting: null,
        connected_with_sponsor: null,
        relapse_risk_flag: false,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vm-checkins"] }),
  });

  const toggleFavorite = useMutation({
    mutationFn: async (resource) => {
      const existing = favorites.find(f => f.resource_id === resource.id);
      if (existing) return base44.entities.VeteranResourceFavorite.delete(existing.id);
      return base44.entities.VeteranResourceFavorite.create({ user_email: user.email, resource_id: resource.id });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vm-favorites"] }),
  });

  const saveCheckin = useMutation({
    mutationFn: async ({ mood, energy, focus, note }) => {
      const payload = {
        participant_email: user.email,
        check_in_date: TODAY(),
        mood_rating: mood,
        notes: [energy && `Energy: ${energy}`, focus && `Focus: ${focus}`, note].filter(Boolean).join(" · ") || null,
        attended_meeting: null,
        connected_with_sponsor: null,
        relapse_risk_flag: false,
      };
      if (todaysCheckin) return base44.entities.DailyCheckIn.update(todaysCheckin.id, payload);
      return base44.entities.DailyCheckIn.create(payload);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vm-checkins"] }),
  });

  const toggleObjective = useMutation({
    mutationFn: async (objectiveText) => {
      if (todayMission) {
        return base44.entities.VeteranMission.update(todayMission.id, {
          mission_text: objectiveText,
          mission_completed: !todayMission.mission_completed,
        });
      }
      return base44.entities.VeteranMission.create({
        user_email: user.email,
        mission_date: TODAY(),
        mission_text: objectiveText,
        mission_completed: true,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vm-mission"] }),
  });

  if (uL || pL) {
    return (
      <div style={{ background: VM.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 style={{ width: 22, height: 22, color: VM.olive }} className="animate-spin" />
      </div>
    );
  }

  // If profile has completed Veteran Mode, show dashboard
  if (profile?.veteran_mode_complete) {
    return (
      <VMDashboard
        profile={profile}
        todayMission={todayMission}
        streak={streak}
        todayCheckinMood={todaysCheckin?.mood_rating}
        onSetMood={(v) => setMood.mutate(v)}
        onToggleObjective={(text) => toggleObjective.mutate(text)}
        onEditSettings={() => navigate("/VeteranModeSettings")}
        resources={resources}
        savedIds={savedIds}
        onSaveResource={(r) => toggleFavorite.mutate(r)}
        weekCheckins={weekCheckins}
        tasksDone={tasksDone}
        supportActions={supportActions}
        hasAnyData={checkIns.length > 0 || completedMissions.length > 0}
        onSaveCheckin={(data) => saveCheckin.mutate(data)}
      />
    );
  }

  // Onboarding flow
  const next = () => setStep(s => s + 1);
  const back = () => setStep(s => Math.max(0, s - 1));

  if (step === 0) return <VMStepEntry onNext={next} />;
  if (step === 1) return <VMStepService form={form} onChange={setForm} onNext={next} onSkip={next} onBack={back} />;
  if (step === 2) return <VMStepFocus form={form} onChange={setForm} onNext={next} onBack={back} />;
  if (step === 3) return <VMStepStructure form={form} onChange={setForm} onNext={next} onBack={back} />;
  if (step === 4) return <VMStepResources form={form} onChange={setForm} onNext={next} onBack={back} />;
  return (
    <VMStepPrivacy
      onBack={back}
      saving={saveProfile.isPending}
      onFinish={() => saveProfile.mutate()}
    />
  );
}