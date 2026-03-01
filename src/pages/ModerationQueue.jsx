import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, Flag, User, MessageSquare, Trash2, EyeOff, VolumeX, Ban, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { toast } from "sonner";
import moment from "moment";

const ACTION_CONFIG = {
  warn: { label: "Warn", icon: Flag, color: "#FF9800" },
  mute: { label: "Mute", icon: VolumeX, color: "#9C6FE4" },
  suspend: { label: "Suspend", icon: EyeOff, color: "#E85D4C" },
  ban: { label: "Ban", icon: Ban, color: "#991b1b" },
  delete_post: { label: "Delete Post", icon: Trash2, color: "#E85D4C" },
};

const REASON_COLORS = {
  spam: "#FF9800",
  harassment: "#E85D4C",
  hate_speech: "#991b1b",
  inappropriate: "#9C6FE4",
  self_harm: "#E85D4C",
  other: "#6B7280",
};

export default function ModerationQueue() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("pending");

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: reports = [] } = useQuery({
    queryKey: ["reports", statusFilter],
    queryFn: async () => {
      const all = await base44.entities.Report.filter({ status: statusFilter });
      return all.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
  });

  const { data: actions = [] } = useQuery({
    queryKey: ["moderation-actions"],
    queryFn: () => base44.entities.ModerationAction.list('-created_date', 50),
  });

  const actionMutation = useMutation({
    mutationFn: async ({ report, actionType, reason }) => {
      // Create moderation action
      await base44.entities.ModerationAction.create({
        admin_email: user?.email,
        action_type: actionType,
        target_type: report.target_type,
        target_id: report.target_id,
        target_email: report.reporter_user_id,
        reason: reason || report.reason,
      });

      // Update report status
      await base44.entities.Report.update(report.id, { status: "resolved" });

      // Audit log
      await base44.entities.AuditLog.create({
        actor_email: user?.email,
        action: `moderation_${actionType}`,
        entity_type: report.target_type,
        entity_id: report.target_id,
        metadata: { report_id: report.id, reason: report.reason }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["reports"]);
      queryClient.invalidateQueries(["moderation-actions"]);
      toast.success("Action taken");
    },
  });

  const dismissMutation = useMutation({
    mutationFn: (reportId) => base44.entities.Report.update(reportId, { status: "dismissed" }),
    onSuccess: () => {
      queryClient.invalidateQueries(["reports"]);
      toast.success("Report dismissed");
    },
  });

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--bg-primary)' }}>
      <div className="px-5 pt-8 pb-5" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <Link to={createPageUrl("PlatformAdmin")}>
          <button className="flex items-center gap-1 text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
            <ChevronLeft className="w-4 h-4" strokeWidth={1.5} /> Back
          </button>
        </Link>
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6" style={{ color: '#E85D4C' }} strokeWidth={1.5} />
          <div>
            <h1>Moderation Queue</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Review reported content and users</p>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          {["pending", "resolved", "dismissed"].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="text-xs px-3 py-1.5 rounded-full capitalize font-medium"
              style={{
                background: statusFilter === s ? 'var(--primary)' : 'var(--bg-primary)',
                color: statusFilter === s ? '#FFF' : 'var(--text-secondary)',
                border: `1px solid ${statusFilter === s ? 'transparent' : 'var(--border)'}`
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 py-5 space-y-4 max-w-3xl">
        {reports.length === 0 ? (
          <div className="card text-center py-16">
            <Shield className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} strokeWidth={1.5} />
            <p style={{ color: 'var(--text-muted)' }}>No {statusFilter} reports</p>
          </div>
        ) : (
          reports.map(report => (
            <div key={report.id} className="card">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <Badge
                    className="text-[10px] px-2 py-0.5 uppercase"
                    style={{ background: `${REASON_COLORS[report.reason] || '#6B7280'}20`, color: REASON_COLORS[report.reason] || '#6B7280' }}
                  >
                    {report.reason?.replace(/_/g, " ")}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] px-2 py-0.5 uppercase">
                    {report.target_type}
                  </Badge>
                </div>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {moment(report.created_date).fromNow()}
                </span>
              </div>

              <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                <span className="font-medium">Target ID:</span> {report.target_id}
              </p>

              {report.details && (
                <p className="text-sm mb-3 p-3 rounded-lg" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                  "{report.details}"
                </p>
              )}

              {statusFilter === "pending" && (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(ACTION_CONFIG).map(([actionType, cfg]) => (
                    <button
                      key={actionType}
                      onClick={() => actionMutation.mutate({ report, actionType })}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium"
                      style={{ background: `${cfg.color}15`, color: cfg.color, border: `1px solid ${cfg.color}30` }}
                    >
                      <cfg.icon className="w-3 h-3" strokeWidth={2} />
                      {cfg.label}
                    </button>
                  ))}
                  <button
                    onClick={() => dismissMutation.mutate(report.id)}
                    className="text-xs px-3 py-1.5 rounded-lg font-medium"
                    style={{ background: 'var(--bg-primary)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          ))
        )}

        {/* Recent actions log */}
        {actions.length > 0 && (
          <div className="card">
            <h3 className="mb-4">Recent Moderation Actions</h3>
            <div className="space-y-2">
              {actions.slice(0, 10).map(action => (
                <div key={action.id} className="flex items-center gap-3 py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                  <Badge
                    className="text-[10px] px-2 py-0.5 uppercase flex-shrink-0"
                    style={{ background: `${ACTION_CONFIG[action.action_type]?.color || '#6B7280'}15`, color: ACTION_CONFIG[action.action_type]?.color || '#6B7280' }}
                  >
                    {action.action_type?.replace(/_/g, " ")}
                  </Badge>
                  <span className="text-xs flex-1" style={{ color: 'var(--text-secondary)' }}>
                    {action.target_type} · {action.target_id?.slice(0, 12)}...
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {moment(action.created_date).fromNow()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}