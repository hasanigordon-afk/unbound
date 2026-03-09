import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "./utils";
import { motion } from "framer-motion";

export default function Splash() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState("logo"); // logo → tagline → hint

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("tagline"), 900);
    const t2 = setTimeout(() => setPhase("hint"), 1800);

    // Auto-detect returning user and skip role select
    const autoNavigate = async () => {
      try {
        const user = await base44.auth.me();
        if (user) {
          const [counselorProfiles, memberProfiles] = await Promise.all([
            base44.entities.CounselorProfile.filter({ counselor_email: user.email }),
            base44.entities.MemberProfile.filter({ created_by: user.email }),
          ]);
          if (counselorProfiles.length > 0) {
            navigate(createPageUrl("ProfessionalPortal"), { replace: true }); return;
          }
          if (memberProfiles.length > 0 && memberProfiles[0]?.onboarding_complete) {
            navigate(createPageUrl("Home"), { replace: true }); return;
          }
        }
      } catch {}
      navigate(createPageUrl("RoleSelect"));
    };

    const t3 = setTimeout(autoNavigate, 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [navigate]);

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center px-8"
      style={{ background: "linear-gradient(160deg, #0D1B2A 0%, #1A2F4A 100%)" }}
      onClick={() => navigate(createPageUrl("RoleSelect"))}
    >
      {/* Logo word-mark */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="flex flex-col items-center"
      >
        {/* Simple visual mark — two overlapping circles suggesting connection */}
        <div className="relative mb-6" style={{ width: 72, height: 72 }}>
          <div style={{
            position: "absolute", top: 0, left: 0,
            width: 52, height: 52, borderRadius: "50%",
            border: "2px solid rgba(74,144,226,0.7)",
          }} />
          <div style={{
            position: "absolute", bottom: 0, right: 0,
            width: 52, height: 52, borderRadius: "50%",
            border: "2px solid rgba(212,165,116,0.7)",
          }} />
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%,-50%)",
            width: 14, height: 14, borderRadius: "50%",
            background: "#4A90E2",
          }} />
        </div>

        <p style={{
          color: "#FFFFFF",
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}>
          Unbound
        </p>
      </motion.div>

      {/* Tagline */}
      {phase !== "logo" && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeIn" }}
          style={{
            color: "rgba(255,255,255,0.65)",
            fontSize: 16,
            fontWeight: 400,
            lineHeight: 1.6,
            textAlign: "center",
            marginTop: 20,
            maxWidth: 280,
          }}
        >
          You are not your past.{"\n"}You are your next decision.
        </motion.p>
      )}

      {/* Tap to continue hint */}
      {phase === "hint" && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 0.5 }}
          style={{
            color: "#FFFFFF",
            fontSize: 12,
            position: "absolute",
            bottom: 48,
          }}
        >
          Tap anywhere to continue
        </motion.p>
      )}
    </div>
  );
}