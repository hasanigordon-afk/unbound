import React, { useRef, useState } from "react";
import { HeartHandshake, LifeBuoy, MessageCircle, Phone, Play, ShieldCheck, Sparkles, X } from "lucide-react";

const groundingSteps = [
  "Name 5 things you can see.",
  "Name 4 things you can feel.",
  "Name 3 things you can hear.",
  "Name 2 things you can smell.",
  "Name 1 next right action you can take.",
];

const contacts = [
  { label: "Emergency", detail: "Call 911", href: "tel:911", icon: Phone, urgent: true },
  { label: "988 Lifeline", detail: "Call or text 988", href: "tel:988", icon: LifeBuoy, urgent: true },
  { label: "Sponsor / mentor", detail: "Open support chat", href: "/InnerCircle", icon: MessageCircle },
];

export default function EmergencyCalmMode() {
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  const playTone = () => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    audioRef.current?.osc?.stop();
    audioRef.current?.ctx?.close();
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 174;
    gain.gain.setValueAtTime(0.025, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.045, ctx.currentTime + 2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    audioRef.current = { ctx, osc };
    setPlaying(true);
  };

  const close = () => {
    audioRef.current?.osc?.stop();
    audioRef.current?.ctx?.close();
    audioRef.current = null;
    setPlaying(false);
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed right-4 bottom-24 z-[70] min-h-0 rounded-full border border-rose-100/40 bg-gradient-to-br from-rose-400 to-amber-300 px-5 py-3 text-sm font-black text-slate-950 shadow-[0_0_34px_rgba(251,113,133,.45)] transition active:scale-95"
        aria-label="Open panic support"
      >
        Panic
      </button>
      {open && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/65 p-3 backdrop-blur-xl sm:items-center">
          <section className="card-glow relative max-h-[92vh] w-full max-w-3xl overflow-y-auto p-5 text-center sm:p-7">
            <button onClick={close} className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 p-0 text-slate-300" aria-label="Close panic support">
              <X className="h-5 w-5" />
            </button>
            <HeartHandshake className="mx-auto h-11 w-11 text-amber-200" />
            <p className="mt-4 text-xs font-black uppercase tracking-[0.26em] text-blue-200">You are not alone</p>
            <h2 className="mx-auto mt-2 max-w-2xl font-sans text-3xl font-black leading-tight text-white sm:text-5xl">
              Breathe. Get safe. Take the next right step.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm font-bold leading-relaxed text-slate-300">
              This is immediate support for overwhelming moments. If you may hurt yourself or someone else, call emergency services now.
            </p>

            <div className="mx-auto my-7 flex h-44 w-44 items-center justify-center rounded-full border border-blue-200/30 bg-blue-300/10 calm-breathe">
              <span className="text-sm font-black uppercase tracking-[0.24em] text-blue-100">Breathe</span>
            </div>

            <div className="grid gap-3 text-left md:grid-cols-3">
              <div className="rounded-[26px] border border-white/10 bg-white/8 p-4">
                <Sparkles className="h-5 w-5 text-amber-200" />
                <p className="mt-3 font-black text-white">Encouragement</p>
                <p className="mt-1 text-sm font-bold leading-relaxed text-slate-300">This feeling is loud, but it is not forever. You have survived hard moments before.</p>
              </div>
              <div className="rounded-[26px] border border-white/10 bg-white/8 p-4 md:col-span-2">
                <ShieldCheck className="h-5 w-5 text-emerald-200" />
                <p className="mt-3 font-black text-white">Grounding technique</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-5">
                  {groundingSteps.map((step) => (
                    <div key={step} className="rounded-2xl bg-white/8 p-3 text-xs font-bold leading-relaxed text-slate-200">{step}</div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {contacts.map((contact) => {
                const Icon = contact.icon;
                return (
                  <a key={contact.label} href={contact.href} className={`rounded-[24px] border p-4 text-left transition hover:-translate-y-1 ${contact.urgent ? 'border-rose-200/25 bg-rose-300/15' : 'border-white/10 bg-white/8'}`}>
                    <Icon className="h-5 w-5 text-white" />
                    <p className="mt-3 font-black text-white">{contact.label}</p>
                    <p className="text-sm font-bold text-slate-300">{contact.detail}</p>
                  </a>
                );
              })}
            </div>

            <button onClick={playTone} className="btn-gold mt-5 inline-flex min-h-[58px] items-center gap-2 px-7 text-sm">
              <Play className="h-4 w-4" />
              {playing ? "Calming tone playing" : "Play calming music"}
            </button>
          </section>
          <style>{`.calm-breathe{animation:calmBreath 6s ease-in-out infinite;box-shadow:0 0 70px rgba(91,141,239,.30)}@keyframes calmBreath{0%,100%{transform:scale(.88)}50%{transform:scale(1.08)}}`}</style>
        </div>
      )}
    </>
  );
}
