import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ArrowLeft, Loader2, Apple, Dumbbell, Calendar, AlertTriangle } from "lucide-react";
import { WP_COLORS as C, DURATION_DAYS, QUICK_ACTIONS } from "@/lib/wellnessConfig";
import WPDayCard from "@/components/wellness/WPDayCard";
import WPListBlock from "@/components/wellness/WPListBlock";
import WPCheckInCard from "@/components/wellness/WPCheckInCard";
import WPProgressStrip from "@/components/wellness/WPProgressStrip";

export default function WellnessPlanView() {
  const navigate = useNavigate();
  const location = useLocation();
  const qc = useQueryClient();
  const planId = new URLSearchParams(location.search).get("id");

  const [tab, setTab] = useState("today"); // today | meals | workouts | resources

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: plan, isLoading } = useQuery({
    queryKey: ["wellness-plan", planId],
    queryFn: async () => (await base44.entities.WellnessPlan.filter({ id: planId }))?.[0],
    enabled: !!planId,
  });

  const { data: checkIns = [] } = useQuery({
    queryKey: ["wellness-checkins", planId],
    queryFn: () => base44.entities.WellnessCheckIn.filter(
      { wellness_plan_id: planId }, "-checkin_date", 120
    ),
    enabled: !!planId,
  });

  // Compute today's day-number
  const today = new Date().toISOString().split("T")[0];
  const dayNumber = useMemo(() => {
    if (!plan?.start_date) return 1;
    const start = new Date(plan.start_date);
    const now = new Date(today);
    return Math.max(1, Math.floor((now - start) / 86400000) + 1);
  }, [plan, today]);

  const todayCheckIn = checkIns.find(c => c.checkin_date === today);
  const totalDays = DURATION_DAYS[plan?.duration] || 7;

  const todaysMealDay    = plan?.meal_plan?.find(d => d.day === dayNumber)    || plan?.meal_plan?.[0];
  const todaysWorkoutDay = plan?.workout_plan?.find(d => d.day === dayNumber) || plan?.workout_plan?.[0];

  const saveCheckIn = useMutation({
    mutationFn: async (data) => {
      if (todayCheckIn) {
        return base44.entities.WellnessCheckIn.update(todayCheckIn.id, data);
      }
      return base44.entities.WellnessCheckIn.create({
        user_email: user.email,
        wellness_plan_id: planId,
        checkin_date: today,
        day_number: dayNumber,
        ...data,
      });
    },
    onSuccess: async (saved) => {
      qc.invalidateQueries({ queryKey: ["wellness-checkins", planId] });

      // Recompute completed_days + progress on plan
      const fresh = await base44.entities.WellnessCheckIn.filter({ wellness_plan_id: planId });
      const done = fresh.filter(c => c.mission_complete).length;
      const pct = Math.min(100, Math.round((done / totalDays) * 100));
      let phase = plan.current_phase;
      if (plan.duration === "90_day") {
        phase = dayNumber <= 30 ? "phase_1" : dayNumber <= 60 ? "phase_2" : "phase_3";
      }
      await base44.entities.WellnessPlan.update(planId, {
        completed_days: done,
        progress_percentage: pct,
        current_phase: phase,
        status: pct >= 100 ? "completed" : "active",
      });
      qc.invalidateQueries({ queryKey: ["wellness-plan", planId] });
      qc.invalidateQueries({ queryKey: ["wellness-plans"] });
    },
  });

  const handleQuickAction = (key) => {
    if (key === "new_plan")     navigate("/WellnessPlan");
    else if (key === "start_90") navigate("/WellnessPlanBuilder?type=full_90");
    else if (key === "low_cost") setTab("resources");
    else if (key === "pantry")   setTab("resources");
    else if (key === "no_equipment") navigate("/WellnessPlanBuilder?type=exercise");
    else if (key === "veteran_mode") navigate(`/WellnessPlanBuilder?type=${plan.plan_type}`);
    else if (key === "rebuild_mode") navigate(`/WellnessPlanBuilder?type=${plan.plan_type}`);
    else if (key === "adjust_injury") navigate(`/WellnessPlanBuilder?type=${plan.plan_type}`);
    else if (key === "update_goal")   navigate(`/WellnessPlanBuilder?type=${plan.plan_type}`);
    else if (key === "save")          alert("Plan is saved to your profile.");
  };

  if (isLoading || !plan) {
    return (
      <div style={{ background: C.cream, minHeight: "100vh",
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 className="animate-spin" style={{ width: 24, height: 24, color: C.gold }} />
      </div>
    );
  }

  return (
    <div style={{ background: C.cream, minHeight: "100vh", paddingBottom: 130 }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ padding: "40px 20px 18px", background: "#fff",
          borderBottom: `1px solid ${C.border}` }}>
          <button onClick={() => navigate("/WellnessPlan")} style={{
            background: "transparent", border: "none", padding: 0, cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: 6,
            color: C.muted, fontSize: 13, fontWeight: 600, marginBottom: 12,
          }}>
            <ArrowLeft style={{ width: 15, height: 15 }} /> All plans
          </button>

          <p style={{ fontSize: 10.5, fontWeight: 800, color: C.gold,
            textTransform: "uppercase", letterSpacing: ".14em", marginBottom: 4 }}>
            {plan.plan_type === "nutrition" ? "Nutrition" : plan.plan_type === "exercise" ? "Exercise" : "90-Day Wellness"}
            {plan.mode === "veteran" && " · Veteran Mode"}
            {plan.mode === "rebuild" && " · Men's Rebuild"}
          </p>
          <h1 style={{
            fontFamily: "'Lora', Georgia, serif", fontSize: 22, fontWeight: 700,
            color: C.text, lineHeight: 1.25, marginBottom: 8,
          }}>
            {plan.plan_title}
          </h1>
          {plan.headline_message && (
            <p style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.6, fontStyle: "italic" }}>
              {plan.headline_message}
            </p>
          )}
        </div>

        <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 16 }}>

          <WPProgressStrip plan={plan} completedDays={plan.completed_days || 0} currentDay={dayNumber} />

          {/* Tabs */}
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
            {[
              { key: "today",     label: "Today" },
              ...(plan.meal_plan?.length > 0    ? [{ key: "meals",     label: "Meals" }]    : []),
              ...(plan.workout_plan?.length > 0 ? [{ key: "workouts",  label: "Workouts" }] : []),
              { key: "resources", label: "Resources" },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                flexShrink: 0, padding: "8px 16px", borderRadius: 999,
                background: tab === t.key ? C.navy : "#fff",
                color: tab === t.key ? "#fff" : C.muted,
                border: `1px solid ${tab === t.key ? C.navy : C.border}`,
                fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
                fontFamily: "'DM Sans', sans-serif",
              }}>{t.label}</button>
            ))}
          </div>

          {/* TODAY */}
          {tab === "today" && (
            <>
              {/* Discipline / hydration / weekly */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <DashCard label={plan.mode === "veteran" ? "Daily Standard" : "Discipline goal"} value={plan.discipline_goal} accent={C.gold} />
                <DashCard label="Hydration goal" value={plan.hydration_goal} accent={C.green} />
              </div>

              {todaysMealDay && (
                <>
                  <SectionLabel icon={<Apple style={{ width: 14, height: 14 }} />}
                    label={plan.mode === "veteran" ? "Fuel Objective" : "Today's meals"} />
                  <WPDayCard day={todaysMealDay} kind="meal" />
                </>
              )}

              {todaysWorkoutDay && (
                <>
                  <SectionLabel icon={<Dumbbell style={{ width: 14, height: 14 }} />}
                    label={plan.mode === "veteran" ? "Movement Objective" : "Today's workout"} />
                  <WPDayCard day={todaysWorkoutDay} kind="workout" />
                </>
              )}

              <WPCheckInCard
                existing={todayCheckIn}
                saving={saveCheckIn.isPending}
                mode={plan.mode}
                onSave={(data) => saveCheckIn.mutate(data)}
              />

              {/* Quick actions */}
              <div>
                <p style={{ fontSize: 10.5, fontWeight: 800, color: C.dim,
                  textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 10 }}>
                  Quick actions
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {QUICK_ACTIONS.map(qa => (
                    <button key={qa.key} onClick={() => handleQuickAction(qa.key)} style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      padding: "7px 12px", borderRadius: 999,
                      background: "#fff", color: C.muted,
                      border: `1px solid ${C.border}`,
                      fontSize: 12, fontWeight: 600, cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif",
                    }}>
                      <span style={{ fontSize: 13 }}>{qa.icon}</span>
                      {qa.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* MEALS */}
          {tab === "meals" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {plan.meal_plan?.length === 0 && <Empty text="No meal plan in this plan." />}
              {plan.meal_plan?.map((d, i) => <WPDayCard key={i} day={d} kind="meal" />)}
            </div>
          )}

          {/* WORKOUTS */}
          {tab === "workouts" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {plan.workout_plan?.length === 0 && <Empty text="No workout plan in this plan." />}
              {plan.workout_plan?.map((d, i) => <WPDayCard key={i} day={d} kind="workout" />)}
            </div>
          )}

          {/* RESOURCES */}
          {tab === "resources" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {plan.duration === "90_day" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <PhaseCard title="Phase 1 · Reset (Days 1–30)"      text={plan.phase_1_focus} />
                  <PhaseCard title="Phase 2 · Build (Days 31–60)"    text={plan.phase_2_focus} />
                  <PhaseCard title="Phase 3 · Discipline (Days 61–90)" text={plan.phase_3_focus} />
                </div>
              )}
              <WPListBlock title="Grocery list"            items={plan.grocery_list}            icon="🛒" accent={C.green} />
              <WPListBlock title="Low-cost options"        items={plan.low_cost_options}        icon="💰" accent={C.gold} />
              <WPListBlock title="Food pantry-friendly"    items={plan.pantry_friendly_options} icon="🥫" accent={C.gold} />
              <WPListBlock title="Alkaline-style foods"    items={plan.alkaline_foods}          icon="🥬" accent={C.green} />
              <WPListBlock title="Gut-health tips"         items={plan.gut_health_tips}         icon="🌿" accent={C.green} />
              <WPListBlock title="Foods to reduce"         items={plan.foods_to_reduce}         icon="🚫" accent={C.red} />
              <WPListBlock title="Meal prep tips"          items={plan.meal_prep_tips}          icon="📋" accent={C.navy} />
            </div>
          )}

          {/* Disclaimer */}
          <div style={{
            background: "rgba(200,147,47,0.08)",
            border: `1px solid ${C.gold}33`,
            borderRadius: 14, padding: "12px 14px",
            display: "flex", alignItems: "flex-start", gap: 10,
          }}>
            <AlertTriangle style={{ width: 14, height: 14, color: C.gold, flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: 11.5, color: C.muted, lineHeight: 1.6 }}>
              This is a wellness plan, not medical advice. Talk with a doctor, nutritionist,
              or healthcare professional before major diet or exercise changes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashCard({ label, value, accent }) {
  if (!value) return null;
  return (
    <div style={{
      background: "#fff", border: `1px solid ${C.border}`, borderRadius: 14,
      padding: "12px 14px",
    }}>
      <p style={{ fontSize: 10, fontWeight: 800, color: accent,
        textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 13, color: C.text, lineHeight: 1.5, fontWeight: 600 }}>{value}</p>
    </div>
  );
}

function SectionLabel({ icon, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, color: C.dim,
      marginTop: 4, marginBottom: -4 }}>
      {icon}
      <p style={{ fontSize: 10.5, fontWeight: 800,
        textTransform: "uppercase", letterSpacing: ".12em" }}>{label}</p>
    </div>
  );
}

function PhaseCard({ title, text }) {
  if (!text) return null;
  return (
    <div style={{
      background: "linear-gradient(135deg, #0F1E3D 0%, #1A2E5C 100%)",
      borderRadius: 14, padding: "14px 16px", color: "#fff",
    }}>
      <p style={{ fontSize: 11, fontWeight: 800, color: "#C8932F",
        textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 6 }}>
        {title}
      </p>
      <p style={{ fontSize: 13, lineHeight: 1.6, color: "rgba(255,255,255,0.86)" }}>
        {text}
      </p>
    </div>
  );
}

function Empty({ text }) {
  return (
    <div style={{
      background: "#fff", border: `1px dashed ${C.border}`, borderRadius: 14,
      padding: "18px 20px", textAlign: "center",
    }}>
      <p style={{ fontSize: 13, color: C.dim, lineHeight: 1.55 }}>{text}</p>
    </div>
  );
}