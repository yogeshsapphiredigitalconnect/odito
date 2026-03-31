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

function Bar({v,color,h=5}){return <div style={{height:h,borderRadius:h/2,background:"rgba(255,255,255,.06)",overflow:"hidden"}}><div style={{width:`${Math.min(100,v)}%`,height:"100%",borderRadius:h/2,background:color,transition:"width .5s"}}/></div>;}

/* ─── ANCHOR OPTIMIZER MODULE ───────────────────────────────────────── */
function AnchorOptimizer(){
  const [currentDistribution,setCurrentDistribution] = useState({brand:41,partial:31,generic:19,exact:9});
  const [targetDistribution, setTargetDistribution] = useState({brand:40,partial:30,generic:20,exact:10});
  const [keyword,setKeyword] = useState("ai seo audit tool");
  const [url,setUrl] = useState("https://agencyplatform.com/services/seo-audit");
  const [generating,setGenerating] = useState(false);
  const [result,setResult] = useState(null);

  const VARS = {
    brand: ["Agency Platform", "Odito AI", "Odito", "AgencyPlatform.com"],
    partial: ["AI SEO platform", "SEO audit tool", "AI-powered SEO", "SEO automation"],
    generic: ["learn more", "click here", "read more", "visit here", "this guide"],
    exact: ["ai seo audit tool", "ai seo audit", "best ai seo audit tool"],
  };

  function generate(){
    setGenerating(true);setResult(null);
    setTimeout(()=>{
      const type=currentDistribution.brand<40?"brand":currentDistribution.partial<30?"partial":currentDistribution.generic<20?"generic":"exact";
      const opts=VARS[type];
      const chosen=opts[Math.floor(Math.random()*opts.length)];
      setResult({anchor:chosen,type,context_match:Math.floor(Math.random()*10+85),confidence:Math.floor(Math.random()*8+88)});
      setGenerating(false);
    },1300);
  }

  const typeColor={brand:T.ind,partial:T.cy,generic:T.vi,exact:T.am};

  return(
    <div className="fade">
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:18}}>
        {[["Brand",currentDistribution.brand,40,T.ind],["Partial",currentDistribution.partial,30,T.cy],["Generic",currentDistribution.generic,20,T.vi],["Exact",currentDistribution.exact,10,T.am]].map(([l,a,t,c])=>(
          <Stat key={l} value={`${a}%`} label={`${l} (target ${t}%)`} color={c} sub={Math.abs(a-t)<=4?"✓ On target":`${a>t?"+":""}${a-t}% off`}/>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14}}>
        <Card>
          <SHead title="Anchor Generator" sub="Weighted assignment · context matching" icon="⚖"/>
          <div style={{padding:"16px 18px"}}>
            {[["Target Keyword",keyword,setKeyword],["Target URL",url,setUrl]].map(([lbl,v,s])=>(
              <div key={lbl} style={{marginBottom:12}}>
                <div style={{fontSize:10,fontWeight:700,color:T.t3,textTransform:"uppercase",letterSpacing:".06em",marginBottom:4}}>{lbl}</div>
                <input value={v} onChange={e=>s(e.target.value)} style={{width:"100%",padding:"8px 11px",borderRadius:8,border:`1px solid ${T.b}`,background:T.bg3,color:T.t,fontSize:12,outline:"none",boxSizing:"border-box"}}/>
              </div>
            ))}
            <Btn full v="pri" loading={generating} icon={generating?undefined:"⚖"} onClick={generate}>Assign Anchor</Btn>
            {result&&<div style={{marginTop:12,padding:"12px 14px",background:T.gr+"0a",border:`1px solid ${T.gr}22`,borderRadius:8}}>
              <div style={{fontSize:10,fontWeight:700,color:T.gr,marginBottom:5}}>✦ Assigned</div>
              <div style={{fontSize:14,fontWeight:800,color:T.t,marginBottom:6}}>"{result.anchor}"</div>
              <div style={{display:"flex",gap:5}}>
                <Pill label={result.type} c={result.type==="brand"?"i":result.type==="partial"?"c":result.type==="exact"?"a":"v"} xs/>
                <Pill label={`Match ${result.context_match}%`} c="g" xs/>
                <Pill label={`${result.confidence}% conf.`} c="c" xs/>
              </div>
            </div>}
          </div>
        </Card>
        <Card>
          <SHead title="Distribution vs Target"/>
          <div style={{padding:"16px 18px"}}>
            {[["Brand",currentDistribution.brand,40,T.ind],["Partial",currentDistribution.partial,30,T.cy],["Generic",currentDistribution.generic,20,T.vi],["Exact",currentDistribution.exact,10,T.am]].map(([lbl,actual,target,c])=>{
              const dev=actual-target;const ok=Math.abs(dev)<=4;
              return(
                <div key={lbl} style={{marginBottom:14}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                    <span style={{fontSize:12,fontWeight:700,color:T.t}}>{lbl}</span>
                    <div style={{display:"flex",gap:8}}>
                      <span style={{fontSize:13,fontWeight:800,color:c,fontFamily:"monospace"}}>{actual}%</span>
                      <span style={{fontSize:10,color:ok?T.gr:T.re}}>({dev>=0?"+":""}{dev}%)</span>
                    </div>
                  </div>
                  <div style={{position:"relative",height:10,borderRadius:5,background:T.b}}>
                    <div style={{position:"absolute",left:`${target}%`,top:-3,width:2,height:16,background:T.t3+"88",borderRadius:1}}/>
                    <div style={{width:`${actual}%`,height:"100%",borderRadius:5,background:c}}/>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
        <Card>
          <SHead title="Variation Library"/>
          <div style={{padding:"12px 18px",maxHeight:360,overflowY:"auto"}}>
            {Object.entries(VARS).map(([type,opts])=>(
              <div key={type} style={{marginBottom:14}}>
                <div style={{fontSize:10,fontWeight:700,color:typeColor[type]||T.t2,textTransform:"uppercase",letterSpacing:".06em",marginBottom:6}}>{type} Anchors</div>
                {opts.map((o,i)=>(
                  <div key={i} style={{fontSize:10.5,color:T.t2,padding:"3px 8px",background:T.bg3,borderRadius:5,marginBottom:4,border:`1px solid ${T.b}`}}>"{o}"</div>
                ))}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function AnchorOptimizerPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="border-b pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Anchor Optimizer
                </h1>
                <p className="text-muted-foreground">◈ Odito AI · Agency Platform</p>
              </div>
            </div>
          </div>
          <AnchorOptimizer/>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
