import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

const SUBSTANCES = [
  { id: "opioids", label: "Opioids" },
  { id: "stimulants", label: "Stimulants" },
  { id: "benzos", label: "Benzodiazepines" },
  { id: "cannabis", label: "Cannabis" },
  { id: "hallucinogens", label: "Hallucinogens" },
  { id: "inhalants", label: "Inhalants" },
  { id: "other", label: "Other" },
];

export default function StepSubstances({ data, onNext }) {
  const [selected, setSelected] = useState(data.substances || []);
  const [primary, setPrimary] = useState(data.primary_substance || "");
  const [otherText, setOtherText] = useState("");

  const toggle = (id) => {
    setSelected((prev) => {
      const next = prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id];
      if (!next.includes(primary)) setPrimary("");
      return next;
    });
  };

  const canContinue = selected.length > 0 && primary;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="px-2">
      <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">
        Which substance(s)?
      </h2>
      <p className="text-slate-500 text-center mb-8">Select all that apply</p>

      <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
        {SUBSTANCES.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => toggle(id)}
            className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
              selected.includes(id) ? "border-teal-500 bg-teal-50 text-teal-700" : "border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {selected.includes("other") && (
        <div className="mt-3 max-w-sm mx-auto">
          <Input
            placeholder="Specify substance..."
            value={otherText}
            onChange={(e) => setOtherText(e.target.value)}
            className="rounded-xl"
          />
        </div>
      )}

      {selected.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 max-w-sm mx-auto">
          <p className="text-sm font-medium text-slate-700 mb-3">
            Which ONE is your primary concern right now?
          </p>
          <div className="grid grid-cols-2 gap-2">
            {selected.map((id) => (
              <button
                key={id}
                onClick={() => setPrimary(id)}
                className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                  primary === id ? "border-amber-500 bg-amber-50 text-amber-700" : "border-slate-200 text-slate-500"
                }`}
              >
                {SUBSTANCES.find((s) => s.id === id)?.label || id}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      <div className="mt-8 max-w-sm mx-auto">
        <Button
          className="w-full h-14 text-base bg-teal-600 hover:bg-teal-700"
          disabled={!canContinue}
          onClick={() => onNext({
            substances: selected.includes("other") && otherText
              ? [...selected.filter(s => s !== "other"), otherText]
              : selected,
            primary_substance: primary === "other" && otherText ? otherText : primary
          })}
        >
          Continue
        </Button>
      </div>
    </motion.div>
  );
}