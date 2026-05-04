import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, History, Sparkles, Bookmark } from "lucide-react";
import { SA_COLORS as C } from "@/lib/superAgentConfig";
import SAConversationCard from "@/components/superagent/SAConversationCard";
import SAPlanCard from "@/components/superagent/SAPlanCard";
import SAPlanModal from "@/components/superagent/SAPlanModal";

export default function SuperAgent() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [openPlan, setOpenPlan] = React.useState(null);

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: conversations = [] } = useQuery({
    queryKey: ["sa-conversations", user?.email],
    queryFn: () => base44.entities.SuperAgentConversation.filter(
      { user_email: user.email }, "-created_date", 8
    ),
    enabled: !!user?.email,
  });

  const { data: plans = [] } = useQuery({
    queryKey: ["sa-plans", user?.email],
    queryFn: () => base44.entities.SuperAgentPlan.filter(
      { user_email: user.email, status: "active" }, "-created_date", 6
    ),
    enabled: !!user?.email,
  });

  const { data: insights = [] } = useQuery({
    queryKey: ["sa-insights", user?.email],
    queryFn: () => base44.entities.SuperAgentInsight.filter(
      { user_email: user.email }, "-created_date", 6
    ),
    enabled: !!user?.email,
  });

  const togglePlanStep = useMutation({
    mutationFn: async ({ planId, stepIndex, steps }) => {
      const updated = steps.map((s, i) => i === stepIndex
        ? { ...s, completed: !s.completed, completed_at: !s.completed ? new Date().toISOString() : null }
        : s);
      return base44.entities.SuperAgentPlan.update(planId, { action_steps: updated });
    },
    onSuccess: (data, vars) => {
      qc.invalidateQueries({ queryKey: ["sa-plans"] });
      // Refresh open plan view
      const fresh = data;
      if (openPlan?.id === vars.planId) setOpenPlan(fresh);
    },
  });

  const deletePlan = useMutation({
    mutationFn: (id) => base44.entities.SuperAgentPlan.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sa-plans"] }); setOpenPlan(null); },
  });

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

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: `linear-gradient(135deg, ${C.navy} 0%, #1A2E5C 100%)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(15,30,61,0.20)",
            }}>
              <Sparkles style={{ width: 20, height: 20, color: C.gold }} strokeWidth={2.2} />
            </div>
            <div>
              <p style={{ fontSize: 10.5, fontWeight: 800, color: C.gold,
                textTransform: "uppercase", letterSpacing: ".14em" }}>Re-siliant SuperAgent</p>
              <p style={{ fontSize: 12, color: C.dim }}>Your support guide & planner</p>
            </div>
          </div>

          <h1 style={{
            fontFamily: "'Lora', Georgia, serif", fontSize: 28, fontWeight: 700,
            color: C.text, lineHeight: 1.15, marginTop: 14, marginBottom: 6,
          }}>
            What do you need help <span style={{ color: C.navy }}>figuring out</span> today?
          </h1>
          <p style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.6 }}>
            Talk it out or write it out. I'll help you find clear next steps.
          </p>
        </div>

        <div style={{ padding: "18px 16px", display: "flex", flexDirection: "column", gap: 22 }}>

          {/* Big CTAs */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Link to="/SuperAgentChat?mode=voice" style={{ textDecoration: "none" }}>
              <div style={{
                background: C.navy, borderRadius: 22, padding: "24px 18px",
                color: "#fff", display: "flex", flexDirection: "column",
                alignItems: "center", gap: 10, boxShadow: "0 6px 20px rgba(15,30,61,0.20)",
                fontFamily: "'DM Sans', sans-serif",
              }}>
                <div style={{
                  width: 50, height: 50, borderRadius: "50%", background: "rgba(200,147,47,0.20)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
                }}>🎙️</div>
                <p style={{ fontSize: 15, fontWeight: 700 }}>Talk to SuperAgent</p>
                <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.7)", textAlign: "center", lineHeight: 1.5 }}>
                  Speak freely
                </p>
              </div>
            </Link>
            <Link to="/SuperAgentChat?mode=text" style={{ textDecoration: "none" }}>
              <div style={{
                background: "#fff", border: `1px solid ${C.border}`,
                borderRadius: 22, padding: "24px 18px",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
                boxShadow: "0 4px 16px rgba(15,30,61,0.06)",
                fontFamily: "'DM Sans', sans-serif",
              }}>
                <div style={{
                  width: 50, height: 50, borderRadius: "50%", background: "rgba(15,30,61,0.07)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
                }}>✏️</div>
                <p style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Write to SuperAgent</p>
                <p style={{ fontSize: 11.5, color: C.dim, textAlign: "center", lineHeight: 1.5 }}>
                  Type your question
                </p>
              </div>
            </Link>
          </div>

          {/* Recent conversations */}
          <Section
            title="Recent conversations"
            actionLabel={conversations.length ? "View all" : null}
            actionTo="/SuperAgentHistory"
            actionIcon={<History style={{ width: 13, height: 13 }} />}
          >
            {conversations.length === 0 ? (
              <Empty text="Your conversations will show up here." />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {conversations.slice(0, 4).map(c => (
                  <SAConversationCard key={c.id} conv={c}
                    onClick={() => navigate(`/SuperAgentChat?id=${c.id}`)} />
                ))}
              </div>
            )}
          </Section>

          {/* Active plans */}
          <Section title="My plans">
            {plans.length === 0 ? (
              <Empty text="No active plans yet. Ask SuperAgent to build one." />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {plans.map(p => (
                  <SAPlanCard key={p.id} plan={p} onClick={() => setOpenPlan(p)} />
                ))}
              </div>
            )}
          </Section>

          {/* Saved insights */}
          <Section title="Saved to my profile">
            {insights.length === 0 ? (
              <Empty text="Save anything helpful from a conversation to keep it here." />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {insights.map(i => (
                  <div key={i.id} style={{
                    background: "#fff", border: `1px solid ${C.border}`, borderRadius: 14,
                    padding: "12px 14px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <Bookmark style={{ width: 12, height: 12, color: C.gold }} fill={C.gold} />
                      <p style={{ fontSize: 11, color: C.dim }}>
                        {new Date(i.created_date).toLocaleDateString([], { month: "short", day: "numeric" })}
                      </p>
                    </div>
                    {i.insight_title && (
                      <p style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 3 }}>
                        {i.insight_title}
                      </p>
                    )}
                    <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.55 }}>{i.insight_text}</p>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Disclaimer */}
          <p style={{ textAlign: "center", fontSize: 11, color: C.dim, lineHeight: 1.7, padding: "8px 12px 0" }}>
            SuperAgent is a support tool, not a doctor, therapist, counselor, sponsor, attorney, or emergency service.<br />
            In an emergency, call 911 or 988.
          </p>
        </div>
      </div>

      {openPlan && (
        <SAPlanModal
          plan={openPlan}
          onClose={() => setOpenPlan(null)}
          onToggleStep={(idx) => togglePlanStep.mutate({
            planId: openPlan.id, stepIndex: idx, steps: openPlan.action_steps,
          })}
          onDelete={() => { if (confirm("Delete this plan?")) deletePlan.mutate(openPlan.id); }}
        />
      )}
    </div>
  );
}

function Section({ title, children, actionLabel, actionTo, actionIcon }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <p style={{ fontSize: 10.5, fontWeight: 800, color: C.dim,
          textTransform: "uppercase", letterSpacing: ".12em" }}>{title}</p>
        {actionLabel && (
          <Link to={actionTo} style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            fontSize: 12, fontWeight: 700, color: C.navy, textDecoration: "none",
          }}>
            {actionIcon} {actionLabel}
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

function Empty({ text }) {
  return (
    <div style={{
      background: "#fff", border: `1px dashed ${C.border}`, borderRadius: 14,
      padding: "16px 18px", textAlign: "center",
    }}>
      <p style={{ fontSize: 12.5, color: C.dim, lineHeight: 1.55 }}>{text}</p>
    </div>
  );
}