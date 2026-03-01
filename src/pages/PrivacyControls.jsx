import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, Eye, MessageCircle, BookOpen, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { toast } from "sonner";

const CONTROLS = [
  { type: "peer_dms", label: "Allow Peer DMs", description: "Other members can send you private messages", icon: MessageCircle, defaultEnabled: true },
  { type: "online_status", label: "Show Online Status", description: "Others can see when you're active", icon: Eye, defaultEnabled: false },
  { type: "facility_sharing", label: "Share Progress with Facility", description: "Your counselor can see your engagement data", icon: Shield, defaultEnabled: false },
  { type: "journal_sharing", label: "Allow Journal Sharing", description: "Enables per-entry sharing option in Journal", icon: BookOpen, defaultEnabled: false },
];

export default function PrivacyControls() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: consents = [] } = useQuery({
    queryKey: ["consents"],
    queryFn: () => base44.entities.Consent.filter({ created_by: user.email }),
    enabled: !!user,
  });

  const getConsentValue = (type) => {
    const c = consents.find(c => c.consent_type === type);
    if (c) return c.enabled;
    return CONTROLS.find(ctrl => ctrl.type === type)?.defaultEnabled ?? false;
  };

  const toggleMutation = useMutation({
    mutationFn: async ({ type, enabled }) => {
      const existing = consents.find(c => c.consent_type === type);
      if (existing) {
        return base44.entities.Consent.update(existing.id, { enabled });
      } else {
        return base44.entities.Consent.create({ consent_type: type, enabled });
      }
    },
    onSuccess: (_, { type, enabled }) => {
      queryClient.invalidateQueries(["consents"]);
      // Audit log
      base44.entities.AuditLog.create({
        actor_email: user?.email,
        action: "consent_changed",
        entity_type: "Consent",
        entity_id: type,
        metadata: { consent_type: type, enabled }
      });
      toast.success("Privacy setting updated");
    },
  });

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--bg-primary)' }}>
      <div className="px-5 pt-8 pb-5" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <Link to={createPageUrl("Profile")}>
          <button className="flex items-center gap-1 text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
            <ChevronLeft className="w-4 h-4" strokeWidth={1.5} /> Back
          </button>
        </Link>
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6" style={{ color: 'var(--primary)' }} strokeWidth={1.5} />
          <div>
            <h1>Privacy Controls</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Manage what you share and with whom</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-5 space-y-4 max-w-2xl">
        <div className="p-4 rounded-lg text-sm" style={{ background: 'rgba(74,144,226,0.08)', border: '1px solid rgba(74,144,226,0.2)', color: 'var(--text-secondary)' }}>
          All data shared with your facility is voluntary. You can change these settings at any time. Changes are logged for your security.
        </div>

        {CONTROLS.map(ctrl => {
          const enabled = getConsentValue(ctrl.type);
          return (
            <div key={ctrl.type} className="card">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: enabled ? 'rgba(74,144,226,0.1)' : 'var(--bg-primary)' }}>
                  <ctrl.icon className="w-5 h-5" style={{ color: enabled ? 'var(--primary)' : 'var(--text-muted)' }} strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{ctrl.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{ctrl.description}</p>
                </div>
                <button
                  onClick={() => toggleMutation.mutate({ type: ctrl.type, enabled: !enabled })}
                  className="w-12 h-6 rounded-full relative flex-shrink-0 transition-colors"
                  style={{ background: enabled ? 'var(--primary)' : 'var(--border)' }}
                >
                  <div className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all" style={{ left: enabled ? '26px' : '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                </button>
              </div>
            </div>
          );
        })}

        <p className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>
          Unbound does not store health data in Contentful. Your check-ins, messages, and journal entries remain in your secure personal account only.
        </p>
      </div>
    </div>
  );
}