import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { VM, getTodaysObjective, OBJECTIVES_BY_FOCUS } from "./vmData";

import VMDHeader           from "./dashboard/VMDHeader";
import VMDMissionCard      from "./dashboard/VMDMissionCard";
import VMDCheckinCard      from "./dashboard/VMDCheckinCard";
import VMDProgressStrip    from "./dashboard/VMDProgressStrip";
import VMDQuickActions     from "./dashboard/VMDQuickActions";
import VMDNearbyResources  from "./dashboard/VMDNearbyResources";
import VMDSupportCard      from "./dashboard/VMDSupportCard";
import VMDCommunityPreview from "./dashboard/VMDCommunityPreview";
import VMDBottomNav        from "./dashboard/VMDBottomNav";
import VMDEmptyState       from "./dashboard/VMDEmptyState";

export default function VMDashboard({
  profile, todayMission, streak, todayCheckinMood,
  onSetMood, onToggleObjective, onEditSettings,
  // Optional: nearby resources data wired from page
  resources = [], savedIds = new Set(), onSaveResource = () => {},
  weekCheckins = 0, tasksDone = 0, supportActions = 0,
  hasAnyData = true, onSaveCheckin = () => {},
}) {
  const navigate = useNavigate();
  const [tab, setTab] = useState("home");
  const [objective, setObjective] = useState(
    todayMission?.mission_text || getTodaysObjective(profile.current_focus)
  );
  const completed = !!todayMission?.mission_completed;

  const changeObjective = () => {
    // Rotate by appending a time offset — pull next from pool
    const pool = profile.current_focus?.length
      ? profile.current_focus.flatMap(f => OBJECTIVES_BY_FOCUS[f] || [])
      : OBJECTIVES_BY_FOCUS.default;
    if (pool.length === 0) return;
    const currentIdx = pool.indexOf(objective);
    const nextIdx = (currentIdx + 1) % pool.length;
    setObjective(pool[nextIdx]);
  };

  const handleNavTab = (key) => {
    setTab(key);
    if (key === "resources")  navigate("/VeteransDashboard");
    if (key === "checkin")    navigate("/DailyCheckIn");
    if (key === "community")  navigate("/VeteransDashboard");
    if (key === "profile")    onEditSettings();
  };

  return (
    <div style={{
      minHeight: "100vh", background: VM.bg, color: VM.text,
      paddingBottom: 100, fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>

        <VMDHeader onSettings={onEditSettings} />

        <div style={{ padding: "16px 16px 0", display: "flex", flexDirection: "column", gap: 14 }}>

          {!hasAnyData && (
            <VMDEmptyState
              onFirstCheckin={() => navigate("/DailyCheckIn")}
              onFindHelp={() => navigate("/VeteransDashboard")}
            />
          )}

          <VMDMissionCard
            objective={objective}
            completed={completed}
            onComplete={() => onToggleObjective(objective)}
            onChange={changeObjective}
          />

          <VMDCheckinCard
            todaysCheckin={{ mood_rating: todayCheckinMood }}
            onSave={(data) => onSaveCheckin(data)}
            onViewHistory={() => navigate("/DailyCheckIn")}
          />

          <VMDProgressStrip
            streak={streak}
            weekCheckins={weekCheckins}
            tasksDone={tasksDone}
            supportActions={supportActions}
          />

          <VMDQuickActions />

          <VMDNearbyResources
            resources={resources}
            savedIds={savedIds}
            onSave={onSaveResource}
          />

          <VMDSupportCard />

          <VMDCommunityPreview />

          <p style={{ textAlign: "center", fontSize: 10, color: VM.dim, lineHeight: 1.6, fontStyle: "italic", padding: "4px 8px 8px" }}>
            Your data stays private. Not medical or clinical advice.
          </p>
        </div>
      </div>

      <VMDBottomNav active={tab} onChange={handleNavTab} />
    </div>
  );
}