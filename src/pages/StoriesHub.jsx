import React from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  Camera,
  Heart,
  HeartHandshake,
  MessageCircle,
  Mic2,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Video,
  Waves,
  Award,
} from "lucide-react";

const ACCENT = "var(--purple)";

const ecosystemCards = [
  { to: "/SubmitAhHa", icon: Video, title: "Ah Ha Moments", text: "Upload a short video, audio reflection, or written breakthrough that might help someone else keep going.", tag: "Video + audio uploads" },
  { to: "/SubmitTestimonial", icon: Star, title: "Testimonial Stories", text: "Share the real story behind your comeback — honest, human, and rooted in hope.", tag: "Recovery voices" },
  { to: "/Mentors", icon: HeartHandshake, title: "Mentor Matching", text: "Connect with people who understand your path and can walk beside you with lived experience.", tag: "Guided support" },
  { to: "/Community", icon: Users, title: "Peer Support Groups", text: "Find circles for accountability, encouragement, rebuilding routines, and staying connected.", tag: "Safe circles" },
  { to: "/VeteranSupportHub", icon: ShieldCheck, title: "Veteran Community", text: "Dedicated spaces for veterans navigating recovery, reentry, service transition, and purpose.", tag: "Veteran spaces" },
  { to: "/AhHaCommunity", icon: MessageCircle, title: "Discussion Feeds", text: "Join recovery conversations that are moderated, supportive, and focused on progress.", tag: "Community feed" },
  { to: "/HopeHub", icon: Heart, title: "Positive Reactions", text: "Encourage others through supportive reactions, saves, and momentum-building engagement.", tag: "Hope signals" },
  { to: "/Meetings", icon: CalendarDays, title: "Live Support Events", text: "Track meetings, group sessions, check-ins, and upcoming recovery support events.", tag: "Event calendar" },
];

const feedItems = [
  { icon: Sparkles, title: "New Ah Ha Moment shared", text: "Someone posted the turning point that helped them choose recovery today.", time: "12 min ago" },
  { icon: Award, title: "Testimonial milestone", text: "A member shared 90 days of progress and the routine that helped them get there.", time: "1 hr ago" },
  { icon: HeartHandshake, title: "Mentor match available", text: "A peer mentor is open for support around rebuilding structure and accountability.", time: "Today" },
];

function EcosystemCard({ card, index }) {
  const Icon = card.icon;
  return (
    <Link to={card.to} style={{ textDecoration: "none" }}>
      <article className="fade-up" style={{
        animationDelay: `${index * 45}ms`,
        position: "relative",
        minHeight: 188,
        padding: 18,
        borderRadius: 24,
        background: "linear-gradient(145deg, rgba(255,255,255,0.075), rgba(255,255,255,0.025))",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-card)",
        overflow: "hidden",
        backdropFilter: "blur(18px)",
      }}>
        <div aria-hidden style={{ position: "absolute", inset: "auto -35px -55px auto", width: 140, height: 140, borderRadius: "50%", background: `radial-gradient(circle, ${ACCENT}24, transparent 70%)`, filter: "blur(18px)" }} />
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 18, position: "relative" }}>
          <div style={{ width: 48, height: 48, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", color: ACCENT, background: "var(--surface)", border: `1px solid ${ACCENT}66`, boxShadow: `0 0 18px ${ACCENT}25` }}>
            <Icon style={{ width: 22, height: 22 }} />
          </div>
          <span className="pill pill-ghost" style={{ color: "var(--text-muted)" }}>{card.tag}</span>
        </div>
        <h3 style={{ fontSize: 20, lineHeight: 1.15, marginBottom: 8 }}>{card.title}</h3>
        <p style={{ color: "var(--text-muted)", fontSize: 13.5, lineHeight: 1.55 }}>{card.text}</p>
      </article>
    </Link>
  );
}

export default function StoriesHub() {
  return (
    <main style={{ minHeight: "100vh", padding: "28px 18px 150px", color: "var(--text)" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <section className="card-glow fade-up" style={{ position: "relative", padding: "34px clamp(20px, 5vw, 48px)", overflow: "hidden", marginBottom: 24 }}>
          <div aria-hidden style={{ position: "absolute", top: -120, right: -90, width: 330, height: 330, borderRadius: "50%", background: `radial-gradient(circle, ${ACCENT}35, transparent 68%)`, filter: "blur(28px)" }} />
          <div style={{ position: "relative", display: "grid", gridTemplateColumns: "minmax(0, 1.2fr) minmax(260px, .8fr)", gap: 28, alignItems: "center" }}>
            <div>
              <div className="pill" style={{ color: ACCENT, background: `${ACCENT}18`, border: `1px solid ${ACCENT}55`, marginBottom: 16 }}>Pillar 03 · Community & Mentorship</div>
              <h1 style={{ fontSize: "clamp(34px, 6vw, 64px)", lineHeight: .98, marginBottom: 16 }}>You heal stronger when you are connected.</h1>
              <p style={{ maxWidth: 680, color: "var(--text-muted)", fontSize: 17, lineHeight: 1.65 }}>
                A safe social recovery ecosystem for breakthroughs, mentorship, peer groups, veteran spaces, real stories, and live support events — built to feel human, hopeful, and protected.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 24 }}>
                <Link to="/SubmitAhHa" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 9, textDecoration: "none" }}><Camera style={{ width: 18 }} /> Share a Moment</Link>
                <Link to="/AhHaCommunity" className="btn-ghost" style={{ display: "inline-flex", alignItems: "center", gap: 9, textDecoration: "none" }}><Waves style={{ width: 18 }} /> Explore Community</Link>
              </div>
            </div>
            <div className="card-soft" style={{ padding: 18 }}>
              <p className="section-label" style={{ marginTop: 0 }}>Community Pulse</p>
              <div style={{ display: "grid", gap: 12 }}>
                {["Safe sharing", "Mentorship", "Peer circles", "Live support"].map((label, i) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, borderRadius: 16, background: "rgba(255,255,255,0.045)", border: "1px solid var(--border)" }}>
                    <div style={{ width: 9, height: 9, borderRadius: "50%", background: i % 2 ? "var(--green)" : ACCENT, boxShadow: `0 0 16px ${i % 2 ? "var(--green)" : ACCENT}` }} />
                    <span style={{ fontWeight: 800 }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 340px", gap: 22 }}>
          <section>
            <p className="section-label">Connection Ecosystem</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(245px, 1fr))", gap: 14 }}>
              {ecosystemCards.map((card, index) => <EcosystemCard key={card.title} card={card} index={index} />)}
            </div>
          </section>

          <aside style={{ display: "grid", gap: 14, alignContent: "start" }}>
            <div className="card" style={{ padding: 18 }}>
              <p className="section-label" style={{ marginTop: 0 }}>Live Activity</p>
              <div style={{ display: "grid", gap: 12 }}>
                {feedItems.map(item => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} style={{ display: "flex", gap: 12 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", background: `${ACCENT}16`, color: ACCENT, border: `1px solid ${ACCENT}44`, flexShrink: 0 }}><Icon style={{ width: 18 }} /></div>
                      <div>
                        <p style={{ fontWeight: 900, fontSize: 13.5 }}>{item.title}</p>
                        <p style={{ color: "var(--text-muted)", fontSize: 12.5, lineHeight: 1.45 }}>{item.text}</p>
                        <p style={{ color: "var(--text-dim)", fontSize: 11, marginTop: 4 }}>{item.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card-glow" style={{ padding: 20, background: `linear-gradient(145deg, ${ACCENT}18, rgba(255,255,255,0.035))` }}>
              <Mic2 style={{ width: 28, height: 28, color: ACCENT, marginBottom: 12 }} />
              <h3 style={{ fontSize: 22, marginBottom: 8 }}>Your voice can become someone’s lifeline.</h3>
              <p style={{ color: "var(--text-muted)", fontSize: 13.5, lineHeight: 1.55, marginBottom: 16 }}>Share only what feels safe. Every story can be private, reviewed, or posted anonymously.</p>
              <Link to="/SubmitAhHa" className="btn-primary" style={{ width: "100%", justifyContent: "center", display: "inline-flex", alignItems: "center", textDecoration: "none" }}>Record Your Moment</Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}