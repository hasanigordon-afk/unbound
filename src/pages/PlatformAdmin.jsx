import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, Shield } from "lucide-react";

export default function PlatformAdmin() {
  const queryClient = useQueryClient();

  const { data: facilities = [] } = useQuery({
    queryKey: ["pending-facilities"],
    queryFn: () => base44.entities.Facility.filter({ verification_status: "pending" }),
  });

  const { data: resourceReports = [] } = useQuery({
    queryKey: ["resource-reports"],
    queryFn: () => base44.entities.ResourceReport.list(),
  });

  const { data: userReports = [] } = useQuery({
    queryKey: ["user-reports"],
    queryFn: () => base44.entities.UserReport.list(),
  });

  const approveMutation = useMutation({
    mutationFn: (facilityId) =>
      base44.entities.Facility.update(facilityId, { verification_status: "approved" }),
    onSuccess: () => queryClient.invalidateQueries(["pending-facilities"]),
  });

  const denyMutation = useMutation({
    mutationFn: (facilityId) =>
      base44.entities.Facility.update(facilityId, { verification_status: "denied" }),
    onSuccess: () => queryClient.invalidateQueries(["pending-facilities"]),
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-24 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-purple-600" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Platform Admin</h1>
              <p className="text-sm text-slate-500">Manage facilities and reports</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="facilities" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="facilities">Facilities</TabsTrigger>
            <TabsTrigger value="resource-reports">Resource Reports</TabsTrigger>
            <TabsTrigger value="user-reports">User Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="facilities">
            <div className="bg-white rounded-2xl p-6">
              <h2 className="font-semibold text-slate-900 mb-4">Pending Approvals</h2>
              {facilities.length === 0 ? (
                <p className="text-slate-400">No pending facilities</p>
              ) : (
                <div className="space-y-3">
                  {facilities.map(fac => (
                    <div key={fac.id} className="p-4 border border-slate-200 rounded-xl">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-medium text-slate-900">{fac.facility_name}</h3>
                          <p className="text-sm text-slate-500 capitalize">{fac.facility_type}</p>
                          <p className="text-sm text-slate-500">{fac.contact_email}</p>
                        </div>
                        <Badge className="bg-amber-100 text-amber-700">Pending</Badge>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          onClick={() => approveMutation.mutate(fac.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => denyMutation.mutate(fac.id)}
                          className="text-rose-600 border-rose-200 hover:bg-rose-50"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Deny
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="resource-reports">
            <div className="bg-white rounded-2xl p-6">
              <h2 className="font-semibold text-slate-900 mb-4">Resource Reports</h2>
              {resourceReports.length === 0 ? (
                <p className="text-slate-400">No reports</p>
              ) : (
                <div className="space-y-3">
                  {resourceReports.map(rep => (
                    <div key={rep.id} className="p-4 border border-slate-200 rounded-xl">
                      <p className="text-sm text-slate-900 mb-1">Resource ID: {rep.resource_id}</p>
                      <p className="text-sm text-slate-600">{rep.reason}</p>
                      <p className="text-xs text-slate-400 mt-2">{new Date(rep.created_date).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="user-reports">
            <div className="bg-white rounded-2xl p-6">
              <h2 className="font-semibold text-slate-900 mb-4">User Reports</h2>
              {userReports.length === 0 ? (
                <p className="text-slate-400">No reports</p>
              ) : (
                <div className="space-y-3">
                  {userReports.map(rep => (
                    <div key={rep.id} className="p-4 border border-slate-200 rounded-xl">
                      <p className="text-sm text-slate-900 mb-1">Reported User: {rep.reported_user_id}</p>
                      <p className="text-sm text-slate-600">{rep.reason}</p>
                      <p className="text-xs text-slate-400 mt-2">{new Date(rep.created_date).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}