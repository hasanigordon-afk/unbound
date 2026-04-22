// AI Stein — draggable floating bubble (snaps to nearest corner)
import React, { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { AIS } from "./aiSteinConfig";

const STORAGE_KEY = "aistein-corner";
const MARGIN = 18;
const SIZE = 56;

// Corners: tl, tr, bl, br
const cornerPos = (corner) => {
  const vw = typeof window !== "undefined" ? window.innerWidth  : 400;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const safeBottom = 96; // above bottom nav
  switch (corner) {
    case "tl": return { x: MARGIN, y: MARGIN + 60 };
    case "tr": return { x: vw - SIZE - MARGIN, y: MARGIN + 60 };
    case "bl": return { x: MARGIN, y: vh - SIZE - safeBottom };
    case "br":
    default:   return { x: vw - SIZE - MARGIN, y: vh - SIZE - safeBottom };
  }
};

const nearestCorner = (x, y) => {
  const vw = window.innerWidth, vh = window.innerHeight;
  const leftSide = x + SIZE / 2 < vw / 2;
  const topSide  = y + SIZE / 2 < vh / 2;
  return `${topSide ? "t" : "b"}${leftSide ? "l" : "r"}`;
};

export default function AISteinBubble({ onOpen }) {
  const [corner, setCorner] = useState(
    () => (typeof localStorage !== "undefined" && localStorage.getItem(STORAGE_KEY)) || "br"
  );
  const [pos, setPos] = useState(() => cornerPos(corner));
  const [dragging, setDragging] = useState(false);
  const startRef = useRef({ x: 0, y: 0, px: 0, py: 0, moved: false });

  useEffect(() => { setPos(cornerPos(corner)); }, [corner]);
  useEffect(() => {
    const onResize = () => setPos(cornerPos(corner));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [corner]);

  const onPointerDown = (e) => {
    e.preventDefault();
    const p = "touches" in e ? e.touches[0] : e;
    startRef.current = { x: p.clientX, y: p.clientY, px: pos.x, py: pos.y, moved: false };
    setDragging(true);
  };

  const onPointerMove = (e) => {
    if (!dragging) return;
    const p = "touches" in e ? e.touches[0] : e;
    const dx = p.clientX - startRef.current.x;
    const dy = p.clientY - startRef.current.y;
    if (Math.abs(dx) + Math.abs(dy) > 5) startRef.current.moved = true;
    setPos({
      x: Math.max(4, Math.min(window.innerWidth  - SIZE - 4, startRef.current.px + dx)),
      y: Math.max(4, Math.min(window.innerHeight - SIZE - 4, startRef.current.py + dy)),
    });
  };

  const onPointerUp = () => {
    if (!dragging) return;
    setDragging(false);
    if (!startRef.current.moved) { onOpen?.(); return; }
    const c = nearestCorner(pos.x, pos.y);
    setCorner(c);
    try { localStorage.setItem(STORAGE_KEY, c); } catch {}
  };

  return (
    <button
      onMouseDown={onPointerDown}
      onMouseMove={onPointerMove}
      onMouseUp={onPointerUp}
      onMouseLeave={onPointerUp}
      onTouchStart={onPointerDown}
      onTouchMove={onPointerMove}
      onTouchEnd={onPointerUp}
      aria-label="Open AI Stein"
      style={{
        position: "fixed",
        left: pos.x, top: pos.y,
        width: SIZE, height: SIZE, borderRadius: "50%",
        background: `linear-gradient(135deg, ${AIS.accent} 0%, #8B6228 100%)`,
        color: "#fff", border: "none", cursor: dragging ? "grabbing" : "pointer",
        boxShadow: "0 8px 28px rgba(184,130,58,0.45), 0 2px 8px rgba(0,0,0,0.12)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 9998,
        transition: dragging ? "none" : "left 0.35s cubic-bezier(0.2,0.8,0.2,1), top 0.35s cubic-bezier(0.2,0.8,0.2,1), transform 0.15s",
        transform: dragging ? "scale(1.06)" : "scale(1)",
        touchAction: "none",
        userSelect: "none",
      }}
    >
      <Sparkles style={{ width: 22, height: 22 }} strokeWidth={2} />
      <span style={{
        position: "absolute", bottom: -2, right: -2,
        width: 14, height: 14, borderRadius: "50%",
        background: AIS.green, border: "2px solid #fff",
      }} />
    </button>
  );
}