import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Users, Ticket, BarChart3, QrCode } from "lucide-react";

export default function FacilityDashboard() {
  const queryClient = useQueryClient();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("peer_mentor");

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: () => base44.auth.me(),
  });

  const { data: facilities = [] } = useQuery({
    queryKey: ["my-facilities"],
    queryFn: async () => {
      const u = await base44.auth.me();
      return base44.entities.Facility.filter({ created_by: u.email });
    },
  });

  const facility = facilities[0];

  const { data: invites = [] } = useQuery({
    queryKey: ["facility-invites", facility?.id],
    queryFn: () => base44.entities.FacilityInvite.filter({ facility_id: facility.id }),
    enabled: !!facility,
  });

  const { data: referralCodes = [] } = useQuery({
    queryKey: ["referral-codes", facility?.id],
    queryFn: () => base44.entities.ReferralCode.filter({ facility_id: facility.id }),
    enabled: !!facility,
  });

  const inviteMutation = useMutation({
    mutationFn: () =>
      base44.entities.FacilityInvite.create({
        facility_id: facility.id,
        email: inviteEmail,
        role: inviteRole,
        status: "sent",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["facility-invites"]);
      setInviteEmail("");
    },
  });

  const generateCodeMutation = useMutation({
    mutationFn: () => {
      const code = `${facility.facility_name.substring(0, 3).toUpperCase()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      return base44.entities.ReferralCode.create({
        facility_id: facility.id,
        code,
        default_track: "both",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["referral-codes"]);
    },
  });

  if (!facility) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">No facility found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-teal-600" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{facility.facility_name}</h1>
              <p className="text-sm text-slate-500 capitalize">{facility.facility_type}</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="listing" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="listing">Listing</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="listing">
            <div className="bg-white rounded-2xl p-6 space-y-4">
              <h2 className="font-semibold text-slate-900">Edit Listing</h2>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Programs</label>
                <Textarea placeholder="Describe programs offered..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Hours</label>
                <Input placeholder="e.g., Mon-Fri 8am-5pm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Intake Phone</label>
                <Input placeholder="(555) 123-4567" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Website</label>
                <Input placeholder="https://..." />
              </div>
              <Button className="bg-teal-600 hover:bg-teal-700">Save Changes</Button>
            </div>
          </TabsContent>

          <TabsContent value="staff">
            <div className="bg-white rounded-2xl p-6 space-y-6">
              <div>
                <h2 className="font-semibold text-slate-900 mb-4">Invite Staff</h2>
                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="staff@email.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="h-10 px-3 border border-slate-200 rounded-lg"
                  >
                    <option value="peer_mentor">Peer Mentor</option>
                    <option value="counselor">Counselor</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                  <Button onClick={() => inviteMutation.mutate()} className="bg-teal-600 hover:bg-teal-700">
                    Invite
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-slate-700 mb-3">Sent Invites</h3>
                {invites.length === 0 ? (
                  <p className="text-sm text-slate-400">No invites sent yet</p>
                ) : (
                  <div className="space-y-2">
                    {invites.map(inv => (
                      <div key={inv.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{inv.email}</p>
                          <p className="text-xs text-slate-500 capitalize">{inv.role} • {inv.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="referrals">
            <div className="bg-white rounded-2xl p-6 space-y-6">
              <div>
                <h2 className="font-semibold text-slate-900 mb-4">Referral Codes</h2>
                <Button onClick={() => generateCodeMutation.mutate()} className="bg-teal-600 hover:bg-teal-700 mb-4">
                  Generate New Code
                </Button>
              </div>

              <div className="space-y-3">
                {referralCodes.map(rc => (
                  <div key={rc.id} className="p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <code className="text-lg font-mono font-bold text-teal-600">{rc.code}</code>
                      <QrCode className="w-5 h-5 text-slate-400" />
                    </div>
                    <p className="text-xs text-slate-500">
                      Track: {rc.default_track || "both"} • Created {new Date(rc.created_date).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="bg-white rounded-2xl p-6">
              <h2 className="font-semibold text-slate-900 mb-4">Analytics (Coming Soon)</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-2xl font-bold text-slate-900">0</p>
                  <p className="text-sm text-slate-500">Total Referrals</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-2xl font-bold text-slate-900">0%</p>
                  <p className="text-sm text-slate-500">Completion Rate</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}