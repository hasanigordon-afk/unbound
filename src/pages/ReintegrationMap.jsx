import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { CheckCircle2, Circle, Upload, FileText, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const PHASE_INFO = {
  1: { name: "Phase 1: Stabilization", days: "Days 1-14", startDay: 0, endDay: 14 },
  2: { name: "Phase 2: Foundation", days: "Days 15-45", startDay: 15, endDay: 45 },
  3: { name: "Phase 3: Momentum", days: "Days 46-90", startDay: 46, endDay: 90 },
};

export default function ReintegrationMap() {
  const queryClient = useQueryClient();
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [completionNotes, setCompletionNotes] = useState("");
  const [uploadedPhoto, setUploadedPhoto] = useState(null);

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: profile } = useQuery({
    queryKey: ["participant-profile"],
    queryFn: async () => {
      const profiles = await base44.entities.ParticipantProfile.filter({ participant_email: user.email });
      return profiles[0];
    },
    enabled: !!user,
  });

  const { data: allTasks = [] } = useQuery({
    queryKey: ["reintegration-tasks"],
    queryFn: () => base44.entities.ReintegrationTask.filter({ is_active: true }, "sort_order"),
  });

  const { data: completions = [] } = useQuery({
    queryKey: ["task-completions", user?.email],
    queryFn: () => base44.entities.TaskCompletion.filter({ participant_email: user.email }),
    enabled: !!user,
  });

  const { data: phaseCompletions = [] } = useQuery({
    queryKey: ["phase-completions", user?.email],
    queryFn: () => base44.entities.PhaseCompletion.filter({ participant_email: user.email }),
    enabled: !!user,
  });

  const { data: forwardPlanMilestones = [] } = useQuery({
    queryKey: ["forward-milestones", user?.email],
    queryFn: () => base44.entities.ForwardPlanMilestone.filter({ participant_email: user.email, timeline: "90_day" }),
    enabled: !!user,
  });

  useEffect(() => {
    const accepted = localStorage.getItem("reintegration_disclaimer_accepted");
    if (accepted === "true") setDisclaimerAccepted(true);
  }, []);

  const uploadPhotoMutation = useMutation({
    mutationFn: async (file) => {
      const result = await base44.integrations.Core.UploadFile({ file });
      return result.file_url;
    },
  });

  const completeTaskMutation = useMutation({
    mutationFn: async ({ task, notes, photoUrl }) => {
      await base44.entities.TaskCompletion.create({
        participant_email: user.email,
        task_id: task.id,
        task_name: task.task_name,
        phase: task.phase,
        completed_date: new Date().toISOString(),
        notes: notes || null,
        photo_url: photoUrl || null,
      });

      // Check if phase is complete
      const phaseTasks = allTasks.filter(t => t.phase === task.phase);
      const phaseCompletionCount = completions.filter(c => c.phase === task.phase).length + 1;
      
      if (phaseCompletionCount === phaseTasks.length) {
        const existingPhaseCompletion = phaseCompletions.find(pc => pc.phase === task.phase);
        if (!existingPhaseCompletion) {
          await base44.entities.PhaseCompletion.create({
            participant_email: user.email,
            phase: task.phase,
            completed_date: new Date().toISOString(),
            badge_awarded: true,
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["task-completions"]);
      queryClient.invalidateQueries(["phase-completions"]);
      setSelectedTask(null);
      setCompletionNotes("");
      setUploadedPhoto(null);
    },
  });

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = await uploadPhotoMutation.mutateAsync(file);
      setUploadedPhoto(url);
    }
  };

  const handleCompleteTask = () => {
    completeTaskMutation.mutate({
      task: selectedTask,
      notes: completionNotes,
      photoUrl: uploadedPhoto,
    });
  };

  const generateSummary = async () => {
    const summary = {
      participant: user.email,
      discharge_date: profile?.discharge_date || "Not set",
      total_tasks_completed: completions.length,
      phases_completed: phaseCompletions.length,
      phase_1_progress: calculatePhaseProgress(1),
      phase_2_progress: calculatePhaseProgress(2),
      phase_3_progress: calculatePhaseProgress(3),
      completed_tasks: completions.map(c => ({
        task: c.task_name,
        completed: new Date(c.completed_date).toLocaleDateString(),
      })),
      generated: new Date().toLocaleDateString(),
    };

    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reintegration-progress-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const calculatePhaseProgress = (phase) => {
    const phaseTasks = allTasks.filter(t => t.phase === phase);
    const phaseCompletions = completions.filter(c => c.phase === phase);
    return phaseTasks.length > 0 ? Math.round((phaseCompletions.length / phaseTasks.length) * 100) : 0;
  };

  const isTaskCompleted = (taskId) => {
    return completions.some(c => c.task_id === taskId);
  };

  const overallProgress = Math.round((completions.length / allTasks.length) * 100) || 0;

  const getPhaseStartDate = (phase) => {
    if (!profile?.discharge_date) return null;
    const dischargeDate = new Date(profile.discharge_date);
    const startDay = PHASE_INFO[phase].startDay;
    const startDate = new Date(dischargeDate);
    startDate.setDate(startDate.getDate() + startDay);
    return startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getPhaseEndDate = (phase) => {
    if (!profile?.discharge_date) return null;
    const dischargeDate = new Date(profile.discharge_date);
    const endDay = PHASE_INFO[phase].endDay;
    const endDate = new Date(dischargeDate);
    endDate.setDate(endDate.getDate() + endDay);
    return endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getTaskCompletion = (taskId) => {
    return completions.find(c => c.task_id === taskId);
  };

  const isAlignedWithForwardPlan = (taskName) => {
    return forwardPlanMilestones.some(m => 
      m.milestone_text.toLowerCase().includes(taskName.toLowerCase().split(' ')[0]) ||
      taskName.toLowerCase().includes(m.category)
    );
  };

  if (!disclaimerAccepted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--bg-secondary)' }}>
        <div className="max-w-2xl w-full card">
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>90-Day Reintegration Framework</h2>
          <div className="space-y-4 mb-8 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <p>This framework provides structured engagement guidance during your first 90 days post-discharge.</p>
            <p className="font-semibold" style={{ color: 'var(--accent)' }}>Important Notice:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>This is a behavioral engagement and accountability tool</li>
              <li>This does NOT provide medical or legal advice</li>
              <li>You remain responsible for seeking professional assistance when needed</li>
              <li>In case of emergency, call 911 immediately</li>
            </ul>
          </div>
          <Button
            onClick={() => {
              localStorage.setItem("reintegration_disclaimer_accepted", "true");
              setDisclaimerAccepted(true);
            }}
            className="btn-primary w-full"
          >
            I Understand and Accept
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--bg-secondary)' }}>
      {/* Header */}
      <div className="px-6 pt-8 pb-6" style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
        <Link to={createPageUrl("ParticipantDashboard")} className="text-sm mb-3 inline-block" style={{ color: 'var(--primary)' }}>
          ← Back to Dashboard
        </Link>
        <h1 style={{ color: 'var(--text-primary)', marginBottom: '4px' }}>90-Day Reintegration Framework</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Structured task progression and compliance tracking
        </p>
      </div>

      <div className="px-6 py-6" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-section)' }}>
        {/* Overall Progress */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Overall Completion</h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {completions.length} of {allTasks.length} tasks completed
              </p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>{overallProgress}%</p>
            </div>
          </div>
          <div className="w-full h-2" style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${overallProgress}%`, height: '100%', background: 'var(--primary)' }} />
          </div>
        </div>

        {/* Export Summary */}
        <Button onClick={generateSummary} className="btn-secondary w-full">
          <FileText className="w-4 h-4 mr-2" strokeWidth={2} />
          Export Progress Report
        </Button>

        {/* Vertical Timeline */}
        <div className="relative">
          {[1, 2, 3].map((phase, phaseIndex) => {
            const phaseTasks = allTasks.filter(t => t.phase === phase);
            const phaseProgress = calculatePhaseProgress(phase);
            const phaseStartDate = getPhaseStartDate(phase);
            const phaseEndDate = getPhaseEndDate(phase);

            return (
              <div key={phase} className="relative" style={{ marginBottom: phaseIndex < 2 ? 'var(--spacing-section)' : '0' }}>
                {/* Timeline Line */}
                {phaseIndex < 2 && (
                  <div 
                    className="absolute left-[19px] top-0 w-0.5 h-full" 
                    style={{ background: 'var(--border)', zIndex: 0, transform: 'translateY(100%)' }} 
                  />
                )}

                {/* Phase Header */}
                <div className="card" style={{ marginBottom: '16px' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(47,243,224,0.15)', border: '2px solid var(--primary)' }}>
                      <span className="text-sm font-bold" style={{ color: 'var(--primary)' }}>{phase}</span>
                    </div>
                    <div className="flex-1">
                      <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{PHASE_INFO[phase].name}</h2>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {phaseStartDate && phaseEndDate ? `${phaseStartDate} — ${phaseEndDate}` : PHASE_INFO[phase].days}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{phaseProgress}%</p>
                    </div>
                  </div>
                  <div className="w-full h-1.5" style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${phaseProgress}%`, height: '100%', background: 'var(--primary)' }} />
                  </div>
                </div>

                {/* Tasks */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '40px' }}>
                  {phaseTasks.map((task, taskIndex) => {
                    const taskCompletion = getTaskCompletion(task.id);
                    const completed = !!taskCompletion;
                    const completedDate = taskCompletion ? new Date(taskCompletion.completed_date).toLocaleString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      hour: 'numeric', 
                      minute: '2-digit',
                      hour12: true 
                    }) : null;

                    return (
                      <button
                        key={task.id}
                        onClick={() => !completed && setSelectedTask(task)}
                        disabled={completed}
                        className="w-full text-left p-4"
                        style={{
                          background: completed ? 'rgba(34,197,94,0.05)' : 'var(--bg-card)',
                          border: `1px solid ${completed ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`,
                          borderRadius: 'var(--radius)',
                          cursor: completed ? 'default' : 'pointer',
                          opacity: completed ? 0.85 : 1,
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {completed ? (
                              <Lock className="w-4 h-4" style={{ color: '#22c55e' }} strokeWidth={2} />
                            ) : (
                              <Circle className="w-4 h-4" style={{ color: 'var(--text-muted)' }} strokeWidth={2} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <p className="font-medium text-sm" style={{ color: completed ? '#22c55e' : 'var(--text-primary)' }}>
                                {task.task_name}
                              </p>
                              {completed && (
                                <span className="px-2 py-0.5 text-[10px] font-medium flex-shrink-0" style={{ 
                                  background: 'rgba(34,197,94,0.15)', 
                                  color: '#22c55e',
                                  borderRadius: 'var(--radius)'
                                }}>
                                  ✓ DONE
                                </span>
                              )}
                            </div>
                            {task.task_description && (
                              <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                                {task.task_description}
                              </p>
                            )}
                            {!completed && isAlignedWithForwardPlan(task.task_name) && (
                              <p className="text-[10px] px-2 py-1 inline-block" style={{ 
                                background: 'rgba(74,144,226,0.1)', 
                                color: 'var(--primary)',
                                borderRadius: 'var(--radius)' 
                              }}>
                                ↗ Aligned with Long-Term Plan
                              </p>
                            )}
                            {completed && completedDate && (
                              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                                Completed: {completedDate}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Disclaimer */}
        <div className="p-4 text-xs" style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.3)', borderRadius: 'var(--radius)', color: 'var(--text-secondary)' }}>
          <p className="text-center">
            This roadmap supports structured reintegration. It does not provide medical or legal advice.
          </p>
        </div>
      </div>

      {/* Task Completion Dialog */}
      {selectedTask && (
        <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
          <DialogContent className="max-w-md" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <DialogHeader>
              <DialogTitle style={{ color: 'var(--text-primary)' }}>Complete Task</DialogTitle>
            </DialogHeader>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <p className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{selectedTask.task_name}</p>
                {selectedTask.task_description && (
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{selectedTask.task_description}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>
                  Completion Notes (Optional)
                </label>
                <Textarea
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="Add any notes..."
                  rows={3}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: 'var(--radius)' }}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>
                  Photo Evidence (Optional)
                </label>
                <label className="flex items-center justify-center gap-2 p-4 cursor-pointer border-2 border-dashed" style={{ borderColor: 'var(--border)', borderRadius: 'var(--radius)' }}>
                  <Upload className="w-5 h-5" style={{ color: 'var(--text-muted)' }} strokeWidth={2} />
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {uploadPhotoMutation.isPending ? "Uploading..." : uploadedPhoto ? "Photo Attached" : "Upload Photo"}
                  </span>
                  <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                </label>
                {uploadedPhoto && (
                  <img src={uploadedPhoto} alt="Evidence" className="mt-2 w-full h-32 object-cover" style={{ borderRadius: 'var(--radius)' }} />
                )}
              </div>

              <Button
                onClick={handleCompleteTask}
                disabled={completeTaskMutation.isPending}
                className="btn-primary w-full"
              >
                {completeTaskMutation.isPending ? "Saving..." : "Mark as Complete"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}