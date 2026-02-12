import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";

const BINAURAL_TRACKS = [
  { id: 1, name: "Deep Relaxation", frequency: "4 Hz (Theta)", duration: "10:00" },
  { id: 2, name: "Stress Relief", frequency: "6 Hz (Theta)", duration: "15:00" },
  { id: 3, name: "Focus & Clarity", frequency: "10 Hz (Alpha)", duration: "20:00" },
  { id: 4, name: "Sleep Induction", frequency: "2 Hz (Delta)", duration: "30:00" },
];

export default function Meditation() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(BINAURAL_TRACKS[0]);
  const [breathPhase, setBreathPhase] = useState("inhale");

  useEffect(() => {
    const breathInterval = setInterval(() => {
      setBreathPhase(prev => {
        if (prev === "inhale") return "hold1";
        if (prev === "hold1") return "exhale";
        if (prev === "exhale") return "hold2";
        return "inhale";
      });
    }, 4000);

    return () => clearInterval(breathInterval);
  }, []);

  const getBreathScale = () => {
    switch(breathPhase) {
      case "inhale": return 1.5;
      case "hold1": return 1.5;
      case "exhale": return 0.8;
      case "hold2": return 0.8;
      default: return 1;
    }
  };

  const getBreathText = () => {
    switch(breathPhase) {
      case "inhale": return "Breathe In";
      case "hold1": return "Hold";
      case "exhale": return "Breathe Out";
      case "hold2": return "Hold";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0B0F1F 0%, #1A1F3A 50%, #0B0F1F 100%)' }}>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              background: `radial-gradient(circle, rgba(123,92,255,0.1) 0%, transparent 70%)`,
              width: Math.random() * 300 + 100,
              height: Math.random() * 300 + 100,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 px-5 pt-8">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2" style={{ color: '#2FF3E0' }}>Meditation</h1>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>Relax with binaural beats and calming visuals</p>
          </div>

          {/* Breathing Circle */}
          <div className="flex items-center justify-center mb-8 h-80">
            <div className="relative">
              <motion.div
                className="w-64 h-64 rounded-full relative"
                style={{
                  background: 'radial-gradient(circle, rgba(47,243,224,0.3) 0%, rgba(123,92,255,0.2) 50%, transparent 100%)',
                  boxShadow: '0 0 60px rgba(47,243,224,0.4), 0 0 100px rgba(123,92,255,0.3)',
                }}
                animate={{
                  scale: getBreathScale(),
                }}
                transition={{
                  duration: 4,
                  ease: "easeInOut",
                }}
              >
                {/* Inner rings */}
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute inset-0 rounded-full border"
                    style={{
                      borderColor: `rgba(47,243,224,${0.3 - i * 0.1})`,
                      borderWidth: 2,
                    }}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 0.5,
                    }}
                  />
                ))}
              </motion.div>
              
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <p className="text-2xl font-medium" style={{ color: '#2FF3E0' }}>
                  {getBreathText()}
                </p>
              </motion.div>
            </div>
          </div>

          {/* Binaural Tracks */}
          <div className="glass-card p-5 mb-5">
            <h3 className="font-semibold mb-4" style={{ color: '#FFFFFF' }}>Binaural Beats</h3>
            <div className="space-y-2 mb-4">
              {BINAURAL_TRACKS.map(track => (
                <button
                  key={track.id}
                  onClick={() => setSelectedTrack(track)}
                  className="w-full p-3 rounded-xl text-left transition-all"
                  style={{
                    background: selectedTrack.id === track.id ? 'rgba(123,92,255,0.2)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${selectedTrack.id === track.id ? '#7B5CFF' : 'rgba(255,255,255,0.08)'}`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm" style={{ color: '#FFFFFF' }}>{track.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                        {track.frequency} • {track.duration}
                      </p>
                    </div>
                    {selectedTrack.id === track.id && isPlaying && (
                      <motion.div
                        className="flex gap-1"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="w-1 h-4 rounded-full" style={{ background: '#7B5CFF' }} />
                        ))}
                      </motion.div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex-1 font-medium"
                style={{ background: isPlaying ? '#2FF3E0' : '#7B5CFF', color: isPlaying ? '#0B0F1F' : '#FFFFFF' }}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Play
                  </>
                )}
              </Button>
              <Button
                onClick={() => setIsMuted(!isMuted)}
                variant="outline"
                size="icon"
                style={{ border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: '#FFFFFF' }}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Info Card */}
          <div className="glass-card p-5">
            <h4 className="font-semibold mb-2" style={{ color: '#FFFFFF' }}>How It Works</h4>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
              Binaural beats use two slightly different frequencies in each ear to create a perceived third tone. 
              This can help promote relaxation, focus, and better sleep. Use headphones for best results.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}