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

/* ─── INDEXING AUTOMATION MODULE ─────────────────────────────────────── */
function IndexingAutomation(){
  const [urls,setUrls]=useState([
    {id:"u1",url:"https://agencyplatform.com/blog/seo-audit-guide",status:"indexed",lastChecked:"2025-03-12",methods:["site_ping","gsc"],attempts:3},
    {id:"u2",url:"https://agencyplatform.com/services/technical-seo",status:"pending",lastChecked:"2025-03-13",methods:["site_ping"],attempts:1},
    {id:"u3",url:"https://agencyplatform.com/case-studies/ecommerce",status:"failed",lastChecked:"2025-03-11",methods:["site_ping","gsc","bing"],attempts:5},
    {id:"u4",url:"https://agencyplatform.com/about/team",status:"indexed",lastChecked:"2025-03-10",methods:["site_ping"],attempts:2},
  ]);

  const [automationRules,setAutomationRules]=useState([
    {id:"r1",name:"Auto-ping new content",trigger:"page_published",actions:["site_ping","gsc_submit"],status:"active",lastRun:"2025-03-12"},
    {id:"r2",name:"Retry failed indexing",trigger:"daily_cron",actions:["retry_failed"],status:"active",lastRun:"2025-03-13"},
    {id:"r3",name:"Bulk URL submission",trigger:"manual",actions:["bulk_gsc"],status:"paused",lastRun:"2025-03-08"},
  ]);

  const [submitting,setSubmitting]=useState(null);
  const [activeTab,setActiveTab]=useState("urls");

  function submitUrl(urlId,method){
    setSubmitting(`${urlId}-${method}`);
    setTimeout(()=>{
      setUrls(prev=>prev.map(u=>u.id===urlId?{...u,attempts:u.attempts+1,lastChecked:new Date().toISOString().split('T')[0]}:u));
      setSubmitting(null);
    },2000);
  }

  const statusColor={indexed:T.gr,pending:T.am,failed:T.re};

  return(
    <div className="fade">
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:18}}>
        <Stat value={urls.length} label="Total URLs" color={T.ind}/>
        <Stat value={urls.filter(u=>u.status==="indexed").length} label="Indexed" color={T.gr}/>
        <Stat value={urls.filter(u=>u.status==="pending").length} label="Pending" color={T.am}/>
        <Stat value={automationRules.filter(r=>r.status==="active").length} label="Active Rules" color={T.cy}/>
      </div>

      <Card>
        <div style={{padding:"13px 18px",borderBottom:`1px solid ${T.b}`,display:"flex",alignItems:"center",gap:10}}>
          <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:T.t}}>Indexing Automation</div><div style={{fontSize:10,color:T.t3,marginTop:1}}>Automated Google indexing and monitoring</div></div>
        </div>
        
        <div style={{display:"flex",gap:0,borderBottom:`1px solid ${T.b}`}}>
          {["urls","rules","queue"].map(tab=>(
            <button key={tab} onClick={()=>setActiveTab(tab)} style={{padding:"10px 16px",border:"none",borderBottom:`2px solid ${activeTab===tab?T.ind:"transparent"}`,background:"transparent",color:activeTab===tab?T.indL:T.t3,fontSize:11,fontWeight:activeTab===tab?700:400,cursor:"pointer",textTransform:"capitalize"}}>
              {tab} ({tab==="urls"?urls.length:tab==="rules"?automationRules.length:urls.filter(u=>u.status==="pending").length})
            </button>
          ))}
        </div>

        {activeTab==="urls"&&(
          <div style={{padding:"10px 18px"}}>
            {urls.map(url=>(
              <div key={url.id} style={{padding:"14px 16px",background:T.bg3,border:`1px solid ${T.b}`,borderRadius:11,marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:11,fontWeight:700,color:T.cy,fontFamily:"monospace",marginBottom:4,wordBreak:"break-all"}}>{url.url}</div>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <Pill label={url.status} c={url.status==="indexed"?"g":url.status==="pending"?"a":"r"} xs/>
                      <span style={{fontSize:10,color:T.t3}}>Checked: <b style={{color:T.t2}}>{url.lastChecked}</b></span>
                      <span style={{fontSize:10,color:T.t3}}>Attempts: <b style={{color:T.t2}}>{url.attempts}</b></span>
                    </div>
                    <div style={{fontSize:10,color:T.t3,marginTop:4}}>Methods: {url.methods.join(", ")}</div>
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    <Btn sm v="cy" icon="🔍" loading={submitting===`${url.id}-check`} onClick={()=>submitUrl(url.id,"check")}>Check</Btn>
                    <Btn sm v="pri" icon="📤" loading={submitting===`${url.id}-submit`} onClick={()=>submitUrl(url.id,"submit")}>Submit</Btn>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab==="rules"&&(
          <div style={{padding:"10px 18px"}}>
            {automationRules.map(rule=>(
              <div key={rule.id} style={{padding:"14px 16px",background:T.bg3,border:`1px solid ${T.b}`,borderRadius:11,marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:700,color:T.t,marginBottom:4}}>{rule.name}</div>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <Pill label={rule.status} c={rule.status==="active"?"g":"a"} xs/>
                      <span style={{fontSize:10,color:T.t3}}>Trigger: <b style={{color:T.t2}}>{rule.trigger.replace(/_/g," ")}</b></span>
                      <span style={{fontSize:10,color:T.t3}}>Last: <b style={{color:T.t2}}>{rule.lastRun}</b></span>
                    </div>
                    <div style={{fontSize:10,color:T.t3,marginTop:4}}>Actions: {rule.actions.join(", ").replace(/_/g," ")}</div>
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    <Btn sm v="cy" icon="⚡">Run Now</Btn>
                    <Btn sm v="gh" onClick={()=>setAutomationRules(prev=>prev.map(r=>r.id===rule.id?{...r,status:r.status==="active"?"paused":"active"}:r))}>
                      {rule.status==="active"?"Pause":"Resume"}
                    </Btn>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab==="queue"&&(
          <div style={{padding:"40px 18px",textAlign:"center",color:T.t3}}>
            <div style={{fontSize:48,marginBottom:16}}>📡</div>
            <div style={{fontSize:16,fontWeight:700,color:T.t,marginBottom:8}}>Indexing Queue</div>
            <div style={{fontSize:12,color:T.t3,marginBottom:20}}>{urls.filter(u=>u.status==="pending").length} URLs waiting for indexing</div>
            <Btn v="pri" icon="⚡">Process Queue</Btn>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function IndexingAutomationPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="border-b pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Indexing Automation
                </h1>
                <p className="text-muted-foreground">◈ Odito AI · Agency Platform</p>
              </div>
            </div>
          </div>
          <IndexingAutomation/>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
