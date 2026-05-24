import React, { useRef, useState } from "react";
import { LifeBuoy, MessageCircle, Phone, Play, ShieldCheck, X } from "lucide-react";

const supportActions = [
  { label: "Call 988", detail: "Immediate crisis support", href: "tel:988", icon: Phone },
  { label: "Text mentor", detail: "Open support circle", href: "/InnerCircle", icon: MessageCircle },
  { label: "Grounding", detail: "5-4-3-2-1 reset", href: "/ResetButton", icon: ShieldCheck },
];

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
      <button
        onClick={() => setOpen(true)}
        className="fixed right-4 bottom-24 z-[70] min-h-0 rounded-full border border-amber-100/40 bg-gradient-to-br from-amber-200 via-rose-300 to-amber-400 px-5 py-3 text-sm font-black text-slate-950 shadow-[0_0_34px_rgba(240,183,83,.38)] transition active:scale-95"
      >
        Calm
      </button>
      {open && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/65 p-3 backdrop-blur-xl sm:items-center">
          <section className="card-glow relative max-h-[92vh] w-full max-w-3xl overflow-y-auto p-5 text-center md:p-8">
            <button onClick={close} className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 p-0 text-[var(--text-muted)]"><X className="w-5 h-5" /></button>
            <LifeBuoy className="mx-auto h-10 w-10 text-amber-200" />
            <p className="mt-4 text-xs font-black uppercase tracking-[0.26em] text-blue-200">Emergency calm</p>
            <h2 className="mx-auto mt-2 max-w-2xl font-sans text-3xl font-black leading-tight text-white sm:text-5xl">You are here. You are breathing. This moment can pass.</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm font-bold leading-relaxed text-slate-300">Start with sound, slow your breath, ground your body, and reach a safe person. If there is immediate danger, call emergency services now.</p>
            <div className="mx-auto my-8 flex h-44 w-44 items-center justify-center rounded-full border border-amber-100/25 bg-amber-200/10 calm-breathe"><span className="text-sm font-black uppercase tracking-[.22em] text-amber-100">Breathe</span></div>
            <div className="grid gap-3 text-left md:grid-cols-3">
              <div className="rounded-[24px] border border-white/10 bg-white/8 p-4 text-sm font-bold leading-relaxed text-slate-300">
                Name 5 things you can see, 4 you can feel, 3 you can hear, 2 you can smell, 1 next action you can control.
              </div>
              {supportActions.map((action) => {
                const Icon = action.icon;
                return (
                  <a key={action.label} href={action.href} className="rounded-[24px] border border-white/10 bg-white/8 p-4 text-left transition hover:bg-white/12">
                    <Icon className="h-5 w-5 text-white" />
                    <p className="mt-3 font-black text-white">{action.label}</p>
                    <p className="text-sm font-bold text-slate-400">{action.detail}</p>
                  </a>
                );
              })}
            </div>
            <button onClick={playTone} className="btn-gold mt-5 inline-flex min-h-[58px] items-center gap-2 px-7 text-sm"><Play className="w-4 h-4" /> Play calming tone</button>
          </section>
          <style>{`.calm-breathe{animation:calmBreath 6s ease-in-out infinite;box-shadow:0 0 70px rgba(240,183,83,.24)}@keyframes calmBreath{0%,100%{transform:scale(.88)}50%{transform:scale(1.08)}}`}</style>
        </div>
      )}
    </>
  );
}