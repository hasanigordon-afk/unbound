import React, { useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import ReZilientLogo from '@/components/shared/ReZilientLogo';

export default function ReZilientWelcomeIntro({ onContinue }) {
  const [soundOn, setSoundOn] = useState(false);
  const audioRef = useRef(null);

  const toggleSound = () => {
    if (soundOn) {
      audioRef.current?.oscillator?.stop();
      audioRef.current?.context?.close();
      audioRef.current = null;
      setSoundOn(false);
      return;
    }

    const context = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = 174;
    gain.gain.value = 0.025;
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    audioRef.current = { context, oscillator };
    setSoundOn(true);
  };

  return (
    <section className="relative mb-5 overflow-hidden rounded-[38px] border border-white/12 bg-gradient-to-br from-[#07101f] via-[#0d1b34] to-[#102416] p-6 shadow-2xl backdrop-blur-2xl">
      <div className="welcome-light absolute -left-20 top-0 h-52 w-52 rounded-full bg-blue-300/20 blur-3xl" />
      <div className="welcome-light-delayed absolute -right-24 bottom-0 h-60 w-60 rounded-full bg-emerald-300/16 blur-3xl" />

      <div className="relative z-10 flex min-h-[430px] flex-col items-center justify-center text-center">
        <div className="welcome-logo mb-8 flex h-28 w-28 items-center justify-center rounded-[34px] border border-white/15 bg-white/10 shadow-2xl">
          <ReZilientLogo className="h-24 w-24" rounded="rounded-[30px]" />
        </div>

        <div className="space-y-3">
          <p className="welcome-line-1 text-sm font-black uppercase tracking-[0.28em] text-blue-200">Welcome to ReZilient</p>
          <h1 className="welcome-line-2 font-sans text-4xl font-black leading-tight text-white sm:text-5xl">You survived the fire.</h1>
          <p className="welcome-line-3 text-2xl font-black text-slate-100">Now it's time to rebuild.</p>
          <div className="welcome-line-4 pt-3 text-lg font-bold leading-relaxed text-slate-300">
            <p>Your goals.</p>
            <p>Your support.</p>
            <p>Your comeback.</p>
          </div>
          <p className="welcome-line-5 pt-2 text-xl font-black text-emerald-100">Let's move forward.</p>
        </div>

        <div className="welcome-actions mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <button onClick={onContinue} className="min-h-[48px] rounded-full border border-emerald-200/40 bg-emerald-300/90 px-8 text-sm font-black text-slate-950 shadow-[0_0_32px_rgba(110,231,183,0.35)] active:scale-95 transition">
            Continue
          </button>
          <button onClick={toggleSound} className="min-h-[48px] rounded-full border border-white/12 bg-white/10 px-5 text-sm font-black text-white active:scale-95 transition">
            {soundOn ? <Volume2 className="mr-2 inline h-4 w-4" /> : <VolumeX className="mr-2 inline h-4 w-4" />}
            Ambient sound
          </button>
        </div>

        <p className="welcome-footer mt-8 text-xs font-black tracking-[0.22em] text-slate-400">Help • Hope • Healing</p>
      </div>

      <style>{`
        .welcome-logo { opacity: 0; animation: welcomeFade 1.8s ease forwards; }
        .welcome-line-1 { opacity: 0; animation: welcomeUp .8s ease forwards .45s; }
        .welcome-line-2 { opacity: 0; animation: welcomeUp .8s ease forwards 1.05s; }
        .welcome-line-3 { opacity: 0; animation: welcomeUp .8s ease forwards 1.65s; }
        .welcome-line-4 { opacity: 0; animation: welcomeUp .8s ease forwards 2.25s; }
        .welcome-line-5 { opacity: 0; animation: welcomeUp .8s ease forwards 2.85s; }
        .welcome-actions { opacity: 0; animation: welcomeUp .8s ease forwards 3.35s; }
        .welcome-footer { opacity: 0; animation: welcomeFade .8s ease forwards 3.7s; }
        .welcome-light { animation: welcomeDrift 9s ease-in-out infinite alternate; }
        .welcome-light-delayed { animation: welcomeDrift 11s ease-in-out infinite alternate-reverse; }
        @keyframes welcomeFade { to { opacity: 1; } }
        @keyframes welcomeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes welcomeDrift { from { transform: translate3d(0, 0, 0) scale(1); } to { transform: translate3d(38px, 18px, 0) scale(1.16); } }
      `}</style>
    </section>
  );
}