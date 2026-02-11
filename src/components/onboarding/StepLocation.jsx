import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { MapPin, Navigation, Loader2 } from "lucide-react";

export default function StepLocation({ data, onNext }) {
  const [mode, setMode] = useState("manual");
  const [city, setCity] = useState(data.location_city || "");
  const [state, setState] = useState(data.location_state || "");
  const [zip, setZip] = useState(data.location_zip || "");
  const [loading, setLoading] = useState(false);
  const [gpsOk, setGpsOk] = useState(false);
  const [lat, setLat] = useState(data.location_lat || null);
  const [lng, setLng] = useState(data.location_lng || null);

  const handleGPS = () => {
    if (!navigator.geolocation) return;
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setGpsOk(true);
        setLoading(false);
        setMode("gps");
      },
      () => {
        setLoading(false);
        setMode("manual");
      }
    );
  };

  const canContinue = mode === "gps" ? gpsOk : (city && state);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="px-2">
      <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">
        Your location
      </h2>
      <p className="text-slate-500 text-center mb-8">So we can find resources near you</p>

      <div className="max-w-sm mx-auto space-y-4">
        <Button
          variant="outline"
          className="w-full h-14 gap-3 border-2 border-slate-200 hover:border-teal-300"
          onClick={handleGPS}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
          ) : gpsOk ? (
            <Navigation className="w-5 h-5 text-teal-600" />
          ) : (
            <Navigation className="w-5 h-5 text-slate-400" />
          )}
          {gpsOk ? "Location detected" : "Use my location"}
        </Button>

        <div className="flex items-center gap-3 text-slate-400">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs">or enter manually</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        <div className="space-y-3">
          <Input
            placeholder="City"
            value={city}
            onChange={(e) => { setCity(e.target.value); setMode("manual"); }}
            className="h-12 rounded-xl"
          />
          <div className="flex gap-3">
            <Input
              placeholder="State"
              value={state}
              onChange={(e) => { setState(e.target.value); setMode("manual"); }}
              className="h-12 rounded-xl flex-1"
            />
            <Input
              placeholder="ZIP (optional)"
              value={zip}
              onChange={(e) => { setZip(e.target.value); setMode("manual"); }}
              className="h-12 rounded-xl w-28"
            />
          </div>
        </div>
      </div>

      <div className="mt-8 max-w-sm mx-auto">
        <Button
          className="w-full h-14 text-base bg-teal-600 hover:bg-teal-700"
          disabled={!canContinue}
          onClick={() => onNext({
            location_city: city || undefined,
            location_state: state || undefined,
            location_zip: zip || undefined,
            location_lat: lat,
            location_lng: lng,
          })}
        >
          Finish Setup
        </Button>
      </div>
    </motion.div>
  );
}