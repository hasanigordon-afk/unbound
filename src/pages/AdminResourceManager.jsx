import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, Globe, Map, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const CATEGORY_OPTIONS = [
  { value: "employment", label: "Employment Services" },
  { value: "federal_assistance", label: "Federal Assistance" },
  { value: "crisis", label: "Crisis Support" },
  { value: "veteran_services", label: "Veteran Services" },
  { value: "medicaid", label: "Medicaid" },
  { value: "state_benefits", label: "State Benefits" },
  { value: "dmv", label: "DMV Services" },
  { value: "reentry", label: "Reentry Programs" },
  { value: "workforce", label: "Workforce Development" },
  { value: "shelter", label: "Shelters" },
  { value: "food_pantry", label: "Food Pantries" },
  { value: "rehab", label: "Treatment Centers" },
  { value: "health_center", label: "Health Centers" },
  { value: "transportation", label: "Transportation" },
  { value: "legal", label: "Legal Services" },
  { value: "housing", label: "Housing Assistance" },
];

const LEVEL_CONFIG = {
  national: { icon: Globe, color: "#4A90E2", label: "National" },
  state: { icon: Map, color: "#D4A574", label: "State" },
  local: { icon: Navigation, color: "#22c55e", label: "Local" },
};

export default function AdminResourceManager() {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    level: "national",
    category: "",
    state: "",
    zip_codes: "",
    address: "",
    city: "",
    phone: "",
    website: "",
    hours: "",
    description: "",
  });

  const { data: resources = [] } = useQuery({
    queryKey: ["admin-resources"],
    queryFn: () => base44.entities.Resource.list("-created_date"),
  });

  const createMutation = useMutation({
    mutationFn: (data) => {
      const payload = {
        ...data,
        zip_codes: data.zip_codes ? data.zip_codes.split(",").map(z => z.trim()) : [],
      };
      return base44.entities.Resource.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-resources"]);
      setShowDialog(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => {
      const payload = {
        ...data,
        zip_codes: data.zip_codes ? data.zip_codes.split(",").map(z => z.trim()) : [],
      };
      return base44.entities.Resource.update(id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-resources"]);
      setShowDialog(false);
      setEditingResource(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Resource.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-resources"]);
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      level: "national",
      category: "",
      state: "",
      zip_codes: "",
      address: "",
      city: "",
      phone: "",
      website: "",
      hours: "",
      description: "",
    });
  };

  const handleEdit = (resource) => {
    setEditingResource(resource);
    setFormData({
      name: resource.name || "",
      level: resource.level || "national",
      category: resource.category || "",
      state: resource.state || "",
      zip_codes: resource.zip_codes?.join(", ") || "",
      address: resource.address || "",
      city: resource.city || "",
      phone: resource.phone || "",
      website: resource.website || "",
      hours: resource.hours || "",
      description: resource.description || "",
    });
    setShowDialog(true);
  };

  const handleSubmit = () => {
    if (editingResource) {
      updateMutation.mutate({ id: editingResource.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const groupedResources = {
    national: resources.filter(r => r.level === "national"),
    state: resources.filter(r => r.level === "state"),
    local: resources.filter(r => r.level === "local"),
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--bg-primary)' }}>
      <div className="px-6 pt-8 pb-6" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <h1 style={{ marginBottom: '4px' }}>Resource Manager</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Manage geo-resource database
        </p>
      </div>

      <div className="px-6 py-6" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-section)' }}>
        <Button
          onClick={() => {
            resetForm();
            setEditingResource(null);
            setShowDialog(true);
          }}
          className="btn-primary self-start"
        >
          <Plus className="w-4 h-4 mr-2" strokeWidth={1.5} />
          Add Resource
        </Button>

        {["national", "state", "local"].map(level => {
          const resources = groupedResources[level];
          if (resources.length === 0) return null;
          
          const config = LEVEL_CONFIG[level];
          const Icon = config.icon;

          return (
            <div key={level}>
              <div className="flex items-center gap-2 mb-4">
                <Icon className="w-5 h-5" style={{ color: config.color }} strokeWidth={1.5} />
                <h3>{config.label} Resources</h3>
                <Badge style={{ background: `${config.color}15`, color: config.color }}>
                  {resources.length}
                </Badge>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {resources.map(resource => (
                  <div key={resource.id} className="card">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="mb-1">{resource.name}</h4>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {resource.category} {resource.state && `• ${resource.state}`}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEdit(resource)}
                          className="btn-secondary"
                          size="sm"
                        >
                          <Edit2 className="w-3 h-3" strokeWidth={1.5} />
                        </Button>
                        <Button
                          onClick={() => deleteMutation.mutate(resource.id)}
                          variant="destructive"
                          size="sm"
                        >
                          <Trash2 className="w-3 h-3" strokeWidth={1.5} />
                        </Button>
                      </div>
                    </div>
                    {resource.description && (
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {resource.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent style={{ background: 'var(--bg-card)', maxHeight: '90vh', overflowY: 'auto' }}>
          <DialogHeader>
            <DialogTitle>{editingResource ? "Edit Resource" : "Add Resource"}</DialogTitle>
          </DialogHeader>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="text-sm font-medium mb-2 block">Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Resource name"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Level *</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full px-3 py-2"
                style={{ 
                  background: 'var(--bg-primary)', 
                  border: '1px solid var(--border)', 
                  borderRadius: 'var(--radius)' 
                }}
              >
                <option value="national">National</option>
                <option value="state">State</option>
                <option value="local">Local</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2"
                style={{ 
                  background: 'var(--bg-primary)', 
                  border: '1px solid var(--border)', 
                  borderRadius: 'var(--radius)' 
                }}
              >
                <option value="">Select category</option>
                {CATEGORY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {formData.level !== "national" && (
              <div>
                <label className="text-sm font-medium mb-2 block">State Code</label>
                <Input
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                  placeholder="e.g., CA"
                  maxLength={2}
                />
              </div>
            )}

            {formData.level === "local" && (
              <div>
                <label className="text-sm font-medium mb-2 block">Zip Codes (comma-separated)</label>
                <Input
                  value={formData.zip_codes}
                  onChange={(e) => setFormData({ ...formData, zip_codes: e.target.value })}
                  placeholder="e.g., 90001, 90002, 90003"
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Resource description"
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Address</label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Street address"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">City</label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="City"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Phone</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Phone number"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Website</label>
              <Input
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Hours</label>
              <Input
                value={formData.hours}
                onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                placeholder="e.g., Mon-Fri 9am-5pm"
              />
            </div>

            <Button 
              onClick={handleSubmit} 
              className="btn-primary"
              disabled={!formData.name || !formData.category}
            >
              {editingResource ? "Update Resource" : "Create Resource"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}