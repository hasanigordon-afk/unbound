import React from "react";
import { Wine, Pill } from "lucide-react";

export default function TrackToggle({ activeTrack, onToggle }) {
  return (
    <div className="flex rounded-xl p-1 gap-1" style={{ background: 'rgba(255,255,255,0.05)' }}>
      <button
        onClick={() => onToggle("alcohol")}
        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all"
        style={{ 
          background: activeTrack === "alcohol" ? '#2FF3E0' : 'transparent',
          color: activeTrack === "alcohol" ? '#0B0F1F' : 'rgba(255,255,255,0.5)'
        }}
      >
        <Wine className="w-4 h-4" />
        Alcohol
      </button>
      <button
        onClick={() => onToggle("substances")}
        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all"
        style={{ 
          background: activeTrack === "substances" ? '#2FF3E0' : 'transparent',
          color: activeTrack === "substances" ? '#0B0F1F' : 'rgba(255,255,255,0.5)'
        }}
      >
        <Pill className="w-4 h-4" />
        Substances
      </button>
    </div>
  );
}