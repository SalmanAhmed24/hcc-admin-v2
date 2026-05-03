"use client";
/*
 * TabCompanyInfo.jsx — Tab 1
 * PATCH /:id/research/report/company
 * FILE LOCATION: src/components/research/tabs/TabCompanyInfo.jsx
 */
import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import DrawerShell, { SectionLabel, Field, Input, ghostBtnStyle } from "../../DrawerShell";

const EMPTY_FORM    = { companyName: "", industry: "", currentDM: "", leadQualification: "", numberOfEmployees: "", annualRevenue: "", marketCapitalization: "" };
const EMPTY_KDM     = { name: "", designation: "", email: "", phone: "" };
const EMPTY_SERVICE = { serviceName: "", serviceType: "" };

const colHdr = { fontSize: 10, fontWeight: 600, color: "#534AB7", textTransform: "uppercase", letterSpacing: "0.06em" };

const rowInput = {
  width: "100%", background: "rgba(20,14,48,0.7)",
  border: "1px solid rgba(127,86,217,0.2)", borderRadius: 7,
  padding: "6px 9px", fontSize: 12, color: "#F5F0FF",
  outline: "none", boxSizing: "border-box",
};

const deleteBtn = (disabled) => ({
  width: 30, height: 30, borderRadius: 7,
  borderTop: "1px solid rgba(248,113,113,0.2)",
  borderRight: "1px solid rgba(248,113,113,0.2)",
  borderBottom: "1px solid rgba(248,113,113,0.2)",
  borderLeft: "1px solid rgba(248,113,113,0.2)",
  background: "rgba(248,113,113,0.06)",
  color: "#F87171",
  cursor: disabled ? "not-allowed" : "pointer",
  opacity: disabled ? 0.3 : 1,
  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
});

export default function TabCompanyInfo({ client, report, onSave, onSaveNext }) {
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [kdms,      setKdms]      = useState([{ ...EMPTY_KDM }]);
  const [services,  setServices]  = useState([{ ...EMPTY_SERVICE }]);
  const [saving,    setSaving]    = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    if (!client) return;
    setForm({
      companyName:          client.companyName                       || "",
      industry:             client.industry                          || "",
      currentDM:            client.currentDM                        || "",
      leadQualification:    client.leadQualification                 || "",
      numberOfEmployees:    client.companySize?.numberOfEmployees    || "",
      annualRevenue:        client.companySize?.annualRevenue        || "",
      marketCapitalization: client.companySize?.marketCapitalization || "",
    });
    if (client.keyDecisionMakers?.length) {
      setKdms(client.keyDecisionMakers.map((k) => ({
        name: k.name||"", designation: k.designation||"", email: k.email||"", phone: k.phone||"",
      })));
    }
    if (client.servicesOffered?.length) {
      setServices(client.servicesOffered.map((s) => ({
        serviceName: s.serviceName||"", serviceType: s.serviceType||"",
      })));
    }
  }, [client]);

  const setField     = (key) => (val) => setForm((p) => ({ ...p, [key]: val }));
  const addKdm       = () => setKdms((p) => [...p, { ...EMPTY_KDM }]);
  const removeKdm    = (i) => setKdms((p) => p.filter((_, idx) => idx !== i));
  const updateKdm    = (i, k, v) => setKdms((p) => p.map((r, idx) => idx === i ? { ...r, [k]: v } : r));
  const addService    = () => setServices((p) => [...p, { ...EMPTY_SERVICE }]);
  const removeService = (i) => setServices((p) => p.filter((_, idx) => idx !== i));
  const updateService = (i, k, v) => setServices((p) => p.map((r, idx) => idx === i ? { ...r, [k]: v } : r));

  const handleSave = async (andNext = false) => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        keyDecisionMakers: kdms.filter((k) => k.name.trim()),
        servicesOffered:   services.filter((s) => s.serviceName.trim()),
      };
      if (andNext) await onSaveNext("company", payload);
      else         await onSave("company", payload);
      setLastSaved(new Date());
    } finally { setSaving(false); }
  };

  const grid2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 };
  const divider = { borderBottom: "1px solid rgba(127,86,217,0.12)", marginBottom: 6, paddingBottom: 6 };

  return (
    <DrawerShell
      title="Company information"
      subtitle="Basic company profile — synced to the client record"
      saving={saving}
      lastSaved={lastSaved}
      onSave={() => handleSave(false)}
      onSaveNext={() => handleSave(true)}
    >
      {/* ── Company basics ── */}
      <SectionLabel>Company basics</SectionLabel>
      <div style={grid2}>
        <Field label="Company name"><Input value={form.companyName} onChange={setField("companyName")} placeholder="Acme Landscaping LLC" /></Field>
        <Field label="Industry"><Input value={form.industry} onChange={setField("industry")} placeholder="Landscaping / Home Services" /></Field>
        <Field label="Current decision maker"><Input value={form.currentDM} onChange={setField("currentDM")} placeholder="Owner or manager name" /></Field>
        <Field label="Lead qualification"><Input value={form.leadQualification} onChange={setField("leadQualification")} placeholder="Hot / Warm / Cold" /></Field>
      </div>

      {/* ── Company size ── */}
      <SectionLabel>Company size</SectionLabel>
      <div style={grid2}>
        <Field label="Number of employees"><Input value={form.numberOfEmployees} onChange={setField("numberOfEmployees")} type="number" /></Field>
        <Field label="Annual revenue ($)"><Input value={form.annualRevenue} onChange={setField("annualRevenue")} placeholder="e.g. 2500000" /></Field>
        <Field label="Market capitalisation ($)"><Input value={form.marketCapitalization} onChange={setField("marketCapitalization")} /></Field>
      </div>

      {/* ── Key Decision Makers ── */}
      <SectionLabel>Key decision makers</SectionLabel>
      <div style={{ display:"grid", gridTemplateColumns:"1.4fr 1.2fr 1.4fr 1fr 30px", gap:8, ...divider }}>
        {["Name", "Title / Role", "Email", "Phone", ""].map((h) => <span key={h} style={colHdr}>{h}</span>)}
      </div>
      {kdms.map((k, i) => (
        <div key={i} style={{ display:"grid", gridTemplateColumns:"1.4fr 1.2fr 1.4fr 1fr 30px", gap:8, marginBottom:6, alignItems:"center" }}>
          <input value={k.name}        onChange={(e) => updateKdm(i,"name",e.target.value)}        placeholder="John Smith"        style={rowInput} />
          <input value={k.designation} onChange={(e) => updateKdm(i,"designation",e.target.value)} placeholder="Owner"             style={rowInput} />
          <input value={k.email}       onChange={(e) => updateKdm(i,"email",e.target.value)}        placeholder="john@company.com"  style={rowInput} type="email" />
          <input value={k.phone}       onChange={(e) => updateKdm(i,"phone",e.target.value)}        placeholder="555-0100"          style={rowInput} />
          <button onClick={() => removeKdm(i)} disabled={kdms.length === 1} style={deleteBtn(kdms.length === 1)}>
            <Trash2 size={12} />
          </button>
        </div>
      ))}
      <button onClick={addKdm} style={{ ...ghostBtnStyle(), marginTop:8, marginBottom:28, fontSize:12 }}>
        <Plus size={13} /> Add decision maker
      </button>

      {/* ── Services Offered ── */}
      <SectionLabel>Services offered by this company</SectionLabel>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 30px", gap:8, ...divider }}>
        {["Service name", "Service type", ""].map((h) => <span key={h} style={colHdr}>{h}</span>)}
      </div>
      {services.map((s, i) => (
        <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 1fr 30px", gap:8, marginBottom:6, alignItems:"center" }}>
          <input value={s.serviceName} onChange={(e) => updateService(i,"serviceName",e.target.value)} placeholder="e.g. Lawn Maintenance"  style={rowInput} />
          <input value={s.serviceType} onChange={(e) => updateService(i,"serviceType",e.target.value)} placeholder="e.g. Recurring"         style={rowInput} />
          <button onClick={() => removeService(i)} disabled={services.length === 1} style={deleteBtn(services.length === 1)}>
            <Trash2 size={12} />
          </button>
        </div>
      ))}
      <button onClick={addService} style={{ ...ghostBtnStyle(), marginTop:8, fontSize:12 }}>
        <Plus size={13} /> Add service
      </button>
    </DrawerShell>
  );
}