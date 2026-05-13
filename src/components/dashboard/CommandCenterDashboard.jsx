import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bell,
  BookOpen,
  Brain,
  CalendarCheck,
  CheckCircle2,
  Flame,
  HeartPulse,
  MapPin,
  MessageCircle,
  Moon,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import CommandCenterCard from "./CommandCenterCard";

const moodBars = [42, 62, 50, 76, 68, 82, 74];

function SmallAction({ to, icon: Icon, label, color = "var(--accent)" }) {
  return (
    <Link to={to} style={{ textDecoration: "none" }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 13px",
        borderRadius: 16,
        background: "rgba(255,255,255,0.045)",
        border: "1px solid var(--border)",
        color: "var(--text)",
      }}>
        <Icon style={{ width: 17, height: 17, color }} />
        <span style={{ flex: 1, fontSize: 13, fontWeight: 800 }}>{label}</span>
        <ArrowRight style={{ width: 14, height: 14, color: "var(--text-dim)" }} />
      </div>
    </Link>
  );
}

function SectionTitle({ icon: Icon, label, sub }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <div style={{
        width: 34,
        height: 34,
        borderRadius: 13,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--navy-dim)",
        border: "1px solid var(--border-glow)",
        color: "var(--accent)",
      }}>
        <Icon style={{ width: 17, height: 17 }} />
      </div>
      <div>
        <h2 style={{ fontSize: 17, lineHeight: 1.1, margin: 0 }}>{label}</h2>
        {sub && <p style={{ fontSize: 11.5, color: "var(--text-dim)", marginTop: 3 }}>{sub}</p>}
      </div>
    </div>
  );
}

export default function CommandCenterDashboard({
  firstName,
  streak,
  stability,
  wellnessScore,
  stage,
  checkIns,
  journalCount,
  communityPostCount,
  campaignSettings,
}) {
  const todayComplete = checkIns?.some(c => {
    const d = new Date(c.check_in_date);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });
  const moodLabel = wellnessScore === null ? "Ready" : wellnessScore >= 70 ? "Steady" : wellnessScore >= 45 ? "Building" : "Tender";
  const goalProgress = stability ?? Math.min(100, Math.max(18, streak * 7));

  const reminders = [
    { label: todayComplete ? "Reflect on one win from today" : "Complete today’s check-in", to: "/DailyCheckIn", icon: CalendarCheck },
    { label: "Review your safety plan", to: "/MySafetyPlan", icon: ShieldCheck },
    { label: "Save one support resource", to: "/SavedResources", icon: MapPin },
  ];

  return (
    <main style={{ minHeight: "100vh", padding: "38px 0 170px", color: "var(--text)" }}>
      <div style={{ width: "min(1240px, calc(100vw - 40px))", margin: "0 auto" }}>
        <section style={{
          position: "relative",
          borderRadius: 32,
          padding: "clamp(34px, 5vw, 56px)",
          marginBottom: 34,
          background: "linear-gradient(135deg, rgba(91,141,239,0.22), rgba(13,18,32,0.78) 45%, rgba(52,211,153,0.12))",
          border: "1px solid var(--border-glow)",
          boxShadow: "var(--glow), var(--shadow)",
          overflow: "hidden",
        }}>
          <div aria-hidden style={{ position: "absolute", right: -80, top: -100, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(52,211,153,0.22), transparent 68%)", filter: "blur(22px)" }} />
          <div style={{ position: "relative", display: "flex", flexWrap: "wrap", gap: 30, alignItems: "flex-end", justifyContent: "space-between" }}>
            <div style={{ maxWidth: 660 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 12px", borderRadius: 999, background: "rgba(255,255,255,0.08)", border: "1px solid var(--border)", color: "var(--accent)", fontSize: 11, fontWeight: 900, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 14 }}>
                <Sparkles style={{ width: 13, height: 13 }} /> Recovery Command Center
              </div>
              <h1 style={{ fontSize: "clamp(34px, 5vw, 58px)", lineHeight: 1.02, margin: 0 }}>
                Good to see you, {firstName}.
              </h1>
              <p style={{ marginTop: 12, color: "var(--text-muted)", fontSize: 16, lineHeight: 1.65, maxWidth: 590 }}>
                One calm place to check in, track momentum, stay connected, and choose your next healthy step.
              </p>
            </div>
            <Link to="/DailyCheckIn" style={{ textDecoration: "none" }}>
              <button className="btn-primary" style={{ minWidth: 190 }}>
                Start Today’s Check-In
              </button>
            </Link>
          </div>
        </section>

        <section className="card-glow fade-up" style={{
          marginBottom: 34,
          padding: "clamp(26px, 4vw, 40px)",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) auto",
          gap: 24,
          alignItems: "center",
          background: "linear-gradient(135deg, rgba(52,211,153,0.15), rgba(91,141,239,0.12), rgba(13,18,32,0.78))",
        }}>
          <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
            <div style={{ width: 58, height: 58, borderRadius: 20, display: "grid", placeItems: "center", background: "rgba(52,211,153,0.14)", border: "1px solid rgba(52,211,153,0.42)", color: "var(--green)", flexShrink: 0 }}>
              <ShieldCheck style={{ width: 28, height: 28 }} />
            </div>
            <div>
              <div style={{ color: "var(--green)", fontSize: 11, fontWeight: 900, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 8 }}>Veteran Support Hub</div>
              <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", lineHeight: 1.05, marginBottom: 10 }}>Mission-focused support for veterans rebuilding life after service.</h2>
              <p style={{ color: "var(--text-muted)", fontSize: 15.5, lineHeight: 1.65, maxWidth: 760 }}>
                Access VA resources, crisis support, housing, employment, benefits guidance, peer connection, and structured reintegration tools in one dedicated hub.
              </p>
            </div>
          </div>
          <Link to="/VeteranSupportHub" style={{ textDecoration: "none" }}>
            <button className="btn-primary" style={{
              minWidth: 230,
              background: "linear-gradient(180deg, #B22234 0 14%, #fff 14% 28%, #B22234 28% 42%, #fff 42% 56%, #B22234 56% 70%, #fff 70% 84%, #B22234 84% 100%)",
              color: "#071B3A",
              border: "1px solid rgba(255,255,255,0.75)",
              boxShadow: "0 0 0 1px rgba(60,59,110,0.45), 0 16px 34px rgba(0,0,0,0.35)",
              position: "relative",
              overflow: "hidden",
            }}>
              <span style={{ position: "absolute", left: 0, top: 0, width: 78, height: "56%", background: "#3C3B6E" }} />
              <span style={{ position: "relative", zIndex: 1 }}>🇺🇸 Veteran Support Hub</span>
            </button>
          </Link>
        </section>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 24, alignItems: "stretch" }}>
          <CommandCenterCard glow style={{ gridColumn: "span 4", minHeight: 260 }}>
            <SectionTitle icon={CalendarCheck} label="Daily Check-In" sub={todayComplete ? "You showed up today." : "A two-minute reset."} />
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 82, height: 82, borderRadius: "50%", display: "grid", placeItems: "center", background: todayComplete ? "rgba(52,211,153,0.14)" : "rgba(91,141,239,0.14)", border: `1px solid ${todayComplete ? "rgba(52,211,153,0.42)" : "var(--border-glow)"}` }}>
                <CheckCircle2 style={{ width: 34, height: 34, color: todayComplete ? "var(--green)" : "var(--accent)" }} />
              </div>
              <div>
                <p style={{ fontSize: 22, fontWeight: 900 }}>{todayComplete ? "Complete" : "Ready"}</p>
                <p style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.5 }}>Notice how you feel, name what you need, and keep moving.</p>
              </div>
            </div>
            <SmallAction to="/DailyCheckIn" icon={HeartPulse} label={todayComplete ? "Open check-in" : "Check in now"} />
          </CommandCenterCard>

          <CommandCenterCard style={{ gridColumn: "span 4", minHeight: 260 }}>
            <SectionTitle icon={Flame} label="Recovery Streak" sub={`Current stage: ${stage?.name || "Ember"}`} />
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontSize: 58, fontWeight: 950, letterSpacing: "-.05em" }}>{streak}</span>
              <span style={{ color: "var(--text-muted)", fontWeight: 800 }}>days</span>
            </div>
            <div style={{ height: 10, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden", margin: "10px 0 12px" }}>
              <div style={{ width: `${Math.min(100, streak * 4)}%`, height: "100%", borderRadius: 999, background: "linear-gradient(90deg, var(--gold), var(--green))", boxShadow: "var(--glow-gold)" }} />
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Every day counted is evidence that you can keep choosing yourself.</p>
          </CommandCenterCard>

          <CommandCenterCard style={{ gridColumn: "span 4", minHeight: 260 }}>
            <SectionTitle icon={Moon} label="Mood Tracker" sub="This week’s emotional rhythm" />
            <div style={{ display: "flex", alignItems: "end", gap: 8, height: 92, marginTop: 6 }}>
              {moodBars.map((bar, index) => (
                <div key={index} style={{ flex: 1, height: `${bar}%`, borderRadius: "999px 999px 8px 8px", background: "linear-gradient(180deg, var(--accent), rgba(52,211,153,0.42))", opacity: 0.55 + index * 0.05 }} />
              ))}
            </div>
            <p style={{ marginTop: 14, color: "var(--text-muted)", fontSize: 13 }}>Current signal: <b style={{ color: "var(--green)" }}>{moodLabel}</b>. Stay gentle and consistent.</p>
          </CommandCenterCard>

          <CommandCenterCard style={{ gridColumn: "span 6", minHeight: 250 }}>
            <SectionTitle icon={Target} label="Goals Progress" sub="Your next milestone is built one small action at a time." />
            <div style={{ display: "grid", gap: 12 }}>
              {["Check-ins", "Support connections", "Personal stability"].map((goal, i) => {
                const value = Math.min(100, Math.max(16, goalProgress - i * 12));
                return (
                  <div key={goal}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, fontWeight: 800, marginBottom: 7 }}>
                      <span>{goal}</span><span style={{ color: "var(--text-dim)" }}>{value}%</span>
                    </div>
                    <div style={{ height: 9, background: "rgba(255,255,255,0.08)", borderRadius: 999, overflow: "hidden" }}>
                      <div style={{ width: `${value}%`, height: "100%", background: "linear-gradient(90deg, var(--accent), var(--purple))", borderRadius: 999 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CommandCenterCard>

          <CommandCenterCard glow style={{ gridColumn: "span 6", minHeight: 250 }}>
            <SectionTitle icon={Brain} label="Motivational AI Assistant" sub="Supportive guidance without judgment." />
            <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.65, marginBottom: 14 }}>
              “You don’t have to solve your whole life today. Pick the next right action, then let that be enough.”
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 18 }}>
              <SmallAction to="/SuperAgent" icon={Sparkles} label="Ask for support" />
              <SmallAction to="/FiveWs" icon={Brain} label="Process a thought" color="var(--purple)" />
            </div>
          </CommandCenterCard>

          <CommandCenterCard style={{ gridColumn: "span 4", minHeight: 260 }}>
            <SectionTitle icon={Bell} label="Tasks & Reminders" sub="Keep the day simple." />
            <div style={{ display: "grid", gap: 9 }}>
              {reminders.map(item => <SmallAction key={item.label} {...item} />)}
            </div>
          </CommandCenterCard>

          <CommandCenterCard style={{ gridColumn: "span 4", minHeight: 260 }}>
            <SectionTitle icon={MapPin} label="Personalized Resources" sub="Help that matches where you are." />
            <div style={{ display: "grid", gap: 9 }}>
              <SmallAction to="/MeetingDirectory" icon={Users} label="Find a meeting" />
              <SmallAction to="/FindHelpNow" icon={MapPin} label="Nearby support" color="var(--gold)" />
              <SmallAction to="/WellnessPlan" icon={BookOpen} label="Build a wellness plan" color="var(--green)" />
            </div>
          </CommandCenterCard>

          <CommandCenterCard style={{ gridColumn: "span 4", minHeight: 260 }}>
            <SectionTitle icon={MessageCircle} label="Community Activity" sub="Connection is part of recovery." />
            <div style={{ display: "grid", gap: 11 }}>
              <div style={{ padding: 12, borderRadius: 16, background: "rgba(255,255,255,0.045)", border: "1px solid var(--border)" }}>
                <p style={{ fontWeight: 900, fontSize: 13 }}>Your shares this month</p>
                <p style={{ color: "var(--text-muted)", fontSize: 12 }}>{communityPostCount || 0} community posts • {journalCount || 0} journal entries</p>
              </div>
              <SmallAction to="/AhHaCommunity" icon={Users} label="Open community" color="var(--purple)" />
              <SmallAction to="/ComebackPortal" icon={TrendingUp} label="Watch a comeback" color="var(--gold)" />
            </div>
          </CommandCenterCard>
        </div>

        {campaignSettings?.campaign_announcement_active && campaignSettings?.campaign_announcement && (
          <div style={{ marginTop: 34, padding: 18, borderRadius: 22, background: "var(--gold-dim)", border: "1px solid var(--gold-border)", color: "var(--gold)", fontWeight: 800 }}>
            {campaignSettings.campaign_announcement}
          </div>
        )}

        <p style={{ textAlign: "center", marginTop: 42, fontSize: 11, color: "var(--text-dim)", lineHeight: 1.7 }}>
          Re-siliant is a support tool, not a medical provider. In an emergency, call 911 or 988.
        </p>
      </div>

      <style>{`
        @media (max-width: 980px) {
          main [style*="grid-column: span 4"],
          main [style*="grid-column: span 6"] { grid-column: span 12 !important; }
        }
      `}</style>
    </main>
  );
}