import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";
import {
  WP_COLORS as C, NUTRITION_QUESTIONS, EXERCISE_QUESTIONS,
  DURATION_MAP,
} from "@/lib/wellnessConfig";
import { generateWellnessPlan } from "@/lib/wellnessAI";
import WPQuestionStep from "@/components/wellness/WPQuestionStep";
import WPModePicker from "@/components/wellness/WPModePicker";

export default function WellnessPlanBuilder() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const planType = params.get("type") || "nutrition"; // nutrition | exercise | full_90

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  // Build question list based on plan type
  const questions = useMemo(() => {
    if (planType === "nutrition") return NUTRITION_QUESTIONS;
    if (planType === "exercise")  return EXERCISE_QUESTIONS;
    // full_90 → ask both, drop the duration question (force 90-day)
    return [
      ...NUTRITION_QUESTIONS.filter(q => q.key !== "duration"),
      ...EXERCISE_QUESTIONS,
    ];
  }, [planType]);

  const [step, setStep] = useState(0); // 0..questions.length-1, then mode, then generating
  const [answers, setAnswers] = useState({});
  const [mode, setMode] = useState("standard");
  const [generating, setGenerating] = useState(false);

  const totalSteps = questions.length + 1; // + mode picker
  const isModeStep = step === questions.length;
  const currentQ = questions[step];

  const currentValue = isModeStep ? mode : answers[currentQ?.key];
  const isAnswered = isModeStep
    ? !!mode
    : currentQ?.multi
      ? Array.isArray(currentValue) && currentValue.length > 0
      : !!currentValue;

  const handleChange = (val) => {
    if (isModeStep) setMode(val);
    else setAnswers(prev => ({ ...prev, [currentQ.key]: val }));
  };

  const next = async () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
      return;
    }
    // Final step → generate
    await handleGenerate();
  };

  const back = () => {
    if (step === 0) { navigate("/WellnessPlan"); return; }
    setStep(step - 1);
  };

  const handleGenerate = async () => {
    if (!user?.email) return;
    setGenerating(true);

    // Resolve duration
    const durationFromAnswer = DURATION_MAP[answers.duration];
    const duration = planType === "full_90"
      ? "90_day"
      : durationFromAnswer || "7_day";

    const result = await generateWellnessPlan({ planType, duration, mode, answers });

    const startDate = new Date();
    const endDate = new Date();
    const days = duration === "1_day" ? 1
              : duration === "3_day" ? 3
              : duration === "7_day" ? 7
              : duration === "30_day" ? 30 : 90;
    endDate.setDate(endDate.getDate() + days);

    const created = await base44.entities.WellnessPlan.create({
      user_email: user.email,
      plan_title: result.plan_title,
      plan_type: planType,
      duration,
      mode,
      nutrition_goal: answers.nutrition_goal,
      fitness_goal: answers.fitness_goal,
      fitness_level: answers.fitness_level,
      food_access: answers.food_access,
      meals_per_day: answers.meals_per_day,
      foods_to_avoid: answers.foods_to_avoid || [],
      fasting_preference: answers.fasting_preference,
      cooking_setup: answers.cooking_setup,
      equipment_available: answers.equipment_available || [],
      preferred_exercises: answers.preferred_exercises || [],
      days_per_week: answers.days_per_week,
      minutes_per_workout: answers.minutes_per_workout,
      limitations: answers.limitations || [],
      headline_message: result.headline_message,
      discipline_goal: result.discipline_goal,
      hydration_goal: result.hydration_goal,
      weekly_goal: result.weekly_goal,
      meal_plan: result.meal_plan,
      workout_plan: result.workout_plan,
      grocery_list: result.grocery_list,
      low_cost_options: result.low_cost_options,
      pantry_friendly_options: result.pantry_friendly_options,
      alkaline_foods: result.alkaline_foods,
      gut_health_tips: result.gut_health_tips,
      foods_to_reduce: result.foods_to_reduce,
      meal_prep_tips: result.meal_prep_tips,
      phase_1_focus: result.phase_1_focus,
      phase_2_focus: result.phase_2_focus,
      phase_3_focus: result.phase_3_focus,
      start_date: startDate.toISOString().split("T")[0],
      end_date: endDate.toISOString().split("T")[0],
      current_phase: duration === "90_day" ? "phase_1" : "active",
      progress_percentage: 0,
      completed_days: 0,
      status: "active",
    });

    navigate(`/WellnessPlanView?id=${created.id}`);
  };

  if (generating) {
    return (
      <div style={{ background: C.cream, minHeight: "100vh", display: "flex",
        alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ textAlign: "center", maxWidth: 320 }}>
          <Sparkles style={{ width: 32, height: 32, color: C.gold, margin: "0 auto 12px" }} />
          <Loader2 className="animate-spin" style={{ width: 22, height: 22, color: C.navy, margin: "0 auto 16px" }} />
          <p style={{ fontFamily: "'Lora', Georgia, serif", fontSize: 18,
            fontWeight: 700, color: C.text, marginBottom: 6 }}>
            Building your plan…
          </p>
          <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
            Tailoring it to your goals, food access, equipment, and schedule.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: C.cream, minHeight: "100vh", paddingBottom: 130 }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ padding: "40px 20px 16px", background: "#fff",
          borderBottom: `1px solid ${C.border}` }}>
          <button onClick={back} style={{
            background: "transparent", border: "none", padding: 0, cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: 6,
            color: C.muted, fontSize: 13, fontWeight: 600, marginBottom: 12,
          }}>
            <ArrowLeft style={{ width: 15, height: 15 }} /> Back
          </button>

          {/* Progress bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ flex: 1, height: 5, borderRadius: 999, background: C.cream }}>
              <div style={{
                width: `${((step + 1) / totalSteps) * 100}%`, height: "100%",
                background: C.gold, borderRadius: 999, transition: "width .3s",
              }} />
            </div>
            <p style={{ fontSize: 11, color: C.dim, fontWeight: 700, whiteSpace: "nowrap" }}>
              {step + 1} of {totalSteps}
            </p>
          </div>
        </div>

        <div style={{ padding: "24px 16px" }}>
          {isModeStep ? (
            <WPModePicker value={mode} onChange={handleChange} />
          ) : (
            <WPQuestionStep question={currentQ} value={currentValue} onChange={handleChange} />
          )}

          {/* Continue button */}
          <button onClick={next} disabled={!isAnswered}
            style={{
              marginTop: 22, width: "100%", padding: "14px 20px", borderRadius: 999,
              background: isAnswered ? C.navy : C.border,
              color: "#fff", border: "none", fontSize: 15, fontWeight: 700,
              cursor: isAnswered ? "pointer" : "default",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: isAnswered ? "0 4px 14px rgba(15,30,61,0.22)" : "none",
            }}>
            {step === totalSteps - 1 ? "Build my plan" : "Continue"}
            <ArrowRight style={{ width: 15, height: 15 }} />
          </button>
        </div>
      </div>
    </div>
  );
}