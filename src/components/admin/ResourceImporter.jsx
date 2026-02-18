import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ResourceImporter({ onSuccess }) {
  const [file, setFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);

  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      // Upload file first
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      // Import using the import_data functionality
      const response = await fetch('/api/import-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_url,
          entity_name: 'Resource'
        })
      });
      
      return response.json();
    },
    onSuccess: (result) => {
      setUploadResult(result);
      if (result.successful_count > 0) {
        toast.success(`Successfully imported ${result.successful_count} resources`);
        if (onSuccess) onSuccess();
      }
      if (result.failed_count > 0) {
        toast.error(`${result.failed_count} resources failed to import`);
      }
    },
    onError: (error) => {
      toast.error("Import failed: " + error.message);
    }
  });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        toast.error("Please upload a CSV file");
        return;
      }
      setFile(selectedFile);
      setUploadResult(null);
    }
  };

  const handleImport = () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }
    uploadMutation.mutate(file);
  };

  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <FileText className="w-6 h-6" style={{ color: '#2FF3E0' }} />
        <div>
          <h3 className="font-semibold" style={{ color: '#FFFFFF' }}>
            Import Resources from CSV
          </h3>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Upload a CSV file with resource data
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
            <strong>Required columns:</strong> name, category, city, state
          </p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
            <strong>Optional columns:</strong> address, county, zip, phone, website, tags, hours_json, notes, eligibility_criteria, application_process
          </p>
          <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Categories: ID, Benefits, Housing, Employment, Health, Legal, Reentry
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex-1">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <div 
              className="flex items-center gap-3 p-4 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
              style={{ background: 'rgba(47,243,224,0.1)', border: '1px dashed rgba(47,243,224,0.3)' }}
            >
              <Upload className="w-5 h-5" style={{ color: '#2FF3E0' }} />
              <span className="text-sm" style={{ color: '#FFFFFF' }}>
                {file ? file.name : 'Choose CSV file...'}
              </span>
            </div>
          </label>
          
          <Button
            onClick={handleImport}
            disabled={!file || uploadMutation.isPending}
            style={{ background: '#2FF3E0', color: '#0B0F1F' }}
          >
            {uploadMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Import
              </>
            )}
          </Button>
        </div>

        {uploadResult && (
          <div className="space-y-2">
            {uploadResult.successful_count > 0 && (
              <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: 'rgba(34,197,94,0.1)' }}>
                <CheckCircle2 className="w-5 h-5" style={{ color: '#22c55e' }} />
                <span className="text-sm" style={{ color: '#22c55e' }}>
                  {uploadResult.successful_count} resources imported successfully
                </span>
              </div>
            )}

            {uploadResult.failed_count > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)' }}>
                  <AlertCircle className="w-5 h-5" style={{ color: '#ef4444' }} />
                  <span className="text-sm" style={{ color: '#ef4444' }}>
                    {uploadResult.failed_count} resources failed to import
                  </span>
                </div>
                
                {uploadResult.errors && uploadResult.errors.length > 0 && (
                  <div className="p-3 rounded-lg space-y-1" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <p className="text-xs font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                      Errors:
                    </p>
                    {uploadResult.errors.slice(0, 10).map((error, idx) => (
                      <p key={idx} className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        Row {error.row}: {error.message}
                      </p>
                    ))}
                    {uploadResult.errors.length > 10 && (
                      <p className="text-xs italic" style={{ color: 'rgba(255,255,255,0.5)' }}>
                        ...and {uploadResult.errors.length - 10} more errors
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}