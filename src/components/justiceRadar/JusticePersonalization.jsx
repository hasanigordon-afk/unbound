import React from "react";
import { SlidersHorizontal } from "lucide-react";
import { justiceTopics } from "./justiceRadarData";

export default function JusticePersonalization({ selectedTopics, onToggle }) {
  return (
    <div className="justice-panel">
      <div className="justice-panel-title">
        <SlidersHorizontal size={18} />
        <div>
          <span>Personalize</span>
          <h3>What affects you?</h3>
        </div>
      </div>
      <div className="topic-chip-grid">
        {justiceTopics.map((topic) => (
          <button key={topic} className={selectedTopics.includes(topic) ? "active" : ""} onClick={() => onToggle(topic)}>
            {topic}
          </button>
        ))}
      </div>
    </div>
  );
}