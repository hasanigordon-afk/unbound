import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { X } from "lucide-react";

const COMMON = ["Alcohol", "Opioids", "Cocaine", "Methamphetamine", "Cannabis", "Benzodiazepines"];
const TIME_RANGES = ["0-6mo", "6-12mo", "1-3y", "3-5y", "5y+"];

export default function StepLivedExperience({ data, onNext }) {
  const [substances, setSubstances] = useState(data.lived_experience_substances || []);
  const [other, setOther] = useState("");
  const [primary, setPrimary] = useState(data.primary_lived_experience || "");
  const [timeRange, setTimeRange] = useState(data.time_in_recovery_range || "");

  const toggle = (sub) => {
    setSubstances(prev => prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]);
  };

  const addOther = () => {
    if (other.trim() && !substances.includes(other.trim())) {
      setSubstances([...substances, other.trim()]);
      setOther("");
    }
  };

  const isValid = substances.length > 0 && primary && timeRange;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="px-2">
      <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">
        Your lived experience
      </h2>
      <p className="text-slate-500 text-center mb-6">Select substances you have experience with</p>

      <div className="max-w-sm mx-auto space-y-6">
        <div className="flex flex-wrap gap-2">
          {COMMON.map(sub => (
            <button
              key={sub}
              onClick={() => toggle(sub)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                substances.includes(sub)
                  ? "bg-teal-500 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            value={other}
            onChange={(e) => setOther(e.target.value)}
            placeholder="Other substance"
            className="h-10"
            onKeyPress={(e) => e.key === "Enter" && addOther()}
          />
          <Button onClick={addOther} variant="outline" className="h-10 px-4">Add</Button>
        </div>

        {substances.filter(s => !COMMON.includes(s)).map(sub => (
          <div key={sub} className="flex items-center gap-2 bg-teal-50 px-3 py-2 rounded-lg">
            <span className="text-sm text-teal-700 flex-1">{sub}</span>
            <button onClick={() => toggle(sub)} className="text-teal-600 hover:text-teal-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Primary substance you're in recovery from
          </label>
          <select
            value={primary}
            onChange={(e) => setPrimary(e.target.value)}
            className="w-full h-12 px-3 border border-slate-200 rounded-xl bg-white text-slate-700"
          >
            <option value="">Select...</option>
            {substances.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Time in recovery
          </label>
          <div className="grid grid-cols-2 gap-2">
            {TIME_RANGES.map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                  timeRange === range
                    ? "bg-teal-500 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 max-w-sm mx-auto">
        <Button
          className="w-full h-14 text-base bg-teal-600 hover:bg-teal-700"
          disabled={!isValid}
          onClick={() => onNext({ 
            lived_experience_substances: substances, 
            primary_lived_experience: primary,
            time_in_recovery_range: timeRange 
          })}
        >
          Continue
        </Button>
      </div>
    </motion.div>
  );
}