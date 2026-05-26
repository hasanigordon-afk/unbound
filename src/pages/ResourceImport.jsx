import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Database, Upload } from "lucide-react";
import CSVImportTool from "@/components/admin/CSVImportTool";
import { getConnectorStatuses } from "@/services/resourceConnectors";

const ENTITIES = [
  {
    entityName: "UniversalResource",
    description: "Universal nationwide resource model for treatment, meetings, basic needs, reentry, employment, veterans, and wellness.",
    sampleHeaders: ["name","category","subcategory","description","address","city","state","zip","county","latitude","longitude","phone","email","website","source_name","source_url","source_type","verification_status","accepts_medicaid","free_or_low_cost","veteran_focused","reentry_focused","tags"],
  },
  {
    entityName: "VeteranResource",
    description: "VA hospitals, mental health, housing, employment, food, legal, crisis, fitness.",
    sampleHeaders: ["name","category","subcategory","description","address","city","county","state","zip","phone","website","eligibility","hours","priority_score","verified"],
  },
  {
    entityName: "USRecoveryResource",
    description: "National recovery, housing, treatment, and support resources.",
    sampleHeaders: ["organization_name","program_name","resource_category","address","city","state","zip","phone","website","description"],
  },
  {
    entityName: "Meeting",
    description: "AA / NA / SMART recovery meetings (in-person + online).",
    sampleHeaders: ["title","program_type","meeting_type","meeting_format","format","in_person","address","city","state","zip","latitude","longitude","day_of_week","start_time","end_time","timezone","url","online_url","phone","accessibility_notes","language","source_name","source_url","last_synced_at","notes"],
  },
  {
    entityName: "MediaItem",
    description: "Approved videos, audio, articles, podcasts, meditations, music, breathing, binaural, and education.",
    sampleHeaders: ["title","description","media_type","category","source_name","source_url","thumbnail_url","duration_seconds","tags","is_approved"],
  },
  {
    entityName: "CommunityGroup",
    description: "Real peer groups users can join or leave.",
    sampleHeaders: ["name","description","category","privacy"],
  },
  {
    entityName: "NJTreatmentFacility",
    description: "New Jersey treatment facilities.",
    sampleHeaders: ["name","city","state","phone","services"],
  },
  {
    entityName: "NJHousingResource",
    description: "New Jersey housing & shelter resources.",
    sampleHeaders: ["name","city","county","phone","description"],
  },
];

export default function ResourceImport() {
  const navigate = useNavigate();
  const connectorStatuses = getConnectorStatuses();

  return (
    <div style={{ background: "#F6F4EF", minHeight: "100vh", paddingBottom: 130 }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>

        <div style={{ padding: "44px 20px 16px", background: "#fff", borderBottom: "1px solid #E4DFD3" }}>
          <button onClick={() => navigate("/")}
            style={{
              background: "transparent", border: "none", padding: 0, cursor: "pointer",
              display: "inline-flex", alignItems: "center", gap: 6,
              color: "#4A5260", fontSize: 13, fontWeight: 600, marginBottom: 12,
            }}>
            <ArrowLeft style={{ width: 15, height: 15 }} /> Home
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: "rgba(200,147,47,0.14)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Upload style={{ width: 22, height: 22, color: "#C8932F" }} />
            </div>
            <div>
              <h1 style={{ fontFamily: "'Lora',Georgia,serif", fontSize: 26, fontWeight: 700, color: "#0F1E3D", lineHeight: 1.1 }}>
                Resource <span style={{ color: "#C8932F" }}>Import</span>
              </h1>
              <p style={{ fontSize: 12.5, color: "#6B7280", marginTop: 3 }}>Upload CSV files directly into the database.</p>
            </div>
          </div>
        </div>

        <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: "rgba(91,141,239,0.10)", border: "1px solid rgba(91,141,239,0.28)", borderRadius: 16, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Database style={{ width: 18, height: 18, color: "#5B8DEF" }} />
              <h2 style={{ color: "#0F1E3D", fontSize: 18, fontWeight: 900 }}>National data source status</h2>
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {connectorStatuses.map((source) => (
                <div key={source.connectorName} style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: 12 }}>
                  <p style={{ margin: 0, color: "#111827", fontSize: 13, fontWeight: 900 }}>{source.connectorName} · {source.status}</p>
                  <p style={{ margin: "4px 0 0", color: "#6B7280", fontSize: 12, lineHeight: 1.5 }}>{source.message}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "rgba(200,147,47,0.08)", border: "1px solid rgba(200,147,47,0.24)",
            borderRadius: 12, padding: "12px 14px" }}>
            <p style={{ fontSize: 12, color: "#1A1F2C", lineHeight: 1.6 }}>
              <strong>Tip:</strong> Click <em>Template</em> to download a CSV with the correct column headers.
              Use semicolons (<code>;</code>) to separate values inside an array column.
            </p>
          </div>

          {ENTITIES.map(e => (
            <CSVImportTool key={e.entityName} {...e} />
          ))}
        </div>
      </div>
    </div>
  );
}