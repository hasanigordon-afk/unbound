import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Loader2, MessageCircle, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import moment from "moment";
import PostDetailDialog from "./PostDetailDialog";

const CATEGORY_COLORS = {
  support: { bg: 'rgba(123,92,255,0.15)', color: '#7B5CFF', label: 'Support' },
  question: { bg: 'rgba(47,243,224,0.15)', color: '#2FF3E0', label: 'Question' },
  milestone: { bg: 'rgba(244,213,94,0.15)', color: '#F4D35E', label: 'Milestone' },
  advice: { bg: 'rgba(255,79,216,0.15)', color: '#FF4FD8', label: 'Advice' }
};

export default function ForumFeed() {
  const [selectedPost, setSelectedPost] = useState(null);
  const [filter, setFilter] = useState("all");

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["community-posts", filter],
    queryFn: () => {
      if (filter === "all") {
        return base44.entities.CommunityPost.filter({ moderation_status: "approved" }, '-created_date', 20);
      }
      return base44.entities.CommunityPost.filter({ 
        moderation_status: "approved",
        category: filter
      }, '-created_date', 20);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#2FF3E0' }} />
      </div>
    );
  }

  return (
    <>
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter("all")}
          className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap"
          style={{
            background: filter === "all" ? '#7B5CFF' : 'rgba(255,255,255,0.05)',
            color: filter === "all" ? '#FFFFFF' : 'rgba(255,255,255,0.75)'
          }}
        >
          All
        </button>
        {Object.entries(CATEGORY_COLORS).map(([cat, style]) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap"
            style={{
              background: filter === cat ? style.color : 'rgba(255,255,255,0.05)',
              color: filter === cat ? '#FFFFFF' : 'rgba(255,255,255,0.75)'
            }}
          >
            {style.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {posts.map(post => {
          const categoryStyle = CATEGORY_COLORS[post.category] || { bg: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', label: post.category || 'Post' };
          return (
            <div
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className="glass-card p-4 cursor-pointer hover:scale-[1.01] transition-transform"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: categoryStyle.bg, color: categoryStyle.color }}>
                      {categoryStyle.label}
                    </span>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      {moment(post.created_date).fromNow()}
                    </span>
                  </div>
                  {post.title && (
                    <h4 className="font-medium mb-1" style={{ color: '#FFFFFF' }}>{post.title}</h4>
                  )}
                  <p className="text-sm line-clamp-3" style={{ color: 'rgba(255,255,255,0.75)' }}>
                    {post.content}
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      {post.like_count || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5" />
                      View discussion
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {posts.length === 0 && (
          <div className="text-center py-12">
            <p style={{ color: 'rgba(255,255,255,0.5)' }}>No posts yet. Be the first to share!</p>
          </div>
        )}
      </div>

      {selectedPost && (
        <PostDetailDialog post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}
    </>
  );
}