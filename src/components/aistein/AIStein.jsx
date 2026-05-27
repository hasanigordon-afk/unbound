// ReZilient AI — global mount: renders bubble + panel across all pages
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import AISteinBubble from "./AISteinBubble";
import AISteinPanel from "./AISteinPanel";

// Routes where ReZilient AI should NOT appear (splash/onboarding/auth)
const HIDE_ON = ["/splash", "/Splash", "/AhHaOnboarding", "/VeteranMode"];

export default function AIStein() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  if (HIDE_ON.includes(pathname)) return null;

  return (
    <>
      {!open && <AISteinBubble onOpen={() => setOpen(true)} />}
      <AISteinPanel open={open} onClose={() => setOpen(false)} />
    </>
  );
}