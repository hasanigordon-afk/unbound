import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "./utils";
import { X, Phone, MessageCircle, Users, Building2, LifeBuoy, ChevronLeft, VolumeX, ExternalLink, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const REASONS = [
  { id: "about_to_use", label: "I'm about to use", color: "#E85D4C", emoji: "🚨" },
  { id: "already_used", label: "I already used", color: "#E85D4C", emoji: "⚠️" },
  { id: "anxious_panicking", label: "I'm anxious / panicking", color: "#FF9800", emoji: "😰" },
  { id: "need_meeting", label: "I need a meeting now", color: "#4A90E2", emoji: "🤝" },
  { id: "need_food_shelter", label: "I need food / shelter tonight", color: "#9C6FE4", emoji: "🏠" },
  { id: "need_to_talk", label: "I need to talk to someone", color: "#22c55e", emoji: "💬" },
  { id: "other", label: "Other", color: "#6B7280", emoji: "•••" },
];

const SILENT_MESSAGES = [
  "I can't talk—please stay with me.",
  "I'm in danger of using.",
  "I already used and I'm scared.",
  "Please help me find a safe place tonight.",
  "Please help me get to a meeting.",
  "Call me when you can.",
];

export default function Lifeline() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedReason, setSelectedReason] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [silentMode, setSilentMode] = useState(false);
  const [sentMessage, setSentMessage] = useState(null);

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: supportContacts = [] } = useQuery({
    queryKey: ["support-contacts"],
    queryFn: () => base44.entities.SupportContact.filter({ created_by: user.email }),
    enabled: !!user,
  });

  const { data: participantProfile } = useQuery({
    queryKey: ["participant-profile-ll"],
    queryFn: async () => {
      const p = await base44.entities.ParticipantProfile.filter({ participant_email: user.email });
      return p[0];
    },
    enabled: !!user,
  });

  const { data: facility } = useQuery({
    queryKey: ["ll-facility", participantProfile?.facility_id],
    queryFn: async () => {
      const f = await base44.entities.Facility.filter({ id: participantProfile.facility_id });
      return f[0];
    },
    enabled: !!participantProfile?.facility_id,
  });

  const logEvent = useMutation({
    mutationFn: (data) => base44.entities.LifelineEvent.create({
      reason: selectedReason,
      route: selectedRoute || data.route,
      channel: data.channel,
      silent_mode_used: data.silentMode || false,
      silent_message: data.silentMessage || null,
      facility_id: participantProfile?.facility_id || null,
      participant_email: user?.email,
    }),
  });

  const handleReasonSelect = (id) => {
    setSelectedReason(id);
    setStep(2);
  };

  const handleRouteSelect = (routeId) => {
    setSelectedRoute(routeId);
    setStep(3);
  };

  const handleAction = (channel) => {
    logEvent.mutate({ channel });
  };

  const handleSilentMessage = (msg) => {
    setSentMessage(msg);
    logEvent.mutate({ channel: "silent_mode", silentMode: true, silentMessage: msg });
    toast.success("Message sent");
  };

  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
      if (step === 3) setSelectedRoute(null);
      if (step === 2) setSelectedReason(null);
    } else {
      navigate(-1);
    }
  };

  const routes = [
    { id: "support_team", label: "My Support Team", subtitle: "Your saved personal contacts", icon: Users, show: true },
    { id: "peer_support", label: "Peer Support", subtitle: "Community live help", icon: MessageCircle, show: true },
    { id: "facility", label: "Facility Contact", subtitle: facility?.facility_name || "Your enrolled program", icon: Building2, show: !!participantProfile?.facility_id },
    { id: "crisis", label: "Crisis Help", subtitle: "988 Hotline · 24/7 · Always available", icon: LifeBuoy, show: true },
  ].filter(r => r.show);

  const reasonObj = REASONS.find(r => r.id === selectedReason);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0A0A0A', color: '#FFFFFF' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-8 pb-4">
        <button onClick={goBack} className="flex items-center gap-1 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
          <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
          {step === 1 ? "Close" : "Back"}
        </button>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: step >= 1 ? '#E85D4C' : 'rgba(255,255,255,0.2)' }} />
          <div className="w-2 h-2 rounded-full" style={{ background: step >= 2 ? '#E85D4C' : 'rgba(255,255,255,0.2)' }} />
          <div className="w-2 h-2 rounded-full" style={{ background: step >= 3 ? '#E85D4C' : 'rgba(255,255,255,0.2)' }} />
        </div>
        <button onClick={() => navigate(-1)}>
          <X className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.4)' }} strokeWidth={1.5} />
        </button>
      </div>

      {/* Lifeline icon */}
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(232,93,76,0.2)', border: '2px solid #E85D4C' }}>
          <Phone className="w-7 h-7" style={{ color: '#E85D4C' }} strokeWidth={1.5} />
        </div>
      </div>

      <div className="flex-1 px-5 pb-24 overflow-y-auto">
        {/* STEP 1: Reason */}
        {step === 1 && (
          <div>
            <h1 className="text-2xl font-semibold text-center mb-2">What's happening right now?</h1>
            <p className="text-sm text-center mb-8" style={{ color: 'rgba(255,255,255,0.5)' }}>Tap one to continue</p>
            <div className="space-y-3">
              {REASONS.map(r => (
                <button
                  key={r.id}
                  onClick={() => handleReasonSelect(r.id)}
                  className="w-full p-4 rounded-2xl flex items-center gap-4 text-left transition-all"
                  style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid rgba(255,255,255,0.1)` }}
                >
                  <span className="text-2xl">{r.emoji}</span>
                  <span className="font-medium text-base">{r.label}</span>
                  <ChevronLeft className="w-4 h-4 ml-auto rotate-180" style={{ color: 'rgba(255,255,255,0.3)' }} strokeWidth={1.5} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Route */}
        {step === 2 && (
          <div>
            {reasonObj && (
              <div className="mb-6 p-3 rounded-xl text-center text-sm" style={{ background: 'rgba(232,93,76,0.1)', border: '1px solid rgba(232,93,76,0.3)' }}>
                {reasonObj.emoji} <span style={{ color: '#E85D4C' }}>{reasonObj.label}</span>
              </div>
            )}
            <h2 className="text-xl font-semibold text-center mb-2">Who do you want to reach?</h2>
            <p className="text-sm text-center mb-8" style={{ color: 'rgba(255,255,255,0.5)' }}>Choose your support route</p>
            <div className="space-y-3">
              {routes.map(r => (
                <button
                  key={r.id}
                  onClick={() => handleRouteSelect(r.id)}
                  className="w-full p-4 rounded-2xl flex items-center gap-4 text-left"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(232,93,76,0.15)' }}>
                    <r.icon className="w-5 h-5" style={{ color: '#E85D4C' }} strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{r.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{r.subtitle}</p>
                  </div>
                  <ChevronLeft className="w-4 h-4 rotate-180" style={{ color: 'rgba(255,255,255,0.3)' }} strokeWidth={1.5} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Action */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-semibold text-center mb-8">How do you want to connect?</h2>

            {/* Silent Mode Toggle */}
            <button
              onClick={() => setSilentMode(!silentMode)}
              className="w-full p-3 rounded-xl flex items-center gap-3 mb-6"
              style={{ background: silentMode ? 'rgba(232,93,76,0.2)' : 'rgba(255,255,255,0.06)', border: `1px solid ${silentMode ? '#E85D4C' : 'rgba(255,255,255,0.1)'}` }}
            >
              <VolumeX className="w-5 h-5" style={{ color: silentMode ? '#E85D4C' : 'rgba(255,255,255,0.5)' }} strokeWidth={1.5} />
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">Silent Mode</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Can't talk? Tap to send a preset message</p>
              </div>
              <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center" style={{ borderColor: silentMode ? '#E85D4C' : 'rgba(255,255,255,0.3)' }}>
                {silentMode && <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#E85D4C' }} />}
              </div>
            </button>

            {silentMode ? (
              <div>
                <p className="text-sm mb-4 text-center" style={{ color: 'rgba(255,255,255,0.6)' }}>Tap a message to send it</p>
                <div className="space-y-3">
                  {SILENT_MESSAGES.map((msg, i) => (
                    <button
                      key={i}
                      onClick={() => handleSilentMessage(msg)}
                      disabled={sentMessage === msg}
                      className="w-full p-4 rounded-2xl text-left text-sm"
                      style={{
                        background: sentMessage === msg ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)',
                        border: `1px solid ${sentMessage === msg ? '#22c55e' : 'rgba(255,255,255,0.1)'}`,
                        color: sentMessage === msg ? '#22c55e' : '#FFFFFF'
                      }}
                    >
                      <div className="flex items-center gap-3">
                        {sentMessage === msg ? <Check className="w-4 h-4 flex-shrink-0" style={{ color: '#22c55e' }} strokeWidth={2} /> : <span className="text-lg">💬</span>}
                        {msg}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Crisis route */}
                {selectedRoute === "crisis" && (
                  <div className="space-y-3">
                    <a href="tel:988" onClick={() => handleAction("call")} className="block w-full p-5 rounded-2xl text-center" style={{ background: '#E85D4C' }}>
                      <Phone className="w-6 h-6 mx-auto mb-2" strokeWidth={1.5} />
                      <p className="font-bold text-lg">Call 988</p>
                      <p className="text-xs opacity-80">Suicide & Crisis Lifeline</p>
                    </a>
                    <a href="tel:911" onClick={() => handleAction("call")} className="block w-full p-4 rounded-2xl text-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
                      <p className="font-semibold">Call 911 — Emergency</p>
                    </a>
                    {facility?.crisis_phone && (
                      <a href={`tel:${facility.crisis_phone}`} onClick={() => handleAction("call")} className="block w-full p-4 rounded-2xl text-center" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <p className="font-semibold">{facility.crisis_phone}</p>
                        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{facility.facility_name}</p>
                      </a>
                    )}
                  </div>
                )}

                {/* Support team route */}
                {selectedRoute === "support_team" && (
                  <div className="space-y-3">
                    {supportContacts.length === 0 ? (
                      <div className="p-6 rounded-2xl text-center" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <p className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>No contacts saved yet</p>
                        <button onClick={() => navigate(createPageUrl("Profile"))} className="text-sm" style={{ color: '#4A90E2' }}>Add support contacts →</button>
                      </div>
                    ) : (
                      supportContacts.map(contact => (
                        <div key={contact.id} className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                          <p className="font-semibold mb-1">{contact.name}</p>
                          <p className="text-xs mb-3 capitalize" style={{ color: 'rgba(255,255,255,0.5)' }}>{contact.relationship}</p>
                          {contact.phone && (
                            <a href={`tel:${contact.phone}`} onClick={() => handleAction("call")} className="block w-full py-2 px-4 rounded-xl text-center text-sm font-medium mb-2" style={{ background: '#4A90E2' }}>
                              📞 Call {contact.phone}
                            </a>
                          )}
                          {contact.phone && (
                            <a href={`sms:${contact.phone}`} onClick={() => handleAction("text_chat")} className="block w-full py-2 px-4 rounded-xl text-center text-sm font-medium" style={{ background: 'rgba(255,255,255,0.1)' }}>
                              💬 Text
                            </a>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Peer support route */}
                {selectedRoute === "peer_support" && (
                  <div className="space-y-3">
                    <button onClick={() => { handleAction("text_chat"); navigate(createPageUrl("Community")); }} className="w-full p-5 rounded-2xl text-center" style={{ background: '#7B5CFF' }}>
                      <MessageCircle className="w-6 h-6 mx-auto mb-2" strokeWidth={1.5} />
                      <p className="font-bold text-lg">Open Community</p>
                      <p className="text-xs opacity-80">Connect with peers now</p>
                    </button>
                    <div className="p-4 rounded-2xl text-center text-sm" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
                      Post in the forum or reach out to available peer supporters
                    </div>
                  </div>
                )}

                {/* Facility route */}
                {selectedRoute === "facility" && (
                  <div className="space-y-3">
                    {facility?.crisis_phone ? (
                      <a href={`tel:${facility.crisis_phone}`} onClick={() => handleAction("call")} className="block w-full p-5 rounded-2xl text-center" style={{ background: '#4A90E2' }}>
                        <Phone className="w-6 h-6 mx-auto mb-2" strokeWidth={1.5} />
                        <p className="font-bold text-lg">Call {facility.facility_name}</p>
                        <p className="text-sm opacity-80">{facility.crisis_phone}</p>
                      </a>
                    ) : (
                      <div className="p-6 rounded-2xl text-center" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <p className="text-sm mb-3" style={{ color: 'rgba(255,255,255,0.6)' }}>Your facility hasn't set up a Lifeline contact yet.</p>
                        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Falling back to Crisis Help</p>
                      </div>
                    )}
                    <a href="tel:988" onClick={() => handleAction("call")} className="block w-full p-4 rounded-2xl text-center" style={{ background: 'rgba(232,93,76,0.2)', border: '1px solid #E85D4C' }}>
                      <p className="font-semibold">Also available: Call 988</p>
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Always-visible disclaimer */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pb-6 pt-3" style={{ background: 'linear-gradient(to top, #0A0A0A 70%, transparent)' }}>
        <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Not medical care. <span className="font-semibold" style={{ color: '#E85D4C' }}>Medical emergency? Call 911 immediately.</span>
          </p>
        </div>
      </div>
    </div>
  );
}