import React, { useState } from "react";
import { Sparkles, BookOpen, Play, Music, Headphones, Wind, Heart, Sun, Brain } from "lucide-react";
import MeditationSection from "../components/cravingcontrol/MeditationSection.jsx";
import JournalSection from "../components/cravingcontrol/JournalSection.jsx";
import VideosSection from "../components/cravingcontrol/VideosSection.jsx";
import MusicSection from "../components/cravingcontrol/MusicSection.jsx";
import BinauralBeatsSection from "../components/cravingcontrol/BinauralBeatsSection.jsx";
import BreathingResetSection from "../components/cravingcontrol/BreathingResetSection.jsx";
import EmergencyCalmSection from "../components/cravingcontrol/EmergencyCalmSection.jsx";
import MotivationBoostSection from "../components/cravingcontrol/MotivationBoostSection.jsx";
import PilotShell from "@/components/pilot/PilotShell";

const NAV_ITEMS = [
  { id: "emergency", label: "Emergency Calm", icon: Heart, color: "#F87171", badge: "SOS" },
  { id: "breathing", label: "Breathing Reset", icon: Wind, color: "#34D399" },
  { id: "meditation", label: "Meditation", icon: Sparkles, color: "#A78BFA" },
  { id: "journal", label: "Journal", icon: BookOpen, color: "#F0B753" },
  { id: "videos", label: "Videos", icon: Play, color: "#5B8DEF" },
  { id: "music", label: "Music", icon: Music, color: "#A78BFA" },
  { id: "binaural", label: "Binaural Beats", icon: Headphones, color: "#34D399" },
  { id: "motivation", label: "Motivation Boost", icon: Sun, color: "#F0B753" },
];

const SECTION_MAP = {
  emergency: EmergencyCalmSection,
  breathing: BreathingResetSection,
  meditation: MeditationSection,
  journal: JournalSection,
  videos: VideosSection,
  music: MusicSection,
  binaural: BinauralBeatsSection,
  motivation: MotivationBoostSection,
};

function CravingNav({ active, onSelect }) {
  return (
    <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-2 md:grid md:grid-cols-4 md:overflow-visible">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`min-w-[160px] rounded-3xl border p-4 text-left shadow-xl backdrop-blur-2xl active:scale-[.98] md:min-w-0 ${isActive ? "border-white/25 bg-white text-slate-950" : "border-white/12 bg-white/10 text-white"}`}
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${isActive ? "bg-slate-950/8" : "bg-white/12"}`}>
                <Icon className="h-5 w-5" style={{ color: isActive ? item.color : "#EAF0FF" }} strokeWidth={1.8} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black leading-tight">{item.label}</p>
                {item.badge && <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-red-300">{item.badge}</p>}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default function CravingControlCenter() {
  const [active, setActive] = useState("emergency");
  const ActiveSection = SECTION_MAP[active];
  const activeItem = NAV_ITEMS.find((item) => item.id === active);
  const ActiveIcon = activeItem?.icon;

  return (
    <PilotShell title="Craving Control" subtitle="Crisis support, grounding, breathing, journaling, music, and motivation.">
      <div className="space-y-5">
        <section className="rounded-[36px] border border-red-200/20 bg-gradient-to-br from-red-400/16 via-white/10 to-blue-400/10 p-5 shadow-2xl backdrop-blur-2xl">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl border border-white/12 bg-white/12">
              <Brain className="h-7 w-7 text-red-200" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-red-200/90">Craving crisis center</p>
              <h2 className="mt-2 font-sans text-4xl font-black leading-tight text-white">One calm step at a time.</h2>
              <p className="mt-3 text-sm font-bold leading-relaxed text-slate-300">Choose the support tool you need right now. This page now matches the rest of ReZilient while keeping every crisis tool available.</p>
            </div>
          </div>
        </section>

        <CravingNav active={active} onSelect={setActive} />

        <section className="rounded-[34px] border border-white/12 bg-white/10 p-2 shadow-2xl backdrop-blur-2xl md:p-4">
          <div className="mb-3 flex items-center gap-3 px-3 pt-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/12">
              {ActiveIcon && <ActiveIcon className="h-5 w-5" style={{ color: activeItem.color }} />}
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-200/70">Active tool</p>
              <h3 className="font-sans text-xl font-black text-white">{activeItem?.label}</h3>
            </div>
          </div>
          <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/95 text-slate-950 shadow-xl">
            <ActiveSection />
          </div>
        </section>
      </div>
    </PilotShell>
  );
}