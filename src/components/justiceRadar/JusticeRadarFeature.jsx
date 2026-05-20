import React, { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowRight, Bell, Radar, Search, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import JusticeArticleCard from "./JusticeArticleCard";
import JusticeDetailPanel from "./JusticeDetailPanel";
import JusticePersonalization from "./JusticePersonalization";
import FamilyInsideSection from "./FamilyInsideSection";
import { justiceArticles, radarCategories } from "./justiceRadarData";

export default function JusticeRadarFeature({ compact = false }) {
  const [selectedTopics, setSelectedTopics] = useState(["Drug-related charges", "Probation/parole", "Housing"]);
  const [selectedArticle, setSelectedArticle] = useState(justiceArticles[0]);
  const [aiSummary, setAiSummary] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);

  const filteredArticles = useMemo(() => {
    const matches = justiceArticles.filter((article) => selectedTopics.some((topic) => article.category.toLowerCase().includes(topic.split(" ")[0].toLowerCase())));
    return matches.length ? matches : justiceArticles;
  }, [selectedTopics]);

  const toggleTopic = (topic) => {
    setSelectedTopics((current) => current.includes(topic) ? current.filter((item) => item !== topic) : [...current, topic]);
  };

  const explainWithAi = async (article) => {
    setSelectedArticle(article);
    setLoadingAi(true);
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Summarize this justice/legal awareness update in plain, supportive, non-legal-advice language for a person returning from incarceration. Include what changed, who may be affected, what it could mean, lawyer questions, and helpful resources. Article: ${article.title}. ${article.summary}. ${article.changed}`,
    });
    setAiSummary(response);
    setLoadingAi(false);
  };

  if (compact) {
    return (
      <section className="justice-radar-compact">
        <div className="justice-compact-copy">
          <span><Radar size={15} /> Justice Radar</span>
          <h2>Know what changed while you were away.</h2>
          <p>Plain-language updates on sentencing reform, expungement, housing rights, voting rights, supervision changes, and second-chance opportunities.</p>
          <Link to="/JusticeRadar">Open Justice Radar <ArrowRight size={16} /></Link>
        </div>
        <div className="justice-compact-feed">
          {justiceArticles.slice(0, 3).map((article) => <div key={article.id}><strong>{article.category}</strong><p>{article.title}</p></div>)}
        </div>
        <JusticeStyles />
      </section>
    );
  }

  return (
    <main className="justice-radar-page">
      <section className="justice-radar-hero">
        <div className="justice-hero-copy">
          <span><Radar size={16} /> Justice Radar</span>
          <h1>Stay aware of the laws, reforms, and second-chance updates that may shape your future.</h1>
          <p>Empowering education for people rebuilding after incarceration — clear, calm, plain-language awareness without fear or confusion.</p>
          <div className="justice-hero-search"><Search size={17} /><input placeholder="Search reform, expungement, housing rights, parole changes..." /></div>
        </div>
        <div className="justice-disclaimer-card">
          <Sparkles size={22} />
          <p>ReZilient provides information and awareness, not legal advice. Consult legal professionals for case-specific guidance.</p>
        </div>
      </section>

      <div className="radar-category-strip">
        {radarCategories.map(({ label, icon: Icon }) => <span key={label}><Icon size={15} /> {label}</span>)}
      </div>

      <section className="justice-radar-grid">
        <div className="justice-feed-column">
          <JusticePersonalization selectedTopics={selectedTopics} onToggle={toggleTopic} />
          <div className="justice-feed-head"><Bell size={18} /><h2>News & education feed</h2></div>
          {filteredArticles.map((article) => (
            <JusticeArticleCard key={article.id} article={article} selected={selectedArticle.id === article.id} onSelect={(item) => { setSelectedArticle(item); setAiSummary(""); }} onExplain={explainWithAi} />
          ))}
          <FamilyInsideSection />
        </div>
        <JusticeDetailPanel article={selectedArticle} aiSummary={aiSummary} loading={loadingAi} />
      </section>
      <JusticeStyles />
    </main>
  );
}

function JusticeStyles() {
  return <style>{`
    .justice-radar-page, .justice-radar-compact { color: var(--text); }
    .justice-radar-page { min-height: 100vh; padding: 54px min(5vw, 52px) 140px; background: radial-gradient(circle at 20% 0%, rgba(34,211,238,.13), transparent 34%), radial-gradient(circle at 90% 10%, rgba(240,183,83,.10), transparent 30%); }
    .justice-radar-hero, .justice-radar-compact { position: relative; overflow: hidden; border-radius: 42px; padding: clamp(26px, 5vw, 54px); background: linear-gradient(145deg, rgba(4,7,13,.94), rgba(13,18,32,.78)); border: 1px solid rgba(190,225,255,.15); box-shadow: 0 34px 90px rgba(0,0,0,.44), inset 0 1px 0 rgba(255,255,255,.08); backdrop-filter: blur(30px) saturate(160%); }
    .justice-radar-hero { display: grid; grid-template-columns: 1.3fr .7fr; gap: 26px; align-items: end; margin-bottom: 18px; }
    .justice-radar-hero:before, .justice-radar-compact:before { content: ''; position: absolute; inset: 0; opacity: .12; background-image: radial-gradient(circle, rgba(255,255,255,.9) 0 1px, transparent 1.5px); background-size: 54px 54px; animation: justiceParticles 28s linear infinite; pointer-events: none; }
    .justice-hero-copy, .justice-disclaimer-card, .justice-compact-copy, .justice-compact-feed { position: relative; z-index: 1; }
    .justice-hero-copy > span, .justice-compact-copy > span { display: inline-flex; align-items: center; gap: 8px; color: #22D3EE; font-size: 12px; font-weight: 950; letter-spacing: .16em; text-transform: uppercase; }
    .justice-hero-copy h1, .justice-compact-copy h2 { margin: 14px 0 0; font-size: clamp(36px, 5.4vw, 72px); line-height: .94; letter-spacing: -.055em; }
    .justice-compact-copy h2 { font-size: clamp(32px, 4.4vw, 58px); max-width: 760px; }
    .justice-hero-copy p, .justice-compact-copy p { max-width: 780px; color: var(--text-muted); font-size: 17px; line-height: 1.7; }
    .justice-hero-search { max-width: 640px; display: flex; align-items: center; gap: 10px; margin-top: 24px; padding: 8px 12px; border-radius: 999px; background: rgba(255,255,255,.07); border: 1px solid rgba(190,225,255,.16); }
    .justice-hero-search svg { color: #F0B753; }
    .justice-hero-search input { flex: 1; border: 0; background: transparent; box-shadow: none; min-height: 38px; }
    .justice-disclaimer-card { padding: 22px; border-radius: 30px; background: rgba(240,183,83,.10); border: 1px solid rgba(240,183,83,.28); color: var(--text); }
    .justice-disclaimer-card svg { color: #F0B753; margin-bottom: 10px; }
    .justice-disclaimer-card p { margin: 0; line-height: 1.6; font-weight: 800; }
    .radar-category-strip { display: flex; flex-wrap: wrap; gap: 10px; margin: 18px 0 24px; }
    .radar-category-strip span, .topic-chip-grid button, .justice-action-row button, .family-topic-list span, .family-add-row button, .justice-compact-copy a { display: inline-flex; align-items: center; gap: 7px; min-height: 38px; padding: 0 13px; border-radius: 999px; border: 1px solid rgba(190,225,255,.14); background: rgba(255,255,255,.06); color: var(--text-muted); font-size: 12px; font-weight: 850; text-decoration: none; }
    .justice-radar-grid { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(340px, .85fr); gap: 22px; align-items: start; }
    .justice-feed-column { display: grid; gap: 14px; }
    .justice-panel, .justice-article-card, .family-inside-section, .justice-detail-panel { background: linear-gradient(155deg, rgba(255,255,255,.10), rgba(255,255,255,.038)); border: 1px solid rgba(190,225,255,.13); border-radius: 28px; box-shadow: 0 22px 58px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.09); backdrop-filter: blur(24px) saturate(160%); }
    .justice-panel, .family-inside-section, .justice-detail-panel { padding: 20px; }
    .justice-panel-title, .justice-card-head, .justice-feed-head { display: flex; gap: 12px; align-items: flex-start; }
    .justice-panel-title svg, .justice-feed-head svg { color: #22D3EE; }
    .justice-panel-title span { color: #22D3EE; font-size: 10px; font-weight: 950; letter-spacing: .14em; text-transform: uppercase; }
    .justice-panel-title h3, .justice-feed-head h2 { margin: 3px 0 0; font-size: 22px; }
    .topic-chip-grid { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
    .topic-chip-grid button { cursor: pointer; }
    .topic-chip-grid button.active, .justice-action-row button:hover, .family-add-row button, .justice-compact-copy a { color: #06101a; background: linear-gradient(135deg, #22D3EE, #F0B753); border-color: rgba(255,255,255,.28); }
    .justice-article-card { padding: 20px; cursor: pointer; transition: transform .24s, border-color .24s, box-shadow .24s; }
    .justice-article-card:hover, .justice-article-card.selected { transform: translateY(-4px); border-color: rgba(34,211,238,.34); box-shadow: 0 0 34px rgba(34,211,238,.18), 0 24px 62px rgba(0,0,0,.35); }
    .justice-card-icon { width: 48px; height: 48px; border-radius: 18px; display: grid; place-items: center; color: #22D3EE; background: rgba(34,211,238,.10); border: 1px solid rgba(34,211,238,.22); flex-shrink: 0; }
    .tone-gold .justice-card-icon { color: #F0B753; background: rgba(240,183,83,.10); border-color: rgba(240,183,83,.24); } .tone-green .justice-card-icon { color: #34D399; background: rgba(52,211,153,.10); border-color: rgba(52,211,153,.24); } .tone-purple .justice-card-icon { color: #A78BFA; background: rgba(167,139,250,.10); border-color: rgba(167,139,250,.24); }
    .justice-card-head span { color: var(--text-dim); font-size: 11px; font-weight: 850; }
    .justice-card-head h3 { margin: 5px 0 0; font-size: 21px; line-height: 1.2; }
    .justice-article-card > p, .family-inside-section > p { color: var(--text-muted); line-height: 1.6; }
    .justice-action-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
    .justice-action-row button { cursor: pointer; }
    .justice-detail-panel { position: sticky; top: 24px; display: grid; gap: 13px; }
    .legal-disclaimer, .plain-language-box, .justice-info-block { padding: 15px; border-radius: 20px; background: rgba(0,0,0,.16); border: 1px solid rgba(255,255,255,.09); }
    .legal-disclaimer { display: flex; gap: 10px; color: #F0B753; }
    .legal-disclaimer p { margin: 0; color: var(--text); font-size: 13px; line-height: 1.5; font-weight: 800; }
    .plain-language-box span { color: #22D3EE; font-size: 10px; font-weight: 950; text-transform: uppercase; letter-spacing: .14em; }
    .plain-language-box h3 { margin: 7px 0; font-size: 21px; }
    .plain-language-box p, .justice-info-block p { color: var(--text-muted); line-height: 1.58; margin: 7px 0 0; }
    .ai-loading { color: #F0B753 !important; }
    .justice-info-block h4 { display: flex; align-items: center; gap: 7px; margin: 0 0 8px; color: var(--text); font-size: 14px; }
    .justice-info-block h4 svg { color: #22D3EE; }
    .family-topic-list { display: flex; flex-wrap: wrap; gap: 8px; }
    .family-topic-list span svg { color: #F0B753; }
    .family-add-row { display: flex; gap: 10px; margin-top: 14px; }
    .family-add-row input { flex: 1; min-width: 0; }
    .justice-radar-compact { display: grid; grid-template-columns: 1fr .85fr; gap: 24px; margin: 0 0 88px; }
    .justice-compact-feed { display: grid; gap: 10px; }
    .justice-compact-feed div { padding: 15px; border-radius: 20px; background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.10); }
    .justice-compact-feed strong { color: #F0B753; font-size: 11px; text-transform: uppercase; letter-spacing: .12em; }
    .justice-compact-feed p { margin: 6px 0 0; color: var(--text); line-height: 1.35; }
    @keyframes justiceParticles { from { transform: translate3d(0,0,0); } to { transform: translate3d(-54px,-54px,0); } }
    @media (max-width: 1050px) { .justice-radar-hero, .justice-radar-grid, .justice-radar-compact { grid-template-columns: 1fr; } .justice-detail-panel { position: relative; top: 0; } }
    @media (max-width: 640px) { .justice-radar-page { padding: 32px 16px 110px; } .family-add-row { flex-direction: column; } .justice-action-row button, .topic-chip-grid button { flex: 1 1 100%; justify-content: center; } }
  `}</style>;
}