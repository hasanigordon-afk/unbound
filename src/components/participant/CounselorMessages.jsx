import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function CounselorMessages({ participantEmail, facilityId }) {
  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery({
    queryKey: ["participant-messages", participantEmail],
    queryFn: async () => {
      const allMessages = await base44.entities.CounselorMessage.filter({
        facility_id: facilityId,
        participant_email: participantEmail
      });
      return allMessages.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    enabled: !!participantEmail && !!facilityId,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (messageId) => {
      return await base44.entities.CounselorMessage.update(messageId, {
        is_read: true,
        read_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["participant-messages"]);
    },
  });

  const unreadCount = messages.filter(m => !m.is_read).length;

  if (messages.length === 0) return null;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" style={{ color: 'var(--primary)' }} strokeWidth={1.5} />
          <h3>Messages from Counselor</h3>
          {unreadCount > 0 && (
            <Badge 
              className="text-[10px] px-2 py-0.5"
              style={{ background: 'var(--primary)', color: '#FFFFFF' }}
            >
              {unreadCount} NEW
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {messages.map(msg => (
          <div 
            key={msg.id}
            className="p-4"
            style={{
              background: msg.is_read ? 'var(--bg-primary)' : 'rgba(74,144,226,0.05)',
              border: `1px solid ${msg.is_read ? 'var(--border)' : 'var(--primary)'}`,
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
                {!msg.is_read && (
                  <Badge 
                    className="text-[10px] px-2 py-0.5"
                    style={{ background: 'var(--primary)', color: '#FFFFFF' }}
                  >
                    UNREAD
                  </Badge>
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
            
            <p className="text-sm whitespace-pre-wrap mb-3" style={{ color: 'var(--text-primary)' }}>
              {msg.message}
            </p>

            {!msg.is_read && (
              <Button
                onClick={() => markAsReadMutation.mutate(msg.id)}
                size="sm"
                className="btn-secondary text-xs"
              >
                Mark as Read
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}