import React, { useState } from "react";
import { X, Send, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";

export default function ServiceRequestModal({ service, user, onClose }) {
  const [message, setMessage] = useState("");

  const mutation = useMutation({
    mutationFn: () => base44.entities.ServiceRequest.create({
      service_id: service.id,
      creator_email: service.creator_email,
      requester_email: user.email,
      requester_name: user.full_name || "User",
      message,
      status: "pending",
    }),
    onSuccess: onClose,
  });

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 60, background: "rgba(0,0,0,0.75)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxWidth: 520,
        background: "linear-gradient(170deg,#0D1A2E,#0A0F1E)",
        border: "1px solid rgba(168,85,247,0.2)",
        borderRadius: "24px 24px 0 0",
        padding: "24px 20px 40px",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <p style={{ fontSize: 11, color: "#A855F7", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 4 }}>
              Service Request
            </p>
            <h3 style={{ fontSize: 17, fontWeight: 900, color: "#fff" }}>{service.title}</h3>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>by {service.creator_name}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)" }}>
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, marginBottom: 16 }}>
          Send a message to <strong style={{ color: "#fff" }}>{service.creator_name}</strong> to request this service.
          Be specific about what you need, your timeline, and any questions.
        </p>

        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Hi! I'm interested in your service. I need..."
          rows={5}
          style={{
            width: "100%", padding: "12px 14px", borderRadius: 12, marginBottom: 16,
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
            color: "#fff", fontSize: 13, outline: "none", resize: "none", boxSizing: "border-box",
          }}
        />

        <div style={{
          padding: "12px 14px", borderRadius: 12, marginBottom: 16,
          background: "rgba(62,207,191,0.06)", border: "1px solid rgba(62,207,191,0.15)",
        }}>
          <p style={{ fontSize: 11, color: "#3ECFBF", fontWeight: 700, marginBottom: 4 }}>🔒 Safe Communication</p>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>
            Keep all communication within the platform. Never share personal financial info. Report concerns to our moderation team.
          </p>
        </div>

        <button
          onClick={() => mutation.mutate()}
          disabled={!message.trim() || mutation.isPending}
          style={{
            width: "100%", padding: "14px", borderRadius: 14,
            background: message.trim() ? "linear-gradient(135deg,#A855F7,#7C3AED)" : "rgba(255,255,255,0.06)",
            border: "none", color: message.trim() ? "#fff" : "rgba(255,255,255,0.2)",
            fontWeight: 800, fontSize: 14, cursor: message.trim() ? "pointer" : "not-allowed",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          {mutation.isPending ? <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> : <><Send style={{ width: 14, height: 14 }} /> Send Request</>}
        </button>
      </div>
    </div>
  );
}