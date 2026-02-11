import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const NEEDS = [
  { id: "lived_experience_same_substance", label: "Lived experience with same substance" },
  { id: "withdrawal_support", label: "Withdrawal support" },
  { id: "relapse_support", label: "Relapse prevention support" },
  { id: "treatment_navigation", label: "Treatment navigation" },
  { id: "MAT_support", label: "MAT (medication-assisted treatment)" },
  { id: "street_life_context", label: "Understands street life context" },
  { id: "mental_health_plus_addiction", label: "Mental health + addiction" },
];

export default function StepSupportNeeds({ data, onNext }) {
  const [selected, setSelected] = useState(data.support_needs || []);

  const toggle = (id) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id]);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="px-2">
      <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">
        What kind of support?
      </h2>
      <p className="text-slate-500 text-center mb-8">Select all that apply</p>

      <div className="grid gap-2.5 max-w-sm mx-auto">
        {NEEDS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => toggle(id)}
            className={`p-4 rounded-2xl border-2 text-left text-sm font-medium transition-all ${
              selected.includes(id) ? "border-teal-500 bg-teal-50 text-teal-700" : "border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-8 max-w-sm mx-auto">
        <Button
          className="w-full h-14 text-base bg-teal-600 hover:bg-teal-700"
          disabled={selected.length === 0}
          onClick={() => onNext({ support_needs: selected })}
        >
          Continue
        </Button>
      </div>
    </motion.div>
  );
}