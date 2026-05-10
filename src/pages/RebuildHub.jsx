import React from "react";
import { Hammer, Home, UtensilsCrossed, Bus, HeartPulse, Shield, Briefcase, Users, Stethoscope, Bed, Scale, MapPin, HandHeart } from "lucide-react";
import HubHero from "@/components/hubs/HubHero";
import HubFeatureCard from "@/components/hubs/HubFeatureCard";
import SectionHeading from "@/components/dashboard/SectionHeading";

const ACCENT = "var(--gold)";

const FEATURES = [
  { to: "/NJHousingSearch",                              icon: Home,            label: "Housing Resources",     desc: "Find a place to land." },
  { to: "/FindHelpNow?category=Food%20Pantry",           icon: UtensilsCrossed, label: "Food Pantries",          desc: "Free meals and food access." },
  { to: "/FindHelpNow?category=Transportation",          icon: Bus,             label: "Transportation",         desc: "Get where you need to go." },
  { to: "/RecoveryMapFinder",                            icon: HeartPulse,      label: "Treatment Centers",      desc: "Detox, rehab, and recovery." },
  { to: "/VeteranSupportHub",                            icon: Shield,          label: "Veteran Resources",      desc: "Built for those who served." },
  { to: "/FindHelpNow?category=Reentry%20Services",      icon: HandHeart,       label: "Reentry Resources",      desc: "Support after incarceration." },
  { to: "/FindHelpNow?category=Employment%20Assistance", icon: Briefcase,       label: "Job Opportunities",      desc: "Real second-chance employers." },
  { to: "/EachOneTeachOne",                              icon: Users,           label: "Staffing & Mentorship",  desc: "People who get it, hiring you." },
  { to: "/FindHelpNow?category=Mental%20Health",         icon: Stethoscope,     label: "Medicaid & Health",       desc: "Coverage and care options." },
  { to: "/FindHelpNow?category=Housing",                 icon: Bed,             label: "Shelter Finder",         desc: "Emergency beds tonight." },
  { to: "/FindHelpNow?category=Legal",                   icon: Scale,           label: "Legal Aid",              desc: "Free legal help and ID help." },
  { to: "/VeteranResourceMap",                           icon: MapPin,          label: "Resource Map",           desc: "Find help near you." },
];

export default function RebuildHub() {
  return (
    <div style={{ minHeight: "100vh", paddingBottom: 140, color: "var(--text)" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "20px 18px 0" }}>
        <HubHero
          pillar="Pillar 02 · Rebuild"
          title="Real-world ground."
          subtitle="Practical tools and resources that help you rebuild stability, independence, and forward momentum."
          icon={Hammer}
          accent={ACCENT}
        />

        <SectionHeading accent={ACCENT}>Rebuild Resources</SectionHeading>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {FEATURES.map(f => <HubFeatureCard key={f.to} {...f} accent={ACCENT} />)}
        </div>
      </div>
    </div>
  );
}