import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Calendar, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const CATEGORY_COLORS = {
  recovery_milestone: "#2FF3E0",
  health: "#7B5CFF",
  relationships: "#FF6B9D",
  career: "#FFB800",
  personal_growth: "#00D9C0",
  daily_habits: "#4ECDC4"
};

export default function GoalCard({ goal }) {
  const [expanded, setExpanded] = useState(false);
  const queryClient = useQueryClient();

  const updateGoalMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Goal.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast.success("Goal updated!");
    }
  });

  const deleteGoalMutation = useMutation({
    mutationFn: (id) => base44.entities.Goal.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast.success("Goal deleted!");
    }
  });

  const toggleMilestone = (index) => {
    const updatedMilestones = [...goal.milestones];
    updatedMilestones[index].completed = !updatedMilestones[index].completed;
    const completed = updatedMilestones.filter(m => m.completed).length;
    const progress = Math.round((completed / updatedMilestones.length) * 100);
    
    updateGoalMutation.mutate({
      id: goal.id,
      data: { milestones: updatedMilestones, progress_percentage: progress }
    });
  };

  const toggleStatus = () => {
    const newStatus = goal.status === "active" ? "completed" : "active";
    updateGoalMutation.mutate({
      id: goal.id,
      data: { status: newStatus, progress_percentage: newStatus === "completed" ? 100 : goal.progress_percentage }
    });
  };

  const categoryColor = CATEGORY_COLORS[goal.category] || "#2FF3E0";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="glass-card p-4"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full" style={{ background: categoryColor }} />
            <h3 className="font-semibold" style={{ color: '#FFFFFF' }}>{goal.title}</h3>
          </div>
          {goal.description && (
            <p className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {goal.description}
            </p>
          )}
          {goal.target_date && (
            <div className="flex items-center gap-1 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
              <Calendar className="w-3 h-3" />
              Target: {format(new Date(goal.target_date), 'MMM d, yyyy')}
            </div>
          )}
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={toggleStatus}
          className="flex-shrink-0"
        >
          {goal.status === "completed" ? (
            <CheckCircle2 className="w-5 h-5" style={{ color: '#2FF3E0' }} />
          ) : (
            <Circle className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.3)' }} />
          )}
        </Button>
      </div>

      {goal.milestones?.length > 0 && (
        <>
          <Progress value={goal.progress_percentage || 0} className="h-2 mb-3" />
          <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {goal.progress_percentage || 0}% complete
          </p>
        </>
      )}

      {goal.milestones?.length > 0 && (
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 text-sm mb-2"
            style={{ color: '#2FF3E0' }}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            Milestones ({goal.milestones.filter(m => m.completed).length}/{goal.milestones.length})
          </button>
          {expanded && (
            <div className="space-y-2 pl-4">
              {goal.milestones.map((milestone, i) => (
                <button
                  key={i}
                  onClick={() => toggleMilestone(i)}
                  className="flex items-center gap-2 text-sm w-full text-left"
                  style={{ color: milestone.completed ? 'rgba(255,255,255,0.4)' : '#FFFFFF' }}
                >
                  {milestone.completed ? (
                    <CheckCircle2 className="w-4 h-4" style={{ color: '#2FF3E0' }} />
                  ) : (
                    <Circle className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
                  )}
                  <span className={milestone.completed ? 'line-through' : ''}>
                    {milestone.title}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end mt-3">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => deleteGoalMutation.mutate(goal.id)}
          className="text-xs"
          style={{ color: '#FF6B6B' }}
        >
          <Trash2 className="w-3 h-3 mr-1" />
          Delete
        </Button>
      </div>
    </motion.div>
  );
}