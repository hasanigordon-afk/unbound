import React, { useState } from "react";
import { Heart, Plus, Users } from "lucide-react";

const starterTopics = ["Older drug sentencing structures", "Mandatory minimum updates", "Rehabilitation and diversion initiatives"];

export default function FamilyInsideSection() {
  const [savedTopics, setSavedTopics] = useState(starterTopics);
  const [draft, setDraft] = useState("");

  const addTopic = () => {
    if (!draft.trim()) return;
    setSavedTopics([...savedTopics, draft.trim()]);
    setDraft("");
  };

  return (
    <div className="family-inside-section">
      <div className="justice-panel-title">
        <Users size={18} />
        <div>
          <span>Still Have Family Inside?</span>
          <h3>Save topics affecting loved ones</h3>
        </div>
      </div>
      <p>Track changes that may matter to someone still incarcerated, like: “New sentencing reform legislation passed that may affect individuals convicted under older drug sentencing structures.”</p>
      <div className="family-topic-list">
        {savedTopics.map((topic) => <span key={topic}><Heart size={13} /> {topic}</span>)}
      </div>
      <div className="family-add-row">
        <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Add a topic to watch..." />
        <button onClick={addTopic}><Plus size={15} /> Add</button>
      </div>
    </div>
  );
}