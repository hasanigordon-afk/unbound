import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { MessageCircle, Mic, Shuffle, Zap, Clock, CalendarDays, CalendarCheck } from "lucide-react";

const MODES = [
  { id: "chat", label: "Text chat", icon: MessageCircle },
  { id: "voice", label: "Voice call", icon: Mic },
  { id: "doesnt_matter", label: "Doesn't matter", icon: Shuffle },
];

const TIMINGS = [
  { id: "right_now", label: "Right now", icon: Zap },
  { id: "today", label: "Today", icon: Clock },
  { id: "this_week", label: "This week", icon: CalendarDays },
  { id: "weekly_checkin", label: "Weekly check-in", icon: CalendarCheck },
];

export default function StepCommunication({ data, onNext }) {
  const [mode, setMode] = useState(data.comm_mode || "");
  const [timing, setTiming] = useState(data.time_need || "");

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="px-2">
      <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">
        How & when?
      </h2>

      <p className="text-sm font-medium text-slate-700 mb-3 max-w-sm mx-auto">How do you want to talk?</p>
      <div className="grid grid-cols-3 gap-2.5 max-w-sm mx-auto mb-8">
        {MODES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setMode(id)}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
              mode === id ? "border-teal-500 bg-teal-50" : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <Icon className={`w-5 h-5 ${mode === id ? "text-teal-600" : "text-slate-400"}`} />
            <span className={`text-xs font-medium ${mode === id ? "text-teal-700" : "text-slate-500"}`}>{label}</span>
          </button>
        ))}
      </div>

      <p className="text-sm font-medium text-slate-700 mb-3 max-w-sm mx-auto">When do you need support?</p>
      <div className="grid grid-cols-2 gap-2.5 max-w-sm mx-auto">
        {TIMINGS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTiming(id)}
            className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
              timing === id ? "border-teal-500 bg-teal-50" : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <Icon className={`w-4 h-4 ${timing === id ? "text-teal-600" : "text-slate-400"}`} />
            <span className={`text-sm font-medium ${timing === id ? "text-teal-700" : "text-slate-500"}`}>{label}</span>
          </button>
        ))}
      </div>

      <div className="mt-8 max-w-sm mx-auto">
        <Button
          className="w-full h-14 text-base bg-teal-600 hover:bg-teal-700"
          disabled={!mode || !timing}
          onClick={() => onNext({ comm_mode: mode, time_need: timing })}
        >
          Continue
        </Button>
      </div>
    </motion.div>
  );
}