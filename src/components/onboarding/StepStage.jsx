import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const STAGES = [
  { id: "using_currently", label: "Currently using", desc: "Still actively using" },
  { id: "trying_to_stop", label: "Trying to stop", desc: "Actively working to quit" },
  { id: "detox_last_14_days", label: "In detox / last 14 days", desc: "Recently stopped" },
  { id: "early_recovery_15_90", label: "Early recovery (15–90 days)", desc: "Building momentum" },
  { id: "recovery_3_12_months", label: "Recovery (3–12 months)", desc: "Getting stronger" },
  { id: "long_term_1_year_plus", label: "Long-term (1+ year)", desc: "Maintaining recovery" },
  { id: "relapsed_recently", label: "Relapsed recently", desc: "Getting back on track" },
];

export default function StepStage({ data, onNext }) {
  const [stage, setStage] = useState(data.stage || "");

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="px-2">
      <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">
        Where are you now?
      </h2>
      <p className="text-slate-500 text-center mb-8">No judgment — this helps us match you better</p>

      <div className="grid gap-2.5 max-w-sm mx-auto">
        {STAGES.map(({ id, label, desc }) => (
          <button
            key={id}
            onClick={() => setStage(id)}
            className={`flex flex-col p-4 rounded-2xl border-2 text-left transition-all ${
              stage === id ? "border-teal-500 bg-teal-50" : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <span className={`font-medium text-sm ${stage === id ? "text-teal-700" : "text-slate-700"}`}>{label}</span>
            <span className="text-xs text-slate-400 mt-0.5">{desc}</span>
          </button>
        ))}
      </div>

      <div className="mt-8 max-w-sm mx-auto">
        <Button
          className="w-full h-14 text-base bg-teal-600 hover:bg-teal-700"
          disabled={!stage}
          onClick={() => onNext({ stage })}
        >
          Continue
        </Button>
      </div>
    </motion.div>
  );
}