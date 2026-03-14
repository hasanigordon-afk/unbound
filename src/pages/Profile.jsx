import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, Loader2, User, MapPin, Bookmark, Target, Calendar, Heart } from "lucide-react";

const DEMO_PROFILE = {
  full_name: "Demo Participant",
  email: "demo@unbound.app",
  track: "substances",
  stage: "early_recovery_15_90",
  location_city: "Newark",
  location_state: "NJ",
  challenges: ["housing", "employment", "legal", "mental_health"],
};

export default function Profile() {
  const { data: user, isLoading: loadingUser } = useQuery({
    queryKey: ["me"],
    queryFn: () => base44.auth.me(),
  });

  const { data: profiles, isLoading: loadingProfile } = useQuery({
    queryKey: ["my-profile", user?.email],
    queryFn: async () => {
      const u = await base44.auth.me();
      return base44.entities.MemberProfile.filter({ created_by: u.email });
    },
    enabled: !!user,
  });

  const { data: goals = [] } = useQuery({
    queryKey: ["goals-profile", user?.email],
    queryFn: () => base44.entities.Goal.filter({ created_by: user.email }),
    enabled: !!user,
  });

  const { data: demoGoals = [] } = useQuery({
    queryKey: ["goals-profile-demo"],
    queryFn: () => base44.entities.Goal.list("-created_date", 5),
    enabled: !user,
  });

  if (loadingUser || loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
      </div>
    );
  }

  const profile = profiles?.[0];
  const isDemo = !user;
  const displayUser = user || { full_name: DEMO_PROFILE.full_name, email: DEMO_PROFILE.email };
  const displayProfile = profile || (isDemo ? DEMO_PROFILE : null);
  const displayGoals = (user ? goals : demoGoals).slice(0, 4);

  const trackLabel = { alcohol: "Alcohol Recovery", substances: "Substance Recovery", both: "Alcohol & Substances" };
  const stageLabel = {
    using_currently: "Still using",
    trying_to_stop: "Want to stop",
    detox_last_14_days: "Just stopped",
    early_recovery_15_90: "Early recovery",
    recovery_3_12_months: "A few months in",
    long_term_1_year_plus: "Over a year strong",
    relapsed_recently: "Getting back up",
  };

  const activeGoals = displayGoals.filter(g => g.status === "active").length;
  const completedGoals = displayGoals.filter(g => g.status === "completed").length;

  return (
    <div className="min-h-screen pb-24" style={{ background: "#F5F5F7" }}>
      {isDemo && (
        <div style={{ background: "#4A90E2", color: "#FFF", textAlign: "center", padding: "10px 16px", fontSize: 13, fontWeight: 500 }}>
          👤 Viewing demo profile — sign in to see your own data
        </div>
      )}

      <div className="px-5 pt-6 pb-4">

        {/* Avatar + Identity */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white"
              style={{ background: "linear-gradient(135deg, #4A90E2, #7B5CFF)" }}>
              {displayUser.full_name?.charAt(0) || "U"}
            </div>
            <div>
              <p className="font-semibold text-lg text-slate-800">{displayUser.full_name || "You"}</p>
              <p className="text-sm text-slate-400">{displayUser.email}</p>
              {isDemo && <span className="text-xs text-blue-500 font-medium">Demo account</span>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {displayProfile?.track && (
              <Badge className="bg-teal-50 text-teal-700 border-teal-200">
                {trackLabel[displayProfile.track] || displayProfile.track}
              </Badge>
            )}
            {displayProfile?.stage && (
              <Badge className="bg-slate-100 text-slate-600">
                {stageLabel[displayProfile.stage] || displayProfile.stage}
              </Badge>
            )}
          </div>
        </div>

        {/* Location */}
        {displayProfile?.location_city ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4">
            <div className="flex items-center gap-3 text-slate-600">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span className="text-sm">
                {displayProfile.location_city}{displayProfile.location_state ? `, ${displayProfile.location_state}` : ""}
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-4 mb-4">
            <div className="flex items-center gap-3 text-slate-400">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">No location set — used to find nearby resources</span>
            </div>
          </div>
        )}

        {/* Focus Areas */}
        {displayProfile?.challenges?.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4">
            <p className="text-sm font-medium text-slate-500 mb-3">What I'm focused on</p>
            <div className="flex flex-wrap gap-2">
              {displayProfile.challenges.map((c) => (
                <Badge key={c} variant="outline" className="capitalize text-xs">
                  {c.replace(/_/g, " ")}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <Link to={createPageUrl("Goals")}>
            <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
              <p className="text-2xl font-bold text-teal-600">{activeGoals}</p>
              <p className="text-xs text-slate-500 mt-1">Active Goals</p>
            </div>
          </Link>
          <Link to={createPageUrl("Goals")}>
            <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
              <p className="text-2xl font-bold text-emerald-500">{completedGoals}</p>
              <p className="text-xs text-slate-500 mt-1">Completed</p>
            </div>
          </Link>
          <Link to={createPageUrl("ForwardPlan")}>
            <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
              <Target className="w-5 h-5 text-purple-500 mx-auto mb-1" />
              <p className="text-xs text-slate-500">My Plan</p>
            </div>
          </Link>
        </div>

        {/* Quick Links */}
        <div className="space-y-2 mb-4">
          <Link to={createPageUrl("SavedResources")}>
            <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3 hover:shadow-sm transition-shadow">
              <Bookmark className="w-5 h-5 text-teal-600" />
              <span className="font-medium text-slate-700">Saved places</span>
              <span className="ml-auto text-slate-400 text-sm">→</span>
            </div>
          </Link>
          <Link to={createPageUrl("DailyCheckIn")}>
            <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3 hover:shadow-sm transition-shadow">
              <Calendar className="w-5 h-5 text-blue-500" />
              <span className="font-medium text-slate-700">Daily check-in</span>
              <span className="ml-auto text-slate-400 text-sm">→</span>
            </div>
          </Link>
          <Link to={createPageUrl("FindHelpNow")}>
            <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3 hover:shadow-sm transition-shadow">
              <Heart className="w-5 h-5 text-rose-500" />
              <span className="font-medium text-slate-700">Find help near me</span>
              <span className="ml-auto text-slate-400 text-sm">→</span>
            </div>
          </Link>
        </div>

        {user && (
          <Button
            variant="outline"
            className="w-full h-12 rounded-xl text-rose-600 border-rose-200 hover:bg-rose-50"
            onClick={() => base44.auth.logout()}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        )}

        {!user && (
          <Button
            className="w-full h-12 rounded-xl"
            style={{ background: "#4A90E2", color: "#FFF" }}
            onClick={() => base44.auth.redirectToLogin()}
          >
            Sign In to Save Your Progress
          </Button>
        )}
      </div>
    </div>
  );
}