import React, { useEffect, useState } from 'react';
import { CalendarCheck, ExternalLink, LogIn } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const CONNECTOR_ID = '6a10000a555f71fe414b9434';

export default function GoogleCalendarSyncPanel() {
  const [authed, setAuthed] = useState(false);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkConnection = async () => {
    try {
      await base44.functions.invoke('syncSeeCalendar', { calendarEvents: [], tasks: [], syncShared: false, syncPersonal: true });
      setConnected(true);
    } catch (_error) {
      setConnected(false);
    }
  };

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (isAuthed) => {
      setAuthed(isAuthed);
      if (isAuthed) await checkConnection();
      setLoading(false);
    });
  }, []);

  const connect = async () => {
    const url = await base44.connectors.connectAppUser(CONNECTOR_ID);
    const popup = window.open(url, '_blank');
    const timer = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(timer);
        checkConnection();
      }
    }, 500);
  };

  if (loading) return null;

  return (
    <section className="rounded-[30px] border border-emerald-300/20 bg-emerald-400/10 p-5 shadow-xl backdrop-blur-2xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-300/15 text-emerald-100"><CalendarCheck className="h-6 w-6" /></div>
          <div>
            <p className="text-sm font-black text-emerald-100">Google Calendar Sync</p>
            <p className="text-sm text-slate-300">Plans sync to the facility calendar. Connect personal calendar for client-specific sync.</p>
          </div>
        </div>
        {!authed ? (
          <button onClick={() => base44.auth.redirectToLogin()} className="inline-flex items-center justify-center gap-2 rounded-3xl bg-white px-5 py-3 font-black text-slate-950"><LogIn className="h-4 w-4" />Log in</button>
        ) : connected ? (
          <span className="rounded-full bg-emerald-300/20 px-4 py-2 text-sm font-black text-emerald-100">Personal calendar connected</span>
        ) : (
          <button onClick={connect} className="inline-flex items-center justify-center gap-2 rounded-3xl bg-white px-5 py-3 font-black text-slate-950"><ExternalLink className="h-4 w-4" />Connect personal calendar</button>
        )}
      </div>
    </section>
  );
}