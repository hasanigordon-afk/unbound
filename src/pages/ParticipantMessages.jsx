import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import CounselorMessages from "../components/participant/CounselorMessages";

export default function ParticipantMessages() {
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: profile } = useQuery({
    queryKey: ["participant-profile"],
    queryFn: async () => {
      const profiles = await base44.entities.ParticipantProfile.filter({ participant_email: user.email });
      return profiles[0];
    },
    enabled: !!user,
  });

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--bg-primary)' }}>
      <div className="px-6 pt-8 pb-6" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <Link to={createPageUrl("ParticipantDashboard")}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" strokeWidth={1.5} />
            Back to Dashboard
          </Button>
        </Link>
        <h1 style={{ marginBottom: '4px' }}>Messages</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Stay in touch with your support team</p>
      </div>

      <div className="px-6 py-6">
        {profile?.facility_id ? (
          <CounselorMessages
            participantEmail={user?.email}
            facilityId={profile.facility_id}
          />
        ) : (
          <div className="card text-center py-12">
            <p style={{ color: 'var(--text-muted)' }}>No facility assigned</p>
          </div>
        )}
      </div>
    </div>
  );
}