import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, BookOpen, Calendar, Tag, Heart, Search, Share2, Lock, Mic } from "lucide-react";
import VoiceRecorder from "@/components/journal/VoiceRecorder";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import moment from "moment";
import { demoJournalEntries } from "@/data/pilotDemoData";

const TAGS = ["craving", "gratitude", "trigger", "win", "relapse", "reflection"];
const MOOD_LABELS = { 1: "😔", 2: "😕", 3: "😐", 4: "🙂", 5: "😊" };

const TAG_COLORS = {
  craving: "#E85D4C",
  gratitude: "#22c55e",
  trigger: "#FF9800",
  win: "#4A90E2",
  relapse: "#9C6FE4",
  reflection: "#6B7280",
};

export default function Journal() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTag, setFilterTag] = useState("all");
  const [newEntry, setNewEntry] = useState({ content: "", mood_score: 3, tags: [], shared_with_facility: false });

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: participantProfile } = useQuery({
    queryKey: ["participant-profile-j"],
    queryFn: async () => {
      const p = await base44.entities.ParticipantProfile.filter({ participant_email: user.email });
      return p[0];
    },
    enabled: !!user,
  });

  const { data: entries = [] } = useQuery({
    queryKey: ["journal-entries", user?.email],
    queryFn: () => base44.entities.JournalEntry.filter({ created_by: user.email }, '-created_date', 50).catch(() => []),
    enabled: !!user,
  });
  const entryRows = entries.length > 0 ? entries : demoJournalEntries;

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.JournalEntry.create({
      ...data,
      facility_id: data.shared_with_facility ? participantProfile?.facility_id : null,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(["journal-entries"]);
      setShowForm(false);
      setNewEntry({ content: "", mood_score: 3, tags: [], shared_with_facility: false });
      toast.success("Entry saved");
    },
  });

  const toggleShareMutation = useMutation({
    mutationFn: ({ id, shared }) => base44.entities.JournalEntry.update(id, {
      shared_with_facility: shared,
      facility_id: shared ? participantProfile?.facility_id : null,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(["journal-entries"]);
      toast.success("Sharing preference updated");
    },
  });

  const toggleTag = (tag) => {
    setNewEntry(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag]
    }));
  };

  const filtered = entryRows.filter(e => {
    const matchesSearch = !searchQuery || e.content?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = filterTag === "all" || (e.tags || []).includes(filterTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--bg-primary)' }}>
      <div className="px-5 pt-8 pb-5" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1>Journal</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Private reflections · {entryRows.length} entries</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="btn-primary">
            {showForm ? "Cancel" : "+ New Entry"}
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search entries..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg"
            style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      {/* Tag filters */}
      <div className="flex gap-2 px-5 py-3 overflow-x-auto" style={{ borderBottom: '1px solid var(--border)' }}>
        {["all", ...TAGS].map(tag => (
          <button
            key={tag}
            onClick={() => setFilterTag(tag)}
            className="text-xs px-3 py-1.5 rounded-full flex-shrink-0 capitalize font-medium"
            style={{
              background: filterTag === tag ? (TAG_COLORS[tag] || 'var(--primary)') : 'var(--bg-secondary)',
              color: filterTag === tag ? '#FFF' : 'var(--text-secondary)',
              border: `1px solid ${filterTag === tag ? 'transparent' : 'var(--border)'}`
            }}
          >
            {tag === "all" ? "All" : tag}
          </button>
        ))}
      </div>

      <div className="px-5 py-5 space-y-4 max-w-2xl">
        {/* New Entry Form */}
        {showForm && (
          <div className="card">
            <h3 className="mb-4">New Journal Entry</h3>

            {/* Mood */}
            <div className="mb-4">
              <p className="text-sm mb-2 font-medium" style={{ color: 'var(--text-secondary)' }}>How are you feeling?</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    onClick={() => setNewEntry(prev => ({ ...prev, mood_score: n }))}
                    className="w-10 h-10 rounded-xl text-xl flex items-center justify-center"
                    style={{
                      background: newEntry.mood_score === n ? 'var(--primary)' : 'var(--bg-primary)',
                      border: `2px solid ${newEntry.mood_score === n ? 'var(--primary)' : 'var(--border)'}`
                    }}
                  >
                    {MOOD_LABELS[n]}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="mb-4">
              <p className="text-sm mb-2 font-medium" style={{ color: 'var(--text-secondary)' }}>Tags</p>
              <div className="flex flex-wrap gap-2">
                {TAGS.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className="text-xs px-3 py-1.5 rounded-full capitalize font-medium"
                    style={{
                      background: newEntry.tags.includes(tag) ? TAG_COLORS[tag] : 'var(--bg-primary)',
                      color: newEntry.tags.includes(tag) ? '#FFF' : 'var(--text-muted)',
                      border: `1px solid ${newEntry.tags.includes(tag) ? TAG_COLORS[tag] : 'var(--border)'}`
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Voice recorder */}
            <VoiceRecorder
              onTranscript={(text) =>
                setNewEntry(prev => ({
                  ...prev,
                  content: prev.content ? prev.content + " " + text : text,
                }))
              }
            />

            {/* Content */}
            <textarea
              placeholder="Write or speak your thoughts..."
              value={newEntry.content}
              onChange={e => setNewEntry(prev => ({ ...prev, content: e.target.value }))}
              rows={5}
              className="w-full p-3 text-sm rounded-lg mb-4"
              style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)', resize: 'vertical' }}
            />

            {/* Share with facility */}
            {participantProfile?.facility_id && (
              <div
                className="flex items-center gap-3 p-3 rounded-lg mb-4 cursor-pointer"
                style={{ background: 'var(--bg-primary)', border: `1px solid ${newEntry.shared_with_facility ? 'var(--primary)' : 'var(--border)'}` }}
                onClick={() => setNewEntry(prev => ({ ...prev, shared_with_facility: !prev.shared_with_facility }))}
              >
                {newEntry.shared_with_facility ? <Share2 className="w-4 h-4" style={{ color: 'var(--primary)' }} strokeWidth={1.5} /> : <Lock className="w-4 h-4" style={{ color: 'var(--text-muted)' }} strokeWidth={1.5} />}
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {newEntry.shared_with_facility ? "Shared with counselor" : "Keep private"}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {newEntry.shared_with_facility ? "Your counselor can view this entry" : "Only you can see this"}
                  </p>
                </div>
                <div className="w-10 h-5 rounded-full relative transition-all" style={{ background: newEntry.shared_with_facility ? 'var(--primary)' : 'var(--border)' }}>
                  <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all" style={{ left: newEntry.shared_with_facility ? '22px' : '2px' }} />
                </div>
              </div>
            )}

            <Button onClick={() => createMutation.mutate(newEntry)} disabled={!newEntry.content.trim() || createMutation.isPending} className="w-full btn-primary">
              {createMutation.isPending ? "Saving..." : "Save Entry"}
            </Button>
          </div>
        )}

        {/* Entries List */}
        {filtered.map(entry => (
          <div key={entry.id} className="card">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {moment(entry.created_date).format('MMM D, YYYY')}
                </span>
                {entry.mood_score && (
                  <span className="text-base">{MOOD_LABELS[entry.mood_score]}</span>
                )}
              </div>
              {participantProfile?.facility_id && (
                <button
                  onClick={() => toggleShareMutation.mutate({ id: entry.id, shared: !entry.shared_with_facility })}
                  className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
                  style={{
                    background: entry.shared_with_facility ? 'rgba(74,144,226,0.1)' : 'var(--bg-primary)',
                    color: entry.shared_with_facility ? 'var(--primary)' : 'var(--text-muted)',
                    border: `1px solid ${entry.shared_with_facility ? 'var(--primary)' : 'var(--border)'}`
                  }}
                >
                  {entry.shared_with_facility ? <Share2 className="w-3 h-3" strokeWidth={1.5} /> : <Lock className="w-3 h-3" strokeWidth={1.5} />}
                  {entry.shared_with_facility ? "Shared" : "Private"}
                </button>
              )}
            </div>

            {entry.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {entry.tags.map(tag => (
                  <Badge
                    key={tag}
                    className="text-[10px] px-2 py-0.5 capitalize"
                    style={{ background: `${TAG_COLORS[tag]}20`, color: TAG_COLORS[tag], border: `1px solid ${TAG_COLORS[tag]}40` }}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{entry.content}</p>
          </div>
        ))}

        {filtered.length === 0 && !showForm && (
          <div className="text-center py-16 card">
            <BookOpen className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} strokeWidth={1.5} />
            <p style={{ color: 'var(--text-muted)' }}>
              {searchQuery || filterTag !== "all" ? "No entries match your filters" : "Your journal is empty"}
            </p>
            {!searchQuery && filterTag === "all" && (
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Start by writing your first entry</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}