import React from "react";
import { Progress } from "@/components/ui/progress";

export default function IdentityProgress({ status }) {
  const totalDocuments = 4;
  const hasDocuments = [
    status?.has_birth_certificate,
    status?.has_social_security_card,
    status?.has_state_id,
    status?.has_drivers_license
  ].filter(Boolean).length;

  const progressPercentage = Math.round((hasDocuments / totalDocuments) * 100);

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium" style={{ color: '#FFFFFF' }}>Identity Progress</span>
        <span className="text-sm font-bold" style={{ color: '#2FF3E0' }}>{progressPercentage}%</span>
      </div>
      <Progress value={progressPercentage} className="h-2" />
      <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
        {hasDocuments} of {totalDocuments} documents obtained
      </p>
    </div>
  );
}