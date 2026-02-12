import React from "react";
import { Trophy, Zap, Flame, Target } from "lucide-react";

export default function ProgressCard({ progress }) {
  const pointsToNextLevel = (progress?.level || 1) * 100;
  const currentLevelPoints = progress?.total_points % pointsToNextLevel || 0;
  const levelProgress = (currentLevelPoints / pointsToNextLevel) * 100;

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold" style={{ color: '#FFFFFF' }}>Your Progress</h3>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: 'rgba(123,92,255,0.2)', border: '1px solid rgba(123,92,255,0.3)' }}>
          <Trophy className="w-4 h-4" style={{ color: '#7B5CFF' }} />
          <span className="text-sm font-bold" style={{ color: '#7B5CFF' }}>Level {progress?.level || 1}</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Points and Level Progress */}
        <div>
          <div className="flex items-center justify-between text-xs mb-2" style={{ color: 'rgba(255,255,255,0.75)' }}>
            <span>{currentLevelPoints} / {pointsToNextLevel} XP</span>
            <span>{Math.round(levelProgress)}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${levelProgress}%`, background: 'linear-gradient(90deg, #7B5CFF, #2FF3E0)' }} />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(47,243,224,0.1)' }}>
            <Zap className="w-5 h-5 mx-auto mb-1" style={{ color: '#2FF3E0' }} />
            <p className="text-lg font-bold" style={{ color: '#FFFFFF' }}>{progress?.total_points || 0}</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Points</p>
          </div>
          <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(244,213,94,0.1)' }}>
            <Flame className="w-5 h-5 mx-auto mb-1" style={{ color: '#F4D35E' }} />
            <p className="text-lg font-bold" style={{ color: '#FFFFFF' }}>{progress?.current_streak || 0}</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Day Streak</p>
          </div>
          <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(123,92,255,0.1)' }}>
            <Target className="w-5 h-5 mx-auto mb-1" style={{ color: '#7B5CFF' }} />
            <p className="text-lg font-bold" style={{ color: '#FFFFFF' }}>{progress?.total_checkins || 0}</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Check-ins</p>
          </div>
        </div>
      </div>
    </div>
  );
}