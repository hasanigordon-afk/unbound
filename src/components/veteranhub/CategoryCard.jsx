import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink, Phone } from "lucide-react";
import { VH_COLORS as C } from "./vetHubData";

function ItemRow({ item, color }) {
  const inner = (
    <div style={{
      display: "flex", alignItems: "center", gap: 10, padding: "11px 12px",
      borderRadius: 12, background: "#fff",
      border: `1px solid ${C.border}`,
      transition: "background 0.15s",
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13.5, fontWeight: 700, color: C.text, lineHeight: 1.3 }}>{item.label}</p>
        {item.desc && <p style={{ fontSize: 11.5, color: C.dim, marginTop: 2 }}>{item.desc}</p>}
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
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 18, padding: 14, scrollMarginTop: 80,
      }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: `${category.color}14`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
        }}>{category.emoji}</div>
        <div>
          <p style={{
            fontFamily: "'Lora', Georgia, serif",
            fontSize: 17, fontWeight: 700, color: C.text, lineHeight: 1.2,
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