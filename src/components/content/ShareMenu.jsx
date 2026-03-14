import React, { useState } from "react";
import { Share2, Copy, X, Check } from "lucide-react";

const SHARE_OPTIONS = [
  { label: "WhatsApp",   emoji: "💬", getUrl: (t, u) => `https://wa.me/?text=${encodeURIComponent(t + " " + u)}` },
  { label: "Facebook",   emoji: "📘", getUrl: (t, u) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}&quote=${encodeURIComponent(t)}` },
  { label: "Twitter/X",  emoji: "🐦", getUrl: (t, u) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(t)}&url=${encodeURIComponent(u)}` },
  { label: "LinkedIn",   emoji: "💼", getUrl: (t, u) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(u)}` },
  { label: "Email",      emoji: "✉️", getUrl: (t, u) => `mailto:?subject=${encodeURIComponent(t)}&body=${encodeURIComponent(u)}` },
  { label: "SMS",        emoji: "📱", getUrl: (t, u) => `sms:?body=${encodeURIComponent(t + " " + u)}` },
];

export default function ShareMenu({ title, url, onClose }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || window.location.href;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title, url: shareUrl }); onClose?.(); } catch {}
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <div className="w-full max-w-lg rounded-t-3xl p-6" style={{ background: "#FFF" }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <p className="font-bold text-base" style={{ color: "#1E1E1E" }}>Share</p>
          <button onClick={onClose}><X className="w-5 h-5" style={{ color: "#8E8E93" }} /></button>
        </div>
        {title && <p className="text-sm mb-4 line-clamp-2" style={{ color: "#5A5A5A" }}>{title}</p>}

        {navigator.share && (
          <button onClick={handleNativeShare}
            className="w-full py-3 rounded-2xl text-sm font-bold mb-4 flex items-center justify-center gap-2"
            style={{ background: "#4A90E2", color: "#FFF" }}>
            <Share2 className="w-4 h-4" /> Share via…
          </button>
        )}

        <div className="grid grid-cols-3 gap-3 mb-4">
          {SHARE_OPTIONS.map(opt => (
            <a key={opt.label} href={opt.getUrl(title || "", shareUrl)} target="_blank" rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 py-3 rounded-2xl text-xs font-semibold"
              style={{ background: "#F7F7F8", color: "#1E1E1E", textDecoration: "none" }}>
              <span className="text-xl">{opt.emoji}</span>{opt.label}
            </a>
          ))}
        </div>

        <button onClick={copyLink}
          className="w-full py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2"
          style={{ background: "#F7F7F8", color: copied ? "#22C55E" : "#1E1E1E" }}>
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "Link copied!" : "Copy link"}
        </button>
      </div>
    </div>
  );
}