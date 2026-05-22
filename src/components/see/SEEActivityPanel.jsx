import React from 'react';
import { Clock3 } from 'lucide-react';
import SEEDataCard from './SEEDataCard';

export default function SEEActivityPanel({ logs }) {
  return (
    <SEEDataCard title="Activity Log" icon={Clock3}>
      <div className="space-y-3">
        {logs.length === 0 ? <p className="text-sm text-slate-300">No activity yet.</p> : logs.map((log) => (
          <div key={log.id} className="rounded-2xl bg-white/8 p-3">
            <p className="text-sm font-black text-white">{log.action_type}</p>
            <p className="mt-1 text-sm text-slate-300">{log.description}</p>
          </div>
        ))}
      </div>
    </SEEDataCard>
  );
}