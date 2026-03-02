import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Target, CheckCircle2, Circle, ChevronRight, Loader2 } from "lucide-react";
import CreateGoalDialog from "../components/goals/CreateGoalDialog";

const TIMELINE_SECTIONS = [
  {
    key: "short_term",
    label: "Short-Term",
    subtitle: "Within the next month",
    color: "#4A90E2",
    bg: "rgba(74,144,226,0.08)",
    border: "rgba(74,144,226,0.2)",
  },
  {
    key: "mid_term",
    label: "Mid-Term",
    subtitle: "1–6 months",
    color: "#D4A574",
    bg: "rgba(212,165,116,0.08)",
    border: "rgba(212,165,116,0.2)",
  },
  {
    key: "long_term",
    label: "Long-Term",
    subtitle: "6+ months",
    color: "#5CB85C",
    bg: "rgba(92,184,92,0.08)",
    border: "rgba(92,184,92,0.2)",
  },
];

function GoalItem({ goal, onToggle }) {
  const isDone = goal.status === "completed";
  return (
    <div
      className="flex items-center gap-3 py-3"
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      <button onClick={() => onToggle(goal)} className="flex-shrink-0">
        {isDone ? (
          <CheckCircle2 className="w-5 h-5" style={{ color: "#5CB85C" }} strokeWidth={1.5} />
        ) : (
          <Circle className="w-5 h-5" style={{ color: "var(--text-muted)" }} strokeWidth={1.5} />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium"
          style={{
            color: isDone ? "var(--text-muted)" : "var(--text-primary)",
            textDecoration: isDone ? "line-through" : "none",
          }}
        >
          {goal.title}
        </p>
        {goal.description && (
          <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>
            {goal.description}
          </p>
        )}
      </div>
      {goal.progress_percentage > 0 && !isDone && (
        <span className="text-xs font-medium flex-shrink-0" style={{ color: "var(--text-muted)" }}>
          {goal.progress_percentage}%
        </span>
      )}
    </div>
  );
}

export default function MyGoals() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ["goals", user?.email],
    queryFn: () => base44.entities.Goal.filter({ created_by: user.email }),
    enabled: !!user,
  });

  const toggleMutation = useMutation({
    mutationFn: (goal) =>
      base44.entities.Goal.update(goal.id, {
        status: goal.status === "completed" ? "active" : "completed",
      }),
    onSuccess: () => queryClient.invalidateQueries(["goals"]),
  });

  // Categorize goals by timeline
  // Use category field to map: daily_habits/health = short, career/relationships = mid, recovery_milestone/personal_growth = long
  const categorize = (goal) => {
    if (["daily_habits", "health"].includes(goal.category)) return "short_term";
    if (["career", "relationships"].includes(goal.category)) return "mid_term";
    return "long_term";
  };

  const goalsByTimeline = {
    short_term: goals.filter((g) => categorize(g) === "short_term"),
    mid_term: goals.filter((g) => categorize(g) === "mid_term"),
    long_term: goals.filter((g) => categorize(g) === "long_term"),
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--primary)" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* Header */}
      <div className="px-6 pt-10 pb-6" style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 style={{ marginBottom: "2px" }}>My Goals</h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {goals.filter((g) => g.status === "completed").length} of {goals.length} completed
            </p>
          </div>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            Add Goal
          </Button>
        </div>
      </div>

      {/* Goal Sections */}
      <div className="px-6 py-6 space-y-5 max-w-2xl mx-auto">
        {TIMELINE_SECTIONS.map((section) => {
          const sectionGoals = goalsByTimeline[section.key];
          const completedCount = sectionGoals.filter((g) => g.status === "completed").length;

          return (
            <div
              key={section.key}
              className="rounded-lg overflow-hidden"
              style={{ border: `1px solid ${section.border}`, background: section.bg }}
            >
              {/* Section Header */}
              <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${section.border}` }}>
                <div className="flex items-center gap-3">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: section.color }}
                  />
                  <div>
                    <h3 style={{ color: section.color, fontSize: "15px", margin: 0 }}>{section.label}</h3>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{section.subtitle}</p>
                  </div>
                </div>
                <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                  {completedCount}/{sectionGoals.length}
                </span>
              </div>

              {/* Goals */}
              <div className="px-4">
                {sectionGoals.length === 0 ? (
                  <div className="py-6 text-center">
                    <Target className="w-8 h-8 mx-auto mb-2" style={{ color: "var(--text-muted)", opacity: 0.4 }} strokeWidth={1.5} />
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>No {section.label.toLowerCase()} goals yet</p>
                  </div>
                ) : (
                  sectionGoals.map((goal, i) => (
                    <GoalItem
                      key={goal.id}
                      goal={goal}
                      onToggle={(g) => toggleMutation.mutate(g)}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}

        {goals.length === 0 && (
          <div className="card text-center py-12">
            <Target className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--text-muted)", opacity: 0.4 }} strokeWidth={1.5} />
            <h3 className="mb-2">Start setting goals</h3>
            <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
              Break your recovery journey into short, mid, and long-term milestones.
            </p>
            <Button onClick={() => setShowCreateDialog(true)} className="btn-primary">
              <Plus className="w-4 h-4 mr-2" strokeWidth={2} />
              Add Your First Goal
            </Button>
          </div>
        )}
      </div>

      {showCreateDialog && (
        <CreateGoalDialog onClose={() => setShowCreateDialog(false)} />
      )}
    </div>
  );
}