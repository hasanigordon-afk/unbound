import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Heart, Plus, ChevronLeft, CheckCircle2, AlertCircle,
  Clock, ShieldCheck, Package, Eye, EyeOff, Loader2,
  Baby, ShoppingBag, Droplets, Home, BookOpen, Zap, Utensils, X
} from "lucide-react";

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  teal:    "#2DD4BF",
  emerald: "#10B981",
  amber:   "#F59E0B",
  red:     "#EF4444",
  indigo:  "#6366F1",
  purple:  "#8B5CF6",
  navy:    "#07090F",
  muted:   "rgba(241,245,249,0.4)",
  glass:   { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)" },
};

const CATEGORIES = [
  { id:"food",             label:"Food",             icon:Utensils, color:"#F59E0B", cap:100  },
  { id:"baby_child",       label:"Baby / Child",      icon:Baby,     color:"#F472B6", cap:125  },
  { id:"clothing",         label:"Clothing",          icon:ShoppingBag, color:C.indigo, cap:90 },
  { id:"hygiene",          label:"Hygiene",           icon:Droplets, color:C.teal,   cap:50   },
  { id:"household_basics", label:"Household Basics",  icon:Home,     color:C.emerald, cap:80  },
  { id:"school_essentials",label:"School Essentials", icon:BookOpen, color:C.purple, cap:100  },
  { id:"emergency_need",   label:"Emergency Need",    icon:Zap,      color:C.red,    cap:150  },
];

const URGENCY_CONFIG = {
  low:      { label:"Low",      color:"#94A3B8", bg:"rgba(148,163,184,0.12)" },
  moderate: { label:"Moderate", color:C.amber,   bg:"rgba(245,158,11,0.12)"  },
  high:     { label:"High",     color:"#F97316", bg:"rgba(249,115,22,0.12)"  },
  critical: { label:"Critical", color:C.red,     bg:"rgba(239,68,68,0.14)"   },
};

const STATUS_CONFIG = {
  submitted:      { label:"Submitted",      color:C.indigo },
  pending_review: { label:"Under Review",   color:C.amber  },
  approved:       { label:"Approved",       color:C.emerald},
  denied:         { label:"Not Approved",   color:C.red    },
  fulfilled:      { label:"Fulfilled ✓",    color:C.teal   },
  expired:        { label:"Expired",        color:"#94A3B8" },
};

function catFor(id) { return CATEGORIES.find(c => c.id === id) || CATEGORIES[0]; }

function timeAgo(dateStr) {
  const d = new Date(dateStr); const now = new Date();
  const m = Math.floor((now - d) / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ── Request Card ──────────────────────────────────────────────────────────────
function RequestCard({ req, onFulfill }) {
  const cat = catFor(req.category);
  const Icon = cat.icon;
  const urg = URGENCY_CONFIG[req.urgency] || URGENCY_CONFIG.moderate;

  return (
    <div style={{ ...C.glass, borderRadius:20, padding:"20px", marginBottom:12, position:"relative", overflow:"hidden" }}>
      {/* Category accent */}
      <div style={{ position:"absolute", top:0, left:0, width:4, height:"100%", background:cat.color, borderRadius:"4px 0 0 4px" }} />
      <div style={{ paddingLeft:8 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
          <div style={{ width:38, height:38, borderRadius:12, background:`${cat.color}18`,
            display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <Icon style={{ color:cat.color, width:18, height:18 }} />
          </div>
          <div style={{ flex:1 }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
              <span style={{ fontSize:11, fontWeight:700, color:cat.color, textTransform:"uppercase", letterSpacing:".06em" }}>{cat.label}</span>
              <span style={{ fontSize:10, padding:"2px 8px", borderRadius:20, background:urg.bg, color:urg.color, fontWeight:700 }}>{urg.label}</span>
              <span style={{ fontSize:10, padding:"2px 8px", borderRadius:20, background:"rgba(16,185,129,0.12)", color:C.emerald, fontWeight:700 }}>
                <ShieldCheck style={{ width:9, height:9, display:"inline", marginRight:3 }}/>Approved
              </span>
            </div>
            <p style={{ fontSize:10, color:C.muted, marginTop:2 }}>
              {req.display_name || "Community Member"} · {timeAgo(req.created_date)}
            </p>
          </div>
          <div style={{ textAlign:"right", flexShrink:0 }}>
            <p style={{ fontSize:22, fontWeight:900, color:"#fff", lineHeight:1 }}>
              ${req.approved_amount || req.estimated_total}
            </p>
            <p style={{ fontSize:10, color:C.muted, marginTop:2 }}>est. total</p>
          </div>
        </div>

        <p style={{ fontSize:15, fontWeight:700, color:"#fff", marginBottom:4 }}>{req.title}</p>
        <p style={{ fontSize:13, color:"rgba(241,245,249,0.55)", lineHeight:1.55, marginBottom:14 }}>
          {req.short_explanation}
        </p>

        {req.preferred_retailer && (
          <p style={{ fontSize:12, color:C.muted, marginBottom:12 }}>
            🏪 Preferred: <span style={{ color:"rgba(241,245,249,0.6)", fontWeight:600 }}>{req.preferred_retailer}</span>
          </p>
        )}

        <button
          onClick={() => onFulfill(req)}
          style={{
            width:"100%", padding:"13px", borderRadius:14, border:"none", cursor:"pointer",
            background:`linear-gradient(135deg,${C.teal},#22C5B0)`,
            color:"#07090F", fontWeight:800, fontSize:14,
            boxShadow:`0 6px 24px rgba(45,212,191,0.25)`,
          }}
        >
          💙 Cover This Cart — Anonymously
        </button>
      </div>
    </div>
  );
}

// ── My Request Card ───────────────────────────────────────────────────────────
function MyRequestCard({ req }) {
  const cat = catFor(req.category);
  const Icon = cat.icon;
  const status = STATUS_CONFIG[req.status] || STATUS_CONFIG.submitted;
  return (
    <div style={{ ...C.glass, borderRadius:18, padding:"16px 18px", marginBottom:10, display:"flex", gap:12, alignItems:"center" }}>
      <div style={{ width:40, height:40, borderRadius:12, background:`${cat.color}18`, flexShrink:0,
        display:"flex", alignItems:"center", justifyContent:"center" }}>
        <Icon style={{ color:cat.color, width:18, height:18 }} />
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ fontSize:14, fontWeight:700, color:"#fff", marginBottom:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{req.title}</p>
        <p style={{ fontSize:12, color:C.muted }}>{cat.label} · ${req.estimated_total}</p>
      </div>
      <div style={{ padding:"4px 12px", borderRadius:20, background:`${status.color}18`, flexShrink:0 }}>
        <p style={{ fontSize:11, fontWeight:700, color:status.color }}>{status.label}</p>
      </div>
    </div>
  );
}

// ── Request Form ──────────────────────────────────────────────────────────────
function RequestForm({ user, onClose, onSuccess }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title:"", category:"", short_explanation:"", urgency:"moderate",
    items:[], estimated_total:"", preferred_retailer:"",
    child_related_explanation:"", is_anonymous:true, terms_acknowledged:false,
  });
  const [newItem, setNewItem] = useState({ name:"", quantity:1, estimated_cost:"" });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submitMutation = useMutation({
    mutationFn: () => base44.entities.PayItForwardRequest.create({
      ...form,
      estimated_total: parseFloat(form.estimated_total) || 0,
      requester_email: user.email,
      display_name: form.is_anonymous ? `Member #${Math.floor(Math.random()*9000)+1000}` : (user.full_name || user.email.split("@")[0]),
      status: "submitted",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pif-my-requests"] });
      onSuccess();
    },
  });

  const addItem = () => {
    if (!newItem.name) return;
    set("items", [...form.items, { ...newItem, estimated_cost: parseFloat(newItem.estimated_cost)||0 }]);
    setNewItem({ name:"", quantity:1, estimated_cost:"" });
  };

  const removeItem = (i) => set("items", form.items.filter((_,idx) => idx !== i));

  const cap = catFor(form.category)?.cap || 150;
  const totalExceedsCap = parseFloat(form.estimated_total) > cap;

  const inputStyle = {
    width:"100%", padding:"12px 14px", borderRadius:12, border:"1px solid rgba(255,255,255,0.1)",
    background:"rgba(255,255,255,0.04)", color:"#fff", fontSize:14,
    outline:"none", fontFamily:"inherit", boxSizing:"border-box",
  };

  const canNext1 = form.title && form.category && form.short_explanation;
  const canNext2 = form.estimated_total && !totalExceedsCap;
  const canSubmit = canNext1 && canNext2 && form.terms_acknowledged;

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:1000, display:"flex", flexDirection:"column", overflowY:"auto" }}>
      <div style={{ flex:1, padding:"24px 16px 40px", maxWidth:480, margin:"0 auto", width:"100%" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24 }}>
          <button onClick={onClose} style={{ background:"none", border:"none", color:C.muted, cursor:"pointer", padding:4 }}>
            <ChevronLeft style={{ width:22, height:22 }} />
          </button>
          <div>
            <h2 style={{ fontSize:20, fontWeight:900, color:"#fff", lineHeight:1.2 }}>Request Essential Support</h2>
            <p style={{ fontSize:12, color:C.muted, marginTop:2 }}>Step {step} of 3</p>
          </div>
        </div>

        {/* Progress */}
        <div style={{ display:"flex", gap:6, marginBottom:28 }}>
          {[1,2,3].map(s => (
            <div key={s} style={{ flex:1, height:4, borderRadius:2,
              background: s <= step ? C.teal : "rgba(255,255,255,0.1)" }} />
          ))}
        </div>

        {step === 1 && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div>
              <p style={{ fontSize:12, fontWeight:700, color:C.muted, marginBottom:6, textTransform:"uppercase", letterSpacing:".06em" }}>Request Title *</p>
              <input style={inputStyle} placeholder="e.g. Weekly groceries for family of 3"
                value={form.title} onChange={e => set("title", e.target.value)} />
            </div>
            <div>
              <p style={{ fontSize:12, fontWeight:700, color:C.muted, marginBottom:8, textTransform:"uppercase", letterSpacing:".06em" }}>Category *</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {CATEGORIES.map(cat => {
                  const Icon = cat.icon;
                  const active = form.category === cat.id;
                  return (
                    <button key={cat.id} onClick={() => set("category", cat.id)} style={{
                      padding:"12px 10px", borderRadius:12, border:`1.5px solid ${active ? cat.color : "rgba(255,255,255,0.08)"}`,
                      background: active ? `${cat.color}14` : "rgba(255,255,255,0.03)",
                      cursor:"pointer", display:"flex", alignItems:"center", gap:8,
                    }}>
                      <Icon style={{ color:cat.color, width:16, height:16, flexShrink:0 }} />
                      <span style={{ fontSize:12, fontWeight:700, color: active ? cat.color : "rgba(255,255,255,0.6)", textAlign:"left" }}>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <p style={{ fontSize:12, fontWeight:700, color:C.muted, marginBottom:6, textTransform:"uppercase", letterSpacing:".06em" }}>Brief Explanation *</p>
              <textarea style={{ ...inputStyle, resize:"vertical" }} rows={3}
                placeholder="Briefly explain what you need and why (no personal details required)."
                value={form.short_explanation} onChange={e => set("short_explanation", e.target.value)} />
            </div>
            <div>
              <p style={{ fontSize:12, fontWeight:700, color:C.muted, marginBottom:8, textTransform:"uppercase", letterSpacing:".06em" }}>Urgency Level</p>
              <div style={{ display:"flex", gap:8 }}>
                {Object.entries(URGENCY_CONFIG).map(([k, v]) => (
                  <button key={k} onClick={() => set("urgency", k)} style={{
                    flex:1, padding:"10px 6px", borderRadius:10, border:`1.5px solid ${form.urgency===k ? v.color : "rgba(255,255,255,0.08)"}`,
                    background: form.urgency===k ? v.bg : "rgba(255,255,255,0.03)",
                    cursor:"pointer", fontSize:11, fontWeight:700, color: form.urgency===k ? v.color : C.muted,
                  }}>{v.label}</button>
                ))}
              </div>
            </div>
            <button onClick={() => setStep(2)} disabled={!canNext1}
              style={{ padding:"14px", borderRadius:14, border:"none", cursor:canNext1?"pointer":"not-allowed",
                background: canNext1 ? `linear-gradient(135deg,${C.teal},#22C5B0)` : "rgba(255,255,255,0.06)",
                color: canNext1 ? "#07090F" : C.muted, fontWeight:800, fontSize:15 }}>
              Continue →
            </button>
          </div>
        )}

        {step === 2 && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div style={{ padding:"14px 16px", borderRadius:14, background:"rgba(45,212,191,0.06)", border:"1px solid rgba(45,212,191,0.15)" }}>
              <p style={{ fontSize:12, color:C.teal, fontWeight:700 }}>
                Category cap for {catFor(form.category)?.label}: <span style={{ color:"#fff" }}>${cap}</span>
              </p>
              <p style={{ fontSize:11, color:C.muted, marginTop:2 }}>Requests exceeding the cap require admin approval.</p>
            </div>

            <div>
              <p style={{ fontSize:12, fontWeight:700, color:C.muted, marginBottom:6, textTransform:"uppercase", letterSpacing:".06em" }}>Item List (optional but helpful)</p>
              {form.items.map((item, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 12px", borderRadius:10,
                  background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", marginBottom:6 }}>
                  <p style={{ flex:1, fontSize:13, color:"#fff" }}>{item.name} × {item.quantity}</p>
                  <p style={{ fontSize:13, color:C.teal, fontWeight:700 }}>${item.estimated_cost}</p>
                  <button onClick={() => removeItem(i)} style={{ background:"none", border:"none", cursor:"pointer", color:C.muted, padding:2 }}>
                    <X style={{ width:14, height:14 }} />
                  </button>
                </div>
              ))}
              <div style={{ display:"flex", gap:6, marginTop:4 }}>
                <input style={{ ...inputStyle, flex:2 }} placeholder="Item name" value={newItem.name} onChange={e => setNewItem(n => ({ ...n, name:e.target.value }))} />
                <input style={{ ...inputStyle, flex:1 }} type="number" placeholder="Qty" value={newItem.quantity} onChange={e => setNewItem(n => ({ ...n, quantity:parseInt(e.target.value)||1 }))} />
                <input style={{ ...inputStyle, flex:1 }} type="number" placeholder="$" value={newItem.estimated_cost} onChange={e => setNewItem(n => ({ ...n, estimated_cost:e.target.value }))} />
                <button onClick={addItem} style={{ padding:"10px 14px", borderRadius:10, border:"none", cursor:"pointer",
                  background:`${C.teal}20`, color:C.teal, fontWeight:700, fontSize:13, flexShrink:0 }}>Add</button>
              </div>
            </div>

            <div>
              <p style={{ fontSize:12, fontWeight:700, color:C.muted, marginBottom:6, textTransform:"uppercase", letterSpacing:".06em" }}>Estimated Total *</p>
              <input style={{ ...inputStyle, borderColor: totalExceedsCap ? C.amber : "rgba(255,255,255,0.1)" }}
                type="number" placeholder="$0.00"
                value={form.estimated_total} onChange={e => set("estimated_total", e.target.value)} />
              {totalExceedsCap && (
                <p style={{ fontSize:12, color:C.amber, marginTop:4 }}>
                  ⚠️ This exceeds the ${cap} cap for this category. An admin will review before approval.
                </p>
              )}
            </div>

            <div>
              <p style={{ fontSize:12, fontWeight:700, color:C.muted, marginBottom:6, textTransform:"uppercase", letterSpacing:".06em" }}>Preferred Retailer / Source</p>
              <input style={inputStyle} placeholder="e.g. Walmart, Target, Amazon, Local store"
                value={form.preferred_retailer} onChange={e => set("preferred_retailer", e.target.value)} />
            </div>

            {(form.category === "baby_child" || form.category === "school_essentials") && (
              <div>
                <p style={{ fontSize:12, fontWeight:700, color:"#F472B6", marginBottom:6, textTransform:"uppercase", letterSpacing:".06em" }}>Child-Related Notes (optional)</p>
                <textarea style={inputStyle} rows={2}
                  placeholder="Age, grade, or specific needs for child items"
                  value={form.child_related_explanation} onChange={e => set("child_related_explanation", e.target.value)} />
              </div>
            )}

            <div style={{ display:"flex", gap:8 }}>
              <button onClick={() => setStep(1)} style={{ flex:1, padding:"14px", borderRadius:14, border:"1px solid rgba(255,255,255,0.1)",
                background:"rgba(255,255,255,0.04)", color:C.muted, fontWeight:700, fontSize:14, cursor:"pointer" }}>Back</button>
              <button onClick={() => setStep(3)} disabled={!canNext2}
                style={{ flex:2, padding:"14px", borderRadius:14, border:"none", cursor:canNext2?"pointer":"not-allowed",
                  background: canNext2 ? `linear-gradient(135deg,${C.teal},#22C5B0)` : "rgba(255,255,255,0.06)",
                  color: canNext2 ? "#07090F" : C.muted, fontWeight:800, fontSize:15 }}>
                Continue →
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div style={{ padding:"16px", borderRadius:16, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)" }}>
              <p style={{ fontSize:14, fontWeight:800, color:"#fff", marginBottom:12 }}>Review Your Request</p>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {[
                  ["Category", catFor(form.category)?.label],
                  ["Title", form.title],
                  ["Urgency", URGENCY_CONFIG[form.urgency]?.label],
                  ["Estimated Total", `$${form.estimated_total}`],
                  form.preferred_retailer && ["Retailer", form.preferred_retailer],
                ].filter(Boolean).map(([k,v]) => (
                  <div key={k} style={{ display:"flex", justifyContent:"space-between" }}>
                    <p style={{ fontSize:12, color:C.muted }}>{k}</p>
                    <p style={{ fontSize:12, fontWeight:700, color:"#fff" }}>{v}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p style={{ fontSize:12, fontWeight:700, color:C.muted, marginBottom:8, textTransform:"uppercase", letterSpacing:".06em" }}>Posting Preference</p>
              <button onClick={() => set("is_anonymous", !form.is_anonymous)} style={{
                width:"100%", display:"flex", alignItems:"center", gap:12, padding:"14px 16px", borderRadius:12,
                background: form.is_anonymous ? "rgba(45,212,191,0.08)" : "rgba(255,255,255,0.04)",
                border:`1.5px solid ${form.is_anonymous ? C.teal : "rgba(255,255,255,0.08)"}`, cursor:"pointer",
              }}>
                {form.is_anonymous ? <EyeOff style={{ color:C.teal, width:18, height:18 }} /> : <Eye style={{ color:C.muted, width:18, height:18 }} />}
                <div style={{ textAlign:"left" }}>
                  <p style={{ fontSize:13, fontWeight:700, color: form.is_anonymous ? C.teal : "#fff" }}>
                    {form.is_anonymous ? "Anonymous (Recommended)" : "Show Display Name"}
                  </p>
                  <p style={{ fontSize:11, color:C.muted }}>
                    {form.is_anonymous ? "Your identity is fully protected" : "Your name will be visible to the community"}
                  </p>
                </div>
              </button>
            </div>

            <div style={{ padding:"14px 16px", borderRadius:14, background:"rgba(99,102,241,0.06)", border:"1px solid rgba(99,102,241,0.15)" }}>
              <p style={{ fontSize:12, color:"rgba(241,245,249,0.55)", lineHeight:1.6 }}>
                ✅ <strong style={{ color:"#fff" }}>Community Trust Agreement:</strong> I confirm this request is for genuine personal or household necessity. I understand this is an item-based support system — not a cash transfer. I will not resell, misrepresent, or abuse this community resource.
              </p>
              <button onClick={() => set("terms_acknowledged", !form.terms_acknowledged)}
                style={{ marginTop:10, display:"flex", alignItems:"center", gap:8, background:"none", border:"none", cursor:"pointer" }}>
                <div style={{ width:20, height:20, borderRadius:6, border:`1.5px solid ${form.terms_acknowledged ? C.emerald : "rgba(255,255,255,0.2)"}`,
                  background: form.terms_acknowledged ? C.emerald : "transparent",
                  display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {form.terms_acknowledged && <CheckCircle2 style={{ color:"#fff", width:13, height:13 }} />}
                </div>
                <span style={{ fontSize:12, fontWeight:700, color: form.terms_acknowledged ? C.emerald : C.muted }}>I agree to the community support terms</span>
              </button>
            </div>

            <div style={{ display:"flex", gap:8 }}>
              <button onClick={() => setStep(2)} style={{ flex:1, padding:"14px", borderRadius:14, border:"1px solid rgba(255,255,255,0.1)",
                background:"rgba(255,255,255,0.04)", color:C.muted, fontWeight:700, fontSize:14, cursor:"pointer" }}>Back</button>
              <button onClick={() => submitMutation.mutate()} disabled={!canSubmit || submitMutation.isPending}
                style={{ flex:2, padding:"14px", borderRadius:14, border:"none", cursor:canSubmit?"pointer":"not-allowed",
                  background: canSubmit ? `linear-gradient(135deg,${C.teal},#22C5B0)` : "rgba(255,255,255,0.06)",
                  color: canSubmit ? "#07090F" : C.muted, fontWeight:800, fontSize:15,
                  display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                {submitMutation.isPending ? <Loader2 style={{ width:18, height:18 }} className="animate-spin"/> : "Submit Request →"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Fulfillment Modal ─────────────────────────────────────────────────────────
function FulfillModal({ req, user, onClose }) {
  const queryClient = useQueryClient();
  const [confirmed, setConfirmed] = useState(false);
  const cat = catFor(req.category);

  const fulfillMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.PayItForwardFulfillment.create({
        request_id: req.id,
        request_title: req.title,
        request_category: req.category,
        donor_email: user.email,
        is_anonymous: true,
        amount_covered: req.approved_amount || req.estimated_total,
        fulfillment_method: "full_cart",
        retailer_used: req.preferred_retailer || "",
        status: "pending",
      });
      await base44.entities.PayItForwardRequest.update(req.id, { status: "fulfilled", fulfilled_at: new Date().toISOString() });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pif-feed"] });
      setConfirmed(true);
    },
  });

  if (confirmed) return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.9)", zIndex:1000,
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ fontSize:56, marginBottom:16 }}>💙</div>
      <h2 style={{ fontSize:24, fontWeight:900, color:"#fff", textAlign:"center", marginBottom:8 }}>Fulfilled with Care</h2>
      <p style={{ fontSize:14, color:"rgba(241,245,249,0.55)", textAlign:"center", lineHeight:1.65, maxWidth:300, marginBottom:32 }}>
        Your anonymous support has been submitted. The community team will coordinate fulfillment.
      </p>
      <button onClick={onClose} style={{ padding:"14px 40px", borderRadius:14, border:"none", cursor:"pointer",
        background:`linear-gradient(135deg,${C.teal},#22C5B0)`, color:"#07090F", fontWeight:800, fontSize:15 }}>
        Done
      </button>
    </div>
  );

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.88)", zIndex:1000, display:"flex", flexDirection:"column", overflowY:"auto" }}>
      <div style={{ flex:1, padding:"32px 20px 48px", maxWidth:480, margin:"0 auto", width:"100%" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24 }}>
          <button onClick={onClose} style={{ background:"none", border:"none", color:C.muted, cursor:"pointer" }}>
            <ChevronLeft style={{ width:22, height:22 }} />
          </button>
          <h2 style={{ fontSize:20, fontWeight:900, color:"#fff" }}>Cover This Cart</h2>
        </div>

        <div style={{ ...C.glass, borderRadius:20, padding:"20px", marginBottom:20, borderColor:`${cat.color}30` }}>
          <p style={{ fontSize:11, fontWeight:700, color:cat.color, textTransform:"uppercase", letterSpacing:".06em", marginBottom:6 }}>{cat.label}</p>
          <p style={{ fontSize:17, fontWeight:800, color:"#fff", marginBottom:6 }}>{req.title}</p>
          <p style={{ fontSize:13, color:"rgba(241,245,249,0.55)", lineHeight:1.55, marginBottom:14 }}>{req.short_explanation}</p>
          {req.items?.length > 0 && (
            <div>
              <p style={{ fontSize:11, fontWeight:700, color:C.muted, marginBottom:8, textTransform:"uppercase", letterSpacing:".06em" }}>Approved Items</p>
              {req.items.map((item, i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0",
                  borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                  <p style={{ fontSize:13, color:"rgba(241,245,249,0.7)" }}>{item.name} × {item.quantity}</p>
                  <p style={{ fontSize:13, fontWeight:700, color:"#fff" }}>${item.estimated_cost}</p>
                </div>
              ))}
            </div>
          )}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:14,
            paddingTop:14, borderTop:"1px solid rgba(255,255,255,0.08)" }}>
            <p style={{ fontSize:14, fontWeight:700, color:C.muted }}>Cart Total</p>
            <p style={{ fontSize:28, fontWeight:900, color:C.teal }}>${req.approved_amount || req.estimated_total}</p>
          </div>
        </div>

        <div style={{ padding:"14px 16px", borderRadius:14, background:"rgba(45,212,191,0.06)", border:"1px solid rgba(45,212,191,0.12)", marginBottom:20 }}>
          <p style={{ fontSize:12, color:"rgba(241,245,249,0.55)", lineHeight:1.6 }}>
            🔒 <strong style={{ color:"#fff" }}>Your identity is fully protected.</strong> This fulfillment is logged anonymously. No money is sent directly to any user — all fulfillment is item-based and community-coordinated.
          </p>
        </div>

        <button onClick={() => fulfillMutation.mutate()} disabled={fulfillMutation.isPending}
          style={{ width:"100%", padding:"16px", borderRadius:14, border:"none", cursor:"pointer",
            background:`linear-gradient(135deg,${C.teal},#22C5B0)`, color:"#07090F",
            fontWeight:800, fontSize:16, display:"flex", alignItems:"center", justifyContent:"center", gap:8,
            boxShadow:`0 8px 28px rgba(45,212,191,0.28)` }}>
          {fulfillMutation.isPending ? <Loader2 style={{ width:18, height:18 }} className="animate-spin"/> : <>💙 Confirm Anonymous Support</>}
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function PayItForward() {
  const [tab, setTab] = useState("feed");
  const [showForm, setShowForm] = useState(false);
  const [showFulfill, setShowFulfill] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const { data: user } = useQuery({ queryKey:["user"], queryFn:() => base44.auth.me() });

  const { data: feed = [], isLoading: feedLoading } = useQuery({
    queryKey: ["pif-feed"],
    queryFn: () => base44.entities.PayItForwardRequest.filter({ status:"approved" }, "-created_date", 20),
    staleTime: 30000,
  });

  const { data: myRequests = [] } = useQuery({
    queryKey: ["pif-my-requests", user?.email],
    queryFn: () => base44.entities.PayItForwardRequest.filter({ requester_email: user.email }, "-created_date", 20),
    enabled: !!user?.email,
  });

  const TABS = [
    { id:"feed",    label:"Community Feed" },
    { id:"mine",    label:"My Requests"    },
    { id:"how",     label:"How It Works"   },
  ];

  return (
    <div style={{ background:"linear-gradient(170deg,#07090F 0%,#0B0F1A 100%)", minHeight:"100vh", paddingBottom:100 }}>
      {showForm && user && (
        <RequestForm user={user} onClose={() => setShowForm(false)} onSuccess={() => { setShowForm(false); setShowSuccess(true); setTimeout(() => { setShowSuccess(false); setTab("mine"); }, 2000); }} />
      )}
      {showFulfill && user && (
        <FulfillModal req={showFulfill} user={user} onClose={() => setShowFulfill(null)} />
      )}

      <div style={{ maxWidth:480, margin:"0 auto" }}>
        {/* Header */}
        <div style={{ background:"linear-gradient(150deg,#0D1020 0%,#08091A 100%)", padding:"60px 20px 24px", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:-60, right:-60, width:260, height:260, borderRadius:"50%",
            background:"radial-gradient(circle,rgba(45,212,191,0.1) 0%,transparent 70%)", pointerEvents:"none" }} />
          <div style={{ position:"absolute", bottom:-40, left:-40, width:200, height:200, borderRadius:"50%",
            background:"radial-gradient(circle,rgba(244,114,182,0.07) 0%,transparent 70%)", pointerEvents:"none" }} />
          <div style={{ position:"relative", zIndex:1 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
              <div style={{ width:40, height:40, borderRadius:12, background:"rgba(45,212,191,0.12)",
                display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Heart style={{ color:C.teal, width:20, height:20 }} />
              </div>
              <div>
                <h1 style={{ fontSize:22, fontWeight:900, color:"#fff", lineHeight:1.1 }}>Pay It Forward</h1>
                <p style={{ fontSize:11, color:"rgba(45,212,191,0.7)", fontWeight:600, letterSpacing:".06em", textTransform:"uppercase" }}>
                  Approved Community Support
                </p>
              </div>
            </div>
            <p style={{ fontSize:13, color:"rgba(241,245,249,0.45)", lineHeight:1.65, marginBottom:20, maxWidth:340 }}>
              A dignity-first, item-based mutual aid system for the Unbound community. Anonymous. Safe. Real.
            </p>
            <button onClick={() => setShowForm(true)} style={{
              display:"flex", alignItems:"center", gap:8, padding:"13px 20px", borderRadius:14, border:"none", cursor:"pointer",
              background:`linear-gradient(135deg,${C.teal},#22C5B0)`, color:"#07090F", fontWeight:800, fontSize:14,
              boxShadow:`0 6px 24px rgba(45,212,191,0.28)`,
            }}>
              <Plus style={{ width:16, height:16 }} /> Request Essential Support
            </button>
          </div>
        </div>

        {/* Success toast */}
        {showSuccess && (
          <div style={{ margin:"12px 16px 0", padding:"12px 16px", borderRadius:14,
            background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.25)",
            display:"flex", alignItems:"center", gap:10 }}>
            <CheckCircle2 style={{ color:C.emerald, width:18, height:18 }} />
            <p style={{ fontSize:13, fontWeight:700, color:C.emerald }}>Request submitted! Our team will review it shortly.</p>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display:"flex", gap:4, padding:"12px 16px 0", background:"rgba(7,9,15,0.6)" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex:1, padding:"10px 6px", borderRadius:"10px 10px 0 0", border:"none", cursor:"pointer",
              background: tab===t.id ? "rgba(255,255,255,0.05)" : "transparent",
              borderBottom: tab===t.id ? `2px solid ${C.teal}` : "2px solid transparent",
              color: tab===t.id ? C.teal : C.muted,
              fontWeight: tab===t.id ? 700 : 500, fontSize:13,
            }}>{t.label}</button>
          ))}
        </div>

        <div style={{ padding:"16px 16px" }}>

          {/* Feed */}
          {tab === "feed" && (
            <>
              {feedLoading ? (
                <div style={{ textAlign:"center", padding:"48px 0" }}>
                  <Loader2 style={{ color:C.teal, width:28, height:28, margin:"0 auto" }} className="animate-spin" />
                  <p style={{ fontSize:13, color:C.muted, marginTop:12 }}>Loading community requests…</p>
                </div>
              ) : feed.length === 0 ? (
                <div style={{ textAlign:"center", padding:"48px 16px" }}>
                  <div style={{ fontSize:40, marginBottom:12 }}>💙</div>
                  <p style={{ fontSize:16, fontWeight:700, color:"#fff", marginBottom:8 }}>No open requests right now</p>
                  <p style={{ fontSize:13, color:C.muted, lineHeight:1.6 }}>
                    All community needs have been fulfilled — or check back soon when new requests are approved.
                  </p>
                </div>
              ) : (
                feed.map(req => <RequestCard key={req.id} req={req} onFulfill={setShowFulfill} />)
              )}
            </>
          )}

          {/* My Requests */}
          {tab === "mine" && (
            <>
              {myRequests.length === 0 ? (
                <div style={{ textAlign:"center", padding:"48px 16px" }}>
                  <Package style={{ color:C.muted, width:36, height:36, margin:"0 auto 12px" }} />
                  <p style={{ fontSize:15, fontWeight:700, color:"#fff", marginBottom:8 }}>No requests yet</p>
                  <p style={{ fontSize:13, color:C.muted, lineHeight:1.6, marginBottom:20 }}>
                    If you need essential support, you can submit a request. All requests are reviewed before being shared.
                  </p>
                  <button onClick={() => setShowForm(true)} style={{
                    padding:"12px 24px", borderRadius:12, border:"none", cursor:"pointer",
                    background:`linear-gradient(135deg,${C.teal},#22C5B0)`, color:"#07090F", fontWeight:800, fontSize:14,
                  }}>Submit a Request</button>
                </div>
              ) : (
                myRequests.map(req => <MyRequestCard key={req.id} req={req} />)
              )}
            </>
          )}

          {/* How It Works */}
          {tab === "how" && (
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {[
                { icon:"🛡️", title:"100% Anonymous & Safe",     body:"Your identity is protected. We never share personal details. Posts show a protected member alias only."                                   },
                { icon:"✅", title:"Approved Requests Only",     body:"Every request is reviewed by our moderation team before it appears in the community feed. No exceptions."                               },
                { icon:"🚫", title:"No Cash. Ever.",             body:"This is not a cash transfer system. Support is item-based only. No money ever goes directly from user to user."                        },
                { icon:"📦", title:"Essentials Only",            body:"Requests must be for necessities — food, hygiene, baby supplies, clothing, household basics, school items, or emergency needs."        },
                { icon:"💙", title:"Dignity-First Design",       body:"This feature was built so that asking for help feels safe, respected, and practical — not embarrassing."                               },
                { icon:"🔒", title:"Trust & Accountability",     body:"Request history, fulfillment records, and moderation actions are all logged. Abuse of the system results in immediate removal."       },
              ].map(item => (
                <div key={item.title} style={{ ...C.glass, borderRadius:18, padding:"18px" }}>
                  <div style={{ display:"flex", gap:12 }}>
                    <span style={{ fontSize:24, flexShrink:0 }}>{item.icon}</span>
                    <div>
                      <p style={{ fontSize:14, fontWeight:800, color:"#fff", marginBottom:4 }}>{item.title}</p>
                      <p style={{ fontSize:13, color:"rgba(241,245,249,0.5)", lineHeight:1.6 }}>{item.body}</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Category caps */}
              <div style={{ ...C.glass, borderRadius:18, padding:"18px", marginTop:4 }}>
                <p style={{ fontSize:13, fontWeight:800, color:"#fff", marginBottom:12 }}>📊 Support Limits by Category</p>
                {CATEGORIES.map(cat => {
                  const Icon = cat.icon;
                  return (
                    <div key={cat.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0",
                      borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                      <Icon style={{ color:cat.color, width:16, height:16, flexShrink:0 }} />
                      <p style={{ flex:1, fontSize:13, color:"rgba(241,245,249,0.6)" }}>{cat.label}</p>
                      <p style={{ fontSize:13, fontWeight:700, color:cat.color }}>Up to ${cat.cap}</p>
                    </div>
                  );
                })}
                <p style={{ fontSize:11, color:C.muted, marginTop:10, lineHeight:1.5 }}>
                  Caps may be adjusted by admins based on community resources and need.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}