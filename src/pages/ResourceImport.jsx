import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload } from "lucide-react";
import CSVImportTool from "@/components/admin/CSVImportTool";

const ENTITIES = [
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
    sampleHeaders: ["title","program_type","meeting_format","in_person","address","city","state","zip","day_of_week","start_time","end_time","url","notes"],
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