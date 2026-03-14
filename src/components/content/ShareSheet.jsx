import React, { useState } from "react";
import { X, Check, Copy } from "lucide-react";

const SHARE_OPTIONS = [
  { label: "Facebook",  icon: "📘", url: (title, link) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}&quote=${encodeURIComponent(title)}` },
  { label: "X / Twitter", icon: "🐦", url: (title, link) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(link)}` },
  { label: "LinkedIn",  icon: "💼", url: (title, link) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}` },
  { label: "WhatsApp",  icon: "💬", url: (title, link) => `https://wa.me/?text=${encodeURIComponent(title + " " + link)}` },
  { label: "SMS",       icon: "📱", url: (title, link) => `sms:?body=${encodeURIComponent(title + " " + link)}` },
  { label: "Email",     icon: "✉️", url: (title, link) => `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent("I wanted to share this with you: " + link)}` },
];

export default function ShareSheet({ title, summary, onClose }) {
  const [copied, setCopied] = useState(false);
  const shareLink = window.location.href;
  const shareText = `${title} — via Unbound Recovery App`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: summary || title, url: shareLink });
        onClose();
      } catch {}
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <div className="w-full max-w-lg rounded-t-3xl p-6" style={{ background: "#FFF" }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold" style={{ color: "#1E1E1E" }}>Share</h3>
          <button onClick={onClose}><X className="w-5 h-5" style={{ color: "#8E8E93" }} /></button>
        </div>

        <p className="text-sm mb-4 leading-snug line-clamp-2" style={{ color: "#5A5A5A" }}>{title}</p>

        {navigator.share && (
          <button onClick={handleNativeShare}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm mb-4"
            style={{ background: "#4A90E2", color: "#FFF" }}>
            📤 Share via Phone
          </button>
        )}

        <div className="grid grid-cols-3 gap-3 mb-4">
          {SHARE_OPTIONS.map(opt => (
            <a key={opt.label} href={opt.url(shareText, shareLink)} target="_blank" rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 py-3 rounded-2xl text-xs font-semibold"
              style={{ background: "#F7F7F8", color: "#1E1E1E" }}>
              <span className="text-2xl">{opt.icon}</span>
              {opt.label}
            </a>
          ))}
        </div>

        <button onClick={handleCopy}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold"
          style={{ background: "#F7F7F8", color: "#5A5A5A", border: "1px solid #E5E7EB" }}>
          {copied ? <><Check className="w-4 h-4" style={{ color: "#22C55E" }} /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Link</>}
        </button>
      </div>
    </div>
  );
}