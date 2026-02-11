import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Users, Stethoscope, UserCog } from "lucide-react";

const ROLES = [
  { 
    id: "peer_mentor", 
    label: "Peer Mentor", 
    icon: Users,
    desc: "I have lived experience in recovery" 
  },
  { 
    id: "counselor", 
    label: "Licensed Counselor", 
    icon: Stethoscope,
    desc: "I'm a licensed professional" 
  },
  { 
    id: "hybrid", 
    label: "Both", 
    icon: UserCog,
    desc: "Licensed counselor with lived experience" 
  },
];

export default function StepRole({ data, onNext }) {
  const [selected, setSelected] = useState(data.role_type || "");

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="px-2">
      <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">
        What describes you best?
      </h2>
      <p className="text-slate-500 text-center mb-8">Choose your role</p>

      <div className="grid gap-3 max-w-sm mx-auto">
        {ROLES.map(({ id, label, desc, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setSelected(id)}
            className={`flex items-start gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
              selected === id
                ? "border-teal-500 bg-teal-50"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              selected === id ? "bg-teal-100" : "bg-slate-100"
            }`}>
              <Icon className={`w-5 h-5 ${selected === id ? "text-teal-600" : "text-slate-400"}`} />
            </div>
            <div>
              <div className={`font-medium ${selected === id ? "text-teal-700" : "text-slate-700"}`}>
                {label}
              </div>
              <div className="text-sm text-slate-500 mt-0.5">{desc}</div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-8 max-w-sm mx-auto">
        <Button
          className="w-full h-14 text-base bg-teal-600 hover:bg-teal-700"
          disabled={!selected}
          onClick={() => onNext({ role_type: selected })}
        >
          Continue
        </Button>
      </div>
    </motion.div>
  );
}