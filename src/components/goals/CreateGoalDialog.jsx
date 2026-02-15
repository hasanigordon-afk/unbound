import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = [
  { value: "recovery_milestone", label: "Recovery Milestone" },
  { value: "health", label: "Health & Wellness" },
  { value: "relationships", label: "Relationships" },
  { value: "career", label: "Career & Education" },
  { value: "personal_growth", label: "Personal Growth" },
  { value: "daily_habits", label: "Daily Habits" }
];

export default function CreateGoalDialog({ onClose }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "recovery_milestone",
    target_date: "",
    milestones: []
  });
  const [newMilestone, setNewMilestone] = useState("");
  const queryClient = useQueryClient();

  const createGoalMutation = useMutation({
    mutationFn: (data) => base44.entities.Goal.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast.success("Goal created!");
      onClose();
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error("Please enter a goal title");
      return;
    }
    createGoalMutation.mutate({
      ...formData,
      status: "active",
      progress_percentage: 0
    });
  };

  const addMilestone = () => {
    if (newMilestone.trim()) {
      setFormData({
        ...formData,
        milestones: [...formData.milestones, { title: newMilestone, completed: false }]
      });
      setNewMilestone("");
    }
  };

  const removeMilestone = (index) => {
    setFormData({
      ...formData,
      milestones: formData.milestones.filter((_, i) => i !== index)
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md" style={{ background: '#1A1F3A', border: '1px solid rgba(255,255,255,0.1)' }}>
        <DialogHeader>
          <DialogTitle style={{ color: '#FFFFFF' }}>Create New Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="text-sm mb-2 block" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Goal Title
            </label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Stay sober for 30 days"
              className="bg-transparent border-white/20 text-white"
            />
          </div>

          <div>
            <label className="text-sm mb-2 block" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your goal..."
              className="bg-transparent border-white/20 text-white"
            />
          </div>

          <div>
            <label className="text-sm mb-2 block" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Category
            </label>
            <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
              <SelectTrigger className="bg-transparent border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm mb-2 block" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Target Date (Optional)
            </label>
            <Input
              type="date"
              value={formData.target_date}
              onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
              className="bg-transparent border-white/20 text-white"
            />
          </div>

          <div>
            <label className="text-sm mb-2 block" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Milestones (Optional)
            </label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newMilestone}
                onChange={(e) => setNewMilestone(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMilestone())}
                placeholder="Add a milestone..."
                className="bg-transparent border-white/20 text-white"
              />
              <Button type="button" onClick={addMilestone} size="icon" style={{ background: '#2FF3E0', color: '#0B0F1F' }}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-1">
              {formData.milestones.map((m, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <span className="text-sm" style={{ color: '#FFFFFF' }}>{m.title}</span>
                  <Button type="button" size="icon" variant="ghost" onClick={() => removeMilestone(i)}>
                    <Trash2 className="w-3 h-3" style={{ color: '#FF6B6B' }} />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={createGoalMutation.isPending} className="flex-1" style={{ background: '#2FF3E0', color: '#0B0F1F' }}>
              {createGoalMutation.isPending ? "Creating..." : "Create Goal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}