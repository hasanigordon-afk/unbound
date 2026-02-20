import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Plus, Target, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CustomTaskManager({ counselorEmail, facilityId, participants }) {
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    participant_email: "",
    task_title: "",
    task_description: "",
    due_date: "",
    priority: "medium",
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["custom-tasks", facilityId],
    queryFn: () => base44.entities.CustomTask.filter({ facility_id: facilityId }),
  });

  const createTaskMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.CustomTask.create({
        facility_id: facilityId,
        counselor_email: counselorEmail,
        participant_email: formData.participant_email,
        task_title: formData.task_title,
        task_description: formData.task_description,
        due_date: formData.due_date,
        priority: formData.priority,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["custom-tasks"]);
      setShowCreateDialog(false);
      setFormData({ participant_email: "", task_title: "", task_description: "", due_date: "", priority: "medium" });
    },
  });

  const activeTasks = tasks.filter(t => t.status !== "completed").sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
  const completedTasks = tasks.filter(t => t.status === "completed").sort((a, b) => new Date(b.completed_date) - new Date(a.completed_date)).slice(0, 5);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return { bg: 'rgba(239,68,68,0.2)', text: '#ef4444' };
      case "medium": return { bg: 'rgba(251,191,36,0.2)', text: '#fbbf24' };
      case "low": return { bg: 'rgba(34,197,94,0.2)', text: '#22c55e' };
      default: return { bg: 'rgba(255,255,255,0.1)', text: '#ffffff' };
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={() => setShowCreateDialog(true)}
        className="w-full"
        style={{ background: '#fbbf24', color: '#0f1628' }}
      >
        <Plus className="w-4 h-4 mr-2" />
        Create Custom Task
      </Button>

      {/* Active Tasks */}
      <div>
        <h3 className="font-semibold mb-3" style={{ color: '#ffffff' }}>Active Tasks</h3>
        <div className="space-y-2">
          {activeTasks.map(task => {
            const priority = getPriorityColor(task.priority);
            const isOverdue = new Date(task.due_date) < new Date() && task.status !== "completed";
            return (
              <div key={task.id} className="p-4 rounded-lg" style={{ background: '#0f1628', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium" style={{ color: '#ffffff' }}>{task.task_title}</h4>
                      <div className="px-2 py-0.5 rounded text-xs font-medium" style={{ background: priority.bg, color: priority.text }}>
                        {task.priority}
                      </div>
                    </div>
                    <p className="text-sm mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
                      {task.participant_email.split('@')[0]}
                    </p>
                    {task.task_description && (
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{task.task_description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {isOverdue && (
                      <span className="flex items-center gap-1" style={{ color: '#ef4444' }}>
                        <AlertCircle className="w-3 h-3" />
                        Overdue
                      </span>
                    )}
                    <span style={{ color: 'rgba(255,255,255,0.6)' }}>
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="px-2 py-1 rounded capitalize text-xs" style={{
                    background: task.status === "in_progress" ? 'rgba(96,165,250,0.2)' : 'rgba(255,255,255,0.1)',
                    color: task.status === "in_progress" ? '#60a5fa' : 'rgba(255,255,255,0.6)',
                  }}>
                    {task.status.replace('_', ' ')}
                  </div>
                </div>
              </div>
            );
          })}
          {activeTasks.length === 0 && (
            <p className="text-sm text-center py-4" style={{ color: 'rgba(255,255,255,0.5)' }}>No active tasks</p>
          )}
        </div>
      </div>

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3" style={{ color: '#ffffff' }}>Recently Completed</h3>
          <div className="space-y-2">
            {completedTasks.map(task => (
              <div key={task.id} className="p-3 rounded-lg" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm" style={{ color: '#ffffff' }}>{task.task_title}</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      {task.participant_email.split('@')[0]} • {new Date(task.completed_date).toLocaleDateString()}
                    </p>
                  </div>
                  <CheckCircle2 className="w-5 h-5" style={{ color: '#22c55e' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent style={{ background: '#0f1628', border: '1px solid rgba(255,255,255,0.1)' }}>
          <DialogHeader>
            <DialogTitle style={{ color: '#ffffff' }}>Create Custom Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label style={{ color: 'rgba(255,255,255,0.7)' }}>Assign to Participant</Label>
              <Select value={formData.participant_email} onValueChange={(v) => setFormData({...formData, participant_email: v})}>
                <SelectTrigger style={{ background: '#1a1f3a', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}>
                  <SelectValue placeholder="Select participant" />
                </SelectTrigger>
                <SelectContent>
                  {participants.map(p => (
                    <SelectItem key={p.participant_email} value={p.participant_email}>
                      {p.participant_email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label style={{ color: 'rgba(255,255,255,0.7)' }}>Task Title</Label>
              <Input
                value={formData.task_title}
                onChange={(e) => setFormData({...formData, task_title: e.target.value})}
                placeholder="e.g., Update resume"
                style={{ background: '#1a1f3a', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}
              />
            </div>
            <div>
              <Label style={{ color: 'rgba(255,255,255,0.7)' }}>Description</Label>
              <Textarea
                value={formData.task_description}
                onChange={(e) => setFormData({...formData, task_description: e.target.value})}
                rows={3}
                placeholder="Provide details about this task..."
                style={{ background: '#1a1f3a', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label style={{ color: 'rgba(255,255,255,0.7)' }}>Due Date</Label>
                <Input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                  style={{ background: '#1a1f3a', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}
                />
              </div>
              <div>
                <Label style={{ color: 'rgba(255,255,255,0.7)' }}>Priority</Label>
                <Select value={formData.priority} onValueChange={(v) => setFormData({...formData, priority: v})}>
                  <SelectTrigger style={{ background: '#1a1f3a', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="flex-1" style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#ffffff' }}>
                Cancel
              </Button>
              <Button
                onClick={() => createTaskMutation.mutate()}
                disabled={!formData.participant_email || !formData.task_title || createTaskMutation.isPending}
                className="flex-1"
                style={{ background: '#fbbf24', color: '#0f1628' }}
              >
                Create Task
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}