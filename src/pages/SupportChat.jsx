import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Bot, User as UserIcon, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function SupportChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ["my-profile"],
    queryFn: async () => {
      return base44.entities.MemberProfile.filter({ created_by: user.email });
    },
    enabled: !!user,
  });

  const profile = profiles[0];

  const sendMessage = useMutation({
    mutationFn: async (userMessage) => {
      const systemPrompt = `You are a compassionate AI recovery support assistant for RecoveryLink, an app helping people in substance use and alcohol recovery.

User Context:
- Recovery Stage: ${profile?.stage || 'unknown'}
- Recovery Track: ${profile?.track || 'unknown'}
- Goals: ${profile?.goals?.join(', ') || 'not specified'}
- Challenges: ${profile?.challenges?.join(', ') || 'not specified'}

Your role:
1. Provide emotional support and encouragement
2. Answer questions about recovery, coping strategies, and relapse prevention
3. Explain app features (check-ins, mentors, resources, journaling, achievements)
4. Share evidence-based recovery information
5. Help users find local resources and support groups
6. Encourage professional help when needed

Guidelines:
- Be warm, empathetic, and non-judgmental
- Use person-first language
- Validate their feelings and experiences
- Provide actionable, practical advice
- Recognize crisis situations and provide emergency resources (988 Lifeline)
- Keep responses concise but helpful
- Celebrate their progress and efforts

CRITICAL: If user expresses suicidal thoughts or immediate danger, immediately provide the 988 Suicide & Crisis Lifeline and encourage them to call.

User's message: ${userMessage}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: systemPrompt,
      });

      return response;
    },
    onSuccess: (response, userMessage) => {
      setMessages(prev => [...prev, 
        { role: "user", content: userMessage },
        { role: "assistant", content: response }
      ]);
      setInput("");
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || sendMessage.isPending) return;
    sendMessage.mutate(input);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen pb-24 flex flex-col" style={{ background: '#0B0F1F' }}>
      <div className="px-5 pt-8 pb-6 rounded-b-3xl" style={{ background: 'linear-gradient(135deg, rgba(123,92,255,0.2), rgba(47,243,224,0.1))' }}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(123,92,255,0.3)' }}>
            <Bot className="w-6 h-6" style={{ color: '#7B5CFF' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#2FF3E0' }}>Support Chat</h1>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>24/7 AI Support</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-5 py-5 space-y-4 overflow-y-auto max-w-lg mx-auto w-full">
        {messages.length === 0 ? (
          <div className="glass-card p-6 text-center">
            <Bot className="w-12 h-12 mx-auto mb-3" style={{ color: '#7B5CFF' }} />
            <h3 className="font-semibold mb-2" style={{ color: '#FFFFFF' }}>
              Hi there! How can I support you today?
            </h3>
            <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.75)' }}>
              I'm here to answer questions about recovery, app features, or just listen.
            </p>
            <div className="grid grid-cols-1 gap-2 text-left">
              {[
                "How do I cope with cravings?",
                "Tell me about the check-in feature",
                "What are some grounding techniques?",
                "How do I find local support groups?"
              ].map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(suggestion)}
                  className="p-3 rounded-lg text-sm hover:opacity-80 transition-all text-left"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.9)' }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(123,92,255,0.2)' }}>
                  <Bot className="w-5 h-5" style={{ color: '#7B5CFF' }} />
                </div>
              )}
              <div
                className="max-w-[80%] rounded-2xl px-4 py-3"
                style={{
                  background: msg.role === 'user' ? '#2FF3E0' : 'rgba(255,255,255,0.05)',
                  color: msg.role === 'user' ? '#0B0F1F' : '#FFFFFF'
                }}
              >
                {msg.role === 'assistant' ? (
                  <ReactMarkdown className="text-sm prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  <p className="text-sm">{msg.content}</p>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(47,243,224,0.2)' }}>
                  <UserIcon className="w-5 h-5" style={{ color: '#2FF3E0' }} />
                </div>
              )}
            </div>
          ))
        )}
        
        {sendMessage.isPending && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(123,92,255,0.2)' }}>
              <Bot className="w-5 h-5" style={{ color: '#7B5CFF' }} />
            </div>
            <div className="rounded-2xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#7B5CFF' }} />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="sticky bottom-0 p-5 max-w-lg mx-auto w-full" style={{ background: '#0B0F1F' }}>
        <div className="glass-card p-3 flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="resize-none min-h-[44px] max-h-[120px]"
            style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#FFFFFF' }}
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || sendMessage.isPending}
            size="icon"
            className="flex-shrink-0"
            style={{ background: input.trim() ? '#2FF3E0' : 'rgba(255,255,255,0.1)', color: input.trim() ? '#0B0F1F' : 'rgba(255,255,255,0.3)' }}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}