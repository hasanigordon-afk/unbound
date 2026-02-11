import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ChatWindow from "../components/chat/ChatWindow";
import { AnimatePresence } from "framer-motion";

export default function Messages() {
  const [selectedChat, setSelectedChat] = useState(null);

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: () => base44.auth.me(),
  });

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const u = await base44.auth.me();
      const asMemb = await base44.entities.Conversation.filter({ member_user_id: u.id });
      const asMent = await base44.entities.Conversation.filter({ mentor_user_id: u.id });
      return [...asMemb, ...asMent].sort((a, b) => 
        new Date(b.updated_date) - new Date(a.updated_date)
      );
    },
    enabled: !!user,
  });

  const statusColors = {
    pending: "bg-amber-100 text-amber-700",
    active: "bg-green-100 text-green-700",
    closed: "bg-slate-100 text-slate-500",
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="px-5 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Messages</h1>
        <p className="text-slate-500 text-sm mb-6">Your conversations</p>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
              <MessageCircle className="w-7 h-7 text-blue-400" />
            </div>
            <p className="text-slate-500 font-medium">No messages yet</p>
            <p className="text-slate-400 text-sm mt-1">Connect with a mentor to start chatting</p>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => setSelectedChat(conv.id)}
                className="w-full bg-white rounded-2xl border border-slate-200 p-4 text-left hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="font-medium text-slate-900">
                    {conv.member_user_id === user?.id ? "Mentor" : "Member"}
                  </p>
                  <Badge className={statusColors[conv.status]}>
                    {conv.status}
                  </Badge>
                </div>
                <p className="text-sm text-slate-500">
                  {new Date(conv.updated_date).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedChat && (
          <ChatWindow 
            conversationId={selectedChat}
            onClose={() => setSelectedChat(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}