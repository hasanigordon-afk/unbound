import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ChevronLeft, CheckCircle, Plus, Trash2, Phone, Edit3, Shield } from "lucide-react";
import { toast } from "sonner";
import { WizardProgressBar, TagInput } from "@/components/safetyplan/WizardStep";
import CrisisAlertButton from "@/components/safetyplan/CrisisAlertButton";

// ── Suggestions ───────────────────────────────────────────────────────────
const TRIGGER_SUGGESTIONS = [
  "Being alone late at night", "Arguments with family", "Seeing old friends who use",
  "Financial stress", "Boredom / nothing to do", "Driving past old spots",
  "Physical pain", "Feeling rejected or criticized", "Certain music or smells",
  "Social events with alcohol", "Feeling overwhelmed at work", "Anger or frustration",
  "Loneliness", "Anniversaries of loss", "Stress at home",
];

const COPING_SUGGESTIONS = [
  "Call my sponsor or support person", "Go for a walk or run",
  "Deep breathing for 5 minutes", "Attend a meeting",
  "Journal what I'm feeling", "Listen to music that calms me",
  "Text someone from my safety plan", "Pray or meditate",
  "Leave the situation immediately", "Watch a favorite show",
  "Make tea and sit quietly", "Call 988", "Do push-ups until the urge passes",
  "Read recovery literature", "Play with my pet",
];

const SAFE_PLACE_SUGGESTIONS = [
  "The library", "A coffee shop", "My sponsor's house",
  "A church or place of worship", "A local park",
  "My counselor's office", "A family member's home",
  "A recovery community center", "The gym", "A bookstore",
];

const REASONS_SUGGESTIONS = [
  "My children", "My family", "My sobriety date and how far I've come",
  "My future goals", "My faith", "The people counting on me",
  "How hard I've worked to get here", "My health", "My freedom",
  "Showing others it's possible",
];

const RELATIONSHIP_OPTIONS = ["Sponsor", "Parent", "Sibling", "Friend", "Partner", "Counselor", "Pastor/Mentor", "Other"];

const STEPS = ["Welcome", "Warning Signs", "Coping Tools", "Safe Places", "Your Reasons", "Support Contacts", "Crisis Message", "Review"];

// ── Wizard Steps ─────────────────────────────────────────────────────────

function StepWelcome({ onNext }) {
  return (
    <div style={{ padding: "32px 20px" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{
          width: 80, height: 80, borderRadius: "50%",
          background: "linear-gradient(135deg,#EBF3FD,#F5F0FF)",
          border: "2px solid #C4B5FD",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px", fontSize: 36,
        }}>🛡️</div>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: "#1E1E1E", lineHeight: 1.3, marginBottom: 10 }}>
          My Safety Plan
        </h1>
        <p style={{ fontSize: 14, color: "#5A5A5A", lineHeight: 1.7, maxWidth: 320, margin: "0 auto" }}>
          A safety plan is your personal roadmap for getting through a crisis. It helps you act on what you already know works — before a moment of crisis makes thinking clearly harder.
        </p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
        {[
          { emoji: "⚠️", label: "Recognize your warning signs" },
          { emoji: "🧰", label: "Know your coping tools" },
          { emoji: "📞", label: "Have your support contacts ready" },
          { emoji: "🆘", label: "One-tap crisis alert to your people" },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "#F9FAFB", borderRadius: 12, border: "1px solid #E5E7EB" }}>
            <span style={{ fontSize: 20 }}>{item.emoji}</span>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{item.label}</p>
          </div>
        ))}
      </div>
      <div style={{ background: "#FFF9EC", border: "1px solid #FDE68A", borderRadius: 12, padding: "12px 14px", marginBottom: 24 }}>
        <p style={{ fontSize: 12, color: "#78350F", lineHeight: 1.6 }}>
          💛 This plan is just for you. Be honest — the more real you are, the more it will actually help when you need it most.
        </p>
      </div>
      <button
        onClick={onNext}
        style={{ width: "100%", padding: "15px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#4A90E2,#7C3AED)", color: "#fff", fontWeight: 800, fontSize: 16, cursor: "pointer" }}
      >
        Start Building My Plan →
      </button>
    </div>
  );
}

function StepTagList({ emoji, title, subtitle, items, onChange, placeholder, suggestions, color, tip }) {
  return (
    <div style={{ padding: "24px 20px" }}>
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 28, marginBottom: 8 }}>{emoji}</p>
        <h2 style={{ fontSize: 19, fontWeight: 800, color: "#1E1E1E", marginBottom: 6 }}>{title}</h2>
        <p style={{ fontSize: 13, color: "#5A5A5A", lineHeight: 1.6 }}>{subtitle}</p>
      </div>
      <TagInput items={items} onChange={onChange} placeholder={placeholder} color={color} suggestions={suggestions} />
      {tip && (
        <div style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 10, padding: "10px 12px", marginTop: 14 }}>
          <p style={{ fontSize: 11, color: "#6B7280", lineHeight: 1.5 }}>💡 {tip}</p>
        </div>
      )}
    </div>
  );
}

function StepContacts({ contacts, onChange }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", relationship: "", phone: "", notify_on_crisis: true });

  const save = () => {
    if (!form.name.trim() || !form.phone.trim()) return;
    onChange([...contacts, { ...form }]);
    setForm({ name: "", relationship: "", phone: "", notify_on_crisis: true });
    setAdding(false);
  };

  const remove = (i) => onChange(contacts.filter((_, j) => j !== i));
  const toggle = (i) => onChange(contacts.map((c, j) => j === i ? { ...c, notify_on_crisis: !c.notify_on_crisis } : c));

  return (
    <div style={{ padding: "24px 20px" }}>
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 28, marginBottom: 8 }}>📞</p>
        <h2 style={{ fontSize: 19, fontWeight: 800, color: "#1E1E1E", marginBottom: 6 }}>Support Contacts</h2>
        <p style={{ fontSize: 13, color: "#5A5A5A", lineHeight: 1.6 }}>
          Add 3–5 people you trust. You can mark who should be auto-notified when you hit the crisis alert button.
        </p>
      </div>

      {contacts.map((c, i) => (
        <div key={i} style={{
          background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 12,
          padding: "12px 14px", marginBottom: 8,
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
        }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#1E1E1E" }}>{c.name}</p>
            <p style={{ fontSize: 11, color: "#8E8E93" }}>{c.relationship} · {c.phone}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={() => toggle(i)}
              title="Toggle auto-alert on crisis"
              style={{
                padding: "4px 8px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 10, fontWeight: 700,
                background: c.notify_on_crisis ? "#FEF2F2" : "#F3F4F6",
                color: c.notify_on_crisis ? "#DC2626" : "#9CA3AF",
              }}
            >
              {c.notify_on_crisis ? "🆘 Alert" : "No alert"}
            </button>
            <button onClick={() => remove(i)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
              <Trash2 style={{ width: 14, height: 14, color: "#EF4444" }} />
            </button>
          </div>
        </div>
      ))}

      {adding ? (
        <div style={{ background: "#fff", border: "1px solid #D1D5DB", borderRadius: 12, padding: "14px", marginTop: 8 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#374151", display: "block", marginBottom: 4 }}>Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Marcus" style={{ width: "100%", padding: "9px 10px", borderRadius: 8, border: "1px solid #D1D5DB", fontSize: 12, outline: "none", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#374151", display: "block", marginBottom: 4 }}>Relationship</label>
              <select value={form.relationship} onChange={e => setForm(f => ({ ...f, relationship: e.target.value }))} style={{ width: "100%", padding: "9px 10px", borderRadius: 8, border: "1px solid #D1D5DB", fontSize: 12, outline: "none", background: "#fff" }}>
                <option value="">Select…</option>
                {RELATIONSHIP_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#374151", display: "block", marginBottom: 4 }}>Phone Number *</label>
            <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="(555) 555-5555" type="tel" style={{ width: "100%", padding: "9px 10px", borderRadius: 8, border: "1px solid #D1D5DB", fontSize: 12, outline: "none" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <input type="checkbox" id="auto-alert" checked={form.notify_on_crisis} onChange={e => setForm(f => ({ ...f, notify_on_crisis: e.target.checked }))} style={{ width: 16, height: 16 }} />
            <label htmlFor="auto-alert" style={{ fontSize: 12, color: "#374151", fontWeight: 600 }}>
              🆘 Auto-notify during crisis alert
            </label>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setAdding(false)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1px solid #E5E7EB", background: "#F9FAFB", color: "#374151", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Cancel</button>
            <button onClick={save} disabled={!form.name.trim() || !form.phone.trim()} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: (!form.name.trim() || !form.phone.trim()) ? "#E5E7EB" : "#4A90E2", color: (!form.name.trim() || !form.phone.trim()) ? "#9CA3AF" : "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
              Save Contact
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          style={{
            width: "100%", padding: "12px", borderRadius: 12, marginTop: 6,
            border: "2px dashed #D1D5DB", background: "transparent",
            color: "#4A90E2", fontWeight: 700, fontSize: 13, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}
        >
          <Plus style={{ width: 14, height: 14 }} /> Add Contact
        </button>
      )}

      <div style={{ background: "#EBF3FD", border: "1px solid #BFDBFE", borderRadius: 10, padding: "10px 12px", marginTop: 14 }}>
        <p style={{ fontSize: 11, color: "#1D4ED8", lineHeight: 1.5 }}>
          💡 Contacts marked "🆘 Alert" will receive an SMS message when you press the crisis alert button. The message opens in your phone's default SMS app — you control what gets sent.
        </p>
      </div>
    </div>
  );
}

function StepCrisisMessage({ message, onChange }) {
  return (
    <div style={{ padding: "24px 20px" }}>
      <p style={{ fontSize: 28, marginBottom: 8 }}>💬</p>
      <h2 style={{ fontSize: 19, fontWeight: 800, color: "#1E1E1E", marginBottom: 6 }}>Your Crisis Message</h2>
      <p style={{ fontSize: 13, color: "#5A5A5A", lineHeight: 1.6, marginBottom: 20 }}>
        Customize the message your contacts receive when you send a crisis alert. Keep it honest and direct.
      </p>
      <textarea
        value={message}
        onChange={e => onChange(e.target.value)}
        rows={5}
        placeholder="e.g. I am struggling right now and need support. Please call or text me as soon as you can."
        style={{
          width: "100%", padding: "12px", borderRadius: 12, border: "1px solid #D1D5DB",
          fontSize: 13, color: "#1E1E1E", lineHeight: 1.7, resize: "vertical",
          outline: "none", boxSizing: "border-box",
        }}
      />
      <div style={{ background: "#F9F5FF", border: "1px solid #E9D5FF", borderRadius: 10, padding: "10px 12px", marginTop: 12 }}>
        <p style={{ fontSize: 11, color: "#5B21B6", lineHeight: 1.5 }}>
          💜 You don't have to explain everything. A short honest message is more powerful than a long one.
        </p>
      </div>
    </div>
  );
}

function StepReview({ plan, onEdit }) {
  const sections = [
    { label: "⚠️ Warning Signs", items: plan.warning_signs, step: 1, color: "#F59E0B" },
    { label: "🧰 Coping Tools", items: plan.coping_strategies, step: 2, color: "#4A90E2" },
    { label: "🏡 Safe Places", items: plan.safe_environments, step: 3, color: "#10B981" },
    { label: "💚 Reasons to Stay", items: plan.reasons_to_live, step: 4, color: "#F97316" },
  ];
  return (
    <div style={{ padding: "24px 20px" }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 48, marginBottom: 10 }}>✅</div>
        <h2 style={{ fontSize: 20, fontWeight: 900, color: "#1E1E1E", marginBottom: 6 }}>Your plan is ready.</h2>
        <p style={{ fontSize: 13, color: "#5A5A5A", lineHeight: 1.6 }}>Review everything below. You can edit any section at any time.</p>
      </div>

      {sections.map(s => (
        <div key={s.step} style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, padding: "14px 16px", marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <p style={{ fontSize: 13, fontWeight: 800, color: "#1E1E1E" }}>{s.label}</p>
            <button onClick={() => onEdit(s.step)} style={{ background: "none", border: "none", cursor: "pointer", color: "#4A90E2", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}>
              <Edit3 style={{ width: 11, height: 11 }} /> Edit
            </button>
          </div>
          {s.items?.length > 0 ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {s.items.map((item, i) => (
                <span key={i} style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: s.color + "15", color: s.color, border: `1px solid ${s.color}30` }}>
                  {item}
                </span>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 11, color: "#9CA3AF" }}>Nothing added yet.</p>
          )}
        </div>
      ))}

      <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, padding: "14px 16px", marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <p style={{ fontSize: 13, fontWeight: 800, color: "#1E1E1E" }}>📞 Support Contacts</p>
          <button onClick={() => onEdit(5)} style={{ background: "none", border: "none", cursor: "pointer", color: "#4A90E2", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}>
            <Edit3 style={{ width: 11, height: 11 }} /> Edit
          </button>
        </div>
        {plan.support_contacts?.length > 0 ? (
          plan.support_contacts.map((c, i) => (
            <p key={i} style={{ fontSize: 12, color: "#374151", marginBottom: 3 }}>
              <strong>{c.name}</strong> · {c.relationship} · {c.phone}
              {c.notify_on_crisis && <span style={{ color: "#DC2626", marginLeft: 5 }}>🆘</span>}
            </p>
          ))
        ) : <p style={{ fontSize: 11, color: "#9CA3AF" }}>No contacts added yet.</p>}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function MySafetyPlan() {
  const queryClient = useQueryClient();
  const [wizardStep, setWizardStep] = useState(null); // null = view mode, number = wizard
  const [showCrisis, setShowCrisis] = useState(false);

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["safety-plan", user?.email],
    queryFn: () => base44.entities.SafetyPlan.filter({ owner_email: user.email }),
    enabled: !!user,
  });

  const existingPlan = plans[0] || null;

  const [draft, setDraft] = useState(null);
  const activePlan = draft || existingPlan || { owner_email: user?.email || "", warning_signs: [], coping_strategies: [], safe_environments: [], reasons_to_live: [], support_contacts: [], crisis_message: "", professional_contacts: [] };

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const payload = { ...data, owner_email: user.email, is_complete: true, last_reviewed: new Date().toISOString().split("T")[0] };
      if (existingPlan?.id) return base44.entities.SafetyPlan.update(existingPlan.id, payload);
      return base44.entities.SafetyPlan.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["safety-plan"]);
      setWizardStep(null);
      setDraft(null);
      toast.success("Safety plan saved! 🛡️");
    },
  });

  const set = (key, val) => setDraft(d => ({ ...(d || activePlan), [key]: val }));

  const startWizard = () => {
    setDraft({ ...activePlan });
    setWizardStep(0);
  };

  const handleNext = () => {
    if (wizardStep < STEPS.length - 1) setWizardStep(s => s + 1);
    else saveMutation.mutate(draft || activePlan);
  };

  const handleBack = () => {
    if (wizardStep > 0) setWizardStep(s => s - 1);
    else { setWizardStep(null); setDraft(null); }
  };

  // ── Wizard mode ──
  if (wizardStep !== null) {
    const plan = draft || activePlan;
    return (
      <div style={{ background: "#F7F7F8", minHeight: "100vh", paddingBottom: 100 }}>
        {wizardStep > 0 && (
          <WizardProgressBar step={wizardStep - 1} totalSteps={STEPS.length - 1} stepLabels={STEPS.slice(1)} />
        )}

        {wizardStep === 0 && <StepWelcome onNext={handleNext} />}
        {wizardStep === 1 && <StepTagList emoji="⚠️" title="Your Warning Signs" subtitle="What situations, feelings, or thoughts tell you that you're heading toward a crisis?" placeholder="Add a warning sign…" items={plan.warning_signs || []} onChange={v => set("warning_signs", v)} color="#F59E0B" suggestions={TRIGGER_SUGGESTIONS} tip="Think about what happened the last time you were in crisis. What were the early signs?" />}
        {wizardStep === 2 && <StepTagList emoji="🧰" title="Coping Strategies" subtitle="What can you do to calm yourself when you notice warning signs?" placeholder="Add a coping strategy…" items={plan.coping_strategies || []} onChange={v => set("coping_strategies", v)} color="#4A90E2" suggestions={COPING_SUGGESTIONS} tip="Pick things you've actually done before that helped. Not just things that sound good." />}
        {wizardStep === 3 && <StepTagList emoji="🏡" title="Safe Places" subtitle="Where can you go to feel safe, calm, or grounded?" placeholder="Add a safe place…" items={plan.safe_environments || []} onChange={v => set("safe_environments", v)} color="#10B981" suggestions={SAFE_PLACE_SUGGESTIONS} tip="This could be a physical place, a person's home, or even a car with good music." />}
        {wizardStep === 4 && <StepTagList emoji="💚" title="Reasons to Stay" subtitle="What keeps you going? Who or what do you want to be here for?" placeholder="Add a reason…" items={plan.reasons_to_live || []} onChange={v => set("reasons_to_live", v)} color="#F97316" suggestions={REASONS_SUGGESTIONS} tip="Be personal. The most powerful reasons are your own." />}
        {wizardStep === 5 && <StepContacts contacts={plan.support_contacts || []} onChange={v => set("support_contacts", v)} />}
        {wizardStep === 6 && <StepCrisisMessage message={plan.crisis_message || ""} onChange={v => set("crisis_message", v)} />}
        {wizardStep === 7 && <StepReview plan={plan} onEdit={s => setWizardStep(s)} />}

        {/* Nav buttons */}
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1px solid #E5E7EB", padding: "12px 20px", display: "flex", gap: 10, maxWidth: 540, margin: "0 auto" }}>
          {wizardStep > 0 && (
            <button onClick={handleBack} style={{ padding: "13px 20px", borderRadius: 12, border: "1px solid #E5E7EB", background: "#F9FAFB", color: "#374151", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
              ← Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={saveMutation.isPending}
            style={{
              flex: 1, padding: "13px", borderRadius: 12, border: "none",
              background: "linear-gradient(135deg,#4A90E2,#7C3AED)",
              color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer",
            }}
          >
            {saveMutation.isPending ? "Saving…" : wizardStep === STEPS.length - 1 ? "💾 Save My Plan" : "Continue →"}
          </button>
        </div>
      </div>
    );
  }

  // ── View mode ──
  const plan = existingPlan;
  const contactsWithPhone = plan?.support_contacts?.filter(c => c.phone) || [];

  return (
    <div style={{ background: "#F7F7F8", minHeight: "100vh", paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ background: "#1E1E2E", padding: "24px 16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Shield style={{ width: 22, height: 22, color: "#60A5FA" }} />
            <h1 style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>My Safety Plan</h1>
          </div>
          {plan && (
            <button
              onClick={startWizard}
              style={{ padding: "7px 12px", borderRadius: 8, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}
            >
              <Edit3 style={{ width: 11, height: 11 }} /> Edit
            </button>
          )}
        </div>
        {plan?.last_reviewed && (
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Last updated: {new Date(plan.last_reviewed).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
        )}
      </div>

      <div style={{ padding: "16px 16px 0" }}>

        {!plan ? (
          /* No plan yet */
          <div style={{ textAlign: "center", padding: "48px 20px", background: "#fff", borderRadius: 20, border: "1px solid #E5E7EB" }}>
            <p style={{ fontSize: 48, marginBottom: 12 }}>🛡️</p>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1E1E1E", marginBottom: 8 }}>You haven't built your safety plan yet</h2>
            <p style={{ fontSize: 13, color: "#5A5A5A", lineHeight: 1.7, marginBottom: 24 }}>
              It takes about 5 minutes. It could matter in a moment when 5 minutes feels impossible.
            </p>
            <button
              onClick={startWizard}
              style={{ padding: "14px 32px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#4A90E2,#7C3AED)", color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer" }}
            >
              Build My Safety Plan →
            </button>
          </div>
        ) : (
          <>
            {/* 🆘 Crisis Alert Button */}
            <button
              onClick={() => setShowCrisis(true)}
              style={{
                width: "100%", padding: "18px", borderRadius: 16, border: "none", cursor: "pointer",
                background: "linear-gradient(135deg,#7F1D1D,#DC2626)",
                boxShadow: "0 4px 20px rgba(220,38,38,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                marginBottom: 16,
              }}
            >
              <AlertTriangle style={{ width: 20, height: 20, color: "#fff" }} />
              <div style={{ textAlign: "left" }}>
                <p style={{ fontSize: 16, fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>I Need Help Right Now</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>Alert my contacts · Call 988 · Text 741741</p>
              </div>
            </button>

            {/* Plan sections */}
            {[
              { key: "warning_signs", label: "⚠️ My Warning Signs", color: "#F59E0B", empty: "No warning signs added." },
              { key: "coping_strategies", label: "🧰 My Coping Tools", color: "#4A90E2", empty: "No coping strategies added." },
              { key: "safe_environments", label: "🏡 My Safe Places", color: "#10B981", empty: "No safe places added." },
              { key: "reasons_to_live", label: "💚 My Reasons to Stay", color: "#F97316", empty: "No reasons added." },
            ].map(s => (
              <div key={s.key} style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 16, padding: "16px", marginBottom: 12 }}>
                <p style={{ fontSize: 13, fontWeight: 800, color: "#1E1E1E", marginBottom: 10 }}>{s.label}</p>
                {plan[s.key]?.length > 0 ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {plan[s.key].map((item, i) => (
                      <span key={i} style={{ padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: s.color + "15", color: s.color, border: `1px solid ${s.color}25` }}>
                        {item}
                      </span>
                    ))}
                  </div>
                ) : <p style={{ fontSize: 12, color: "#9CA3AF" }}>{s.empty}</p>}
              </div>
            ))}

            {/* Contacts */}
            <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 16, padding: "16px", marginBottom: 12 }}>
              <p style={{ fontSize: 13, fontWeight: 800, color: "#1E1E1E", marginBottom: 10 }}>📞 My Support Contacts</p>
              {plan.support_contacts?.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {plan.support_contacts.map((c, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: "#F9FAFB", borderRadius: 10 }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#1E1E1E" }}>{c.name}</p>
                        <p style={{ fontSize: 11, color: "#8E8E93" }}>{c.relationship}</p>
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        {c.notify_on_crisis && <span style={{ fontSize: 10, color: "#DC2626", fontWeight: 700 }}>🆘</span>}
                        <a href={`tel:${c.phone}`} style={{ width: 32, height: 32, borderRadius: 8, background: "#F0FDF4", border: "1px solid #86EFAC", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
                          <Phone style={{ width: 13, height: 13, color: "#16A34A" }} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p style={{ fontSize: 12, color: "#9CA3AF" }}>No contacts added yet.</p>}
            </div>

            {/* Crisis message preview */}
            {plan.crisis_message && (
              <div style={{ background: "#FFF1F2", border: "1px solid #FECDD3", borderRadius: 16, padding: "14px 16px", marginBottom: 12 }}>
                <p style={{ fontSize: 11, fontWeight: 800, color: "#9F1239", marginBottom: 4, textTransform: "uppercase", letterSpacing: ".06em" }}>My Crisis Message</p>
                <p style={{ fontSize: 12, color: "#BE123C", lineHeight: 1.6 }}>"{plan.crisis_message}"</p>
              </div>
            )}

            <button
              onClick={startWizard}
              style={{ width: "100%", padding: "13px", borderRadius: 12, border: "2px dashed #D1D5DB", background: "transparent", color: "#4A90E2", fontWeight: 700, fontSize: 13, cursor: "pointer", marginBottom: 8 }}
            >
              ✏️ Update My Safety Plan
            </button>
          </>
        )}
      </div>

      {showCrisis && (
        <CrisisAlertButton
          contacts={plan?.support_contacts || []}
          crisisMessage={plan?.crisis_message || ""}
          onClose={() => setShowCrisis(false)}
        />
      )}
    </div>
  );
}