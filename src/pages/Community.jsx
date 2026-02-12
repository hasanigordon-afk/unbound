import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Users, MessageSquare, Heart, Sparkles, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ForumFeed from "../components/community/ForumFeed";
import WinsWall from "../components/community/WinsWall";
import SupportGroups from "../components/community/SupportGroups";
import CreatePostDialog from "../components/community/CreatePostDialog";
import CreateWinDialog from "../components/community/CreateWinDialog";

export default function Community() {
  const [activeTab, setActiveTab] = useState("forum");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateWin, setShowCreateWin] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  return (
    <div className="min-h-screen pb-24" style={{ background: '#0B0F1F' }}>
      <div className="px-5 pt-8 pb-6 rounded-b-3xl" style={{ background: 'linear-gradient(135deg, rgba(123,92,255,0.2), rgba(47,243,224,0.1))' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(123,92,255,0.3)' }}>
            <Users className="w-6 h-6" style={{ color: '#7B5CFF' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#2FF3E0' }}>Community</h1>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>Connect and share your journey</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 rounded-xl p-1" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <TabsTrigger value="forum" className="rounded-lg data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70">
              <MessageSquare className="w-4 h-4 mr-2" />
              Forum
            </TabsTrigger>
            <TabsTrigger value="wins" className="rounded-lg data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70">
              <Heart className="w-4 h-4 mr-2" />
              Wins
            </TabsTrigger>
            <TabsTrigger value="groups" className="rounded-lg data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70">
              <Users className="w-4 h-4 mr-2" />
              Groups
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="px-5 -mt-3 max-w-lg mx-auto">
        <Tabs value={activeTab} className="w-full">
          <TabsContent value="forum" className="space-y-4 mt-0">
            <Button
              onClick={() => setShowCreatePost(true)}
              className="w-full font-medium"
              style={{ background: '#7B5CFF', color: '#FFFFFF' }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Share Your Story
            </Button>
            <ForumFeed />
          </TabsContent>

          <TabsContent value="wins" className="space-y-4 mt-0">
            <Button
              onClick={() => setShowCreateWin(true)}
              className="w-full font-medium"
              style={{ background: '#2FF3E0', color: '#0B0F1F' }}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Share a Win
            </Button>
            <WinsWall />
          </TabsContent>

          <TabsContent value="groups" className="mt-0">
            <SupportGroups />
          </TabsContent>
        </Tabs>
      </div>

      {showCreatePost && <CreatePostDialog onClose={() => setShowCreatePost(false)} />}
      {showCreateWin && <CreateWinDialog onClose={() => setShowCreateWin(false)} />}
    </div>
  );
}