import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Bell, Bus, CalendarDays, CheckCircle2, Clock, MapPin, MessageCircle, Plus, Video } from 'lucide-react';

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const sampleAppointments = [
  { title: 'NA/AA Meeting', day: 'Sunday', time: '6:30 PM', location: 'Community Recovery Center', reminder: 'On', transportation_needed: false, checkin_required: true, urgency: 'upcoming' },
  { title: 'IOP group session', day: 'Monday', time: '6:00 PM', location: 'ReZilient IOP Room 2', reminder: 'On', transportation_needed: true, checkin_required: true, urgency: 'upcoming' },
  { title: 'Medication pickup', day: 'Tuesday', time: '9:00 AM', location: 'Main Street Pharmacy', reminder: 'On', transportation_needed: false, checkin_required: false, urgency: 'upcoming' },
  { title: 'Therapy appointment', day: 'Wednesday', time: '2:00 PM', location: 'Virtual link', reminder: 'On', transportation_needed: false, checkin_required: true, urgency: 'upcoming' },
  { title: 'Counselor follow-up', day: 'Thursday', time: '3:00 PM', location: 'Phone check-in', reminder: 'On', transportation_needed: false, checkin_required: true, urgency: 'upcoming' },
  { title: 'Court/probation check-in', day: 'Friday', time: '10:00 AM', location: 'County Probation Office', reminder: 'On', transportation_needed: true, checkin_required: true, urgency: 'upcoming' },
  { title: 'Job interview', day: 'Saturday', time: '11:00 AM', location: 'Second Chance Staffing', reminder: 'On', transportation_needed: true, checkin_required: false, urgency: 'upcoming' },
  { title: 'Transportation pickup reminder', day: 'Monday', time: '5:15 PM', location: 'Home pickup', reminder: 'On', transportation_needed: true, checkin_required: false, urgency: 'upcoming' },
];

const urgencyStyles = {
  today: 'border-blue-300/40 bg-blue-400/15 text-blue-100',
  tomorrow: 'border-emerald-300/35 bg-emerald-400/12 text-emerald-100',
  upcoming: 'border-white/10 bg-white/8 text-slate-200',
  missed: 'border-amber-300/35 bg-amber-400/15 text-amber-100',
};

function normalizeDay(text = '') {
  const found = dayNames.find((day) => text.toLowerCase().includes(day.toLowerCase()));
  return found || dayNames[new Date().getDay()];
}

function statusForDay(day) {
  const today = new Date().getDay();
  const index = dayNames.indexOf(day);
  if (index === today) return 'today';
  if (index === (today + 1) % 7) return 'tomorrow';
  if (index < today) return 'missed';
  return 'upcoming';
}

export default function WeeklyRecoveryItinerary() {
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [transportation, setTransportation] = useState([]);
  const [confirmed, setConfirmed] = useState({});

  useEffect(() => {
    Promise.all([
      base44.entities.CalendarEvents.list('-created_date', 50),
      base44.entities.DailyReminders.list('-created_date', 50),
      base44.entities.TransportationNeeds.list('-created_date', 50),
    ]).then(([events, dailyReminders, rides]) => {
      setCalendarEvents(events || []);
      setReminders(dailyReminders || []);
      setTransportation(rides || []);
    });
  }, []);

  const appointments = useMemo(() => {
    const generated = calendarEvents.map((event) => ({
      title: event.title,
      day: normalizeDay(event.schedule_text),
      time: event.time_text || 'Needs time review',
      location: event.category === 'meeting' ? 'Recovery meeting location' : event.category === 'follow_up' ? 'Phone / virtual' : 'Appointment location',
      reminder: reminders.some((item) => item.plan_id === event.plan_id) ? 'On' : 'Needs setup',
      transportation_needed: transportation.some((item) => item.plan_id === event.plan_id),
      checkin_required: ['probation', 'treatment', 'follow_up'].includes(event.category),
      urgency: event.needs_review ? 'missed' : statusForDay(normalizeDay(event.schedule_text)),
    }));
    return generated.length ? generated : sampleAppointments.map((item) => ({ ...item, urgency: statusForDay(item.day) }));
  }, [calendarEvents, reminders, transportation]);

  const todayLabel = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  const nextUp = appointments.find((item) => item.urgency === 'today') || appointments[0];

  return (
    <section className="rounded-[38px] border border-white/12 bg-gradient-to-br from-white/14 via-blue-400/10 to-emerald-400/10 p-5 shadow-2xl backdrop-blur-2xl">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-200">This Week’s Recovery Itinerary</p>
          <h2 className="mt-2 font-sans text-3xl font-black tracking-tight">Here is what I have to do this week.</h2>
          <p className="mt-2 text-sm font-bold text-slate-300">{todayLabel}</p>
        </div>
        <Link to="/SEESuperAgent" className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-3xl bg-white px-5 font-black text-slate-950 active:scale-95 transition"><CalendarDays className="h-5 w-5" />View Full Calendar</Link>
      </div>

      {nextUp && (
        <div className="mb-5 rounded-[30px] border border-blue-200/20 bg-white/12 p-4">
          <p className="mb-2 text-xs font-black uppercase tracking-wider text-blue-100">Next Up</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-sans text-xl font-black">{nextUp.title}</h3>
              <p className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-300"><Clock className="h-4 w-4" />{nextUp.day} · {nextUp.time}<MapPin className="h-4 w-4" />{nextUp.location}</p>
            </div>
            <button onClick={() => setConfirmed((prev) => ({ ...prev, [nextUp.title]: true }))} className="rounded-3xl bg-emerald-300 px-5 py-3 font-black text-slate-950 active:scale-95 transition"><CheckCircle2 className="mr-2 inline h-5 w-5" />Confirm Appointment</button>
          </div>
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
        {dayNames.slice(1).concat('Sunday').map((day) => {
          const dayItems = appointments.filter((item) => item.day === day);
          return (
            <div key={day} className="rounded-[26px] border border-white/10 bg-white/8 p-3">
              <p className="mb-3 font-sans text-sm font-black text-white">{day}</p>
              <div className="space-y-2">
                {dayItems.length === 0 ? <p className="rounded-2xl bg-white/6 p-3 text-xs text-slate-400">No scheduled items</p> : dayItems.map((item) => (
                  <div key={`${day}-${item.title}`} className={`rounded-2xl border p-3 ${urgencyStyles[item.urgency]}`}>
                    <p className="text-sm font-black">{item.title}</p>
                    <p className="mt-1 text-xs opacity-90">{item.time}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs opacity-80">{item.location === 'Virtual link' ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}{item.location}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="rounded-full bg-white/12 px-2 py-1 text-[10px] font-black"><Bell className="mr-1 inline h-3 w-3" />{item.reminder}</span>
                      <span className="rounded-full bg-white/12 px-2 py-1 text-[10px] font-black"><Bus className="mr-1 inline h-3 w-3" />{item.transportation_needed ? 'Ride needed' : 'No ride'}</span>
                      {item.checkin_required && <span className="rounded-full bg-white/12 px-2 py-1 text-[10px] font-black">Check-in required</span>}
                      {confirmed[item.title] && <span className="rounded-full bg-emerald-300/20 px-2 py-1 text-[10px] font-black text-emerald-100">Confirmed</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-4">
        <button className="rounded-3xl bg-white/10 px-4 py-3 text-sm font-black text-slate-100 active:scale-95 transition"><Bus className="mr-2 inline h-4 w-4" />Need a Ride?</button>
        <Link to="/SuperAgentChat" className="rounded-3xl bg-white/10 px-4 py-3 text-center text-sm font-black text-slate-100 active:scale-95 transition"><MessageCircle className="mr-2 inline h-4 w-4" />Message Counselor</Link>
        <button className="rounded-3xl bg-white/10 px-4 py-3 text-sm font-black text-slate-100 active:scale-95 transition"><Plus className="mr-2 inline h-4 w-4" />Add Reminder</button>
        <button onClick={() => nextUp && setConfirmed((prev) => ({ ...prev, [nextUp.title]: true }))} className="rounded-3xl bg-white px-4 py-3 text-sm font-black text-slate-950 active:scale-95 transition">Confirm Appointment</button>
      </div>
    </section>
  );
}