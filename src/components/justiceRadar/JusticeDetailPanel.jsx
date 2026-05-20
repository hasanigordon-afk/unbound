import React from "react";
import { BookOpen, Building, HelpCircle, Lightbulb, Scale } from "lucide-react";

export default function JusticeDetailPanel({ article, aiSummary, loading }) {
  return (
    <aside className="justice-detail-panel">
      <div className="legal-disclaimer">
        <Scale size={18} />
        <p>ReZilient provides information and awareness, not legal advice. Consult legal professionals for case-specific guidance.</p>
      </div>

      <div className="plain-language-box">
        <span>Plain language summary</span>
        <h3>{article.title}</h3>
        {loading ? <p className="ai-loading">AI is translating this into simple terms...</p> : aiSummary ? <p>{aiSummary}</p> : <p>{article.summary}</p>}
      </div>

      <InfoBlock icon={BookOpen} title="What changed?" items={[article.changed]} />
      <InfoBlock icon={Lightbulb} title="Who may be affected?" items={[article.affected]} />
      <InfoBlock icon={Building} title="What this could mean in the future" items={[article.future]} />
      <InfoBlock icon={HelpCircle} title="Questions you may want to ask a lawyer" items={article.lawyerQuestions} />
      <InfoBlock icon={Scale} title="Resources and organizations that may help" items={article.resources} />
    </aside>
  );
}

function InfoBlock({ icon: Icon, title, items }) {
  return (
    <div className="justice-info-block">
      <h4><Icon size={15} /> {title}</h4>
      {items.map((item) => <p key={item}>{item}</p>)}
    </div>
  );
}