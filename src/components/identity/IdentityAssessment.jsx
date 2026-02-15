import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, FileText, CreditCard, IdCard, Car } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const DOCUMENTS = [
  { key: "has_birth_certificate", label: "Birth Certificate", icon: FileText },
  { key: "has_social_security_card", label: "Social Security Card", icon: CreditCard },
  { key: "has_state_id", label: "State ID", icon: IdCard },
  { key: "has_drivers_license", label: "Driver's License", icon: Car }
];

export default function IdentityAssessment() {
  const [selections, setSelections] = useState({
    has_birth_certificate: false,
    has_social_security_card: false,
    has_state_id: false,
    has_drivers_license: false
  });
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const status = await base44.entities.IdentityStatus.create({
        ...data,
        assessment_completed: true
      });

      // Auto-generate checklist items for missing documents
      const checklistPromises = [];
      if (!data.has_birth_certificate) {
        checklistPromises.push(
          base44.entities.IdentityChecklistItem.create({
            document_type: "birth_certificate",
            status: "not_started"
          })
        );
      }
      if (!data.has_social_security_card) {
        checklistPromises.push(
          base44.entities.IdentityChecklistItem.create({
            document_type: "social_security_card",
            status: "not_started"
          })
        );
      }
      if (!data.has_state_id) {
        checklistPromises.push(
          base44.entities.IdentityChecklistItem.create({
            document_type: "state_id",
            status: "not_started"
          })
        );
      }

      await Promise.all(checklistPromises);
      return status;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["identity-status"] });
      queryClient.invalidateQueries({ queryKey: ["identity-checklist"] });
      toast.success("Assessment saved!");
    }
  });

  const handleToggle = (key) => {
    setSelections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = () => {
    saveMutation.mutate(selections);
  };

  const hasNone = !Object.values(selections).some(v => v);

  return (
    <div className="min-h-screen" style={{ background: '#0B0F1F' }}>
      <div className="px-5 pt-8 pb-10 max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(47,243,224,0.2)' }}>
            <Shield className="w-8 h-8" style={{ color: '#2FF3E0' }} />
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#FFFFFF' }}>Identity Bridge</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Let's help you rebuild your legal identity
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 mb-6"
        >
          <h2 className="font-semibold mb-4" style={{ color: '#FFFFFF' }}>
            Which of these do you currently have?
          </h2>
          <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Select all that apply
          </p>

          <div className="space-y-4">
            {DOCUMENTS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => handleToggle(key)}
                className="w-full flex items-center gap-4 p-4 rounded-xl transition-all"
                style={{
                  background: selections[key] ? 'rgba(47,243,224,0.1)' : 'rgba(255,255,255,0.03)',
                  border: selections[key] ? '2px solid #2FF3E0' : '2px solid transparent'
                }}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(47,243,224,0.15)' }}>
                  <Icon className="w-5 h-5" style={{ color: '#2FF3E0' }} />
                </div>
                <span className="flex-1 text-left font-medium" style={{ color: '#FFFFFF' }}>
                  {label}
                </span>
                <Checkbox checked={selections[key]} />
              </button>
            ))}

            <button
              onClick={() => setSelections({
                has_birth_certificate: false,
                has_social_security_card: false,
                has_state_id: false,
                has_drivers_license: false
              })}
              className="w-full flex items-center gap-4 p-4 rounded-xl transition-all"
              style={{
                background: hasNone ? 'rgba(255,107,107,0.1)' : 'rgba(255,255,255,0.03)',
                border: hasNone ? '2px solid #FF6B6B' : '2px solid transparent'
              }}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,107,107,0.15)' }}>
                <Shield className="w-5 h-5" style={{ color: '#FF6B6B' }} />
              </div>
              <span className="flex-1 text-left font-medium" style={{ color: '#FFFFFF' }}>
                None of these
              </span>
              <Checkbox checked={hasNone} />
            </button>
          </div>
        </motion.div>

        <Button
          onClick={handleSubmit}
          disabled={saveMutation.isPending}
          className="w-full h-12 text-base font-semibold rounded-xl"
          style={{ background: '#2FF3E0', color: '#0B0F1F' }}
        >
          {saveMutation.isPending ? "Saving..." : "Continue"}
        </Button>
      </div>
    </div>
  );
}