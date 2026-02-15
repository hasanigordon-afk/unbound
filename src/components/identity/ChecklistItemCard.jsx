import React from "react";
import { Button } from "@/components/ui/button";
import { FileText, CreditCard, IdCard, DollarSign, Heart, Home, Circle, Loader2, CheckCircle2 } from "lucide-react";

const DOCUMENT_INFO = {
  birth_certificate: {
    label: "Birth Certificate",
    icon: FileText,
    description: "Official record of your birth"
  },
  social_security_card: {
    label: "Social Security Card",
    icon: CreditCard,
    description: "Needed for employment and benefits"
  },
  state_id: {
    label: "State ID",
    icon: IdCard,
    description: "Primary identification document"
  },
  drivers_license: {
    label: "Driver's License",
    icon: IdCard,
    description: "ID and driving privilege"
  },
  snap: {
    label: "SNAP Benefits",
    icon: DollarSign,
    description: "Food assistance program"
  },
  medicaid: {
    label: "Medicaid",
    icon: Heart,
    description: "Health insurance coverage"
  },
  housing_assistance: {
    label: "Housing Assistance",
    icon: Home,
    description: "Help with housing costs"
  }
};

const STATUS_ICONS = {
  not_started: Circle,
  in_progress: Loader2,
  completed: CheckCircle2
};

export default function ChecklistItemCard({ item, onSelect }) {
  const info = DOCUMENT_INFO[item.document_type];
  const Icon = info?.icon || FileText;
  const StatusIcon = STATUS_ICONS[item.status];

  return (
    <div className="glass-card p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(47,243,224,0.15)' }}>
          <Icon className="w-5 h-5" style={{ color: '#2FF3E0' }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-sm" style={{ color: '#FFFFFF' }}>
              {info?.label || item.document_type}
            </h3>
            <StatusIcon
              className={`w-4 h-4 ${item.status === 'in_progress' ? 'animate-spin' : ''}`}
              style={{
                color: item.status === 'completed' ? '#2FF3E0' : 'rgba(255,255,255,0.4)'
              }}
            />
          </div>
          <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {info?.description}
          </p>
          <div className="flex gap-2">
            <Button
              onClick={onSelect}
              size="sm"
              className="flex-1"
              style={{ background: '#2FF3E0', color: '#0B0F1F' }}
            >
              {item.status === 'not_started' ? 'Start' : 'View Instructions'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}