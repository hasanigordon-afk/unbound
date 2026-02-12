import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Heart, Sparkles } from "lucide-react";
import moment from "moment";

export default function WinsWall() {
  const queryClient = useQueryClient();

  const { data: wins = [], isLoading } = useQuery({
    queryKey: ["wins"],
    queryFn: () => base44.entities.Win.list('-created_date', 30),
  });

  const likeMutation = useMutation({
    mutationFn: (winId) => {
      const win = wins.find(w => w.id === winId);
      return base44.entities.Win.update(winId, {
        heart_count: (win.heart_count || 0) + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["wins"]);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#2FF3E0' }} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {wins.map(win => (
        <div key={win.id} className="glass-card p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: win.type === 'win' ? 'rgba(244,213,94,0.2)' : 'rgba(255,79,216,0.2)' }}>
              {win.type === 'win' ? (
                <Sparkles className="w-5 h-5" style={{ color: '#F4D35E' }} />
              ) : (
                <Heart className="w-5 h-5" style={{ color: '#FF4FD8' }} />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ 
                  background: win.type === 'win' ? 'rgba(244,213,94,0.15)' : 'rgba(255,79,216,0.15)',
                  color: win.type === 'win' ? '#F4D35E' : '#FF4FD8'
                }}>
                  {win.type === 'win' ? 'Win' : 'Gratitude'}
                </span>
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {moment(win.created_date).fromNow()}
                </span>
              </div>
              <p className="text-sm mb-3" style={{ color: 'rgba(255,255,255,0.9)' }}>
                {win.content}
              </p>
              <button
                onClick={() => likeMutation.mutate(win.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-105"
                style={{ background: 'rgba(255,79,216,0.15)', color: '#FF4FD8' }}
              >
                <Heart className="w-3.5 h-3.5" />
                {win.heart_count || 0}
              </button>
            </div>
          </div>
        </div>
      ))}
      {wins.length === 0 && (
        <div className="text-center py-12">
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>No wins yet. Share your first win!</p>
        </div>
      )}
    </div>
  );
}