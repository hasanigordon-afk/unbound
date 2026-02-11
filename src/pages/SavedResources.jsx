import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bookmark, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatePresence } from "framer-motion";
import ResourceCard from "../components/resources/ResourceCard";
import ResourceDetail from "../components/resources/ResourceDetail";
import { toast } from "sonner";

export default function SavedResources() {
  const [selectedResource, setSelectedResource] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: () => base44.auth.me(),
  });

  const { data: savedResources = [], isLoading } = useQuery({
    queryKey: ["saved-resources"],
    queryFn: async () => {
      const u = await base44.auth.me();
      const saved = await base44.entities.SavedResource.filter({ created_by: u.email });
      
      // Fetch actual resource data for each saved resource
      const resourcePromises = saved.map(s => 
        base44.entities.Resource.filter({ id: s.resource_id }).then(r => r[0])
      );
      return Promise.all(resourcePromises);
    },
    enabled: !!user,
  });

  const removeMutation = useMutation({
    mutationFn: async (resourceId) => {
      const saved = await base44.entities.SavedResource.filter({ resource_id: resourceId });
      if (saved[0]) {
        await base44.entities.SavedResource.delete(saved[0].id);
      }
    },
    onSuccess: () => {
      toast.success("Resource removed");
      queryClient.invalidateQueries(["saved-resources"]);
    },
  });

  const reportMutation = useMutation({
    mutationFn: (resourceId) =>
      base44.entities.ResourceReport.create({
        resource_id: resourceId,
        reason: "Inaccurate information",
      }),
    onSuccess: () => {
      toast.success("Report submitted");
      setSelectedResource(null);
    },
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="px-5 pt-8 pb-4">
        <div className="flex items-center gap-3 mb-6">
          <Bookmark className="w-6 h-6 text-teal-600" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Saved Resources</h1>
            <p className="text-sm text-slate-500">Your bookmarked resources</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
          </div>
        ) : savedResources.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Bookmark className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium">No saved resources yet</p>
            <p className="text-slate-400 text-sm mt-1">Save resources to access them quickly later</p>
          </div>
        ) : (
          <div className="space-y-4">
            {savedResources.filter(r => r).map(resource => (
              <div key={resource.id} className="relative">
                <ResourceCard
                  resource={resource}
                  onSave={() => {}}
                  onReport={(r) => reportMutation.mutate(r.id)}
                  onViewDetails={setSelectedResource}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeMutation.mutate(resource.id)}
                  className="absolute top-4 right-4 text-rose-500 hover:text-rose-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedResource && (
          <ResourceDetail
            resource={selectedResource}
            onClose={() => setSelectedResource(null)}
            onSave={() => {}}
            onReport={(r) => reportMutation.mutate(r.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}