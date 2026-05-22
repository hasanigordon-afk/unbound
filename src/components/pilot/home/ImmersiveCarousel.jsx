import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export default function ImmersiveCarousel({ eyebrow, title, subtitle, items, viewAllTo }) {
  const scrollerRef = useRef(null);
  const [active, setActive] = useState(0);

  const handleScroll = () => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const cardWidth = scroller.firstChild?.offsetWidth || 280;
    const next = Math.round(scroller.scrollLeft / (cardWidth + 16));
    if (next !== active && next >= 0 && next < items.length) {
      setActive(next);
      if (navigator.vibrate) navigator.vibrate(8);
    }
  };

  return (
    <section className="py-2">
      <div className="mb-4 flex items-end justify-between gap-4 px-1">
        <div>
          {eyebrow && <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-200/80">{eyebrow}</p>}
          <h2 className="mt-1 font-sans text-3xl font-black tracking-tight text-white">{title}</h2>
          {subtitle && <p className="mt-1 text-sm font-bold text-slate-300">{subtitle}</p>}
        </div>
        {viewAllTo && <Link to={viewAllTo} className="hidden rounded-full border border-white/12 bg-white/8 px-4 py-2 text-xs font-black text-white sm:inline-flex">View All</Link>}
      </div>

      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 pt-2 [perspective:1200px]"
      >
        {items.map((item, index) => {
          const CardIcon = item.icon;
          const isActive = index === active;
          const content = (
            <div className={`relative h-[330px] w-[250px] shrink-0 snap-center overflow-hidden rounded-[34px] border p-5 transition-all duration-500 sm:h-[360px] sm:w-[280px] ${isActive ? 'scale-100 rotate-0 border-cyan-200/35 shadow-[0_0_50px_rgba(34,211,238,.22),0_28px_70px_rgba(0,0,0,.45)]' : 'scale-[.88] rotate-y-6 border-white/10 opacity-78 shadow-[0_18px_42px_rgba(0,0,0,.28)]'}`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient}`} />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_18%,rgba(255,255,255,.34),transparent_24%),linear-gradient(160deg,rgba(255,255,255,.16),transparent_42%,rgba(0,0,0,.28))]" />
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/15 blur-2xl transition-transform duration-700" style={{ transform: isActive ? 'translate3d(-8px,12px,0) scale(1.1)' : 'translate3d(12px,-8px,0)' }} />
              <div className="relative z-10 flex h-full flex-col justify-between">
                <div>
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex h-16 w-16 items-center justify-center rounded-[26px] bg-white/20 shadow-inner backdrop-blur-2xl">
                      <CardIcon className="h-8 w-8 text-white" />
                    </div>
                    {item.status && <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white backdrop-blur-xl">{item.status}</span>}
                  </div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-white/70">{item.kicker}</p>
                  <h3 className="mt-2 font-sans text-3xl font-black leading-tight text-white">{item.title}</h3>
                  <p className="mt-3 text-sm font-bold leading-relaxed text-white/78">{item.subtitle}</p>
                </div>
                <div>
                  {item.meta && <p className="mb-3 text-sm font-black text-white">{item.meta}</p>}
                  <div className="flex items-center justify-between rounded-[24px] bg-white/16 p-3 backdrop-blur-xl">
                    <span className="text-xs font-black text-white/85">{item.cta || 'Open'}</span>
                    <ArrowUpRight className="h-4 w-4 text-white" />
                  </div>
                </div>
              </div>
            </div>
          );
          return item.to ? <Link key={item.title} to={item.to}>{content}</Link> : <div key={item.title}>{content}</div>;
        })}
      </div>

      <div className="mt-1 flex justify-center gap-2">
        {items.map((item, index) => (
          <button
            key={item.title}
            type="button"
            onClick={() => {
              setActive(index);
              scrollerRef.current?.children[index]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }}
            className={`h-2 rounded-full transition-all ${index === active ? 'w-8 bg-white shadow-[0_0_18px_rgba(255,255,255,.45)]' : 'w-2 bg-white/28'}`}
            aria-label={`Go to ${item.title}`}
          />
        ))}
      </div>
    </section>
  );
}