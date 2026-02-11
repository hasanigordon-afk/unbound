import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Sparkles, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AnimatePresence } from "framer-motion";
import MentorCard from "../components/mentors/MentorCard";
import MatchResults from "../components/mentors/MatchResults";
import ChatWindow from "../components/chat/ChatWindow";

export default function Mentors() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showMatches, setShowMatches] = useState(false);
  const [matches, setMatches] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: () => base44.auth.me(),
  });

  const { data: memberProfiles } = useQuery({
    queryKey: ["my-profile"],
    queryFn: async () => {
      const u = await base44.auth.me();
      return base44.entities.MemberProfile.filter({ created_by: u.email });
    },
  });

  const { data: mentors = [], isLoading } = useQuery({
    queryKey: ["mentors"],
    queryFn: () => base44.entities.MentorProfile.filter({ onboarding_complete: true }),
  });

  const createConversationMutation = useMutation({
    mutationFn: async (mentorUserId) => {
      const conv = await base44.entities.Conversation.create({
        member_user_id: user.id,
        mentor_user_id: mentorUserId,
        status: "pending",
      });
      return conv;
    },
    onSuccess: (conv) => {
      queryClient.invalidateQueries(["conversations"]);
      setSelectedChat(conv.id);
    },
  });

  const handleFindMatch = () => {
    const profile = memberProfiles?.[0];
    if (!profile) return;

    let filtered = mentors;

    if (profile.who_to_talk_to === "peer_only") {
      filtered = filtered.filter(m => 
        (m.role_type === "peer_mentor" || m.role_type === "hybrid") &&
        m.lived_experience_substances?.includes(profile.primary_substance)
      );
    } else if (profile.who_to_talk_to === "counselor_only") {
      filtered = filtered.filter(m =>
        (m.role_type === "counselor" || m.role_type === "hybrid") &&
        m.specialties_substances?.includes(profile.primary_substance)
      );
    }

    const scored = filtered.map(mentor => {
      let score = 0;
      let reasons = [];

      if (mentor.primary_lived_experience === profile.primary_substance || 
          mentor.specialties_substances?.includes(profile.primary_substance)) {
        score += 3;
        reasons.push(`${profile.primary_substance} focus`);
      }

      if (mentor.communication_modes?.includes(profile.comm_mode)) {
        score += 1;
        reasons.push("preferred communication");
      }

      if (mentor.facility_verified) {
        score += 1;
        reasons.push("facility verified");
      }

      if (mentor.rating_avg) {
        score += 1;
      }

      return { 
        mentor, 
        score, 
        reason: reasons.join(", ") 
      };
    });

    scored.sort((a, b) => b.score - a.score);
    setMatches(scored.slice(0, 3));
    setShowMatches(true);
  };

  const handleConnect = (mentor) => {
    createConversationMutation.mutate(mentor.created_by);
    setShowMatches(false);
  };

  const filteredMentors = mentors.filter(m => {
    const matchesSearch = m.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.bio?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || m.role_type === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="px-5 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Mentors</h1>
        <p className="text-slate-500 text-sm mb-6">Find someone who understands</p>

        <Button 
          onClick={handleFindMatch}
          className="w-full mb-4 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 h-12"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Find My Match
        </Button>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search mentors..." 
            className="pl-10 h-12 rounded-xl bg-white" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {["all", "peer_mentor", "counselor", "hybrid"].map(role => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                roleFilter === role
                  ? "bg-teal-600 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
              }`}
            >
              {role === "all" ? "All" : role.replace("_", " ")}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMentors.map(mentor => (
              <MentorCard key={mentor.id} mentor={mentor} onConnect={handleConnect} />
            ))}
            {filteredMentors.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-400">No mentors found</p>
              </div>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showMatches && (
          <MatchResults 
            matches={matches} 
            onClose={() => setShowMatches(false)}
            onConnect={handleConnect}
          />
        )}
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