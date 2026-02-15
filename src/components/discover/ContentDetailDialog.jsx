import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Star, Clock, BarChart } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export default function ContentDetailDialog({ content, onClose, isCompleted }) {
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: existingProgress } = useQuery({
    queryKey: ["content-progress-detail", content.id, user?.email],
    queryFn: async () => {
      const results = await base44.entities.ContentProgress.filter({
        created_by: user.email,
        content_id: content.id
      });
      return results[0];
    },
    enabled: !!user
  });

  const markCompleteMutation = useMutation({
    mutationFn: async (data) => {
      if (existingProgress) {
        return base44.entities.ContentProgress.update(existingProgress.id, data);
      } else {
        return base44.entities.ContentProgress.create({ ...data, content_id: content.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-progress"] });
      toast.success("Marked as complete!");
      setShowFeedback(false);
      onClose();
    }
  });

  const handleComplete = () => {
    if (isCompleted) {
      onClose();
      return;
    }
    setShowFeedback(true);
  };

  const submitFeedback = () => {
    if (!rating) {
      toast.error("Please rate this content");
      return;
    }
    markCompleteMutation.mutate({
      completed: true,
      rating,
      notes: notes || undefined
    });
  };

  const handleQuickFeedback = (feedbackRating) => {
    markCompleteMutation.mutate({
      completed: false,
      rating: feedbackRating
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" style={{ background: '#1A1F3A', border: '1px solid rgba(255,255,255,0.1)' }}>
        <DialogHeader>
          <DialogTitle style={{ color: '#FFFFFF' }}>{content.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="flex items-center gap-3 flex-wrap">
            {content.duration_minutes && (
              <div className="flex items-center gap-1 text-xs px-2 py-1 rounded" style={{ background: 'rgba(47,243,224,0.1)', color: '#2FF3E0' }}>
                <Clock className="w-3 h-3" />
                {content.duration_minutes} min
              </div>
            )}
            {content.difficulty && (
              <div className="flex items-center gap-1 text-xs px-2 py-1 rounded capitalize" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)' }}>
                <BarChart className="w-3 h-3" />
                {content.difficulty}
              </div>
            )}
            {isCompleted && (
              <div className="flex items-center gap-1 text-xs px-2 py-1 rounded" style={{ background: 'rgba(47,243,224,0.15)', color: '#2FF3E0' }}>
                <CheckCircle2 className="w-3 h-3" />
                Completed
              </div>
            )}
          </div>

          {content.description && (
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
              {content.description}
            </p>
          )}

          <div className="prose prose-sm max-w-none" style={{ color: 'rgba(255,255,255,0.8)' }}>
            <ReactMarkdown>{content.content_body}</ReactMarkdown>
          </div>

          {content.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {content.tags.map((tag, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-1 rounded"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {!existingProgress && (
            <div className="p-4 rounded-lg" style={{ background: 'rgba(123,92,255,0.1)' }}>
              <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Help us personalize your feed - rate this recommendation:
              </p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleQuickFeedback(star)}
                    disabled={markCompleteMutation.isPending}
                  >
                    <Star
                      className="w-6 h-6"
                      style={{ color: '#FFB800', opacity: 0.3 }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {!showFeedback ? (
            <Button
              onClick={handleComplete}
              className="w-full"
              style={{ background: isCompleted ? 'rgba(47,243,224,0.2)' : '#2FF3E0', color: isCompleted ? '#2FF3E0' : '#0B0F1F' }}
            >
              {isCompleted ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Completed
                </>
              ) : (
                "Mark as Complete"
              )}
            </Button>
          ) : (
            <div className="space-y-3 p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <p className="text-sm font-medium" style={{ color: '#FFFFFF' }}>How was this content?</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Your feedback helps us recommend better content for you</p>
              
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="transition-all hover:scale-110"
                  >
                    <Star
                      className="w-7 h-7"
                      fill={star <= rating ? '#FFB800' : 'none'}
                      style={{ color: star <= rating ? '#FFB800' : 'rgba(255,255,255,0.2)' }}
                    />
                  </button>
                ))}
              </div>

              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any notes or reflections? (optional)"
                className="bg-transparent border-white/20 text-white"
              />

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowFeedback(false)} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={submitFeedback}
                  disabled={markCompleteMutation.isPending}
                  className="flex-1"
                  style={{ background: '#2FF3E0', color: '#0B0F1F' }}
                >
                  {markCompleteMutation.isPending ? "Saving..." : "Submit"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}