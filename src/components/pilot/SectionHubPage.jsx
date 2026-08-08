import React from 'react';
import { Link } from 'react-router-dom';
import PilotShell from './PilotShell';

function SectionCard({ section }) {
  const Icon = section.icon;
  const body = (
    <>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/14">
          <Icon className="h-6 w-6 text-white" />
        </div>
        <h3 className="font-sans text-xl font-black text-white">{section.title}</h3>
      </div>
      <p className="text-sm font-bold leading-relaxed text-slate-300">{section.description}</p>
      {section.items?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {section.items.map((item) => <span key={item} className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-black text-slate-200">{item}</span>)}
        </div>
      )}
    </>
  );

  if (section.to) {
    return (
      <Link to={section.to} className="block rounded-[30px] border border-white/12 bg-white/10 p-5 shadow-xl backdrop-blur-2xl transition hover:bg-white/14">
        {body}
      </Link>
    );
  }

  return (
    <div className="rounded-[30px] border border-white/12 bg-white/10 p-5 shadow-xl backdrop-blur-2xl">
      {body}
    </div>
  );
}

export default function SectionHubPage({ title, subtitle, sections, primaryAction }) {
  return (
    <PilotShell title={title} subtitle={subtitle}>
      <div className="space-y-5">
        {primaryAction && (
          primaryAction.to ? (
            <Link to={primaryAction.to} className="block rounded-[34px] border border-white/12 bg-white/10 p-5 shadow-2xl backdrop-blur-2xl transition hover:bg-white/14">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-200/80">Start here</p>
              <h2 className="mt-2 font-sans text-3xl font-black text-white">{primaryAction.title}</h2>
              <p className="mt-2 text-sm font-bold leading-relaxed text-slate-300">{primaryAction.description}</p>
            </Link>
          ) : (
            <div className="rounded-[34px] border border-white/12 bg-white/10 p-5 shadow-2xl backdrop-blur-2xl">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-200/80">Start here</p>
              <h2 className="mt-2 font-sans text-3xl font-black text-white">{primaryAction.title}</h2>
              <p className="mt-2 text-sm font-bold leading-relaxed text-slate-300">{primaryAction.description}</p>
            </div>
          )
        )}
        <div className="grid gap-4 md:grid-cols-2">
          {sections.map((section) => <SectionCard key={section.title} section={section} />)}
        </div>
      </div>
    </PilotShell>
  );
}