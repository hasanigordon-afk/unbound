import React from "react";
import { Award, Star, Target, Flame, Trophy, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../pages/utils";

const ICON_MAP = {
  Award, Star, Target, Flame, Trophy, Heart
};

export default function BadgesCard({ badges }) {
  const recentBadges = badges?.slice(0, 3) || [];

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold" style={{ color: '#FFFFFF' }}>Recent Badges</h3>
        <Link to={createPageUrl("Achievements")} className="text-xs hover:opacity-80" style={{ color: '#2FF3E0' }}>
          View all
        </Link>
      </div>

      {recentBadges.length === 0 ? (
        <div className="text-center py-6" style={{ color: 'rgba(255,255,255,0.5)' }}>
          <Award className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Complete activities to earn badges!</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {recentBadges.map((badge) => {
            const IconComponent = ICON_MAP[badge.badge_icon] || Award;
            return (
              <div key={badge.id} className="text-center p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ background: `${badge.badge_color}20` }}>
                  <IconComponent className="w-6 h-6" style={{ color: badge.badge_color }} />
                </div>
                <p className="text-xs font-medium truncate" style={{ color: '#FFFFFF' }}>{badge.badge_name}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}