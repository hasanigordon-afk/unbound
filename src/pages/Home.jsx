import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { Users, MapPin, Loader2, Phone, Sparkles, Quote } from "lucide-react";

const QUOTES = [
  { text: "Every day is a new beginning. Take a deep breath and start again.", author: "Unknown" },
  { text: "Recovery is not a race. You don't have to feel guilty if it takes you longer than you thought it would.", author: "Unknown" },
  { text: "Fall seven times, stand up eight.", author: "Japanese Proverb" },
  { text: "You are braver than you believe, stronger than you seem, and smarter than you think.", author: "A.A. Milne" },
  { text: "The only way out is through.", author: "Robert Frost" },
  { text: "Your story isn't over yet.", author: "Unknown" },
  { text: "One day at a time.", author: "Unknown" },
  { text: "Progress, not perfection.", author: "Unknown" },
  { text: "You are worthy of recovery.", author: "Unknown" },
  { text: "The comeback is always stronger than the setback.", author: "Unknown" },
  { text: "Rock bottom became the solid foundation on which I rebuilt my life.", author: "J.K. Rowling" },
  { text: "Recovery is an acceptance that your life is in shambles and you have to change it.", author: "Jamie Lee Curtis" },
  { text: "It's not about perfect. It's about effort.", author: "Jillian Michaels" },
  { text: "You don't have to see the whole staircase, just take the first step.", author: "Martin Luther King Jr." },
  { text: "Strength doesn't come from what you can do. It comes from overcoming the things you once thought you couldn't.", author: "Rikki Rogers" }
];
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import QuickCheckin from "../components/home/QuickCheckin";
import TrackToggle from "../components/home/TrackToggle";
import ProgressCard from "../components/gamification/ProgressCard";

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



  const profile = profiles?.[0];

  const [activeTrack, setActiveTrack] = useState(null);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(Math.floor(Math.random() * QUOTES.length));
  
  const getNewQuote = () => {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * QUOTES.length);
    } while (newIndex === currentQuoteIndex && QUOTES.length > 1);
    setCurrentQuoteIndex(newIndex);
  };

  useEffect(() => {
    if (profile) {
      setActiveTrack(
        profile.track === "both"
          ? profile.default_track || "alcohol"
          : profile.track
      );
    }
  }, [profile]);

  if (isLoading) {
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
        <div className="flex items-center gap-3 mb-4">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698cbbdc830161c35d66ad0e/f15d68acb_image.png" 
            alt="Unbound" 
            className="h-12 w-auto"
          />
        </div>
        <p className="text-sm mb-1" style={{ color: 'rgba(255,255,255,0.75)' }}>Welcome back</p>
        <h1 className="text-2xl font-bold" style={{ color: '#2FF3E0' }}>Unbound</h1>
        {profile?.stage && (
          <div className="mt-3 inline-flex items-center px-3 py-1.5 backdrop-blur rounded-full" style={{ background: 'rgba(47,243,224,0.15)', border: '1px solid rgba(47,243,224,0.2)' }}>
            <span className="text-xs font-medium" style={{ color: '#2FF3E0' }}>
              {stageLabels[profile.stage] || profile.stage}
            </span>
          </div>
        )}
      </div>

      <div className="px-5 -mt-5 space-y-5 max-w-lg mx-auto">
        {/* Daily Quote */}
        <div className="glass-card p-5 text-center relative overflow-hidden">
          <Quote className="absolute top-3 right-3 w-8 h-8 opacity-10" style={{ color: '#2FF3E0' }} />
          <p className="text-base leading-relaxed italic mb-2" style={{ color: '#FFFFFF' }}>
            "{currentQuote}"
          </p>
          <button
            onClick={() => setCurrentQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)])}
            className="text-xs hover:opacity-80 transition-opacity"
            style={{ color: '#2FF3E0' }}
          >
            New Quote
          </button>
        </div>

        {/* Track toggle if both */}
        {profile.track === "both" && activeTrack && (
          <TrackToggle activeTrack={activeTrack} onToggle={setActiveTrack} />
        )}

        {/* Progress Card */}
        <ProgressCard progress={progressData[0]} />

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

        {/* Meditation Card */}
        <Link to={createPageUrl("Meditation")}>
          <div className="glass-card p-5 hover:shadow-md transition-all">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(123,92,255,0.2), rgba(47,243,224,0.2))' }}>
                <Sparkles className="w-6 h-6" style={{ color: '#7B5CFF' }} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm" style={{ color: '#FFFFFF' }}>Meditation & Relaxation</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Binaural beats & calming visuals</p>
              </div>
            </div>
          </div>
        </Link>

        {/* Nearby resources quick list */}
        <NearbyResources profile={profile} />

        {/* Quick check-in */}
        <QuickCheckin />
      </div>
    </div>
  );
}