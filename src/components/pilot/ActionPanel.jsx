import React, { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { readLocalList, writeLocalList } from './PrototypeStore';

const storageKeys = {
  'Daily Check-In': 'rez_daily_checkins',
  Journaling: 'rez_journal_entries',
  Goals: 'rez_goals',
  'Daily reminders': 'rez_reminders',
  Meetings: 'rez_meetings',
  'Aftercare Plan': 'rez_aftercare_plans',
  'Resource Save': 'rez_saved_resources',
};

export default function ActionPanel({ action, onBack }) {
  const { user: authUser } = useAuth();
  const key = storageKeys[action?.title] || `rez_${action?.title?.toLowerCase().replaceAll(' ', '_')}`;
  const localKey = authUser?.email ? `${key}:${authUser.email}` : key;
  const fallbackSaved = action?.sample ? [action.sample] : [];
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(() => readLocalList(localKey, fallbackSaved));
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const loadSaved = async () => {
    const localSaved = readLocalList(localKey, fallbackSaved);
    if (!authUser?.email) {
      setSaved(localSaved);
      return;
    }
    try {
      const rows = await base44.entities.HomeModuleActivity.filter({ module_key: key, user_email: authUser.email, action_type: 'saved' }, '-created_date', 50);
      setSaved(rows.length ? rows.map((row) => ({ title: row.note || row.module_title, date: row.created_at_text || row.created_date })) : localSaved);
    } catch {
      setSaved(localSaved);
    }
  };

  useEffect(() => {
    loadSaved();
  }, [key, localKey, authUser?.email]);

  const save = async () => {
    setLoading(true);
    const item = { title: text || action?.defaultText || action?.title, date: new Date().toLocaleString() };
    try {
      if (authUser?.email) {
        await base44.entities.HomeModuleActivity.create({
          module_key: key,
          user_email: authUser.email,
          section_title: action?.type || 'Profile hub',
          module_title: action?.title,
          action_type: 'saved',
          created_at_text: item.date,
          note: item.title,
        });
      }
      const next = [item, ...saved];
      setSaved(next);
      writeLocalList(localKey, next);
      setText('');
      setSuccess('Saved successfully');
      setTimeout(() => setSuccess(''), 1800);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-[34px] border border-white/12 bg-white/10 p-5 shadow-2xl backdrop-blur-2xl">
      <button onClick={onBack} className="mb-4 inline-flex min-h-0 items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-black text-white">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-200/80">{action?.type || 'Action'}</p>
      <h2 className="mt-2 font-sans text-3xl font-black text-white">{action?.title}</h2>
      <p className="mt-2 text-sm font-bold leading-relaxed text-slate-300">{action?.description}</p>

      {action?.options?.length > 0 && (
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {action.options.map((option) => (
            <button key={option} onClick={() => setText(option)} className="min-h-[52px] rounded-2xl border border-white/10 bg-white/10 px-4 text-sm font-black text-white active:scale-95">
              {option}
            </button>
          ))}
        </div>
      )}

      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={action?.placeholder || 'Write a note or save this item...'} className="mt-4 min-h-[120px] w-full" />
      <button onClick={save} disabled={loading} className="btn-primary mt-4 inline-flex items-center gap-2 disabled:opacity-60">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Save
      </button>
      {success && <p className="mt-3 rounded-2xl border border-emerald-300/30 bg-emerald-400/10 px-4 py-3 text-sm font-black text-emerald-100">{success}</p>}

      <div className="mt-5 space-y-2">
        <h3 className="font-sans text-lg font-black text-white">Saved</h3>
        {saved.map((item, index) => (
          <div key={`${item.date}-${index}`} className="rounded-2xl border border-white/10 bg-white/8 p-3">
            <p className="text-sm font-black text-white">{item.title}</p>
            <p className="text-xs font-bold text-slate-400">{item.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
}