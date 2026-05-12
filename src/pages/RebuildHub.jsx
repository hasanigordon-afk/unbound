import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  BookOpen,
  Briefcase,
  Bus,
  Filter,
  GraduationCap,
  Hammer,
  HeartPulse,
  Home,
  MapPin,
  Navigation,
  Phone,
  Scale,
  Search,
  Shield,
  Star,
  UtensilsCrossed,
  Users,
} from "lucide-react";

const ACCENT = "var(--gold)";

const categories = [
  { key: "housing", label: "Housing", icon: Home, to: "/NJHousingSearch", color: "#A78BFA", terms: "shelter transitional housing emergency beds sober living" },
  { key: "food", label: "Food", icon: UtensilsCrossed, to: "/FindHelpNow?category=Food%20Pantry", color: "#34D399", terms: "food pantry meals soup kitchen groceries snap" },
  { key: "transportation", label: "Transportation", icon: Bus, to: "/FindHelpNow?category=Transportation", color: "#60A5FA", terms: "bus rides transportation appointments travel" },
  { key: "employment", label: "Employment", icon: Briefcase, to: "/FindHelpNow?category=Employment%20Assistance", color: "#F0B753", terms: "jobs employment second chance hiring resume" },
  { key: "staffing", label: "Staffing", icon: Users, to: "/EachOneTeachOne", color: "#F59E0B", terms: "staffing agencies mentorship work placement" },
  { key: "education", label: "Education", icon: GraduationCap, to: "/LearnRecovery", color: "#22D3EE", terms: "school ged training certificate college learning" },
  { key: "legal", label: "Legal", icon: Scale, to: "/FindHelpNow?category=Legal", color: "#818CF8", terms: "legal aid court id documents expungement" },
  { key: "veterans", label: "Veterans", icon: Shield, to: "/VeteranSupportHub", color: "#34D399", terms: "veteran va benefits military housing jobs" },
  { key: "mental", label: "Mental Health", icon: HeartPulse, to: "/FindHelpNow?category=Mental%20Health", color: "#F472B6", terms: "therapy crisis counseling medicaid treatment" },
];

const quickTools = [
  { label: "Call 988", href: "tel:988", icon: Phone, tone: "danger" },
  { label: "Text HOME", href: "sms:741741", icon: AlertTriangle, tone: "danger" },
  { label: "Open Resource Map", href: "/VeteranResourceMap", icon: MapPin },
  { label: "Saved Resources", href: "/SavedResources", icon: Star },
];

function CategoryCard({ item }) {
  const Icon = item.icon;
  return (
    <Link to={item.to} style={{ textDecoration: "none" }}>
      <div className="fade-up" style={{
        minHeight: 150,
        padding: 16,
        borderRadius: 22,
        background: "linear-gradient(145deg, rgba(255,255,255,0.07), rgba(255,255,255,0.025))",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-card)",
        position: "relative",
        overflow: "hidden",
      }}>
        <div aria-hidden style={{ position: "absolute", right: -35, bottom: -40, width: 120, height: 120, borderRadius: "50%", background: `radial-gradient(circle, ${item.color}33, transparent 70%)`, filter: "blur(16px)" }} />
        <div style={{ width: 46, height: 46, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", color: item.color, background: "var(--surface)", border: `1px solid ${item.color}66`, marginBottom: 14, position: "relative" }}>
          <Icon style={{ width: 21, height: 21 }} />
        </div>
        <h3 style={{ fontSize: 18, marginBottom: 6, position: "relative" }}>{item.label}</h3>
        <p style={{ color: "var(--text-muted)", fontSize: 12.5, lineHeight: 1.45, position: "relative" }}>Tap to find help, directions, phone numbers, and next steps.</p>
      </div>
    </Link>
  );
}

export default function RebuildHub() {
  const [search, setSearch] = useState("");
  const [active, setActive] = useState("all");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return categories.filter(c => {
      const categoryMatch = active === "all" || c.key === active;
      const searchMatch = !q || `${c.label} ${c.terms}`.toLowerCase().includes(q);
      return categoryMatch && searchMatch;
    });
  }, [search, active]);

  return (
    <main style={{ minHeight: "100vh", padding: "28px 18px 150px", color: "var(--text)" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <section className="card-glow fade-up" style={{ padding: "32px clamp(20px, 5vw, 46px)", overflow: "hidden", position: "relative", marginBottom: 20 }}>
          <div aria-hidden style={{ position: "absolute", top: -110, right: -80, width: 320, height: 320, borderRadius: "50%", background: `radial-gradient(circle, ${ACCENT}30, transparent 68%)`, filter: "blur(28px)" }} />
          <div style={{ position: "relative", maxWidth: 760 }}>
            <div className="pill" style={{ background: "var(--gold-dim)", color: ACCENT, border: "1px solid var(--gold-border)", marginBottom: 16 }}><Hammer style={{ width: 13, marginRight: 6 }} /> Reentry & Resource Hub</div>
            <h1 style={{ fontSize: "clamp(34px, 6vw, 62px)", lineHeight: 1, marginBottom: 14 }}>Find the next right resource, fast.</h1>
            <p style={{ color: "var(--text-muted)", fontSize: 17, lineHeight: 1.65, maxWidth: 720 }}>
              Housing, food, transportation, work, legal help, veteran services, education, and mental health support — organized for moments when life feels urgent.
            </p>
          </div>
        </section>

        <section className="card" style={{ padding: 16, marginBottom: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center" }}>
            <label style={{ position: "relative", display: "block" }}>
              <Search style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 18, color: "var(--text-dim)" }} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search housing, food, jobs, legal help..." style={{ width: "100%", minHeight: 52, paddingLeft: 44, borderRadius: 999 }} />
            </label>
            <Link to="/VeteranResourceMap" className="btn-gold" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}><Navigation style={{ width: 17 }} /> Map</Link>
          </div>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingTop: 14 }}>
            <button onClick={() => setActive("all")} className={active === "all" ? "btn-gold" : "btn-ghost"} style={{ minHeight: 38, padding: "0 16px", whiteSpace: "nowrap" }}><Filter style={{ width: 14, marginRight: 6 }} /> All</button>
            {categories.map(c => <button key={c.key} onClick={() => setActive(c.key)} className={active === c.key ? "btn-gold" : "btn-ghost"} style={{ minHeight: 38, padding: "0 16px", whiteSpace: "nowrap" }}>{c.label}</button>)}
          </div>
        </section>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 330px", gap: 20 }}>
          <section>
            <p className="section-label">Searchable Resource Categories</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 14 }}>
              {filtered.map(item => <CategoryCard key={item.key} item={item} />)}
            </div>
          </section>

          <aside style={{ display: "grid", gap: 14, alignContent: "start" }}>
            <div className="card" style={{ padding: 18 }}>
              <p className="section-label" style={{ marginTop: 0, color: "var(--red)" }}>Emergency Quick Access</p>
              <div style={{ display: "grid", gap: 10 }}>
                {quickTools.map(tool => {
                  const Icon = tool.icon;
                  const isLink = tool.href.startsWith("/");
                  const Tag = isLink ? Link : "a";
                  return (
                    <Tag key={tool.label} to={isLink ? tool.href : undefined} href={!isLink ? tool.href : undefined} className={tool.tone === "danger" ? "btn-ghost" : "btn-ghost"} style={{ textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 9, borderColor: tool.tone === "danger" ? "rgba(248,113,113,.45)" : "var(--border)", color: tool.tone === "danger" ? "var(--red)" : "var(--text)" }}>
                      <Icon style={{ width: 17 }} /> {tool.label}
                    </Tag>
                  );
                })}
              </div>
            </div>

            <div className="card-glow" style={{ padding: 20, background: "linear-gradient(145deg, rgba(240,183,83,0.16), rgba(255,255,255,0.035))" }}>
              <MapPin style={{ width: 30, height: 30, color: ACCENT, marginBottom: 12 }} />
              <h3 style={{ fontSize: 22, marginBottom: 8 }}>Location-based help</h3>
              <p style={{ color: "var(--text-muted)", fontSize: 13.5, lineHeight: 1.55, marginBottom: 16 }}>Open the map to find nearby resources and get directions without digging through menus.</p>
              <Link to="/VeteranResourceMap" className="btn-gold" style={{ width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, textDecoration: "none" }}><MapPin style={{ width: 17 }} /> Open Map</Link>
            </div>

            <div className="card-soft" style={{ padding: 18 }}>
              <BookOpen style={{ width: 24, color: "var(--green)", marginBottom: 10 }} />
              <h3 style={{ fontSize: 18, marginBottom: 6 }}>Keep it simple</h3>
              <p style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.55 }}>Start with one need. Save what helps. Call before you travel when possible.</p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}