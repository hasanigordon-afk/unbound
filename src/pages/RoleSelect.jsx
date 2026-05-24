import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "./utils";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  HandHeart,
  Heart,
  Home,
  Loader2,
  MapPinned,
  Shield,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";
import ReZilientLogo from "@/components/shared/ReZilientLogo";

const ROLES = [
  {
    id: "client",
    label: "Client / Participant",
    sub: "Daily structure, check-ins, roadmap, support circle, resources, and wins.",
    icon: UserRound,
    dashboard: "/",
    permissions: ["Own plan", "Ask AI", "Private profile"],
  },
  {
    id: "counselor",
    label: "Counselor",
    sub: "Create aftercare plans, monitor engagement, risk, progress, and messages.",
    icon: BadgeCheck,
    dashboard: "/SEESuperAgent",
    permissions: ["S.E.E. builder", "Caseload", "Risk review"],
  },
  {
    id: "sponsor",
    label: "Sponsor",
    sub: "Support check-ins, encouragement, meeting accountability, and crisis outreach.",
    icon: HandHeart,
    dashboard: "/SupportUserDashboard",
    permissions: ["Consent-based view", "Messages", "Encouragement"],
  },
  {
    id: "mentor",
    label: "Mentor",
    sub: "Guide goals, employment, reentry steps, and personal growth.",
    icon: Sparkles,
    dashboard: "/MentorOnboarding",
    permissions: ["Goal coaching", "Growth notes", "Resources"],
  },
  {
    id: "probation_officer",
    label: "Probation Officer",
    sub: "View compliance, required check-ins, court tasks, and progress with consent.",
    icon: Shield,
    dashboard: "/ProbationOfficerDashboard",
    permissions: ["Compliance", "Appointments", "Notes"],
  },
  {
    id: "family_supporter",
    label: "Family Supporter",
    sub: "Stay connected, send encouragement, and understand progress without shame.",
    icon: Heart,
    dashboard: "/FamilyView",
    permissions: ["Shared wins", "Messages", "Support activity"],
  },
  {
    id: "facility_admin",
    label: "Facility Admin",
    sub: "Manage programs, staff, intakes, outcomes, and facility-level dashboards.",
    icon: Building2,
    dashboard: "/FacilityPilotDashboard",
    permissions: ["Facility overview", "Staff access", "Outcomes"],
  },
  {
    id: "veteran",
    label: "Veteran",
    sub: "VA resources, benefits, housing, military mentorship, and mission-based support.",
    icon: Users,
    dashboard: "/VeteranSupportHub",
    permissions: ["Veteran hub", "Benefits", "Mentorship"],
  },
  {
    id: "returning_citizen",
    label: "Returning Citizen",
    sub: "Reentry support for IDs, housing, jobs, transportation, legal, and community.",
    icon: Home,
    dashboard: "/RecoveryMapFinder",
    permissions: ["Reentry map", "Roadmap", "Support"],
  },
  {
    id: "person_seeking_help",
    label: "Person Seeking Help",
    sub: "Immediate help, resources near you, calming tools, and a first-step plan.",
    icon: MapPinned,
    dashboard: "/FindHelpNow",
    permissions: ["Urgent help", "Resources", "AI guidance"],
  },
];

export default function RoleSelect() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const user = await base44.auth.me();
        if (!user) {
          setChecking(false);
          return;
        }

        const [counselorProfiles, memberProfiles] = await Promise.all([
          base44.entities.CounselorProfile.filter({ counselor_email: user.email }),
          base44.entities.MemberProfile.filter({ created_by: user.email }),
        ]);

        if (counselorProfiles.length > 0) {
          navigate("/SEESuperAgent", { replace: true });
          return;
        }
        if (memberProfiles.length > 0 && memberProfiles[0]?.onboarding_complete) {
          navigate("/", { replace: true });
          return;
        }
      } catch {
        // Logged-out preview users can still see the role matrix.
      }
      setChecking(false);
    })();
  }, [navigate]);

  const handleRole = async (role) => {
    sessionStorage.setItem("unbound_role", role.id);
    try {
      await base44.auth.updateMe({ role: role.id });
    } catch {
      // Preview mode may not have an authenticated user yet.
    }
    if (role.dashboard === "/") navigate("/");
    else if (role.dashboard.startsWith("/")) navigate(role.dashboard);
    else navigate(createPageUrl(role.dashboard));
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-transparent">
        <Loader2 className="h-7 w-7 animate-spin text-blue-200" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent px-4 py-8 text-white sm:py-12">
      <div className="mx-auto max-w-5xl">
        <section className="card-glow overflow-hidden p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <ReZilientLogo className="h-14 w-14" />
            <div>
              <p className="text-xs font-black uppercase tracking-[0.26em] text-amber-200">Help. Hope. Healing.</p>
              <h1 className="mt-1 font-sans text-3xl font-black text-white sm:text-5xl">Who are you today?</h1>
            </div>
          </div>
          <p className="mt-5 max-w-3xl text-base font-bold leading-relaxed text-slate-300">
            ReZilient adapts permissions, dashboards, reminders, and support tools to the role you choose. You can switch roles later when responsibilities change.
          </p>
        </section>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {ROLES.map((role) => {
            const Icon = role.icon;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => handleRole(role)}
                className="group card-soft min-h-[168px] w-full p-5 text-left transition hover:-translate-y-1 hover:border-blue-200/35 active:scale-[0.99]"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl border border-white/10 bg-white/10 text-white shadow-inner">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-sans text-xl font-black text-white">{role.label}</p>
                      <ArrowRight className="h-5 w-5 shrink-0 text-blue-200 transition group-hover:translate-x-1" />
                    </div>
                    <p className="mt-2 text-sm font-bold leading-relaxed text-slate-300">{role.sub}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {role.permissions.map((permission) => (
                        <span key={permission} className="rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-[11px] font-black text-slate-200">
                          {permission}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <p className="mt-6 text-center text-xs font-bold text-slate-400">
          ReZilient is a support ecosystem, not hospital software or a replacement for emergency care.
        </p>
      </div>
    </div>
  );
}
