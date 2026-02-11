import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const CHALLENGES = [
  { id: "cravings", label: "Cravings" },
  { id: "withdrawals", label: "Withdrawals" },
  { id: "triggers", label: "Triggers" },
  { id: "loneliness", label: "Loneliness" },
  { id: "housing", label: "Housing" },
  { id: "legal", label: "Legal issues" },
  { id: "family", label: "Family" },
  { id: "work_money", label: "Work / Money" },
  { id: "mental_health", label: "Mental health" },
  { id: "need_detox_fast", label: "Need detox fast" },
];

export default function StepChallenges({ data, onNext }) {
  const [selected, setSelected] = useState(data.challenges || []);

  const toggle = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((c) => c !== id));
    } else if (selected.length < 2) {
      setSelected([...selected, id]);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="px-2">
      <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">
        Biggest challenge?
      </h2>
      <p className="text-slate-500 text-center mb-8">Choose up to 2</p>

      <div className="grid grid-cols-2 gap-2.5 max-w-sm mx-auto">
        {CHALLENGES.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => toggle(id)}
            className={`p-3.5 rounded-xl border-2 text-sm font-medium transition-all ${
              selected.includes(id) ? "border-teal-500 bg-teal-50 text-teal-700" : "border-slate-200 text-slate-600 hover:border-slate-300"
            } ${!selected.includes(id) && selected.length >= 2 ? "opacity-40" : ""}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-8 max-w-sm mx-auto">
        <Button
          className="w-full h-14 text-base bg-teal-600 hover:bg-teal-700"
          disabled={selected.length === 0}
          onClick={() => onNext({ challenges: selected })}
        >
          Continue
        </Button>
      </div>
    </motion.div>
  );
}