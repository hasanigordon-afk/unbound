import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, Loader2, User, MapPin, Bookmark } from "lucide-react";

export default function Profile() {
  const { data: user, isLoading: loadingUser } = useQuery({
    queryKey: ["me"],
    queryFn: () => base44.auth.me(),
  });

  const { data: profiles, isLoading: loadingProfile } = useQuery({
    queryKey: ["my-profile"],
    queryFn: async () => {
      const u = await base44.auth.me();
      return base44.entities.MemberProfile.filter({ created_by: u.email });
    },
  });

  const profile = profiles?.[0];

  if (loadingUser || loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
      </div>
    );
  }

  const trackLabel = { alcohol: "Alcohol Recovery", substances: "Substance Recovery", both: "Both Tracks" };
  const stageLabel = {
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
      <div className="px-5 pt-8 pb-4">
        <div className="flex items-center gap-3 mb-6">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698cbbdc830161c35d66ad0e/f15d68acb_image.png" 
            alt="Unbound" 
            className="h-10 w-auto"
          />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center">
              <User className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">{user?.full_name || "Member"}</p>
              <p className="text-sm text-slate-400">{user?.email}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="bg-teal-50 text-teal-700 border-teal-200">
              {trackLabel[profile?.track] || "No track"}
            </Badge>
            <Badge variant="secondary" className="bg-slate-100 text-slate-600">
              {stageLabel[profile?.stage] || "Unknown stage"}
            </Badge>
          </div>
        </div>

        {profile?.location_city && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-4">
            <div className="flex items-center gap-3 text-slate-600">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span className="text-sm">
                {profile.location_city}{profile.location_state ? `, ${profile.location_state}` : ""}
                {profile.location_zip ? ` ${profile.location_zip}` : ""}
              </span>
            </div>
          </div>
        )}

        {profile?.challenges?.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-4">
            <p className="text-sm font-medium text-slate-500 mb-3">Current Challenges</p>
            <div className="flex flex-wrap gap-2">
              {profile.challenges.map((c) => (
                <Badge key={c} variant="outline" className="capitalize">
                  {c.replace(/_/g, " ")}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Link to={createPageUrl("SavedResources")}>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 text-teal-600">
              <Bookmark className="w-5 h-5" />
              <span className="font-medium">Saved Resources</span>
            </div>
          </div>
        </Link>

        <Button
          variant="outline"
          className="w-full h-12 rounded-xl mt-4 text-rose-600 border-rose-200 hover:bg-rose-50"
          onClick={() => base44.auth.logout()}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}