import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { X } from "lucide-react";

const COMMON_SUBSTANCES = ["Alcohol", "Opioids", "Cocaine", "Methamphetamine", "Cannabis", "Benzodiazepines"];

export default function StepCredentials({ data, onNext }) {
  const [credential, setCredential] = useState(data.credential_type || "");
  const [licenseState, setLicenseState] = useState(data.license_state || "");
  const [specialties, setSpecialties] = useState(data.specialties_substances || []);
  const [other, setOther] = useState("");

  const toggle = (sub) => {
    setSpecialties(prev => prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]);
  };

  const addOther = () => {
    if (other.trim() && !specialties.includes(other.trim())) {
      setSpecialties([...specialties, other.trim()]);
      setOther("");
    }
  };

  const isValid = credential.trim() && licenseState.trim() && specialties.length > 0;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="px-2">
      <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">
        Professional credentials
      </h2>
      <p className="text-slate-500 text-center mb-6">Tell us about your license</p>

      <div className="max-w-sm mx-auto space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Credential Type
          </label>
          <Input
            value={credential}
            onChange={(e) => setCredential(e.target.value)}
            placeholder="e.g., LCSW, LMFT, CADC"
            className="h-12"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            License State
          </label>
          <Input
            value={licenseState}
            onChange={(e) => setLicenseState(e.target.value)}
            placeholder="e.g., CA, NY, TX"
            className="h-12"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Specialty Substances
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {COMMON_SUBSTANCES.map(sub => (
              <button
                key={sub}
                onClick={() => toggle(sub)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  specialties.includes(sub)
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
              placeholder="Other specialty"
              className="h-10"
              onKeyPress={(e) => e.key === "Enter" && addOther()}
            />
            <Button onClick={addOther} variant="outline" className="h-10 px-4">Add</Button>
          </div>

          {specialties.filter(s => !COMMON_SUBSTANCES.includes(s)).map(sub => (
            <div key={sub} className="flex items-center gap-2 bg-teal-50 px-3 py-2 rounded-lg mt-2">
              <span className="text-sm text-teal-700 flex-1">{sub}</span>
              <button onClick={() => toggle(sub)} className="text-teal-600 hover:text-teal-800">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 max-w-sm mx-auto">
        <Button
          className="w-full h-14 text-base bg-teal-600 hover:bg-teal-700"
          disabled={!isValid}
          onClick={() => onNext({ 
            credential_type: credential, 
            license_state: licenseState,
            specialties_substances: specialties
          })}
        >
          Continue
        </Button>
      </div>
    </motion.div>
  );
}