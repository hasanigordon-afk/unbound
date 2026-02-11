import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";

export default function StepBasics({ data, onNext }) {
  const [displayName, setDisplayName] = useState(data.display_name || "");
  const [bio, setBio] = useState(data.bio || "");

  const isValid = displayName.trim() && bio.trim();

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="px-2">
      <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">
        Tell us about yourself
      </h2>
      <p className="text-slate-500 text-center mb-8">How members will see you</p>

      <div className="space-y-4 max-w-sm mx-auto">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Display Name
          </label>
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g., Sarah M."
            className="h-12"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Short Bio
          </label>
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell members a bit about yourself and what you can help with..."
            className="h-24 resize-none"
          />
          <p className="text-xs text-slate-400 mt-1">{bio.length} characters</p>
        </div>
      </div>

      <div className="mt-8 max-w-sm mx-auto">
        <Button
          className="w-full h-14 text-base bg-teal-600 hover:bg-teal-700"
          disabled={!isValid}
          onClick={() => onNext({ display_name: displayName, bio })}
        >
          Continue
        </Button>
      </div>
    </motion.div>
  );
}