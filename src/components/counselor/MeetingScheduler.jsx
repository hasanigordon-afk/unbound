import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Calendar, Clock, Plus, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function MeetingScheduler({ counselorEmail, facilityId, participants }) {
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    participant_email: "",
    meeting_type: "check_in",
    scheduled_date: "",
    notes: "",
  });

  const { data: meetings = [] } = useQuery({
    queryKey: ["counselor-meetings", facilityId],
    queryFn: () => base44.entities.ClientMeeting.filter({ facility_id: facilityId }),
  });

  const createMeetingMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.ClientMeeting.create({
        facility_id: facilityId,
        counselor_email: counselorEmail,
        participant_email: formData.participant_email,
        meeting_type: formData.meeting_type,
        scheduled_date: new Date(formData.scheduled_date).toISOString(),
        notes: formData.notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["counselor-meetings"]);
      setShowCreateDialog(false);
      setFormData({ participant_email: "", meeting_type: "check_in", scheduled_date: "", notes: "" });
    },
  });

  const updateMeetingMutation = useMutation({
    mutationFn: async ({ meetingId, status, notes, duration }) => {
      const updateData = { status };
      if (status === "completed") {
        updateData.completed_date = new Date().toISOString();
        if (duration) updateData.duration_minutes = duration;
      }
      if (notes) updateData.notes = notes;
      await base44.entities.ClientMeeting.update(meetingId, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["counselor-meetings"]);
    },
  });

  const upcomingMeetings = meetings
    .filter(m => m.status === "scheduled" && new Date(m.scheduled_date) >= new Date())
    .sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date));

  const pastMeetings = meetings
    .filter(m => m.status !== "scheduled" || new Date(m.scheduled_date) < new Date())
    .sort((a, b) => new Date(b.scheduled_date) - new Date(a.scheduled_date))
    .slice(0, 10);

  return (
    <div className="space-y-4">
      <Button
        onClick={() => setShowCreateDialog(true)}
        className="w-full"
        style={{ background: '#fbbf24', color: '#0f1628' }}
      >
        <Plus className="w-4 h-4 mr-2" />
        Schedule Meeting
      </Button>

      {/* Upcoming Meetings */}
      <div>
        <h3 className="font-semibold mb-3" style={{ color: '#ffffff' }}>Upcoming Meetings</h3>
        <div className="space-y-2">
          {upcomingMeetings.map(meeting => (
            <div key={meeting.id} className="p-4 rounded-lg" style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.3)' }}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium" style={{ color: '#ffffff' }}>{meeting.participant_email}</p>
                  <p className="text-xs capitalize" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    {meeting.meeting_type.replace(/_/g, " ")}
                  </p>
                </div>
                <div className="text-right text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  <p>{new Date(meeting.scheduled_date).toLocaleDateString()}</p>
                  <p>{new Date(meeting.scheduled_date).toLocaleTimeString()}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => updateMeetingMutation.mutate({ meetingId: meeting.id, status: "completed", duration: 30 })}
                  style={{ background: '#22c55e', color: '#ffffff' }}
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Complete
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateMeetingMutation.mutate({ meetingId: meeting.id, status: "cancelled" })}
                  style={{ borderColor: 'rgba(239,68,68,0.5)', color: '#ef4444' }}
                >
                  <XCircle className="w-3 h-3 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          ))}
          {upcomingMeetings.length === 0 && (
            <p className="text-sm text-center py-4" style={{ color: 'rgba(255,255,255,0.5)' }}>No upcoming meetings</p>
          )}
        </div>
      </div>

      {/* Past Meetings */}
      <div>
        <h3 className="font-semibold mb-3" style={{ color: '#ffffff' }}>Recent Meeting History</h3>
        <div className="space-y-2">
          {pastMeetings.map(meeting => (
            <div key={meeting.id} className="p-3 rounded-lg text-sm" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium" style={{ color: '#ffffff' }}>{meeting.participant_email.split('@')[0]}</p>
                  <p className="text-xs capitalize" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {meeting.meeting_type.replace(/_/g, " ")} • {new Date(meeting.scheduled_date).toLocaleDateString()}
                  </p>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium`} style={{
                  background: meeting.status === "completed" ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
                  color: meeting.status === "completed" ? '#22c55e' : '#ef4444',
                }}>
                  {meeting.status}
                </div>
              </div>
              {meeting.notes && (
                <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.6)' }}>{meeting.notes}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent style={{ background: '#0f1628', border: '1px solid rgba(255,255,255,0.1)' }}>
          <DialogHeader>
            <DialogTitle style={{ color: '#ffffff' }}>Schedule Meeting</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label style={{ color: 'rgba(255,255,255,0.7)' }}>Participant</Label>
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
              <Label style={{ color: 'rgba(255,255,255,0.7)' }}>Meeting Type</Label>
              <Select value={formData.meeting_type} onValueChange={(v) => setFormData({...formData, meeting_type: v})}>
                <SelectTrigger style={{ background: '#1a1f3a', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="check_in">Check-In</SelectItem>
                  <SelectItem value="goal_setting">Goal Setting</SelectItem>
                  <SelectItem value="crisis_intervention">Crisis Intervention</SelectItem>
                  <SelectItem value="progress_review">Progress Review</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label style={{ color: 'rgba(255,255,255,0.7)' }}>Date & Time</Label>
              <Input
                type="datetime-local"
                value={formData.scheduled_date}
                onChange={(e) => setFormData({...formData, scheduled_date: e.target.value})}
                style={{ background: '#1a1f3a', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}
              />
            </div>
            <div>
              <Label style={{ color: 'rgba(255,255,255,0.7)' }}>Notes (optional)</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={3}
                style={{ background: '#1a1f3a', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="flex-1" style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#ffffff' }}>
                Cancel
              </Button>
              <Button
                onClick={() => createMeetingMutation.mutate()}
                disabled={!formData.participant_email || !formData.scheduled_date || createMeetingMutation.isPending}
                className="flex-1"
                style={{ background: '#fbbf24', color: '#0f1628' }}
              >
                Schedule
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}