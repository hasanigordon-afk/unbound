import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { Users, MapPin, Loader2, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import QuickCheckin from "../components/home/QuickCheckin";
import TrackToggle from "../components/home/TrackToggle";
import ProgressCard from "../components/gamification/ProgressCard";
import BadgesCard from "../components/gamification/BadgesCard";

function NearbyResources({ profile }) {
  const { data: resources = [] } = useQuery({
    queryKey: ["nearby-resources", profile?.location_city],
    queryFn: () => {
      if (!profile?.location_city) return [];
      return base44.entities.Resource.filter({ city: profile.location_city });
    },
    enabled: !!profile?.location_city,
  });

  if (!resources.length) return null;

  const topResources = resources.slice(0, 3);

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold" style={{ color: '#FFFFFF' }}>Nearby Resources</h3>
        <Link to={createPageUrl("Resources")} className="text-xs hover:opacity-80" style={{ color: '#2FF3E0' }}>
          See all
        </Link>
      </div>
      <div className="space-y-3">
        {topResources.map(resource => (
          <div key={resource.id} className="flex items-start gap-3 pb-3 last:border-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(244,213,94,0.15)' }}>
              <MapPin className="w-4 h-4" style={{ color: '#F4D35E' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate" style={{ color: '#FFFFFF' }}>{resource.name}</p>
              <p className="text-xs capitalize" style={{ color: 'rgba(255,255,255,0.5)' }}>{resource.category?.replace(/_/g, " ")}</p>
              {resource.phone && (
                <a href={`tel:${resource.phone}`} className="text-xs flex items-center gap-1 mt-1 hover:opacity-80" style={{ color: '#2FF3E0' }}>
                  <Phone className="w-3 h-3" />
                  {resource.phone}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: profiles, isLoading } = useQuery({
    queryKey: ["my-profile"],
    queryFn: async () => {
      return base44.entities.MemberProfile.filter({ created_by: user.email });
    },
    enabled: !!user,
  });

  const { data: progressData = [] } = useQuery({
    queryKey: ["user-progress", user?.email],
    queryFn: () => base44.entities.UserProgress.filter({ created_by: user.email }),
    enabled: !!user,
  });

  const { data: userBadges = [] } = useQuery({
    queryKey: ["user-badges", user?.email],
    queryFn: () => base44.entities.UserBadge.filter({ created_by: user.email }),
    enabled: !!user,
  });

  const profile = profiles?.[0];

  useEffect(() => {
    if (!isLoading && !profile) {
      window.location.href = createPageUrl("Onboarding");
    }
  }, [isLoading, profile]);

  const [activeTrack, setActiveTrack] = useState(null);

  useEffect(() => {
    if (profile) {
      setActiveTrack(
        profile.track === "both"
          ? profile.default_track || "alcohol"
          : profile.track
      );
    }
  }, [profile]);

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
      </div>
    );
  }

  const stageLabels = {
    using_currently: "Currently using",
    trying_to_stop: "Trying to stop",
    detox_last_14_days: "In detox",
    early_recovery_15_90: "Early recovery",
    recovery_3_12_months: "In recovery",
    long_term_1_year_plus: "Long-term recovery",
    relapsed_recently: "Getting back on track",
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: '#0B0F1F' }}>
      <div className="px-5 pt-8 pb-10 rounded-b-3xl" style={{ background: 'linear-gradient(135deg, rgba(123,92,255,0.2), rgba(47,243,224,0.1))' }}>
        <p className="text-sm mb-1" style={{ color: 'rgba(255,255,255,0.75)' }}>Welcome back</p>
        <h1 className="text-2xl font-bold" style={{ color: '#2FF3E0' }}>RecoveryLink</h1>
        <div className="mt-3 inline-flex items-center px-3 py-1.5 backdrop-blur rounded-full" style={{ background: 'rgba(47,243,224,0.15)', border: '1px solid rgba(47,243,224,0.2)' }}>
          <span className="text-xs font-medium" style={{ color: '#2FF3E0' }}>
            {stageLabels[profile.stage] || profile.stage}
          </span>
        </div>
      </div>

      <div className="px-5 -mt-5 space-y-5 max-w-lg mx-auto">
        {/* Track toggle if both */}
        {profile.track === "both" && activeTrack && (
          <TrackToggle activeTrack={activeTrack} onToggle={setActiveTrack} />
        )}

        {/* Progress Card */}
        <ProgressCard progress={progressData[0]} />

        {/* Badges Card */}
        <BadgesCard badges={userBadges} />

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Link to={createPageUrl("Mentors")}>
            <div className="glass-card p-5 hover:shadow-md transition-all h-full">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(47,243,224,0.15)' }}>
                <Users className="w-5 h-5" style={{ color: '#2FF3E0' }} />
              </div>
              <p className="font-semibold text-sm" style={{ color: '#FFFFFF' }}>Talk to a Mentor</p>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Get matched now</p>
            </div>
            </Link>
            <Link to={createPageUrl("Resources")}>
            <div className="glass-card p-5 hover:shadow-md transition-all h-full">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(244,213,94,0.15)' }}>
                <MapPin className="w-5 h-5" style={{ color: '#F4D35E' }} />
              </div>
              <p className="font-semibold text-sm" style={{ color: '#FFFFFF' }}>Find Help Near Me</p>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Local resources</p>
            </div>
          </Link>
        </div>

        {/* Nearby resources quick list */}
        <NearbyResources profile={profile} />

        {/* Quick check-in */}
        <QuickCheckin />
      </div>
    </div>
  );
}