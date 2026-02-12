import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { toast } from "sonner";

const FOCUS_AREAS = [
  { value: "alcohol", label: "Alcohol" },
  { value: "substances", label: "Substances" },
  { value: "both", label: "Both" },
  { value: "general", label: "General Support" }
];

export default function CreateGroupDialog({ onClose }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [focusArea, setFocusArea] = useState("general");
  const [isPrivate, setIsPrivate] = useState(true);
  const queryClient = useQueryClient();

  const createGroup = useMutation({
    mutationFn: async () => {
      const group = await base44.entities.SupportGroup.create({
        name,
        description,
        focus_area: focusArea,
        is_private: isPrivate,
      });
      
      await base44.entities.GroupMembership.create({
        group_id: group.id,
        role: "admin"
      });
      
      return group;
    },
    onSuccess: () => {
      toast.success("Support group created!");
      queryClient.invalidateQueries(["support-groups"]);
      queryClient.invalidateQueries(["my-memberships"]);
      onClose();
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6"
        style={{ background: '#1A1F3A' }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold" style={{ color: '#FFFFFF' }}>Create Support Group</h2>
          <button onClick={onClose} style={{ color: 'rgba(255,255,255,0.5)' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <Input
            placeholder="Group name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#FFFFFF' }}
          />

          <Textarea
            placeholder="Describe your group's purpose..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[100px] resize-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#FFFFFF' }}
          />

          <div>
            <label className="text-sm mb-2 block" style={{ color: 'rgba(255,255,255,0.75)' }}>
              Focus Area
            </label>
            <div className="grid grid-cols-2 gap-2">
              {FOCUS_AREAS.map(area => (
                <button
                  key={area.value}
                  onClick={() => setFocusArea(area.value)}
                  className="px-3 py-2 rounded-lg text-sm font-medium"
                  style={{
                    background: focusArea === area.value ? 'rgba(123,92,255,0.2)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${focusArea === area.value ? '#7B5CFF' : 'rgba(255,255,255,0.08)'}`,
                    color: focusArea === area.value ? '#7B5CFF' : 'rgba(255,255,255,0.75)'
                  }}
                >
                  {area.label}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="rounded"
            />
            Private group (invite only)
          </label>

          <Button
            onClick={() => createGroup.mutate()}
            disabled={!name.trim() || !description.trim() || createGroup.isPending}
            className="w-full font-medium"
            style={{ background: '#7B5CFF', color: '#FFFFFF' }}
          >
            {createGroup.isPending ? "Creating..." : "Create Group"}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}