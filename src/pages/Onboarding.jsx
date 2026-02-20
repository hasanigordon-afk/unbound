import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "./utils";
import { ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const TRACKS = [
  { value: "alcohol", label: "Alcohol", desc: "Support for alcohol recovery" },
  { value: "substances", label: "Substances", desc: "Support for substance recovery" },
  { value: "both", label: "Both", desc: "Support for both" },
];

const STAGES = [
  { value: "using_currently", label: "Currently using", desc: "I'm actively using right now" },
  { value: "trying_to_stop", label: "Trying to stop", desc: "I want to quit but haven't yet" },
  { value: "detox_last_14_days", label: "Detox (0-14 days)", desc: "Recently stopped" },
  { value: "early_recovery_15_90", label: "Early recovery (15-90 days)", desc: "Building new habits" },
  { value: "recovery_3_12_months", label: "Recovery (3-12 months)", desc: "Making progress" },
  { value: "long_term_1_year_plus", label: "Long-term (1+ year)", desc: "Sustained recovery" },
  { value: "relapsed_recently", label: "Relapsed recently", desc: "Getting back on track" },
];

const GOALS = [
  "Stay sober today",
  "Find support network",
  "Rebuild relationships",
  "Get a job",
  "Find housing",
  "Improve mental health",
  "Build daily routine",
  "Manage cravings",
];

const CHALLENGES = [
  "Cravings",
  "Loneliness",
  "Triggers",
  "Depression/Anxiety",
  "Financial stress",
  "Housing instability",
  "Legal issues",
  "Family problems",
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    track: "",
    stage: "",
    goals: [],
    challenges: [],
    location_city: "",
    location_state: "",
    location_zip: "",
  });

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const createProfileMutation = useMutation({
    mutationFn: async () => {
      const profile = {
        ...formData,
        who_to_talk_to: "both_best_match",
        onboarding_complete: true,
      };
      await base44.entities.MemberProfile.create(profile);
    },
    onSuccess: () => {
      navigate(createPageUrl("Home"));
    },
  });

  const selectOption = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const toggleMultiSelect = (field, value) => {
    const current = formData[field];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    setFormData({ ...formData, [field]: updated });
  };

  const canProceed = () => {
    if (step === 1) return formData.track;
    if (step === 2) return formData.stage;
    if (step === 3) return formData.goals.length > 0;
    if (step === 4) return formData.challenges.length > 0 && formData.challenges.length <= 2;
    if (step === 5) return formData.location_city && formData.location_state;
    return false;
  };

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      createProfileMutation.mutate();
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0B0F1F' }}>
      <div className="px-5 pt-8 pb-6">
        <img 
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698cbbdc830161c35d66ad0e/f15d68acb_image.png" 
          alt="Unbound" 
          className="h-10 w-auto mx-auto"
        />
      </div>

      <div className="flex-1 flex items-center justify-center px-5 py-8">
        <div className="max-w-lg w-full">
          {/* Progress indicator */}
          <div className="flex gap-2 mb-8 justify-center">
            {[1, 2, 3, 4, 5].map(i => (
              <div
                key={i}
                className="h-1 rounded-full transition-all"
                style={{
                  width: i === step ? '32px' : '8px',
                  background: i <= step ? '#2FF3E0' : 'rgba(255,255,255,0.2)'
                }}
              />
            ))}
          </div>

          <div className="glass-card p-6 mb-6">
            {step === 1 && (
              <div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: '#FFFFFF' }}>
                  What brings you here?
                </h2>
                <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  Choose the area where you'd like support
                </p>
                <div className="space-y-3">
                  {TRACKS.map(track => (
                    <button
                      key={track.value}
                      onClick={() => selectOption('track', track.value)}
                      className="w-full p-4 rounded-xl text-left transition-all"
                      style={{
                        background: formData.track === track.value ? 'rgba(47,243,224,0.2)' : 'rgba(255,255,255,0.05)',
                        border: formData.track === track.value ? '2px solid #2FF3E0' : '2px solid transparent',
                      }}
                    >
                      <div className="font-semibold mb-1" style={{ color: '#FFFFFF' }}>{track.label}</div>
                      <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{track.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: '#FFFFFF' }}>
                  Where are you in your journey?
                </h2>
                <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  This helps us provide the right support
                </p>
                <div className="space-y-3">
                  {STAGES.map(stage => (
                    <button
                      key={stage.value}
                      onClick={() => selectOption('stage', stage.value)}
                      className="w-full p-4 rounded-xl text-left transition-all"
                      style={{
                        background: formData.stage === stage.value ? 'rgba(47,243,224,0.2)' : 'rgba(255,255,255,0.05)',
                        border: formData.stage === stage.value ? '2px solid #2FF3E0' : '2px solid transparent',
                      }}
                    >
                      <div className="font-semibold mb-1" style={{ color: '#FFFFFF' }}>{stage.label}</div>
                      <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{stage.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: '#FFFFFF' }}>
                  What are your goals?
                </h2>
                <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  Select all that apply
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {GOALS.map(goal => (
                    <button
                      key={goal}
                      onClick={() => toggleMultiSelect('goals', goal)}
                      className="p-3 rounded-xl text-sm font-medium transition-all"
                      style={{
                        background: formData.goals.includes(goal) ? 'rgba(47,243,224,0.2)' : 'rgba(255,255,255,0.05)',
                        border: formData.goals.includes(goal) ? '2px solid #2FF3E0' : '2px solid transparent',
                        color: '#FFFFFF'
                      }}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: '#FFFFFF' }}>
                  What challenges are you facing?
                </h2>
                <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  Select up to 2 biggest challenges
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {CHALLENGES.map(challenge => (
                    <button
                      key={challenge}
                      onClick={() => toggleMultiSelect('challenges', challenge)}
                      disabled={!formData.challenges.includes(challenge) && formData.challenges.length >= 2}
                      className="p-3 rounded-xl text-sm font-medium transition-all disabled:opacity-40"
                      style={{
                        background: formData.challenges.includes(challenge) ? 'rgba(47,243,224,0.2)' : 'rgba(255,255,255,0.05)',
                        border: formData.challenges.includes(challenge) ? '2px solid #2FF3E0' : '2px solid transparent',
                        color: '#FFFFFF'
                      }}
                    >
                      {challenge}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 5 && (
              <div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: '#FFFFFF' }}>
                  Where are you located?
                </h2>
                <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  This helps us find local resources
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block" style={{ color: 'rgba(255,255,255,0.75)' }}>
                      City
                    </label>
                    <Input
                      value={formData.location_city}
                      onChange={(e) => setFormData({ ...formData, location_city: e.target.value })}
                      placeholder="Enter your city"
                      className="bg-transparent border-white/20 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block" style={{ color: 'rgba(255,255,255,0.75)' }}>
                        State
                      </label>
                      <Input
                        value={formData.location_state}
                        onChange={(e) => setFormData({ ...formData, location_state: e.target.value })}
                        placeholder="NJ"
                        className="bg-transparent border-white/20 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block" style={{ color: 'rgba(255,255,255,0.75)' }}>
                        ZIP (optional)
                      </label>
                      <Input
                        value={formData.location_zip}
                        onChange={(e) => setFormData({ ...formData, location_zip: e.target.value })}
                        placeholder="07001"
                        className="bg-transparent border-white/20 text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            {step > 1 && (
              <Button
                onClick={() => setStep(step - 1)}
                variant="outline"
                className="flex-1"
                style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#FFFFFF' }}
              >
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={!canProceed() || createProfileMutation.isPending}
              className="flex-1"
              style={{ background: '#2FF3E0', color: '#0B0F1F' }}
            >
              {createProfileMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : step === 5 ? (
                "Get Started"
              ) : (
                <>
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}