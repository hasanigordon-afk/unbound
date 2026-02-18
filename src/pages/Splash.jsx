import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "./utils";
import { motion } from "framer-motion";
import { Link2Off } from "lucide-react";

export default function Splash() {
  const navigate = useNavigate();
  const [showText, setShowText] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Show text after 1.3s (0.8s fade in + 0.5s delay)
    const textTimer = setTimeout(() => {
      setShowText(true);
    }, 1300);

    // Start fade out after 3.4s (1.3s + 0.6s text fade + 1.5s hold)
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 3400);

    // Navigate after 3.9s (fade out duration 0.5s)
    const navTimer = setTimeout(() => {
      navigate(createPageUrl("Home"));
    }, 3900);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(fadeTimer);
      clearTimeout(navTimer);
    };
  }, [navigate]);

  return (
    <div 
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{ background: '#000000' }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: fadeOut ? 0 : 0.8 }}
        transition={{ 
          duration: fadeOut ? 0.5 : 0.8,
          ease: "easeInOut"
        }}
        className="flex flex-col items-center"
      >
        <Link2Off className="w-20 h-20 mb-8" style={{ color: '#FFFFFF', strokeWidth: 1 }} />
      </motion.div>

      {showText && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: fadeOut ? 0 : 1 }}
          transition={{ 
            duration: fadeOut ? 0.5 : 0.6,
            ease: "easeInOut"
          }}
          className="text-center px-8 max-w-md"
          style={{ 
            color: '#FFFFFF',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: '18px',
            fontWeight: 500,
            letterSpacing: '0.01em',
            lineHeight: '1.6'
          }}
        >
          You are not your past. You are your next decision.
        </motion.p>
      )}
    </div>
  );
}