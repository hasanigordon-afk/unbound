import React from "react";
import { motion } from "framer-motion";
import { X, Phone, Globe, MapPin, Flag, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ResourceDetail({ resource, onClose, onSave, onReport }) {
  const categoryLabels = {
    detox: "Detox",
    inpatient: "Inpatient",
    outpatient_iop: "Outpatient/IOP",
    sober_living: "Sober Living",
    shelters: "Shelter",
    food_pantries: "Food Pantry",
    harm_reduction: "Harm Reduction",
    free_clinics: "Free Clinic",
    transportation: "Transportation",
    meetings_alcohol: "AA Meetings",
    meetings_substances: "NA/CA Meetings",
  };

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
        className="bg-white w-full max-w-2xl rounded-t-3xl sm:rounded-3xl max-h-[85vh] overflow-auto"
      >
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="font-bold text-lg text-slate-900">Resource Details</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">{resource.name}</h1>
            <Badge className="bg-teal-100 text-teal-700">{categoryLabels[resource.category]}</Badge>
          </div>

          {resource.address && (
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="font-medium text-slate-900">Location</p>
                <p className="text-slate-600">{resource.address}</p>
                <p className="text-slate-600">{resource.city}, {resource.state} {resource.zip}</p>
              </div>
            </div>
          )}

          {resource.phone && (
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-slate-400" />
              <div>
                <p className="font-medium text-slate-900">Phone</p>
                <a href={`tel:${resource.phone}`} className="text-teal-600 hover:text-teal-700">
                  {resource.phone}
                </a>
              </div>
            </div>
          )}

          {resource.website && (
            <div className="flex items-start gap-3">
              <Globe className="w-5 h-5 text-slate-400" />
              <div>
                <p className="font-medium text-slate-900">Website</p>
                <a href={resource.website} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:text-teal-700">
                  {resource.website}
                </a>
              </div>
            </div>
          )}

          {resource.notes && (
            <div>
              <p className="font-medium text-slate-900 mb-2">Notes</p>
              <p className="text-slate-600">{resource.notes}</p>
            </div>
          )}

          {resource.tags?.length > 0 && (
            <div>
              <p className="font-medium text-slate-900 mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {resource.tags.map((tag, i) => (
                  <span key={i} className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
                    {tag.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button onClick={() => onSave(resource)} className="flex-1 bg-teal-600 hover:bg-teal-700">
              <Bookmark className="w-4 h-4 mr-2" />
              Save Resource
            </Button>
            <Button onClick={() => onReport(resource)} variant="outline">
              <Flag className="w-4 h-4 mr-2" />
              Report Issue
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}