import React from "react";
import { Bookmark, HelpCircle, Send, Share2 } from "lucide-react";

export default function JusticeArticleCard({ article, selected, onSelect, onExplain }) {
  const Icon = article.icon;

  return (
    <article className={`justice-article-card tone-${article.tone} ${selected ? "selected" : ""}`} onClick={() => onSelect(article)}>
      <div className="justice-card-head">
        <div className="justice-card-icon"><Icon size={22} /></div>
        <div>
          <span>{article.category} · {article.state}</span>
          <h3>{article.title}</h3>
        </div>
      </div>
      <p>{article.summary}</p>
      <div className="justice-action-row" onClick={(event) => event.stopPropagation()}>
        <button><Bookmark size={14} /> Save article</button>
        <button><Share2 size={14} /> Share with family</button>
        <button><Send size={14} /> Send to mentor</button>
        <button onClick={() => onExplain(article)}><HelpCircle size={14} /> Ask AI</button>
      </div>
    </article>
  );
}