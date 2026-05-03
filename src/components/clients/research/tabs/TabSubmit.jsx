"use client";
/*
 * TabSubmit.jsx — Tab 9 (Submit)
 * POST /:id/research/report/complete
 * GET  /:id/research/report/export
 * FILE LOCATION: src/components/research/tabs/TabSubmit.jsx
 */
import { useState } from "react";
import { CheckCircle2, XCircle, MinusCircle, Download, Send, Loader2, AlertCircle } from "lucide-react";
import DrawerShell, { SectionLabel } from "../../DrawerShell";

const REQUIRED_TABS = ["seo", "keywords"];

function ScoreMini({ label, value }) {
  const n   = Number(value) || 0;
  const col = n >= 70 ? "#4ADE80" : n >= 40 ? "#FCD34D" : "#F87171";
  return (
    <div style={{ marginBottom:10 }}>
      <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}>
        <span style={{ fontSize:12,color:"#A99BD4" }}>{label}</span>
        <span style={{ fontSize:12,fontWeight:600,color:col }}>{n}</span>
      </div>
      <div style={{ height:4,background:"rgba(255,255,255,0.05)",borderRadius:99 }}>
        <div style={{ width:`${n}%`,height:"100%",background:col,borderRadius:99,transition:"width 0.4s" }} />
      </div>
    </div>
  );
}

export default function TabSubmit({ client, report, savedTabs, tabs, onComplete, onExport }) {
  const [completing, setCompleting] = useState(false);
  const [error,      setError]      = useState(null);
  const [done,       setDone]       = useState(false);

  const missing    = REQUIRED_TABS.filter((id) => !savedTabs[id]);
  const canSubmit  = missing.length === 0;
  const opp        = report?.opportunityScore;
  const scores     = opp?.scores || {};

  const handleComplete = async () => {
    setCompleting(true); setError(null);
    try { await onComplete(); setDone(true); }
    catch (err) { setError(err?.response?.data?.message || err?.message || "Failed to submit."); }
    finally { setCompleting(false); }
  };

  if (done) return (
    <div style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,padding:40 }}>
      <div style={{ width:64,height:64,borderRadius:"50%",background:"rgba(74,222,128,0.12)",border:"1.5px solid rgba(74,222,128,0.35)",display:"flex",alignItems:"center",justifyContent:"center" }}>
        <CheckCircle2 size={28} style={{ color:"#4ADE80" }} />
      </div>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:18,fontWeight:600,color:"#F5F0FF",marginBottom:6 }}>Research complete</div>
        <div style={{ fontSize:13,color:"#6B5F8A",maxWidth:320 }}>Manager and BGC have been notified. The report is ready to export.</div>
      </div>
      <button onClick={onExport} style={{ display:"inline-flex",alignItems:"center",gap:8,padding:"10px 20px",borderRadius:10,background:"linear-gradient(135deg,#9B74F0,#6B42C8)",border:"none",color:"#F5F0FF",fontSize:14,fontWeight:500,cursor:"pointer",boxShadow:"0 4px 16px rgba(107,66,200,0.45)" }}>
        <Download size={16}/> Download report (.docx)
      </button>
    </div>
  );

  return (
    <DrawerShell title="Submit research" subtitle="Review completeness before notifying manager and BGC" saving={completing}
      footerLeft={canSubmit
        ? <span style={{ fontSize:11,color:"#4ADE80",display:"flex",alignItems:"center",gap:5 }}><CheckCircle2 size={11}/> Ready to submit</span>
        : <span style={{ fontSize:11,color:"#F87171",display:"flex",alignItems:"center",gap:5 }}><AlertCircle size={11}/> {missing.length} required tab{missing.length>1?"s":""} missing</span>
      }
    >
      <SectionLabel>Completion checklist</SectionLabel>
      {(tabs||[]).filter((t) => t.id !== "submit").map((tab) => {
        const saved    = savedTabs[tab.id];
        const required = REQUIRED_TABS.includes(tab.id);
        const Icon     = tab.icon;
        return (
          <div key={tab.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:10,marginBottom:5,background:saved?"rgba(74,222,128,0.06)":required?"rgba(248,113,113,0.06)":"rgba(255,255,255,0.02)",border:saved?"1px solid rgba(74,222,128,0.2)":required?"1px solid rgba(248,113,113,0.2)":"1px solid rgba(127,86,217,0.1)" }}>
            {saved ? <CheckCircle2 size={14} style={{color:"#4ADE80",flexShrink:0}}/> : required ? <XCircle size={14} style={{color:"#F87171",flexShrink:0}}/> : <MinusCircle size={14} style={{color:"#6B5F8A",flexShrink:0}}/>}
            <Icon size={13} style={{ color:saved?"#4ADE80":required?"#F87171":"#6B5F8A",flexShrink:0 }}/>
            <span style={{ fontSize:13,color:saved?"#A9E8C4":required?"#FCA5A5":"#6B5F8A" }}>{tab.label}</span>
            {required && !saved && <span style={{ marginLeft:"auto",fontSize:10,color:"#F87171",fontWeight:600 }}>REQUIRED</span>}
            {!required && !saved && <span style={{ marginLeft:"auto",fontSize:10,color:"#534AB7" }}>optional</span>}
          </div>
        );
      })}

      {opp?.overallScore != null && (
        <div style={{ marginTop:24 }}>
          <SectionLabel>Score preview</SectionLabel>
          <ScoreMini label="Technical SEO"    value={scores.technical} />
          <ScoreMini label="Content quality"  value={scores.content}   />
          <ScoreMini label="Local SEO"        value={scores.localSeo}  />
          <ScoreMini label="Backlink profile" value={scores.backlinks} />
          <ScoreMini label="User experience"  value={scores.ux}        />
        </div>
      )}

      {error && <div style={{ background:"rgba(248,113,113,0.08)",border:"1px solid rgba(248,113,113,0.25)",borderRadius:10,padding:"10px 14px",marginTop:16,fontSize:13,color:"#FCA5A5",lineHeight:1.4 }}>{error}</div>}

      <div style={{ display:"flex",gap:10,marginTop:20 }}>
        <button onClick={onExport} style={{ display:"inline-flex",alignItems:"center",gap:7,padding:"9px 16px",borderRadius:9,border:"1px solid rgba(127,86,217,0.3)",background:"rgba(127,86,217,0.08)",color:"#B797FF",fontSize:13,cursor:"pointer" }}>
          <Download size={14}/> Export draft
        </button>
        <button onClick={handleComplete} disabled={!canSubmit||completing}
          style={{ flex:1,display:"inline-flex",alignItems:"center",justifyContent:"center",gap:8,padding:"10px 20px",borderRadius:9,background:canSubmit&&!completing?"linear-gradient(135deg,#9B74F0,#6B42C8)":"rgba(127,86,217,0.2)",border:"none",color:canSubmit?"#F5F0FF":"#534AB7",fontSize:13,fontWeight:500,cursor:canSubmit&&!completing?"pointer":"not-allowed",boxShadow:canSubmit?"0 4px 16px rgba(107,66,200,0.35)":"none",transition:"all 0.2s" }}>
          {completing ? <><Loader2 size={14} className="animate-spin"/> Submitting…</> : canSubmit ? <><Send size={14}/> Complete &amp; notify team</> : <>Complete {missing.join(" & ")} first</>}
        </button>
      </div>
    </DrawerShell>
  );
}