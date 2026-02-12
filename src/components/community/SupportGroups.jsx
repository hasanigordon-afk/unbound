import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Users, Lock, Globe, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import CreateGroupDialog from "./CreateGroupDialog";

export default function SupportGroups() {
  const [showCreate, setShowCreate] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ["support-groups"],
    queryFn: () => base44.entities.SupportGroup.list('-created_date', 20),
  });

  const { data: memberships = [] } = useQuery({
    queryKey: ["my-memberships", user?.email],
    queryFn: () => base44.entities.GroupMembership.filter({ created_by: user.email }),
    enabled: !!user,
  });

  const myGroupIds = new Set(memberships.map(m => m.group_id));

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#2FF3E0' }} />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 mt-4">
        <Button
          onClick={() => setShowCreate(true)}
          className="w-full font-medium"
          style={{ background: '#7B5CFF', color: '#FFFFFF' }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Support Group
        </Button>

        <div className="space-y-3">
          <h3 className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>
            Available Groups
          </h3>
          {groups.map(group => {
            const isMember = myGroupIds.has(group.id);
            return (
              <div key={group.id} className="glass-card p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(123,92,255,0.2)' }}>
                    <Users className="w-5 h-5" style={{ color: '#7B5CFF' }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium" style={{ color: '#FFFFFF' }}>{group.name}</h4>
                      {group.is_private ? (
                        <Lock className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.5)' }} />
                      ) : (
                        <Globe className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.5)' }} />
                      )}
                    </div>
                    <p className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.75)' }}>
                      {group.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(47,243,224,0.15)', color: '#2FF3E0' }}>
                        {group.focus_area}
                      </span>
                      {isMember && (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(123,92,255,0.15)', color: '#7B5CFF' }}>
                          Member
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {groups.length === 0 && (
            <div className="text-center py-12">
              <p style={{ color: 'rgba(255,255,255,0.5)' }}>No groups yet. Create the first one!</p>
            </div>
          )}
        </div>
      </div>

      {showCreate && <CreateGroupDialog onClose={() => setShowCreate(false)} />}
    </>
  );
}