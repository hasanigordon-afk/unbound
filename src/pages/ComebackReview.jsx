import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Check, X, Star, ArrowLeft, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { COMEBACK_CATEGORIES, COMEBACK_CATEGORY_BY_KEY } from "@/lib/comebackConfig";
import { toast } from "sonner";

export default function ComebackReview() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("pending");
  const [runningCategory, setRunningCategory] = useState(null);

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ["comeback-review", filter],
    queryFn: () => base44.entities.ComebackVideo.filter(
      filter === "all" ? {} : { review_status: filter },
      "-created_date",
      80
    ),
  });

  const updateVideo = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ComebackVideo.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["comeback-review"] }),
  });

  const deleteVideo = useMutation({
    mutationFn: (id) => base44.entities.ComebackVideo.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["comeback-review"] }),
  });

  const runCurator = async (category) => {
    setRunningCategory(category);
    try {
      const res = await base44.functions.invoke("comebackCurator", { category, max: 6 });
      const d = res.data;
      toast.success(`Found ${d.found} • Saved ${d.saved} • Rejected ${d.rejected}`);
      qc.invalidateQueries({ queryKey: ["comeback-review"] });
    } catch (e) {
      toast.error("Curator failed: " + (e.message || "unknown error"));
    } finally {
      setRunningCategory(null);
    }
  };

  return (
    <div style={{ minHeight: "100vh", paddingBottom: 140, color: "var(--text)" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 18px 0" }}>

        <Link to="/" style={{ textDecoration: "none" }}>
          <button style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "8px 14px", borderRadius: 999,
            background: "var(--surface)", border: "1px solid var(--border)",
            color: "var(--text-muted)", fontSize: 13, fontWeight: 600,
            cursor: "pointer", marginBottom: 16,
          }}>
            <ArrowLeft style={{ width: 14, height: 14 }} /> Home
          </button>
        </Link>

        <div style={{
          background: "var(--card)",
          border: "1px solid var(--border-glow)",
          borderRadius: 20, padding: 18, marginBottom: 16,
        }}>
          <p style={{
            fontSize: 10, fontWeight: 700, color: "var(--gold)",
            letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 4,
          }}>Admin</p>
          <p style={{
            fontFamily: "'Lora', Georgia, serif",
            fontSize: 20, fontWeight: 600, color: "var(--text)", marginBottom: 4,
          }}>
            Comeback Review
          </p>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
            Approve, reject, or feature curator-generated videos.
          </p>
        </div>

        {/* Curator runner */}
        <div style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 18, padding: 16, marginBottom: 18,
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-dim)", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 10 }}>
            Run Curator
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {COMEBACK_CATEGORIES.map(c => (
              <button
                key={c.key}
                onClick={() => runCurator(c.key)}
                disabled={runningCategory === c.key}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "8px 12px", borderRadius: 999,
                  background: "var(--surface)",
                  border: "1px solid var(--border-glow)",
                  color: "var(--text)", fontSize: 12, fontWeight: 600,
                  cursor: runningCategory === c.key ? "wait" : "pointer",
                }}
              >
                {runningCategory === c.key ? <Loader2 className="animate-spin" style={{ width: 12, height: 12 }} /> : <RefreshCw style={{ width: 12, height: 12 }} />}
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filter */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {["pending", "approved", "rejected", "all"].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                flex: 1, padding: "9px 10px", borderRadius: 999,
                background: filter === s ? "var(--accent)" : "var(--surface)",
                color: filter === s ? "#fff" : "var(--text-muted)",
                border: "1px solid var(--border)",
                fontSize: 12, fontWeight: 700, cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
            <Loader2 className="animate-spin" style={{ width: 24, height: 24, color: "var(--accent)" }} />
          </div>
        ) : videos.length === 0 ? (
          <div style={{
            background: "var(--card)", border: "1px solid var(--border)",
            borderRadius: 18, padding: 32, textAlign: "center",
          }}>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No videos in this state.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {videos.map(v => (
              <ReviewRow
                key={v.id}
                video={v}
                onApprove={() => updateVideo.mutate({ id: v.id, data: { review_status: "approved", reviewed_at: new Date().toISOString() } })}
                onReject={() => updateVideo.mutate({ id: v.id, data: { review_status: "rejected", reviewed_at: new Date().toISOString() } })}
                onFeature={() => updateVideo.mutate({ id: v.id, data: { is_featured: !v.is_featured } })}
                onFeatureToday={() => updateVideo.mutate({ id: v.id, data: { is_featured_today: !v.is_featured_today } })}
                onDelete={() => deleteVideo.mutate(v.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ReviewRow({ video, onApprove, onReject, onFeature, onFeatureToday, onDelete }) {
  const cat = COMEBACK_CATEGORY_BY_KEY[video.category] || {};
  const statusColor = video.review_status === "approved" ? "var(--green)"
                    : video.review_status === "rejected" ? "var(--red)"
                    : "var(--gold)";

  return (
    <div style={{
      background: "var(--card)",
      border: "1px solid var(--border)",
      borderRadius: 16, padding: 14,
      display: "flex", gap: 12,
    }}>
      <img
        src={video.thumbnail_url}
        alt=""
        style={{ width: 120, height: 68, objectFit: "cover", borderRadius: 10, flexShrink: 0 }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
          <span style={{
            fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 999,
            background: statusColor, color: "#0D1220", textTransform: "uppercase", letterSpacing: ".08em",
          }}>{video.review_status}</span>
          <span style={{ fontSize: 10, color: "var(--text-dim)" }}>
            {cat.emoji} {cat.label || video.category}
          </span>
          {video.ai_safety_score != null && (
            <span style={{ fontSize: 10, color: "var(--text-dim)" }}>
              Safety: {video.ai_safety_score}
            </span>
          )}
          {video.is_featured && <Star style={{ width: 12, height: 12, color: "var(--gold)" }} fill="var(--gold)" />}
          {video.is_featured_today && <Sparkles style={{ width: 12, height: 12, color: "var(--gold)" }} />}
        </div>
        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", lineHeight: 1.3, marginBottom: 4 }}>
          {video.title}
        </p>
        {video.ai_takeaway && (
          <p style={{ fontSize: 11.5, color: "var(--text-muted)", fontStyle: "italic", marginBottom: 8 }}>
            "{video.ai_takeaway}"
          </p>
        )}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <a href={video.youtube_url} target="_blank" rel="noreferrer" style={{
            fontSize: 11, color: "var(--accent)", textDecoration: "none",
            padding: "4px 10px", borderRadius: 999, border: "1px solid var(--border)",
          }}>Open ↗</a>
          {video.review_status !== "approved" && (
            <button onClick={onApprove} style={btnStyle("var(--green)")}>
              <Check style={{ width: 12, height: 12 }} /> Approve
            </button>
          )}
          {video.review_status !== "rejected" && (
            <button onClick={onReject} style={btnStyle("var(--red)")}>
              <X style={{ width: 12, height: 12 }} /> Reject
            </button>
          )}
          <button onClick={onFeature} style={btnStyle("var(--gold)", video.is_featured)}>
            <Star style={{ width: 12, height: 12 }} /> {video.is_featured ? "Unfeature" : "Feature"}
          </button>
          <button onClick={onFeatureToday} style={btnStyle("var(--gold)", video.is_featured_today)}>
            <Sparkles style={{ width: 12, height: 12 }} /> {video.is_featured_today ? "Unset Today" : "Today"}
          </button>
          <button onClick={onDelete} style={{
            ...btnStyle("var(--text-dim)"), background: "transparent",
          }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

function btnStyle(color, filled) {
  return {
    display: "inline-flex", alignItems: "center", gap: 4,
    fontSize: 11, fontWeight: 700,
    padding: "5px 10px", borderRadius: 999,
    background: filled ? color : "var(--surface)",
    color: filled ? "#0D1220" : color,
    border: `1px solid ${color}`,
    cursor: "pointer",
  };
}