import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Globe, UserCheck, ChevronRight, MessageCircle, Loader2 } from "lucide-react";
import NetworkDirectory from "@/components/network/NetworkDirectory";
import RecoveryCircleList from "@/components/network/RecoveryCircleList";
import CircleView from "@/components/network/CircleView";
import ChatWindow from "@/components/chat/ChatWindow";

const TABS = [
  { id: "directory", label: "Directory", icon: Users },
  { id: "circles",   label: "Circles",   icon: Globe },
  { id: "volunteer", label: "Volunteer",  icon: UserCheck },
];

const ROLE_COLORS = {
  peer_mentor:      "#10B981",
  counselor:        "#3B82F6",
  alumni_volunteer: "#F59E0B",
  hybrid:           "#8B5CF6",
};

export default function RecoveryNetwork() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("directory");
  const [activeCircle, setActiveCircle] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: profiles = [] } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => base44.entities.MemberProfile.filter({ created_by: user.email }),
    enabled: !!user,
  });

  const { data: myMentorProfile } = useQuery({
    queryKey: ["my-mentor-profile", user?.email],
    queryFn: () => base44.entities.MentorProfile.filter({ created_by: user.email }),
    enabled: !!user,
    select: data => data?.[0],
  });

  const createConvMutation = useMutation({
    mutationFn: async (mentor) => {
      const conv = await base44.entities.Conversation.create({
        member_user_id: user.id,
        mentor_user_id: mentor.created_by,
        status: "pending",
      });
      return conv;
    },
    onSuccess: (conv) => {
      queryClient.invalidateQueries(["conversations"]);
      setSelectedChat(conv.id);
    },
  });

  const memberProfile = profiles?.[0];

  // If viewing a circle
  if (activeCircle) {
    return (
      <div style={{ background: "linear-gradient(170deg,#070D1A 0%,#0C1525 100%)", minHeight: "100vh" }}>
        <CircleView circle={activeCircle} user={user} onBack={() => setActiveCircle(null)} />
      </div>
    );
  }

  return (
    <div style={{ background: "linear-gradient(170deg,#070D1A 0%,#0C1525 100%)", minHeight: "100vh", paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ padding: "48px 20px 20px" }}>
        <h1 style={{ color: "#FFF", fontSize: 28, fontWeight: 900, lineHeight: 1.2, marginBottom: 4 }}>Recovery Network</h1>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14 }}>Connect with mentors, alumni & peer circles</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid rgba(255,255,255,0.08)", paddingLeft: 20, paddingRight: 20 }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "10px 6px 12px", background: "none", border: "none", borderBottom: tab === id ? "2px solid #3B82F6" : "2px solid transparent", cursor: "pointer", marginBottom: -1 }}>
            <Icon style={{ width: 18, height: 18, color: tab === id ? "#3B82F6" : "rgba(255,255,255,0.35)" }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: tab === id ? "#3B82F6" : "rgba(255,255,255,0.35)" }}>{label}</span>
          </button>
        ))}
      </div>

      <div style={{ padding: "20px 20px 0" }}>
        {tab === "directory" && (
          <NetworkDirectory user={user} memberProfile={memberProfile} onConnect={mentor => createConvMutation.mutate(mentor)} />
        )}

        {tab === "circles" && (
          <RecoveryCircleList user={user} onOpenCircle={setActiveCircle} />
        )}

        {tab === "volunteer" && (
          <VolunteerTab user={user} myMentorProfile={myMentorProfile} />
        )}
      </div>

      {selectedChat && (
        <ChatWindow conversationId={selectedChat} onClose={() => setSelectedChat(null)} />
      )}
    </div>
  );
}

function VolunteerTab({ user, myMentorProfile }) {
  const queryClient = useQueryClient();

  const createProfileMutation = useMutation({
    mutationFn: () => base44.entities.MentorProfile.create({
      display_name: user?.full_name || "Anonymous",
      role_type: "alumni_volunteer",
      is_alumni_volunteer: true,
      tracks_supported: ["both"],
      bio: "",
      communication_modes: ["chat"],
      onboarding_complete: false,
    }),
    onSuccess: () => queryClient.invalidateQueries(["my-mentor-profile"]),
  });

  if (myMentorProfile) {
    const roleColor = ROLE_COLORS[myMentorProfile.role_type] || "#10B981";
    return (
      <div className="flex flex-col gap-4">
        <div style={{ background: `rgba(${hexToRgb(roleColor)},0.1)`, border: `1px solid ${roleColor}30`, borderRadius: 20, padding: "20px 18px" }}>
          <div className="flex items-center gap-3 mb-3">
            <div style={{ fontSize: 32 }}>{myMentorProfile.role_type === "alumni_volunteer" ? "🦅" : "🤝"}</div>
            <div>
              <p style={{ color: "#FFF", fontWeight: 800, fontSize: 17 }}>{myMentorProfile.display_name}</p>
              <span style={{ fontSize: 12, color: roleColor, fontWeight: 700 }}>{myMentorProfile.role_type?.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}</span>
            </div>
          </div>
          {myMentorProfile.bio ? (
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, lineHeight: 1.5 }}>{myMentorProfile.bio}</p>
          ) : (
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, fontStyle: "italic" }}>Your bio is empty — go to the Mentor Onboarding to complete your profile.</p>
          )}
        </div>

        <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 16, padding: "16px 18px" }}>
          <p style={{ color: "#10B981", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>🌱 You're making a difference</p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, lineHeight: 1.5 }}>As an alumni volunteer, you give others the hope you once needed. Your lived experience is your greatest credential.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(16,185,129,0.12))", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 22, padding: "28px 20px", textAlign: "center" }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>🦅</div>
        <h2 style={{ color: "#FFF", fontWeight: 900, fontSize: 22, marginBottom: 8 }}>Become an Alumni Volunteer</h2>
        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.6 }}>
          Your recovery story is powerful. Help someone just starting their journey by sharing what worked for you.
        </p>
      </div>

      {/* What it means */}
      {[
        { emoji: "🤝", title: "Peer Support", desc: "Connect 1-on-1 with people early in recovery who need guidance and encouragement." },
        { emoji: "💬", title: "Circle Facilitation", desc: "Lead a Recovery Circle and create a safe space for your group to share and grow." },
        { emoji: "📅", title: "Flexible Commitment", desc: "Give as much or as little time as you can. Even 30 minutes a week can change a life." },
        { emoji: "🛡️", title: "Verified & Safe", desc: "All volunteers go through a brief review. Your identity stays private until you choose to share." },
      ].map(item => (
        <div key={item.title} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <div style={{ fontSize: 24, flexShrink: 0, marginTop: 2 }}>{item.emoji}</div>
          <div>
            <p style={{ color: "#FFF", fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{item.title}</p>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 1.5 }}>{item.desc}</p>
          </div>
        </div>
      ))}

      <button
        onClick={() => createProfileMutation.mutate()}
        disabled={createProfileMutation.isPending}
        style={{ background: "linear-gradient(130deg, #F59E0B, #10B981)", border: "none", borderRadius: 16, padding: "16px", fontSize: 16, fontWeight: 800, color: "#FFF", cursor: "pointer", marginTop: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
      >
        {createProfileMutation.isPending ? <Loader2 style={{ width: 18, height: 18 }} className="animate-spin" /> : null}
        Start as Alumni Volunteer
        <ChevronRight style={{ width: 18, height: 18 }} />
      </button>

      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, textAlign: "center", lineHeight: 1.5 }}>
        Already a counselor or professional mentor? Complete the full Mentor Onboarding from your Profile.
      </p>
    </div>
  );
}

function hexToRgb(hex) {
  if (!hex || !hex.startsWith("#")) return "255,255,255";
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}