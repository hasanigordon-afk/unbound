import React from 'react';

const LOGO_URL = 'https://media.base44.com/images/public/698cbbdc830161c35d66ad0e/b27d23522_0941C65E-DE02-4D65-94CA-56262B999EDD.png';

export default function ReZilientLogo({ className = 'h-10 w-10', rounded = 'rounded-2xl', size, showWordmark = false }) {
  const dimensions = size ? { width: size, height: size } : undefined;

  return (
    <div className="inline-flex items-center gap-3">
      <img
        src={LOGO_URL}
        alt="ReZilient logo"
        style={dimensions}
        className={`${className} ${rounded} object-cover object-center shadow-[0_0_24px_rgba(240,183,83,0.22)]`}
      />
      {showWordmark && <span className="font-sans text-lg font-black tracking-tight text-white">ReZilient</span>}
    </div>
  );
}