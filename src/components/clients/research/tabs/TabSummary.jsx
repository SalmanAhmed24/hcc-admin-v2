"use client";
/*
 * TabSummary.jsx — Tab 8
 * PATCH /:id/research/report/summary
 * FILE LOCATION: src/components/research/tabs/TabSummary.jsx
 */
import { useState, useEffect } from "react";
import DrawerShell, { SectionLabel, Field, AiBanner, ghostBtnStyle } from "../../DrawerShell";

export default function TabSummary({ client, report, onSave, onSaveNext }) {
  const [executiveSummary, setExecutiveSummary] = useState("");
  const [aiNotes,          setAiNotes]          = useState("");
  const [saving,           setSaving]           = useState(false);
  const [lastSaved,        setLastSaved]        = useState(null);

  useEffect(() => {
    if (report?.executiveSummary) setExecutiveSummary(report.executiveSummary);
    if (report?.aiNotes)          setAiNotes(report.aiNotes);
  }, [report]);

  const handleSave = async (andNext = false) => {
    setSaving(true);
    try {
      const payload = { executiveSummary, aiNotes };
      if (andNext) await onSaveNext("summary", payload);
      else         await onSave("summary", payload);
      setLastSaved(new Date());
    } finally { setSaving(false); }
  };

  //headerRight={<button style={{ display:"inline-flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:9,border:"1px solid rgba(183,151,255,0.4)",background:"rgba(183,151,255,0.08)",color:"#B797FF",fontSize:12,cursor:"pointer" }}>✦ Generate with AI</button>}

  return (
    <DrawerShell title="Executive summary" subtitle="Opening narrative of the report — written by you or AI" saving={saving} lastSaved={lastSaved} onSave={() => handleSave(false)} onSaveNext={() => handleSave(true)} saveNextLabel="Save & go to Submit →" 
    >
      {/* <AiBanner text="DeepSeek can write a 2–3 paragraph executive summary based on all the metrics you've entered. It will be placed at the top of the exported report." /> */}

      <SectionLabel>Executive summary</SectionLabel>
      <div style={{ position:"relative" }}>
        <textarea value={executiveSummary} onChange={(e) => setExecutiveSummary(e.target.value)}
          placeholder={`This SEO Analysis Report provides a comprehensive assessment of ${client?.clientName||"this business"}'s digital presence…`}
          rows={10}
          style={{ width:"100%",background:"rgba(20,14,48,0.7)",border:"1px solid rgba(127,86,217,0.25)",borderRadius:10,padding:"12px 14px",fontSize:13,color:"#F5F0FF",outline:"none",resize:"vertical",lineHeight:1.7,boxSizing:"border-box" }}
        />
        <div style={{ position:"absolute",bottom:10,right:12,fontSize:10,color:executiveSummary.length>800?"#4ADE80":"#534AB7" }}>
          {executiveSummary.length} chars
        </div>
      </div>

      <div style={{ marginTop:20 }}>
        <SectionLabel>Research notes (internal only — not exported to client)</SectionLabel>
        <Field hint="These notes appear in the internal view but NOT in the exported client document.">
          <textarea value={aiNotes} onChange={(e) => setAiNotes(e.target.value)}
            placeholder="Notes on data sources, limitations, or areas needing follow-up…"
            rows={5}
            style={{ width:"100%",background:"rgba(20,14,48,0.7)",border:"1px solid rgba(127,86,217,0.15)",borderRadius:10,padding:"10px 12px",fontSize:13,color:"#A99BD4",outline:"none",resize:"vertical",lineHeight:1.6,boxSizing:"border-box" }}
          />
        </Field>
      </div>
    </DrawerShell>
  );
}