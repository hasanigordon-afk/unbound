import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";

import StepSafety from "../components/onboarding/StepSafety";
import StepGoals from "../components/onboarding/StepGoals";
import StepTrack from "../components/onboarding/StepTrack";
import StepSubstances from "../components/onboarding/StepSubstances";
import StepStage from "../components/onboarding/StepStage";
import StepSupportNeeds from "../components/onboarding/StepSupportNeeds";
import StepChallenges from "../components/onboarding/StepChallenges";
import StepWhoToTalk from "../components/onboarding/StepWhoToTalk";
import StepCommunication from "../components/onboarding/StepCommunication";
import StepPreferences from "../components/onboarding/StepPreferences";
import StepLocation from "../components/onboarding/StepLocation";

const ALL_STEPS = [
  "safety", "goals", "track", "substances", "stage",
  "support_needs", "challenges", "who_to_talk", "communication",
  "preferences", "location"
];

export default function Onboarding() {
  const [stepIndex, setStepIndex] = useState(0);
  const [data, setData] = useState({});
  const [saving, setSaving] = useState(false);

  // Determine which steps to show based on data so far
  const getSteps = () => {
    const steps = [...ALL_STEPS];
    // Remove substances step if track is alcohol only
    if (data.track === "alcohol") {
      return steps.filter((s) => s !== "substances");
    }
    return steps;
  };

  const steps = getSteps();
  const currentStep = steps[stepIndex];
  const totalSteps = steps.length;
  const progress = ((stepIndex + 1) / totalSteps) * 100;

  const handleNext = async (stepData) => {
    const merged = { ...data, ...stepData };
    setData(merged);

    if (stepIndex === steps.length - 1) {
      // Last step — save to DB
      setSaving(true);
      await base44.entities.MemberProfile.create({
        ...merged,
        onboarding_complete: true,
        role: "member",
      });
      window.location.href = "/Home";
      return;
    }

    setStepIndex(stepIndex + 1);
  };

  const handleBack = () => {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  };

  const renderStep = () => {
    const props = { data, onNext: handleNext };
    switch (currentStep) {
      case "safety": return <StepSafety {...props} />;
      case "goals": return <StepGoals {...props} />;
      case "track": return <StepTrack {...props} />;
      case "substances": return <StepSubstances {...props} />;
      case "stage": return <StepStage {...props} />;
      case "support_needs": return <StepSupportNeeds {...props} />;
      case "challenges": return <StepChallenges {...props} />;
      case "who_to_talk": return <StepWhoToTalk {...props} />;
      case "communication": return <StepCommunication {...props} />;
      case "preferences": return <StepPreferences {...props} />;
      case "location": return <StepLocation {...props} />;
      default: return null;
    }
  };

  if (saving) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Setting up your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-50/80 backdrop-blur-xl border-b border-slate-100 px-4 pt-4 pb-3">
        <div className="flex items-center justify-between max-w-lg mx-auto mb-3">
          {stepIndex > 0 ? (
            <button onClick={handleBack} className="p-1 -ml-1 text-slate-400 hover:text-slate-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-5" />
          )}
          <span className="text-xs font-medium text-slate-400 tracking-wide">
            {stepIndex + 1} / {totalSteps}
          </span>
          <div className="w-5" />
        </div>
        <div className="max-w-lg mx-auto h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-teal-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center pt-8 pb-12 px-4">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            <div key={currentStep}>
              {renderStep()}
            </div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}