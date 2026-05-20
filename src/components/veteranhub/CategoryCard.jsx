import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink, Phone } from "lucide-react";
import { VH_COLORS as C } from "./vetHubData";

function ItemRow({ item, color }) {
  const inner = (
    <div style={{
    display: "flex", alignItems: "center", gap: 10, padding: "12px 13px",
    borderRadius: 16, background: "rgba(255,255,255,.055)",
    border: "1px solid rgba(255,255,255,.10)",
    transition: "transform 0.18s, background 0.18s, border-color 0.18s",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,.06)",
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13.5, fontWeight: 850, color: "var(--text)", lineHeight: 1.3 }}>{item.label}</p>
        {item.desc && <p style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>{item.desc}</p>}
      </div>
      {item.phone ? <Phone style={{ width: 14, height: 14, color }} />
        : item.ext ? <ExternalLink style={{ width: 14, height: 14, color }} />
        : <ArrowRight style={{ width: 14, height: 14, color }} />}
    </div>
  );

  if (item.route) return <Link to={item.route} style={{ textDecoration: "none" }}>{inner}</Link>;
  return <a href={item.href} target={item.ext ? "_blank" : undefined} rel="noopener noreferrer" style={{ textDecoration: "none" }}>{inner}</a>;
}

export default function CategoryCard({ category, sectionRef }) {
  return (
    <div ref={sectionRef} id={`vh-cat-${category.key}`}
      style={{
        background: "linear-gradient(145deg, rgba(255,255,255,.10), rgba(13,18,32,.74))", border: "1px solid rgba(190,225,255,.15)",
        borderRadius: 26, padding: 18, scrollMarginTop: 90,
        boxShadow: "0 20px 54px rgba(0,0,0,.30), inset 0 1px 0 rgba(255,255,255,.10)",
        backdropFilter: "blur(24px) saturate(160%)", overflow: "hidden",
      }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 46, height: 46, borderRadius: 16,
          background: `${category.color}22`, border: `1px solid ${category.color}44`, boxShadow: `0 0 24px ${category.color}22`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
        }}>{category.emoji}</div>
        <div>
          <p style={{
            fontFamily: "'Lora', Georgia, serif",
            fontSize: 19, fontWeight: 700, color: "var(--text)", lineHeight: 1.2,
          }}>{category.title}</p>
          <p style={{ fontSize: 11, fontWeight: 700, color: category.color,
            letterSpacing: ".06em", textTransform: "uppercase" }}>
            {category.items.length} resources
          </p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {category.items.map((it) => <ItemRow key={it.label} item={it} color={category.color} />)}
      </div>
    </div>
  );
}