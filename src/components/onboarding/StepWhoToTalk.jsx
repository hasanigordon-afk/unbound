import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Users, GraduationCap, Sparkles } from "lucide-react";

const OPTIONS = [
  { id: "peer_only", label: "Peer mentor", desc: "Someone with lived experience", icon: Users },
  { id: "counselor_only", label: "Licensed counselor", desc: "A trained professional", icon: GraduationCap },
  { id: "both_best_match", label: "Best match for me", desc: "Either — just get me the right person", icon: Sparkles },
];

export default function StepWhoToTalk({ data, onNext }) {
  const [who, setWho] = useState(data.who_to_talk_to || "");

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="px-2">
      <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">
        Who do you want to talk to?
      </h2>
      <p className="text-slate-500 text-center mb-8">We'll match you accordingly</p>

      <div className="grid gap-3 max-w-sm mx-auto">
        {OPTIONS.map(({ id, label, desc, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setWho(id)}
            className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
              who === id ? "border-teal-500 bg-teal-50" : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              who === id ? "bg-teal-100" : "bg-slate-100"
            }`}>
              <Icon className={`w-5 h-5 ${who === id ? "text-teal-600" : "text-slate-400"}`} />
            </div>
            <div>
              <span className={`font-medium block ${who === id ? "text-teal-700" : "text-slate-700"}`}>{label}</span>
              <span className="text-xs text-slate-400">{desc}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-8 max-w-sm mx-auto">
        <Button
          className="w-full h-14 text-base bg-teal-600 hover:bg-teal-700"
          disabled={!who}
          onClick={() => onNext({ who_to_talk_to: who })}
        >
          Continue
        </Button>
      </div>
    </motion.div>
  );
}