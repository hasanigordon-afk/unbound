import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Upload, CheckCircle, AlertCircle, FileText, X, ChevronDown, ChevronUp } from "lucide-react";

export default function BulkResourceImport() {
  const fileRef = useRef();
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(null); // null | 'processing' | 'done' | 'error'
  const [result, setResult] = useState(null);
  const [showErrors, setShowErrors] = useState(false);

  const { data: importLogs = [], refetch: refetchLogs } = useQuery({
    queryKey: ["import-logs"],
    queryFn: () => base44.entities.ImportLog.list("-created_date", 10),
  });

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) setFile(f);
    setResult(null);
    setStatus(null);
  };

  const handleImport = async () => {
    if (!file) return;
    setStatus("processing");
    setResult(null);

    const csvText = await file.text();
    try {
      const res = await base44.functions.invoke("bulkImportResources", {
        csvText,
        filename: file.name,
      });
      setResult(res.data);
      setStatus(res.data.error ? "error" : "done");
      refetchLogs();
    } catch (err) {
      setStatus("error");
      setResult({ error: err.message });
    }
  };

  const reset = () => {
    setFile(null);
    setStatus(null);
    setResult(null);
    fileRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold" style={{ color: "#1E1E1E" }}>Bulk Resource Import</h2>
        <p className="text-xs mt-0.5" style={{ color: "#8E8E93" }}>
          Upload a CSV to add national support resources. Required fields: organization_name, state, city, resource_category.
        </p>
      </div>

      {/* Upload Zone */}
      <div
        onClick={() => fileRef.current.click()}
        className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer"
        style={{ borderColor: file ? "#4A90E2" : "#D1D1D6", background: file ? "#EBF3FD" : "#FAFAFA" }}
      >
        <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
        {file ? (
          <div className="flex flex-col items-center gap-2">
            <FileText className="w-8 h-8" style={{ color: "#4A90E2" }} strokeWidth={1.5} />
            <p className="text-sm font-medium" style={{ color: "#1E1E1E" }}>{file.name}</p>
            <p className="text-xs" style={{ color: "#8E8E93" }}>{(file.size / 1024).toFixed(1)} KB</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 opacity-30" strokeWidth={1.5} />
            <p className="text-sm" style={{ color: "#5A5A5A" }}>Click to upload CSV file</p>
            <p className="text-xs" style={{ color: "#8E8E93" }}>Supports standard CSV format</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {file && status !== "processing" && (
        <div className="flex gap-2">
          <button
            onClick={handleImport}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white"
            style={{ background: "#4A90E2" }}
          >
            Start Import
          </button>
          <button onClick={reset} className="px-4 py-2.5 rounded-lg text-sm" style={{ background: "#F0F0F3", border: "1px solid #D1D1D6", color: "#5A5A5A" }}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Processing */}
      {status === "processing" && (
        <div className="flex items-center gap-3 p-4 rounded-lg" style={{ background: "#EBF3FD", border: "1px solid #BFDBFE" }}>
          <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
          <div>
            <p className="text-sm font-medium" style={{ color: "#1E1E1E" }}>Processing import…</p>
            <p className="text-xs" style={{ color: "#5A5A5A" }}>Validating, deduplicating, and geocoding addresses</p>
          </div>
        </div>
      )}

      {/* Result Summary */}
      {status === "done" && result && (
        <div className="rounded-lg overflow-hidden" style={{ border: "1px solid #D1D1D6" }}>
          <div className="flex items-center gap-3 px-4 py-3" style={{ background: "#F0FDF4", borderBottom: "1px solid #86EFAC" }}>
            <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: "#22C55E" }} strokeWidth={2} />
            <p className="text-sm font-semibold" style={{ color: "#15803D" }}>Import Complete</p>
          </div>
          <div className="grid grid-cols-2 gap-0">
            {[
              { label: "Total Rows", value: result.total_rows },
              { label: "Inserted", value: result.inserted, color: "#22C55E" },
              { label: "Duplicates Skipped", value: result.duplicates_skipped, color: "#F59E0B" },
              { label: "Validation Errors", value: result.validation_errors, color: result.validation_errors > 0 ? "#EF4444" : "#8E8E93" },
              { label: "Geocoded", value: result.geocoded, color: "#4A90E2" },
            ].map((m, i) => (
              <div key={i} className="px-4 py-3" style={{ borderTop: "1px solid #F0F0F3", borderRight: i % 2 === 0 ? "1px solid #F0F0F3" : "none" }}>
                <p className="text-xs" style={{ color: "#8E8E93" }}>{m.label}</p>
                <p className="text-xl font-bold mt-0.5" style={{ color: m.color || "#1E1E1E" }}>{m.value ?? 0}</p>
              </div>
            ))}
          </div>

          {result.error_details?.length > 0 && (
            <div style={{ borderTop: "1px solid #D1D1D6" }}>
              <button
                onClick={() => setShowErrors(!showErrors)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium"
                style={{ color: "#5A5A5A" }}
              >
                <span>{result.error_details.length} warnings / skips</span>
                {showErrors ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {showErrors && (
                <div className="px-4 pb-3 max-h-40 overflow-y-auto flex flex-col gap-1">
                  {result.error_details.map((e, i) => (
                    <p key={i} className="text-xs" style={{ color: "#5A5A5A" }}>• {e}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {status === "error" && result?.error && (
        <div className="flex items-start gap-3 p-4 rounded-lg" style={{ background: "#FEF2F2", border: "1px solid #FCA5A5" }}>
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#EF4444" }} strokeWidth={2} />
          <div>
            <p className="text-sm font-medium" style={{ color: "#EF4444" }}>Import Failed</p>
            <p className="text-xs mt-0.5" style={{ color: "#5A5A5A" }}>{result.error}</p>
          </div>
        </div>
      )}

      {/* Import History */}
      {importLogs.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#8E8E93" }}>Import History</p>
          <div className="flex flex-col gap-2">
            {importLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between px-4 py-3 rounded-lg" style={{ background: "#FFF", border: "1px solid #D1D1D6" }}>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "#1E1E1E" }}>{log.filename}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#8E8E93" }}>
                    {log.inserted} inserted · {log.duplicates_skipped} dupes · {log.validation_errors} errors
                  </p>
                </div>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ml-3"
                  style={{
                    background: log.status === "success" ? "#F0FDF4" : log.status === "partial" ? "#FFFBEB" : "#FEF2F2",
                    color: log.status === "success" ? "#15803D" : log.status === "partial" ? "#B45309" : "#DC2626",
                  }}
                >
                  {log.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}