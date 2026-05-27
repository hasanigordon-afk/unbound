import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bot, CalendarDays, Car, Loader2, MapPinned, MessageCircle, Send, Target, Users } from 'lucide-react';
import PilotShell from '@/components/pilot/PilotShell';
import { QUICK_ACTIONS } from '@/components/aistein/aiSteinConfig';
import { askAIStein } from '@/components/aistein/aiSteinBrain';
import { useCurrentUser } from '@/lib/useCurrentUser';

export default function AICompanion() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useCurrentUser();
  const [query, setQuery] = useState('Find meetings tonight near me');
  const [response, setResponse] = useState(null);
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('rezilient_ai_memory') || '[]'));
  const [loading, setLoading] = useState(false);

  const examples = useMemo(() => [
    { title: 'Help me stay focused', icon: Target, prompt: 'What is one clear next step for today?' },
    { title: 'Find transportation', icon: Car, prompt: 'Show transportation help for appointments.' },
    { title: 'Find meetings tonight', icon: Users, prompt: 'Find recovery meetings tonight.' },
    { title: 'Organize my week', icon: CalendarDays, prompt: 'Help organize appointments, goals, reminders, and tasks this week.' },
    { title: 'Find local help', icon: MapPinned, prompt: 'Find food, housing, employment, and legal support nearby.' },
    { title: 'Help me calm down', icon: MessageCircle, prompt: 'Help me calm down right now.' },
    { title: 'Ask anything', icon: Bot, prompt: 'What should I do next?' },
  ], []);

  const submit = async (nextQuery = query) => {
    const text = nextQuery.trim();
    if (!text || loading) return;
    setQuery(text);
    setLoading(true);
    const result = await askAIStein({ query: text, user, context: { currentPath: location.pathname, priorRequests: history.slice(0, 5).map((item) => item.query).join(' | ') } });
    setResponse(result);
    const nextHistory = [{ query: text, route: result.route, created_at: new Date().toISOString() }, ...history].slice(0, 12);
    setHistory(nextHistory);
    localStorage.setItem('rezilient_ai_memory', JSON.stringify(nextHistory));
    setLoading(false);
  };

  return (
    <PilotShell title="Ask ReZilient AI" subtitle="Context-aware support for resources, calm, meetings, employment, transportation, and structure.">
      <div className="space-y-5">
        <section className="rounded-[36px] border border-amber-200/20 bg-amber-300/10 p-5 shadow-2xl backdrop-blur-2xl">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-100">S.E.E. AI Engine</p>
          <h2 className="mt-2 font-sans text-3xl font-black text-white">Structure. Engagement. Empowerment.</h2>
          <p className="mt-2 text-sm font-bold text-slate-300">Ask in plain language. ReZilient AI routes you into working app flows instead of dead answers.</p>
          <div className="mt-5 rounded-[28px] border border-white/12 bg-white/10 p-3">
            <textarea value={query} onChange={(event) => setQuery(event.target.value)} className="min-h-[120px] w-full border-0 bg-transparent p-3 text-base" />
            <button onClick={() => submit()} disabled={loading} className="btn-primary mt-3 inline-flex items-center gap-2 disabled:opacity-60">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Ask ReZilient AI
            </button>
          </div>
        </section>

        {response && (
          <section className="rounded-[34px] border border-white/12 bg-white/10 p-5 shadow-xl backdrop-blur-2xl">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-200/70">Response</p>
            <p className="mt-3 text-base font-bold leading-relaxed text-white">{response.message}</p>
            {response.steps?.length > 0 && <div className="mt-4 grid gap-2">{response.steps.map((step) => <p key={step} className="rounded-2xl bg-white/8 p-3 text-sm font-bold text-slate-200">{step}</p>)}</div>}
            {response.route && <button onClick={() => navigate(response.route)} className="btn-gold mt-4">Open recommended action</button>}
          </section>
        )}

        <section className="grid gap-4 md:grid-cols-2">
          {examples.map(({ title, icon: Icon, prompt }) => (
            <button key={title} onClick={() => submit(prompt)} className="rounded-[30px] border border-white/12 bg-white/10 p-5 text-left shadow-xl backdrop-blur-2xl">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/14"><Icon className="h-6 w-6 text-white" /></div>
              <h3 className="font-sans text-xl font-black text-white">{title}</h3>
              <p className="mt-2 text-sm font-bold text-slate-300">{prompt}</p>
            </button>
          ))}
        </section>

        <section className="rounded-[34px] border border-white/12 bg-white/10 p-5 shadow-xl backdrop-blur-2xl">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-200/70">Quick actions</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {QUICK_ACTIONS.map((action) => <Link key={action.key} to={action.route} className="rounded-full border border-white/10 bg-white/10 px-4 py-3 text-sm font-black text-white">{action.emoji} {action.label}</Link>)}
          </div>
        </section>
      </div>
    </PilotShell>
  );
}