import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { Button } from "@/components/ui/button";
import ResourceImporter from "../components/admin/ResourceImporter";

export default function AdminResources() {
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: resources = [], refetch } = useQuery({
    queryKey: ["all-resources"],
    queryFn: () => base44.entities.Resource.list("-created_date", 100),
  });

  return (
    <div className="min-h-screen pb-24" style={{ background: '#0B0F1F' }}>
      <div className="px-5 py-6 max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Link to={createPageUrl("Profile")}>
            <Button variant="ghost" size="icon" style={{ color: '#FFFFFF' }}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>
              Resource Management
            </h1>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Import and manage resources
            </p>
          </div>
        </div>

        <ResourceImporter onSuccess={() => refetch()} />

        <div className="glass-card p-4">
          <h3 className="font-semibold mb-3" style={{ color: '#FFFFFF' }}>
            Recent Resources ({resources.length})
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {resources.map((resource) => (
              <div 
                key={resource.id}
                className="p-3 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm" style={{ color: '#FFFFFF' }}>
                      {resource.name}
                    </p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      {resource.category} • {resource.city}, {resource.state}
                    </p>
                  </div>
                  <span 
                    className="text-xs px-2 py-1 rounded"
                    style={{ 
                      background: resource.geocode_status === 'success' 
                        ? 'rgba(34,197,94,0.1)' 
                        : 'rgba(255,255,255,0.1)',
                      color: resource.geocode_status === 'success'
                        ? '#22c55e'
                        : 'rgba(255,255,255,0.5)'
                    }}
                  >
                    {resource.geocode_status || 'pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}