import React, { useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, Trash2, Eye, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";

const DOCUMENT_TYPES = [
  { value: "state_id", label: "State ID" },
  { value: "birth_certificate", label: "Birth Certificate" },
  { value: "social_security_card", label: "Social Security Card" },
  { value: "medical_card", label: "Medical Card" },
  { value: "other", label: "Other" }
];

export default function DocumentVault() {
  const [uploading, setUploading] = useState(false);
  const [newDoc, setNewDoc] = useState({ type: "state_id", notes: "" });
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: documents = [] } = useQuery({
    queryKey: ["document-vault", user?.email],
    queryFn: () => base44.entities.DocumentVault.filter({ created_by: user.email }),
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.DocumentVault.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document-vault"] });
      toast.success("Document deleted");
    }
  });

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      await base44.entities.DocumentVault.create({
        document_type: newDoc.type,
        file_url,
        file_name: file.name,
        notes: newDoc.notes || undefined
      });

      queryClient.invalidateQueries({ queryKey: ["document-vault"] });
      toast.success("Document uploaded securely");
      setNewDoc({ type: "state_id", notes: "" });
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-5 h-5" style={{ color: '#2FF3E0' }} />
          <h3 className="font-semibold" style={{ color: '#FFFFFF' }}>Secure Document Storage</h3>
        </div>
        <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Safely store photos of your important documents. Files are encrypted and only accessible by you.
        </p>

        <div className="space-y-3">
          <div>
            <label className="text-sm mb-2 block" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Document Type
            </label>
            <Select value={newDoc.type} onValueChange={(val) => setNewDoc({ ...newDoc, type: val })}>
              <SelectTrigger className="bg-transparent border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm mb-2 block" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Notes (Optional)
            </label>
            <Textarea
              value={newDoc.notes}
              onChange={(e) => setNewDoc({ ...newDoc, notes: e.target.value })}
              placeholder="Add any notes..."
              className="bg-transparent border-white/20 text-white h-20"
            />
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full"
            style={{ background: '#2FF3E0', color: '#0B0F1F' }}
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
              </>
            )}
          </Button>
        </div>
      </div>

      {documents.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <FileText className="w-10 h-10 mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.3)' }} />
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            No documents uploaded yet
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map(doc => {
            const typeLabel = DOCUMENT_TYPES.find(t => t.value === doc.document_type)?.label || doc.document_type;
            return (
              <div key={doc.id} className="glass-card p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(47,243,224,0.15)' }}>
                    <FileText className="w-5 h-5" style={{ color: '#2FF3E0' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm mb-1" style={{ color: '#FFFFFF' }}>
                      {typeLabel}
                    </h4>
                    <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      {doc.file_name}
                    </p>
                    {doc.notes && (
                      <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        {doc.notes}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => window.open(doc.file_url, '_blank')}
                        size="sm"
                        variant="outline"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      <Button
                        onClick={() => deleteMutation.mutate(doc.id)}
                        size="sm"
                        variant="ghost"
                        style={{ color: '#FF6B6B' }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}