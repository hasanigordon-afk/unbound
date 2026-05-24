import React from "react";
import { base44 } from "@/api/base44Client";
import {
  ArrowRight, Map, Compass, Heart, Shield, Users, Briefcase,
  Home as HomeIcon, HandHeart, UserCheck, Sparkles, Lock, CheckCircle2,
} from "lucide-react";
import ResiliantLogo from "@/components/shared/ReZilientLogo";

/* ── ReZilient marketing landing page ─────────────────────────────────────
   Public-facing homepage describing the app for new visitors. */

const NAVY      = "#0F1E3D";
const NAVY_DEEP = "#0A1530";
const GOLD      = "#C8932F";
const CHARCOAL  = "#2A2D33";
const CREAM     = "#F6F4EF";
const GREEN     = "#6B8F71";
const TEXT      = "#1A1F2C";
const MUTED     = "#4A5260";
const DIM       = "#6B7280";

function SectionLabel({ children }) {
  return (
    <p style={{
      fontSize: 11, fontWeight: 700, color: GOLD,
      textTransform: "uppercase", letterSpacing: ".14em", marginBottom: 10,
    }}>{children}</p>
  );
}

function Heading({ children, light }) {
  return (
    <h2 style={{
      fontFamily: "'Lora', Georgia, serif",
      fontSize: 28, fontWeight: 600, lineHeight: 1.2,
      color: light ? "#fff" : TEXT, marginBottom: 14, letterSpacing: "-.01em",
    }}>{children}</h2>
  );
}

function AudienceCard({ icon: Icon, title, body }) {
  return (
    <div style={{
      background: "#fff", border: "1px solid #E4DFD3", borderRadius: 18,
      padding: "20px 18px", display: "flex", flexDirection: "column", gap: 10,
      boxShadow: "0 4px 16px rgba(15,30,61,0.05)",
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: "rgba(15,30,61,0.06)",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Icon style={{ width: 18, height: 18, color: NAVY }} strokeWidth={2} />
      </div>
      <p style={{ fontSize: 15, fontWeight: 700, color: TEXT, lineHeight: 1.3 }}>{title}</p>
      <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.6 }}>{body}</p>
    </div>
  );
}

function FeatureCard({ icon: Icon, label, title, body, accent }) {
  return (
    <div style={{
      background: "#fff", border: "1px solid #E4DFD3", borderRadius: 22,
      padding: "26px 22px", display: "flex", flexDirection: "column", gap: 12,
      boxShadow: "0 6px 22px rgba(15,30,61,0.06)",
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: accent === "gold" ? "rgba(200,147,47,0.14)" : "rgba(15,30,61,0.07)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon style={{ width: 22, height: 22, color: accent === "gold" ? GOLD : NAVY }} strokeWidth={1.8} />
      </div>
      <p style={{
        fontSize: 10, fontWeight: 800, color: accent === "gold" ? GOLD : NAVY,
        textTransform: "uppercase", letterSpacing: ".14em",
      }}>{label}</p>
      <p style={{ fontSize: 18, fontWeight: 700, color: TEXT, lineHeight: 1.3, fontFamily: "'Lora', Georgia, serif" }}>{title}</p>
      <p style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.65 }}>{body}</p>
    </div>
  );
}

export default function Resiliant() {
  const handleStart = () => base44.auth.redirectToLogin("/RoleSelect");

  return (
    <div style={{ background: CREAM, minHeight: "100vh" }}>

      {/* ── 1. HERO ───────────────────────────────────────────────────────── */}
      <div style={{
        background: `linear-gradient(180deg, ${NAVY} 0%, ${NAVY_DEEP} 100%)`,
        color: "#fff", position: "relative", overflow: "hidden",
      }}>
        {/* subtle gold glow */}
        <div style={{
          position: "absolute", top: -120, right: -120, width: 380, height: 380,
          borderRadius: "50%", background: "radial-gradient(circle, rgba(200,147,47,0.22) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ maxWidth: 720, margin: "0 auto", padding: "72px 24px 80px", position: "relative" }}>
          {/* Top bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 56 }}>
            <ResiliantLogo size={42} showWordmark={true} />
            <button
              onClick={handleStart}
              style={{
                background: "transparent", border: "1px solid rgba(255,255,255,0.25)",
                color: "#fff", padding: "8px 16px", borderRadius: 999,
                fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              }}
            >Log in</button>
          </div>

          {/* Hero copy */}
          <p style={{
            fontSize: 11, fontWeight: 800, color: GOLD,
            textTransform: "uppercase", letterSpacing: ".18em", marginBottom: 18,
          }}>A Digital Comeback System</p>

          <h1 style={{
            fontFamily: "'Lora', Georgia, serif", fontSize: 52, fontWeight: 700,
            lineHeight: 1.05, letterSpacing: "-.02em", marginBottom: 18, color: "#fff",
          }}>
            Re<span style={{ color: GOLD }}>Z</span>ilient
          </h1>

          <p style={{
            fontSize: 22, fontFamily: "'Lora', Georgia, serif", fontStyle: "italic",
            color: GOLD, marginBottom: 22, fontWeight: 500,
          }}>
            Built For Life's Biggest Comebacks.
          </p>

          <p style={{
            fontSize: 16, color: "rgba(255,255,255,0.82)", lineHeight: 1.7,
            maxWidth: 540, marginBottom: 32,
          }}>
            An AI-powered recovery, aftercare, accountability, and reentry ecosystem for people rebuilding after treatment, incarceration, homelessness, trauma, military transition, or major life setbacks. ReZilient creates structure, support, purpose, and personal growth after treatment ends.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              onClick={handleStart}
              style={{
                background: GOLD, color: "#fff", border: "none",
                padding: "16px 28px", borderRadius: 999, fontSize: 15, fontWeight: 700,
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                display: "inline-flex", alignItems: "center", gap: 8,
                boxShadow: "0 8px 24px rgba(200,147,47,0.32)",
              }}
            >
              Start Rebuilding <ArrowRight style={{ width: 16, height: 16 }} />
            </button>
            <a href="#features" style={{
              background: "transparent", color: "#fff",
              border: "1px solid rgba(255,255,255,0.30)",
              padding: "16px 28px", borderRadius: 999, fontSize: 15, fontWeight: 600,
              textDecoration: "none", fontFamily: "'DM Sans', sans-serif",
            }}>
              Explore Features
            </a>
          </div>
        </div>
      </div>

      {/* ── 2. WHAT IS RE-SILIANT ────────────────────────────────────────── */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "72px 24px" }}>
        <SectionLabel>What is ReZilient?</SectionLabel>
        <Heading>A digital comeback system for people rebuilding their lives.</Heading>
        <p style={{ fontSize: 16, color: MUTED, lineHeight: 1.75 }}>
          ReZilient helps people stay accountable, find resources, create daily structure, and rebuild after addiction, incarceration, military transition, homelessness, or hardship. The "Re-" stands for recovery, reentry, rebuilding, restarting, reconnecting, and reclaiming life. The hyphen represents the break — and the decision to rebuild after it.
        </p>
      </div>

      {/* ── 3. WHY SHOULD I CARE ─────────────────────────────────────────── */}
      <div style={{ background: "#fff", borderTop: "1px solid #E4DFD3", borderBottom: "1px solid #E4DFD3" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "72px 24px" }}>
          <SectionLabel>Why does this matter?</SectionLabel>
          <Heading>People need the most support right after the hardest moments.</Heading>
          <p style={{ fontSize: 16, color: MUTED, lineHeight: 1.75, marginBottom: 24 }}>
            After treatment ends, after release, after a crisis, or after a major life change — that's when the real work begins, and that's exactly when most people lose the structure that was holding them up. ReZilient gives users the tools to stay focused, supported, and moving forward, even on the hard days.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
            {[
              "Accountability that travels with you, every single day.",
              "Real-world resources for housing, food, jobs, and recovery.",
              "Structure built around your life — not a clinical checklist.",
            ].map((line, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: 12,
                padding: "14px 16px", borderRadius: 12,
                background: "#F6F4EF", border: "1px solid #EEEAE0",
              }}>
                <CheckCircle2 style={{ width: 18, height: 18, color: GREEN, flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 14.5, color: TEXT, lineHeight: 1.6 }}>{line}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 4. WHO IS IT FOR ─────────────────────────────────────────────── */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "72px 24px" }}>
        <SectionLabel>Who it's for</SectionLabel>
        <Heading>Built for the people the system often forgets.</Heading>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 14, marginTop: 24,
        }}>
          <AudienceCard icon={Sparkles}  title="People in Recovery"        body="Stay accountable after treatment, with daily structure and real support." />
          <AudienceCard icon={Shield}    title="Veterans"                  body="Resources, mission-driven structure, and a community that gets it." />
          <AudienceCard icon={UserCheck} title="Returning Citizens"        body="Tools to navigate reentry — IDs, housing, jobs, and reconnection." />
          <AudienceCard icon={HomeIcon}  title="Facing Homelessness or Hardship" body="Find shelter, food, and a way back to stable ground." />
          <AudienceCard icon={HandHeart} title="Families & Supporters"      body="Stay connected, informed, and ready to show up the right way." />
          <AudienceCard icon={Briefcase} title="Counselors, Sponsors, Facilities" body="Extend support beyond the walls — without replacing your role." />
        </div>
      </div>

      {/* ── 5. TOP 3 FEATURES ────────────────────────────────────────────── */}
      <div id="features" style={{ background: NAVY, color: "#fff" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "80px 24px" }}>
          <p style={{
            fontSize: 11, fontWeight: 800, color: GOLD,
            textTransform: "uppercase", letterSpacing: ".14em", marginBottom: 10,
          }}>The core tools</p>
          <Heading light>Three things that move you forward.</Heading>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.72)", lineHeight: 1.7, marginBottom: 36, maxWidth: 540 }}>
            ReZilient is more than a check-in app. It's a guided system designed around the moments people need most.
          </p>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
          }}>
            <FeatureCard
              icon={Map}
              label="Rebuild Roadmap"
              title="A guided 90-day plan for rebuilding stability."
              body="One day at a time. Daily structure, weekly milestones, and a clear path forward — built around your life, not a clinical script."
              accent="gold"
            />
            <FeatureCard
              icon={Compass}
              label="Support Map"
              title="Local resources for the things that matter."
              body="Food, shelter, recovery, jobs, veterans services, and emergency help — searchable, real, and close to where you actually are."
            />
            <FeatureCard
              icon={Sparkles}
              label="Ah Ha Moment"
              title="Anonymous story-sharing for healing and inspiration."
              body="Read or write about the moment you realized your life had to change. Anonymous, real, and powerful — for you and for the next person who needs it."
              accent="gold"
            />
          </div>
        </div>
      </div>

      {/* ── 6. TRUST SECTION ─────────────────────────────────────────────── */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "72px 24px" }}>
        <SectionLabel>What we stand for</SectionLabel>
        <Heading>Real support. No judgment. Built around you.</Heading>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12, marginTop: 20 }}>
          {[
            { icon: Heart,   title: "Non-judgmental",       body: "We meet people where they are — recovery isn't a straight line." },
            { icon: Lock,    title: "Privacy-conscious",    body: "Your story is yours. Anonymous by default for community features." },
            { icon: Users,   title: "User-driven",          body: "Built around what real people in recovery and reentry actually need." },
            { icon: Shield,  title: "A support — not a replacement", body: "ReZilient supports professional care, counselors, sponsors, and treatment providers. It doesn't replace them." },
          ].map((item, i) => (
            <div key={i} style={{
              background: "#fff", border: "1px solid #E4DFD3", borderRadius: 16,
              padding: "16px 18px", display: "flex", alignItems: "flex-start", gap: 14,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: "rgba(15,30,61,0.06)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <item.icon style={{ width: 16, height: 16, color: NAVY }} strokeWidth={2} />
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 4 }}>{item.title}</p>
                <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.6 }}>{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 7. FINAL CTA ─────────────────────────────────────────────────── */}
      <div style={{
        background: `linear-gradient(135deg, ${NAVY} 0%, ${CHARCOAL} 100%)`,
        color: "#fff",
      }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
          <h2 style={{
            fontFamily: "'Lora', Georgia, serif", fontSize: 38, fontWeight: 700,
            lineHeight: 1.15, marginBottom: 16, letterSpacing: "-.01em",
          }}>
            Your comeback starts here.
          </h2>
          <p style={{
            fontSize: 16, color: "rgba(255,255,255,0.78)", lineHeight: 1.7,
            maxWidth: 480, margin: "0 auto 32px",
          }}>
            Whether you're leaving treatment, coming home, or just starting over — take the next step today.
          </p>
          <button
            onClick={handleStart}
            style={{
              background: GOLD, color: "#fff", border: "none",
              padding: "18px 36px", borderRadius: 999, fontSize: 16, fontWeight: 700,
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              display: "inline-flex", alignItems: "center", gap: 10,
              boxShadow: "0 10px 28px rgba(200,147,47,0.36)",
            }}
          >
            Join ReZilient <ArrowRight style={{ width: 18, height: 18 }} />
          </button>

          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.48)", marginTop: 32, lineHeight: 1.7 }}>
            ReZilient is a support tool, not a medical provider.<br/>
            In an emergency, call 911 or 988.
          </p>
        </div>
      </div>

    </div>
  );
}