import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";

export default function StepBoundaries({ data, onNext }) {
  const [agreed, setAgreed] = useState(data.boundaries_acknowledged || false);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="px-2">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-6">
        <Shield className="w-8 h-8 text-amber-600" />
      </div>
      
      <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">
        Important boundaries
      </h2>
      <p className="text-slate-500 text-center mb-6">Please review carefully</p>

      <div className="max-w-md mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3 text-sm text-slate-600 mb-6">
        <p>✓ I will maintain professional boundaries with members</p>
        <p>✓ I will not share personal contact information</p>
        <p>✓ I understand this platform is for peer support, not emergency services</p>
        <p>✓ I will report any crisis situations immediately</p>
        <p>✓ I will respect member privacy and confidentiality</p>
      </div>

      <div className="max-w-sm mx-auto">
        <label className="flex items-start gap-3 mb-6 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 w-5 h-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
          />
          <span className="text-sm text-slate-700">
            I have read and agree to these boundaries and will uphold them in all interactions
          </span>
        </label>

        <Button
          className="w-full h-14 text-base bg-teal-600 hover:bg-teal-700"
          disabled={!agreed}
          onClick={() => onNext({ boundaries_acknowledged: true })}
        >
          Continue
        </Button>
      </div>
    </motion.div>
  );
}