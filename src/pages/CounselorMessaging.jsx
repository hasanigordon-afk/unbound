import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MessageSquare, Users } from "lucide-react";
import { createPageUrl } from "./utils";
import { Link } from "react-router-dom";
import MessagingInbox from "@/components/messaging/MessagingInbox";
import ComposeMessage from "@/components/messaging/ComposeMessage";

export default function CounselorMessaging() {
  const [view, setView] = useState("inbox"); // "inbox" | "compose"
  const [composeTo, setComposeTo] = useState(null);

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: counselorProfile } = useQuery({
    queryKey: ["counselor-profile", user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.CounselorProfile.filter({ counselor_email: user.email });
      return profiles[0];
    },
    enabled: !!user,
  });

  const { data: facility } = useQuery({
    queryKey: ["facility", counselorProfile?.facility_id],
    queryFn: async () => {
      const facilities = await base44.entities.Facility.filter({ id: counselorProfile.facility_id });
      return facilities[0];
    },
    enabled: !!counselorProfile?.facility_id,
  });

  const { data: participants = [] } = useQuery({
    queryKey: ["facility-participants", facility?.id],
    queryFn: () => base44.entities.ParticipantProfile.filter({ facility_id: facility.id }),
    enabled: !!facility?.id,
  });

  const handleCompose = (recipientEmail = null) => {
    setComposeTo(recipientEmail);
    setView("compose");
  };

  return (
    <div className="min-h-screen" style={{ background: "#F7F7F8" }}>
      {/* Header */}
      <div className="px-6 pt-8 pb-5" style={{ background: "#FFF", borderBottom: "1px solid #D1D1D6" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={createPageUrl("CounselorDashboard")} className="text-sm flex items-center gap-1" style={{ color: "#8E8E93" }}>
              <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            </Link>
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-0.5" style={{ color: "#8E8E93" }}>MESSAGING CENTER</p>
              <h1 className="text-xl font-semibold" style={{ color: "#1E1E1E" }}>Client Communications</h1>
            </div>
          </div>
          {view === "inbox" && (
            <button
              onClick={() => handleCompose()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded"
              style={{ background: "#4A90E2", color: "#FFF", border: "none" }}
            >
              <MessageSquare className="w-4 h-4" strokeWidth={1.5} />
              New Message
            </button>
          )}
          {view === "compose" && (
            <button
              onClick={() => setView("inbox")}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded"
              style={{ background: "#F0F0F3", color: "#5A5A5A", border: "1px solid #D1D1D6" }}
            >
              Back to Inbox
            </button>
          )}
        </div>
      </div>

      <div className="px-6 py-6 max-w-3xl mx-auto">
        {view === "inbox" && (
          <MessagingInbox
            currentUserEmail={user?.email}
            facilityId={facility?.id}
            participants={participants}
            onCompose={handleCompose}
          />
        )}
        {view === "compose" && (
          <ComposeMessage
            senderEmail={user?.email}
            senderRole="counselor"
            facilityId={facility?.id}
            participants={participants}
            initialRecipient={composeTo}
            onSent={() => setView("inbox")}
          />
        )}
      </div>
    </div>
  );
}