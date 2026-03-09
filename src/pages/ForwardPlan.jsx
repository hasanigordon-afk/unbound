import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { CheckCircle2, Circle, Calendar, TrendingUp, Edit2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const GOAL_CATEGORIES = [
  { id: "housing", label: "Housing", icon: "🏠" },
  { id: "employment", label: "Work & Income", icon: "💼" },
  { id: "education", label: "Learning & Skills", icon: "📚" },
  { id: "financial", label: "Money & Finances", icon: "💰" },
  { id: "health", label: "Health & Wellbeing", icon: "❤️" },
  { id: "relationships", label: "Family & Support", icon: "🤝" },
  { id: "legal", label: "Legal & Court", icon: "⚖️" },
];

const PREDEFINED_GOALS = {
  housing: [
    "Secure stable housing within 3 years",
    "Build emergency housing fund",
    "Improve credit score for rental approval",
  ],
  employment: [
    "Obtain full-time employment within 1 year",
    "Complete vocational training program",
    "Build professional network and references",
  ],
  education: [
    "Complete GED or diploma equivalency",
    "Obtain industry certification",
    "Develop marketable technical skills",
  ],
  financial: [
    "Establish savings account with 3-month reserve",
    "Clear outstanding debts",
    "Build positive credit history",
  ],
  health: [
    "Establish primary care physician relationship",
    "Maintain health insurance coverage",
    "Complete recommended preventive screenings",
  ],
  relationships: [
    "Rebuild family connections",
    "Establish peer support network",
    "Connect with community resources",
  ],
  legal: [
    "Complete all probation/parole requirements",
    "Resolve outstanding legal matters",
    "Maintain compliance with court orders",
  ],
};

export default function ForwardPlan() {
  const queryClient = useQueryClient();
  const [activeStep, setActiveStep] = useState("vision");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [customGoal, setCustomGoal] = useState("");
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [milestoneNotes, setMilestoneNotes] = useState("");

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: plans = [] } = useQuery({
    queryKey: ["forward-plan", user?.email],
    queryFn: () => base44.entities.ForwardPlan.filter({ participant_email: user.email }),
    enabled: !!user,
  });

  const { data: milestones = [] } = useQuery({
    queryKey: ["forward-milestones", user?.email],
    queryFn: () => base44.entities.ForwardPlanMilestone.filter({ participant_email: user.email }, "sort_order"),
    enabled: !!user,
  });

  const plan = plans[0];
  const hasVision = !!plan;

  const createPlanMutation = useMutation({
    mutationFn: async (goals) => {
      const newPlan = await base44.entities.ForwardPlan.create({
        participant_email: user.email,
        ...goals,
        overall_completion_percentage: 0,
      });
      
      // Generate milestones for each category
      const milestonesToCreate = [];
      Object.keys(goals).forEach((key, idx) => {
        if (goals[key] && key.endsWith("_goal")) {
          const category = key.replace("_goal", "");
          milestonesToCreate.push(
            {
              participant_email: user.email,
              forward_plan_id: newPlan.id,
              category,
              timeline: "3_year",
              milestone_text: `3-Year: ${goals[key]}`,
              sort_order: idx * 3,
            },
            {
              participant_email: user.email,
              forward_plan_id: newPlan.id,
              category,
              timeline: "1_year",
              milestone_text: `1-Year: Progress toward ${goals[key].toLowerCase()}`,
              sort_order: idx * 3 + 1,
            },
            {
              participant_email: user.email,
              forward_plan_id: newPlan.id,
              category,
              timeline: "90_day",
              milestone_text: `90-Day: Initial action steps for ${category}`,
              sort_order: idx * 3 + 2,
            }
          );
        }
      });

      for (const milestone of milestonesToCreate) {
        await base44.entities.ForwardPlanMilestone.create(milestone);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["forward-plan"]);
      queryClient.invalidateQueries(["forward-milestones"]);
      setActiveStep("milestones");
    },
  });

  const updateMilestoneMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      await base44.entities.ForwardPlanMilestone.update(id, data);
      
      // Update overall completion
      const allMilestones = await base44.entities.ForwardPlanMilestone.filter({ 
        forward_plan_id: plan.id 
      });
      const completed = allMilestones.filter(m => m.completed).length;
      const percentage = Math.round((completed / allMilestones.length) * 100);
      await base44.entities.ForwardPlan.update(plan.id, { 
        overall_completion_percentage: percentage 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["forward-milestones"]);
      queryClient.invalidateQueries(["forward-plan"]);
      setEditingMilestone(null);
      setMilestoneNotes("");
    },
  });

  const handleGoalSelect = (category, goalText) => {
    setSelectedCategory(category);
    setCustomGoal(goalText);
  };

  const handleVisionSubmit = () => {
    const goals = {};
    GOAL_CATEGORIES.forEach(cat => {
      const input = document.getElementById(`goal-${cat.id}`);
      if (input && input.value) {
        goals[`${cat.id}_goal`] = input.value;
      }
    });
    createPlanMutation.mutate(goals);
  };

  const toggleMilestoneComplete = (milestone) => {
    updateMilestoneMutation.mutate({
      id: milestone.id,
      data: {
        completed: !milestone.completed,
        completed_date: !milestone.completed ? new Date().toISOString() : null,
      },
    });
  };

  const saveMilestoneNotes = () => {
    if (editingMilestone) {
      updateMilestoneMutation.mutate({
        id: editingMilestone.id,
        data: { notes: milestoneNotes },
      });
    }
  };

  const exportReport = () => {
    const report = {
      participant: user.email,
      generated: new Date().toISOString(),
      vision: plan,
      milestones: milestones.map(m => ({
        category: m.category,
        timeline: m.timeline,
        text: m.milestone_text,
        completed: m.completed,
        completed_date: m.completed_date,
        notes: m.notes,
      })),
      completion_percentage: plan?.overall_completion_percentage || 0,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `forward-plan-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const getMilestonesByTimeline = (timeline) => {
    return milestones.filter(m => m.timeline === timeline);
  };

  if (!hasVision && activeStep === "vision") {
    return (
      <div className="min-h-screen pb-24" style={{ background: 'var(--bg-primary)' }}>
        <div className="px-6 pt-8 pb-6" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
          <Link to={createPageUrl("PatientDashboard")} className="text-sm mb-3 inline-block" style={{ color: 'var(--primary)' }}>
            ← Back to Home
          </Link>
          <h1 style={{ marginBottom: '4px' }}>My Plan</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Your goals and next steps — all in one place
          </p>
        </div>

        <div className="px-6 py-6" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-section)' }}>
          <div className="card">
            <h3 className="mb-2">What are you working toward?</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              Pick the areas that matter most right now. You can always change this later.
            </p>
          </div>

          {GOAL_CATEGORIES.map(category => (
            <div key={category.id} className="card">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{category.icon}</span>
                <h4>{category.label}</h4>
              </div>
              
              <div className="space-y-2 mb-3">
                {PREDEFINED_GOALS[category.id].map((goal, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      document.getElementById(`goal-${category.id}`).value = goal;
                    }}
                    className="w-full text-left p-3 text-sm"
                    style={{
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {goal}
                  </button>
                ))}
              </div>

              <Textarea
                id={`goal-${category.id}`}
                placeholder="Or write your custom goal..."
                rows={2}
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  borderRadius: 'var(--radius)',
                }}
              />
            </div>
          ))}

          <Button onClick={handleVisionSubmit} className="btn-primary" disabled={createPlanMutation.isPending}>
            {createPlanMutation.isPending ? "Setting up your plan…" : "Start My Plan →"}
          </Button>

          <div className="p-4 text-xs" style={{ 
            background: 'rgba(74,144,226,0.1)', 
            border: '1px solid rgba(74,144,226,0.3)', 
            borderRadius: 'var(--radius)', 
            color: 'var(--text-secondary)' 
          }}>
            <p className="text-center">
              This feature supports structured long-term planning. It does not provide financial, legal, or medical advice.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--bg-primary)' }}>
      <div className="px-6 pt-8 pb-6" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <Link to={createPageUrl("PatientDashboard")} className="text-sm mb-3 inline-block" style={{ color: 'var(--primary)' }}>
          ← Back to Home
        </Link>
        <h1 style={{ marginBottom: '4px' }}>My Plan</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Your goals and steps forward
        </p>
      </div>

      <div className="px-6 py-6" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-section)' }}>
        {/* Overall Progress */}
        <div className="metric-card">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5" style={{ color: 'var(--text-muted)' }} strokeWidth={1.5} />
            <Button onClick={exportReport} className="btn-secondary" size="sm">
              <Download className="w-4 h-4 mr-2" strokeWidth={1.5} />
              Export
            </Button>
          </div>
          <div className="metric-value">{plan?.overall_completion_percentage || 0}%</div>
          <div className="metric-label">Steps done</div>
          <div className="w-full h-2 mt-2" style={{ background: 'rgba(0,0,0,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${plan?.overall_completion_percentage || 0}%`, height: '100%', background: 'var(--primary)' }} />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[{ key: "3_year", label: "Big picture (3yr)" }, { key: "1_year", label: "This year" }, { key: "90_day", label: "Next 90 days" }].map(t => (
            <button
              key={t.key}
              onClick={() => setActiveStep(t.key)}
              className="px-4 py-2 text-sm font-medium whitespace-nowrap"
              style={{
                background: activeStep === t.key ? 'var(--primary)' : 'transparent',
                color: activeStep === t.key ? '#FFFFFF' : 'var(--text-secondary)',
                border: `1px solid ${activeStep === t.key ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: 'var(--radius)',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Milestones */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {getMilestonesByTimeline(activeStep).map(milestone => {
            const category = GOAL_CATEGORIES.find(c => c.id === milestone.category);
            return (
              <div
                key={milestone.id}
                className="card"
                style={{
                  background: milestone.completed ? 'rgba(76,175,80,0.05)' : 'var(--bg-card)',
                  borderColor: milestone.completed ? 'rgba(76,175,80,0.3)' : 'var(--border)',
                }}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleMilestoneComplete(milestone)}
                    className="flex-shrink-0 mt-1"
                  >
                    {milestone.completed ? (
                      <CheckCircle2 className="w-5 h-5" style={{ color: '#4CAF50' }} strokeWidth={1.5} />
                    ) : (
                      <Circle className="w-5 h-5" style={{ color: 'var(--text-muted)' }} strokeWidth={1.5} />
                    )}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="text-lg mr-2">{category?.icon}</span>
                        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                          {category?.label}
                        </span>
                      </div>
                      <Button
                        onClick={() => {
                          setEditingMilestone(milestone);
                          setMilestoneNotes(milestone.notes || "");
                        }}
                        className="btn-secondary"
                        size="sm"
                      >
                        <Edit2 className="w-3 h-3" strokeWidth={1.5} />
                      </Button>
                    </div>
                    
                    <p className="text-sm mb-2" style={{ color: milestone.completed ? '#4CAF50' : 'var(--text-primary)' }}>
                      {milestone.milestone_text}
                    </p>
                    
                    {milestone.completed && milestone.completed_date && (
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Completed: {new Date(milestone.completed_date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                    )}
                    
                    {milestone.notes && (
                      <p className="text-xs mt-2 p-2" style={{ 
                        background: 'var(--bg-primary)', 
                        borderRadius: 'var(--radius)',
                        color: 'var(--text-secondary)' 
                      }}>
                        {milestone.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 text-xs" style={{ 
          background: 'rgba(74,144,226,0.1)', 
          border: '1px solid rgba(74,144,226,0.3)', 
          borderRadius: 'var(--radius)', 
          color: 'var(--text-secondary)' 
        }}>
          <p className="text-center">
            Your plan is a personal guide — not a contract. Update it whenever you need to.
          </p>
        </div>
      </div>

      {/* Edit Milestone Dialog */}
      {editingMilestone && (
        <Dialog open={!!editingMilestone} onOpenChange={() => setEditingMilestone(null)}>
          <DialogContent style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <DialogHeader>
              <DialogTitle style={{ color: 'var(--text-primary)' }}>Add a note to this step</DialogTitle>
            </DialogHeader>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <p className="text-sm mb-2" style={{ color: 'var(--text-primary)' }}>
                  {editingMilestone.milestone_text}
                </p>
              </div>
              <Textarea
                value={milestoneNotes}
                onChange={(e) => setMilestoneNotes(e.target.value)}
                placeholder="What's happening with this step? Any thoughts…"
                rows={4}
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  borderRadius: 'var(--radius)',
                }}
              />
              <Button onClick={saveMilestoneNotes} className="btn-primary">
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}