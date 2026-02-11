import React from "react";
import { Wine, Pill } from "lucide-react";

export default function TrackToggle({ activeTrack, onToggle }) {
  return (
    <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
      <button
        onClick={() => onToggle("alcohol")}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
          activeTrack === "alcohol" ? "bg-white text-teal-700 shadow-sm" : "text-slate-500"
        }`}
      >
        <Wine className="w-4 h-4" />
        Alcohol
      </button>
      <button
        onClick={() => onToggle("substances")}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
          activeTrack === "substances" ? "bg-white text-teal-700 shadow-sm" : "text-slate-500"
        }`}
      >
        <Pill className="w-4 h-4" />
        Substances
      </button>
    </div>
  );
}