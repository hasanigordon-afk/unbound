import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Brain, Users, ShieldCheck } from "lucide-react";
import AftercareOnboardingForm from "@/components/aftercareTeam/AftercareOnboardingForm";
import AftercarePlanDashboard from "@/components/aftercareTeam/AftercarePlanDashboard";

const emptyForm = {
  top_goals: ["", "", "", "", ""],
  focus_areas: [],
  biggest_challenge: "",
  support_this_week: "",
  support_30_days: "",
  support_60_days: "",
  support_90_days: "",
  requirements: "",
  city_state: "",
};

const responseSchema = {
  type: "object",
  properties: {
    today_focus: { type: "array", items: { type: "string" } },
    recovery: { type: "object", properties: { summary: { type: "string" }, steps: { type: "array", items: { type: "string" } } } },
    reentry: { type: "object", properties: { summary: { type: "string" }, steps: { type: "array", items: { type: "string" } } } },
    career: { type: "object", properties: { summary: { type: "string" }, steps: { type: "array", items: { type: "string" } } } },
    wellness: { type: "object", properties: { summary: { type: "string" }, steps: { type: "array", items: { type: "string" } } } },
    resources: { type: "object", properties: { summary: { type: "string" }, steps: { type: "array", items: { type: "string" } } } },
    accountability: { type: "object", properties: { summary: { type: "string" }, steps: { type: "array", items: { type: "string" } }, daily: { type: "array", items: { type: "string" } }, weekly: { type: "array", items: { type: "string" } }, thirty_day: { type: "array", items: { type: "string" } }, sixty_day: { type: "array", items: { type: "string" } }, ninety_day: { type: "array", items: { type: "string" } } } },
    goals: { type: "object", properties: { summary: { type: "string" }, steps: { type: "array", items: { type: "string" } } } },
  },
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
        setForm({
          top_goals: [...(records[0].top_goals || []), "", "", "", "", ""].slice(0, 5),
          focus_areas: records[0].focus_areas || [],
          biggest_challenge: records[0].biggest_challenge || "",
          support_this_week: records[0].support_this_week || "",
          support_30_days: records[0].support_30_days || "",
          support_60_days: records[0].support_60_days || "",
          support_90_days: records[0].support_90_days || "",
          requirements: records[0].requirements || "",
          city_state: records[0].city_state || "",
        });
      }
    };
    load();
  }, []);

  const generatePlan = async () => {
    setLoading(true);
    const cleanedGoals = form.top_goals.filter(Boolean);
    const plan = await base44.integrations.Core.InvokeLLM({
      prompt: `Create a supportive, motivating, non-judgmental, non-medical personalized aftercare, recovery, and reentry plan. Make it practical and checklist-friendly. Include local resource suggestions for ${form.city_state}, using categories like shelters, food pantries, support groups, clinics, transportation, gyms/YMCAs, churches, and staffing agencies. Do not provide medical, legal, or emergency advice. User answers: ${JSON.stringify({ ...form, top_goals: cleanedGoals })}`,
      response_json_schema: responseSchema,
    });
    const payload = { ...form, top_goals: cleanedGoals, user_email: user.email, plan, completed_actions: planRecord?.completed_actions || [], completion_streak: planRecord?.completion_streak || 0, status: "active" };
    const saved = planRecord ? await base44.entities.AIAftercarePlan.update(planRecord.id, payload) : await base44.entities.AIAftercarePlan.create(payload);
    setPlanRecord(saved);
    setLoading(false);
  };

  const toggleAction = async (id) => {
    const completed = planRecord.completed_actions || [];
    const nextCompleted = completed.includes(id) ? completed.filter(item => item !== id) : [...completed, id];
    const today = new Date().toISOString().slice(0, 10);
    const next = { ...planRecord, completed_actions: nextCompleted, completion_streak: nextCompleted.length > completed.length ? (planRecord.completion_streak || 0) + 1 : planRecord.completion_streak || 0, last_completed_date: today };
    setPlanRecord(next);
    await base44.entities.AIAftercarePlan.update(planRecord.id, next);
  };

  return (
    <main className="min-h-screen px-4 py-6 md:px-8 md:py-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <section className="card-glow p-6 md:p-8 overflow-hidden relative">
          <div className="relative z-10 max-w-4xl">
            <div className="inline-flex items-center gap-2 pill pill-teal mb-5"><Brain className="w-4 h-4" /> AI Aftercare Team</div>
            <h1 className="text-4xl md:text-6xl font-serif font-semibold text-[var(--text)] leading-tight">A full support team to help organize your comeback.</h1>
            <p className="text-base md:text-lg text-[var(--text-muted)] mt-4 max-w-3xl">Build a personalized plan for recovery, reentry, work, wellness, resources, accountability, and your top five life goals.</p>
            <div className="flex flex-wrap gap-3 mt-6 text-sm text-[var(--text-muted)]">
              <span className="pill pill-ghost"><Users className="w-3.5 h-3.5 mr-1" /> 7 AI specialists</span>
              <span className="pill pill-ghost"><ShieldCheck className="w-3.5 h-3.5 mr-1" /> Supportive, non-medical guidance</span>
            </div>
          </div>
        </section>

        <AftercareOnboardingForm form={form} setForm={setForm} onGenerate={generatePlan} loading={loading} hasPlan={!!planRecord?.plan} />
        <AftercarePlanDashboard plan={planRecord?.plan} completedActions={planRecord?.completed_actions || []} onToggleAction={toggleAction} streak={planRecord?.completion_streak || 0} />

        <section className="card-soft p-5 text-sm text-[var(--text-muted)] leading-relaxed">
          <strong className="text-[var(--text)]">Important:</strong> ReZilient and AI Aftercare Team do not replace professional treatment, legal advice, medical advice, emergency services, probation/parole instructions, court orders, or licensed care. If you are in immediate danger or crisis, contact emergency services or a local crisis line right away.
        </section>
      </div>
    </main>
  );
}