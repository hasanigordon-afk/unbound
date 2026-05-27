import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MapPin, List, Star, StarOff, Check, Filter, Calendar, Wifi, Globe, Map, ClipboardList, BookOpen, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MyPlanTab from "@/components/meetings/MyPlanTab";
import AttendanceLog from "@/components/meetings/AttendanceLog";
import ProbationCalendar from "@/components/meetings/ProbationCalendar";
import { demoMeetings } from "@/data/pilotDemoData";

// Fix leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const PROGRAM_COLORS = { AA: "#4A90E2", NA: "#9C6FE4", SMART: "#22c55e", Other: "#FF9800" };

export default function Meetings() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("finder");
  const [view, setView] = useState("list");
  const [filterType, setFilterType] = useState("all");
  const [filterFormat, setFilterFormat] = useState("all");
  const [filterDay, setFilterDay] = useState("all");
  const [showAttendModal, setShowAttendModal] = useState(null);
  const [attendNote, setAttendNote] = useState("");

  const TABS = [
    { id: "finder", label: "Find", icon: List },
    { id: "plan", label: "My Plan", icon: Calendar },
    { id: "attendance", label: "Log", icon: ClipboardList },
    { id: "probation", label: "Appointments", icon: Shield },
  ];

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: meetings = [] } = useQuery({
    queryKey: ["meetings"],
    queryFn: () => base44.entities.Meeting.filter({ is_active: true }).catch(() => []),
  });
  const meetingRows = meetings.length > 0 ? meetings : demoMeetings;

  const { data: favorites = [] } = useQuery({
    queryKey: ["meeting-favorites", user?.email],
    queryFn: () => base44.entities.MeetingFavorite.filter({ created_by: user.email }),
    enabled: !!user,
  });

  const { data: attendance = [] } = useQuery({
    queryKey: ["meeting-attendance", user?.email],
    queryFn: () => base44.entities.MeetingAttendance.filter({ participant_email: user.email }),
    enabled: !!user,
  });

  const toggleFavMutation = useMutation({
    mutationFn: async (meeting) => {
      const existing = favorites.find(f => f.meeting_id === meeting.id);
      if (existing) {
        await base44.entities.MeetingFavorite.delete(existing.id);
      } else {
        await base44.entities.MeetingFavorite.create({ meeting_id: meeting.id, meeting_title: meeting.title });
      }
    },
    onSuccess: () => queryClient.invalidateQueries(["meeting-favorites"]),
  });

  const logAttendanceMutation = useMutation({
    mutationFn: (meeting) => base44.entities.MeetingAttendance.create({
      meeting_id: meeting?.id || null,
      meeting_name_text: meeting?.title || null,
      attended_at: new Date().toISOString().split('T')[0],
      notes: attendNote,
      participant_email: user?.email,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(["meeting-attendance"]);
      setShowAttendModal(null);
      setAttendNote("");
      toast.success("Attendance logged!");
    },
  });

  const isFav = (id) => favorites.some(f => f.meeting_id === id);
  const attendedToday = (id) => {
    const today = new Date().toISOString().split('T')[0];
    return attendance.some(a => a.meeting_id === id && a.attended_at === today);
  };

  const filtered = meetingRows.filter(m => {
    const typeMatch = filterType === "all" || m.program_type === filterType;
    const formatMatch = filterFormat === "all" || (filterFormat === "online" ? !m.in_person : m.in_person);
    const dayMatch = filterDay === "all" || m.day_of_week === parseInt(filterDay);
    return typeMatch && formatMatch && dayMatch;
  });

  const mapCenter = filtered.find(m => m.latitude && m.longitude)
    ? [filtered.find(m => m.latitude).latitude, filtered.find(m => m.latitude).longitude]
    : [39.8283, -98.5795]; // US center

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="px-5 pt-8 pb-0" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <h1 style={{ marginBottom: '4px' }}>Meetings</h1>
        <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>Find a meeting, save your favorites, and log when you go</p>

        {/* Main Tabs */}
        <div className="flex overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className="flex items-center gap-1.5 px-4 py-3 text-sm font-medium flex-shrink-0"
              style={{
                color: activeTab === t.id ? 'var(--primary)' : 'var(--text-muted)',
                borderBottom: activeTab === t.id ? '2px solid var(--primary)' : '2px solid transparent',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === t.id ? '2px solid var(--primary)' : '2px solid transparent',
                cursor: 'pointer',
              }}
            >
              <t.icon className="w-4 h-4" strokeWidth={1.5} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* FINDER TAB */}
      {activeTab === "finder" && (
        <>
          {/* View toggle */}
          <div className="px-5 pt-4 pb-0">
            <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              <button onClick={() => setView("list")} className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium"
                style={{ background: view === "list" ? 'var(--primary)' : 'var(--bg-primary)', color: view === "list" ? '#FFF' : 'var(--text-secondary)' }}>
                <List className="w-4 h-4" strokeWidth={1.5} /> List
              </button>
              <button onClick={() => setView("map")} className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium"
                style={{ background: view === "map" ? 'var(--primary)' : 'var(--bg-primary)', color: view === "map" ? '#FFF' : 'var(--text-secondary)' }}>
                <Map className="w-4 h-4" strokeWidth={1.5} /> Map
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="px-5 py-3 flex gap-2 overflow-x-auto" style={{ borderBottom: '1px solid var(--border)' }}>
            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="text-xs px-3 py-1.5 rounded-full flex-shrink-0"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
              <option value="all">All Types</option>
              <option value="AA">AA</option>
              <option value="NA">NA</option>
              <option value="SMART">SMART</option>
              <option value="Other">Other</option>
            </select>
            <select value={filterFormat} onChange={e => setFilterFormat(e.target.value)} className="text-xs px-3 py-1.5 rounded-full flex-shrink-0"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
              <option value="all">In-Person & Online</option>
              <option value="in_person">In-Person</option>
              <option value="online">Online</option>
            </select>
            <select value={filterDay} onChange={e => setFilterDay(e.target.value)} className="text-xs px-3 py-1.5 rounded-full flex-shrink-0"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
              <option value="all">Any Day</option>
              {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
            </select>
          </div>

          {view === "list" ? (
            <div className="px-5 py-4 space-y-3">
              {filtered.length === 0 ? (
                <div className="text-center py-16" style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: '40px 20px' }}>
                  <Calendar className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} strokeWidth={1.5} />
                  <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>No meetings found with those filters.</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Try clearing the filters to see all available meetings.</p>
                </div>
              ) : (
                filtered.map(meeting => (
                  <MeetingCard key={meeting.id} meeting={meeting} isFav={isFav(meeting.id)} attended={attendedToday(meeting.id)}
                    onToggleFav={() => toggleFavMutation.mutate(meeting)} onLogAttend={() => setShowAttendModal(meeting)} />
                ))
              )}
            </div>
          ) : (
            <div style={{ height: 'calc(100vh - 300px)' }}>
              <MapContainer center={mapCenter} zoom={10} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {filtered.filter(m => m.latitude && m.longitude).map(m => (
                  <Marker key={m.id} position={[m.latitude, m.longitude]}>
                    <Popup>
                      <div>
                        <p className="font-semibold">{m.title}</p>
                        <p className="text-xs">{m.program_type} · {DAYS[m.day_of_week]} {m.start_time}</p>
                        {m.address && <p className="text-xs">{m.address}, {m.city}</p>}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          )}
        </>
      )}

      {activeTab === "plan" && (
        <div className="px-5 py-5">
          <MyPlanTab user={user} meetings={meetingRows} />
        </div>
      )}

      {activeTab === "attendance" && (
        <div className="px-5 py-5">
          <AttendanceLog user={user} meetings={meetingRows} />
        </div>
      )}

      {activeTab === "probation" && (
        <div className="px-5 py-5">
          <ProbationCalendar user={user} />
        </div>
      )}

      {/* Attend Modal */}
      {showAttendModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowAttendModal(null)}>
          <div className="w-full max-w-md p-6 rounded-2xl" style={{ background: 'var(--bg-secondary)' }} onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold mb-1">Mark as attended</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>{showAttendModal.title}</p>
            <textarea placeholder="Any notes? (optional)" value={attendNote} onChange={e => setAttendNote(e.target.value)} rows={2}
              className="w-full p-3 text-sm rounded-lg mb-4"
              style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)', resize: 'none' }} />
            <div className="flex gap-3">
              <Button onClick={() => setShowAttendModal(null)} className="flex-1 btn-secondary">Cancel</Button>
              <Button onClick={() => logAttendanceMutation.mutate(showAttendModal)} className="flex-1 btn-primary" disabled={logAttendanceMutation.isPending}>
                {logAttendanceMutation.isPending ? "Saving…" : "I was there ✓"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MeetingCard({ meeting, isFav, attended, onToggleFav, onLogAttend }) {
  return (
    <div className="card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{meeting.title}</p>
            <Badge
              className="text-[10px] px-2 py-0.5"
              style={{ background: `${PROGRAM_COLORS[meeting.program_type]}20`, color: PROGRAM_COLORS[meeting.program_type], border: `1px solid ${PROGRAM_COLORS[meeting.program_type]}40` }}
            >
              {meeting.program_type}
            </Badge>
            {!meeting.in_person && (
              <Badge variant="outline" className="text-[10px] px-2 py-0.5 flex items-center gap-1">
                <Globe className="w-2.5 h-2.5" strokeWidth={1.5} /> Online
              </Badge>
            )}
          </div>

          {meeting.day_of_week !== undefined && meeting.start_time && (
            <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
              {DAYS[meeting.day_of_week]}s at {meeting.start_time}
              {meeting.end_time ? ` – ${meeting.end_time}` : ""}
            </p>
          )}

          {meeting.in_person && meeting.address && (
            <p className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
              <MapPin className="w-3 h-3" strokeWidth={1.5} />
              {meeting.address}, {meeting.city}, {meeting.state}
            </p>
          )}

          {!meeting.in_person && meeting.url && (
            <a href={meeting.url} target="_blank" rel="noopener noreferrer" className="text-xs flex items-center gap-1" style={{ color: 'var(--primary)' }}>
              <Wifi className="w-3 h-3" strokeWidth={1.5} /> Join online
            </a>
          )}

          {meeting.notes && (
            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>{meeting.notes}</p>
          )}
        </div>

        <button onClick={onToggleFav} className="flex-shrink-0">
          {isFav
            ? <Star className="w-5 h-5 fill-current" style={{ color: '#fbbf24' }} strokeWidth={1.5} />
            : <StarOff className="w-5 h-5" style={{ color: 'var(--text-muted)' }} strokeWidth={1.5} />
          }
        </button>
      </div>

      <div className="mt-3 pt-3 flex items-center gap-2" style={{ borderTop: '1px solid var(--border)' }}>
        {meeting.in_person && meeting.latitude && (
          <a
            href={`https://maps.google.com/?q=${meeting.latitude},${meeting.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg"
            style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          >
            <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} /> Directions
          </a>
        )}
        <button
          onClick={onLogAttend}
          disabled={attended}
          className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg ml-auto"
          style={{
            background: attended ? 'rgba(34,197,94,0.1)' : 'var(--primary)',
            color: attended ? '#22c55e' : '#FFF',
            border: attended ? '1px solid rgba(34,197,94,0.3)' : 'none'
          }}
        >
          <Check className="w-3.5 h-3.5" strokeWidth={2} />
          {attended ? "Went today ✓" : "I went"}
        </button>
      </div>
    </div>
  );
}