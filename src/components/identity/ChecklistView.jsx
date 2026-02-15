import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import ChecklistItemCard from "./ChecklistItemCard";
import DocumentWorkflow from "./DocumentWorkflow";

export default function ChecklistView({ status }) {
  const [selectedItem, setSelectedItem] = useState(null);

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: checklistItems = [], isLoading } = useQuery({
    queryKey: ["identity-checklist", user?.email],
    queryFn: () => base44.entities.IdentityChecklistItem.filter({ created_by: user.email }),
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#2FF3E0' }} />
      </div>
    );
  }

  if (selectedItem) {
    return <DocumentWorkflow item={selectedItem} onBack={() => setSelectedItem(null)} />;
  }

  return (
    <div className="space-y-3">
      {checklistItems.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            All documents obtained! Great work! 🎉
          </p>
        </div>
      ) : (
        checklistItems.map(item => (
          <ChecklistItemCard
            key={item.id}
            item={item}
            onSelect={() => setSelectedItem(item)}
          />
        ))
      )}
    </div>
  );
}