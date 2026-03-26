import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ShieldCheck, AlertTriangle, CheckCircle2, XCircle, Clock,
  ChevronLeft, Loader2, Eye, Flag, FileText, Settings, BarChart2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "./utils";

const C = {
  teal:    "#2DD4BF",
  emerald: "#10B981",
  amber:   "#F59E0B",
  red:     "#EF4444",
  indigo:  "#6366F1",
  muted:   "rgba(241,245,249,0.4)",
  glass:   { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)" },
};

const CATEGORIES = [
  { id:"food",             label:"Food",             color:"#F59E0B", defaultCap:100  },
  { id:"baby_child",       label:"Baby / Child",     color:"#F472B6", defaultCap:125  },
  { id:"clothing",         label:"Clothing",         color:"#6366F1", defaultCap:90   },
  { id:"hygiene",          label:"Hygiene",          color:"#2DD4BF", defaultCap:50   },
  { id:"household_basics", label:"Household Basics", color:"#10B981", defaultCap:80   },
  { id:"school_essentials",label:"School Essentials",color:"#8B5CF6", defaultCap:100  },
  { id:"emergency_need",   label:"Emergency Need",   color:"#EF4444", defaultCap:150  },
];

const STATUS_CONFIG = {
  submitted:      { label:"Submitted",     color:C.indigo, bg:"rgba(99,102,241,0.12)"   },
  pending_review: { label:"Under Review",  color:C.amber,  bg:"rgba(245,158,11,0.12)"   },
  approved:       { label:"Approved",      color:C.emerald,bg:"rgba(16,185,129,0.12)"   },
  denied:         { label:"Denied",        color:C.red,    bg:"rgba(239,68,68,0.12)"    },
  fulfilled:      { label:"Fulfilled",     color:C.teal,   bg:"rgba(45,212,191,0.12)"   },
  expired:        { label:"Expired",       color:"#94A3B8",bg:"rgba(148,163,184,0.08)"  },
};

const TABS = [
  { id:"queue",    label:"Review Queue", icon:Clock         },
  { id:"all",      label:"All Requests", icon:FileText      },
  { id:"history",  label:"Fulfillments", icon:CheckCircle2  },
  { id:"settings", label:"Settings",     icon:Settings      },
];

function timeAgo(d) {
  const m = Math.floor((new Date() - new Date(d)) / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m/60); if (h < 24) return `${h}h ago`;
  return `${Math.floor(h/24)}d ago`;
}

// ── Request Detail Modal ──────────────────────────────────────────────────────
function RequestDetail({ req, onClose }) {
  const queryClient = useQueryClient();
  const [note, setNote] = useState(req.admin_notes || "");
  const [approvedAmt, setApprovedAmt] = useState(req.approved_amount || req.estimated_total || "");
  const [denialReason, setDenialReason] = useState(req.denial_reason || "");
  const [saving, setSaving] = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const act = async (newStatus) => {
    setSaving(newStatus);
    const updates = { status: newStatus, admin_notes: note };
    if (newStatus === "approved") {
      updates.approved_amount = parseFloat(approvedAmt) || req.estimated_total;
      updates.approved_at = new Date().toISOString();
    }
    if (newStatus === "denied") updates.denial_reason = denialReason;
    await base44.entities.PayItForwardRequest.update(req.id, updates);
    await base44.entities.PayItForwardModerationAction.create({
      request_id: req.id,
      moderator_email: user.email || "admin",
      action: newStatus === "approved" ? "approved" : newStatus === "denied" ? "denied" : "flagged",
      note,
      previous_status: req.status,
      new_status: newStatus,
      amount_adjusted: newStatus === "approved" ? (parseFloat(approvedAmt) || req.estimated_total) : undefined,
    });
    queryClient.invalidateQueries({ queryKey: ["pif-admin-requests"] });
    setSaving(null);
    onClose();
  };

  const catLabel = CATEGORIES.find(c => c.id === req.category)?.label || req.category;
  const status = STATUS_CONFIG[req.status] || STATUS_CONFIG.submitted;

  const inputStyle = {
    width:"100%", padding:"10px 12px", borderRadius:10, border:"1px solid rgba(255,255,255,0.1)",
    background:"rgba(255,255,255,0.04)", color:"#fff", fontSize:13, outline:"none",
    fontFamily:"inherit", boxSizing:"border-box",
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.88)", zIndex:1000, overflowY:"auto" }}>
      <div style={{ maxWidth:480, margin:"0 auto", padding:"24px 16px 48px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <button onClick={onClose} style={{ background:"none", border:"none", color:C.muted, cursor:"pointer" }}>
            <ChevronLeft style={{ width:22, height:22 }} />
          </button>
          <h2 style={{ fontSize:18, fontWeight:900, color:"#fff" }}>Review Request</h2>
          <div style={{ marginLeft:"auto", padding:"4px 12px", borderRadius:20, background:status.bg }}>
            <p style={{ fontSize:11, fontWeight:700, color:status.color }}>{status.label}</p>
          </div>
        </div>

        {/* Request info */}
        <div style={{ ...C.glass, borderRadius:18, padding:"18px", marginBottom:14 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
            <p style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:".06em" }}>{catLabel}</p>
            <p style={{ fontSize:11, color:C.muted }}>{timeAgo(req.created_date)}</p>
          </div>
          <p style={{ fontSize:16, fontWeight:800, color:"#fff", marginBottom:6 }}>{req.title}</p>
          <p style={{ fontSize:13, color:"rgba(241,245,249,0.55)", lineHeight:1.55, marginBottom:12 }}>{req.short_explanation}</p>
          <div style={{ display:"flex", justifyContent:"space-between" }}>
            <p style={{ fontSize:12, color:C.muted }}>Submitted by: <span style={{ color:"#fff" }}>{req.requester_email}</span></p>
            <p style={{ fontSize:14, fontWeight:900, color:C.teal }}>${req.estimated_total}</p>
          </div>
          {req.preferred_retailer && (
            <p style={{ fontSize:12, color:C.muted, marginTop:6 }}>Retailer: <span style={{ color:"rgba(241,245,249,0.6)" }}>{req.preferred_retailer}</span></p>
          )}
          {req.child_related_explanation && (
            <p style={{ fontSize:12, color:"#F472B6", marginTop:6 }}>👶 {req.child_related_explanation}</p>
          )}
          {req.items?.length > 0 && (
            <div style={{ marginTop:12, paddingTop:12, borderTop:"1px solid rgba(255,255,255,0.06)" }}>
              <p style={{ fontSize:11, fontWeight:700, color:C.muted, marginBottom:6, textTransform:"uppercase", letterSpacing:".06em" }}>Items</p>
              {req.items.map((item, i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"rgba(241,245,249,0.6)", padding:"4px 0" }}>
                  <span>{item.name} × {item.quantity}</span>
                  <span style={{ color:"#fff" }}>${item.estimated_cost}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Approved amount */}
        {(req.status === "submitted" || req.status === "pending_review") && (
          <div style={{ marginBottom:12 }}>
            <p style={{ fontSize:12, fontWeight:700, color:C.muted, marginBottom:6, textTransform:"uppercase", letterSpacing:".06em" }}>Approved Amount ($)</p>
            <input style={inputStyle} type="number" value={approvedAmt} onChange={e => setApprovedAmt(e.target.value)} placeholder={req.estimated_total} />
          </div>
        )}

        {/* Admin note */}
        <div style={{ marginBottom:12 }}>
          <p style={{ fontSize:12, fontWeight:700, color:C.muted, marginBottom:6, textTransform:"uppercase", letterSpacing:".06em" }}>Moderation Note</p>
          <textarea style={{ ...inputStyle, resize:"vertical" }} rows={2} value={note} onChange={e => setNote(e.target.value)} placeholder="Internal note (not shown to user)" />
        </div>

        {/* Denial reason */}
        {(req.status === "submitted" || req.status === "pending_review") && (
          <div style={{ marginBottom:16 }}>
            <p style={{ fontSize:12, fontWeight:700, color:C.muted, marginBottom:6, textTransform:"uppercase", letterSpacing:".06em" }}>Denial Reason (if denying)</p>
            <input style={inputStyle} value={denialReason} onChange={e => setDenialReason(e.target.value)} placeholder="e.g. Duplicate request, non-essential item..." />
          </div>
        )}

        {/* Action buttons */}
        {(req.status === "submitted" || req.status === "pending_review") && (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            <button onClick={() => act("approved")} disabled={!!saving}
              style={{ padding:"14px", borderRadius:12, border:"none", cursor:"pointer",
                background:saving==="approved"?"rgba(16,185,129,0.2)":`linear-gradient(135deg,${C.emerald},#0DA372)`,
                color: saving==="approved" ? C.emerald : "#fff", fontWeight:800, fontSize:14,
                display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              {saving==="approved" ? <Loader2 style={{ width:16, height:16 }} className="animate-spin"/> : <CheckCircle2 style={{ width:16, height:16 }} />}
              Approve Request
            </button>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={() => act("pending_review")} disabled={!!saving}
                style={{ flex:1, padding:"12px", borderRadius:12, border:"1px solid rgba(245,158,11,0.3)",
                  background:"rgba(245,158,11,0.08)", color:C.amber, fontWeight:700, fontSize:13, cursor:"pointer" }}>
                Mark Under Review
              </button>
              <button onClick={() => act("denied")} disabled={!!saving}
                style={{ flex:1, padding:"12px", borderRadius:12, border:"1px solid rgba(239,68,68,0.3)",
                  background:"rgba(239,68,68,0.08)", color:C.red, fontWeight:700, fontSize:13, cursor:"pointer" }}>
                Deny Request
              </button>
            </div>
            <button onClick={() => act("flagged")} disabled={!!saving}
              style={{ padding:"10px", borderRadius:12, border:"1px solid rgba(255,255,255,0.1)",
                background:"rgba(255,255,255,0.04)", color:C.muted, fontWeight:600, fontSize:12, cursor:"pointer",
                display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
              <Flag style={{ width:13, height:13 }} /> Flag as Suspicious
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Category Settings ─────────────────────────────────────────────────────────
function CategorySettings() {
  const [caps, setCaps] = useState(() => {
    const saved = localStorage.getItem("pif_caps");
    return saved ? JSON.parse(saved) : Object.fromEntries(CATEGORIES.map(c => [c.id, c.defaultCap]));
  });
  const [saved, setSaved] = useState(false);

  const save = () => {
    localStorage.setItem("pif_caps", JSON.stringify(caps));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <div style={{ ...C.glass, borderRadius:18, padding:"18px", marginBottom:16 }}>
        <p style={{ fontSize:14, fontWeight:800, color:"#fff", marginBottom:4 }}>Category Spending Caps</p>
        <p style={{ fontSize:12, color:C.muted, lineHeight:1.6, marginBottom:16 }}>
          Set the maximum approved amount per request category. Requests over the cap are flagged for manual review.
        </p>
        {CATEGORIES.map(cat => (
          <div key={cat.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 0",
            borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
            <p style={{ flex:1, fontSize:13, fontWeight:700, color:"rgba(241,245,249,0.7)" }}>{cat.label}</p>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ fontSize:13, color:C.muted }}>$</span>
              <input type="number" value={caps[cat.id] || cat.defaultCap}
                onChange={e => setCaps(p => ({ ...p, [cat.id]: parseInt(e.target.value)||cat.defaultCap }))}
                style={{ width:72, padding:"6px 10px", borderRadius:8, border:"1px solid rgba(255,255,255,0.1)",
                  background:"rgba(255,255,255,0.05)", color:"#fff", fontSize:13, outline:"none", textAlign:"right" }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ ...C.glass, borderRadius:18, padding:"18px", marginBottom:16 }}>
        <p style={{ fontSize:14, fontWeight:800, color:"#fff", marginBottom:4 }}>Safety Rules</p>
        {[
          "No cash transfers or direct payments",
          "No luxury or non-essential items",
          "No duplicate requests within 30 days",
          "No off-platform payment instructions",
          "No resale items",
          "Electronics only approved for school/child essentials",
        ].map(rule => (
          <div key={rule} style={{ display:"flex", gap:10, padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
            <ShieldCheck style={{ color:C.emerald, width:14, height:14, flexShrink:0, marginTop:1 }} />
            <p style={{ fontSize:12, color:"rgba(241,245,249,0.55)" }}>{rule}</p>
          </div>
        ))}
      </div>

      <button onClick={save} style={{ width:"100%", padding:"14px", borderRadius:14, border:"none", cursor:"pointer",
        background: saved ? "rgba(16,185,129,0.15)" : `linear-gradient(135deg,${C.teal},#22C5B0)`,
        color: saved ? C.emerald : "#07090F", fontWeight:800, fontSize:15,
        border: saved ? `1px solid rgba(16,185,129,0.3)` : "none" }}>
        {saved ? "✓ Settings Saved" : "Save Settings"}
      </button>
    </div>
  );
}

// ── Main Admin Page ───────────────────────────────────────────────────────────
export default function PayItForwardAdmin() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("queue");
  const [selected, setSelected] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["pif-admin-requests"],
    queryFn: () => base44.entities.PayItForwardRequest.list("-created_date", 100),
  });

  const { data: fulfillments = [] } = useQuery({
    queryKey: ["pif-admin-fulfillments"],
    queryFn: () => base44.entities.PayItForwardFulfillment.list("-created_date", 100),
  });

  const queue = useMemo(() =>
    requests.filter(r => r.status === "submitted" || r.status === "pending_review"),
    [requests]
  );

  const filteredAll = useMemo(() =>
    filterStatus === "all" ? requests : requests.filter(r => r.status === filterStatus),
    [requests, filterStatus]
  );

  const stats = useMemo(() => ({
    total: requests.length,
    pending: queue.length,
    approved: requests.filter(r => r.status === "approved").length,
    fulfilled: requests.filter(r => r.status === "fulfilled").length,
    denied: requests.filter(r => r.status === "denied").length,
    totalFulfilled: fulfillments.reduce((s, f) => s + (f.amount_covered || 0), 0),
  }), [requests, fulfillments, queue]);

  function RequestRow({ req }) {
    const status = STATUS_CONFIG[req.status] || STATUS_CONFIG.submitted;
    const cat = CATEGORIES.find(c => c.id === req.category);
    return (
      <button onClick={() => setSelected(req)} style={{
        width:"100%", display:"flex", alignItems:"center", gap:12, padding:"14px 16px",
        background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)",
        borderRadius:14, marginBottom:8, cursor:"pointer", textAlign:"left",
      }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
            <p style={{ fontSize:13, fontWeight:700, color:"#fff", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{req.title}</p>
          </div>
          <p style={{ fontSize:11, color:C.muted }}>{cat?.label} · {req.requester_email?.split("@")[0]} · {timeAgo(req.created_date)}</p>
        </div>
        <div>
          <p style={{ fontSize:14, fontWeight:900, color:C.teal, textAlign:"right" }}>${req.estimated_total}</p>
          <div style={{ padding:"3px 10px", borderRadius:20, background:status.bg, marginTop:3 }}>
            <p style={{ fontSize:10, fontWeight:700, color:status.color, textAlign:"center" }}>{status.label}</p>
          </div>
        </div>
      </button>
    );
  }

  return (
    <div style={{ background:"linear-gradient(170deg,#07090F 0%,#0B0F1A 100%)", minHeight:"100vh", paddingBottom:100 }}>
      {selected && <RequestDetail req={selected} onClose={() => setSelected(null)} />}

      <div style={{ maxWidth:600, margin:"0 auto" }}>
        {/* Header */}
        <div style={{ background:"linear-gradient(150deg,#0D1020 0%,#08091A 100%)", padding:"60px 20px 24px", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:-60, right:-60, width:240, height:240, borderRadius:"50%",
            background:"radial-gradient(circle,rgba(99,102,241,0.1) 0%,transparent 70%)", pointerEvents:"none" }} />
          <div style={{ position:"relative", zIndex:1 }}>
            <button onClick={() => navigate(-1)} style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none",
              color:C.muted, cursor:"pointer", fontSize:12, marginBottom:12, padding:0 }}>
              <ChevronLeft style={{ width:15, height:15 }} /> Back
            </button>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
              <div style={{ width:40, height:40, borderRadius:12, background:"rgba(99,102,241,0.12)",
                display:"flex", alignItems:"center", justifyContent:"center" }}>
                <ShieldCheck style={{ color:C.indigo, width:20, height:20 }} />
              </div>
              <div>
                <h1 style={{ fontSize:20, fontWeight:900, color:"#fff", lineHeight:1.1 }}>Pay It Forward — Admin</h1>
                <p style={{ fontSize:11, color:"rgba(99,102,241,0.7)", fontWeight:600, letterSpacing:".06em", textTransform:"uppercase" }}>
                  Moderation Panel
                </p>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
              {[
                { label:"Queue",     value:stats.pending,   color:C.amber   },
                { label:"Approved",  value:stats.approved,  color:C.emerald },
                { label:"Fulfilled", value:stats.fulfilled, color:C.teal    },
              ].map(s => (
                <div key={s.label} style={{ background:`${s.color}0F`, border:`1px solid ${s.color}25`,
                  borderRadius:12, padding:"12px 8px", textAlign:"center" }}>
                  <p style={{ fontSize:22, fontWeight:900, color:s.color, lineHeight:1 }}>{s.value}</p>
                  <p style={{ fontSize:10, fontWeight:700, color:C.muted, marginTop:4, textTransform:"uppercase", letterSpacing:".06em" }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:2, padding:"10px 16px 0", background:"rgba(7,9,15,0.6)" }}>
          {TABS.map(({ id, label, icon:Icon }) => (
            <button key={id} onClick={() => setTab(id)} style={{
              flex:1, padding:"10px 4px", borderRadius:"10px 10px 0 0", border:"none", cursor:"pointer",
              background: tab===id ? "rgba(255,255,255,0.05)" : "transparent",
              borderBottom: tab===id ? `2px solid ${C.indigo}` : "2px solid transparent",
              color: tab===id ? C.indigo : C.muted,
              fontWeight: tab===id ? 700 : 500, fontSize:12,
              display:"flex", alignItems:"center", justifyContent:"center", gap:5,
            }}>
              <Icon style={{ width:13, height:13 }} />
              {label}
              {id==="queue" && stats.pending > 0 && (
                <span style={{ fontSize:10, background:C.amber, color:"#fff", padding:"1px 5px",
                  borderRadius:20, fontWeight:900, lineHeight:1.4 }}>{stats.pending}</span>
              )}
            </button>
          ))}
        </div>

        <div style={{ padding:"16px" }}>

          {/* Review Queue */}
          {tab === "queue" && (
            <>
              {isLoading ? (
                <div style={{ textAlign:"center", padding:"48px" }}>
                  <Loader2 style={{ color:C.teal, width:28, height:28, margin:"0 auto" }} className="animate-spin" />
                </div>
              ) : queue.length === 0 ? (
                <div style={{ textAlign:"center", padding:"48px 16px" }}>
                  <CheckCircle2 style={{ color:C.emerald, width:36, height:36, margin:"0 auto 12px" }} />
                  <p style={{ fontSize:15, fontWeight:700, color:"#fff", marginBottom:6 }}>Queue is clear</p>
                  <p style={{ fontSize:13, color:C.muted }}>All requests have been reviewed.</p>
                </div>
              ) : (
                queue.map(req => <RequestRow key={req.id} req={req} />)
              )}
            </>
          )}

          {/* All Requests */}
          {tab === "all" && (
            <>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:14 }}>
                {["all", "submitted", "pending_review", "approved", "denied", "fulfilled", "expired"].map(s => (
                  <button key={s} onClick={() => setFilterStatus(s)} style={{
                    padding:"6px 12px", borderRadius:20, border:"none", cursor:"pointer", fontSize:11, fontWeight:700,
                    background: filterStatus===s ? `${C.indigo}20` : "rgba(255,255,255,0.04)",
                    color: filterStatus===s ? C.indigo : C.muted,
                    border: filterStatus===s ? `1px solid ${C.indigo}40` : "1px solid rgba(255,255,255,0.07)",
                  }}>
                    {s === "all" ? "All" : STATUS_CONFIG[s]?.label || s}
                  </button>
                ))}
              </div>
              {filteredAll.map(req => <RequestRow key={req.id} req={req} />)}
            </>
          )}

          {/* Fulfillment History */}
          {tab === "history" && (
            <>
              <div style={{ ...C.glass, borderRadius:16, padding:"14px 16px", marginBottom:14 }}>
                <p style={{ fontSize:12, color:C.muted, marginBottom:4 }}>Total Community Support Fulfilled</p>
                <p style={{ fontSize:32, fontWeight:900, color:C.teal }}>${stats.totalFulfilled.toFixed(2)}</p>
              </div>
              {fulfillments.length === 0 ? (
                <p style={{ fontSize:13, color:C.muted, textAlign:"center", padding:"32px 0" }}>No fulfillments yet.</p>
              ) : (
                fulfillments.map(f => (
                  <div key={f.id} style={{ ...C.glass, borderRadius:14, padding:"14px 16px", marginBottom:8,
                    display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <div>
                      <p style={{ fontSize:13, fontWeight:700, color:"#fff", marginBottom:2 }}>{f.request_title || "Request"}</p>
                      <p style={{ fontSize:11, color:C.muted }}>{f.fulfillment_method?.replace(/_/g," ")} · {f.is_anonymous ? "Anonymous donor" : f.donor_email}</p>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <p style={{ fontSize:16, fontWeight:900, color:C.teal }}>${f.amount_covered}</p>
                      <p style={{ fontSize:10, padding:"2px 8px", borderRadius:20,
                        background: f.status==="confirmed" ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.1)",
                        color: f.status==="confirmed" ? C.emerald : C.amber, fontWeight:700 }}>{f.status}</p>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {/* Settings */}
          {tab === "settings" && <CategorySettings />}
        </div>
      </div>
    </div>
  );
}