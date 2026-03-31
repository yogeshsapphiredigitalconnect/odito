"use client";

import { useState, useEffect, useRef } from "react";
import { AuthGuard } from '@/components/guards/AuthGuard'
import DashboardLayout from "@/components/layout/dashboard-layout"

/* ══════════════════════════════════════════════════════════════════════
   ODITO AI  ·  UNIFIED MASTER PLATFORM
   Every module from every file — SEO Audit · AI Visibility · Keywords
   PageSpeed · Technical · GEO/AEO · Backlinks · Velocity · Anchor
   Link Builder · Index Recovery · Outreach · Pipeline · ARIA Chat
══════════════════════════════════════════════════════════════════════ */

/* ─── DESIGN TOKENS ────────────────────────────────────────────────── */
const T = {
  bg:"#030912",bg2:"#06111e",bg3:"#0a1827",
  card:"#0d1e32",card2:"#101f33",
  b:"rgba(255,255,255,.08)",b2:"rgba(255,255,255,.14)",
  s:"rgba(255,255,255,.04)",s2:"rgba(255,255,255,.07)",
  t:"#eef2ff",t2:"#8494b0",t3:"#4e5f7a",
  cy:"#00dfff",vi:"#7730ed",pu:"#c77dff",gr:"#00f5a0",
  am:"#ffb703",re:"#ff3860",bl:"#3b82f6",
  ind:"#4f46e5",ind2:"#6366f1",indL:"#818cf8",
  g1:"linear-gradient(135deg,#7730ed,#00dfff)",
  g2:"linear-gradient(135deg,#6366f1,#8b5cf6)",
  g3:"linear-gradient(135deg,#00dfff,#00f5a0)",
};

/* ─── ATOMS ─────────────────────────────────────────────────────────── */
const G = ()=><style>{`
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body,html,#root{height:100%;background:${T.bg};color:${T.t};font-family:'DM Sans',system-ui,sans-serif}
  ::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:3px}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes fu{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
  @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
  @keyframes orbpulse{0%,100%{box-shadow:0 0 0 3px rgba(99,102,241,.25)}50%{box-shadow:0 0 0 7px rgba(99,102,241,.08)}}
  .fade{animation:fu .3s forwards}
  @keyframes progress{from{width:0}to{width:100%}}
  button{font-family:'DM Sans',system-ui,sans-serif}
  button:hover{opacity:.88}
  select option{background:${T.bg2}}
  input::placeholder{color:${T.t3}}
`}</style>;

function Pill({label,c,xs}){
  const cols={g:T.gr,r:T.re,a:T.am,c:T.cy,v:T.pu,i:T.indL};
  const col=cols[c]||T.t2;
  return <span style={{display:"inline-flex",alignItems:"center",padding:xs?"2px 7px":"3px 10px",borderRadius:99,fontSize:xs?9.5:11,fontWeight:700,background:col+"18",color:col,border:`1px solid ${col}28`,whiteSpace:"nowrap"}}>{label}</span>;
}

function Btn({children,v="pri",sm,icon,onClick,full,loading,disabled}){
  const m={
    pri:{background:T.g2,color:"#fff",border:"none"},
    cy:{background:T.cy+"18",color:T.cy,border:`1px solid ${T.cy}44`},
    gh:{background:"transparent",color:T.t2,border:`1px solid ${T.b2}`},
    gr:{background:T.gr+"18",color:T.gr,border:`1px solid ${T.gr}44`},
    re:{background:T.re+"18",color:T.re,border:`1px solid ${T.re}33`},
    vi:{background:T.vi+"18",color:T.vi,border:`1px solid ${T.vi}44`},
    am:{background:T.am+"18",color:T.am,border:`1px solid ${T.am}33`},
  };
  return <button onClick={onClick} disabled={disabled||loading} style={{display:"inline-flex",alignItems:"center",gap:5,borderRadius:8,fontWeight:700,fontSize:sm?11:12,padding:sm?"5px 12px":"8px 16px",cursor:disabled?"not-allowed":"pointer",transition:"all .15s",width:full?"100%":undefined,justifyContent:full?"center":undefined,opacity:disabled?0.5:1,...m[v]}}>{loading&&<Spin size={11}/>}{icon&&!loading&&<span style={{fontSize:sm?12:14}}>{icon}</span>}{children}</button>;
}

const Spin=({size=16,col})=><div style={{width:size,height:size,borderRadius:"50%",border:`2px solid ${col||T.ind}30`,borderTopColor:col||T.ind,animation:"spin .7s linear infinite",flexShrink:0}}/>;

function Card({children,style={},glow}){return <div style={{background:T.card,border:`1px solid ${T.b}`,borderRadius:13,overflow:"hidden",boxShadow:glow?`0 0 22px ${glow}14`:"none",...style}}>{children}</div>;}

function SHead({title,sub,right,icon}){return <div style={{padding:"13px 18px",borderBottom:`1px solid ${T.b}`,display:"flex",alignItems:"center",gap:10}}>{icon&&<div style={{width:30,height:30,borderRadius:8,background:T.g1,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:"#fff"}}>{icon}</div>}<div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:T.t}}>{title}</div>{sub&&<div style={{fontSize:10,color:T.t3,marginTop:1}}>{sub}</div>}</div>{right}</div>;}

function Stat({label,value,color,sub}){return <div style={{background:T.card,border:`1px solid ${T.b}`,borderTop:`2px solid ${color}`,borderRadius:10,padding:"12px 14px"}}><div style={{fontSize:21,fontWeight:800,color,fontFamily:"'DM Mono',monospace"}}>{value}</div><div style={{fontSize:9.5,color:T.t3,marginTop:2,fontWeight:600,textTransform:"uppercase",letterSpacing:".05em"}}>{label}</div>{sub&&<div style={{fontSize:9.5,color:T.t3,marginTop:1}}>{sub}</div>}</div>;}

/* ─── INTERNAL LINKING MODULE ───────────────────────────────────────── */
function InternalLinking(){
  const [scanning,setScanning]=useState(false);
  const [scanDone,setScanDone]=useState(false);
  const [opportunities,setOpportunities]=useState([
    {from:"/blog/seo-audit-guide",to:"/features/seo-audit",keyword:"seo audit tool",context:"...using an seo audit tool you can identify...",score:94,status:"suggested"},
    {from:"/blog/core-web-vitals",to:"/features/pagespeed",keyword:"pagespeed optimization",context:"...pagespeed optimization becomes essential when...",score:88,status:"suggested"},
    {from:"/blog/ai-seo-2025",to:"/ai-seo",keyword:"AI SEO platform",context:"...the best AI SEO platform handles this automatically...",score:91,status:"applied"},
    {from:"/services/technical",to:"/features/technical",keyword:"technical seo checker",context:"...a technical seo checker catches crawl errors...",score:86,status:"suggested"},
    {from:"/blog/local-seo",to:"/features/local",keyword:"local seo audit",context:"...running a local seo audit helps you rank in...",score:82,status:"suggested"},
  ]);
  const [applying,setApplying]=useState(null);

  function scan(){
    setScanning(true);setScanDone(false);
    setTimeout(()=>{setScanning(false);setScanDone(true);},2200);
  }

  function applyLink(idx){
    setApplying(idx);
    setTimeout(()=>{
      setOpportunities(prev=>prev.map((o,i)=>i===idx?{...o,status:"applied"}:o));
      setApplying(null);
    },1800);
  }

  function applyAll(){
    opportunities.filter((o,i)=>o.status==="suggested").forEach((o,i)=>setTimeout(()=>applyLink(opportunities.indexOf(o)),i*500));
  }

  return(
    <div className="fade">
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:18}}>
        <Stat value={opportunities.length} label="Opportunities" color={T.ind}/>
        <Stat value={opportunities.filter(o=>o.status==="applied").length} label="Applied" color={T.gr}/>
        <Stat value={opportunities.filter(o=>o.status==="suggested").length} label="Suggested" color={T.am}/>
        <Stat value="Auto" label="Detection Mode" color={T.cy}/>
      </div>
      <Card>
        <div style={{padding:"13px 18px",borderBottom:`1px solid ${T.b}`,display:"flex",alignItems:"center",gap:10}}>
          <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:T.t}}>Internal Link Opportunities</div><div style={{fontSize:10,color:T.t3,marginTop:1}}>AI crawls pages · finds contextual anchor opportunities · injects links via WordPress API</div></div>
          <Btn sm v="pri" loading={scanning} icon={scanning?undefined:"🔍"} onClick={scan}>{scanning?"Crawling…":"Crawl Website"}</Btn>
          {scanDone&&<Btn sm v="gr" icon="⚡" onClick={applyAll}>Apply All</Btn>}
        </div>
        {scanDone&&<div style={{padding:"8px 18px",background:T.gr+"0a",borderBottom:`1px solid ${T.b}`,fontSize:11,color:T.gr}}>✓ Crawl complete — {opportunities.length} opportunities found across {new Set(opportunities.map(o=>o.from)).size} pages</div>}
        <div style={{padding:"10px 18px"}}>
          {opportunities.map((opp,i)=>(
            <div key={i} style={{padding:"12px 14px",background:T.bg3,border:`1px solid ${opp.status==="applied"?T.gr+"33":T.b}`,borderRadius:10,marginBottom:8,borderLeft:`3px solid ${opp.status==="applied"?T.gr:T.am}`}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:5}}>
                    <code style={{fontSize:10,color:T.cy,background:T.bg,padding:"1px 6px",borderRadius:4}}>{opp.from}</code>
                    <span style={{color:T.t3,fontSize:11}}>→</span>
                    <code style={{fontSize:10,color:T.indL,background:T.bg,padding:"1px 6px",borderRadius:4}}>{opp.to}</code>
                  </div>
                  <div style={{fontSize:11,color:T.t2,marginBottom:5,lineHeight:1.4}}>…{opp.context.replace(opp.keyword,`<b>${opp.keyword}</b>`)}…</div>
                  <div style={{display:"flex",gap:6}}>
                    <span style={{fontSize:9.5,fontWeight:700,color:T.ind,background:T.ind+"14",padding:"2px 7px",borderRadius:5}}>"{opp.keyword}"</span>
                    <span style={{fontSize:9.5,color:T.t3}}>Score: {opp.score}</span>
                  </div>
                </div>
                <div style={{flexShrink:0}}>
                  {opp.status==="applied"
                    ?<Pill label="✓ Applied" c="g" xs/>
                    :<Btn sm v="pri" icon="🔗" loading={applying===i} onClick={()=>applyLink(i)}>Apply</Btn>
                  }
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default function InternalLinkingPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="border-b pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Internal Linking
                </h1>
                <p className="text-muted-foreground">◈ Odito AI · Agency Platform</p>
              </div>
            </div>
          </div>
          <InternalLinking/>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
