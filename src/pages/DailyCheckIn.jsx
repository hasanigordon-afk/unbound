import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "./utils";
import { ChevronRight, ChevronLeft, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const MOOD_OPTIONS = [
  { value: 1, emoji: "😢", label: "Very Bad" },
  { value: 2, emoji: "😕", label: "Bad" },
  { value: 3, emoji: "😐", label: "Okay" },
  { value: 4, emoji: "🙂", label: "Good" },
  { value: 5, emoji: "😊", label: "Great" },
];

const MEETING_TYPES = ["AA", "NA", "Other", "Virtual", "In-Person"];

const CRAVING_OPTIONS = [
  { value: 1, label: "None" },
  { value: 2, label: "Mild" },
  { value: 3, label: "Moderate" },
  { value: 4, label: "Strong" },
  { value: 5, label: "Intense" },
];

export default function DailyCheckIn() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    mood_rating: null,
    attended_meeting: null,
    meeting_type: null,
    connected_with_sponsor: null,
    craving_intensity: null,
    notes: "",
  });

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const submitCheckInMutation = useMutation({
    mutationFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const checkInData = {
        participant_email: user.email,
        check_in_date: today,
        mood_rating: formData.mood_rating,
        attended_meeting: formData.attended_meeting,
        meeting_type: formData.attended_meeting ? formData.meeting_type : null,
        connected_with_sponsor: formData.connected_with_sponsor,
        craving_intensity: formData.craving_intensity,
        notes: formData.notes || null,
      };
      await base44.entities.DailyCheckIn.create(checkInData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["daily-checkins"]);
      setStep(6); // Success screen
    },
  });

  const canProceed = () => {
    if (step === 1) return formData.mood_rating !== null;
    if (step === 2) return formData.attended_meeting !== null;
    if (step === 3) return !formData.attended_meeting || formData.meeting_type !== null;
    if (step === 4) return formData.connected_with_sponsor !== null;
    if (step === 5) return true; // Optional step
    return false;
  };

  const handleNext = () => {
    if (step === 2 && !formData.attended_meeting) {
      setStep(4); // Skip meeting type if didn't attend
    } else if (step === 5) {
      submitCheckInMutation.mutate();
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step === 4 && !formData.attended_meeting) {
      setStep(2); // Skip back over meeting type
    } else {
      setStep(step - 1);
    }
  };

  if (step === 6) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#1a1f3a' }}>
        <div className="max-w-md w-full px-6 text-center">
          <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.2)' }}>
            <Check className="w-10 h-10" style={{ color: '#22c55e' }} />
          </div>
          <h2 className="text-2xl font-bold mb-3" style={{ color: '#ffffff' }}>Check-In Complete!</h2>
          <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Great job staying engaged. Keep up the momentum!
          </p>
          <Button
            onClick={() => navigate(createPageUrl("ParticipantDashboard"))}
            className="w-full"
            style={{ background: '#fbbf24', color: '#0f1628' }}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#1a1f3a' }}>
      {/* Header */}
      <div className="px-6 pt-8 pb-6" style={{ background: '#0f1628', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <h1 className="text-xl font-bold" style={{ color: '#ffffff' }}>Daily Check-In</h1>
      </div>

      {/* Progress */}
      <div className="px-6 py-4">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full transition-all"
              style={{
                background: i <= step ? '#fbbf24' : 'rgba(255,255,255,0.2)'
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="max-w-md w-full">
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold mb-3" style={{ color: '#ffffff' }}>How are you feeling today?</h2>
              <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.6)' }}>Rate your mood</p>
              <div className="grid grid-cols-5 gap-3">
                {MOOD_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setFormData({ ...formData, mood_rating: option.value })}
                    className="p-4 rounded-xl flex flex-col items-center gap-2 transition-all"
                    style={{
                      background: formData.mood_rating === option.value ? 'rgba(251,191,36,0.2)' : '#0f1628',
                      border: formData.mood_rating === option.value ? '2px solid #fbbf24' : '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    <span className="text-3xl">{option.emoji}</span>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold mb-3" style={{ color: '#ffffff' }}>Did you attend a meeting today?</h2>
              <div className="space-y-3">
                <button
                  onClick={() => setFormData({ ...formData, attended_meeting: true })}
                  className="w-full p-5 rounded-xl text-left transition-all"
                  style={{
                    background: formData.attended_meeting === true ? 'rgba(251,191,36,0.2)' : '#0f1628',
                    border: formData.attended_meeting === true ? '2px solid #fbbf24' : '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <p className="font-semibold text-lg" style={{ color: '#ffffff' }}>Yes</p>
                  <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>I attended a meeting</p>
                </button>
                <button
                  onClick={() => setFormData({ ...formData, attended_meeting: false, meeting_type: null })}
                  className="w-full p-5 rounded-xl text-left transition-all"
                  style={{
                    background: formData.attended_meeting === false ? 'rgba(251,191,36,0.2)' : '#0f1628',
                    border: formData.attended_meeting === false ? '2px solid #fbbf24' : '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <p className="font-semibold text-lg" style={{ color: '#ffffff' }}>No</p>
                  <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>No meeting today</p>
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold mb-3" style={{ color: '#ffffff' }}>What type of meeting?</h2>
              <div className="grid grid-cols-2 gap-3">
                {MEETING_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => setFormData({ ...formData, meeting_type: type })}
                    className="p-4 rounded-xl text-center transition-all"
                    style={{
                      background: formData.meeting_type === type ? 'rgba(251,191,36,0.2)' : '#0f1628',
                      border: formData.meeting_type === type ? '2px solid #fbbf24' : '1px solid rgba(255,255,255,0.1)',
                      color: '#ffffff'
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-2xl font-bold mb-3" style={{ color: '#ffffff' }}>Did you connect with your sponsor?</h2>
              <div className="space-y-3">
                <button
                  onClick={() => setFormData({ ...formData, connected_with_sponsor: true })}
                  className="w-full p-5 rounded-xl text-left transition-all"
                  style={{
                    background: formData.connected_with_sponsor === true ? 'rgba(251,191,36,0.2)' : '#0f1628',
                    border: formData.connected_with_sponsor === true ? '2px solid #fbbf24' : '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <p className="font-semibold text-lg" style={{ color: '#ffffff' }}>Yes</p>
                  <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Connected today</p>
                </button>
                <button
                  onClick={() => setFormData({ ...formData, connected_with_sponsor: false })}
                  className="w-full p-5 rounded-xl text-left transition-all"
                  style={{
                    background: formData.connected_with_sponsor === false ? 'rgba(251,191,36,0.2)' : '#0f1628',
                    border: formData.connected_with_sponsor === false ? '2px solid #fbbf24' : '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <p className="font-semibold text-lg" style={{ color: '#ffffff' }}>No</p>
                  <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Did not connect</p>
                </button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <h2 className="text-2xl font-bold mb-3" style={{ color: '#ffffff' }}>Any cravings today?</h2>
              <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.6)' }}>Optional</p>
              <div className="space-y-3 mb-6">
                {CRAVING_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setFormData({ ...formData, craving_intensity: option.value })}
                    className="w-full p-4 rounded-xl text-left transition-all"
                    style={{
                      background: formData.craving_intensity === option.value ? 'rgba(251,191,36,0.2)' : '#0f1628',
                      border: formData.craving_intensity === option.value ? '2px solid #fbbf24' : '1px solid rgba(255,255,255,0.1)',
                      color: '#ffffff'
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  Optional Notes
                </label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="How are you feeling? Any thoughts to share..."
                  rows={4}
                  className="w-full"
                  style={{ background: '#0f1628', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="px-6 py-6 flex gap-3" style={{ background: '#0f1628', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        {step > 1 && (
          <Button
            onClick={handleBack}
            variant="outline"
            style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#ffffff' }}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        )}
        <Button
          onClick={handleNext}
          disabled={!canProceed() || submitCheckInMutation.isPending}
          className="flex-1"
          style={{ background: '#fbbf24', color: '#0f1628' }}
        >
          {submitCheckInMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : step === 5 ? (
            "Submit"
          ) : (
            <>
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}