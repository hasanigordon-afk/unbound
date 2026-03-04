import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "./utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar, TrendingUp, Inbox, LogOut, CheckCircle, Shield,
  Home, Phone, PlayCircle, BookOpen, ChevronRight
} from "lucide-react";
import PatientInbox from "@/components/messaging/PatientInbox";
import CourtGuidelinesReminder from "@/components/compliance/CourtGuidelinesReminder";

const SIDEBAR_ITEMS = [
  { id: "home", label: "Home", icon: Home },
  { id: "lifeline", label: "Lifeline", icon: Phone },
  { id: "media", label: "Media", icon: PlayCircle },
  { id: "links", label: "Helpful Links", icon: BookOpen },
];

const HELPFUL_LINKS = [
  { label: "SAMHSA National Helpline", url: "https://www.samhsa.gov/find-help/national-helpline", desc: "Free 24/7 treatment referrals" },
  { label: "AA Meeting Finder", url: "https://www.aa.org/find-aa", desc: "Find local AA meetings" },
  { label: "NA Meeting Search", url: "https://www.na.org/meetingsearch/", desc: "Find NA meetings near you" },
  { label: "SMART Recovery", url: "https://www.smartrecovery.org", desc: "Science-based recovery support" },
  { label: "Crisis Text Line", url: "sms:741741", desc: "Text HOME to 741741" },
  { label: "Benefits.gov", url: "https://www.benefits.gov", desc: "Find government benefit programs" },
  { label: "211.org", url: "https://www.211.org", desc: "Local health & human services" },
];

const MEDIA_ITEMS = [
  { label: "The Anonymous People", desc: "Documentary on recovery advocacy", url: "https://www.youtube.com/watch?v=example1", type: "Documentary" },
  { label: "Recovery: The Experience", desc: "Personal stories from recovery", url: "https://www.youtube.com/results?search_query=addiction+recovery+stories", type: "Series" },
  { label: "Meditation for Recovery", desc: "Guided mindfulness sessions", url: "https://www.youtube.com/results?search_query=meditation+recovery+sobriety", type: "Meditation" },
  { label: "SAMHSA Recovery Month", desc: "Official recovery resources", url: "https://www.samhsa.gov/recovery", type: "Resource" },
];

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [sidebarTab, setSidebarTab] = useState("home");
  const [activeTab, setActiveTab] = useState("overview");

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: checkIns = [] } = useQuery({
    queryKey: ["daily-checkins", user?.email],
    queryFn: () => base44.entities.DailyCheckIn.filter({ participant_email: user.email }, "-check_in_date", 90),
    enabled: !!user,
  });

  const today = new Date().toISOString().split("T")[0];
  const hasCheckedInToday = checkIns.some((c) => c.check_in_date === today);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const compliancePct = checkIns.length
    ? Math.round((checkIns.filter((c) => new Date(c.check_in_date) >= sevenDaysAgo).length / 7) * 100)
    : 0;

  const TABS = [
    { id: "overview", label: "Overview", icon: TrendingUp },
    { id: "guidelines", label: "Court Rules", icon: Shield },
    { id: "inbox", label: "Inbox", icon: Inbox },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F7F7F8" }}>
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-center justify-between" style={{ background: "#FFFFFF", borderBottom: "1px solid #D1D1D6" }}>
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase mb-0.5" style={{ color: "#8E8E93" }}>PATIENT PORTAL</p>
          <h1 className="text-xl font-semibold" style={{ color: "#1E1E1E" }}>{user?.full_name || "Patient Dashboard"}</h1>
        </div>
        <button
          onClick={() => { sessionStorage.removeItem("unbound_role"); navigate(createPageUrl("RoleSelect")); }}
          className="flex items-center gap-1 text-xs px-3 py-1.5 rounded"
          style={{ background: "#F0F0F3", color: "#5A5A5A", border: "1px solid #D1D1D6" }}
        >
          <LogOut className="w-3.5 h-3.5" strokeWidth={1.5} />
          Switch Role
        </button>
      </div>

      {/* Main Layout: Sidebar + Content */}
      <div className="flex flex-1 min-h-0">

        {/* Left Sidebar */}
        <aside className="flex flex-col w-16 md:w-48 flex-shrink-0 border-r" style={{ background: "#FFFFFF", borderColor: "#D1D1D6" }}>
          {SIDEBAR_ITEMS.map(({ id, label, icon: Icon }) => {
            const isActive = sidebarTab === id;
            return (
              <button
                key={id}
                onClick={() => setSidebarTab(id)}
                className="flex flex-col md:flex-row items-center md:items-center gap-1 md:gap-3 px-2 md:px-5 py-4 text-left w-full"
                style={{
                  background: isActive ? "#EBF3FD" : "transparent",
                  borderRight: isActive ? "3px solid #4A90E2" : "3px solid transparent",
                  color: isActive ? "#4A90E2" : "#8E8E93",
                }}
              >
                <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={isActive ? 2 : 1.5} />
                <span className="text-[10px] md:text-sm font-medium hidden md:block">{label}</span>
                <span className="text-[9px] font-medium md:hidden text-center leading-tight">{label}</span>
              </button>
            );
          })}
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-auto">

          {/* Home Tab */}
          {sidebarTab === "home" && (
            <>
              {/* Sub-tabs */}
              <div className="flex px-4 border-b" style={{ background: "#FFFFFF", borderColor: "#D1D1D6" }}>
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className="flex items-center gap-2 px-3 py-3 text-xs font-medium whitespace-nowrap"
                    style={{
                      color: activeTab === t.id ? "#4A90E2" : "#8E8E93",
                      borderBottom: activeTab === t.id ? "2px solid #4A90E2" : "2px solid transparent",
                      background: "none",
                    }}
                  >
                    <t.icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="p-5 flex flex-col gap-4 max-w-2xl">
                {activeTab === "overview" && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div style={{ background: "#FFF", border: "1px solid #D1D1D6", borderRadius: "8px", padding: "20px" }}>
                        <p className="text-xs uppercase tracking-wide mb-2" style={{ color: "#8E8E93" }}>Compliance Rate</p>
                        <p className="text-3xl font-bold" style={{ color: compliancePct >= 70 ? "#22C55E" : compliancePct >= 40 ? "#F59E0B" : "#EF4444" }}>
                          {compliancePct}%
                        </p>
                        <p className="text-xs mt-1" style={{ color: "#8E8E93" }}>Last 7 Days</p>
                      </div>
                      <div style={{ background: "#FFF", border: "1px solid #D1D1D6", borderRadius: "8px", padding: "20px" }}>
                        <p className="text-xs uppercase tracking-wide mb-2" style={{ color: "#8E8E93" }}>Today's Check-In</p>
                        <p className="text-3xl font-bold" style={{ color: hasCheckedInToday ? "#22C55E" : "#EF4444" }}>
                          {hasCheckedInToday ? "Done" : "Pending"}
                        </p>
                        <p className="text-xs mt-1" style={{ color: "#8E8E93" }}>{today}</p>
                      </div>
                    </div>

                    {!hasCheckedInToday ? (
                      <Link to={createPageUrl("DailyCheckIn")}>
                        <div className="p-5 rounded-lg flex items-center gap-4" style={{ background: "#FFF", border: "2px solid #4A90E2", borderRadius: "8px", cursor: "pointer" }}>
                          <Calendar className="w-8 h-8 flex-shrink-0" style={{ color: "#4A90E2" }} strokeWidth={1.5} />
                          <div>
                            <p className="font-semibold text-sm" style={{ color: "#1E1E1E" }}>Complete Daily Check-In</p>
                            <p className="text-xs mt-0.5" style={{ color: "#5A5A5A" }}>Required for compliance tracking</p>
                          </div>
                        </div>
                      </Link>
                    ) : (
                      <div className="p-5 rounded-lg flex items-center gap-4" style={{ background: "#F0FDF4", border: "1px solid #86EFAC", borderRadius: "8px" }}>
                        <CheckCircle className="w-8 h-8 flex-shrink-0" style={{ color: "#22C55E" }} strokeWidth={1.5} />
                        <div>
                          <p className="font-semibold text-sm" style={{ color: "#15803D" }}>Check-In Complete</p>
                          <p className="text-xs mt-0.5" style={{ color: "#5A5A5A" }}>Next check-in available tomorrow</p>
                        </div>
                      </div>
                    )}

                    <div style={{ background: "#FFF", border: "1px solid #D1D1D6", borderRadius: "8px" }}>
                      <p className="px-5 pt-4 pb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: "#8E8E93" }}>Quick Access</p>
                      {[
                        { label: "90-Day Reintegration Map", sub: "Structured task progression", page: "ReintegrationMap" },
                        { label: "Forward Plan", sub: "5-Year stability roadmap", page: "ForwardPlan" },
                        { label: "Resource Directory", sub: "Employment, housing, benefits", page: "ResourceDirectory" },
                      ].map((item, i) => (
                        <Link key={item.page} to={createPageUrl(item.page)}>
                          <div className="flex items-center justify-between px-5 py-4" style={{ borderTop: i > 0 ? "1px solid #F0F0F3" : "none" }}>
                            <div>
                              <p className="text-sm font-medium" style={{ color: "#1E1E1E" }}>{item.label}</p>
                              <p className="text-xs mt-0.5" style={{ color: "#8E8E93" }}>{item.sub}</p>
                            </div>
                            <ChevronRight className="w-4 h-4" style={{ color: "#8E8E93" }} />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </>
                )}

                {activeTab === "guidelines" && <CourtGuidelinesReminder />}
                {activeTab === "inbox" && user && <PatientInbox userEmail={user.email} userRole="patient" />}
              </div>
            </>
          )}

          {/* Lifeline Tab */}
          {sidebarTab === "lifeline" && (
            <div className="p-5 flex flex-col gap-4 max-w-xl">
              <div>
                <h2 className="text-lg font-semibold mb-1" style={{ color: "#1E1E1E" }}>Lifeline</h2>
                <p className="text-sm" style={{ color: "#5A5A5A" }}>Immediate support when you need it most.</p>
              </div>

              <div className="flex flex-col gap-3">
                <a href="tel:988" className="flex items-center gap-4 p-4 rounded-lg" style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: "8px" }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#EF4444" }}>
                    <Phone className="w-5 h-5 text-white" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "#1E1E1E" }}>988 — Suicide & Crisis Lifeline</p>
                    <p className="text-xs mt-0.5" style={{ color: "#5A5A5A" }}>Call or text 988 — Available 24/7</p>
                  </div>
                </a>

                <a href="tel:18006624357" className="flex items-center gap-4 p-4 rounded-lg" style={{ background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: "8px" }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#F97316" }}>
                    <Phone className="w-5 h-5 text-white" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "#1E1E1E" }}>SAMHSA Helpline</p>
                    <p className="text-xs mt-0.5" style={{ color: "#5A5A5A" }}>1-800-662-4357 — Free, confidential, 24/7</p>
                  </div>
                </a>

                <a href="sms:741741" className="flex items-center gap-4 p-4 rounded-lg" style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: "8px" }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#3B82F6" }}>
                    <Phone className="w-5 h-5 text-white" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "#1E1E1E" }}>Crisis Text Line</p>
                    <p className="text-xs mt-0.5" style={{ color: "#5A5A5A" }}>Text HOME to 741741</p>
                  </div>
                </a>

                <a href="tel:911" className="flex items-center gap-4 p-4 rounded-lg" style={{ background: "#FFF", border: "1px solid #D1D1D6", borderRadius: "8px" }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#6B7280" }}>
                    <Phone className="w-5 h-5 text-white" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "#1E1E1E" }}>911 — Emergency Services</p>
                    <p className="text-xs mt-0.5" style={{ color: "#5A5A5A" }}>For immediate life-threatening emergencies</p>
                  </div>
                </a>
              </div>

              <Link to={createPageUrl("Lifeline")}>
                <div className="p-4 rounded-lg text-center" style={{ background: "#4A90E2", borderRadius: "8px" }}>
                  <p className="font-semibold text-sm text-white">Open Full Lifeline App</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.75)" }}>Connect with your support team</p>
                </div>
              </Link>
            </div>
          )}

          {/* Media Tab */}
          {sidebarTab === "media" && (
            <div className="p-5 flex flex-col gap-4 max-w-xl">
              <div>
                <h2 className="text-lg font-semibold mb-1" style={{ color: "#1E1E1E" }}>Media</h2>
                <p className="text-sm" style={{ color: "#5A5A5A" }}>Videos, documentaries, and guided content for your recovery journey.</p>
              </div>

              <div className="flex flex-col gap-3">
                {MEDIA_ITEMS.map((item, i) => (
                  <a key={i} href={item.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 rounded-lg"
                    style={{ background: "#FFF", border: "1px solid #D1D1D6", borderRadius: "8px" }}
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#EBF3FD" }}>
                      <PlayCircle className="w-5 h-5" style={{ color: "#4A90E2" }} strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm" style={{ color: "#1E1E1E" }}>{item.label}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#5A5A5A" }}>{item.desc}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded flex-shrink-0" style={{ background: "#F0F0F3", color: "#5A5A5A" }}>{item.type}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Helpful Links Tab */}
          {sidebarTab === "links" && (
            <div className="p-5 flex flex-col gap-4 max-w-xl">
              <div>
                <h2 className="text-lg font-semibold mb-1" style={{ color: "#1E1E1E" }}>Helpful Links</h2>
                <p className="text-sm" style={{ color: "#5A5A5A" }}>Trusted resources to support your recovery and reintegration.</p>
              </div>

              <div className="flex flex-col gap-2">
                {HELPFUL_LINKS.map((link, i) => (
                  <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between gap-3 p-4 rounded-lg"
                    style={{ background: "#FFF", border: "1px solid #D1D1D6", borderRadius: "8px" }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0" style={{ background: "#EBF3FD" }}>
                        <BookOpen className="w-4 h-4" style={{ color: "#4A90E2" }} strokeWidth={1.5} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate" style={{ color: "#1E1E1E" }}>{link.label}</p>
                        <p className="text-xs mt-0.5" style={{ color: "#8E8E93" }}>{link.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: "#8E8E93" }} />
                  </a>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}