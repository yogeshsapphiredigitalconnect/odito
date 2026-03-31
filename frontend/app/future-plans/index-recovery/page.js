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

/* ─── INDEX RECOVERY MODULE ─────────────────────────────────────────── */
function IndexRecovery(){
  const [deindexedPages,setDeindexedPages]=useState([
    {url:"https://agencyplatform.com/case-studies/ecommerce",issue:"thin_content",status:"pending",lastAttempt:"2025-03-13",attempts:2,successRate:0},
    {url:"https://agencyplatform.com/blog/outdated-seo-tips",issue:"orphan_page",status:"recovering",lastAttempt:"2025-03-12",attempts:3,successRate:67},
    {url:"https://agencyplatform.com/services/old-service",issue:"noindex_tag",status:"recovered",lastAttempt:"2025-03-10",attempts:1,successRate:100},
    {url:"https://agencyplatform.com/about/old-team",issue:"duplicate_content",status:"pending",lastAttempt:"2025-03-13",attempts:0,successRate:0},
  ]);

  const [recoveryActions,setRecoveryActions]=useState([
    {id:"a1",name:"Content Enhancement",description:"Expand thin content to 1000+ words",issues:["thin_content"],successRate:85,estimatedTime:"2-3 days"},
    {id:"a2",name:"Internal Link Building",description:"Add internal links from authority pages",issues:["orphan_page"],successRate:92,estimatedTime:"1-2 days"},
    {id:"a3",name:"Meta Tag Cleanup",description:"Remove noindex tags and fix robots.txt",issues:["noindex_tag"],successRate:98,estimatedTime:"1-4 hours"},
    {id:"a4",name:"Content Consolidation",description:"Merge duplicate content into canonical pages",issues:["duplicate_content"],successRate:78,estimatedTime:"3-5 days"},
  ]);

  const [recovering,setRecovering]=useState(null);

  function startRecovery(pageId,actionId){
    setRecovering(`${pageId}-${actionId}`);
    setTimeout(()=>{
      setDeindexedPages(prev=>prev.map(p=>p.id===pageId?{...p,status:"recovering",attempts:p.attempts+1,lastAttempt:new Date().toISOString().split('T')[0]}:p));
      setRecovering(null);
    },2500);
  }

  const statusColor={pending:T.am,recovering:T.cy,recovered:T.gr,failed:T.re};

  return(
    <div className="fade">
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:18}}>
        <Stat value={deindexedPages.length} label="Deindexed Pages" color={T.re}/>
        <Stat value={deindexedPages.filter(p=>p.status==="recovered").length} label="Recovered" color={T.gr}/>
        <Stat value={deindexedPages.filter(p=>p.status==="recovering").length} label="In Recovery" color={T.cy}/>
        <Stat value={Math.round(deindexedPages.reduce((s,p)=>s+p.successRate,0)/deindexedPages.length)} label="Success Rate" color={T.ind}/>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:14}}>
        <Card>
          <SHead title="Deindexed Pages Recovery" sub="Automated recovery actions for lost pages" icon="🔧"/>
          <div style={{padding:"10px 18px"}}>
            {deindexedPages.map(page=>(
              <div key={page.url} style={{padding:"14px 16px",background:T.bg3,border:`1px solid ${T.b}`,borderRadius:11,marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:11,fontWeight:700,color:T.cy,fontFamily:"monospace",marginBottom:4,wordBreak:"break-all"}}>{page.url}</div>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <Pill label={page.issue.replace(/_/g," ")} c="a" xs/>
                      <Pill label={page.status} c={page.status==="recovered"?"g":page.status==="recovering"?"c":"a"} xs/>
                      <span style={{fontSize:10,color:T.t3}}>Attempts: <b style={{color:T.t2}}>{page.attempts}</b></span>
                      <span style={{fontSize:10,color:T.t3}}>Success: <b style={{color:page.successRate>80?T.gr:page.successRate>50?T.am:T.re}}>{page.successRate}%</b></span>
                    </div>
                    <div style={{fontSize:10,color:T.t3,marginTop:4}}>Last attempt: {page.lastAttempt}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:9,color:T.t3,marginBottom:2}}>Status</div>
                    <div style={{fontSize:11,fontWeight:700,color:statusColor[page.status]}}>{page.status.replace(/_/g," ").toUpperCase()}</div>
                  </div>
                </div>
                
                <div style={{display:"flex",gap:6,alignItems:"center"}}>
                  {page.status==="pending"&&(
                    <>
                      <Btn sm v="pri" icon="🔧" loading={recovering===`${page.url}-enhance`} onClick={()=>startRecovery(page.url,"enhance")}>Enhance Content</Btn>
                      <Btn sm v="cy" icon="🔗" loading={recovering===`${page.url}-links`} onClick={()=>startRecovery(page.url,"links")}>Build Links</Btn>
                      <Btn sm v="gr" icon="⚙" loading={recovering===`${page.url}-meta`} onClick={()=>startRecovery(page.url,"meta")}>Fix Meta</Btn>
                    </>
                  )}
                  {page.status==="recovering"&&<Pill label="Recovering..." c="c" xs/>}
                  {page.status==="recovered"&&<Pill label="✓ Recovered" c="g" xs/>}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <Card>
            <SHead title="Recovery Actions" sub="Available strategies" icon="⚡"/>
            <div style={{padding:"10px 18px"}}>
              {recoveryActions.map(action=>(
                <div key={action.id} style={{padding:"10px 12px",background:T.bg3,border:`1px solid ${T.b}`,borderRadius:8,marginBottom:6}}>
                  <div style={{fontSize:11,fontWeight:700,color:T.t,marginBottom:3}}>{action.name}</div>
                  <div style={{fontSize:9,color:T.t3,marginBottom:4,lineHeight:1.3}}>{action.description}</div>
                  <div style={{display:"flex",gap:8,fontSize:9,color:T.t3}}>
                    <span>Success: <b style={{color:action.successRate>80?T.gr:action.successRate>60?T.am:T.re}}>{action.successRate}%</b></span>
                    <span>Time: <b style={{color:T.t2}}>{action.estimatedTime}</b></span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <SHead title="Recovery Queue" sub="Automated processing" icon="📋"/>
            <div style={{padding:"16px 18px"}}>
              <div style={{textAlign:"center",marginBottom:12}}>
                <div style={{fontSize:24,fontWeight:800,color:T.ind,marginBottom:4}}>{deindexedPages.filter(p=>p.status==="recovering").length}</div>
                <div style={{fontSize:9,color:T.t3}}>Pages in recovery</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:T.t3}}>
                  <span>Queue Status</span>
                  <span style={{color:T.gr}}>Active</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:T.t3}}>
                  <span>Processing Rate</span>
                  <span style={{color:T.t2}}>2-3 pages/day</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:T.t3}}>
                  <span>Estimated ETA</span>
                  <span style={{color:T.am}}>3-4 days</span>
                </div>
              </div>
              <Btn full v="cy" icon="⚡" style={{marginTop:12}}>Process Queue</Btn>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function IndexRecoveryPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="border-b pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Index Recovery
                </h1>
                <p className="text-muted-foreground">◈ Odito AI · Agency Platform</p>
              </div>
            </div>
          </div>
          <IndexRecovery/>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
