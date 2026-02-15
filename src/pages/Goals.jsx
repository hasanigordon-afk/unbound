import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Target, CheckCircle2, Circle, Pause, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CreateGoalDialog from "../components/goals/CreateGoalDialog";
import GoalCard from "../components/goals/GoalCard";

export default function Goals() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [filter, setFilter] = useState("active");
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

  const filteredGoals = goals.filter(g => filter === "all" || g.status === filter);

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
            <h1 className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>My Goals</h1>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Track your recovery journey
            </p>
          </div>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="rounded-xl"
            style={{ background: '#2FF3E0', color: '#0B0F1F' }}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Goal
          </Button>
        </div>
      </div>

      <div className="px-5 -mt-3 space-y-4 max-w-lg mx-auto">
        {/* Filter Tabs */}
        <div className="glass-card p-1 flex gap-1">
          {[
            { value: "active", label: "Active", icon: Circle },
            { value: "completed", label: "Completed", icon: CheckCircle2 },
            { value: "all", label: "All", icon: Target }
          ].map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all text-sm font-medium"
              style={{
                background: filter === value ? 'rgba(47,243,224,0.2)' : 'transparent',
                color: filter === value ? '#2FF3E0' : 'rgba(255,255,255,0.5)'
              }}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Goals List */}
        <AnimatePresence mode="popLayout">
          {filteredGoals.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card p-8 text-center"
            >
              <Target className="w-12 h-12 mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.3)' }} />
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                No {filter !== "all" && filter} goals yet
              </p>
            </motion.div>
          ) : (
            filteredGoals.map(goal => (
              <GoalCard key={goal.id} goal={goal} />
            ))
          )}
        </AnimatePresence>
      </div>

      {showCreateDialog && (
        <CreateGoalDialog
          onClose={() => setShowCreateDialog(false)}
        />
      )}
    </div>
  );
}