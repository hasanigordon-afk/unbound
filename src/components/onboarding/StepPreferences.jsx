import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const OPTIONS = {
  gender_preference: [
    { id: "none", label: "No preference" },
    { id: "same_gender", label: "Same gender" },
  ],
  style: [
    { id: "tough_love", label: "Tough love" },
    { id: "gentle", label: "Gentle & empathetic" },
    { id: "structured", label: "Structured & guided" },
  ],
  program_preference: [
    { id: "12_step", label: "12-step" },
    { id: "non_12_step", label: "Non 12-step" },
    { id: "no_preference", label: "No preference" },
  ],
  lgbtq_friendly: [
    { id: "yes", label: "Yes, important" },
    { id: "no", label: "Not needed" },
    { id: "no_preference", label: "No preference" },
  ],
};

const SECTIONS = [
  { key: "gender_preference", label: "Gender preference?" },
  { key: "style", label: "Mentor style?" },
  { key: "program_preference", label: "Program type?" },
  { key: "lgbtq_friendly", label: "LGBTQ+ affirming?" },
];

export default function StepPreferences({ data, onNext }) {
  const [prefs, setPrefs] = useState({
    gender_preference: data.gender_preference || "none",
    style: data.style || "gentle",
    program_preference: data.program_preference || "no_preference",
    lgbtq_friendly: data.lgbtq_friendly || "no_preference",
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="px-2">
      <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">
        Preferences
      </h2>
      <p className="text-slate-500 text-center mb-8">Optional — helps us match better</p>

      <div className="space-y-6 max-w-sm mx-auto">
        {SECTIONS.map(({ key, label }) => (
          <div key={key}>
            <p className="text-sm font-medium text-slate-700 mb-2">{label}</p>
            <div className="flex flex-wrap gap-2">
              {OPTIONS[key].map(({ id, label: optLabel }) => (
                <button
                  key={id}
                  onClick={() => setPrefs({ ...prefs, [key]: id })}
                  className={`px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                    prefs[key] === id ? "border-teal-500 bg-teal-50 text-teal-700" : "border-slate-200 text-slate-500"
                  }`}
                >
                  {optLabel}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 max-w-sm mx-auto">
        <Button
          className="w-full h-14 text-base bg-teal-600 hover:bg-teal-700"
          onClick={() => onNext(prefs)}
        >
          Continue
        </Button>
      </div>
    </motion.div>
  );
}