"use client";

/**
 * ResearchEmailDrawer.jsx
 * Specialized email composer for sending research reports to clients.
 * Based on mailingDrawer.jsx but with:
 * - Auto-filled recipient from client email
 * - Auto-selected SEO comparison template (local server template)
 * - Auto-attached research DOCX export
 * - Merge variables populated from research data
 * - Auto-logged interaction on successful send
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import { apiPath, CLIENT_ROUTES } from "@/utils/routes";
import apiClient from "@/lib/apiClient";
import Swal from "sweetalert2";
import useAuthStore from "@/store/store";
import { Dialog } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { buildTemplateData, countVariableHealth } from "./researchEmailUtils";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── Local template definitions ────────────────────────────────────────────────
// Server-side templates in server/templates/. The older seo-comparison.html is
// preserved for future use. Proposal templates use SEOptimer letter grades.
const LOCAL_TEMPLATES = [
  { id: "website-audit",      label: "Website Audit — Digital Discovery", icon: "📊" },
  { id: "hcc-proposal-dark",  label: "HCC Proposal — Dark",               icon: "🌙" },
  { id: "hcc-proposal-light", label: "HCC Proposal — Light",              icon: "☀️" },
];
const LOCAL_TEMPLATE = LOCAL_TEMPLATES[0]; // default
const LOCAL_TEMPLATE_IDS = new Set(LOCAL_TEMPLATES.map((t) => t.id));

// Subject line builders per local template
function buildLocalSubject(templateId, client) {
  const name = client?.clientName || "Your Company";
  const contacts = client?.contacts || [];
  const primary = contacts.find((c) => c.isPrimary) || contacts[0] || {};
  const fn = primary.firstName || name.split(" ")[0] || "there";
  if (templateId === "website-audit") {
    return `${fn}, did you notice these urgent issues on the ${name} website?`;
  }
  // Proposal templates (dark + light share the subject)
  return `${fn}, your digital growth proposal for ${name} is ready`;
}

// ── Recipient chip input ──────────────────────────────────────────────────────
function ToField({ initialEmail = "", onChange = () => {}, missingEmail = false }) {
  const [recipients, setRecipients] = useState(() =>
    initialEmail ? [{ email: initialEmail, valid: EMAIL_REGEX.test(initialEmail) }] : []
  );
  const [input, setInput] = useState("");
  const inputRef = useRef(null);

  useEffect(() => onChange(recipients.map((r) => r.email)), [recipients]);

  useEffect(() => {
    if (!initialEmail) return;
    setRecipients((prev) => {
      const exists = prev.some((r) => r.email.toLowerCase() === initialEmail.toLowerCase());
      if (exists) return prev;
      return [{ email: initialEmail, valid: EMAIL_REGEX.test(initialEmail) }, ...prev];
    });
  }, [initialEmail]);

  function addRecipient(email) {
    const trimmed = email.trim();
    if (!trimmed) return;
    const exists = recipients.some((r) => r.email.toLowerCase() === trimmed.toLowerCase());
    if (!exists) {
      setRecipients((prev) => [...prev, { email: trimmed, valid: EMAIL_REGEX.test(trimmed) }]);
    }
    setInput("");
  }

  function removeRecipient(i) {
    setRecipients((prev) => prev.filter((_, idx) => idx !== i));
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (input.trim()) addRecipient(input);
    } else if (e.key === "Backspace" && !input && recipients.length) {
      removeRecipient(recipients.length - 1);
    }
  }

  function handlePaste(e) {
    const text = e.clipboardData.getData("text");
    const emails = text.split(/[,;\s]+/).map((s) => s.trim()).filter((s) => EMAIL_REGEX.test(s));
    if (emails.length) { e.preventDefault(); emails.forEach(addRecipient); }
  }

  const borderColor = missingEmail && recipients.length === 0
    ? "rgba(248,113,113,0.7)"
    : "rgba(69,44,149,0.5)";

  const inputStyle = {
    background: missingEmail && recipients.length === 0
      ? "rgba(248,113,113,0.08)"
      : "rgba(20,15,43,0.7)",
    border: `1px solid ${borderColor}`,
    borderRadius: 10, color: "#F5F0FF", fontSize: 13.5, outline: "none",
    transition: "border .15s", minHeight: 42,
    display: "flex", flexWrap: "wrap", gap: 4, padding: "6px 10px",
    cursor: "text",
  };

  return (
    <div>
      <div style={inputStyle} onClick={() => inputRef.current?.focus()}>
        {recipients.map((r, i) => (
          <span key={i} style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "2px 8px", borderRadius: 999, fontSize: 12, fontWeight: 500,
            background: r.valid ? "rgba(127,86,217,0.25)" : "rgba(248,113,113,0.2)",
            border: `1px solid ${r.valid ? "rgba(127,86,217,0.5)" : "rgba(248,113,113,0.5)"}`,
            color: r.valid ? "#E1C9FF" : "#FCA5A5",
          }}>
            {r.email}
            <button onClick={() => removeRecipient(i)} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0, fontSize: 13, lineHeight: 1 }}>×</button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={recipients.length === 0 ? "Add recipient email…" : undefined}
          style={{ flex: 1, minWidth: 140, outline: "none", background: "transparent", color: "#F5F0FF", fontSize: 13.5, border: "none", padding: "2px 0" }}
        />
      </div>
      {missingEmail && recipients.length === 0 && (
        <p style={{ color: "#FCA5A5", fontSize: 11, marginTop: 4, marginBottom: 0 }}>
          ⚠ No email on file for this client — add one manually
        </p>
      )}
    </div>
  );
}

// ── Attachment zone ───────────────────────────────────────────────────────────
function AttachmentZone({ attachments, setAttachments }) {
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef(null);

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div>
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault(); setDragging(false);
          setAttachments((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
        }}
        style={{
          border: `2px dashed ${dragging ? "#B797FF" : "rgba(127,86,217,0.4)"}`,
          borderRadius: 10, padding: "14px 16px", textAlign: "center",
          cursor: "pointer", transition: "all .2s",
          background: dragging ? "rgba(127,86,217,0.08)" : "rgba(20,15,43,0.4)",
        }}
      >
        <input ref={fileRef} type="file" multiple style={{ display: "none" }}
          onChange={(e) => setAttachments((prev) => [...prev, ...Array.from(e.target.files)])} />
        <div style={{ fontSize: 18, marginBottom: 4 }}>⊕</div>
        <div style={{ fontSize: 12.5, color: "#A99BD4" }}>
          Drag files here or <span style={{ color: "#B797FF", textDecoration: "underline" }}>browse</span>
        </div>
      </div>
      {attachments.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
          {attachments.map((file, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "5px 10px", borderRadius: 8,
              background: "rgba(20,15,43,0.6)", border: "1px solid rgba(127,86,217,0.3)",
              fontSize: 12, color: "#E1C9FF",
            }}>
              <span>📎</span>
              <span style={{ maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</span>
              <span style={{ color: "#6F618F", fontSize: 10.5 }}>{formatSize(file.size)}</span>
              <button onClick={() => setAttachments((prev) => prev.filter((_, idx) => idx !== i))}
                style={{ background: "none", border: "none", color: "#6F618F", cursor: "pointer", fontSize: 13, lineHeight: 1, padding: 0 }}>×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Variable status card ──────────────────────────────────────────────────────
function VariableStatusCard({ templateData }) {
  // Use the shared countVariableHealth which correctly handles numeric "0" values
  const { filled, missing } = countVariableHealth(templateData);

  return (
    <div style={{
      background: "rgba(20,15,43,0.6)",
      border: "1px solid rgba(127,86,217,0.25)",
      borderRadius: 12, padding: 14,
    }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#A99BD4", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
        Template Variables
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
        <div style={{
          flex: 1, padding: "6px 10px", borderRadius: 8,
          background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)",
          fontSize: 12, color: "#4ADE80", textAlign: "center",
        }}>
          ✓ {filled.length} filled
        </div>
        <div style={{
          flex: 1, padding: "6px 10px", borderRadius: 8,
          background: missing.length > 0 ? "rgba(248,113,113,0.1)" : "rgba(34,197,94,0.1)",
          border: `1px solid ${missing.length > 0 ? "rgba(248,113,113,0.25)" : "rgba(34,197,94,0.25)"}`,
          fontSize: 12, color: missing.length > 0 ? "#FCA5A5" : "#4ADE80", textAlign: "center",
        }}>
          {missing.length > 0 ? `⚠ ${missing.length} empty` : "✓ All filled"}
        </div>
      </div>
      {missing.length > 0 && (
        <div style={{ fontSize: 11, color: "#6F618F", lineHeight: 1.5 }}>
          Missing: {missing.slice(0, 6).join(", ")}{missing.length > 6 ? "…" : ""}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
const ResearchEmailDrawer = ({ open, onClose, client, researchData }) => {
  const user = useAuthStore((state) => state.user);
  const [body, setBody] = useState("");
  const [to, setTo] = useState([]);
  const [subject, setSubject] = useState("");
  const [service, setService] = useState("gmail");
  const [templateId, setTemplateId] = useState(LOCAL_TEMPLATE.id);
  const [isLocalTemplate, setIsLocalTemplate] = useState(true);
  const [templateBody, setTemplateBody] = useState("");
  const [templateOptions, setTemplateOptions] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [sending, setSending] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [attachingReport, setAttachingReport] = useState(false);

  const hccEmail = user?.user?.hccEmail || "";
  const id = user?.user?._id;
  const senderName = `${user?.user?.firstName || ""} ${user?.user?.secondName || ""}`.trim();
  const senderTitle = user?.user?.title || "Business Growth Consultant";
  const senderInfo = {
    email: hccEmail || user?.user?.email || "",
    phone: user?.user?.phone || "",
  };

  // Build template data from research (includes SEOptimer proposal vars)
  const templateData = buildTemplateData(client, researchData, senderName, senderTitle, senderInfo);

  // Client email
  const clientEmail = client?.email || "";
  const missingEmail = !clientEmail;

  // ── Init on open ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;

    // Auto-set subject for the default local template
    setSubject(buildLocalSubject(LOCAL_TEMPLATE.id, client));

    // Default to local template
    setTemplateId(LOCAL_TEMPLATE.id);
    setIsLocalTemplate(true);
    setTemplateBody("");
    setBody("");
    setAttachments([]);
    setTestEmail("");

    // Auto-attach research DOCX
    autoAttachReport();

    // Load external template options
    loadExternalTemplates();
  }, [open]);

  // ── Load external templates ──────────────────────────────────────────────
  async function loadExternalTemplates() {
    try {
      const res = await axios.get(`${apiPath.prodPath3}/api/templates`);
      const arr = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setTemplateOptions(arr.map((t) => ({ label: t.name, value: t._id || t.id })));
    } catch (err) {
      console.error("Failed to load templates:", err);
    }
  }

  // ── Auto-attach DOCX report ──────────────────────────────────────────────
  async function autoAttachReport() {
    if (!client?._id) return;
    setAttachingReport(true);
    try {
      const res = await apiClient.get(
        CLIENT_ROUTES.researchReportExport(client._id),
        { responseType: "blob" }
      );
      const clientLabel = (client.clientName || "Client").replace(/[^a-zA-Z0-9]/g, "_");
      const dateStr = new Date().toISOString().split("T")[0];
      const fileName = `SEO_Report_${clientLabel}_${dateStr}.docx`;
      const file = new File([res.data], fileName, { type: res.data.type || "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
      setAttachments([file]);
    } catch (err) {
      console.warn("Could not auto-attach report:", err);
      // Not critical — user can attach manually
    } finally {
      setAttachingReport(false);
    }
  }

  // ── Fetch external template body for preview ────────────────────────────
  async function fetchExternalTemplateBody(extTemplateId) {
    if (!extTemplateId) {
      setTemplateBody("");
      return;
    }
    try {
      const r = await axios.get(`${apiPath.prodPath3}/api/templates/${extTemplateId}`);
      setTemplateBody(r.data?.data?.body || "");
      const fetchedSubject = r.data?.data?.subject || "";
      if (fetchedSubject.trim()) setSubject(fetchedSubject);
    } catch (err) {
      setTemplateBody("");
    }
  }

  // ── Handle template switch ──────────────────────────────────────────────
  function handleTemplateChange(value) {
    if (LOCAL_TEMPLATE_IDS.has(value)) {
      setTemplateId(value);
      setIsLocalTemplate(true);
      setTemplateBody("");
      // Re-set subject for the chosen local template
      setSubject(buildLocalSubject(value, client));
    } else if (value === "") {
      setTemplateId("");
      setIsLocalTemplate(false);
      setTemplateBody("");
    } else {
      setTemplateId(value);
      setIsLocalTemplate(false);
      fetchExternalTemplateBody(value);
    }
  }

  // ── Build preview HTML for local template ───────────────────────────────
  const getPreviewHtml = useCallback(() => {
    if (!isLocalTemplate) return templateBody || body || "";
    if (body) return body;

    // ── HCC Proposal preview (dark / light) ──────────────────────────────
    if (templateId === "hcc-proposal-dark" || templateId === "hcc-proposal-light") {
      const dark = templateId === "hcc-proposal-dark";
      const bg      = dark ? "#0a1628" : "#f8fafc";
      const surface = dark ? "#0f1f3a" : "#ffffff";
      const tile    = dark ? "#162547" : "#f1f5f9";
      const text    = dark ? "#e2e8f0" : "#0f172a";
      const muted   = dark ? "#94a3b8" : "#64748b";
      const accent  = dark ? "#00d4aa" : "#0891b2";
      const grades = [
        { label: "Overall", grade: templateData.propOverallGrade, color: templateData.propOverallColor },
        { label: "On-Page SEO", grade: templateData.propSeoGrade, color: templateData.propSeoColor },
        { label: "GEO", grade: templateData.propGeoGrade, color: templateData.propGeoColor },
        { label: "Links", grade: templateData.propLinksGrade, color: templateData.propLinksColor },
        { label: "Usability", grade: templateData.propUsabilityGrade, color: templateData.propUsabilityColor },
        { label: "Performance", grade: templateData.propPerformanceGrade, color: templateData.propPerformanceColor },
      ];
      const tiles = grades.map(g => `
        <td style="text-align:center;width:16%;padding:4px;">
          <div style="background:${tile};border-radius:10px;padding:12px 4px;">
            <div style="font-size:9px;text-transform:uppercase;letter-spacing:1px;color:${muted};">${g.label}</div>
            <div style="font-size:26px;font-weight:800;color:${g.color};margin-top:4px;">${g.grade}</div>
          </div>
        </td>
      `).join("");
      return `
        <div style="font-family:Arial,sans-serif;padding:24px;background:${bg};">
          <div style="max-width:600px;margin:0 auto;background:${surface};border-radius:16px;padding:32px;border:1px solid ${dark ? "#1e3a5f" : "#e2e8f0"};">
            <div style="text-align:center;">
              <span style="display:inline-block;border:1px solid ${accent}44;border-radius:100px;padding:5px 14px;font-size:10px;font-weight:600;color:${accent};letter-spacing:1.5px;text-transform:uppercase;">● Digital Growth Proposal</span>
              <h2 style="margin:18px 0 0;font-size:24px;color:${text};line-height:1.25;">We Build <span style="color:${accent};">Attention Mechanisms</span> for Your Business</h2>
              <p style="margin:14px 0 2px;font-size:10px;color:${muted};letter-spacing:2px;text-transform:uppercase;">Prepared for</p>
              <p style="margin:0;font-size:17px;color:${accent};font-weight:700;">${templateData.clientName}</p>
              <p style="margin:10px 0 0;font-size:11px;color:${muted};">By ${templateData.senderName} · ${templateData.currentDate} · Valid 30 days</p>
            </div>
            <div style="margin-top:24px;">
              <div style="font-size:10px;text-transform:uppercase;letter-spacing:2px;color:${accent};font-weight:600;margin-bottom:8px;">Your Current Score (SEOptimer)</div>
              <table style="width:100%;border-collapse:collapse;"><tr>${tiles}</tr></table>
            </div>
            <div style="margin-top:20px;text-align:center;font-size:11px;color:${muted};">
              + About HCC · Services · Packages ($700 / $1,240 / $7,000) · Maintenance plans · Contact card
            </div>
          </div>
        </div>
      `;
    }

    // For the local template, show a simplified preview matching the website-audit
    // 5-category audit layout. The actual template is server-side.
    const cats = [
      { label: "On-Page SEO", grade: templateData.onPageSeoGrade, color: templateData.onPageSeoColor },
      { label: "GEO", grade: templateData.geoGrade, color: templateData.geoColor },
      { label: "Links", grade: templateData.linksGrade, color: templateData.linksColor },
      { label: "Usability", grade: templateData.usabilityGrade, color: templateData.usabilityColor },
      { label: "Performance", grade: templateData.performanceGrade, color: templateData.performanceColor },
    ];
    const circlesHtml = cats.map(c => `
      <td style="text-align:center;width:20%;padding:0 6px;">
        <div style="width:52px;height:52px;border-radius:50%;border:4px solid ${c.color};margin:0 auto;text-align:center;line-height:44px;">
          <span style="font-size:16px;font-weight:700;color:#1c1c1c;">${c.grade}</span>
        </div>
        <div style="margin-top:6px;font-size:10px;font-weight:600;color:#444;">${c.label}</div>
      </td>
    `).join("");

    return `
      <div style="font-family:sans-serif;padding:24px;background:#f5f5f5;">
        <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
          <div style="background:linear-gradient(135deg,#2D245B,#4A2CA0);padding:32px;color:#fff;">
            <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#B797FF;margin-bottom:10px;">HILL COUNTRY CODERS · DIGITAL DISCOVERY</div>
            <h2 style="margin:0;font-size:22px;line-height:1.3;">Audit Results for <span style="color:#B797FF;">${templateData.clientDomain}</span></h2>
            <p style="margin:10px 0 0;font-size:13px;color:#D4C4F0;">Hi ${templateData.firstName}, here's your complimentary website audit.</p>
          </div>
          <div style="padding:24px;">
            <div style="text-align:center;margin-bottom:20px;">
              <div style="display:inline-block;width:72px;height:72px;border-radius:50%;border:5px solid ${templateData.overallAuditColor};text-align:center;line-height:62px;">
                <span style="font-size:28px;font-weight:800;color:#1c1c1c;">${templateData.overallAuditGrade}</span>
              </div>
              <div style="font-size:12px;color:#666;margin-top:6px;">Overall Grade</div>
            </div>
            <table style="width:100%;"><tr>${circlesHtml}</tr></table>
            <div style="text-align:center;margin-top:24px;">
              <a href="#" style="display:inline-block;background:linear-gradient(180deg,#9B74F0,#6B42C8);color:#fff;padding:12px 32px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;">Book a 20-min Strategy Call</a>
            </div>
          </div>
          <div style="background:#F9FAFB;padding:16px 24px;text-align:center;font-size:11px;color:#999;">
            Sent by ${templateData.senderName} · Hill Country Coders
          </div>
        </div>
      </div>
    `;
  }, [isLocalTemplate, templateId, body, templateBody, templateData]);

  // ── Log interaction after successful send ───────────────────────────────
  async function logInteraction(recipientEmails) {
    try {
      await axios.patch(
        `${apiPath.prodPath}/api/clients/addClientInteractions/${client._id}`,
        {
          interactionCategory: "Research Email Sent",
          date: new Date().toISOString(),
          interactionDescription: `Research email sent to ${recipientEmails.join(", ")} using ${isLocalTemplate ? (LOCAL_TEMPLATES.find((t) => t.id === templateId)?.label || "Website Audit") : "custom"} template. Subject: "${subject}". Attachments: ${attachments.length} file(s).`,
          createdBy: senderName,
        }
      );
    } catch (err) {
      console.error("Failed to log interaction:", err);
      // Non-critical — don't block the flow
    }
  }

  // ── Send test ───────────────────────────────────────────────────────────
  const handleSendTest = async () => {
    if (!id) { Swal.fire("Error", "User not found", "error"); return; }
    if (!subject.trim()) { Swal.fire("Warning", "Subject is required", "warning"); return; }

    const resolvedTestEmail = testEmail.trim() || hccEmail?.trim();
    if (!resolvedTestEmail) { Swal.fire("Warning", "No test email address found", "warning"); return; }

    setSending(true);
    try {
      const formData = new FormData();
      formData.append("to", resolvedTestEmail);
      formData.append("subject", `[TEST] ${subject}`);
      formData.append("body", body);
      formData.append("service", service);
      if (templateId) formData.append("templateId", templateId);
      formData.append("templateData", JSON.stringify(templateData));
      attachments.forEach((file) => formData.append("attachments", file));

      await axios.post(`${apiPath.prodPath}/api/appGmail/send/${id}`, formData);
      Swal.fire({ icon: "success", text: `Test sent to ${resolvedTestEmail}`, timer: 2000, showConfirmButton: false });
    } catch (error) {
      console.error(error);
      Swal.fire("Error", error?.response?.data?.message || "Failed to send test", "error");
    } finally {
      setSending(false);
    }
  };

  // ── Send actual ─────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!id) { Swal.fire("Error", "User not found", "error"); return; }
    if (to.length === 0) { Swal.fire("Warning", "Please add at least one recipient", "warning"); return; }
    if (!subject.trim()) { Swal.fire("Warning", "Subject is required", "warning"); return; }

    setSending(true);
    try {
      const formData = new FormData();
      formData.append("to", to[0]);
      formData.append("subject", subject);
      formData.append("body", body);
      formData.append("service", service);
      if (templateId) formData.append("templateId", templateId);
      formData.append("templateData", JSON.stringify(templateData));
      attachments.forEach((file) => formData.append("attachments", file));

      await axios.post(`${apiPath.prodPath}/api/appGmail/send/${id}`, formData);

      // Auto-log interaction
      await logInteraction(to);

      Swal.fire({ icon: "success", text: "Research email sent!", timer: 1500, showConfirmButton: false });
      setBody(""); setSubject(""); setTemplateId(LOCAL_TEMPLATE.id); setAttachments([]); setTo([]);
      onClose();
    } catch (error) {
      console.error(error);
      Swal.fire("Error", error?.response?.data?.message || "Failed to send email", "error");
    } finally {
      setSending(false);
    }
  };

  // ── Styles ──────────────────────────────────────────────────────────────
  const inputStyle = {
    background: "rgba(20,15,43,0.7)", border: "1px solid rgba(69,44,149,0.5)",
    borderRadius: 10, padding: "10px 13px", color: "#F5F0FF",
    fontSize: 13.5, outline: "none", width: "100%", transition: "border .15s",
    fontFamily: "inherit",
  };

  const labelStyle = {
    fontSize: 11, fontWeight: 600, color: "#A99BD4",
    textTransform: "uppercase", letterSpacing: "0.06em",
    marginBottom: 5, display: "block",
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      sx={{ zIndex: 1400 }}
      PaperProps={{
        sx: {
          width: "96vw", maxWidth: "960px", height: "auto", maxHeight: "90vh",
          borderRadius: "20px", backgroundColor: "transparent",
          overflow: "hidden", m: 0,
          boxShadow: "0 40px 80px -20px rgba(0,0,0,0.8)",
        },
      }}
    >
      <div style={{
        display: "flex", flexDirection: "column",
        background: "linear-gradient(160deg, #2D245B 0%, #1B1539 100%)",
        border: "1px solid rgba(127,86,217,0.35)",
        borderRadius: 20, fontFamily: "'General Sans', system-ui, sans-serif",
        color: "#F5F0FF", maxHeight: "90vh", overflow: "hidden",
      }}>

        {/* ═══ HEADER ═══ */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 24px 12px",
          borderBottom: "1px solid rgba(127,86,217,0.2)", flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: "linear-gradient(135deg, #7F56D9, #4A2CA0)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15,
            }}>
              📊
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 600, letterSpacing: "-0.02em" }}>
                Send Research Email
              </p>
              <p style={{ margin: 0, fontSize: 11.5, color: "#A99BD4" }}>
                {client?.clientName || "Client"} — SEO Competitive Analysis
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 8,
            border: "1px solid rgba(127,86,217,0.35)",
            background: "rgba(127,86,217,0.08)", color: "#E1C9FF",
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          }}>
            <CloseIcon style={{ fontSize: 15 }} />
          </button>
        </div>

        {/* ═══ BODY ═══ */}
        <div style={{ display: "flex", minHeight: 0, maxHeight: "calc(90vh - 124px)" }}>

          {/* ── Left: Form fields ── */}
          <div style={{
            flex: 1, padding: "20px 24px", overflowY: "auto",
            display: "flex", flexDirection: "column", gap: 16,
            borderRight: "1px solid rgba(127,86,217,0.2)", minWidth: 0,
          }}>
            {/* From */}
            <div>
              <label style={labelStyle}>From</label>
              <div style={{ ...inputStyle, color: "#A99BD4", cursor: "default" }}>{hccEmail}</div>
            </div>

            {/* To */}
            <div>
              <label style={labelStyle}>To</label>
              <ToField
                initialEmail={clientEmail}
                onChange={(list) => setTo(list)}
                missingEmail={missingEmail}
              />
            </div>

            {/* Subject */}
            <div>
              <label style={labelStyle}>Subject</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject…"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#B797FF")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(69,44,149,0.5)")}
              />
            </div>

            {/* Service */}
            <div>
              <label style={labelStyle}>Service</label>
              <select value={service} onChange={(e) => setService(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="gmail">Gmail</option>
                <option value="sendgrid">SendGrid</option>
              </select>
            </div>

            {/* Template picker */}
            <div>
              <label style={labelStyle}>Template</label>
              <select
                value={templateId}
                onChange={(e) => handleTemplateChange(e.target.value)}
                style={{ ...inputStyle, cursor: "pointer" }}
              >
                {LOCAL_TEMPLATES.map((t, i) => (
                  <option key={t.id} value={t.id}>
                    {t.icon} {t.label}{i === 0 ? " (Recommended)" : ""}
                  </option>
                ))}
                <option value="">— No template (custom email) —</option>
                {templateOptions.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              {isLocalTemplate && (
                <p style={{ margin: "4px 0 0", fontSize: 11, color: "#7F56D9" }}>
                  ✓ Auto-filled with {client?.clientName || "client"}'s research data & competitor analysis
                </p>
              )}
            </div>

            {/* Body override */}
            <div>
              <label style={labelStyle}>
                {isLocalTemplate ? "Body Override (optional)" : "Body"}
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={isLocalTemplate
                  ? "Leave blank to use the SEO template with auto-filled data, or write an override…"
                  : "Write your message here…"
                }
                rows={5}
                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
                onFocus={(e) => (e.target.style.borderColor = "#B797FF")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(69,44,149,0.5)")}
              />
            </div>

            {/* Attachments */}
            <div>
              <label style={labelStyle}>
                Attachments
                {attachingReport && (
                  <span style={{ color: "#B797FF", marginLeft: 8, fontWeight: 400, textTransform: "none" }}>
                    Auto-attaching report…
                  </span>
                )}
              </label>
              <AttachmentZone attachments={attachments} setAttachments={setAttachments} />
            </div>
          </div>

          {/* ── Right: Preview + Variable Status ── */}
          <div style={{
            width: 340, flexShrink: 0,
            display: "flex", flexDirection: "column",
            background: "rgba(20,15,43,0.4)",
            overflowY: "auto", padding: "20px 20px", gap: 18,
          }}>
            {/* Live preview */}
            <div>
              <label style={labelStyle}>Live Preview</label>
              <div style={{
                background: "#fff", borderRadius: 10, overflow: "hidden",
                boxShadow: "0 4px 16px rgba(0,0,0,0.4)", minHeight: 200, position: "relative",
              }}>
                {(body || templateBody || isLocalTemplate) ? (
                  <>
                    <div style={{ width: "100%", height: 260, overflow: "hidden", position: "relative" }}>
                      <iframe
                        srcDoc={getPreviewHtml()}
                        style={{
                          width: "600px", height: "800px", border: "none", display: "block",
                          transform: "scale(0.52)", transformOrigin: "top left", pointerEvents: "none",
                        }}
                        title="Preview"
                        sandbox="allow-same-origin"
                      />
                    </div>
                    <button
                      onClick={() =>
                        window.open(
                          URL.createObjectURL(new Blob([getPreviewHtml()], { type: "text/html" })),
                          "_blank"
                        )
                      }
                      style={{
                        display: "block", width: "100%", padding: "8px",
                        background: "rgba(127,86,217,0.15)", border: "none",
                        borderTop: "1px solid rgba(127,86,217,0.2)",
                        color: "#B797FF", fontSize: 11.5, cursor: "pointer", fontWeight: 500,
                      }}
                    >
                      ↗ Open full preview
                    </button>
                  </>
                ) : (
                  <div style={{ padding: 24, textAlign: "center", color: "#999", fontSize: 12 }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>✦</div>
                    Preview appears once you select a template or add a body
                  </div>
                )}
              </div>
            </div>

            {/* Variable status */}
            {isLocalTemplate && <VariableStatusCard templateData={templateData} />}

            {/* Quick info card */}
            <div style={{
              background: "rgba(20,15,43,0.6)",
              border: "1px solid rgba(127,86,217,0.25)",
              borderRadius: 12, padding: 14,
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#A99BD4", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
                Email Summary
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ fontSize: 12, color: "#E1C9FF" }}>
                  <span style={{ color: "#6F618F", marginRight: 6 }}>Client:</span>
                  {client?.clientName || "—"}
                </div>
                <div style={{ fontSize: 12, color: "#E1C9FF" }}>
                  <span style={{ color: "#6F618F", marginRight: 6 }}>Template:</span>
                  {isLocalTemplate ? "Website Audit" : templateId ? "External" : "None"}
                </div>
                <div style={{ fontSize: 12, color: "#E1C9FF" }}>
                  <span style={{ color: "#6F618F", marginRight: 6 }}>Attachments:</span>
                  {attachments.length} file(s)
                </div>
                <div style={{ fontSize: 12, color: "#E1C9FF" }}>
                  <span style={{ color: "#6F618F", marginRight: 6 }}>Auto-log:</span>
                  <span style={{ color: "#4ADE80" }}>✓ Interaction will be recorded</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ FOOTER ═══ */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 24px",
          borderTop: "1px solid rgba(127,86,217,0.2)", flexShrink: 0,
          background: "rgba(20,15,43,0.4)",
        }}>
          <div style={{ fontSize: 12, color: "#6F618F" }}>
            {to.length > 0
              ? `Sending via ${service === "sendgrid" ? "SendGrid" : "Gmail"} to ${to[0]}${to.length > 1 ? ` +${to.length - 1} more` : ""}`
              : "No recipient yet"}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => { setBody(""); setSubject(""); setTemplateId(LOCAL_TEMPLATE.id); setAttachments([]); setTo([]); setTestEmail(""); onClose(); }}
              style={{
                padding: "8px 16px", borderRadius: 10, border: "1px solid rgba(127,86,217,0.35)",
                background: "rgba(127,86,217,0.08)", color: "#E1C9FF",
                fontSize: 13, fontWeight: 500, cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder={hccEmail || "test@email.com"}
              style={{
                background: "rgba(20,15,43,0.7)", border: "1px solid rgba(69,44,149,0.5)",
                borderRadius: 10, padding: "8px 12px", color: "#F5F0FF",
                fontSize: 12.5, outline: "none", width: 180, fontFamily: "inherit",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#B797FF")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(69,44,149,0.5)")}
            />
            <button
              onClick={handleSendTest}
              disabled={sending}
              style={{
                padding: "8px 16px", borderRadius: 10,
                border: "1px solid rgba(127,86,217,0.35)",
                background: "rgba(127,86,217,0.08)", color: "#E1C9FF",
                fontSize: 13, fontWeight: 500,
                cursor: sending ? "not-allowed" : "pointer",
              }}
            >
              {testEmail.trim() ? `Test → ${testEmail.trim().split("@")[0]}` : "Send test to me"}
            </button>
            <button
              onClick={handleSend}
              disabled={sending}
              style={{
                padding: "8px 20px", borderRadius: 10, border: "none",
                background: sending ? "rgba(127,86,217,0.3)" : "linear-gradient(180deg,#9B74F0,#6B42C8)",
                color: "white", fontSize: 13, fontWeight: 600,
                cursor: sending ? "not-allowed" : "pointer",
                boxShadow: sending ? "none" : "0 6px 20px -6px rgba(127,86,217,0.7)",
              }}
            >
              {sending ? "Sending…" : "Send Research ✈"}
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default ResearchEmailDrawer;
