import React, { useState } from 'react';
import { Crosshair, Search } from 'lucide-react';

export default function ResourceLocationPrompt({ onSetLocation }) {
  const [manual, setManual] = useState('');
  const [error, setError] = useState('');

  const useCurrentLocation = () => {
    setError('');
    if (!navigator.geolocation) {
      setError('Location access is not available in this browser. Search by ZIP or city instead.');
      return;
    }
    navigator.geolocation.getCurrentPosition((pos) => {
      onSetLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude, label: 'Current location' });
    }, () => setError('Location access is off. Search by ZIP code, city, or state instead.'));
  };

  const useManual = () => {
    if (!manual.trim()) return;
    onSetLocation({ label: manual.trim(), query: manual.trim() });
  };

  return (
    <section className="rounded-[34px] border border-white/12 bg-white/10 p-5 shadow-2xl backdrop-blur-2xl">
      <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-200/80">Find help near you</p>
      <h2 className="mt-2 font-sans text-3xl font-black text-white">Where should we search?</h2>
      <div className="mt-5 grid gap-3">
        <button onClick={useCurrentLocation} className="flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-4 font-black text-slate-950"><Crosshair className="h-5 w-5" /> Current location</button>
      </div>
      <div className="mt-3 flex gap-2">
        <input value={manual} onChange={(e) => setManual(e.target.value)} placeholder="Enter city, ZIP code, or address" className="min-w-0 flex-1" />
        <button onClick={useManual} className="rounded-2xl bg-blue-400 px-4 font-black text-slate-950"><Search className="h-5 w-5" /></button>
      </div>
      {error && <p className="mt-3 rounded-2xl border border-amber-200/25 bg-amber-300/10 p-3 text-sm font-bold text-amber-100">{error}</p>}
    </section>
  );
}