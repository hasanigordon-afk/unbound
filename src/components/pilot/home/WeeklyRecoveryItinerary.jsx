import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Bell, Bus, CalendarDays, CheckCircle2, Clock, MapPin, MessageCircle, Plus, Video, X } from 'lucide-react';

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const urgencyStyles = {
  today: 'border-blue-300/40 bg-blue-400/15 text-blue-100',
  tomorrow: 'border-emerald-300/35 bg-emerald-400/12 text-emerald-100',
  upcoming: 'border-white/10 bg-white/8 text-slate-200',
  missed: 'border-amber-300/35 bg-amber-400/15 text-amber-100',
};
const blankReminder = { title: '', reminder_date: '', time: '', repeat: 'none', priority: 'medium', notes: '' };
const blankRide = { appointment: '', appointment_id: '', pickup_address: '', destination: '', pickup_time: '', ride_type: 'Bus pass / route help', notes: '' };

function dayFromDate(date) {
  if (!date) return dayNames[new Date().getDay()];
  return dayNames[new Date(`${date}T12:00:00`).getDay()];
}

function statusForDate(date) {
  if (!date) return 'upcoming';
  const today = new Date();
  const current = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const target = new Date(`${date}T12:00:00`);
  const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  const diff = Math.round((targetDay - current) / 86400000);
  if (diff < 0) return 'missed';
  if (diff === 0) return 'today';
  if (diff === 1) return 'tomorrow';
  return 'upcoming';
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-3 backdrop-blur-sm sm:items-center">
      <div className="max-h-[88vh] w-full max-w-2xl overflow-auto rounded-[32px] border border-white/12 bg-[#07101f]/95 p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="font-sans text-2xl font-black text-white">{title}</h3>
          <button onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white"><X className="h-5 w-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function WeeklyRecoveryItinerary() {
  const [appointments, setAppointments] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [rides, setRides] = useState([]);
  const [messages, setMessages] = useState([]);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [reminderForm, setReminderForm] = useState(blankReminder);
  const [rideForm, setRideForm] = useState(blankRide);
  const [messageText, setMessageText] = useState('');
  const [calendarMode, setCalendarMode] = useState('weekly');

  const loadData = async () => {
    const [appts, reminderRows, rideRows, messageRows] = await Promise.all([
      base44.entities.Appointments.list('-appointment_date', 100),
      base44.entities.Reminders.list('-created_date', 100),
      base44.entities.TransportationRequests.list('-created_date', 100),
      base44.entities.Messages.list('-created_date', 25),
    ]);
    setAppointments(appts || []);
    setReminders(reminderRows || []);
    setRides(rideRows || []);
    setMessages(messageRows || []);
  };

  useEffect(() => { loadData(); }, []);

  const enriched = useMemo(() => appointments.map((item) => {
    const linkedRide = rides.find((ride) => ride.appointment_id === item.id || ride.appointment === item.title);
    return {
      ...item,
      dayLabel: item.day || dayFromDate(item.appointment_date),
      urgency: item.status === 'missed' ? 'missed' : statusForDate(item.appointment_date),
      ride_status: linkedRide?.status || (item.transportation_needed ? 'needed' : 'not needed'),
      reminder_status: reminders.some((reminder) => reminder.appointment_id === item.id || reminder.title === item.title) ? 'On' : (item.reminder_status || 'Needs setup'),
    };
  }), [appointments, reminders, rides]);

  const todayLabel = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  const nextUp = enriched.find((item) => item.urgency === 'today' && item.status !== 'confirmed') || enriched[0];
  const recentUnread = messages.filter((message) => !message.read).length;

  const confirmAppointment = async (appointment) => {
    if (!appointment?.id) return;
    const data = { status: 'confirmed', confirmed_at: new Date().toISOString() };
    await base44.entities.Appointments.update(appointment.id, data);
    await base44.entities.CounselorTasks.create({ client_id: appointment.client_id, plan_id: appointment.plan_id, title: `${appointment.title} confirmed by client`, category: 'appointment_confirmation', due_text: 'Review client confirmation', status: 'open', confirmed: true });
    setAppointments((prev) => prev.map((item) => item.id === appointment.id ? { ...item, ...data } : item));
  };

  const cancelAppointment = async (appointment) => {
    await base44.entities.Appointments.update(appointment.id, { status: 'cancelled' });
    setAppointments((prev) => prev.map((item) => item.id === appointment.id ? { ...item, status: 'cancelled' } : item));
    setModal(null);
  };

  const saveAppointmentEdit = async () => {
    await base44.entities.Appointments.update(selected.id, selected);
    setAppointments((prev) => prev.map((item) => item.id === selected.id ? selected : item));
    setModal(null);
  };

  const saveReminder = async () => {
    if (!reminderForm.title.trim()) return;
    const saved = await base44.entities.Reminders.create(reminderForm);
    setReminders((prev) => [saved, ...prev]);
    setReminderForm(blankReminder);
    setModal(null);
  };

  const openRide = (appointment = null) => {
    setRideForm({ ...blankRide, appointment: appointment?.title || '', appointment_id: appointment?.id || '', destination: appointment?.location || '', pickup_time: appointment?.time || '' });
    setModal('ride');
  };

  const saveRide = async () => {
    if (!rideForm.appointment.trim()) return;
    const saved = await base44.entities.TransportationRequests.create({ ...rideForm, status: 'requested' });
    setRides((prev) => [saved, ...prev]);
    setModal(null);
  };

  const sendMessage = async () => {
    if (!messageText.trim()) return;
    const saved = await base44.entities.Messages.create({ sender_role: 'client', message: messageText, read: false, related_appointment_id: selected?.id });
    setMessages((prev) => [saved, ...prev]);
    setMessageText('');
    setModal(null);
  };

  const openDetail = (appointment) => {
    setSelected(appointment);
    setModal('detail');
  };

  return (
    <section className="rounded-[38px] border border-white/12 bg-gradient-to-br from-white/14 via-blue-400/10 to-emerald-400/10 p-5 shadow-2xl backdrop-blur-2xl">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-200">This Week’s Recovery Itinerary</p>
          <h2 className="mt-2 font-sans text-3xl font-black tracking-tight">Here is what I have to do this week.</h2>
          <p className="mt-2 text-sm font-bold text-slate-300">{todayLabel}</p>
        </div>
        <button onClick={() => setModal('calendar')} className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-3xl bg-white px-5 font-black text-slate-950 active:scale-95 transition"><CalendarDays className="h-5 w-5" />View Full Calendar</button>
      </div>

      {appointments.length === 0 ? (
        <div className="rounded-[30px] border border-white/10 bg-white/8 p-5 text-center text-sm font-bold text-slate-300">Your weekly plan is being built. Once your counselor adds your aftercare plan, your schedule will appear here.</div>
      ) : nextUp && (
        <div className="mb-5 rounded-[30px] border border-blue-200/20 bg-white/12 p-4">
          <p className="mb-2 text-xs font-black uppercase tracking-wider text-blue-100">Next Up</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button onClick={() => openDetail(nextUp)} className="min-h-0 rounded-none bg-transparent p-0 text-left shadow-none before:hidden">
              <h3 className="font-sans text-xl font-black text-white">{nextUp.title}</h3>
              <p className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-300"><Clock className="h-4 w-4" />{nextUp.dayLabel} · {nextUp.time || 'Needs time'}<MapPin className="h-4 w-4" />{nextUp.location || nextUp.virtual_link || 'Location pending'}</p>
            </button>
            <button onClick={() => confirmAppointment(nextUp)} className="rounded-3xl bg-emerald-300 px-5 py-3 font-black text-slate-950 active:scale-95 transition"><CheckCircle2 className="mr-2 inline h-5 w-5" />Confirm Appointment</button>
          </div>
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
          const dayItems = enriched.filter((item) => item.dayLabel === day);
          return (
            <div key={day} className="rounded-[26px] border border-white/10 bg-white/8 p-3">
              <p className="mb-3 font-sans text-sm font-black text-white">{day}</p>
              <div className="space-y-2">
                {dayItems.length === 0 ? <p className="rounded-2xl bg-white/6 p-3 text-xs text-slate-400">No scheduled items</p> : dayItems.map((item) => (
                  <button key={item.id} onClick={() => openDetail(item)} className={`min-h-0 w-full rounded-2xl border p-3 text-left shadow-none before:hidden active:scale-[0.98] ${urgencyStyles[item.urgency]}`}>
                    <p className="text-sm font-black">{item.title}</p>
                    <p className="mt-1 text-xs opacity-90">{item.time || 'Needs time review'}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs opacity-80">{item.virtual_link ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}{item.location || item.virtual_link || 'Location pending'}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="rounded-full bg-white/12 px-2 py-1 text-[10px] font-black"><Bell className="mr-1 inline h-3 w-3" />{item.reminder_status}</span>
                      <span className="rounded-full bg-white/12 px-2 py-1 text-[10px] font-black"><Bus className="mr-1 inline h-3 w-3" />{item.ride_status}</span>
                      {item.checkin_required && <span className="rounded-full bg-white/12 px-2 py-1 text-[10px] font-black">Check-in required</span>}
                      {item.status === 'confirmed' && <span className="rounded-full bg-emerald-300/20 px-2 py-1 text-[10px] font-black text-emerald-100">Confirmed</span>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-4">
        <button onClick={() => openRide(nextUp)} className="rounded-3xl bg-white/10 px-4 py-3 text-sm font-black text-slate-100 active:scale-95 transition"><Bus className="mr-2 inline h-4 w-4" />Need a Ride?</button>
        <button onClick={() => setModal('message')} className="rounded-3xl bg-white/10 px-4 py-3 text-sm font-black text-slate-100 active:scale-95 transition"><MessageCircle className="mr-2 inline h-4 w-4" />Message Counselor {recentUnread > 0 && `(${recentUnread})`}</button>
        <button onClick={() => setModal('reminder')} className="rounded-3xl bg-white/10 px-4 py-3 text-sm font-black text-slate-100 active:scale-95 transition"><Plus className="mr-2 inline h-4 w-4" />Add Reminder</button>
        <button onClick={() => nextUp && confirmAppointment(nextUp)} disabled={!nextUp} className="rounded-3xl bg-white px-4 py-3 text-sm font-black text-slate-950 active:scale-95 transition disabled:opacity-50">Confirm Appointment</button>
      </div>

      {modal === 'calendar' && <Modal title="Full Calendar" onClose={() => setModal(null)}>
        <div className="mb-4 grid grid-cols-2 gap-2"><button onClick={() => setCalendarMode('weekly')} className={`rounded-2xl px-4 py-3 font-black ${calendarMode === 'weekly' ? 'bg-white text-slate-950' : 'bg-white/10 text-white'}`}>Weekly</button><button onClick={() => setCalendarMode('monthly')} className={`rounded-2xl px-4 py-3 font-black ${calendarMode === 'monthly' ? 'bg-white text-slate-950' : 'bg-white/10 text-white'}`}>Monthly</button></div>
        <div className="space-y-2">{enriched.map((item) => <button key={item.id} onClick={() => openDetail(item)} className="w-full rounded-2xl bg-white/8 p-4 text-left"><p className="font-black text-white">{item.title}</p><p className="text-sm text-slate-300">{calendarMode === 'monthly' ? item.appointment_date : item.dayLabel} · {item.time}</p></button>)}</div>
      </Modal>}

      {modal === 'reminder' && <Modal title="Add Reminder" onClose={() => setModal(null)}>
        <div className="grid gap-3 sm:grid-cols-2"><input placeholder="Title" value={reminderForm.title} onChange={(e) => setReminderForm({ ...reminderForm, title: e.target.value })} /><input type="date" value={reminderForm.reminder_date} onChange={(e) => setReminderForm({ ...reminderForm, reminder_date: e.target.value })} /><input type="time" value={reminderForm.time} onChange={(e) => setReminderForm({ ...reminderForm, time: e.target.value })} /><select value={reminderForm.repeat} onChange={(e) => setReminderForm({ ...reminderForm, repeat: e.target.value })}><option value="none">No repeat</option><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option></select><select value={reminderForm.priority} onChange={(e) => setReminderForm({ ...reminderForm, priority: e.target.value })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select><textarea placeholder="Notes" value={reminderForm.notes} onChange={(e) => setReminderForm({ ...reminderForm, notes: e.target.value })} /></div><button onClick={saveReminder} className="mt-4 w-full rounded-3xl bg-white py-4 font-black text-slate-950">Save Reminder</button>
      </Modal>}

      {modal === 'ride' && <Modal title="Need a Ride?" onClose={() => setModal(null)}>
        <div className="grid gap-3 sm:grid-cols-2"><input placeholder="Appointment" value={rideForm.appointment} onChange={(e) => setRideForm({ ...rideForm, appointment: e.target.value })} /><input placeholder="Pickup address" value={rideForm.pickup_address} onChange={(e) => setRideForm({ ...rideForm, pickup_address: e.target.value })} /><input placeholder="Destination" value={rideForm.destination} onChange={(e) => setRideForm({ ...rideForm, destination: e.target.value })} /><input type="time" value={rideForm.pickup_time} onChange={(e) => setRideForm({ ...rideForm, pickup_time: e.target.value })} /><select value={rideForm.ride_type} onChange={(e) => setRideForm({ ...rideForm, ride_type: e.target.value })}><option>Bus pass / route help</option><option>Facility ride</option><option>Peer ride</option><option>Rideshare support</option></select><textarea placeholder="Notes" value={rideForm.notes} onChange={(e) => setRideForm({ ...rideForm, notes: e.target.value })} /></div><button onClick={saveRide} className="mt-4 w-full rounded-3xl bg-white py-4 font-black text-slate-950">Submit Ride Request</button>
      </Modal>}

      {modal === 'message' && <Modal title="Message Counselor" onClose={() => setModal(null)}>
        <div className="mb-3 max-h-56 space-y-2 overflow-auto">{messages.map((message) => <div key={message.id} className="rounded-2xl bg-white/8 p-3 text-sm text-slate-200">{message.message}</div>)}</div><textarea placeholder="Type your message..." value={messageText} onChange={(e) => setMessageText(e.target.value)} className="w-full" /><button onClick={sendMessage} className="mt-4 w-full rounded-3xl bg-white py-4 font-black text-slate-950">Send Message</button>
      </Modal>}

      {modal === 'detail' && selected && <Modal title="Appointment Details" onClose={() => setModal(null)}>
        <div className="grid gap-3 sm:grid-cols-2"><input value={selected.title || ''} onChange={(e) => setSelected({ ...selected, title: e.target.value })} /><input type="date" value={selected.appointment_date || ''} onChange={(e) => setSelected({ ...selected, appointment_date: e.target.value, day: dayFromDate(e.target.value) })} /><input value={selected.time || ''} onChange={(e) => setSelected({ ...selected, time: e.target.value })} /><input value={selected.location || ''} onChange={(e) => setSelected({ ...selected, location: e.target.value })} /><textarea value={selected.notes || ''} onChange={(e) => setSelected({ ...selected, notes: e.target.value })} placeholder="Notes" /><div className="rounded-2xl bg-white/8 p-3 text-sm text-slate-200">Reminder: {selected.reminder_status}<br />Ride: {selected.ride_status}<br />Check-in: {selected.checkin_required ? 'Required' : 'Not required'}</div></div><div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4"><button onClick={saveAppointmentEdit} className="rounded-2xl bg-white px-3 py-3 font-black text-slate-950">Edit</button><button onClick={() => cancelAppointment(selected)} className="rounded-2xl bg-rose-400/20 px-3 py-3 font-black text-rose-100">Cancel</button><button onClick={() => confirmAppointment(selected)} className="rounded-2xl bg-emerald-300 px-3 py-3 font-black text-slate-950">Confirm</button><button onClick={() => openRide(selected)} className="rounded-2xl bg-white/10 px-3 py-3 font-black text-white">Ride</button></div>
      </Modal>}
    </section>
  );
}