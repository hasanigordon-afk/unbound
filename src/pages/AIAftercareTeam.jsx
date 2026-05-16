import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import CommandCenterHero from "@/components/commandCenter/CommandCenterHero";
import DiscoveryEngineForm from "@/components/commandCenter/DiscoveryEngineForm";
import LifeBlueprintDashboard from "@/components/commandCenter/LifeBlueprintDashboard";
import CommandCenterHomeDashboard from "@/components/commandCenter/CommandCenterHomeDashboard";
import AftercarePlanDashboard from "@/components/aftercareTeam/AftercarePlanDashboard";
import ResourceIntelPanel from "@/components/commandCenter/ResourceIntelPanel";
import VoiceAIMentor from "@/components/commandCenter/VoiceAIMentor";

const emptyForm = {
  top_goals: ["", "", "", "", ""], city_state: "", current_strengths: "",
  life_to_create: "", motivation: "", refuse_to_lose: "", one_year: "", five_year: "",
  recovery_stage: "", housing_status: "", employment_status: "", transportation: "", education: "", family_support: "", legal_obligations: "", stress_level: "", biggest_obstacle: "",
  sleep_quality: "", exercise_habits: "", anxiety_level: "", depression_level: "", daily_energy: "", nutrition_habits: "",
  sponsor: "", mentor: "", counselor: "", family: "", friends: "", veterans_support: "", faith_community: "",
};

const specialist = { type: "object", properties: { summary: { type: "string" }, steps: { type: "array", items: { type: "string" } } } };
const responseSchema = {
  type: "object",
  properties: {
    today_focus: { type: "array", items: { type: "string" } },
    blueprint: { type: "object", properties: { today: { type: "string" }, week: { type: "string" }, day30: { type: "string" }, day60: { type: "string" }, day90: { type: "string" }, year1: { type: "string" }, year5: { type: "string" } } },
    recovery: specialist, reentry: specialist, career: specialist, wellness: specialist, goals: specialist,
    resources: { type: "object", properties: { summary: { type: "string" }, steps: { type: "array", items: { type: "string" } }, local: { type: "array", items: { type: "object", properties: { name: { type: "string" }, type: { type: "string" }, distance: { type: "string" }, next_step: { type: "string" } } } } } },
    accountability: { type: "object", properties: { summary: { type: "string" }, steps: { type: "array", items: { type: "string" } }, daily: { type: "array", items: { type: "string" } }, weekly: { type: "array", items: { type: "string" } }, thirty_day: { type: "array", items: { type: "string" } }, sixty_day: { type: "array", items: { type: "string" } }, ninety_day: { type: "array", items: { type: "string" } } } },
    ai_suggestions: { type: "array", items: { type: "string" } }, next_milestone: { type: "string" }
  }
};

export default function AIAftercareTeam() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [planRecord, setPlanRecord] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const me = await base44.auth.me();
      setUser(me);
      const records = await base44.entities.AIAftercarePlan.filter({ user_email: me.email, status: "active" }, "-updated_date", 1);
      if (records[0]) {
        setPlanRecord(records[0]);
        setForm({ ...emptyForm, ...(records[0].discovery_answers || {}), top_goals: [...(records[0].top_goals || []), "", "", "", "", ""].slice(0, 5), city_state: records[0].city_state || "" });
      }
    };
    load();
  }, []);

  const generatePlan = async () => {
    setLoading(true);
    const cleanedGoals = form.top_goals.filter(Boolean);
    const completed = planRecord?.completed_actions || [];
    const plan = await base44.integrations.Core.InvokeLLM({
      prompt: `Create the ReZilient Command Center: AI Aftercare Intelligence System Life Blueprint. Make it deeply personalized, practical, supportive, non-clinical, non-medical, and non-judgmental. Include Today, This Week, 30/60/90 day roadmap, 1 year vision, 5 year vision. Activate Recovery Strategist AI, Reentry AI, Career AI, Resource AI, Wellness AI, Goals AI, and Accountability AI. Resource AI should suggest local categories near ${form.city_state}, sorted by likely usefulness/distance language, including food pantries, shelters, free meals, community programs, YMCA, churches, gyms, recovery centers, staffing agencies, transportation, free services. Adapt to completed actions/patterns: ${JSON.stringify(completed)}. User discovery: ${JSON.stringify({ ...form, top_goals: cleanedGoals })}`,
      response_json_schema: responseSchema,
    });
    const payload = { user_email: user.email, city_state: form.city_state, top_goals: cleanedGoals, discovery_answers: form, plan, completed_actions: completed, completion_streak: planRecord?.completion_streak || 0, activity_patterns: planRecord?.activity_patterns || [], status: "active" };
    const saved = planRecord ? await base44.entities.AIAftercarePlan.update(planRecord.id, payload) : await base44.entities.AIAftercarePlan.create(payload);
    setPlanRecord(saved);
    setLoading(false);
  };

  const toggleAction = async (id) => {
    const completed = planRecord.completed_actions || [];
    const nextCompleted = completed.includes(id) ? completed.filter(item => item !== id) : [...completed, id];
    const next = { ...planRecord, completed_actions: nextCompleted, completion_streak: nextCompleted.length > completed.length ? (planRecord.completion_streak || 0) + 1 : planRecord.completion_streak || 0, last_completed_date: new Date().toISOString().slice(0, 10), activity_patterns: [...(planRecord.activity_patterns || []), `Action ${nextCompleted.length > completed.length ? "completed" : "unchecked"}: ${id}`].slice(-25) };
    setPlanRecord(next);
    await base44.entities.AIAftercarePlan.update(planRecord.id, next);
  };

  const scrollToDiscovery = () => document.getElementById("discovery-engine")?.scrollIntoView({ behavior: "smooth" });
  const plan = planRecord?.plan;

  return (
    <main className="min-h-screen px-4 py-6 md:px-8 md:py-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <CommandCenterHero onStart={scrollToDiscovery} />
        <DiscoveryEngineForm form={form} setForm={setForm} onGenerate={generatePlan} loading={loading} hasPlan={!!plan} />
        {plan && <CommandCenterHomeDashboard suggestions={plan.ai_suggestions} nextMilestone={plan.next_milestone} />}
        {plan && <LifeBlueprintDashboard blueprint={plan.blueprint} goals={form.top_goals} completedCount={(planRecord.completed_actions || []).length} streak={planRecord.completion_streak || 0} />}
        <AftercarePlanDashboard plan={plan} completedActions={planRecord?.completed_actions || []} onToggleAction={toggleAction} streak={planRecord?.completion_streak || 0} />
        {plan && <ResourceIntelPanel resources={plan.resources?.local || []} />}
        {plan && <VoiceAIMentor context={{ plan, form }} />}
        <section className="card-soft p-5 text-sm text-[var(--text-muted)] leading-relaxed"><strong className="text-[var(--text)]">Important:</strong> This system supports planning and momentum. It does not replace professional treatment, legal advice, medical advice, emergency services, probation/parole instructions, court orders, or licensed care.</section>
      </div>
    </main>
  );
}