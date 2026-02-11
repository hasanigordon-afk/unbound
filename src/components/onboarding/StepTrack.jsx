import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Wine, Pill, Layers } from "lucide-react";

const TRACKS = [
  { id: "alcohol", label: "Alcohol Recovery", desc: "Focus on alcohol-specific support", icon: Wine },
  { id: "substances", label: "Substance Use Recovery", desc: "Focus on substance-specific support", icon: Pill },
  { id: "both", label: "Both", desc: "Access both communities", icon: Layers },
];

export default function StepTrack({ data, onNext }) {
  const [track, setTrack] = useState(data.track || "");
  const [defaultTrack, setDefaultTrack] = useState(data.default_track || "");

  const canContinue = track && (track !== "both" || defaultTrack);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="px-2">
      <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">
        Choose your track
      </h2>
      <p className="text-slate-500 text-center mb-8">
        This helps us connect you with the right people
      </p>

      <div className="grid gap-3 max-w-sm mx-auto">
        {TRACKS.map(({ id, label, desc, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { setTrack(id); if (id !== "both") setDefaultTrack(""); }}
            className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
              track === id ? "border-teal-500 bg-teal-50" : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              track === id ? "bg-teal-100" : "bg-slate-100"
            }`}>
              <Icon className={`w-5 h-5 ${track === id ? "text-teal-600" : "text-slate-400"}`} />
            </div>
            <div>
              <span className={`font-medium block ${track === id ? "text-teal-700" : "text-slate-700"}`}>{label}</span>
              <span className="text-xs text-slate-400">{desc}</span>
            </div>
          </button>
        ))}
      </div>

      {track === "both" && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-6 max-w-sm mx-auto">
          <p className="text-sm font-medium text-slate-700 mb-3">Default home track:</p>
          <div className="flex gap-3">
            {["alcohol", "substances"].map((t) => (
              <button
                key={t}
                onClick={() => setDefaultTrack(t)}
                className={`flex-1 py-3 rounded-xl border-2 font-medium text-sm transition-all ${
                  defaultTrack === t ? "border-teal-500 bg-teal-50 text-teal-700" : "border-slate-200 text-slate-500"
                }`}
              >
                {t === "alcohol" ? "Alcohol" : "Substances"}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      <div className="mt-8 max-w-sm mx-auto">
        <Button
          className="w-full h-14 text-base bg-teal-600 hover:bg-teal-700"
          disabled={!canContinue}
          onClick={() => onNext({ track, default_track: defaultTrack || undefined })}
        >
          Continue
        </Button>
      </div>
    </motion.div>
  );
}