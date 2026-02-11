import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

export default function QuickCheckin() {
  const [score, setScore] = useState(0);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (score === 0) return;
    setSaving(true);
    await base44.entities.Checkin.create({ craving_score: score, note: note || undefined });
    setSaving(false);
    setSaved(true);
    setTimeout(() => { setSaved(false); setScore(0); setNote(""); }, 2000);
  };

  if (saved) {
    return (
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="rounded-2xl p-6 text-center" style={{ background: 'rgba(47,243,224,0.15)', border: '1px solid rgba(47,243,224,0.2)' }}
      >
        <CheckCircle className="w-8 h-8 mx-auto mb-2" style={{ color: '#2FF3E0' }} />
        <p className="font-medium" style={{ color: '#2FF3E0' }}>Check-in saved!</p>
      </motion.div>
    );
  }

  return (
    <div className="glass-card p-5 space-y-4">
      <p className="font-semibold" style={{ color: '#FFFFFF' }}>Quick Check-in</p>
      <div>
        <p className="text-sm mb-3" style={{ color: 'rgba(255,255,255,0.75)' }}>Craving level right now?</p>
        <div className="flex gap-1.5">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
            const isActive = score >= n;
            const bgColor = isActive 
              ? n <= 3 ? "#2FF3E0" : n <= 6 ? "#F4D35E" : "#FF4FD8"
              : "rgba(255,255,255,0.08)";
            return (
              <button
                key={n}
                onClick={() => setScore(n)}
                className="flex-1 aspect-square rounded-lg text-xs font-bold transition-all"
                style={{ background: bgColor, color: isActive ? '#0B0F1F' : 'rgba(255,255,255,0.3)' }}
              >
                {n}
              </button>
            );
          })}
        </div>
      </div>
      <Textarea
        placeholder="How are you feeling? (optional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="rounded-xl resize-none h-20"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#FFFFFF' }}
      />
      <Button
        className="w-full h-12 rounded-xl font-medium transition-all"
        disabled={score === 0 || saving}
        onClick={handleSave}
        style={{ background: score === 0 ? 'rgba(47,243,224,0.1)' : '#2FF3E0', color: score === 0 ? 'rgba(255,255,255,0.3)' : '#0B0F1F' }}
      >
        {saving ? "Saving..." : "Save Check-in"}
      </Button>
    </div>
  );
}