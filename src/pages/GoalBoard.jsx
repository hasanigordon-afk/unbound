import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, X, CheckCircle2, Circle, Target } from "lucide-react";

const COLUMNS = [
  { key: "short_term", label: "Short-Term Goals", color: "#4A90E2", bg: "#EBF4FF", border: "#B3D4F5", note: "Within 30 days" },
  { key: "long_term", label: "Long-Term Goals", color: "#7B5CF0", bg: "#F3F0FF", border: "#C4B5FD", note: "3+ months out" },
];

function GoalNote({ goal, onToggle, onDelete }) {
  const isDone = goal.status === "completed";
  return (
    <div
      className="relative group p-3 rounded-lg shadow-sm mb-3"
      style={{
        background: isDone ? "#F0FFF4" : "#FFFEF0",
        border: `1px solid ${isDone ? "#86EFAC" : "#FDE68A"}`,
        minHeight: "60px",
      }}
    >
      <button
        onClick={() => onDelete(goal.id)}
        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 rounded-full p-0.5 hover:bg-red-100"
        style={{ color: "#EF4444" }}
      >
        <X className="w-3 h-3" />
      </button>
      <div className="flex items-start gap-2 pr-4">
        <button onClick={() => onToggle(goal)} className="mt-0.5 flex-shrink-0">
          {isDone
            ? <CheckCircle2 className="w-4 h-4" style={{ color: "#22C55E" }} />
            : <Circle className="w-4 h-4" style={{ color: "#D1D5DB" }} />
          }
        </button>
        <p className="text-sm leading-snug" style={{ color: isDone ? "#6B7280" : "#1E1E1E", textDecoration: isDone ? "line-through" : "none" }}>
          {goal.title}
        </p>
      </div>
      {goal.description && (
        <p className="text-xs mt-1 ml-6" style={{ color: "#9CA3AF" }}>{goal.description}</p>
      )}
    </div>
  );
}

function AddGoalInput({ onAdd }) {
  const [text, setText] = useState("");
  const [active, setActive] = useState(false);

  const handleSubmit = () => {
    if (!text.trim()) return;
    onAdd(text.trim());
    setText("");
    setActive(false);
  };

  if (!active) {
    return (
      <button
        onClick={() => setActive(true)}
        className="w-full flex items-center gap-2 py-2 px-3 rounded-lg text-sm opacity-50 hover:opacity-80 transition-opacity"
        style={{ border: "1.5px dashed #D1D5DB", color: "#6B7280" }}
      >
        <Plus className="w-4 h-4" />
        Add goal
      </button>
    );
  }

  return (
    <div className="rounded-lg p-2 shadow-sm" style={{ background: "#FFFEF0", border: "1.5px solid #FDE68A" }}>
      <textarea
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } if (e.key === "Escape") setActive(false); }}
        placeholder="Type goal and press Enter..."
        rows={2}
        className="w-full text-sm resize-none outline-none bg-transparent"
        style={{ color: "#1E1E1E" }}
      />
      <div className="flex gap-2 mt-1">
        <button onClick={handleSubmit} className="text-xs px-3 py-1 rounded font-medium" style={{ background: "#4A90E2", color: "#fff" }}>Add</button>
        <button onClick={() => { setActive(false); setText(""); }} className="text-xs px-3 py-1 rounded" style={{ background: "#F3F4F6", color: "#6B7280" }}>Cancel</button>
      </div>
    </div>
  );
}

export default function GoalBoard() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: goals = [] } = useQuery({
    queryKey: ["goals-board", user?.email],
    queryFn: () => base44.entities.Goal.filter({ created_by: user.email }),
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Goal.create(data),
    onSuccess: () => queryClient.invalidateQueries(["goals-board"]),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Goal.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(["goals-board"]),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Goal.delete(id),
    onSuccess: () => queryClient.invalidateQueries(["goals-board"]),
  });

  const handleAdd = (columnKey, title) => {
    const category = columnKey === "short_term" ? "daily_habits" : "personal_growth";
    createMutation.mutate({ title, category, status: "active", tags: [columnKey] });
  };

  const handleToggle = (goal) => {
    updateMutation.mutate({ id: goal.id, data: { status: goal.status === "completed" ? "active" : "completed" } });
  };

  const getColumnGoals = (key) =>
    goals.filter(g => Array.isArray(g.tags) ? g.tags.includes(key) : false);

  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => g.status === "completed").length;

  return (
    <div className="min-h-screen" style={{ background: "#F5F5F7" }}>
      {/* Header */}
      <div className="px-6 pt-8 pb-5" style={{ background: "#FFFFFF", borderBottom: "1px solid #D1D1D6" }}>
        <div className="flex items-center gap-3 mb-1">
          <Target className="w-6 h-6" style={{ color: "#4A90E2" }} strokeWidth={1.5} />
          <h1>My Goal Board</h1>
        </div>
        <p className="text-sm" style={{ color: "#8E8E93" }}>
          {completedGoals} of {totalGoals} goals completed
        </p>
      </div>

      {/* Whiteboard Columns */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
        {COLUMNS.map(col => {
          const colGoals = getColumnGoals(col.key);
          return (
            <div
              key={col.key}
              className="rounded-2xl p-4"
              style={{
                background: col.bg,
                border: `2px solid ${col.border}`,
                minHeight: "320px",
              }}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: col.color }} />
                  <h3 style={{ color: col.color, fontSize: "15px" }}>{col.label}</h3>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: col.border, color: col.color }}>
                  {colGoals.length}
                </span>
              </div>
              <p className="text-xs mb-4 ml-5" style={{ color: "#9CA3AF" }}>{col.note}</p>

              {/* Goals */}
              <div>
                {colGoals.map(goal => (
                  <GoalNote
                    key={goal.id}
                    goal={goal}
                    onToggle={handleToggle}
                    onDelete={(id) => deleteMutation.mutate(id)}
                  />
                ))}
                <AddGoalInput onAdd={(title) => handleAdd(col.key, title)} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}