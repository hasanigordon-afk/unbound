/**
 * ModerationQueue — Staff/Admin content moderation tool
 * Review flagged posts, reports, facility reviews, and community content.
 */
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, CheckCircle2, XCircle, Flag, Eye, Loader2, AlertTriangle, RefreshCw } from "lucide-react";

const C = {
  navy: "#0F172A", blue: "#3B82F6", green: "#10B981",
  red: "#EF4444", amber: "#F59E0B", slate: "#64748B",
  muted: "#94A3B8", border: "#E2E8F0", bg: "#F8FAFC", white: "#FFFFFF",
};

const TABS = [
  { id: "posts",    label: "Community Posts", icon: Flag },
  { id: "reviews",  label: "Facility Reviews", icon: Eye },
  { id: "reports",  label: "Reports",          icon: AlertTriangle },
];

function ModerationCard({ item, type, onApprove, onReject, isPending }) {
  const [expanded, setExpanded] = useState(false);
  const content = item.content || item.full_review || item.summary || "(no content)";
  const category = item.category || item.program_type || type;
  const author = item.reviewer_email || item.created_by || "Anonymous";
  const date = item.created_date ? new Date(item.created_date).toLocaleDateString() : "Unknown";

  return (
    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14,
      borderLeft: `4px solid ${C.amber}`, overflow: "hidden" }}>
      <div style={{ padding: "16px 18px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
              <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20,
                background: "#FFFBEB", color: C.amber, border: "1px solid #FDE68A", fontWeight: 700 }}>
                Pending Review
              </span>
              <span style={{ fontSize: 11, color: C.muted }}>{category}</span>
            </div>
            <p style={{ fontSize: 12, color: C.muted }}>{author} · {date}</p>
          </div>
        </div>

        {/* Content preview */}
        <div style={{ background: C.bg, borderRadius: 8, padding: "12px 14px", marginBottom: 12 }}>
          <p style={{ fontSize: 13, color: C.navy, lineHeight: 1.6,
            overflow: expanded ? "visible" : "hidden",
            display: expanded ? "block" : "-webkit-box",
            WebkitLineClamp: 3, WebkitBoxOrient: "vertical",
          }}>
            {item.title && <strong>{item.title}<br /></strong>}
            {content}
          </p>
          {content.length > 200 && (
            <button onClick={() => setExpanded(!expanded)} style={{
              marginTop: 6, fontSize: 12, color: C.blue, background: "none", border: "none", cursor: "pointer", padding: 0, fontWeight: 600,
            }}>
              {expanded ? "Show less ↑" : "Read more ↓"}
            </button>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => onApprove(item)} disabled={isPending}
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              padding: "9px", borderRadius: 10, background: "#F0FDF4", border: "1px solid #BBF7D0",
              color: C.green, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            <CheckCircle2 style={{ width: 13, height: 13 }} /> Approve
          </button>
          <button onClick={() => onReject(item)} disabled={isPending}
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              padding: "9px", borderRadius: 10, background: "#FEF2F2", border: "1px solid #FECACA",
              color: C.red, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            <XCircle style={{ width: 13, height: 13 }} /> Reject
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ModerationQueue() {
  const [activeTab, setActiveTab] = useState("posts");
  const queryClient = useQueryClient();

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: pendingPosts = [], isLoading: postsLoading } = useQuery({
    queryKey: ["mod-posts"],
    queryFn: () => base44.entities.CommunityPost.filter({ moderation_status: "pending" }, "-created_date", 50),
  });

  const { data: pendingReviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ["mod-reviews"],
    queryFn: () => base44.entities.FacilityReview.filter({ moderation_status: "pending" }, "-created_date", 50),
  });

  const { data: reports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ["mod-reports"],
    queryFn: () => base44.entities.ContentReport.filter({ status: "pending" }, "-created_date", 50),
  });

  const approveMutation = useMutation({
    mutationFn: async ({ item, type }) => {
      if (type === "posts") await base44.entities.CommunityPost.update(item.id, { moderation_status: "approved" });
      else if (type === "reviews") await base44.entities.FacilityReview.update(item.id, { moderation_status: "approved" });
      else if (type === "reports") await base44.entities.ContentReport.update(item.id, { status: "reviewed", resolution: "approved" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mod-posts"] });
      queryClient.invalidateQueries({ queryKey: ["mod-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["mod-reports"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ item, type }) => {
      if (type === "posts") await base44.entities.CommunityPost.update(item.id, { moderation_status: "flagged" });
      else if (type === "reviews") await base44.entities.FacilityReview.update(item.id, { moderation_status: "flagged" });
      else if (type === "reports") await base44.entities.ContentReport.update(item.id, { status: "reviewed", resolution: "rejected" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mod-posts"] });
      queryClient.invalidateQueries({ queryKey: ["mod-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["mod-reports"] });
    },
  });

  const items = activeTab === "posts" ? pendingPosts : activeTab === "reviews" ? pendingReviews : reports;
  const isLoading = activeTab === "posts" ? postsLoading : activeTab === "reviews" ? reviewsLoading : reportsLoading;
  const totalPending = pendingPosts.length + pendingReviews.length + reports.length;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ background: C.navy, color: "#fff", padding: "40px 24px 0" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(62,207,191,0.8)", textTransform: "uppercase",
            letterSpacing: ".1em", marginBottom: 4 }}>UNBOUND · Admin</p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>Moderation Queue</h1>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                {totalPending} item{totalPending !== 1 ? "s" : ""} pending review
              </p>
            </div>
            <button onClick={() => { queryClient.invalidateQueries(); }}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
                background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 10, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              <RefreshCw style={{ width: 13, height: 13 }} /> Refresh
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            {TABS.map(({ id, label, icon: Icon }) => {
              const count = id === "posts" ? pendingPosts.length : id === "reviews" ? pendingReviews.length : reports.length;
              const active = activeTab === id;
              return (
                <button key={id} onClick={() => setActiveTab(id)} style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "12px 16px",
                  background: "none", border: "none", cursor: "pointer",
                  borderBottom: active ? "2px solid #3ECFBF" : "2px solid transparent",
                  color: active ? "#fff" : "rgba(255,255,255,0.4)", fontWeight: active ? 700 : 500, fontSize: 13,
                }}>
                  <Icon style={{ width: 13, height: 13 }} />
                  {label}
                  {count > 0 && (
                    <span style={{ background: C.amber, color: "#fff", fontSize: 10, fontWeight: 800,
                      padding: "1px 6px", borderRadius: 20 }}>{count}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 20px" }}>
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <Loader2 style={{ width: 24, height: 24, color: C.blue, margin: "0 auto 10px", display: "block" }} className="animate-spin" />
            <p style={{ fontSize: 13, color: C.muted }}>Loading queue…</p>
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", background: C.white, borderRadius: 16, border: `1px solid ${C.border}` }}>
            <CheckCircle2 style={{ width: 40, height: 40, color: C.green, margin: "0 auto 14px", display: "block" }} />
            <p style={{ fontSize: 17, fontWeight: 800, color: C.navy, marginBottom: 6 }}>Queue is clear</p>
            <p style={{ fontSize: 13, color: C.muted }}>No pending items in this category.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {items.map(item => (
              <ModerationCard
                key={item.id}
                item={item}
                type={activeTab}
                onApprove={(i) => approveMutation.mutate({ item: i, type: activeTab })}
                onReject={(i) => rejectMutation.mutate({ item: i, type: activeTab })}
                isPending={approveMutation.isPending || rejectMutation.isPending}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}