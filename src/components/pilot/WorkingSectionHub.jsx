import React, { useState } from 'react';
import PilotShell from './PilotShell';
import ActionPanel from './ActionPanel';
import WellnessToolPanel from './WellnessToolPanel';
import { getSectionDemoItems } from '@/data/pilotDemoData';

const actionMap = {
  'Breathing': 'Breathing Tools',
  'Panic support': 'Panic Support',
  'Binaural beats': 'Binaural Beats',
  'Journaling': 'Journaling',
  'Daily reminders': 'Daily reminders',
  'Daily Check-In': 'Daily Check-In',
  Meetings: 'Meetings',
  Goals: 'Goals',
  'Recovery resources': 'Resource Save',
  'Food resources': 'Resource Save',
  Transportation: 'Resource Save',
  Housing: 'Resource Save',
  Shelters: 'Resource Save',
  'Aftercare Plan': 'Aftercare Plan',
};

export default function WorkingSectionHub({ title, subtitle, sections, primaryAction }) {
  const [activeAction, setActiveAction] = useState(null);
  const [expanded, setExpanded] = useState({});

  const openSection = (section) => {
    const mappedTitle = actionMap[section.title] || section.title;
    setActiveAction({
      title: mappedTitle,
      type: section.title,
      description: section.description,
      options: section.items,
      sample: { title: `${section.title} sample`, date: 'Today' },
    });
  };

  return (
    <PilotShell title={title} subtitle={subtitle}>
      <div className="space-y-5">
        {activeAction ? (
          ['Breathing Tools', 'Panic Support', 'Binaural Beats', 'Journaling'].includes(activeAction.title)
            ? <WellnessToolPanel toolTitle={activeAction.title} onBack={() => setActiveAction(null)} />
            : <ActionPanel action={activeAction} onBack={() => setActiveAction(null)} />
        ) : (
          <>
            {primaryAction && (
              <button onClick={() => setActiveAction({ title: primaryAction.title, type: 'Start here', description: primaryAction.description, options: ['Start', 'Save', 'Review'] })} className="block w-full rounded-[34px] border border-white/12 bg-white/10 p-5 text-left shadow-2xl backdrop-blur-2xl active:scale-[.99]">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-200/80">Start here</p>
                <h2 className="mt-2 font-sans text-3xl font-black text-white">{primaryAction.title}</h2>
                <p className="mt-2 text-sm font-bold leading-relaxed text-slate-300">{primaryAction.description}</p>
              </button>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              {sections.map((section) => {
                const Icon = section.icon;
                const isOpen = expanded[section.title];
                return (
                  <div key={section.title} className="rounded-[30px] border border-white/12 bg-white/10 p-5 shadow-xl backdrop-blur-2xl">
                    <button onClick={() => openSection(section)} className="flex min-h-0 w-full items-center gap-3 rounded-2xl p-0 text-left">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/14">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-sans text-xl font-black text-white">{section.title}</h3>
                        <p className="text-xs font-bold text-amber-100/80">Open tool</p>
                      </div>
                    </button>
                    <p className="mt-4 text-sm font-bold leading-relaxed text-slate-300">{section.description}</p>
                    {(section.demoItems || getSectionDemoItems(section.title)).length > 0 && (
                      <div className="mt-4 space-y-2">
                        {(section.demoItems || getSectionDemoItems(section.title)).slice(0, 3).map((item) => (
                          <div key={item} className="rounded-2xl border border-white/10 bg-white/8 px-3 py-2 text-xs font-black text-slate-100">
                            {item}
                          </div>
                        ))}
                      </div>
                    )}
                    {section.items?.length > 0 && (
                      <>
                        <button onClick={() => setExpanded((prev) => ({ ...prev, [section.title]: !prev[section.title] }))} className="btn-ghost mt-4 min-h-0 px-4 py-2 text-xs">
                          {isOpen ? 'Hide options' : 'Show options'}
                        </button>
                        {isOpen && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {section.items.map((item) => <button key={item} onClick={() => setActiveAction({ title: section.title, type: item, description: `Save or act on: ${item}`, options: [item] })} className="min-h-0 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-black text-slate-200">{item}</button>)}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </PilotShell>
  );
}