import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { MessageCircle, Phone } from "lucide-react";

const MODES = [
  { id: "chat", label: "Chat / Text", icon: MessageCircle },
  { id: "voice", label: "Voice / Video", icon: Phone },
];

export default function StepCommModes({ data, onNext }) {
  const [selected, setSelected] = useState(data.communication_modes || []);

  const toggle = (id) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="px-2">
      <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">
        How do you want to communicate?
      </h2>
      <p className="text-slate-500 text-center mb-8">Select all that work for you</p>

      <div className="grid gap-3 max-w-sm mx-auto">
        {MODES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => toggle(id)}
            className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
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
          onClick={() => onNext({ communication_modes: selected })}
        >
          Continue
        </Button>
      </div>
    </motion.div>
  );
}