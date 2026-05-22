import React from 'react';
import { UserPlus, Users } from 'lucide-react';

export default function SEEClientSelector({ clients, selectedClientId, setSelectedClientId, newClientName, setNewClientName, onCreateClient }) {
  return (
    <section className="rounded-[30px] border border-white/12 bg-white/10 p-5 shadow-xl backdrop-blur-2xl">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-blue-100">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-200">Client setup</p>
          <h2 className="font-sans text-xl font-black">Select or create client</h2>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
        <select value={selectedClientId} onChange={(event) => setSelectedClientId(event.target.value)} className="min-h-[56px] w-full rounded-[22px]">
          <option value="">Select client</option>
          {clients.map((client) => <option key={client.id} value={client.id}>{client.full_name}</option>)}
        </select>
        <input value={newClientName} onChange={(event) => setNewClientName(event.target.value)} placeholder="New client name" className="min-h-[56px] w-full rounded-[22px]" />
        <button onClick={onCreateClient} className="inline-flex min-h-[56px] items-center justify-center gap-2 rounded-[22px] bg-white px-5 font-black text-slate-950 shadow-xl active:scale-95 transition">
          <UserPlus className="h-5 w-5" /> Create
        </button>
      </div>
    </section>
  );
}