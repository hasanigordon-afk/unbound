import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, MessageSquare, X, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function MessagingPanel({ participant, counselorEmail, facilityId, onClose }) {
  const [messageContent, setMessageContent] = useState("");
  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery({
    queryKey: ["counselor-messages", participant.participant_email],
    queryFn: async () => {
      const allMessages = await base44.entities.CounselorMessage.filter({
        facility_id: facilityId,
        participant_email: participant.participant_email
      });
      return allMessages.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    },
    enabled: !!participant && !!facilityId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content) => {
      return await base44.entities.CounselorMessage.create({
        facility_id: facilityId,
        counselor_email: counselorEmail,
        participant_email: participant.participant_email,
        message: content,
        is_read: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["counselor-messages"]);
      setMessageContent("");
      toast.success("Message sent");
    },
  });

  const handleSendMessage = () => {
    if (!messageContent.trim()) return;
    sendMessageMutation.mutate(messageContent.trim());
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl flex flex-col"
        style={{ 
          background: 'var(--bg-secondary)', 
          borderRadius: 'var(--radius)',
          maxHeight: '80vh',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5" style={{ color: 'var(--primary)' }} strokeWidth={1.5} />
            <div>
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                Message Participant
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {participant.participant_email}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </Button>
        </div>

        {/* Message History */}
        <div 
          className="flex-1 overflow-y-auto p-4"
          style={{ background: 'var(--bg-primary)' }}
        >
          <div className="space-y-3">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} strokeWidth={1.5} />
                <p style={{ color: 'var(--text-muted)' }}>No messages yet</p>
              </div>
            ) : (
              messages.map(msg => (
                <div 
                  key={msg.id}
                  className="p-4"
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)'
                  }}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline"
                        className="text-[10px] px-2 py-0.5"
                        style={{ 
                          background: 'rgba(74,144,226,0.1)', 
                          color: 'var(--primary)',
                          border: '1px solid var(--primary)'
                        }}
                      >
                        COUNSELOR
                      </Badge>
                      {msg.is_read && (
                        <CheckCircle2 
                          className="w-3 h-3" 
                          style={{ color: '#4CAF50' }} 
                          strokeWidth={2}
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <Clock className="w-3 h-3" strokeWidth={1.5} />
                      {new Date(msg.created_date).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>
                    {msg.message}
                  </p>
                  {msg.read_at && (
                    <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                      Read: {new Date(msg.read_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Message Input */}
        <div 
          className="p-4"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <Textarea
            placeholder="Type your message to the participant..."
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            rows={3}
            className="mb-3"
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              color: 'var(--text-primary)'
            }}
          />
          <div className="flex items-center justify-between">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Messages are visible to the participant in their dashboard
            </p>
            <Button
              onClick={handleSendMessage}
              disabled={!messageContent.trim() || sendMessageMutation.isPending}
              className="btn-primary"
            >
              <Send className="w-4 h-4 mr-2" strokeWidth={1.5} />
              {sendMessageMutation.isPending ? "Sending..." : "Send Message"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}