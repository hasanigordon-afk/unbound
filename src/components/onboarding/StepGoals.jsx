import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Users, MapPin, CalendarCheck, Eye } from "lucide-react";

const GOALS = [
  { id: "talk_to_mentor", label: "Talk to a mentor", icon: Users },
  { id: "find_help", label: "Find help near me", icon: MapPin },
  { id: "build_plan", label: "Build a plan / daily check-ins", icon: CalendarCheck },
  { id: "browsing", label: "Just browsing", icon: Eye },
];

export default function StepGoals({ data, onNext }) {
  const [selected, setSelected] = useState(data.goals || []);

  const toggle = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="px-2">
      <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">
        What brings you here?
      </h2>
      <p className="text-slate-500 text-center mb-8">Select all that apply</p>

      <div className="grid gap-3 max-w-sm mx-auto">
        {GOALS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => toggle(id)}
            className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
              selected.includes(id)
                ? "border-teal-500 bg-teal-50"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              selected.includes(id) ? "bg-teal-100" : "bg-slate-100"
            }`}>
              <Icon className={`w-5 h-5 ${selected.includes(id) ? "text-teal-600" : "text-slate-400"}`} />
            </div>
            <span className={`font-medium ${selected.includes(id) ? "text-teal-700" : "text-slate-700"}`}>
              {label}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-8 max-w-sm mx-auto">
        <Button
          className="w-full h-14 text-base bg-teal-600 hover:bg-teal-700"
          disabled={selected.length === 0}
          onClick={() => onNext({ goals: selected })}
        >
          Continue
        </Button>
      </div>
    </motion.div>
  );
}