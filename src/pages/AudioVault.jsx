import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Headphones,
  Heart,
  Mic,
  Music2,
  Pause,
  Play,
  Radio,
  Search,
  Shield,
  Sparkles,
  Waves,
} from "lucide-react";

const categories = [
  "All",
  "NA audio",
  "AA speakers",
  "Motivation",
  "Meditation",
  "Calming frequencies",
  "Binaural beats",
  "Success stories",
  "Podcasts",
];

const tracks = [
  { title: "Just Stay For Today", category: "NA audio", duration: "18 min", mood: "steady", icon: Mic },
  { title: "A New Honest Life", category: "AA speakers", duration: "42 min", mood: "hopeful", icon: Radio },
  { title: "Comeback Morning", category: "Motivation", duration: "9 min", mood: "powerful", icon: Sparkles },
  { title: "Ten Minute Reset", category: "Meditation", duration: "10 min", mood: "calm", icon: Headphones },
  { title: "174 Hz Grounding Tone", category: "Calming frequencies", duration: "30 min", mood: "grounded", icon: Waves },
  { title: "Focus Binaural Flow", category: "Binaural beats", duration: "25 min", mood: "focused", icon: Music2 },
  { title: "From Shelter To Sponsor", category: "Success stories", duration: "16 min", mood: "inspired", icon: Heart },
  { title: "Reentry Roundtable", category: "Podcasts", duration: "35 min", mood: "practical", icon: Shield },
];

export default function AudioVault() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [playing, setPlaying] = useState("Ten Minute Reset");
  const [query, setQuery] = useState("");

  const visibleTracks = useMemo(() => {
    return tracks.filter((track) => {
      const categoryMatch = activeCategory === "All" || track.category === activeCategory;
      const queryMatch = !query.trim() || `${track.title} ${track.category} ${track.mood}`.toLowerCase().includes(query.toLowerCase());
      return categoryMatch && queryMatch;
    });
  }, [activeCategory, query]);

  const activeTrack = tracks.find((track) => track.title === playing) || tracks[0];

  return (
    <main className="audio-vault-shell">
      <section className="audio-hero">
        <Link to="/" className="audio-back"><ArrowLeft size={17} /> Back home</Link>
        <div className="audio-hero-copy">
          <span>Recovery Audio Vault</span>
          <h1>Sound for the moment you are in.</h1>
          <p>NA audio, AA speakers, motivation, meditation, calming frequencies, binaural beats, success stories and podcasts in one safe place.</p>
        </div>
        <div className="audio-player-card">
          <div className="audio-disc"><Waves size={34} /></div>
          <div>
            <span>Now playing</span>
            <h2>{activeTrack.title}</h2>
            <p>{activeTrack.category} · {activeTrack.duration} · {activeTrack.mood}</p>
          </div>
          <button onClick={() => setPlaying(playing ? "" : activeTrack.title)}>{playing ? <Pause size={20} /> : <Play size={20} />}</button>
        </div>
      </section>

      <section className="audio-search-card">
        <Search size={18} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search calm, motivation, speakers, stories..." />
      </section>

      <div className="audio-category-row">
        {categories.map((category) => (
          <button key={category} onClick={() => setActiveCategory(category)} className={category === activeCategory ? "active" : ""}>{category}</button>
        ))}
      </div>

      <section className="audio-track-grid">
        {visibleTracks.map((track) => {
          const Icon = track.icon;
          const isPlaying = playing === track.title;
          return (
            <article key={track.title} className={isPlaying ? "active" : ""}>
              <div className="audio-track-icon"><Icon size={22} /></div>
              <div>
                <span>{track.category}</span>
                <h3>{track.title}</h3>
                <p>{track.duration} · {track.mood}</p>
              </div>
              <button onClick={() => setPlaying(isPlaying ? "" : track.title)}>{isPlaying ? <Pause size={18} /> : <Play size={18} />}</button>
            </article>
          );
        })}
      </section>

      <section className="audio-safety-card">
        <Shield size={22} />
        <div>
          <h2>Audio is support, not pressure.</h2>
          <p>Use the global reset button if stress or cravings spike. Reach your support circle or emergency services if you are in immediate danger.</p>
        </div>
        <Link to="/Lifeline">Open lifeline</Link>
      </section>

      <style>{`
        .audio-vault-shell { max-width: 1040px; margin: 0 auto; padding: clamp(16px, 3vw, 34px) clamp(12px, 3vw, 28px) 124px; color: var(--text); }
        .audio-hero { position: relative; overflow: hidden; min-height: 540px; border-radius: 38px; padding: clamp(20px, 5vw, 48px); display: flex; flex-direction: column; justify-content: space-between; border: 1px solid rgba(190,225,255,.18); background: radial-gradient(circle at 24% 16%, rgba(52,211,153,.22), transparent 34%), radial-gradient(circle at 82% 12%, rgba(91,141,239,.28), transparent 34%), linear-gradient(145deg, rgba(255,255,255,.12), rgba(7,10,20,.74)); box-shadow: 0 34px 100px rgba(0,0,0,.46), inset 0 1px 0 rgba(255,255,255,.12); backdrop-filter: blur(30px) saturate(170%); }
        .audio-back { width: fit-content; min-height: 42px; display: inline-flex; align-items: center; gap: 8px; padding: 0 14px; border-radius: 999px; text-decoration: none; color: var(--text); background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.12); font-weight: 950; }
        .audio-hero-copy { max-width: 720px; margin: 58px 0 28px; }
        .audio-hero-copy span, .audio-player-card span, .audio-track-grid article span { color: #8bdcff; text-transform: uppercase; letter-spacing: .16em; font-size: 11px; font-weight: 950; }
        .audio-hero h1 { margin: 10px 0 0; font-size: clamp(46px, 9vw, 96px); line-height: .9; letter-spacing: -.06em; }
        .audio-hero p, .audio-track-grid p, .audio-safety-card p { color: var(--text-muted); line-height: 1.6; }
        .audio-player-card { display: grid; grid-template-columns: 86px 1fr 58px; gap: 16px; align-items: center; border-radius: 32px; padding: 16px; background: rgba(255,255,255,.10); border: 1px solid rgba(255,255,255,.14); }
        .audio-disc { width: 86px; height: 86px; border-radius: 28px; display: grid; place-items: center; color: #07101f; background: conic-gradient(from 90deg, #67e8f9, #f0b753, #a78bfa, #67e8f9); box-shadow: 0 0 44px rgba(103,232,249,.24); animation: audioPulse 4s ease-in-out infinite; }
        .audio-player-card h2 { margin: 4px 0 0; font-size: clamp(24px, 5vw, 42px); }
        .audio-player-card button, .audio-track-grid button { min-width: 52px; min-height: 52px; border-radius: 999px; display: grid; place-items: center; border: 1px solid rgba(255,255,255,.18); background: #fff; color: #07101f; }
        .audio-search-card { margin-top: 18px; min-height: 58px; display: flex; align-items: center; gap: 12px; border-radius: 24px; padding: 0 16px; background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.12); }
        .audio-search-card svg { color: var(--gold); }
        .audio-search-card input { flex: 1; min-height: 48px; border: 0; outline: 0; background: transparent; color: var(--text); font-weight: 850; }
        .audio-category-row { display: flex; gap: 9px; overflow-x: auto; padding: 16px 0 8px; }
        .audio-category-row button { min-height: 42px; white-space: nowrap; border-radius: 999px; padding: 0 14px; color: var(--text); background: rgba(255,255,255,.075); border: 1px solid rgba(255,255,255,.12); font-size: 12px; font-weight: 950; }
        .audio-category-row button.active { color: #07101f; background: linear-gradient(135deg, #f0b753, #67e8f9); }
        .audio-track-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 10px; }
        .audio-track-grid article { display: grid; grid-template-columns: 60px 1fr 52px; gap: 13px; align-items: center; min-height: 132px; border-radius: 30px; padding: 16px; background: linear-gradient(145deg, rgba(255,255,255,.095), rgba(13,18,32,.64)); border: 1px solid rgba(190,225,255,.14); box-shadow: 0 20px 58px rgba(0,0,0,.30); }
        .audio-track-grid article.active { border-color: rgba(240,183,83,.42); box-shadow: 0 0 40px rgba(240,183,83,.16), 0 20px 58px rgba(0,0,0,.30); }
        .audio-track-icon { width: 60px; height: 60px; border-radius: 22px; display: grid; place-items: center; color: #07101f; background: linear-gradient(135deg, #67e8f9, #a78bfa); }
        .audio-track-grid h3 { margin: 5px 0 0; font-family: 'DM Sans', sans-serif; font-size: 18px; font-weight: 950; }
        .audio-track-grid p { margin: 5px 0 0; font-size: 13px; }
        .audio-safety-card { margin-top: 18px; display: grid; grid-template-columns: 44px 1fr auto; gap: 14px; align-items: center; border-radius: 30px; padding: 18px; background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.12); }
        .audio-safety-card svg { color: #6ee7b7; }
        .audio-safety-card h2 { margin: 0; font-size: 24px; }
        .audio-safety-card a { min-height: 44px; display: inline-flex; align-items: center; justify-content: center; padding: 0 16px; border-radius: 999px; color: #07101f; background: #fff; text-decoration: none; font-weight: 950; }
        @keyframes audioPulse { 0%,100% { transform: scale(.96); } 50% { transform: scale(1.04); } }
        @media (max-width: 760px) { .audio-hero { min-height: auto; } .audio-player-card, .audio-track-grid, .audio-safety-card { grid-template-columns: 1fr; } .audio-track-grid article { grid-template-columns: 54px 1fr 48px; } }
        @media (max-width: 520px) { .audio-vault-shell { padding-inline: 10px; } .audio-player-card { text-align: left; } .audio-track-grid article { grid-template-columns: 1fr; } }
      `}</style>
    </main>
  );
}
