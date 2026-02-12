import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Sparkles, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function CreateWinDialog({ onClose }) {
  const [content, setContent] = useState("");
  const [type, setType] = useState("win");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const queryClient = useQueryClient();

  const createWin = useMutation({
    mutationFn: () =>
      base44.entities.Win.create({
        content,
        type,
        is_anonymous: isAnonymous,
      }),
    onSuccess: () => {
      toast.success("Shared! +10 XP");
      queryClient.invalidateQueries(["wins"]);
      onClose();
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6"
        style={{ background: '#1A1F3A' }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold" style={{ color: '#FFFFFF' }}>Share Positivity</h2>
          <button onClick={onClose} style={{ color: 'rgba(255,255,255,0.5)' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex gap-3">
            <button
              onClick={() => setType("win")}
              className="flex-1 p-4 rounded-xl transition-all"
              style={{
                background: type === "win" ? 'rgba(244,213,94,0.2)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${type === "win" ? '#F4D35E' : 'rgba(255,255,255,0.08)'}`
              }}
            >
              <Sparkles className="w-6 h-6 mx-auto mb-2" style={{ color: '#F4D35E' }} />
              <p className="text-sm font-medium" style={{ color: type === "win" ? '#F4D35E' : 'rgba(255,255,255,0.75)' }}>
                Celebrate a Win
              </p>
            </button>
            <button
              onClick={() => setType("gratitude")}
              className="flex-1 p-4 rounded-xl transition-all"
              style={{
                background: type === "gratitude" ? 'rgba(255,79,216,0.2)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${type === "gratitude" ? '#FF4FD8' : 'rgba(255,255,255,0.08)'}`
              }}
            >
              <Heart className="w-6 h-6 mx-auto mb-2" style={{ color: '#FF4FD8' }} />
              <p className="text-sm font-medium" style={{ color: type === "gratitude" ? '#FF4FD8' : 'rgba(255,255,255,0.75)' }}>
                Express Gratitude
              </p>
            </button>
          </div>

          <Textarea
            placeholder={type === "win" ? "What's your win today?" : "What are you grateful for?"}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px] resize-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#FFFFFF' }}
          />

          <label className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="rounded"
            />
            Share anonymously
          </label>

          <Button
            onClick={() => createWin.mutate()}
            disabled={!content.trim() || createWin.isPending}
            className="w-full font-medium"
            style={{ background: type === "win" ? '#F4D35E' : '#FF4FD8', color: '#0B0F1F' }}
          >
            {createWin.isPending ? "Sharing..." : "Share (+10 XP)"}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}