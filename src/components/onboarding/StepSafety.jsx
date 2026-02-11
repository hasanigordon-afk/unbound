import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Phone, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function StepSafety({ data, onNext }) {
  const [answer, setAnswer] = useState(data.safety_flagged || false);
  const [showCrisis, setShowCrisis] = useState(false);

  const handleYes = () => {
    setAnswer(true);
    setShowCrisis(true);
  };

  const handleContinue = () => {
    onNext({ safety_flagged: answer });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center px-2"
    >
      <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center mb-6">
        <ShieldAlert className="w-8 h-8 text-rose-500" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">
        Before we begin
      </h2>
      <p className="text-slate-500 text-center mb-8 max-w-sm">
        Are you in immediate danger or thinking about harming yourself?
      </p>

      {!showCrisis ? (
        <div className="flex flex-col gap-3 w-full max-w-sm">
          <Button
            variant="outline"
            className="h-14 text-base border-rose-200 text-rose-600 hover:bg-rose-50"
            onClick={handleYes}
          >
            Yes, I need help now
          </Button>
          <Button
            className="h-14 text-base bg-teal-600 hover:bg-teal-700"
            onClick={() => onNext({ safety_flagged: false })}
          >
            No, I'm okay to continue
          </Button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm bg-rose-50 border border-rose-200 rounded-2xl p-6 space-y-4"
        >
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-rose-600" />
            <span className="font-bold text-rose-800 text-lg">988 Suicide & Crisis Lifeline</span>
          </div>
          <p className="text-rose-700 text-sm leading-relaxed">
            Call or text <strong>988</strong> anytime, 24/7. It's free, confidential, and available in English and Spanish.
          </p>
          <a
            href="tel:988"
            className="block w-full text-center py-3 bg-rose-600 text-white rounded-xl font-semibold hover:bg-rose-700 transition-colors"
          >
            Call 988 Now
          </a>
          <p className="text-rose-600 text-xs text-center">
            If you're in immediate physical danger, call <strong>911</strong>.
          </p>
          <div className="pt-2 border-t border-rose-200">
            <Button
              variant="ghost"
              className="w-full text-slate-600 hover:text-slate-800"
              onClick={handleContinue}
            >
              Continue to app <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}