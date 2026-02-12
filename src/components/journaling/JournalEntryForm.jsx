import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, Check, Sparkles } from "lucide-react";

const MOODS = [
  { value: "grateful", label: "Grateful", color: "#2FF3E0" },
  { value: "hopeful", label: "Hopeful", color: "#7B5CFF" },
  { value: "struggling", label: "Struggling", color: "#FF4FD8" },
  { value: "peaceful", label: "Peaceful", color: "#F4D35E" },
  { value: "frustrated", label: "Frustrated", color: "#FF6B6B" },
  { value: "proud", label: "Proud", color: "#2FF3E0" },
];

export default function JournalEntryForm({ prompt, onClose }) {
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("");
  const [saved, setSaved] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  const queryClient = useQueryClient();

  const { data: progressData = [] } = useQuery({
    queryKey: ["user-progress"],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.UserProgress.filter({ created_by: user.email });
    },
  });

  const saveEntry = useMutation({
    mutationFn: async () => {
      await base44.entities.JournalEntry.create({
        prompt,
        content,
        mood: mood || undefined,
      });

      const progress = progressData[0];
      const points = 15;
      const newTotalPoints = (progress?.total_points || 0) + points;
      const newLevel = Math.floor(newTotalPoints / 100) + 1;

      const newJournalEntries = (progress?.journal_entries || 0) + 1;

      const updateData = {
        total_points: newTotalPoints,
        level: newLevel,
        journal_entries: newJournalEntries,
      };

      if (progress?.id) {
        await base44.entities.UserProgress.update(progress.id, updateData);
      } else {
        await base44.entities.UserProgress.create({ 
          ...updateData, 
          current_streak: 0, 
          longest_streak: 0, 
          total_checkins: 0,
          resources_viewed: 0,
          resources_saved: 0
        });
      }

      return points;
    },
    onSuccess: (points) => {
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
      queryClient.invalidateQueries({ queryKey: ["user-progress"] });
      setPointsEarned(points);
      setSaved(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    },
  });

  if (saved) {
    return (
      <div className="glass-card p-6 text-center">
        <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: 'rgba(47,243,224,0.2)' }}>
          <Check className="w-6 h-6" style={{ color: '#2FF3E0' }} />
        </div>
        <p className="font-medium" style={{ color: '#FFFFFF' }}>Journal entry saved!</p>
        <div className="flex items-center justify-center gap-1.5 mt-2 px-3 py-1.5 rounded-full mx-auto w-fit" style={{ background: 'rgba(244,213,94,0.2)' }}>
          <Sparkles className="w-4 h-4" style={{ color: '#F4D35E' }} />
          <span className="text-sm font-bold" style={{ color: '#F4D35E' }}>+{pointsEarned} XP</span>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-start justify-between">
        <h3 className="font-semibold pr-8" style={{ color: '#FFFFFF' }}>Journal Entry</h3>
        <button onClick={onClose} className="text-white/50 hover:text-white/80">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-3 rounded-lg" style={{ background: 'rgba(123,92,255,0.1)', border: '1px solid rgba(123,92,255,0.2)' }}>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.9)' }}>{prompt}</p>
      </div>

      <div>
        <label className="text-sm mb-2 block" style={{ color: 'rgba(255,255,255,0.75)' }}>
          How are you feeling?
        </label>
        <div className="flex flex-wrap gap-2">
          {MOODS.map(m => (
            <button
              key={m.value}
              onClick={() => setMood(m.value)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={{
                background: mood === m.value ? `${m.color}30` : 'rgba(255,255,255,0.05)',
                border: `1px solid ${mood === m.value ? m.color : 'rgba(255,255,255,0.08)'}`,
                color: mood === m.value ? m.color : 'rgba(255,255,255,0.75)'
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <Textarea
        placeholder="Write your thoughts..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="rounded-xl resize-none min-h-[200px]"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#FFFFFF' }}
      />

      <Button
        onClick={() => saveEntry.mutate()}
        disabled={!content.trim() || saveEntry.isPending}
        className="w-full font-medium"
        style={{ background: !content.trim() ? 'rgba(123,92,255,0.3)' : '#7B5CFF', color: '#FFFFFF' }}
      >
        {saveEntry.isPending ? "Saving..." : "Save Entry (+15 XP)"}
      </Button>
    </div>
  );
}