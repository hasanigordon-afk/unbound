import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CalendarCheck, Loader2, MapPin } from "lucide-react";
import MeetingCard from "@/components/meetings/MeetingCard";
import MeetingFilters from "@/components/meetings/MeetingFilters";

const CREAM = "#F6F4EF";
const NAVY = "#0F1E3D";
const GOLD = "#C8932F";
const TEXT = "#1A1F2C";
const MUTED = "#4A5260";
const DIM = "#6B7280";
const BORDER = "#E4DFD3";

const TIME_BUCKETS = {
  morning: (h) => h >= 5 && h < 12,
  midday:  (h) => h >= 12 && h < 17,
  evening: (h) => h >= 17 && h < 21,
  night:   (h) => h >= 21 || h < 5,
};

const DEFAULT_FILTERS = {
  search: "", time: "all", type: "all", format: "all", location: "all",
};

export default function MeetingDirectory() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState("all"); // "all" | "mine"
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me(), retry: false });

  const { data: meetings = [], isLoading: mL } = useQuery({
    queryKey: ["meetings-directory"],
    queryFn: () => base44.entities.Meeting.filter({ is_active: true }, "-created_date", 500),
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ["meeting-favorites", user?.email],
    queryFn: () => base44.entities.MeetingFavorite.filter({ created_by: user.email }),
    enabled: !!user?.email,
  });

  const favById = useMemo(() => {
    const m = new Map();
    favorites.forEach((f) => m.set(f.meeting_id, f));
    return m;
  }, [favorites]);

  const toggleSaveMutation = useMutation({
    mutationFn: async (meeting) => {
      const existing = favById.get(meeting.id);
      if (existing) return base44.entities.MeetingFavorite.delete(existing.id);
      return base44.entities.MeetingFavorite.create({
        meeting_id: meeting.id,
        meeting_title: meeting.title,
        rsvp: false,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["meeting-favorites"] }),
  });

  const toggleRsvpMutation = useMutation({
    mutationFn: async (meeting) => {
      const existing = favById.get(meeting.id);
      if (existing) {
        return base44.entities.MeetingFavorite.update(existing.id, { rsvp: !existing.rsvp });
      }
      return base44.entities.MeetingFavorite.create({
        meeting_id: meeting.id,
        meeting_title: meeting.title,
        rsvp: true,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["meeting-favorites"] }),
  });

  const filtered = useMemo(() => {
    let list = meetings;

    if (tab === "mine") {
      const ids = new Set(favorites.map((f) => f.meeting_id));
      list = list.filter((m) => ids.has(m.id));
    }

    const q = filters.search.trim().toLowerCase();
    if (q) {
      list = list.filter((m) =>
        [m.title, m.city, m.state, m.zip, m.address, m.notes]
          .filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
      );
    }

    if (filters.time !== "all") {
      const fn = TIME_BUCKETS[filters.time];
      list = list.filter((m) => {
        if (!m.start_time) return false;
        const h = parseInt(m.start_time.split(":")[0], 10);
        return !isNaN(h) && fn(h);
      });
    }

    if (filters.type !== "all") list = list.filter((m) => m.program_type === filters.type);
    if (filters.format !== "all") list = list.filter((m) => m.meeting_format === filters.format);

    if (filters.location === "inperson") list = list.filter((m) => m.in_person);
    if (filters.location === "online")   list = list.filter((m) => !m.in_person);

    return list;
  }, [meetings, favorites, tab, filters]);

  const rsvpCount = favorites.filter((f) => f.rsvp).length;
  const savedCount = favorites.length;

  return (
    <div style={{ background: CREAM, minHeight: "100vh", paddingBottom: 120 }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>

        {/* Header */}
        <div style={{
          padding: "44px 20px 20px",
          background: `linear-gradient(180deg,#fff 0%, ${CREAM} 100%)`,
          borderBottom: `1px solid ${BORDER}`,
        }}>
          <button onClick={() => navigate("/")}
            style={{
              background: "transparent", border: "none", padding: 0, cursor: "pointer",
              display: "inline-flex", alignItems: "center", gap: 6,
              color: MUTED, fontSize: 13, fontWeight: 600, marginBottom: 12,
            }}>
            <ArrowLeft style={{ width: 15, height: 15 }} /> Home
          </button>

          <h1 style={{
            fontFamily: "'Lora', Georgia, serif",
            fontSize: 30, fontWeight: 700, color: NAVY, lineHeight: 1.1, marginBottom: 6,
          }}>
            Meeting <span style={{ color: GOLD }}>Directory</span>
          </h1>
          <p style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.6 }}>
            12-step and recovery support meetings. Filter, RSVP, and save your favorites.
          </p>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            {[
              { v: "all",  label: `All meetings`, count: meetings.length },
              { v: "mine", label: `My Meetings`,  count: savedCount       },
            ].map((t) => {
              const active = tab === t.v;
              return (
                <button key={t.v} onClick={() => setTab(t.v)}
                  style={{
                    padding: "9px 14px", borderRadius: 999,
                    border: `1px solid ${active ? NAVY : BORDER}`,
                    background: active ? NAVY : "#fff",
                    color: active ? "#fff" : MUTED,
                    fontSize: 13, fontWeight: 700, cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                    display: "inline-flex", alignItems: "center", gap: 6,
                  }}>
                  {t.label}
                  <span style={{
                    fontSize: 11, fontWeight: 800,
                    background: active ? "rgba(255,255,255,0.18)" : "rgba(15,30,61,0.07)",
                    padding: "1px 7px", borderRadius: 999,
                  }}>{t.count}</span>
                </button>
              );
            })}
          </div>

          {tab === "mine" && rsvpCount > 0 && (
            <div style={{
              marginTop: 12, padding: "8px 12px", borderRadius: 12,
              background: "rgba(52,168,83,0.10)", border: "1px solid rgba(52,168,83,0.25)",
              display: "inline-flex", alignItems: "center", gap: 6,
            }}>
              <CalendarCheck style={{ width: 14, height: 14, color: "#1B7A38" }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#1B7A38" }}>
                {rsvpCount} RSVP'd
              </span>
            </div>
          )}
        </div>

        <div style={{ padding: "16px" }}>
          <MeetingFilters filters={filters} setFilters={setFilters} />

          {mL ? (
            <div style={{ padding: 40, textAlign: "center" }}>
              <Loader2 className="animate-spin" style={{ width: 24, height: 24, color: GOLD, margin: "0 auto" }} />
            </div>
          ) : filtered.length === 0 ? (
            <div style={{
              background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 18,
              padding: "32px 20px", textAlign: "center",
            }}>
              <MapPin style={{ width: 24, height: 24, color: DIM, margin: "0 auto 10px" }} />
              <p style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 4 }}>
                {tab === "mine" ? "No saved meetings yet" : "No meetings match those filters"}
              </p>
              <p style={{ fontSize: 12.5, color: DIM, lineHeight: 1.6 }}>
                {tab === "mine"
                  ? "Tap the star on any meeting to save it here."
                  : "Try clearing some filters or expanding your search."}
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {filtered.map((m) => {
                const fav = favById.get(m.id);
                return (
                  <MeetingCard
                    key={m.id}
                    meeting={m}
                    isSaved={!!fav}
                    isRsvp={!!fav?.rsvp}
                    onToggleSave={(meeting) => toggleSaveMutation.mutate(meeting)}
                    onToggleRsvp={(meeting) => toggleRsvpMutation.mutate(meeting)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}