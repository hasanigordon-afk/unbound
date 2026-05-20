import React from 'react';
import { Share, PlusSquare, Smartphone, CheckCircle2 } from 'lucide-react';
import PilotShell from '@/components/pilot/PilotShell';

const steps = [
  { title: 'Open ReZilient in Safari', body: 'Use the Safari browser on iPhone for the best Add to Home Screen experience.', icon: Smartphone },
  { title: 'Tap the Share button', body: 'Look for the square share icon at the bottom of Safari.', icon: Share },
  { title: 'Choose Add to Home Screen', body: 'Confirm the ReZilient name and icon, then tap Add.', icon: PlusSquare },
  { title: 'Launch like an app', body: 'ReZilient will open from the home screen with an app-style experience.', icon: CheckCircle2 },
];

export default function AddToHomeScreen() {
  return (
    <PilotShell title="Add to Home Screen" subtitle="Save ReZilient to your phone like a regular mobile app.">
      <section className="rounded-[34px] bg-white/10 border border-white/12 p-6 backdrop-blur-2xl shadow-2xl mb-5 text-center">
        <div className="w-24 h-24 rounded-[28px] mx-auto bg-gradient-to-br from-blue-400 to-violet-500 shadow-2xl flex items-center justify-center text-4xl font-black">R</div>
        <h2 className="text-3xl font-bold font-sans mt-5">Install ReZilient</h2>
        <p className="text-slate-300 mt-2">No app store needed — add it directly to your phone for daily check-ins and emergency support.</p>
      </section>
      <section className="space-y-3">
        {steps.map(({ title, body, icon: Icon }, index) => (
          <div key={title} className="rounded-[28px] bg-white/10 border border-white/12 p-4 backdrop-blur-2xl flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white text-slate-950 flex items-center justify-center shrink-0"><Icon className="w-5 h-5" /></div>
            <div><p className="text-xs text-blue-200 font-black">Step {index + 1}</p><h3 className="text-lg font-bold font-sans">{title}</h3><p className="text-sm text-slate-300 mt-1">{body}</p></div>
          </div>
        ))}
      </section>
    </PilotShell>
  );
}