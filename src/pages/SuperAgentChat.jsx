import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { SA_COLORS as C } from "@/lib/superAgentConfig";
import { generateSuperAgentResponse, generateSuperAgentPlan } from "@/lib/superAgentAI";
import SAComposer from "@/components/superagent/SAComposer";
import SAResponseCard from "@/components/superagent/SAResponseCard";
import SAStarterPrompts from "@/components/superagent/SAStarterPrompts";

export default function SuperAgentChat() {
  const navigate = useNavigate();
  const location = useLocation();
  const qc = useQueryClient();

  const params = new URLSearchParams(location.search);
  const initialMode = params.get("mode"); // "voice" | "text" | null
  const loadId = params.get("id");

  const [mode, setMode] = useState(initialMode || null);
  const [thinking, setThinking] = useState(false);
  const [conversation, setConversation] = useState(null); // saved record OR draft
  const [savedConvId, setSavedConvId] = useState(null);
  const [busyKey, setBusyKey] = useState(null);
  const [savedKey, setSavedKey] = useState(null);
  const [followUps, setFollowUps] = useState([]);

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  // Load existing conversation if ?id=
  useEffect(() => {
    (async () => {
      if (!loadId) return;
      const list = await base44.entities.SuperAgentConversation.filter({ id: loadId });
      const conv = list?.[0];
      if (conv) {
        setConversation(conv);
        setSavedConvId(conv.id);
        setFollowUps(conv.follow_ups || []);
      }
    })();
  }, [loadId]);

  const submit = async (input, inputType) => {
    if (!user?.email) return;
    setThinking(true);
    const result = await generateSuperAgentResponse({ userInput: input });
    const draft = {
      user_email: user.email,
      user_message: input,
      input_type: inputType,
      ai_response: result.response,
      ai_summary: result.summary,
      category: result.category,
      suggested_next_steps: result.suggested_next_steps,
      suggested_resources: result.suggested_resources,
      is_crisis: result.is_crisis,
      conversation_title: result.summary?.slice(0, 80) || input.slice(0, 80),
      follow_ups: [],
    };
    setConversation(draft);
    setSavedConvId(null);
    setSavedKey(null);
    setFollowUps([]);
    setThinking(false);
  };

  const ensureSaved = async () => {
    if (savedConvId) return savedConvId;
    const created = await base44.entities.SuperAgentConversation.create({
      ...conversation,
      saved_to_profile: true,
    });
    setSavedConvId(created.id);
    qc.invalidateQueries({ queryKey: ["sa-conversations"] });
    return created.id;
  };

  const handleQuickAction = async (key) => {
    if (!conversation) return;
    setBusyKey(key);

    try {
      if (key === "save") {
        await ensureSaved();
        setSavedKey("save");
      }

      else if (key === "goal") {
        const id = await ensureSaved();
        await base44.entities.Goal.create({
          title: conversation.ai_summary || conversation.user_message.slice(0, 80),
          description: conversation.suggested_next_steps?.join("\n") || "",
          category: "personal_growth",
          status: "active",
        });
        await base44.entities.SuperAgentInsight.create({
          user_email: user.email,
          insight_title: "Goal created",
          insight_text: conversation.ai_summary || conversation.user_message.slice(0, 120),
          category: conversation.category,
          source_conversation_id: id,
        });
        setSavedKey("goal");
      }

      else if (key === "reminder") {
        const id = await ensureSaved();
        await base44.entities.SuperAgentInsight.create({
          user_email: user.email,
          insight_title: "Reminder",
          insight_text: conversation.suggested_next_steps?.[0] || conversation.ai_summary || conversation.user_message.slice(0, 120),
          category: conversation.category,
          source_conversation_id: id,
          is_pinned: true,
        });
        setSavedKey("reminder");
      }

      else if (key === "resources") {
        // Smart-route by category
        const routes = {
          veteran_support: "/VeteranSupportHub",
          recovery_support: "/RecoveryHub",
          housing_help: "/NJHousingSearch",
          food_help: "/RecoveryMapFinder",
          job_search: "/EmploymentOpportunities",
          mental_wellness: "/MentalReset",
          fitness_nutrition: "/MindBodyRecovery",
          emergency_planning: "/MySafetyPlan",
        };
        const dest = routes[conversation.category] || "/RecoveryMapFinder";
        navigate(dest);
        return;
      }

      else if (key === "plan_7" || key === "plan_90") {
        const planType = key === "plan_7" ? "7_day" : "90_day";
        const id = await ensureSaved();
        const plan = await generateSuperAgentPlan({
          context: `${conversation.user_message}\n\nGuidance: ${conversation.ai_response}`,
          planType,
        });
        await base44.entities.SuperAgentPlan.create({
          user_email: user.email,
          plan_type: planType,
          plan_title: plan.plan_title,
          plan_summary: plan.plan_summary,
          action_steps: plan.action_steps,
          source_conversation_id: id,
          category: conversation.category,
          started_at: new Date().toISOString().split("T")[0],
        });
        qc.invalidateQueries({ queryKey: ["sa-plans"] });
        setSavedKey(key);
      }

      else if (key === "share_counselor" || key === "share_sponsor" || key === "share_po") {
        await ensureSaved();
        const label = key === "share_counselor" ? "counselor"
          : key === "share_sponsor" ? "sponsor" : "probation officer";
        const text = `From my SuperAgent conversation:\n\n"${conversation.user_message}"\n\n${conversation.ai_response}`;
        if (navigator.share) {
          await navigator.share({ title: `Share with ${label}`, text });
        } else {
          await navigator.clipboard?.writeText(text);
          alert(`Copied — paste it to your ${label}.`);
        }
        setSavedKey(key);
      }

      else if (key === "ah_ha") {
        await ensureSaved();
        navigate("/SubmitAhHa");
        return;
      }
    } finally {
      setBusyKey(null);
    }
  };

  const handleStarter = (text) => submit(text, "text");

  const reset = () => {
    setConversation(null);
    setSavedConvId(null);
    setSavedKey(null);
    setFollowUps([]);
    setMode(null);
  };

  return (
    <div style={{ background: C.cream, minHeight: "100vh", paddingBottom: 120 }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>

        {/* Header */}
        <div style={{
          padding: "44px 20px 18px", background: "#fff", borderBottom: `1px solid ${C.border}`,
        }}>
          <button onClick={() => conversation ? reset() : navigate("/SuperAgent")} style={{
            background: "transparent", border: "none", padding: 0, cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: 6,
            color: C.muted, fontSize: 13, fontWeight: 600, marginBottom: 12,
          }}>
            <ArrowLeft style={{ width: 15, height: 15 }} /> {conversation ? "New question" : "SuperAgent"}
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Sparkles style={{ width: 18, height: 18, color: C.gold }} strokeWidth={2.2} />
            <h1 style={{
              fontFamily: "'Lora', Georgia, serif", fontSize: 22, fontWeight: 700,
              color: C.text, lineHeight: 1.2,
            }}>
              SuperAgent
            </h1>
          </div>
        </div>

        <div style={{ padding: "18px 16px", display: "flex", flexDirection: "column", gap: 16 }}>

          {!conversation && !thinking && (
            <>
              <SAComposer onSubmit={submit} thinking={thinking} mode={mode} setMode={setMode} />
              {!mode && <SAStarterPrompts onPick={handleStarter} />}
            </>
          )}

          {thinking && (
            <div style={{
              background: "#fff", border: `1px solid ${C.border}`, borderRadius: 22,
              padding: "32px 22px", textAlign: "center",
            }}>
              <Loader2 className="animate-spin" style={{ width: 26, height: 26, color: C.gold, margin: "0 auto 12px" }} />
              <p style={{ fontSize: 14, color: C.text, fontWeight: 600 }}>Thinking it through…</p>
              <p style={{ fontSize: 12, color: C.dim, lineHeight: 1.6, marginTop: 4 }}>
                Looking for the clearest path forward.
              </p>
            </div>
          )}

          {conversation && !thinking && (
            <SAResponseCard
              userMessage={conversation.user_message}
              response={conversation.ai_response}
              summary={conversation.ai_summary}
              category={conversation.category}
              nextSteps={conversation.suggested_next_steps || []}
              resources={conversation.suggested_resources || []}
              isCrisis={conversation.is_crisis}
              onQuickAction={handleQuickAction}
              busyKey={busyKey}
              savedKey={savedKey}
              followUps={followUps}
            />
          )}
        </div>
      </div>
    </div>
  );
}