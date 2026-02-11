import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, Loader2, TrendingUp, BookOpen, Users, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PersonalizedFeed({ profile }) {
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);

  const { data: recentCheckins = [] } = useQuery({
    queryKey: ["recent-checkins"],
    queryFn: async () => {
      const user = await base44.auth.me();
      const checkins = await base44.entities.Checkin.filter({ created_by: user.email }, "-created_date", 10);
      return checkins;
    },
  });

  const generateSuggestions = async () => {
    setLoading(true);
    
    const avgCraving = recentCheckins.length > 0 
      ? recentCheckins.reduce((sum, c) => sum + c.craving_score, 0) / recentCheckins.length 
      : 0;
    
    const recentNotes = recentCheckins
      .filter(c => c.note)
      .slice(0, 3)
      .map(c => c.note)
      .join(" | ");

    const prompt = `Based on the following recovery profile, suggest 4-5 highly relevant resources:

Profile:
- Recovery Track: ${profile.track}
- Primary Substance: ${profile.primary_substance || "Not specified"}
- Stage: ${profile.stage}
- Goals: ${profile.goals?.join(", ") || "Not specified"}
- Challenges: ${profile.challenges?.join(", ") || "Not specified"}
- Location: ${profile.location_city}, ${profile.location_state}
- Average Craving (last 10): ${avgCraving.toFixed(1)}/10
- Recent Notes: ${recentNotes || "None"}

Provide a JSON array of suggestions. Each should have:
- type: "article", "resource", or "group"
- title: string (concise)
- description: string (1-2 sentences)
- relevance_reason: string (why this helps them right now)
- url: string (real URL if possible, or placeholder)
- priority: "high", "medium", or "low"

Focus on:
1. Their current stage and challenges
2. Recent craving patterns
3. Local resources in their city/state when possible
4. Substance-specific support

Return ONLY valid JSON array, no markdown.`;

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  title: { type: "string" },
                  description: { type: "string" },
                  relevance_reason: { type: "string" },
                  url: { type: "string" },
                  priority: { type: "string" }
                }
              }
            }
          }
        }
      });
      
      setSuggestions(response.suggestions || []);
    } catch (error) {
      console.error("Failed to generate suggestions:", error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const typeIcons = {
    article: BookOpen,
    resource: TrendingUp,
    group: Users,
  };

  const typeColors = {
    article: { bg: "rgba(123,92,255,0.15)", color: "#7B5CFF" },
    resource: { bg: "rgba(47,243,224,0.15)", color: "#2FF3E0" },
    group: { bg: "rgba(244,213,94,0.15)", color: "#F4D35E" },
  };

  const priorityBadges = {
    high: { bg: "rgba(255,79,216,0.2)", color: "#FF4FD8", text: "Priority" },
    medium: { bg: "rgba(244,213,94,0.15)", color: "#F4D35E", text: "Suggested" },
    low: { bg: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", text: "Optional" },
  };

  if (!suggestions) {
    return (
      <div className="glass-card p-6 text-center">
        <Sparkles className="w-10 h-10 mx-auto mb-3" style={{ color: '#7B5CFF' }} />
        <h3 className="font-semibold mb-2" style={{ color: '#FFFFFF' }}>Get Personalized Suggestions</h3>
        <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.75)' }}>
          AI-powered recommendations based on your profile, check-ins, and goals
        </p>
        <Button
          onClick={generateSuggestions}
          disabled={loading}
          className="rounded-xl font-medium"
          style={{ background: '#7B5CFF', color: '#FFFFFF' }}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Show My Feed
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" style={{ color: '#7B5CFF' }} />
          <h3 className="font-semibold" style={{ color: '#FFFFFF' }}>For You</h3>
        </div>
        <button
          onClick={generateSuggestions}
          className="text-xs hover:opacity-80"
          style={{ color: '#7B5CFF' }}
        >
          Refresh
        </button>
      </div>

      {suggestions.map((item, idx) => {
        const Icon = typeIcons[item.type] || BookOpen;
        const colors = typeColors[item.type] || typeColors.article;
        const badge = priorityBadges[item.priority] || priorityBadges.medium;

        return (
          <div key={idx} className="glass-card p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: colors.bg }}>
                <Icon className="w-5 h-5" style={{ color: colors.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-semibold text-sm" style={{ color: '#FFFFFF' }}>{item.title}</h4>
                  <span 
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: badge.bg, color: badge.color }}
                  >
                    {badge.text}
                  </span>
                </div>
                <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.75)' }}>
                  {item.description}
                </p>
                <div className="flex items-start gap-2 mb-3">
                  <TrendingUp className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: '#2FF3E0' }} />
                  <p className="text-xs italic" style={{ color: '#2FF3E0' }}>
                    {item.relevance_reason}
                  </p>
                </div>
                {item.url && item.url !== "placeholder" && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs hover:opacity-80"
                    style={{ color: '#7B5CFF' }}
                  >
                    Learn More
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}