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
        className="bg-teal-50 border border-teal-200 rounded-2xl p-6 text-center"
      >
        <CheckCircle className="w-8 h-8 text-teal-600 mx-auto mb-2" />
        <p className="font-medium text-teal-700">Check-in saved!</p>
      </motion.div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
      <p className="font-semibold text-slate-800">Quick Check-in</p>
      <div>
        <p className="text-sm text-slate-500 mb-3">Craving level right now?</p>
        <div className="flex gap-1.5">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setScore(n)}
              className={`flex-1 aspect-square rounded-lg text-xs font-bold transition-all ${
                score >= n
                  ? n <= 3 ? "bg-teal-500 text-white"
                  : n <= 6 ? "bg-amber-500 text-white"
                  : "bg-rose-500 text-white"
                  : "bg-slate-100 text-slate-400 hover:bg-slate-200"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
      <Textarea
        placeholder="How are you feeling? (optional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="rounded-xl resize-none h-20"
      />
      <Button
        className="w-full h-12 bg-teal-600 hover:bg-teal-700 rounded-xl"
        disabled={score === 0 || saving}
        onClick={handleSave}
      >
        {saving ? "Saving..." : "Save Check-in"}
      </Button>
    </div>
  );
}