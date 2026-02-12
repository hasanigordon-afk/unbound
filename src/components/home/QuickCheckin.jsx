import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { CheckCircle, Sparkles } from "lucide-react";
import moment from "moment";

export default function QuickCheckin() {
  const [score, setScore] = useState(0);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: progressData = [] } = useQuery({
    queryKey: ["user-progress", user?.email],
    queryFn: () => base44.entities.UserProgress.filter({ created_by: user.email }),
    enabled: !!user,
  });

  const submitCheckin = useMutation({
    mutationFn: async () => {
      await base44.entities.Checkin.create({ craving_score: score, note: note || undefined });

      const progress = progressData[0];
      const today = moment().format('YYYY-MM-DD');
      const lastCheckin = progress?.last_checkin_date;
      const yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD');

      let newStreak = 1;
      if (lastCheckin === yesterday) {
        newStreak = (progress?.current_streak || 0) + 1;
      } else if (lastCheckin === today) {
        newStreak = progress?.current_streak || 1;
      }

      const basePoints = 10;
      const streakBonus = newStreak >= 7 ? 20 : newStreak >= 3 ? 10 : 0;
      const totalPoints = basePoints + streakBonus;

      const newTotalPoints = (progress?.total_points || 0) + totalPoints;
      const newLevel = Math.floor(newTotalPoints / 100) + 1;

      const updateData = {
        total_points: newTotalPoints,
        level: newLevel,
        current_streak: newStreak,
        longest_streak: Math.max(newStreak, progress?.longest_streak || 0),
        total_checkins: (progress?.total_checkins || 0) + 1,
        last_checkin_date: today,
      };

      if (progress?.id) {
        await base44.entities.UserProgress.update(progress.id, updateData);
      } else {
        await base44.entities.UserProgress.create(updateData);
      }

      return totalPoints;
    },
    onSuccess: (points) => {
      queryClient.invalidateQueries({ queryKey: ["user-progress"] });
      setPointsEarned(points);
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        setScore(0);
        setNote("");
        setPointsEarned(0);
      }, 3000);
    },
  });

  const handleSave = async () => {
    if (score === 0) return;
    submitCheckin.mutate();
  };

  if (saved) {
    return (
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="rounded-2xl p-6 text-center" style={{ background: 'rgba(47,243,224,0.15)', border: '1px solid rgba(47,243,224,0.2)' }}
      >
        <CheckCircle className="w-8 h-8 mx-auto mb-2" style={{ color: '#2FF3E0' }} />
        <p className="font-medium" style={{ color: '#2FF3E0' }}>Check-in saved!</p>
        {pointsEarned > 0 && (
          <div className="flex items-center justify-center gap-1.5 mt-2 px-3 py-1.5 rounded-full mx-auto w-fit" style={{ background: 'rgba(244,213,94,0.2)' }}>
            <Sparkles className="w-4 h-4" style={{ color: '#F4D35E' }} />
            <span className="text-sm font-bold" style={{ color: '#F4D35E' }}>+{pointsEarned} XP</span>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <div className="glass-card p-5 space-y-4">
      <p className="font-semibold" style={{ color: '#FFFFFF' }}>Quick Check-in</p>
      <div>
        <p className="text-sm mb-3" style={{ color: 'rgba(255,255,255,0.75)' }}>Craving level right now?</p>
        <div className="flex gap-1.5">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
            const isActive = score >= n;
            const bgColor = isActive 
              ? n <= 3 ? "#2FF3E0" : n <= 6 ? "#F4D35E" : "#FF4FD8"
              : "rgba(255,255,255,0.08)";
            return (
              <button
                key={n}
                onClick={() => setScore(n)}
                className="flex-1 aspect-square rounded-lg text-xs font-bold transition-all"
                style={{ background: bgColor, color: isActive ? '#0B0F1F' : 'rgba(255,255,255,0.3)' }}
              >
                {n}
              </button>
            );
          })}
        </div>
      </div>
      <Textarea
        placeholder="How are you feeling? (optional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="rounded-xl resize-none h-20"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#FFFFFF' }}
      />
      <Button
        className="w-full h-12 rounded-xl font-medium transition-all"
        disabled={score === 0 || submitCheckin.isPending}
        onClick={handleSave}
        style={{ background: score === 0 ? 'rgba(47,243,224,0.1)' : '#2FF3E0', color: score === 0 ? 'rgba(255,255,255,0.3)' : '#0B0F1F' }}
      >
        {submitCheckin.isPending ? "Saving..." : "Save Check-in (+10 XP)"}
      </Button>
    </div>
  );
}