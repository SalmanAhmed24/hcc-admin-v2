"use client";
/*
 * TabOpportunity.jsx — Tab 7
 * PATCH /:id/research/report/opportunity
 * FILE LOCATION: src/components/research/tabs/TabOpportunity.jsx
 */
import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import DrawerShell, { SectionLabel, Field, ghostBtnStyle } from "../../DrawerShell";

const GRADES      = ["A","B","C","D","F"];
const EFFORTS     = ["quick win","medium","long term"];
const CATEGORIES  = ["seo","technical","local","content","ux"];
const SERVICES    = ["SEO","Website Development","Logo / Branding","Social Media","Custom App Dev","iOS / Android","AI Solutions"];
const PRIORITIES  = ["immediate","next 90 days","future"];
const EMPTY_ACT   = { rank:1, category:"seo", finding:"", action:"", estimatedImpact:"", effort:"medium" };
const EMPTY_SVC   = { service:"SEO", reason:"", priority:"immediate" };

function ScoreBar({ label, value, onChange }) {
  const n   = Number(value) || 0;
  const col = n >= 70 ? "#4ADE80" : n >= 40 ? "#FCD34D" : "#F87171";
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
        <span style={{ fontSize:12, color:"#A99BD4" }}>{label}</span>
        <input type="number" min={0} max={100} value={value??""} onChange={(e) => onChange(e.target.value===""?null:Number(e.target.value))}
          style={{ width:52,textAlign:"center",background:"transparent",border:"1px solid rgba(127,86,217,0.25)",borderRadius:6,fontSize:13,fontWeight:600,color:col,padding:"3px 6px",outline:"none" }} />
      </div>
      <div style={{ height:6, background:"rgba(255,255,255,0.05)", borderRadius:99, overflow:"hidden" }}>
        <div style={{ width:`${n}%`,height:"100%",background:col,borderRadius:99,transition:"width 0.3s" }} />
      </div>
    </div>
  );
}

export default function TabOpportunity({ client, report, onSave, onSaveNext }) {
  const [overallScore, setOverallScore] = useState(null);
  const [grade,        setGrade]        = useState("");
  const [scores,       setScores]       = useState({ technical:null,content:null,localSeo:null,backlinks:null,ux:null });
  const [actions,      setActions]      = useState([{ ...EMPTY_ACT }]);
  const [services,     setServices]     = useState([{ ...EMPTY_SVC }]);
  const [saving,       setSaving]       = useState(false);
  const [lastSaved,    setLastSaved]    = useState(null);

  useEffect(() => {
    const opp = report?.opportunityScore;
    if (!opp) return;
    if (opp.overallScore != null)        setOverallScore(opp.overallScore);
    if (opp.grade)                       setGrade(opp.grade);
    if (opp.scores)                      setScores({ ...scores, ...opp.scores });
    if (opp.priorityActions?.length)     setActions(opp.priorityActions);
    if (opp.recommendedServices?.length) setServices(opp.recommendedServices);
  }, [report]);

  const setScore    = (key) => (val) => setScores((p) => ({ ...p, [key]: val }));
  const updAct      = (i,k,v) => setActions((p)  => p.map((a,idx) => idx===i ? {...a,[k]:v} : a));
  const updSvc      = (i,k,v) => setServices((p) => p.map((s,idx) => idx===i ? {...s,[k]:v} : s));

  const handleSave = async (andNext = false) => {
    setSaving(true);
    try {
      const payload = { overallScore, grade,
        scoreTechnical:scores.technical, scoreContent:scores.content,
        scoreLocalSeo:scores.localSeo,  scoreBacklinks:scores.backlinks, scoreUx:scores.ux,
        priorityActions:    actions.filter((a) => a.finding.trim()),
        recommendedServices: services.filter((s) => s.reason.trim()),
      };
      if (andNext) await onSaveNext("opportunity", payload);
      else         await onSave("opportunity", payload);
      setLastSaved(new Date());
    } finally { setSaving(false); }
  };

  return (
    <DrawerShell title="Opportunity score" subtitle="Score each category and define priority actions" saving={saving} lastSaved={lastSaved} onSave={() => handleSave(false)} onSaveNext={() => handleSave(true)}>

      <SectionLabel>Overall score</SectionLabel>
      <div style={{ display:"flex",gap:16,marginBottom:20,alignItems:"flex-end" }}>
        <div style={{ flex:1 }}><ScoreBar label="Overall score /100" value={overallScore} onChange={setOverallScore} /></div>
        <div>
          <div style={{ fontSize:11,color:"#6B5F8A",marginBottom:5 }}>Grade</div>
          <div style={{ display:"flex",gap:6 }}>
            {GRADES.map((g) => (
              <button key={g} onClick={() => setGrade(g)} style={{ width:34,height:34,borderRadius:8,border:grade===g?"1.5px solid #B797FF":"1px solid rgba(127,86,217,0.2)",background:grade===g?"rgba(127,86,217,0.25)":"rgba(25,18,60,0.6)",color:grade===g?"#F5F0FF":"#6B5F8A",fontSize:14,fontWeight:700,cursor:"pointer" }}>{g}</button>
            ))}
          </div>
        </div>
      </div>

      <SectionLabel>Category breakdown</SectionLabel>
      <ScoreBar label="Technical SEO"    value={scores.technical} onChange={setScore("technical")} />
      <ScoreBar label="Content quality"  value={scores.content}   onChange={setScore("content")}   />
      <ScoreBar label="Local SEO"        value={scores.localSeo}  onChange={setScore("localSeo")}  />
      <ScoreBar label="Backlink profile" value={scores.backlinks} onChange={setScore("backlinks")} />
      <ScoreBar label="User experience"  value={scores.ux}        onChange={setScore("ux")}        />

      <SectionLabel>Priority actions (up to 5)</SectionLabel>
      {actions.map((a,i) => (
        <div key={i} style={{ background:"rgba(25,18,60,0.5)",border:"1px solid rgba(127,86,217,0.18)",borderRadius:12,padding:14,marginBottom:10 }}>
          <div style={{ display:"flex",gap:8,marginBottom:10,alignItems:"center" }}>
            <span style={{ width:24,height:24,borderRadius:"50%",background:"rgba(127,86,217,0.2)",color:"#B797FF",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0 }}>{i+1}</span>
            <select value={a.category} onChange={(e) => updAct(i,"category",e.target.value)} style={sel}>{CATEGORIES.map((c) => <option key={c} value={c} style={{background:"#1A1240"}}>{c}</option>)}</select>
            <select value={a.effort}   onChange={(e) => updAct(i,"effort",  e.target.value)} style={sel}>{EFFORTS.map((e)   => <option key={e} value={e} style={{background:"#1A1240"}}>{e}</option>)}</select>
            {actions.length>1 && <button onClick={() => setActions((p)=>p.filter((_,idx)=>idx!==i))} style={{marginLeft:"auto",background:"none",border:"none",color:"#F87171",cursor:"pointer"}}><Trash2 size={13}/></button>}
          </div>
          <Field label="Finding"><input value={a.finding}         onChange={(e) => updAct(i,"finding",e.target.value)}         placeholder="What's wrong…"              style={fi} /></Field>
          <div style={{marginTop:8}}><Field label="Action"><input value={a.action}          onChange={(e) => updAct(i,"action",e.target.value)}          placeholder="What to do…"               style={fi} /></Field></div>
          <div style={{marginTop:8}}><Field label="Estimated impact"><input value={a.estimatedImpact} onChange={(e) => updAct(i,"estimatedImpact",e.target.value)} placeholder="Expected outcome…"          style={fi} /></Field></div>
        </div>
      ))}
      {actions.length<5 && <button onClick={() => setActions((p) => [...p,{...EMPTY_ACT,rank:p.length+1}])} style={{...ghostBtnStyle(),fontSize:12,marginBottom:20}}><Plus size={12}/> Add action</button>}

      <SectionLabel>Recommended HCC services</SectionLabel>
      {services.map((s,i) => (
        <div key={i} style={{ display:"grid",gridTemplateColumns:"140px 120px 1fr 28px",gap:8,marginBottom:8,alignItems:"flex-start" }}>
          <select value={s.service}  onChange={(e) => updSvc(i,"service", e.target.value)} style={sel}>{SERVICES.map((sv)  => <option key={sv} value={sv} style={{background:"#1A1240"}}>{sv}</option>)}</select>
          <select value={s.priority} onChange={(e) => updSvc(i,"priority",e.target.value)} style={sel}>{PRIORITIES.map((p) => <option key={p}  value={p}  style={{background:"#1A1240"}}>{p}</option>)}</select>
          <input value={s.reason} onChange={(e) => updSvc(i,"reason",e.target.value)} placeholder="Why this service…" style={fi} />
          {services.length>1 && <button onClick={() => setServices((p)=>p.filter((_,idx)=>idx!==i))} style={{background:"none",border:"none",color:"#F87171",cursor:"pointer",paddingTop:4}}><Trash2 size={12}/></button>}
        </div>
      ))}
      <button onClick={() => setServices((p) => [...p,{...EMPTY_SVC}])} style={{...ghostBtnStyle(),fontSize:12}}><Plus size={12}/> Add service</button>
    </DrawerShell>
  );
}

const sel = { background:"rgba(20,14,48,0.7)",border:"1px solid rgba(127,86,217,0.25)",borderRadius:7,padding:"6px 9px",fontSize:12,color:"#B797FF",outline:"none",cursor:"pointer" };
const fi  = { width:"100%",background:"rgba(15,10,40,0.6)",border:"1px solid rgba(127,86,217,0.18)",borderRadius:7,padding:"6px 9px",fontSize:13,color:"#F5F0FF",outline:"none",boxSizing:"border-box" };