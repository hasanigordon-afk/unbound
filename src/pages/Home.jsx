import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "./utils";
import { Users, MapPin, Loader2, Phone, Sparkles, CalendarCheck } from "lucide-react";

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
  const navigate = useNavigate();
  
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

  useEffect(() => {
    if (!isLoading && user && (!profile || !profile.onboarding_complete)) {
      navigate(createPageUrl("Onboarding"));
    }
  }, [isLoading, user, profile, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <Loader2 className="w-6 h-6" style={{ color: 'var(--primary)' }} />
      </div>
    );
  }

  const currentQuote = QUOTES[currentQuoteIndex];

  return (
    <div className="min-h-screen pb-24 flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      <div className="px-5 pt-6 pb-4">
        <div className="flex flex-col items-center text-center mb-1">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698cbbdc830161c35d66ad0e/f15d68acb_image.png" 
            alt="Unbound" 
            className="h-10 w-auto mb-3"
          />
          <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--text-muted)' }}>
            Breaking free with nowhere to go but Up
          </p>
          <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'var(--text-secondary)' }}>
            A recovery platform built by someone who lived addiction — designed to keep people connected, accountable, and supported after treatment.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-5">
        <div className="max-w-2xl w-full" style={{ marginTop: '-40px' }}>
          <div style={{ marginBottom: 'var(--spacing-section)' }}>
            {/* Main Quote Display */}
            <div className="card p-8 text-center">
              <p className="text-2xl leading-relaxed mb-4" style={{ color: 'var(--text-primary)', fontWeight: 400 }}>
                "{currentQuote.text}"
              </p>
              <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                — {currentQuote.author}
              </p>
              <button
                onClick={getNewQuote}
                className="btn-primary px-6 py-3"
              >
                Next Quote
              </button>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-3 gap-3" style={{ marginBottom: 'var(--spacing-section)' }}>
            <Link to={createPageUrl("Discover")}>
              <div className="card text-center">
                <Sparkles className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--primary)' }} strokeWidth={2} />
                <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>Discover</p>
              </div>
            </Link>
            <Link to={createPageUrl("Meetings")}>
              <div className="card text-center">
                <CalendarCheck className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--primary)' }} strokeWidth={2} />
                <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>Meetings</p>
              </div>
            </Link>
            <Link to={createPageUrl("Community")}>
              <div className="card text-center">
                <Users className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--primary)' }} strokeWidth={2} />
                <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>Community</p>
              </div>
            </Link>
          </div>

          {/* Progress Indicator */}
          {progressData[0] && (
            <div className="text-center">
              <Link 
                to={createPageUrl("Profile")}
                className="inline-flex items-center gap-2 px-4 py-2"
                style={{ 
                  background: 'rgba(47,243,224,0.1)', 
                  color: 'var(--primary)',
                  borderRadius: 'var(--radius)'
                }}
              >
                <span className="text-sm">Level {progressData[0].level}</span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  • {progressData[0].current_streak}-day streak
                </span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}