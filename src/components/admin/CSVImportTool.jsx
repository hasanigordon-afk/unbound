import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Upload, FileText, X, CheckCircle2, AlertCircle, Loader2, Download } from "lucide-react";

// Parse CSV (handles quoted fields with commas/newlines)
function parseCSV(text) {
  const rows = [];
  let cur = [], field = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i], next = text[i + 1];
    if (inQuotes) {
      if (c === '"' && next === '"') { field += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") { cur.push(field); field = ""; }
      else if (c === "\n" || c === "\r") {
        if (field !== "" || cur.length > 0) { cur.push(field); rows.push(cur); cur = []; field = ""; }
        if (c === "\r" && next === "\n") i++;
      } else field += c;
    }
  }
  if (field !== "" || cur.length > 0) { cur.push(field); rows.push(cur); }
  return rows.filter(r => r.some(v => v && v.trim() !== ""));
}

function csvToObjects(text) {
  const rows = parseCSV(text);
  if (rows.length < 2) return [];
  const headers = rows[0].map(h => h.trim());
  return rows.slice(1).map(r => {
    const obj = {};
    headers.forEach((h, i) => {
      const val = (r[i] ?? "").trim();
      if (val !== "") obj[h] = val;
    });
    return obj;
  });
}

// Coerce types based on entity schema
function coerceRow(row, schema) {
  const out = {};
  for (const [key, val] of Object.entries(row)) {
    const def = schema?.properties?.[key];
    if (!def) { out[key] = val; continue; }
    if (def.type === "number") {
      const n = Number(val);
      if (!Number.isNaN(n)) out[key] = n;
    } else if (def.type === "boolean") {
      out[key] = ["true", "1", "yes", "y"].includes(String(val).toLowerCase());
    } else if (def.type === "array") {
      out[key] = val.split(/[;|]/).map(s => s.trim()).filter(Boolean);
    } else {
      out[key] = val;
    }
  }
  return out;
}

export default function CSVImportTool({ entityName, sampleHeaders = [], description }) {
  const fileRef = useRef();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState(null); // null | importing | done | error
  const [result, setResult] = useState(null);

  const handleFile = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setResult(null); setStatus(null);
    const text = await f.text();
    const rows = csvToObjects(text);
    setPreview(rows);
  };

  const reset = () => {
    setFile(null); setPreview(null); setStatus(null); setResult(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleImport = async () => {
    if (!preview || preview.length === 0) return;
    setStatus("importing");
    try {
      const schema = await base44.entities[entityName].schema();
      const rows = preview.map(r => coerceRow(r, schema));
      // Bulk create in chunks of 50
      let inserted = 0;
      const errors = [];
      for (let i = 0; i < rows.length; i += 50) {
        const chunk = rows.slice(i, i + 50);
        try {
          await base44.entities[entityName].bulkCreate(chunk);
          inserted += chunk.length;
        } catch (err) {
          errors.push(`Rows ${i + 1}–${i + chunk.length}: ${err.message || err}`);
        }
      }
      setResult({ total: rows.length, inserted, errors });
      setStatus(errors.length ? "partial" : "done");
    } catch (err) {
      setStatus("error");
      setResult({ error: err.message || String(err) });
    }
  };

  const downloadTemplate = () => {
    const csv = sampleHeaders.join(",") + "\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${entityName}_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ background: "#fff", border: "1px solid #E4DFD3", borderRadius: 16, padding: 18 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 14 }}>
        <div>
          <p style={{ fontFamily: "'Lora',Georgia,serif", fontSize: 17, fontWeight: 700, color: "#1A1F2C", marginBottom: 3 }}>
            {entityName}
          </p>
          {description && <p style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.5 }}>{description}</p>}
        </div>
        {sampleHeaders.length > 0 && (
          <button onClick={downloadTemplate}
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "6px 11px", borderRadius: 999,
              border: "1px solid #E4DFD3", background: "#fff", color: "#4A5260",
              fontSize: 11, fontWeight: 700, cursor: "pointer",
              fontFamily: "'DM Sans',sans-serif", whiteSpace: "nowrap",
            }}>
            <Download style={{ width: 12, height: 12 }} /> Template
          </button>
        )}
      </div>

      {/* Upload zone */}
      <div onClick={() => fileRef.current.click()}
        style={{
          border: `2px dashed ${file ? "#0F1E3D" : "#E4DFD3"}`,
          borderRadius: 12, padding: "22px 14px", textAlign: "center", cursor: "pointer",
          background: file ? "#EEF1F8" : "#FBFAF6",
        }}>
        <input ref={fileRef} type="file" accept=".csv" style={{ display: "none" }} onChange={handleFile} />
        {file ? (
          <>
            <FileText style={{ width: 26, height: 26, color: "#0F1E3D", margin: "0 auto 6px" }} />
            <p style={{ fontSize: 13, fontWeight: 700, color: "#1A1F2C" }}>{file.name}</p>
            <p style={{ fontSize: 11, color: "#6B7280" }}>
              {(file.size / 1024).toFixed(1)} KB · {preview?.length ?? 0} rows
            </p>
          </>
        ) : (
          <>
            <Upload style={{ width: 26, height: 26, color: "#9B8E83", margin: "0 auto 6px" }} />
            <p style={{ fontSize: 13, color: "#4A5260", fontWeight: 600 }}>Click to upload CSV</p>
            <p style={{ fontSize: 11, color: "#9B8E83", marginTop: 2 }}>First row = column headers</p>
          </>
        )}
      </div>

      {/* Preview + actions */}
      {preview && preview.length > 0 && status !== "importing" && (
        <>
          <div style={{ marginTop: 12, padding: 10, background: "#FBFAF6", borderRadius: 10, border: "1px solid #E4DFD3" }}>
            <p style={{ fontSize: 10, fontWeight: 800, color: "#6B7280", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 6 }}>
              Detected columns
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {Object.keys(preview[0]).map(k => (
                <span key={k} style={{
                  fontSize: 10.5, padding: "3px 8px", borderRadius: 999,
                  background: "#fff", border: "1px solid #E4DFD3", color: "#4A5260", fontWeight: 600,
                }}>{k}</span>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button onClick={handleImport}
              style={{
                flex: 1, padding: "11px", borderRadius: 999, border: "none",
                background: "#0F1E3D", color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer",
                fontFamily: "'DM Sans',sans-serif",
              }}>
              Import {preview.length} {preview.length === 1 ? "row" : "rows"}
            </button>
            <button onClick={reset}
              style={{
                padding: "11px 14px", borderRadius: 999,
                background: "#fff", border: "1px solid #E4DFD3", color: "#4A5260", cursor: "pointer",
              }}>
              <X style={{ width: 14, height: 14 }} />
            </button>
          </div>
        </>
      )}

      {status === "importing" && (
        <div style={{ marginTop: 12, padding: 12, background: "#EEF1F8", borderRadius: 10, display: "flex", alignItems: "center", gap: 10 }}>
          <Loader2 className="animate-spin" style={{ width: 16, height: 16, color: "#0F1E3D" }} />
          <p style={{ fontSize: 12.5, color: "#1A1F2C", fontWeight: 600 }}>Importing… please wait.</p>
        </div>
      )}

      {(status === "done" || status === "partial") && result && (
        <div style={{
          marginTop: 12, padding: 12, borderRadius: 10,
          background: status === "done" ? "#ECF1EC" : "#FBF3E2",
          border: `1px solid ${status === "done" ? "rgba(107,143,113,0.32)" : "rgba(200,147,47,0.32)"}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <CheckCircle2 style={{ width: 16, height: 16, color: status === "done" ? "#5B6E48" : "#C8932F" }} />
            <p style={{ fontSize: 13, fontWeight: 800, color: "#1A1F2C" }}>
              Imported {result.inserted} of {result.total}
            </p>
          </div>
          {result.errors?.length > 0 && (
            <div style={{ marginTop: 6 }}>
              {result.errors.map((e, i) => (
                <p key={i} style={{ fontSize: 11, color: "#B5483D", marginTop: 2 }}>• {e}</p>
              ))}
            </div>
          )}
          <button onClick={reset}
            style={{ marginTop: 8, fontSize: 11, fontWeight: 700, color: "#0F1E3D",
              background: "transparent", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline" }}>
            Upload another
          </button>
        </div>
      )}

      {status === "error" && result?.error && (
        <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: "#FCE8E6", border: "1px solid rgba(181,72,61,0.32)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <AlertCircle style={{ width: 16, height: 16, color: "#B5483D" }} />
            <p style={{ fontSize: 12.5, color: "#B5483D", fontWeight: 700 }}>Import failed: {result.error}</p>
          </div>
        </div>
      )}
    </div>
  );
}