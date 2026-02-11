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
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900">Nearby Resources</h3>
        <Link to={createPageUrl("Resources")} className="text-xs text-teal-600 hover:text-teal-700">
          See all
        </Link>
      </div>
      <div className="space-y-3">
        {topResources.map(resource => (
          <div key={resource.id} className="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-0">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-slate-900 truncate">{resource.name}</p>
              <p className="text-xs text-slate-500 capitalize">{resource.category?.replace(/_/g, " ")}</p>
              {resource.phone && (
                <a href={`tel:${resource.phone}`} className="text-xs text-teal-600 hover:text-teal-700 flex items-center gap-1 mt-1">
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
  const { data: profiles, isLoading } = useQuery({
    queryKey: ["my-profile"],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.MemberProfile.filter({ created_by: user.email });
    },
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
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="bg-gradient-to-br from-teal-600 to-teal-700 px-5 pt-8 pb-10 rounded-b-3xl">
        <p className="text-teal-100 text-sm mb-1">Welcome back</p>
        <h1 className="text-2xl font-bold text-white">RecoveryLink</h1>
        <div className="mt-3 inline-flex items-center px-3 py-1.5 bg-white/20 backdrop-blur rounded-full">
          <span className="text-xs font-medium text-teal-50">
            {stageLabels[profile.stage] || profile.stage}
          </span>
        </div>
      </div>

      <div className="px-5 -mt-5 space-y-5 max-w-lg mx-auto">
        {/* Track toggle if both */}
        {profile.track === "both" && activeTrack && (
          <TrackToggle activeTrack={activeTrack} onToggle={setActiveTrack} />
        )}

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Link to={createPageUrl("Mentors")}>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow h-full">
              <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center mb-3">
                <Users className="w-5 h-5 text-teal-600" />
              </div>
              <p className="font-semibold text-slate-800 text-sm">Talk to a Mentor</p>
              <p className="text-xs text-slate-400 mt-1">Get matched now</p>
            </div>
          </Link>
          <Link to={createPageUrl("Resources")}>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow h-full">
              <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center mb-3">
                <MapPin className="w-5 h-5 text-amber-600" />
              </div>
              <p className="font-semibold text-slate-800 text-sm">Find Help Near Me</p>
              <p className="text-xs text-slate-400 mt-1">Local resources</p>
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