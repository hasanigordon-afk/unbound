import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, Lightbulb, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import moment from "moment";

export default function JournalInsights({ entries }) {
  const [generating, setGenerating] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const lastWeekStart = moment().subtract(7, 'days').format('YYYY-MM-DD');
  const today = moment().format('YYYY-MM-DD');

  const { data: insights = [] } = useQuery({
    queryKey: ["journal-insights", user?.email],
    queryFn: () => base44.entities.JournalInsight.filter({ created_by: user.email }, '-created_date', 1),
    enabled: !!user,
  });

  const latestInsight = insights[0];

  const generateInsights = async () => {
    setGenerating(true);
    try {
      const recentEntries = entries.slice(0, 7);
      const entriesText = recentEntries.map(e => 
        `Date: ${moment(e.created_date).format('MMM D')}\nMood: ${e.mood || 'Not specified'}\nContent: ${e.content}`
      ).join('\n\n');

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze these journal entries from someone in recovery and provide insights:

${entriesText}

Provide:
1. A brief mood summary (2-3 sentences about overall emotional state)
2. 2-3 patterns you've identified in their thoughts, feelings, or behaviors
3. 2-3 actionable, supportive suggestions for their recovery journey
4. The dominant mood across all entries

Be empathetic, non-judgmental, and recovery-focused.`,
        response_json_schema: {
          type: "object",
          properties: {
            mood_summary: { type: "string" },
            patterns_identified: { type: "array", items: { type: "string" } },
            suggestions: { type: "array", items: { type: "string" } },
            dominant_mood: { type: "string" }
          }
        }
      });

      await base44.entities.JournalInsight.create({
        period_start: lastWeekStart,
        period_end: today,
        ...result
      });

      queryClient.invalidateQueries({ queryKey: ["journal-insights"] });
      toast.success("Insights generated!");
    } catch (error) {
      toast.error("Failed to generate insights");
    } finally {
      setGenerating(false);
    }
  };

  const moodColors = {
    grateful: "#FFB800",
    hopeful: "#2FF3E0",
    struggling: "#FF6B6B",
    peaceful: "#7B5CFF",
    frustrated: "#FF8C42",
    proud: "#00D9C0"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" style={{ color: '#7B5CFF' }} />
          <h3 className="font-semibold" style={{ color: '#FFFFFF' }}>AI Insights</h3>
        </div>
        <Button
          onClick={generateInsights}
          disabled={generating}
          size="sm"
          style={{ background: 'rgba(123,92,255,0.2)', color: '#7B5CFF' }}
        >
          {generating ? (
            <>
              <Loader2 className="w-3 h-3 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-3 h-3 mr-2" />
              Refresh
            </>
          )}
        </Button>
      </div>

      {latestInsight ? (
        <div className="space-y-4">
          <div>
            <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {moment(latestInsight.period_start).format('MMM D')} - {moment(latestInsight.period_end).format('MMM D')}
            </p>
            {latestInsight.dominant_mood && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3" style={{ background: `${moodColors[latestInsight.dominant_mood] || '#7B5CFF'}20` }}>
                <span className="text-xs font-medium capitalize" style={{ color: moodColors[latestInsight.dominant_mood] || '#7B5CFF' }}>
                  Dominant mood: {latestInsight.dominant_mood}
                </span>
              </div>
            )}
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>
              {latestInsight.mood_summary}
            </p>
          </div>

          {latestInsight.patterns_identified?.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4" style={{ color: '#2FF3E0' }} />
                <h4 className="text-sm font-medium" style={{ color: '#2FF3E0' }}>Patterns</h4>
              </div>
              <ul className="space-y-2">
                {latestInsight.patterns_identified.map((pattern, i) => (
                  <li key={i} className="text-sm pl-4 border-l-2" style={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(47,243,224,0.3)' }}>
                    {pattern}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {latestInsight.suggestions?.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4" style={{ color: '#FFB800' }} />
                <h4 className="text-sm font-medium" style={{ color: '#FFB800' }}>Suggestions</h4>
              </div>
              <ul className="space-y-2">
                {latestInsight.suggestions.map((suggestion, i) => (
                  <li key={i} className="text-sm pl-4 border-l-2" style={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,184,0,0.3)' }}>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6">
          <Sparkles className="w-10 h-10 mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.3)' }} />
          <p className="text-sm mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Get AI-powered insights from your journal entries
          </p>
          <Button
            onClick={generateInsights}
            disabled={generating}
            style={{ background: '#7B5CFF', color: '#FFFFFF' }}
          >
            {generating ? "Analyzing..." : "Generate Insights"}
          </Button>
        </div>
      )}
    </motion.div>
  );
}