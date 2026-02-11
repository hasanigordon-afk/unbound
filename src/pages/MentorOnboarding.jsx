import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { createPageUrl } from "./utils";

import StepRole from "../components/mentor/StepRole";
import StepBasics from "../components/mentor/StepBasics";
import StepTracks from "../components/mentor/StepTracks";
import StepCommModes from "../components/mentor/StepCommModes";
import StepLivedExperience from "../components/mentor/StepLivedExperience";
import StepCredentials from "../components/mentor/StepCredentials";
import StepBoundaries from "../components/mentor/StepBoundaries";

export default function MentorOnboarding() {
  const [stepIndex, setStepIndex] = useState(0);
  const [data, setData] = useState({});
  const [saving, setSaving] = useState(false);

  const getSteps = () => {
    const baseSteps = ["role", "basics", "tracks", "comm_modes"];
    const { role_type } = data;

    if (role_type === "peer_mentor") {
      return [...baseSteps, "lived_experience", "boundaries"];
    }
    if (role_type === "counselor") {
      return [...baseSteps, "credentials", "boundaries"];
    }
    if (role_type === "hybrid") {
      return [...baseSteps, "credentials", "lived_experience", "boundaries"];
    }
    return baseSteps;
  };

  const steps = getSteps();
  const currentStep = steps[stepIndex];
  const totalSteps = steps.length;
  const progress = ((stepIndex + 1) / totalSteps) * 100;

  const handleNext = async (stepData) => {
    const merged = { ...data, ...stepData };
    setData(merged);

    if (stepIndex === steps.length - 1) {
      setSaving(true);
      await base44.entities.MentorProfile.create({
        ...merged,
        onboarding_complete: true,
      });
      window.location.href = createPageUrl("Home");
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
      case "role": return <StepRole {...props} />;
      case "basics": return <StepBasics {...props} />;
      case "tracks": return <StepTracks {...props} />;
      case "comm_modes": return <StepCommModes {...props} />;
      case "lived_experience": return <StepLivedExperience {...props} />;
      case "credentials": return <StepCredentials {...props} />;
      case "boundaries": return <StepBoundaries {...props} />;
      default: return null;
    }
  };

  if (saving) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Setting up your mentor profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
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