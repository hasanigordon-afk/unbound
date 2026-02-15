import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Shield, CheckCircle2, MapPin, FolderLock, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import IdentityAssessment from "../components/identity/IdentityAssessment";
import IdentityProgress from "../components/identity/IdentityProgress";
import ChecklistView from "../components/identity/ChecklistView";
import ResourceFinder from "../components/identity/ResourceFinder";
import DocumentVault from "../components/identity/DocumentVault";
import ReentryResources from "../components/identity/ReentryResources";

export default function IdentityBridge() {
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: identityStatus = [] } = useQuery({
    queryKey: ["identity-status", user?.email],
    queryFn: () => base44.entities.IdentityStatus.filter({ created_by: user.email }),
    enabled: !!user,
  });

  const status = identityStatus[0];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0B0F1F' }}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#2FF3E0' }} />
      </div>
    );
  }

  // Show assessment if not completed
  if (!status || !status.assessment_completed) {
    return <IdentityAssessment />;
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: '#0B0F1F' }}>
      <div className="px-5 pt-8 pb-6 rounded-b-3xl" style={{ background: 'linear-gradient(135deg, rgba(123,92,255,0.2), rgba(47,243,224,0.1))' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(47,243,224,0.2)' }}>
            <Shield className="w-6 h-6" style={{ color: '#2FF3E0' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>Identity Bridge</h1>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Rebuild your legal identity</p>
          </div>
        </div>

        <IdentityProgress status={status} />
      </div>

      <div className="px-5 -mt-3 max-w-lg mx-auto">
        <Tabs defaultValue="checklist" className="w-full">
          <TabsList className="grid w-full grid-cols-4 glass-card p-1 mb-4 text-xs">
            <TabsTrigger value="checklist" className="data-[state=active]:bg-teal-500/20">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Checklist
            </TabsTrigger>
            <TabsTrigger value="resources" className="data-[state=active]:bg-teal-500/20">
              <MapPin className="w-3 h-3 mr-1" />
              Offices
            </TabsTrigger>
            <TabsTrigger value="reentry" className="data-[state=active]:bg-teal-500/20">
              <Briefcase className="w-3 h-3 mr-1" />
              Reentry
            </TabsTrigger>
            <TabsTrigger value="vault" className="data-[state=active]:bg-teal-500/20">
              <FolderLock className="w-3 h-3 mr-1" />
              Vault
            </TabsTrigger>
          </TabsList>

          <TabsContent value="checklist">
            <ChecklistView status={status} />
          </TabsContent>

          <TabsContent value="resources">
            <ResourceFinder />
          </TabsContent>

          <TabsContent value="reentry">
            <ReentryResources />
          </TabsContent>

          <TabsContent value="vault">
            <DocumentVault />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}