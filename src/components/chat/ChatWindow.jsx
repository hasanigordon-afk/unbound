import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, AlertTriangle, Flag, Ban, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CRISIS_KEYWORDS = ["kill myself", "suicide", "end it all", "want to die", "harm myself"];

export default function ChatWindow({ conversationId, onClose }) {
  const [messageText, setMessageText] = useState("");
  const [showReport, setShowReport] = useState(false);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: () => base44.auth.me(),
  });

  const { data: conversation } = useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: () => base44.entities.Conversation.filter({ id: conversationId }).then(c => c[0]),
    enabled: !!conversationId,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => base44.entities.Message.filter({ conversation_id: conversationId }, "-created_date"),
    enabled: !!conversationId,
    refetchInterval: 3000,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (body) => {
      const flagged = CRISIS_KEYWORDS.some(kw => body.toLowerCase().includes(kw));
      return base44.entities.Message.create({
        conversation_id: conversationId,
        sender_user_id: user.id,
        body,
        flagged_crisis: flagged,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["messages", conversationId]);
      setMessageText("");
    },
  });

  const reportMutation = useMutation({
    mutationFn: (reason) => {
      const reportedUserId = conversation?.member_user_id === user.id 
        ? conversation.mentor_user_id 
        : conversation.member_user_id;
      return base44.entities.UserReport.create({
        reported_user_id: reportedUserId,
        reason,
        conversation_id: conversationId,
      });
    },
  });

  const handleSend = () => {
    if (messageText.trim() && (conversation?.status === "active" || conversation?.status === "pending")) {
      sendMessageMutation.mutate(messageText);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const hasCrisisFlag = messages.some(m => m.flagged_crisis);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full h-full sm:h-[600px] sm:max-w-lg sm:rounded-2xl flex flex-col"
      >
        <div className="border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Chat</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowReport(!showReport)} className="text-slate-400 hover:text-rose-600">
              <Flag className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {hasCrisisFlag && (
          <div className="bg-rose-50 border-b border-rose-200 px-4 py-3 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-rose-800">
              <p className="font-medium">Crisis support available</p>
              <p>If you're in immediate danger, call <strong>988</strong> or local emergency services.</p>
            </div>
          </div>
        )}

        {showReport && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 space-y-2">
            <p className="text-sm font-medium text-amber-900">Report this user</p>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  reportMutation.mutate("Inappropriate behavior");
                  setShowReport(false);
                }}
              >
                Inappropriate
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  reportMutation.mutate("Spam");
                  setShowReport(false);
                }}
              >
                Spam
              </Button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-auto p-4 space-y-3">
          {messages.map((msg) => {
            const isMe = msg.sender_user_id === user?.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                  isMe ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-900"
                }`}>
                  <p className="text-sm">{msg.body}</p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {conversation?.status === "active" || conversation?.status === "pending" ? (
          <div className="border-t border-slate-200 p-4 flex gap-2">
            <Textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type a message..."
              className="resize-none h-12"
              onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
            />
            <Button onClick={handleSend} disabled={!messageText.trim()} className="bg-teal-600 hover:bg-teal-700">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="border-t border-slate-200 p-4 text-center text-sm text-slate-500">
            This conversation is closed
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}