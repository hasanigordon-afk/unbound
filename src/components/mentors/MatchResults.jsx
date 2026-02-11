import React from "react";
import { motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import MentorCard from "./MentorCard";

export default function MatchResults({ matches, onClose, onConnect }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-50 rounded-t-3xl sm:rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
      >
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-600" />
            <h2 className="font-bold text-lg text-slate-900">Your Top Matches</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-4">
          {matches.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">No matches found. Try adjusting your preferences.</p>
            </div>
          ) : (
            matches.map((match) => (
              <div key={match.mentor.id} className="space-y-2">
                <MentorCard mentor={match.mentor} onConnect={onConnect} />
                {match.reason && (
                  <p className="text-xs text-slate-500 px-2">
                    <span className="font-medium">Why matched:</span> {match.reason}
                  </p>
                )}
              </div>
            ))
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4">
          <Button onClick={onClose} variant="outline" className="w-full">
            Close
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}