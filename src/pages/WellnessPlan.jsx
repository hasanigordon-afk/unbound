import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle, Apple, Dumbbell, Calendar } from "lucide-react";
import { WP_COLORS as C, WP_PLAN_TYPES, ALKALINE_FOODS, FOODS_TO_REDUCE } from "@/lib/wellnessConfig";
import WPPlanCard from "@/components/wellness/WPPlanCard";

export default function WellnessPlan() {
  const navigate = useNavigate();

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: plans = [] } = useQuery({
    queryKey: ["wellness-plans", user?.email],
    queryFn: () => base44.entities.WellnessPlan.filter(
      { user_email: user.email }, "-created_date", 20
    ),
    enabled: !!user?.email,
  });

  const activePlans   = plans.filter(p => p.status === "active");
  const archivedPlans = plans.filter(p => p.status !== "active");

  return (
    <div style={{ background: C.cream, minHeight: "100vh", paddingBottom: 130 }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>

        {/* Header */}
        <div style={{
          padding: "44px 20px 24px",
          background: `linear-gradient(180deg, #fff 0%, ${C.cream} 100%)`,
          borderBottom: `1px solid ${C.border}`,
        }}>
          <button onClick={() => navigate("/")} style={{
            background: "transparent", border: "none", padding: 0, cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: 6,
            color: C.muted, fontSize: 13, fontWeight: 600, marginBottom: 14,
          }}>
            <ArrowLeft style={{ width: 15, height: 15 }} /> Home
          </button>

          <p style={{ fontSize: 10.5, fontWeight: 800, color: C.gold,
            textTransform: "uppercase", letterSpacing: ".14em", marginBottom: 6 }}>
            Alkaline Fuel & Fitness
          </p>

          <h1 style={{
            fontFamily: "'Lora', Georgia, serif", fontSize: 28, fontWeight: 700,
            color: C.text, lineHeight: 1.15, marginBottom: 8,
          }}>
            Build Your Body. Clear Your Mind.<br />
            <span style={{ color: C.navy }}>Reclaim Your Discipline.</span>
          </h1>
          <p style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.6 }}>
            Create a simple food and fitness plan designed to help you rebuild energy,
            structure, and confidence — one day at a time.
          </p>
        </div>

        <div style={{ padding: "18px 16px", display: "flex", flexDirection: "column", gap: 22 }}>

          {/* CTA buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {WP_PLAN_TYPES.map(pt => {
              const Icon = pt.icon;
              const isFeatured = pt.key === "full_90";
              return (
                <Link key={pt.key} to={`/WellnessPlanBuilder?type=${pt.key}`} style={{ textDecoration: "none" }}>
                  <div style={{
                    background: isFeatured
                      ? "linear-gradient(135deg, #0F1E3D 0%, #1A2E5C 100%)"
                      : "#fff",
                    border: `1px solid ${isFeatured ? "rgba(200,147,47,0.32)" : C.border}`,
                    borderRadius: 18, padding: "18px 18px",
                    display: "flex", alignItems: "center", gap: 14,
                    boxShadow: isFeatured
                      ? "0 6px 20px rgba(15,30,61,0.20)"
                      : "0 2px 10px rgba(15,30,61,0.05)",
                  }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                      background: isFeatured ? "rgba(200,147,47,0.20)" : C.gold + "1A",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Icon style={{ width: 20, height: 20, color: C.gold }} strokeWidth={2.2} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 15, fontWeight: 700,
                        color: isFeatured ? "#fff" : C.text, marginBottom: 2 }}>
                        {pt.cta}
                      </p>
                      <p style={{ fontSize: 12.5,
                        color: isFeatured ? "rgba(255,255,255,0.7)" : C.dim }}>
                        {pt.desc}
                      </p>
                    </div>
                    <span style={{
                      color: isFeatured ? C.gold : C.muted, fontSize: 18, fontWeight: 800,
                    }}>›</span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Active plans */}
          {activePlans.length > 0 && (
            <div>
              <p style={{ fontSize: 10.5, fontWeight: 800, color: C.dim,
                textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 10 }}>
                My active plans
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {activePlans.map(p => (
                  <WPPlanCard key={p.id} plan={p}
                    onClick={() => navigate(`/WellnessPlanView?id=${p.id}`)} />
                ))}
              </div>
            </div>
          )}

          {/* Archived */}
          {archivedPlans.length > 0 && (
            <div>
              <p style={{ fontSize: 10.5, fontWeight: 800, color: C.dim,
                textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 10 }}>
                Past plans
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {archivedPlans.map(p => (
                  <WPPlanCard key={p.id} plan={p}
                    onClick={() => navigate(`/WellnessPlanView?id=${p.id}`)} />
                ))}
              </div>
            </div>
          )}

          {/* Reference cards */}
          <div>
            <p style={{ fontSize: 10.5, fontWeight: 800, color: C.dim,
              textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 10 }}>
              Eat clean
            </p>
            <div style={{
              background: "#fff", border: `1px solid ${C.border}`, borderRadius: 16, padding: "16px",
              marginBottom: 10,
            }}>
              <p style={{ fontSize: 11, fontWeight: 800, color: C.green,
                textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 8 }}>
                Alkaline-style foods
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {ALKALINE_FOODS.map(f => (
                  <span key={f} style={chip}>{f}</span>
                ))}
              </div>
            </div>
            <div style={{
              background: "#fff", border: `1px solid ${C.border}`, borderRadius: 16, padding: "16px",
            }}>
              <p style={{ fontSize: 11, fontWeight: 800, color: C.red,
                textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 8 }}>
                Foods to reduce
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {FOODS_TO_REDUCE.map(f => (
                  <span key={f} style={chip}>{f}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div style={{
            background: "rgba(200,147,47,0.08)",
            border: `1px solid ${C.gold}33`,
            borderRadius: 14, padding: "12px 14px",
            display: "flex", alignItems: "flex-start", gap: 10,
          }}>
            <AlertTriangle style={{ width: 14, height: 14, color: C.gold, flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: 11.5, color: C.muted, lineHeight: 1.6 }}>
              Alkaline-style eating is presented as a clean-eating, wellness approach — not a cure
              for addiction, disease, mental health conditions, or medical problems. Talk with a
              doctor, nutritionist, or healthcare professional before major diet or exercise
              changes, especially with medical conditions, injuries, or medication.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const chip = {
  fontSize: 12, color: C.text,
  background: C.cream, border: `1px solid ${C.border}`,
  padding: "4px 10px", borderRadius: 999, fontWeight: 600,
};