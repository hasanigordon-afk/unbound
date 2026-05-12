import React from "react";
import { Sprout, Brain, Dumbbell, Footprints, Apple, Wind, Music, GraduationCap, BookOpen, Target, HeartPulse } from "lucide-react";
import HubHero from "@/components/hubs/HubHero";
import HubFeatureCard from "@/components/hubs/HubFeatureCard";
import SectionHeading from "@/components/dashboard/SectionHeading";

const ACCENT = "var(--green)";

const FEATURES = [
  { to: "/MentalReset",      icon: Brain,         label: "Meditation",          desc: "Calm the noise. Reset the mind." },
  { to: "/MindBodyRecovery", icon: Dumbbell,      label: "Fitness Plans",       desc: "Bodyweight to full programs." },
  { to: "/WellnessPlan",     icon: Footprints,    label: "Walking & Movement",  desc: "Plans for any energy level." },
  { to: "/WellnessPlanBuilder", icon: Apple,      label: "Nutrition Plans",     desc: "Alkaline, gut-friendly meals." },
  { to: "/MentalReset",      icon: Wind,          label: "Breathing Exercises", desc: "4-7-8, box breath, more." },
  { to: "/MentalReset",      icon: Music,         label: "Binaural Beats",      desc: "Sound for focus and calm." },
  { to: "/SuperAgent",       icon: GraduationCap, label: "AI Education",         desc: "Ask anything. Learn fast." },
  { to: "/LearnRecovery",    icon: BookOpen,      label: "Reading & Learning",  desc: "Curated growth content." },
  { to: "/FutureYou",        icon: Target,        label: "Goal Planning",        desc: "Build the future-you blueprint." },
  { to: "/NinetyDayReset",   icon: HeartPulse,    label: "90-Day Reset",        desc: "A full mind-body reset program." },
];

export default function GrowthHub() {
  return (
    <div style={{ minHeight: "100vh", paddingBottom: 140, color: "var(--text)" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "20px 18px 0" }}>
        <HubHero
          pillar="Pillar 04 · Growth & Future Building"
          title="Build your future self."
          subtitle="Wellness, education, and personal growth tools designed to make you mentally, physically, and emotionally stronger."
          icon={Sprout}
          accent={ACCENT}
        />

        <SectionHeading accent={ACCENT}>Growth & Future Tools</SectionHeading>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {FEATURES.map(f => <HubFeatureCard key={f.to + f.label} {...f} accent={ACCENT} />)}
        </div>
      </div>
    </div>
  );
}