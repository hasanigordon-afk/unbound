import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Building2, Users, Settings, TrendingUp, Edit, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function PlatformAdmin() {
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [logoFile, setLogoFile] = useState(null);

  const [formData, setFormData] = useState({
    facility_name: "",
    admin_email: "",
    primary_color: "#fbbf24",
    contact_phone: "",
    contact_email: "",
    website: "",
    crisis_phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    pilot_mode: true,
    subscription_tier: "free_trial",
    custom_disclaimer: "",
  });

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: facilities = [] } = useQuery({
    queryKey: ["facilities"],
    queryFn: () => base44.entities.Facility.list("-created_date"),
  });

  const { data: allParticipants = [] } = useQuery({
    queryKey: ["all-participants"],
    queryFn: () => base44.entities.ParticipantProfile.list(),
  });

  const { data: allCheckIns = [] } = useQuery({
    queryKey: ["all-checkins"],
    queryFn: () => base44.entities.DailyCheckIn.list("-check_in_date", 1000),
  });

  const uploadLogoMutation = useMutation({
    mutationFn: async (file) => {
      const result = await base44.integrations.Core.UploadFile({ file });
      return result.file_url;
    },
  });

  const createFacilityMutation = useMutation({
    mutationFn: async () => {
      let logoUrl = null;
      if (logoFile) {
        logoUrl = await uploadLogoMutation.mutateAsync(logoFile);
      }

      const facility = await base44.entities.Facility.create({
        ...formData,
        logo_url: logoUrl,
      });

      await base44.entities.FacilitySettings.create({
        facility_id: facility.id,
        welcome_message: `Welcome to ${formData.facility_name}`,
        checkin_reminder_time: "09:00",
        pilot_duration_days: 90,
        alert_threshold_days: 3,
        enable_reintegration_map: true,
        enable_messaging: true,
        enable_resource_directory: true,
        enable_community: false,
      });

      return facility;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["facilities"]);
      setShowCreateDialog(false);
      setFormData({
        facility_name: "",
        admin_email: "",
        primary_color: "#fbbf24",
        contact_phone: "",
        contact_email: "",
        website: "",
        crisis_phone: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        pilot_mode: true,
        subscription_tier: "free_trial",
        custom_disclaimer: "",
      });
      setLogoFile(null);
    },
  });

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) setLogoFile(file);
  };

  const getAggregatStats = () => {
    const totalParticipants = allParticipants.length;
    const activeParticipants = allParticipants.filter(p => {
      const lastCheckIn = allCheckIns.find(c => c.participant_email === p.participant_email);
      if (!lastCheckIn) return false;
      const daysSince = Math.floor((Date.now() - new Date(lastCheckIn.created_date)) / (1000 * 60 * 60 * 24));
      return daysSince <= 7;
    }).length;
    const totalCheckIns = allCheckIns.length;
    const avgEngagement = totalParticipants > 0 ? Math.round((activeParticipants / totalParticipants) * 100) : 0;

    return { totalParticipants, activeParticipants, totalCheckIns, avgEngagement };
  };

  const stats = getAggregatStats();

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#1a1f3a' }}>
        <div className="text-center">
          <p style={{ color: '#ffffff' }}>Access denied. Super admin only.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: '#1a1f3a' }}>
      <div className="px-6 pt-8 pb-6" style={{ background: '#0f1628', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#ffffff' }}>Platform Admin</h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Manage facilities and system-wide analytics</p>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Aggregate Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl" style={{ background: '#0f1628', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Total Facilities</p>
            <p className="text-3xl font-bold" style={{ color: '#fbbf24' }}>{facilities.length}</p>
          </div>
          <div className="p-5 rounded-xl" style={{ background: '#0f1628', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Total Participants</p>
            <p className="text-3xl font-bold" style={{ color: '#60a5fa' }}>{stats.totalParticipants}</p>
          </div>
          <div className="p-5 rounded-xl" style={{ background: '#0f1628', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Active (7d)</p>
            <p className="text-3xl font-bold" style={{ color: '#22c55e' }}>{stats.activeParticipants}</p>
          </div>
          <div className="p-5 rounded-xl" style={{ background: '#0f1628', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Engagement</p>
            <p className="text-3xl font-bold" style={{ color: '#8b5cf6' }}>{stats.avgEngagement}%</p>
          </div>
        </div>

        {/* Create Facility Button */}
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="w-full"
          style={{ background: '#fbbf24', color: '#0f1628' }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Facility
        </Button>

        {/* Facilities List */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>Active Facilities</h3>
          {facilities.map(facility => {
            const facilityParticipants = allParticipants.filter(p => p.facility_id === facility.id);
            return (
              <div key={facility.id} className="p-5 rounded-xl" style={{ background: '#0f1628', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="flex items-start gap-4">
                  {facility.logo_url && (
                    <img src={facility.logo_url} alt={facility.facility_name} className="w-12 h-12 rounded-lg object-cover" />
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1" style={{ color: '#ffffff' }}>{facility.facility_name}</h4>
                    <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      Admin: {facility.admin_email}
                    </p>
                    <div className="flex items-center gap-4 text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {facilityParticipants.length} participants
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium`} style={{ 
                        background: facility.pilot_mode ? 'rgba(251,191,36,0.2)' : 'rgba(34,197,94,0.2)',
                        color: facility.pilot_mode ? '#fbbf24' : '#22c55e'
                      }}>
                        {facility.pilot_mode ? 'Pilot' : 'Active'}
                      </span>
                      <span className="capitalize">{facility.subscription_tier.replace('_', ' ')}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedFacility(facility)}
                    style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#ffffff' }}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Facility Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" style={{ background: '#0f1628', border: '1px solid rgba(255,255,255,0.1)' }}>
          <DialogHeader>
            <DialogTitle style={{ color: '#ffffff' }}>Create New Facility</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label style={{ color: 'rgba(255,255,255,0.7)' }}>Facility Name *</Label>
              <Input
                value={formData.facility_name}
                onChange={(e) => setFormData({...formData, facility_name: e.target.value})}
                placeholder="Recovery Center Name"
                style={{ background: '#1a1f3a', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}
              />
            </div>

            <div>
              <Label style={{ color: 'rgba(255,255,255,0.7)' }}>Admin Email *</Label>
              <Input
                type="email"
                value={formData.admin_email}
                onChange={(e) => setFormData({...formData, admin_email: e.target.value})}
                placeholder="admin@facility.com"
                style={{ background: '#1a1f3a', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}
              />
            </div>

            <div>
              <Label style={{ color: 'rgba(255,255,255,0.7)' }}>Logo Upload</Label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="w-full p-2 rounded-lg"
                style={{ background: '#1a1f3a', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}
              />
            </div>

            <div>
              <Label style={{ color: 'rgba(255,255,255,0.7)' }}>Primary Color</Label>
              <Input
                type="color"
                value={formData.primary_color}
                onChange={(e) => setFormData({...formData, primary_color: e.target.value})}
                style={{ background: '#1a1f3a', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label style={{ color: 'rgba(255,255,255,0.7)' }}>Contact Phone</Label>
                <Input
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                  style={{ background: '#1a1f3a', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}
                />
              </div>
              <div>
                <Label style={{ color: 'rgba(255,255,255,0.7)' }}>Contact Email</Label>
                <Input
                  value={formData.contact_email}
                  onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                  style={{ background: '#1a1f3a', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}
                />
              </div>
            </div>

            <div>
              <Label style={{ color: 'rgba(255,255,255,0.7)' }}>Website</Label>
              <Input
                value={formData.website}
                onChange={(e) => setFormData({...formData, website: e.target.value})}
                placeholder="https://facility.com"
                style={{ background: '#1a1f3a', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}
              />
            </div>

            <div>
              <Label style={{ color: 'rgba(255,255,255,0.7)' }}>Crisis Phone Line</Label>
              <Input
                value={formData.crisis_phone}
                onChange={(e) => setFormData({...formData, crisis_phone: e.target.value})}
                style={{ background: '#1a1f3a', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}
              />
            </div>

            <div>
              <Label style={{ color: 'rgba(255,255,255,0.7)' }}>Address</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                style={{ background: '#1a1f3a', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label style={{ color: 'rgba(255,255,255,0.7)' }}>City</Label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  style={{ background: '#1a1f3a', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}
                />
              </div>
              <div>
                <Label style={{ color: 'rgba(255,255,255,0.7)' }}>State</Label>
                <Input
                  value={formData.state}
                  onChange={(e) => setFormData({...formData, state: e.target.value})}
                  style={{ background: '#1a1f3a', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}
                />
              </div>
              <div>
                <Label style={{ color: 'rgba(255,255,255,0.7)' }}>ZIP</Label>
                <Input
                  value={formData.zip}
                  onChange={(e) => setFormData({...formData, zip: e.target.value})}
                  style={{ background: '#1a1f3a', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}
                />
              </div>
            </div>

            <div>
              <Label style={{ color: 'rgba(255,255,255,0.7)' }}>Subscription Tier</Label>
              <Select value={formData.subscription_tier} onValueChange={(val) => setFormData({...formData, subscription_tier: val})}>
                <SelectTrigger style={{ background: '#1a1f3a', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free_trial">Free Trial</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.pilot_mode}
                onCheckedChange={(val) => setFormData({...formData, pilot_mode: val})}
              />
              <Label style={{ color: 'rgba(255,255,255,0.7)' }}>Pilot Mode</Label>
            </div>

            <div>
              <Label style={{ color: 'rgba(255,255,255,0.7)' }}>Custom Disclaimer</Label>
              <Textarea
                value={formData.custom_disclaimer}
                onChange={(e) => setFormData({...formData, custom_disclaimer: e.target.value})}
                rows={3}
                placeholder="Facility-specific legal disclaimer..."
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
                onClick={() => createFacilityMutation.mutate()}
                disabled={!formData.facility_name || !formData.admin_email || createFacilityMutation.isPending}
                className="flex-1"
                style={{ background: '#fbbf24', color: '#0f1628' }}
              >
                Create Facility
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}