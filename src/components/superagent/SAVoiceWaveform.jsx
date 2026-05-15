import React from "react";
import { SA_COLORS as C } from "@/lib/superAgentConfig";

export default function SAVoiceWaveform({ active }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, height: 56 }}>
      {[0,1,2,3,4,5,6,7,8].map(i => (
        <div key={i} style={{
          width: 4, borderRadius: 2,
          background: active ? C.gold : "rgba(15,30,61,0.18)",
          height: active ? `${20 + Math.abs(Math.sin(i + Date.now()/300)) * 30}px` : 8,
          animationName: active ? "sa-wave" : "none",
          animationDuration: "0.9s",
          animationTimingFunction: "ease-in-out",
          animationIterationCount: "infinite",
          animationDelay: `${i * 0.08}s`,
          transition: "background .2s",
        }} />
      ))}
      <style>{`@keyframes sa-wave { 0%,100% { transform: scaleY(.4); } 50% { transform: scaleY(1.4); } }`}</style>
    </div>
  );
}