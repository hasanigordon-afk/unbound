import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, Phone, Award, Heart } from "lucide-react";

export default function MentorCard({ mentor, onConnect }) {
  const getBadges = () => {
    const badges = [];
    if (mentor.role_type === "peer_mentor") {
      badges.push({ label: "Lived Experience", color: "bg-purple-100 text-purple-700" });
    }
    if (mentor.role_type === "counselor") {
      badges.push({ label: "Licensed Counselor", color: "bg-blue-100 text-blue-700" });
    }
    if (mentor.role_type === "hybrid") {
      badges.push({ label: "Counselor + Lived Experience", color: "bg-indigo-100 text-indigo-700" });
    }
    if (mentor.facility_verified) {
      badges.push({ label: "Facility Verified", color: "bg-green-100 text-green-700" });
    }
    return badges;
  };

  const primaryExperience = mentor.primary_lived_experience || mentor.specialties_substances?.[0] || "Recovery support";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
          <Heart className="w-6 h-6 text-teal-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900">{mentor.display_name}</h3>
          <p className="text-sm text-slate-500">{primaryExperience}</p>
        </div>
        {mentor.rating_avg && (
          <div className="flex items-center gap-1 text-amber-500">
            <Award className="w-4 h-4" />
            <span className="text-sm font-medium">{mentor.rating_avg.toFixed(1)}</span>
          </div>
        )}
      </div>

      <p className="text-sm text-slate-600 mb-4 line-clamp-2">{mentor.bio}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {getBadges().map((badge, i) => (
          <Badge key={i} className={badge.color}>
            {badge.label}
          </Badge>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-4">
        {mentor.communication_modes?.includes("chat") && (
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <MessageCircle className="w-3 h-3" />
            <span>Chat</span>
          </div>
        )}
        {mentor.communication_modes?.includes("voice") && (
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Phone className="w-3 h-3" />
            <span>Voice</span>
          </div>
        )}
      </div>

      <Button 
        onClick={() => onConnect(mentor)} 
        className="w-full bg-teal-600 hover:bg-teal-700"
      >
        Connect
      </Button>
    </div>
  );
}