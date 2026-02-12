import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Award, Loader2, Lock, Star, Target, Flame, Heart, MapPin, Map, Bookmark, BookMarked, Library, BookOpen, Feather } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ICON_MAP = {
  Award, Star, Target, Flame, Trophy, Heart, MapPin, Map, Bookmark, BookMarked, Library, BookOpen, Feather
};

export default function Achievements() {
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
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

  const { data: allBadges = [] } = useQuery({
    queryKey: ["all-badges"],
    queryFn: () => base44.entities.Badge.list(),
  });

  const progress = progressData[0];
  const earnedBadgeIds = new Set(userBadges.map(b => b.badge_id));

  const canEarnBadge = (badge) => {
    if (!progress) return false;
    const value = progress[badge.criteria_type] || 0;
    return value >= badge.criteria_value;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0B0F1F' }}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#2FF3E0' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: '#0B0F1F' }}>
      <div className="px-5 pt-8 pb-10 rounded-b-3xl" style={{ background: 'linear-gradient(135deg, rgba(123,92,255,0.2), rgba(47,243,224,0.1))' }}>
        <h1 className="text-2xl font-bold mb-2" style={{ color: '#2FF3E0' }}>Achievements</h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>Track your progress and earn badges</p>
      </div>

      <div className="px-5 -mt-5 space-y-5 max-w-lg mx-auto">
        {/* Progress Stats */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(123,92,255,0.2)' }}>
              <Trophy className="w-6 h-6" style={{ color: '#7B5CFF' }} />
            </div>
            <div>
              <h2 className="font-bold text-lg" style={{ color: '#FFFFFF' }}>Level {progress?.level || 1}</h2>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{progress?.total_points || 0} total points</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <p style={{ color: 'rgba(255,255,255,0.5)' }}>Current Streak</p>
              <p className="font-bold text-xl mt-1" style={{ color: '#F4D35E' }}>{progress?.current_streak || 0} days</p>
            </div>
            <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <p style={{ color: 'rgba(255,255,255,0.5)' }}>Badges Earned</p>
              <p className="font-bold text-xl mt-1" style={{ color: '#2FF3E0' }}>{userBadges.length}</p>
            </div>
            <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <p style={{ color: 'rgba(255,255,255,0.5)' }}>Resources Viewed</p>
              <p className="font-bold text-xl mt-1" style={{ color: '#2FF3E0' }}>{progress?.resources_viewed || 0}</p>
            </div>
            <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <p style={{ color: 'rgba(255,255,255,0.5)' }}>Resources Saved</p>
              <p className="font-bold text-xl mt-1" style={{ color: '#7B5CFF' }}>{progress?.resources_saved || 0}</p>
            </div>
            <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <p style={{ color: 'rgba(255,255,255,0.5)' }}>Journal Entries</p>
              <p className="font-bold text-xl mt-1" style={{ color: '#F4D35E' }}>{progress?.journal_entries || 0}</p>
            </div>
            <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <p style={{ color: 'rgba(255,255,255,0.5)' }}>Total Check-ins</p>
              <p className="font-bold text-xl mt-1" style={{ color: '#7B5CFF' }}>{progress?.total_checkins || 0}</p>
            </div>
          </div>
        </div>

        {/* All Badges */}
        <div className="glass-card p-5">
          <h3 className="font-semibold mb-4" style={{ color: '#FFFFFF' }}>All Badges</h3>
          <div className="space-y-3">
            {allBadges.map((badge) => {
              const isEarned = earnedBadgeIds.has(badge.id);
              const canEarn = canEarnBadge(badge);
              const IconComponent = ICON_MAP[badge.icon] || Award;

              return (
                <div key={badge.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: isEarned ? 'rgba(47,243,224,0.1)' : 'rgba(255,255,255,0.05)', border: isEarned ? '1px solid rgba(47,243,224,0.2)' : '1px solid rgba(255,255,255,0.08)' }}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${!isEarned && 'opacity-40'}`} style={{ background: `${badge.color || '#7B5CFF'}20` }}>
                    {isEarned ? (
                      <IconComponent className="w-6 h-6" style={{ color: badge.color || '#7B5CFF' }} />
                    ) : (
                      <Lock className="w-6 h-6" style={{ color: 'rgba(255,255,255,0.3)' }} />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium" style={{ color: isEarned ? '#FFFFFF' : 'rgba(255,255,255,0.5)' }}>{badge.name}</h4>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{badge.description}</p>
                    {!isEarned && canEarn && (
                      <Badge className="mt-2 text-xs" style={{ background: 'rgba(244,213,94,0.2)', color: '#F4D35E' }}>
                        Ready to claim!
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}