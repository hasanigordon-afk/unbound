import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function MessagingPanel({ counselorEmail, facilityId, participants }) {
  const queryClient = useQueryClient();
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [messageText, setMessageText] = useState("");

  const { data: messages = [] } = useQuery({
    queryKey: ["counselor-messages", facilityId],
    queryFn: () => base44.entities.CounselorMessage.filter({ facility_id: facilityId }),
    refetchInterval: 3000,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.CounselorMessage.create({
        facility_id: facilityId,
        counselor_email: counselorEmail,
        participant_email: selectedParticipant,
        message: messageText,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["counselor-messages"]);
      setMessageText("");
    },
  });

  const participantMessages = messages.filter(
    m => m.participant_email === selectedParticipant
  ).sort((a, b) => new Date(a.created_date) - new Date(b.created_date));

  const unreadCounts = {};
  messages.forEach(m => {
    if (!m.is_read) {
      unreadCounts[m.participant_email] = (unreadCounts[m.participant_email] || 0) + 1;
    }
  });

  return (
    <div className="grid grid-cols-3 gap-4 h-[600px]">
      {/* Participant List */}
      <div className="rounded-xl overflow-hidden" style={{ background: '#0f1628', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 className="font-semibold" style={{ color: '#ffffff' }}>Participants</h3>
        </div>
        <ScrollArea className="h-[540px]">
          <div className="p-2 space-y-1">
            {participants.map(p => (
              <button
                key={p.participant_email}
                onClick={() => setSelectedParticipant(p.participant_email)}
                className="w-full p-3 rounded-lg text-left transition-all"
                style={{
                  background: selectedParticipant === p.participant_email ? 'rgba(251,191,36,0.2)' : 'transparent',
                  border: `1px solid ${selectedParticipant === p.participant_email ? 'rgba(251,191,36,0.3)' : 'transparent'}`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(251,191,36,0.2)' }}>
                      <User className="w-4 h-4" style={{ color: '#fbbf24' }} />
                    </div>
                    <span className="text-sm font-medium" style={{ color: '#ffffff' }}>
                      {p.participant_email.split('@')[0]}
                    </span>
                  </div>
                  {unreadCounts[p.participant_email] > 0 && (
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: '#ef4444', color: '#ffffff' }}>
                      {unreadCounts[p.participant_email]}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Message Thread */}
      <div className="col-span-2 rounded-xl overflow-hidden flex flex-col" style={{ background: '#0f1628', border: '1px solid rgba(255,255,255,0.1)' }}>
        {selectedParticipant ? (
          <>
            <div className="p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <h3 className="font-semibold" style={{ color: '#ffffff' }}>{selectedParticipant}</h3>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {participantMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.counselor_email === counselorEmail ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className="max-w-[70%] p-3 rounded-lg"
                      style={{
                        background: msg.counselor_email === counselorEmail ? '#fbbf24' : 'rgba(255,255,255,0.1)',
                        color: msg.counselor_email === counselorEmail ? '#0f1628' : '#ffffff',
                      }}
                    >
                      <p className="text-sm">{msg.message}</p>
                      <p className="text-xs mt-1" style={{ opacity: 0.7 }}>
                        {new Date(msg.created_date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="flex gap-2">
                <Textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message..."
                  rows={2}
                  style={{ background: '#1a1f3a', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}
                />
                <Button
                  onClick={() => sendMessageMutation.mutate()}
                  disabled={!messageText.trim() || sendMessageMutation.isPending}
                  style={{ background: '#fbbf24', color: '#0f1628' }}
                >
                  {sendMessageMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p style={{ color: 'rgba(255,255,255,0.5)' }}>Select a participant to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}