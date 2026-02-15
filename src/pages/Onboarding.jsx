import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { createPageUrl } from "./utils";

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

      // Check referral code if provided
      let facility_id = null;
      if (merged.referral_code) {
        const codes = await base44.entities.ReferralCode.filter({ code: merged.referral_code });
        if (codes.length > 0) {
          facility_id = codes[0].facility_id;
        }
      }

      // Ensure required fields are present
      const profileData = {
        track: merged.track || "alcohol",
        stage: merged.stage,
        who_to_talk_to: merged.who_to_talk_to,
        goals: merged.goals || [],
        support_needs: merged.support_needs || [],
        challenges: merged.challenges || [],
        comm_mode: merged.comm_mode,
        time_need: merged.time_need,
        gender_preference: merged.gender_preference || "none",
        style: merged.style || "gentle",
        program_preference: merged.program_preference || "no_preference",
        lgbtq_friendly: merged.lgbtq_friendly || "no_preference",
        location_city: merged.location_city,
        location_state: merged.location_state,
        location_zip: merged.location_zip,
        location_lat: merged.location_lat,
        location_lng: merged.location_lng,
        onboarding_complete: true,
        role: "member",
      };

      // Add optional fields if present
      if (merged.default_track) profileData.default_track = merged.default_track;
      if (merged.substances) profileData.substances = merged.substances;
      if (merged.primary_substance) profileData.primary_substance = merged.primary_substance;
      if (facility_id) profileData.facility_id = facility_id;

      await base44.entities.MemberProfile.create(profileData);
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
      {/* Logo Header */}
      {stepIndex === 0 && (
        <div className="flex justify-center pt-8 pb-4">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698cbbdc830161c35d66ad0e/f15d68acb_image.png" 
            alt="Unbound" 
            className="h-24 w-auto"
          />
        </div>
      )}
      
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