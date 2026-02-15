import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Sparkles, BookOpen, Headphones, Dumbbell, Video, CheckCircle2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import ContentDetailDialog from "../components/discover/ContentDetailDialog";

const TYPE_ICONS = {
  article: BookOpen,
  meditation: Headphones,
  exercise: Dumbbell,
  video: Video
};

export default function Discover() {
  const [selectedType, setSelectedType] = useState("all");
  const [selectedContent, setSelectedContent] = useState(null);
  const [generatingRecommendations, setGeneratingRecommendations] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ["my-profile"],
    queryFn: async () => {
      const u = await base44.auth.me();
      return base44.entities.MemberProfile.filter({ created_by: u.email });
    },
  });

  const profile = profiles[0];

  const { data: content = [], isLoading } = useQuery({
    queryKey: ["content"],
    queryFn: () => base44.entities.Content.list(),
  });

  const { data: progress = [] } = useQuery({
    queryKey: ["content-progress", user?.email],
    queryFn: () => base44.entities.ContentProgress.filter({ created_by: user.email }),
    enabled: !!user,
  });

  const { data: goals = [] } = useQuery({
    queryKey: ["goals", user?.email],
    queryFn: () => base44.entities.Goal.filter({ created_by: user.email, status: "active" }),
    enabled: !!user,
  });

  const generateRecommendations = async () => {
    setGeneratingRecommendations(true);
    try {
      const stage = profile?.stage || "early_recovery_15_90";
      const track = profile?.track || "both";
      const activeGoals = goals.map(g => g.title).join(", ");

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 5 personalized recovery content recommendations for someone in this situation:
        - Recovery Stage: ${stage}
        - Recovery Track: ${track}
        - Active Goals: ${activeGoals || "None set yet"}
        
        For each recommendation, provide:
        1. Title (engaging and relevant)
        2. Type (article, meditation, exercise, or video)
        3. Description (2-3 sentences about what they'll learn/do)
        4. Content body (detailed content - for articles write 3-4 paragraphs, for meditations/exercises write step-by-step guidance)
        5. Duration in minutes
        6. Difficulty (beginner/intermediate/advanced)
        7. Relevant stages (array)
        8. Relevant tracks (array)
        9. Tags (array of 3-5 relevant keywords)`,
        response_json_schema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  type: { type: "string" },
                  description: { type: "string" },
                  content_body: { type: "string" },
                  duration_minutes: { type: "number" },
                  difficulty: { type: "string" },
                  relevant_stages: { type: "array", items: { type: "string" } },
                  relevant_tracks: { type: "array", items: { type: "string" } },
                  tags: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });

      // Create content entries
      for (const rec of result.recommendations) {
        await base44.entities.Content.create(rec);
      }

      queryClient.invalidateQueries({ queryKey: ["content"] });
      toast.success("Generated personalized recommendations!");
    } catch (error) {
      toast.error("Failed to generate recommendations");
    } finally {
      setGeneratingRecommendations(false);
    }
  };

  const filteredContent = selectedType === "all" 
    ? content 
    : content.filter(c => c.type === selectedType);

  const isCompleted = (contentId) => {
    return progress.some(p => p.content_id === contentId && p.completed);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0B0F1F' }}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#2FF3E0' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: '#0B0F1F' }}>
      <div className="px-5 pt-8 pb-6 rounded-b-3xl" style={{ background: 'linear-gradient(135deg, rgba(123,92,255,0.2), rgba(47,243,224,0.1))' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>Discover</h1>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Personalized content for your journey
            </p>
          </div>
          <Button
            onClick={generateRecommendations}
            disabled={generatingRecommendations}
            className="rounded-xl"
            style={{ background: '#7B5CFF', color: '#FFFFFF' }}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {generatingRecommendations ? "Generating..." : "AI Picks"}
          </Button>
        </div>
      </div>

      <div className="px-5 -mt-3 space-y-4 max-w-lg mx-auto">
        {/* Filter Tabs */}
        <div className="glass-card p-1 flex gap-1 overflow-x-auto">
          {[
            { value: "all", label: "All", icon: Sparkles },
            { value: "article", label: "Articles", icon: BookOpen },
            { value: "meditation", label: "Meditation", icon: Headphones },
            { value: "exercise", label: "Exercises", icon: Dumbbell },
            { value: "video", label: "Videos", icon: Video }
          ].map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setSelectedType(value)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-medium whitespace-nowrap"
              style={{
                background: selectedType === value ? 'rgba(47,243,224,0.2)' : 'transparent',
                color: selectedType === value ? '#2FF3E0' : 'rgba(255,255,255,0.5)'
              }}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Content Grid */}
        <AnimatePresence mode="popLayout">
          {filteredContent.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card p-8 text-center"
            >
              <Sparkles className="w-12 h-12 mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.3)' }} />
              <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>
                No content yet. Generate AI recommendations!
              </p>
              <Button
                onClick={generateRecommendations}
                disabled={generatingRecommendations}
                style={{ background: '#7B5CFF', color: '#FFFFFF' }}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Content
              </Button>
            </motion.div>
          ) : (
            <div className="grid gap-4">
              {filteredContent.map(item => {
                const Icon = TYPE_ICONS[item.type] || BookOpen;
                const completed = isCompleted(item.id);
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="glass-card p-4 cursor-pointer hover:shadow-lg transition-all"
                    onClick={() => setSelectedContent(item)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(123,92,255,0.2)' }}>
                        <Icon className="w-5 h-5" style={{ color: '#7B5CFF' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-sm" style={{ color: '#FFFFFF' }}>
                            {item.title}
                          </h3>
                          {completed && (
                            <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#2FF3E0' }} />
                          )}
                        </div>
                        <p className="text-xs line-clamp-2 mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
                          {item.description}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {item.duration_minutes && (
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(47,243,224,0.1)', color: '#2FF3E0' }}>
                              {item.duration_minutes} min
                            </span>
                          )}
                          {item.difficulty && (
                            <span className="text-xs px-2 py-0.5 rounded-full capitalize" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)' }}>
                              {item.difficulty}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </div>

      {selectedContent && (
        <ContentDetailDialog
          content={selectedContent}
          onClose={() => setSelectedContent(null)}
          isCompleted={isCompleted(selectedContent.id)}
        />
      )}
    </div>
  );
}