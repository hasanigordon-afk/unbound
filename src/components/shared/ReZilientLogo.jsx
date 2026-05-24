import React from 'react';

export default function ReZilientLogo({ className = 'h-10 w-10', rounded = 'rounded-2xl', size, showWordmark = false }) {
  const dimensions = size ? { width: size, height: size } : undefined;

  return (
    <div className="inline-flex items-center gap-3" aria-label="ReZilient">
      <div
        style={dimensions}
        className={`${className} ${rounded} relative shrink-0 overflow-hidden border border-amber-200/25 bg-black shadow-[0_0_28px_rgba(240,123,27,0.36),inset_0_0_24px_rgba(240,183,83,0.16)]`}
      >
        <svg viewBox="0 0 128 128" role="img" aria-label="ReZilient logo mark" className="h-full w-full">
          <defs>
            <linearGradient id="rez-metal" x1="28" y1="8" x2="106" y2="118">
              <stop offset="0%" stopColor="#f5f1e8" />
              <stop offset="38%" stopColor="#6d737c" />
              <stop offset="68%" stopColor="#181b20" />
              <stop offset="100%" stopColor="#f4b047" />
            </linearGradient>
            <linearGradient id="rez-brick" x1="0" y1="0" x2="64" y2="120">
              <stop offset="0%" stopColor="#9a4d22" />
              <stop offset="52%" stopColor="#5f3019" />
              <stop offset="100%" stopColor="#2b140d" />
            </linearGradient>
            <filter id="rez-glow">
              <feGaussianBlur stdDeviation="2.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect width="128" height="128" fill="#030304" />
          <circle cx="67" cy="61" r="44" fill="none" stroke="#f47b1b" strokeWidth="5" opacity=".95" filter="url(#rez-glow)" />
          <path d="M34 111V17h46c24 0 39 14 39 36 0 17-9 29-24 34l24 24H91L70 89H59v22H34Zm25-43h19c10 0 16-5 16-14s-6-14-16-14H59v28Z" fill="url(#rez-metal)" stroke="#f6b24a" strokeWidth="2.5" />
          <path d="M34 111V17h31v94H34Z" fill="url(#rez-brick)" opacity=".96" />
          {Array.from({ length: 8 }).map((_, row) => (
            <g key={row}>
              <rect x="28" y={18 + row * 11} width="18" height="8" rx="1.4" fill="#8a421e" stroke="#2a130a" strokeWidth=".8" />
              <rect x="48" y={18 + row * 11} width="18" height="8" rx="1.4" fill="#6f3418" stroke="#2a130a" strokeWidth=".8" />
            </g>
          ))}
          <path d="M32 19c-13 1-22 7-28 17 10-4 18-2 27 3V19Zm0 24c-14 3-23 9-29 18 11-3 20-1 29 4V43Zm0 25C18 72 9 79 3 91c11-5 20-3 29 4V68Z" fill="#8f441f" opacity=".45" />
          <path d="M79 19 70 38m31 6-17 14m11 32-20-18m-16 0 16-14m-7 50 8-22m27-5 16 4" stroke="#ff7a1a" strokeWidth="2" strokeLinecap="round" opacity=".9" filter="url(#rez-glow)" />
          <path d="M66 17h15c24 0 38 14 38 36 0 17-9 29-24 34l24 24" fill="none" stroke="rgba(255,255,255,.72)" strokeWidth="1.5" opacity=".65" />
        </svg>
      </div>
      {showWordmark && (
        <div className="leading-none">
          <span className="block font-sans text-lg font-black uppercase tracking-[0.18em] text-white">
            <span className="text-amber-400">Re</span>Zilient
          </span>
          <span className="mt-1 hidden text-[9px] font-black uppercase tracking-[0.28em] text-amber-300/85 sm:block">
            Break. Rebuild. Rise.
          </span>
        </div>
      )}
    </div>
  );
}