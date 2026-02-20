import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { Calendar, TrendingUp, Users, MapPin, MessageCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ParticipantDashboard() {
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

  const { data: facility } = useQuery({
    queryKey: ["facility", profile?.facility_id],
    queryFn: async () => {
      if (!profile?.facility_id) return null;
      const facilities = await base44.entities.Facility.filter({ id: profile.facility_id });
      return facilities[0];
    },
    enabled: !!profile?.facility_id,
  });

  const { data: checkIns = [] } = useQuery({
    queryKey: ["daily-checkins", user?.email],
    queryFn: () => base44.entities.DailyCheckIn.filter({ participant_email: user.email }, "-check_in_date", 30),
    enabled: !!user,
  });

  const today = new Date().toISOString().split('T')[0];
  const hasCheckedInToday = checkIns.some(c => c.check_in_date === today);

  // Calculate streak
  const calculateStreak = () => {
    if (!checkIns.length) return 0;
    let streak = 0;
    const sortedCheckIns = [...checkIns].sort((a, b) => new Date(b.check_in_date) - new Date(a.check_in_date));
    
    let currentDate = new Date();
    for (let checkIn of sortedCheckIns) {
      const checkInDate = new Date(checkIn.check_in_date);
      const daysDiff = Math.floor((currentDate - checkInDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= 1) {
        streak++;
        currentDate = checkInDate;
      } else {
        break;
      }
    }
    return streak;
  };

  // Calculate sobriety days
  const calculateSobrietyDays = () => {
    if (!profile?.sobriety_start_date) return 0;
    const start = new Date(profile.sobriety_start_date);
    const now = new Date();
    return Math.floor((now - start) / (1000 * 60 * 60 * 24));
  };

  // This week's stats
  const getWeekStats = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const thisWeekCheckIns = checkIns.filter(c => new Date(c.check_in_date) >= weekAgo);
    
    return {
      meetings: thisWeekCheckIns.filter(c => c.attended_meeting).length,
      sponsorConnections: thisWeekCheckIns.filter(c => c.connected_with_sponsor).length,
    };
  };

  const streak = calculateStreak();
  const sobrietyDays = calculateSobrietyDays();
  const weekStats = getWeekStats();

  return (
    <div className="min-h-screen pb-24" style={{ background: '#1a1f3a' }}>
      {/* Header */}
      <div className="px-6 pt-8 pb-6" style={{ background: '#0f1628', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#ffffff' }}>Dashboard</h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Track your daily engagement</p>
      </div>

      {/* Legal Disclaimer Banner */}
      <div className="mx-6 mt-6 p-4 rounded-lg" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)' }}>
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#fbbf24' }} />
          <div>
            <p className="text-sm font-medium mb-1" style={{ color: '#fbbf24' }}>Important Notice</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Unbound does not provide medical advice or treatment. In case of emergency, call 911 immediately.
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Daily Check-In CTA */}
        {!hasCheckedInToday && (
          <Link to={createPageUrl("DailyCheckIn")}>
            <div className="p-6 rounded-xl text-center" style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', boxShadow: '0 4px 20px rgba(251,191,36,0.3)' }}>
              <Calendar className="w-12 h-12 mx-auto mb-3" style={{ color: '#0f1628' }} />
              <h2 className="text-xl font-bold mb-2" style={{ color: '#0f1628' }}>Complete Daily Check-In</h2>
              <p className="text-sm" style={{ color: 'rgba(15,22,40,0.8)' }}>Track your progress today</p>
            </div>
          </Link>
        )}

        {hasCheckedInToday && (
          <div className="p-6 rounded-xl text-center" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
            <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.2)' }}>
              <Calendar className="w-6 h-6" style={{ color: '#22c55e' }} />
            </div>
            <h2 className="text-lg font-bold mb-1" style={{ color: '#22c55e' }}>Check-In Complete</h2>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Great job staying engaged today!</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-5 rounded-xl" style={{ background: '#0f1628', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Sobriety Streak</p>
            <p className="text-3xl font-bold" style={{ color: '#fbbf24' }}>{sobrietyDays}</p>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>days</p>
          </div>

          <div className="p-5 rounded-xl" style={{ background: '#0f1628', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Check-In Streak</p>
            <p className="text-3xl font-bold" style={{ color: '#22c55e' }}>{streak}</p>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>days</p>
          </div>

          <div className="p-5 rounded-xl" style={{ background: '#0f1628', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Meetings This Week</p>
            <p className="text-3xl font-bold" style={{ color: '#60a5fa' }}>{weekStats.meetings}</p>
          </div>

          <div className="p-5 rounded-xl" style={{ background: '#0f1628', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Sponsor Connections</p>
            <p className="text-3xl font-bold" style={{ color: '#60a5fa' }}>{weekStats.sponsorConnections}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold px-2" style={{ color: 'rgba(255,255,255,0.7)' }}>Quick Access</h3>
          
          <Link to={createPageUrl("ReintegrationMap")}>
            <div className="p-5 rounded-xl hover:opacity-90 transition-opacity" style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(245,158,11,0.2))', border: '1px solid rgba(251,191,36,0.3)' }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'rgba(251,191,36,0.3)' }}>
                  <Calendar className="w-6 h-6" style={{ color: '#fbbf24' }} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold" style={{ color: '#ffffff' }}>90-Day Reintegration Map</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Track your structured progress</p>
                </div>
              </div>
            </div>
          </Link>

          <Link to={createPageUrl("ParticipantProgress")}>
            <div className="p-4 rounded-xl flex items-center gap-4 hover:opacity-90 transition-opacity" style={{ background: '#0f1628', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'rgba(96,165,250,0.15)' }}>
                <TrendingUp className="w-6 h-6" style={{ color: '#60a5fa' }} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm" style={{ color: '#ffffff' }}>View Progress</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>See your trends and history</p>
              </div>
            </div>
          </Link>

          <Link to={createPageUrl("ResourceDirectory")}>
            <div className="p-4 rounded-xl flex items-center gap-4 hover:opacity-90 transition-opacity" style={{ background: '#0f1628', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'rgba(96,165,250,0.15)' }}>
                <MapPin className="w-6 h-6" style={{ color: '#60a5fa' }} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm" style={{ color: '#ffffff' }}>Resource Directory</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Jobs, housing, food, meetings</p>
              </div>
            </div>
          </Link>

          <Link to={createPageUrl("ParticipantMessages")}>
            <div className="p-4 rounded-xl flex items-center gap-4 hover:opacity-90 transition-opacity" style={{ background: '#0f1628', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.15)' }}>
                <MessageCircle className="w-6 h-6" style={{ color: '#22c55e' }} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm" style={{ color: '#ffffff' }}>Messages</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Connect with your counselor</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Emergency Help */}
        <div className="p-5 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
          <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: '#ef4444' }}>
            <AlertCircle className="w-5 h-5" />
            Emergency Help
          </h3>
          <div className="space-y-2 text-sm">
            <a href="tel:911" className="block p-3 rounded-lg font-medium" style={{ background: 'rgba(239,68,68,0.15)', color: '#ffffff' }}>
              Call 911 - Emergency
            </a>
            <a href="tel:988" className="block p-3 rounded-lg font-medium" style={{ background: 'rgba(239,68,68,0.15)', color: '#ffffff' }}>
              Call 988 - Crisis Lifeline
            </a>
            {facility?.crisis_phone && (
              <a href={`tel:${facility.crisis_phone}`} className="block p-3 rounded-lg font-medium" style={{ background: 'rgba(239,68,68,0.15)', color: '#ffffff' }}>
                Call {facility.crisis_phone} - {facility.facility_name}
              </a>
            )}
            <a href="sms:741741" className="block p-3 rounded-lg font-medium" style={{ background: 'rgba(239,68,68,0.15)', color: '#ffffff' }}>
              Text HOME to 741741 - Crisis Text Line
            </a>
          </div>
        </div>

        {/* Footer */}
        {facility && (
          <p className="text-center text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Powered by Unbound
          </p>
        )}
      </div>
    </div>
  );
}