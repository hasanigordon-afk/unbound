import React from "react";
import { Film, Sparkles, Mic2, Users, Video, Heart, Headphones, Award, MessageCircle, Send } from "lucide-react";
import HubHero from "@/components/hubs/HubHero";
import HubFeatureCard from "@/components/hubs/HubFeatureCard";
import SectionHeading from "@/components/dashboard/SectionHeading";
import FeaturedComebackWidget from "@/components/home/FeaturedComebackWidget";

const ACCENT = "var(--purple)";

const FEATURES = [
  { to: "/AhHaMoment",        icon: Sparkles,      label: "Ah Ha Moments",         desc: "The moment that changed everything." },
  { to: "/SubmitTestimonial", icon: Mic2,          label: "Share Your Testimonial",desc: "Your story might save someone." },
  { to: "/HowDidYouDoIt",     icon: Award,         label: "Recovery Interviews",   desc: "How real people made it." },
  { to: "/AhHaCommunity",     icon: Users,         label: "Community Feed",        desc: "Voices walking the same road." },
  { to: "/ComebackPortal",    icon: Video,         label: "Inspirational Media",    desc: "Curated comeback videos." },
  { to: "/HopeHub",           icon: Heart,         label: "Hope Hub",              desc: "Daily reminders you matter." },
  { to: "/ComebackPortal",    icon: Headphones,    label: "Podcasts & Audio",      desc: "Listen on the go." },
  { to: "/MyAhHaStories",     icon: MessageCircle, label: "My Stories",            desc: "Your journey, your archive." },
  { to: "/SubmitAhHa",        icon: Send,          label: "Submit Your Moment",    desc: "Add yours to the wall." },
];

export default function StoriesHub() {
  return (
    <div style={{ minHeight: "100vh", paddingBottom: 140, color: "var(--text)" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "20px 18px 0" }}>
        <HubHero
          pillar="Pillar 03 · Stories"
          title="You are not alone."
          subtitle="Real comeback stories, testimonials, and voices that remind you others have walked this and made it."
          icon={Film}
          accent={ACCENT}
        />

        <SectionHeading accent={ACCENT}>Featured Comeback</SectionHeading>
        <FeaturedComebackWidget />

        <SectionHeading accent={ACCENT}>Stories & Voices</SectionHeading>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {FEATURES.map(f => <HubFeatureCard key={f.to + f.label} {...f} accent={ACCENT} />)}
        </div>
      </div>
    </div>
  );
}