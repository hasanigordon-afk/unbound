import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, MapPin, Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function StateManagement() {
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    state_code: "",
    state_name: "",
    crisis_hotline: "",
    benefits_office_info: "",
    id_requirements: "",
    medicaid_info: "",
    probation_parole_resources: "",
    state_disclaimer: "",
    compliance_requirements: "",
  });

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: states = [] } = useQuery({
    queryKey: ["states"],
    queryFn: () => base44.entities.StateConfig.list("state_name"),
  });

  const createStateMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.StateConfig.create(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["states"]);
      setShowCreateDialog(false);
      setFormData({
        state_code: "",
        state_name: "",
        crisis_hotline: "",
        benefits_office_info: "",
        id_requirements: "",
        medicaid_info: "",
        probation_parole_resources: "",
        state_disclaimer: "",
        compliance_requirements: "",
      });
    },
  });

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#1a1f3a' }}>
        <p style={{ color: '#ffffff' }}>Access denied. Super admin only.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: '#1a1f3a' }}>
      <div className="px-6 pt-8 pb-6" style={{ background: '#0f1628', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#ffffff' }}>State Compliance Management</h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Configure state-specific compliance requirements</p>
      </div>

      <div className="px-6 py-6 space-y-6">
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="w-full"
          style={{ background: '#fbbf24', color: '#0f1628' }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add State Configuration
        </Button>

        <div className="space-y-3">
          {states.map(state => (
            <div key={state.id} className="p-5 rounded-xl" style={{ background: '#0f1628', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg" style={{ color: '#ffffff' }}>
                    {state.state_name} ({state.state_code})
                  </h3>
                  {state.crisis_hotline && (
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      Crisis: {state.crisis_hotline}
                    </p>
                  )}
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium`} style={{
                  background: state.is_active ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
                  color: state.is_active ? '#22c55e' : '#ef4444'
                }}>
                  {state.is_active ? 'Active' : 'Inactive'}
                </div>
              </div>

              {state.state_disclaimer && (
                <div className="p-3 rounded-lg text-xs mb-3" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', color: 'rgba(255,255,255,0.7)' }}>
                  <p className="font-semibold mb-1" style={{ color: '#fbbf24' }}>State Disclaimer:</p>
                  <p>{state.state_disclaimer}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-xs">
                {state.id_requirements && (
                  <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <p className="font-medium mb-1" style={{ color: '#ffffff' }}>ID Requirements</p>
                    <p style={{ color: 'rgba(255,255,255,0.6)' }}>{state.id_requirements.substring(0, 100)}...</p>
                  </div>
                )}
                {state.benefits_office_info && (
                  <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <p className="font-medium mb-1" style={{ color: '#ffffff' }}>Benefits Office</p>
                    <p style={{ color: 'rgba(255,255,255,0.6)' }}>{state.benefits_office_info.substring(0, 100)}...</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" style={{ background: '#0f1628', border: '1px solid rgba(255,255,255,0.1)' }}>
          <DialogHeader>
            <DialogTitle style={{ color: '#ffffff' }}>Add State Configuration</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label style={{ color: 'rgba(255,255,255,0.7)' }}>State Code (e.g., NJ)</Label>
                <Input
                  value={formData.state_code}
                  onChange={(e) => setFormData({...formData, state_code: e.target.value.toUpperCase()})}
                  maxLength={2}
                  style={{ background: '#1a1f3a', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}
                />
              </div>
              <div>
                <Label style={{ color: 'rgba(255,255,255,0.7)' }}>State Name</Label>
                <Input
                  value={formData.state_name}
                  onChange={(e) => setFormData({...formData, state_name: e.target.value})}
                  style={{ background: '#1a1f3a', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}
                />
              </div>
            </div>

            <div>
              <Label style={{ color: 'rgba(255,255,255,0.7)' }}>Crisis Hotline</Label>
              <Input
                value={formData.crisis_hotline}
                onChange={(e) => setFormData({...formData, crisis_hotline: e.target.value})}
                placeholder="1-800-XXX-XXXX"
                style={{ background: '#1a1f3a', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}
              />
            </div>

            <div>
              <Label style={{ color: 'rgba(255,255,255,0.7)' }}>Benefits Office Info</Label>
              <Textarea
                value={formData.benefits_office_info}
                onChange={(e) => setFormData({...formData, benefits_office_info: e.target.value})}
                rows={3}
                style={{ background: '#1a1f3a', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}
              />
            </div>

            <div>
              <Label style={{ color: 'rgba(255,255,255,0.7)' }}>ID Requirements</Label>
              <Textarea
                value={formData.id_requirements}
                onChange={(e) => setFormData({...formData, id_requirements: e.target.value})}
                rows={3}
                style={{ background: '#1a1f3a', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}
              />
            </div>

            <div>
              <Label style={{ color: 'rgba(255,255,255,0.7)' }}>Medicaid Information</Label>
              <Textarea
                value={formData.medicaid_info}
                onChange={(e) => setFormData({...formData, medicaid_info: e.target.value})}
                rows={3}
                style={{ background: '#1a1f3a', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}
              />
            </div>

            <div>
              <Label style={{ color: 'rgba(255,255,255,0.7)' }}>Probation/Parole Resources</Label>
              <Textarea
                value={formData.probation_parole_resources}
                onChange={(e) => setFormData({...formData, probation_parole_resources: e.target.value})}
                rows={3}
                style={{ background: '#1a1f3a', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}
              />
            </div>

            <div>
              <Label style={{ color: 'rgba(255,255,255,0.7)' }}>State Disclaimer</Label>
              <Textarea
                value={formData.state_disclaimer}
                onChange={(e) => setFormData({...formData, state_disclaimer: e.target.value})}
                rows={3}
                style={{ background: '#1a1f3a', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}
              />
            </div>

            <div>
              <Label style={{ color: 'rgba(255,255,255,0.7)' }}>Compliance Requirements</Label>
              <Textarea
                value={formData.compliance_requirements}
                onChange={(e) => setFormData({...formData, compliance_requirements: e.target.value})}
                rows={3}
                style={{ background: '#1a1f3a', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
                className="flex-1"
                style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#ffffff' }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => createStateMutation.mutate()}
                disabled={!formData.state_code || !formData.state_name || createStateMutation.isPending}
                className="flex-1"
                style={{ background: '#fbbf24', color: '#0f1628' }}
              >
                Create State Config
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}