import React, { useRef, useState } from "react";
import { HeartHandshake, MessageCircle, Phone, Play, Shield, X } from "lucide-react";

export default function EmergencyCalmMode() {
  const [open, setOpen] = useState(false);
  const audioRef = useRef(null);

  const playTone = () => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 174;
    gain.gain.value = 0.035;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    audioRef.current = { ctx, osc };
  };

  const close = () => {
    audioRef.current?.osc?.stop();
    audioRef.current?.ctx?.close();
    audioRef.current = null;
    setOpen(false);
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="fixed right-4 bottom-24 z-[70] btn-primary min-h-0 py-3 px-5 shadow-[var(--glow)] active:scale-100">Need a reset?</button>
      {open && (
        <div className="fixed inset-0 z-[90] bg-black/55 backdrop-blur-xl flex items-center justify-center p-4">
          <section className="card-glow max-w-2xl w-full p-6 md:p-8 text-center relative">
            <button onClick={close} className="absolute right-4 top-4 text-[var(--text-muted)]"><X className="w-5 h-5" /></button>
            <HeartHandshake className="w-10 h-10 text-[var(--accent)] mx-auto" />
            <h2 className="text-3xl font-serif font-semibold text-[var(--text)] mt-4">You are here. You are breathing. This moment can pass.</h2>
            <div className="mx-auto my-8 w-44 h-44 rounded-full border border-[var(--border-glow)] flex items-center justify-center calm-breathe"><span className="text-sm font-black uppercase tracking-[.2em] text-[var(--text-muted)]">Breathe</span></div>
            <div className="grid md:grid-cols-2 gap-3 text-left text-sm text-[var(--text-muted)]">
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4"><Shield className="mb-2 h-5 w-5 text-emerald-300" />Name 5 things you can see, 4 you can feel, 3 you can hear, 2 you can smell, 1 thing you can control.</div>
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4"><HeartHandshake className="mb-2 h-5 w-5 text-blue-200" />You are not failing. You are having a hard moment. The next right step is smaller than the whole problem.</div>
              <a href="tel:988" className="rounded-2xl bg-white/5 border border-white/10 p-4 text-[var(--text-muted)] no-underline"><Phone className="mb-2 h-5 w-5 text-rose-200" />Call or text 988 if you may hurt yourself or someone else. Call emergency services for immediate danger.</a>
              <a href="/InnerCircle" className="rounded-2xl bg-white/5 border border-white/10 p-4 text-[var(--text-muted)] no-underline"><MessageCircle className="mb-2 h-5 w-5 text-[var(--gold)]" />Open your support circle and message your mentor, sponsor, counselor, or safe contact.</a>
            </div>
            <button onClick={playTone} className="btn-ghost mt-5 inline-flex items-center gap-2"><Play className="w-4 h-4" /> Play calming tone</button>
          </section>
          <style>{`.calm-breathe{animation:calmBreath 6s ease-in-out infinite;box-shadow:0 0 70px rgba(91,141,239,.28)}@keyframes calmBreath{0%,100%{transform:scale(.88)}50%{transform:scale(1.08)}}`}</style>
        </div>
      )}
    </>
  );
}