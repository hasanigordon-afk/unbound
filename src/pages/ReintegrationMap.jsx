import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { CheckCircle2, Circle, Upload, FileText, Download, Award, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

const PHASE_INFO = {
  1: { name: "Stabilization", days: "Days 1-14", color: "#ef4444" },
  2: { name: "Foundation", days: "Days 15-45", color: "#f59e0b" },
  3: { name: "Momentum", days: "Days 46-90", color: "#22c55e" },
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

  if (!disclaimerAccepted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#1a1f3a' }}>
        <div className="max-w-2xl w-full p-8 rounded-xl" style={{ background: '#0f1628', border: '1px solid rgba(255,255,255,0.1)' }}>
          <AlertCircle className="w-12 h-12 mx-auto mb-6" style={{ color: '#fbbf24' }} />
          <h2 className="text-2xl font-bold mb-4 text-center" style={{ color: '#ffffff' }}>
            90-Day Reintegration Map
          </h2>
          <div className="space-y-4 mb-8 text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
            <p>This roadmap provides structured engagement guidance during your first 90 days post-discharge.</p>
            <p className="font-semibold" style={{ color: '#fbbf24' }}>Important Disclaimers:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>This is NOT medical treatment</li>
              <li>This does NOT provide medical or legal advice</li>
              <li>This is a behavioral engagement and accountability tool</li>
              <li>You remain responsible for seeking professional assistance when needed</li>
              <li>In case of emergency, call 911 immediately</li>
            </ul>
          </div>
          <Button
            onClick={() => {
              localStorage.setItem("reintegration_disclaimer_accepted", "true");
              setDisclaimerAccepted(true);
            }}
            className="w-full"
            style={{ background: '#fbbf24', color: '#0f1628' }}
          >
            I Understand and Accept
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: '#1a1f3a' }}>
      {/* Header */}
      <div className="px-6 pt-8 pb-6" style={{ background: '#0f1628', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Link to={createPageUrl("ParticipantDashboard")} className="text-sm mb-3 inline-block" style={{ color: '#60a5fa' }}>
          ← Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold mb-2" style={{ color: '#ffffff' }}>90-Day Reintegration Map</h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
          Structured guidance for your first 90 days
        </p>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Overall Progress */}
        <div className="p-6 rounded-xl" style={{ background: '#0f1628', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold mb-1" style={{ color: '#ffffff' }}>Overall Progress</h3>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {completions.length} of {allTasks.length} tasks completed
              </p>
            </div>
            <div className="text-3xl font-bold" style={{ color: '#fbbf24' }}>{overallProgress}%</div>
          </div>
          <Progress value={overallProgress} className="h-3" />
          
          <Button
            onClick={generateSummary}
            variant="outline"
            className="w-full mt-4"
            style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#ffffff' }}
          >
            <Download className="w-4 h-4 mr-2" />
            Generate Progress Summary
          </Button>
        </div>

        {/* Phases */}
        {[1, 2, 3].map(phaseNum => {
          const phaseInfo = PHASE_INFO[phaseNum];
          const phaseTasks = allTasks.filter(t => t.phase === phaseNum);
          const progress = calculatePhaseProgress(phaseNum);
          const isCompleted = phaseCompletions.some(pc => pc.phase === phaseNum);

          return (
            <div key={phaseNum} className="p-6 rounded-xl" style={{ background: '#0f1628', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold" style={{ color: phaseInfo.color }}>
                      Phase {phaseNum}: {phaseInfo.name}
                    </h3>
                    {isCompleted && (
                      <Award className="w-6 h-6" style={{ color: '#fbbf24' }} />
                    )}
                  </div>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{phaseInfo.days}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold" style={{ color: phaseInfo.color }}>{progress}%</div>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {phaseTasks.filter(t => isTaskCompleted(t.id)).length}/{phaseTasks.length}
                  </p>
                </div>
              </div>

              <Progress value={progress} className="h-2 mb-4" />

              <div className="space-y-3">
                {phaseTasks.map(task => {
                  const completed = isTaskCompleted(task.id);
                  return (
                    <button
                      key={task.id}
                      onClick={() => !completed && setSelectedTask(task)}
                      disabled={completed}
                      className="w-full p-4 rounded-lg flex items-start gap-3 text-left transition-all disabled:opacity-60"
                      style={{
                        background: completed ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${completed ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)'}`,
                      }}
                    >
                      {completed ? (
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#22c55e' }} />
                      ) : (
                        <Circle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }} />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-sm mb-1" style={{ color: '#ffffff' }}>{task.task_name}</p>
                        {task.task_description && (
                          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{task.task_description}</p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Legal Footer */}
        <div className="p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.5)' }}>
            This roadmap provides structured engagement guidance. It does not provide medical or legal advice. 
            Users remain responsible for seeking professional assistance when needed.
          </p>
        </div>
      </div>

      {/* Task Completion Dialog */}
      {selectedTask && (
        <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
          <DialogContent className="max-w-md" style={{ background: '#0f1628', border: '1px solid rgba(255,255,255,0.1)' }}>
            <DialogHeader>
              <DialogTitle style={{ color: '#ffffff' }}>Complete Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="font-semibold mb-2" style={{ color: '#ffffff' }}>{selectedTask.task_name}</p>
                {selectedTask.task_description && (
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{selectedTask.task_description}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  Notes (Optional)
                </label>
                <Textarea
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="Add any notes about completing this task..."
                  rows={3}
                  style={{ background: '#1a1f3a', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  Attach Photo (Optional)
                </label>
                <label className="flex items-center justify-center gap-2 p-4 rounded-lg cursor-pointer border-2 border-dashed transition-colors hover:border-amber-500" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                  <Upload className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.5)' }} />
                  <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    {uploadedPhoto ? "Photo attached" : "Upload photo"}
                  </span>
                  <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                </label>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setSelectedTask(null)}
                  variant="outline"
                  className="flex-1"
                  style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#ffffff' }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCompleteTask}
                  disabled={completeTaskMutation.isPending}
                  className="flex-1"
                  style={{ background: '#fbbf24', color: '#0f1628' }}
                >
                  Mark Complete
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}