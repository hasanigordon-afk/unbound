import React, { useEffect, useState } from 'react';
import { CheckCircle2, Clipboard, ExternalLink, PlusSquare, Send, Share, Smartphone } from 'lucide-react';
import PilotShell from '@/components/pilot/PilotShell';

const steps = [
  { title: 'Open this link on your phone', body: 'Send or copy the app link, then open it in Safari on iPhone or Chrome on Android.', icon: Smartphone },
  { title: 'Tap Share or the browser menu', body: 'On iPhone, tap Share. On Android, tap the three-dot menu in Chrome.', icon: Share },
  { title: 'Add it to your home screen', body: 'Choose Add to Home Screen or Install App, then confirm ReZilient.', icon: PlusSquare },
];

export default function AddToHomeScreen() {
  const [appLink, setAppLink] = useState('');
  const [copyStatus, setCopyStatus] = useState('Copy link');

  useEffect(() => {
    setAppLink(window.location.origin);
  }, []);

  const resetCopyStatus = () => {
    window.setTimeout(() => setCopyStatus('Copy link'), 1800);
  };

  const copyWithFallback = (text) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.setAttribute('readonly', '');
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();

    const copied = document.execCommand('copy');
    document.body.removeChild(textArea);

    if (!copied) {
      throw new Error('Copy command was blocked');
    }
  };

  const copyLink = async () => {
    if (!appLink) return;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(appLink);
      } else {
        copyWithFallback(appLink);
      }
      setCopyStatus('Copied');
    } catch {
      try {
        copyWithFallback(appLink);
        setCopyStatus('Copied');
      } catch {
        setCopyStatus('Select link above');
      }
    } finally {
      resetCopyStatus();
    }
  };

  const shareLink = async () => {
    if (!appLink) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Open ReZilient',
          text: 'Open ReZilient on your device.',
          url: appLink,
        });
        return;
      } catch {
        // If native share is canceled or blocked, keep copy as the fallback.
      }
    }

    await copyLink();
  };

  return (
    <PilotShell title="View on my device" subtitle="Open ReZilient on your phone in three quick steps.">
      <section className="rounded-[34px] bg-white/10 border border-white/12 p-5 sm:p-7 backdrop-blur-2xl shadow-2xl mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-24 h-24 rounded-[28px] bg-gradient-to-br from-blue-400 to-violet-500 shadow-2xl flex items-center justify-center text-4xl font-black shrink-0">R</div>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-[0.24em] text-blue-200/80 font-black">No app store needed</p>
            <h2 className="text-3xl sm:text-4xl font-bold font-sans mt-2">Put ReZilient on this device.</h2>
            <p className="text-slate-300 mt-2 leading-relaxed">Share or copy the app link, open it on your phone, then save it to your home screen for one-tap access.</p>
          </div>
        </div>

        <div className="mt-5 rounded-[26px] bg-slate-950/45 border border-white/10 p-3 flex flex-col sm:flex-row gap-3">
          <div className="min-h-[52px] rounded-2xl bg-white/8 border border-white/10 px-4 py-3 flex-1 flex items-center gap-3 text-sm text-slate-200 break-all">
            <ExternalLink className="w-4 h-4 text-blue-200 shrink-0" />
            <span>{appLink || 'Loading app link...'}</span>
          </div>
          <button type="button" onClick={shareLink} className="min-h-[52px] rounded-2xl bg-white text-slate-950 px-5 font-black flex items-center justify-center gap-2 active:scale-95 transition">
            <Send className="w-4 h-4" />
            Send to phone
          </button>
          <button type="button" onClick={copyLink} className="min-h-[52px] rounded-2xl bg-white/10 border border-white/12 px-5 font-black flex items-center justify-center gap-2 active:scale-95 transition">
            <Clipboard className="w-4 h-4" />
            {copyStatus}
          </button>
        </div>
      </section>

      <section className="space-y-3">
        {steps.map(({ title, body, icon: Icon }, index) => (
          <div key={title} className="rounded-[28px] bg-white/10 border border-white/12 p-4 backdrop-blur-2xl flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white text-slate-950 flex items-center justify-center shrink-0"><Icon className="w-5 h-5" /></div>
            <div><p className="text-xs text-blue-200 font-black">Step {index + 1}</p><h3 className="text-lg font-bold font-sans">{title}</h3><p className="text-sm text-slate-300 mt-1">{body}</p></div>
          </div>
        ))}
        <div className="rounded-[28px] bg-emerald-400/12 border border-emerald-300/20 p-4 backdrop-blur-2xl flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-300 text-slate-950 flex items-center justify-center shrink-0"><CheckCircle2 className="w-5 h-5" /></div>
          <div><p className="text-xs text-emerald-200 font-black">Done</p><h3 className="text-lg font-bold font-sans">Open it like an app</h3><p className="text-sm text-slate-300 mt-1">Tap the ReZilient icon on your home screen whenever you need support.</p></div>
        </div>
      </section>
    </PilotShell>
  );
}