import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, Loader2, TrendingUp, BookOpen, Users, ExternalLink, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function PersonalizedFeed({ profile }) {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: recentCheckins = [] } = useQuery({
    queryKey: ["recent-checkins"],
    queryFn: async () => {
      const user = await base44.auth.me();
      const checkins = await base44.entities.Checkin.filter({ created_by: user.email }, "-created_date", 10);
      return checkins;
    },
  });

  const { data: savedResources = [] } = useQuery({
    queryKey: ["saved-resources", user?.email],
    queryFn: () => base44.entities.SavedResource.filter({ created_by: user.email }),
    enabled: !!user,
  });

  const { data: allResources = [] } = useQuery({
    queryKey: ["all-resources-for-ai"],
    queryFn: () => base44.entities.Resource.list(),
  });

  const { data: progressData = [] } = useQuery({
    queryKey: ["user-progress", user?.email],
    queryFn: () => base44.entities.UserProgress.filter({ created_by: user.email }),
    enabled: !!user,
  });

  const generateRecommendations = async () => {
    setLoading(true);
    
    const progress = progressData[0];
    const avgCraving = recentCheckins.length > 0 
      ? recentCheckins.reduce((sum, c) => sum + c.craving_score, 0) / recentCheckins.length 
      : 0;
    
    const recentNotes = recentCheckins
      .filter(c => c.note)
      .slice(0, 5)
      .map(c => c.note)
      .join(" | ");

    const savedResourceCategories = savedResources.map(sr => sr.resource_category);
    const savedCategorySummary = savedResourceCategories.length > 0 
      ? [...new Set(savedResourceCategories)].join(", ") 
      : "None yet";

    // Create a concise resource list for the AI
    const resourceSummary = allResources.map(r => ({
      id: r.id,
      name: r.name,
      category: r.category,
      city: r.city,
      state: r.state,
      tags: r.tags,
      notes: r.notes
    }));

    const prompt = `You are an AI recovery support assistant. Analyze this user's profile and recommend the TOP 5 most relevant resources from the database.

USER PROFILE:
- Recovery Track: ${profile.track}
- Primary Substance: ${profile.primary_substance || "Not specified"}
- Recovery Stage: ${profile.stage}
- Goals: ${profile.goals?.join(", ") || "Not specified"}
- Current Challenges: ${profile.challenges?.join(", ") || "Not specified"}
- Location: ${profile.location_city}, ${profile.location_state}
- Support Needs: ${profile.support_needs?.join(", ") || "Not specified"}

RECENT ACTIVITY:
- Average Craving Level (0-10): ${avgCraving.toFixed(1)}
- Total Check-ins: ${progress?.total_checkins || 0}
- Current Streak: ${progress?.current_streak || 0} days
- Resources Previously Saved: ${savedCategorySummary}
- Recent Notes: ${recentNotes || "None"}

AVAILABLE RESOURCES (${resourceSummary.length} total):
${JSON.stringify(resourceSummary.slice(0, 100), null, 2)}

TASK:
1. Analyze the user's stage, challenges, and recent activity
2. Select the 5 MOST RELEVANT resources from the database
3. Prioritize based on:
   - Urgency (higher cravings = immediate support needs)
   - Stage appropriateness (detox/early recovery vs long-term)
   - Location proximity (same city/state)
   - Gap analysis (what they haven't explored yet)
   - Recent patterns in check-in notes

Return a JSON object with:
- recommended_resource_ids: array of 5 resource IDs from the database
- reasoning: object mapping each resource_id to why it's recommended (1 sentence)
- priority_order: array of resource IDs in priority order (most urgent first)

Be specific about why EACH resource helps THIS user right now.`;

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false,
        response_json_schema: {
          type: "object",
          properties: {
            recommended_resource_ids: {
              type: "array",
              items: { type: "string" }
            },
            reasoning: {
              type: "object",
              additionalProperties: { type: "string" }
            },
            priority_order: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });
      
      // Map resource IDs to actual resource objects
      const recommendedResources = (response.priority_order || response.recommended_resource_ids || [])
        .map(id => allResources.find(r => r.id === id))
        .filter(Boolean)
        .slice(0, 5)
        .map(resource => ({
          ...resource,
          ai_reasoning: response.reasoning?.[resource.id] || "Recommended based on your profile"
        }));
      
      setRecommendations(recommendedResources);
    } catch (error) {
      console.error("Failed to generate recommendations:", error);
      setRecommendations([]);
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

  if (!recommendations) {
    return (
      <div className="glass-card p-6 text-center">
        <Sparkles className="w-10 h-10 mx-auto mb-3" style={{ color: '#7B5CFF' }} />
        <h3 className="font-semibold mb-2" style={{ color: '#FFFFFF' }}>AI-Powered Resource Matching</h3>
        <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.75)' }}>
          Get personalized recommendations based on your recovery stage, challenges, recent check-ins, and location
        </p>
        <Button
          onClick={generateRecommendations}
          disabled={loading}
          className="rounded-xl font-medium"
          style={{ background: '#7B5CFF', color: '#FFFFFF' }}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing Your Needs...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Match Me With Resources
            </>
          )}
        </Button>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="glass-card p-6 text-center">
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
          No recommendations available. Try adding more resources to the database.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" style={{ color: '#7B5CFF' }} />
          <h3 className="font-semibold" style={{ color: '#FFFFFF' }}>AI-Matched For You</h3>
        </div>
        <button
          onClick={generateRecommendations}
          disabled={loading}
          className="text-xs hover:opacity-80 disabled:opacity-40"
          style={{ color: '#7B5CFF' }}
        >
          {loading ? "..." : "Refresh"}
        </button>
      </div>

      {recommendations.map((resource, idx) => (
        <div key={resource.id} className="glass-card p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(47,243,224,0.15)' }}>
              <span className="text-sm font-bold" style={{ color: '#2FF3E0' }}>#{idx + 1}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm mb-1" style={{ color: '#FFFFFF' }}>
                {resource.name}
              </h4>
              <Badge 
                className="text-[10px] mb-2" 
                style={{ background: 'rgba(123,92,255,0.2)', color: '#7B5CFF', border: 'none' }}
              >
                {resource.category}
              </Badge>
            </div>
          </div>

          <div className="flex items-start gap-2 mb-3 p-2 rounded-lg" style={{ background: 'rgba(47,243,224,0.08)' }}>
            <TrendingUp className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: '#2FF3E0' }} />
            <p className="text-xs italic" style={{ color: '#2FF3E0' }}>
              {resource.ai_reasoning}
            </p>
          </div>

          <div className="space-y-2 text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
            <div className="flex items-center gap-2">
              <MapPin className="w-3 h-3 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.5)' }} />
              <span>{resource.address || `${resource.city}, ${resource.state}`}</span>
            </div>
            {resource.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-3 h-3 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.5)' }} />
                <a href={`tel:${resource.phone}`} style={{ color: '#2FF3E0' }}>
                  {resource.phone}
                </a>
              </div>
            )}
            {resource.tags && resource.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {resource.tags.slice(0, 3).map((tag, i) => (
                  <span 
                    key={i}
                    className="px-2 py-0.5 rounded text-[10px]"
                    style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {resource.website && (
            <a
              href={resource.website.startsWith('http') ? resource.website : `https://${resource.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs mt-3 hover:opacity-80"
              style={{ color: '#7B5CFF' }}
            >
              Visit Website
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      ))}
    </div>
  );
}