import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";

export default function PromptsGenerator({ profile, onSelectPrompt }) {
  const [generating, setGenerating] = useState(false);
  const [prompts, setPrompts] = useState([]);

  const { data: recentCheckins = [] } = useQuery({
    queryKey: ["recent-checkins"],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.Checkin.filter({ created_by: user.email }, '-created_date', 5);
    },
  });

  const generatePrompts = async () => {
    setGenerating(true);
    
    const avgCraving = recentCheckins.length > 0
      ? recentCheckins.reduce((sum, c) => sum + c.craving_score, 0) / recentCheckins.length
      : 0;

    const recentNotes = recentCheckins
      .filter(c => c.note)
      .map(c => c.note)
      .join("; ");

    const prompt = `Generate 5 personalized journaling prompts for someone in recovery.

User Profile:
- Recovery Stage: ${profile?.stage || 'unknown'}
- Recovery Track: ${profile?.track || 'unknown'}
- Goals: ${profile?.goals?.join(', ') || 'not specified'}
- Challenges: ${profile?.challenges?.join(', ') || 'not specified'}
- Recent Average Craving: ${avgCraving.toFixed(1)}/10
${recentNotes ? `- Recent Notes: ${recentNotes}` : ''}

Create 5 thoughtful, specific journaling prompts that:
1. Help with self-reflection on their recovery journey
2. Address their current challenges and stage
3. Connect to their stated goals
4. Encourage hope and growth
5. Vary in focus (gratitude, coping strategies, future goals, triggers, achievements)

Return ONLY a JSON array of 5 prompt strings. No other text.`;

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            prompts: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });
      
      setPrompts(response.prompts || []);
    } catch (error) {
      console.error("Failed to generate prompts:", error);
    }
    
    setGenerating(false);
  };

  if (prompts.length === 0) {
    return (
      <div className="glass-card p-6 text-center">
        <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(123,92,255,0.2)' }}>
          <Sparkles className="w-8 h-8" style={{ color: '#7B5CFF' }} />
        </div>
        <h3 className="font-semibold text-lg mb-2" style={{ color: '#FFFFFF' }}>
          Personalized Journaling Prompts
        </h3>
        <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.75)' }}>
          Get AI-generated prompts tailored to your recovery journey
        </p>
        <Button
          onClick={generatePrompts}
          disabled={generating}
          className="font-medium"
          style={{ background: '#7B5CFF', color: '#FFFFFF' }}
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Prompts
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold" style={{ color: '#FFFFFF' }}>Today's Prompts</h3>
        <Button
          onClick={generatePrompts}
          disabled={generating}
          variant="ghost"
          size="sm"
          style={{ color: 'rgba(255,255,255,0.75)' }}
        >
          <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      
      {prompts.map((prompt, idx) => (
        <button
          key={idx}
          onClick={() => onSelectPrompt(prompt)}
          className="w-full text-left p-4 rounded-xl transition-all hover:scale-[1.02]"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(123,92,255,0.2)' }}>
              <span className="text-sm font-bold" style={{ color: '#7B5CFF' }}>{idx + 1}</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.9)' }}>
              {prompt}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}