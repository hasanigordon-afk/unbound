import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery } from "@tantml:react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createPageUrl } from "./utils";
import { Building2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function FacilitySignup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteCode = searchParams.get("code");
  
  const [formData, setFormData] = useState({
    sobriety_start_date: "",
    location_city: "",
    location_state: "",
    location_zip: "",
  });

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: invite } = useQuery({
    queryKey: ["invite", inviteCode],
    queryFn: async () => {
      if (!inviteCode) return null;
      const invites = await base44.entities.FacilityInvite.filter({ invite_code: inviteCode });
      return invites[0];
    },
    enabled: !!inviteCode,
  });

  const { data: facility } = useQuery({
    queryKey: ["facility", invite?.facility_id],
    queryFn: async () => {
      if (!invite?.facility_id) return null;
      const facilities = await base44.entities.Facility.filter({ id: invite.facility_id });
      return facilities[0];
    },
    enabled: !!invite?.facility_id,
  });

  const signupMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.ParticipantProfile.create({
        participant_email: user.email,
        facility_id: invite.facility_id,
        discharge_date: new Date().toISOString().split('T')[0],
        sobriety_start_date: formData.sobriety_start_date,
        location_city: formData.location_city,
        location_state: formData.location_state,
        location_zip: formData.location_zip,
        terms_accepted: true,
        terms_accepted_date: new Date().toISOString(),
      });

      await base44.entities.FacilityInvite.update(invite.id, { status: "accepted" });
    },
    onSuccess: () => {
      navigate(createPageUrl("ParticipantDashboard"));
    },
  });

  if (!invite || !facility) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#1a1f3a' }}>
        <div className="text-center">
          <p style={{ color: '#ffffff' }}>Invalid or expired invite code.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#1a1f3a' }}>
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          {facility.logo_url ? (
            <img src={facility.logo_url} alt={facility.facility_name} className="h-16 mx-auto mb-4" />
          ) : (
            <div className="w-16 h-16 rounded-xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(251,191,36,0.2)' }}>
              <Building2 className="w-8 h-8" style={{ color: '#fbbf24' }} />
            </div>
          )}
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#ffffff' }}>Welcome to {facility.facility_name}</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Complete your profile to get started</p>
        </div>

        <div className="p-6 rounded-xl space-y-4" style={{ background: '#0f1628', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div>
            <Label style={{ color: 'rgba(255,255,255,0.7)' }}>Sobriety Start Date</Label>
            <Input
              type="date"
              value={formData.sobriety_start_date}
              onChange={(e) => setFormData({...formData, sobriety_start_date: e.target.value})}
              style={{ background: '#1a1f3a', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}
            />
          </div>

          <div>
            <Label style={{ color: 'rgba(255,255,255,0.7)' }}>City</Label>
            <Input
              value={formData.location_city}
              onChange={(e) => setFormData({...formData, location_city: e.target.value})}
              style={{ background: '#1a1f3a', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label style={{ color: 'rgba(255,255,255,0.7)' }}>State</Label>
              <Input
                value={formData.location_state}
                onChange={(e) => setFormData({...formData, location_state: e.target.value})}
                style={{ background: '#1a1f3a', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}
              />
            </div>
            <div>
              <Label style={{ color: 'rgba(255,255,255,0.7)' }}>ZIP</Label>
              <Input
                value={formData.location_zip}
                onChange={(e) => setFormData({...formData, location_zip: e.target.value})}
                style={{ background: '#1a1f3a', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}
              />
            </div>
          </div>

          {facility.custom_disclaimer && (
            <div className="p-4 rounded-lg text-xs" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', color: 'rgba(255,255,255,0.7)' }}>
              {facility.custom_disclaimer}
            </div>
          )}

          <Button
            onClick={() => signupMutation.mutate()}
            disabled={!formData.sobriety_start_date || signupMutation.isPending}
            className="w-full"
            style={{ background: facility.primary_color || '#fbbf24', color: '#0f1628' }}
          >
            <Check className="w-4 h-4 mr-2" />
            Complete Signup
          </Button>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Powered by Unbound
        </p>
      </div>
    </div>
  );
}