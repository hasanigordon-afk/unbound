import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Loader2, BookOpen, Calendar } from "lucide-react";
import PromptsGenerator from "../components/journaling/PromptsGenerator";
import JournalEntryForm from "../components/journaling/JournalEntryForm";
import moment from "moment";

export default function Journal() {
  const [selectedPrompt, setSelectedPrompt] = useState(null);

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

  const { data: entries = [] } = useQuery({
    queryKey: ["journal-entries"],
    queryFn: async () => {
      return base44.entities.JournalEntry.filter({ created_by: user.email }, '-created_date', 10);
    },
    enabled: !!user,
  });

  const profile = profiles[0];

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0B0F1F' }}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#2FF3E0' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: '#0B0F1F' }}>
      <div className="px-5 pt-8 pb-10 rounded-b-3xl" style={{ background: 'linear-gradient(135deg, rgba(123,92,255,0.2), rgba(47,243,224,0.1))' }}>
        <h1 className="text-2xl font-bold mb-2" style={{ color: '#2FF3E0' }}>Journal</h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>Reflect on your recovery journey</p>
      </div>

      <div className="px-5 -mt-5 space-y-5 max-w-lg mx-auto">
        {selectedPrompt ? (
          <JournalEntryForm 
            prompt={selectedPrompt} 
            onClose={() => setSelectedPrompt(null)} 
          />
        ) : (
          <PromptsGenerator 
            profile={profile} 
            onSelectPrompt={setSelectedPrompt} 
          />
        )}

        {/* Recent Entries */}
        {entries.length > 0 && !selectedPrompt && (
          <div className="glass-card p-5">
            <h3 className="font-semibold mb-4" style={{ color: '#FFFFFF' }}>Recent Entries</h3>
            <div className="space-y-3">
              {entries.map((entry) => (
                <div key={entry.id} className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.5)' }} />
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      {moment(entry.created_date).format('MMM D, YYYY')}
                    </span>
                    {entry.mood && (
                      <span className="text-xs px-2 py-0.5 rounded-full ml-auto" style={{ background: 'rgba(47,243,224,0.15)', color: '#2FF3E0' }}>
                        {entry.mood}
                      </span>
                    )}
                  </div>
                  {entry.prompt && (
                    <p className="text-xs mb-2 italic" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      "{entry.prompt}"
                    </p>
                  )}
                  <p className="text-sm line-clamp-3" style={{ color: 'rgba(255,255,255,0.9)' }}>
                    {entry.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}