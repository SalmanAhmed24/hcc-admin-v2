"use client";
/*
 * TabCompetitors.jsx — Tab 6
 * PATCH /:id/research/report/competitors
 * FILE LOCATION: src/components/research/tabs/TabCompetitors.jsx
 */
import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import DrawerShell, { SectionLabel, Field, AiBanner, ghostBtnStyle } from "../../DrawerShell";

const EMPTY_C = { name: "", website: "", authorityScore: "", domainRating: "", referringDomains: "", backlinks: "", organicTraffic: "", speedMobile: "", speedDesktop: "", indexingStatus: true, gmbProfile: true, gmbReviews: "", gmbRating: "", seoInsights: "", keywordGaps: "" };

const RBG  = { green: "rgba(74,222,128,0.12)",   yellow: "rgba(252,211,77,0.12)",  red: "rgba(248,113,113,0.12)",  gray: "rgba(255,255,255,0.04)" };
const RBD  = { green: "rgba(74,222,128,0.3)",    yellow: "rgba(252,211,77,0.3)",   red: "rgba(248,113,113,0.3)",   gray: "rgba(255,255,255,0.08)" };
const RTXT = { green: "#4ADE80", yellow: "#FCD34D", red: "#F87171", gray: "#6B5F8A" };

export default function TabCompetitors({ client, report, onSave, onSaveNext }) {
  const [competitors, setCompetitors] = useState([{ ...EMPTY_C }]);
  const [saving, setSaving]           = useState(false);
  const [lastSaved, setLastSaved]     = useState(null);

  useEffect(() => {
    if (report?.competitors?.length) {
      setCompetitors(report.competitors.map((c) => ({
        ...EMPTY_C, name: c.name||"", website: c.website||"",
        authorityScore: c.authorityScore??""  , domainRating: c.domainRating??"",
        referringDomains: c.referringDomains??"", backlinks: c.backlinks??"",
        organicTraffic: c.organicTraffic??"", speedMobile: c.speedMobile??"",
        speedDesktop: c.speedDesktop??"", indexingStatus: c.indexingStatus??true,
        gmbProfile: c.gmbProfile??true, gmbReviews: c.gmbReviews??"",
        gmbRating: c.gmbRating??"", seoInsights: c.seoInsights||"",
        keywordGaps: Array.isArray(c.keywordGaps) ? c.keywordGaps.join(", ") : "",
        _ratings: c.ratings||{},
      })));
    }
  }, [report]);

  const addComp    = () => setCompetitors((p) => [...p, { ...EMPTY_C }]);
  const removeComp = (i) => setCompetitors((p) => p.filter((_, idx) => idx !== i));
  const update     = (i, key, val) => setCompetitors((p) => p.map((c, idx) => idx === i ? { ...c, [key]: val } : c));

  const handleSave = async (andNext = false) => {
    setSaving(true);
    try {
      const payload = {
        competitors: competitors.filter((c) => c.name.trim()).map((c) => ({
          name: c.name.trim(), website: c.website.trim(),
          authorityScore:   c.authorityScore   !== "" ? Number(c.authorityScore)   : null,
          domainRating:     c.domainRating     !== "" ? Number(c.domainRating)     : null,
          referringDomains: c.referringDomains !== "" ? Number(c.referringDomains) : null,
          backlinks:        c.backlinks        !== "" ? Number(c.backlinks)        : null,
          organicTraffic:   c.organicTraffic   !== "" ? Number(c.organicTraffic)   : null,
          speedMobile:      c.speedMobile      !== "" ? Number(c.speedMobile)      : null,
          speedDesktop:     c.speedDesktop     !== "" ? Number(c.speedDesktop)     : null,
          indexingStatus: Boolean(c.indexingStatus), gmbProfile: Boolean(c.gmbProfile),
          gmbReviews: c.gmbReviews !== "" ? Number(c.gmbReviews) : null,
          gmbRating:  c.gmbRating  !== "" ? Number(c.gmbRating)  : null,
          seoInsights: c.seoInsights,
          keywordGaps: c.keywordGaps ? c.keywordGaps.split(",").map((s) => s.trim()).filter(Boolean) : [],
        })),
      };
      if (andNext) await onSaveNext("competitors", payload);
      else         await onSave("competitors", payload);
      setLastSaved(new Date());
    } finally { setSaving(false); }
  };

  //headerRight=
   // {<button style={{ display:"inline-flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:9,border:"1px solid rgba(183,151,255,0.4)",background:"rgba(183,151,255,0.08)",color:"#B797FF",fontSize:12,cursor:"pointer" }}>✦ Find competitors</button>}

  return (
    <DrawerShell title="Competitor comparison" subtitle="Up to 4 competitors — colour coding computed server-side" saving={saving} lastSaved={lastSaved} onSave={() => handleSave(false)} onSaveNext={() => handleSave(true)} 
    >
      {/* <AiBanner text="The AI agent can identify and populate your top competitors automatically based on the client's website and industry." /> */}

      {competitors.map((c, i) => (
        <div key={i} style={{ background: "rgba(25,18,60,0.5)", border: "1px solid rgba(127,86,217,0.2)", borderRadius: 14, padding: 16, marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center" }}>
            <input value={c.name}    onChange={(e) => update(i, "name", e.target.value)}    placeholder={`Competitor #${i+1}`} style={{ ...fi, fontWeight: 600, fontSize: 14, flex: 1 }} />
            <input value={c.website} onChange={(e) => update(i, "website", e.target.value)} placeholder="website.com"         style={{ ...fi, fontSize: 12, color: "#8B7CB3", flex: 1 }} />
            {competitors.length > 1 && <button onClick={() => removeComp(i)} style={{ width:28,height:28,borderRadius:7,border:"1px solid rgba(248,113,113,0.2)",background:"rgba(248,113,113,0.06)",color:"#F87171",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}><Trash2 size={12}/></button>}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 14 }}>
            {[{label:"Authority",key:"authorityScore",rKey:"authorityScore"},{label:"Traffic",key:"organicTraffic",rKey:"traffic"},{label:"Mobile spd",key:"speedMobile",rKey:"speedMobile"},{label:"Reviews",key:"gmbReviews",rKey:"gmbReviews"}].map(({label,key,rKey}) => (
              <div key={key} style={{ textAlign:"center" }}>
                <div style={{ fontSize:10,color:"#6B5F8A",marginBottom:6 }}>{label}</div>
                <input type="number" value={c[key]} onChange={(e) => update(i,key,e.target.value)} placeholder="—"
                  style={{ width:44,height:44,borderRadius:"50%",border:`1.5px solid ${RBD[c._ratings?.[rKey]||"gray"]}`,background:RBG[c._ratings?.[rKey]||"gray"],textAlign:"center",fontSize:12,fontWeight:600,color:RTXT[c._ratings?.[rKey]||"gray"],outline:"none",padding:0,display:"block",margin:"0 auto" }} />
              </div>
            ))}
          </div>

          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,marginBottom:10 }}>
            {[{label:"Dom.Rating",key:"domainRating"},{label:"Ref Domains",key:"referringDomains"},{label:"Backlinks",key:"backlinks"},{label:"Desk Speed",key:"speedDesktop"}].map(({label,key}) => (
              <div key={key}>
                <div style={{ fontSize:10,color:"#6B5F8A",marginBottom:3 }}>{label}</div>
                <input type="number" value={c[key]} onChange={(e) => update(i,key,e.target.value)} placeholder="—" style={{ ...fi,textAlign:"center" }} />
              </div>
            ))}
          </div>

          <Field label="SEO insights">
            <textarea value={c.seoInsights} onChange={(e) => update(i,"seoInsights",e.target.value)} placeholder="Brief analysis…" rows={2}
              style={{ ...fi,resize:"vertical",lineHeight:1.4,fontSize:12 }} />
          </Field>
          <div style={{ marginTop:8 }}>
            <Field label="Keyword gaps (comma-separated)">
              <input value={c.keywordGaps} onChange={(e) => update(i,"keywordGaps",e.target.value)} placeholder="lawn care austin, sprinkler repair…" style={fi} />
            </Field>
          </div>
        </div>
      ))}

      {competitors.length < 4 && (
        <button onClick={addComp} style={{ ...ghostBtnStyle(), width:"100%", justifyContent:"center", borderStyle:"dashed", marginTop:4 }}>
          <Plus size={13}/> Add competitor
        </button>
      )}
    </DrawerShell>
  );
}

const fi = { width:"100%",background:"rgba(15,10,40,0.6)",border:"1px solid rgba(127,86,217,0.18)",borderRadius:7,padding:"6px 9px",fontSize:13,color:"#F5F0FF",outline:"none",boxSizing:"border-box" };