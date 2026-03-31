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

/* ─── PDF REPORTS MODULE ───────────────────────────────────────────── */
function PDFReports(){
  const [reports,setReports]=useState([
    {id:"r1",name:"SEO Audit Report",type:"comprehensive",pages:25,lastGenerated:"2025-03-12",status:"ready",downloads:147},
    {id:"r2",name:"AI Visibility Analysis",type:"ai_visibility",pages:18,lastGenerated:"2025-03-11",status:"ready",downloads:89},
    {id:"r3",name:"Technical SEO Review",type:"technical",pages:32,lastGenerated:"2025-03-10",status:"generating",downloads:0},
    {id:"r4",name:"Competitor Analysis",type:"competitor",pages:22,lastGenerated:"2025-03-09",status:"ready",downloads:56},
  ]);

  const [templates,setTemplates]=useState([
    {id:"t1",name:"Executive Summary",type:"summary",sections:5,customizable:true,branding:true},
    {id:"t2",name:"Full Technical Audit",type:"comprehensive",sections:12,customizable:true,branding:true},
    {id:"t3",name:"Client Presentation",type:"presentation",sections:8,customizable:true,branding:true},
    {id:"t4",name:"Quick Insights",type:"brief",sections:3,customizable:false,branding:false},
  ]);

  const [generating,setGenerating]=useState(null);
  const [activeTab,setActiveTab]=useState("reports");

  function generateReport(reportId){
    setGenerating(reportId);
    setTimeout(()=>{
      setReports(prev=>prev.map(r=>r.id===reportId?{...r,status:"ready",lastGenerated:new Date().toISOString().split('T')[0]}:r));
      setGenerating(null);
    },3000);
  }

  function downloadReport(reportId){
    setTimeout(()=>{
      setReports(prev=>prev.map(r=>r.id===reportId?{...r,downloads:r.downloads+1}:r));
    },1000);
  }

  return(
    <div className="fade">
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:18}}>
        <Stat value={reports.length} label="Total Reports" color={T.ind}/>
        <Stat value={reports.filter(r=>r.status==="ready").length} label="Ready" color={T.gr}/>
        <Stat value={reports.reduce((s,r)=>s+r.downloads,0)} label="Downloads" color={T.cy}/>
        <Stat value={templates.length} label="Templates" color={T.am}/>
      </div>

      <Card>
        <div style={{padding:"13px 18px",borderBottom:`1px solid ${T.b}`,display:"flex",alignItems:"center",gap:10}}>
          <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:T.t}}>PDF Report Generator</div><div style={{fontSize:10,color:T.t3,marginTop:1}}>Automated SEO reports with custom branding</div></div>
        </div>
        
        <div style={{display:"flex",gap:0,borderBottom:`1px solid ${T.b}`}}>
          {["reports","templates","settings"].map(tab=>(
            <button key={tab} onClick={()=>setActiveTab(tab)} style={{padding:"10px 16px",border:"none",borderBottom:`2px solid ${activeTab===tab?T.ind:"transparent"}`,background:"transparent",color:activeTab===tab?T.indL:T.t3,fontSize:11,fontWeight:activeTab===tab?700:400,cursor:"pointer",textTransform:"capitalize"}}>
              {tab} ({tab==="reports"?reports.length:tab==="templates"?templates.length:"1"})
            </button>
          ))}
        </div>

        {activeTab==="reports"&&(
          <div style={{padding:"10px 18px"}}>
            {reports.map(report=>(
              <div key={report.id} style={{padding:"14px 16px",background:T.bg3,border:`1px solid ${T.b}`,borderRadius:11,marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:700,color:T.t,marginBottom:4}}>{report.name}</div>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <Pill label={report.type.replace(/_/g," ")} c="c" xs/>
                      <Pill label={report.status} c={report.status==="ready"?"g":report.status==="generating"?"a":"i"} xs/>
                      <span style={{fontSize:10,color:T.t3}}>Pages: <b style={{color:T.t2}}>{report.pages}</b></span>
                      <span style={{fontSize:10,color:T.t3}}>Generated: <b style={{color:T.t2}}>{report.lastGenerated}</b></span>
                      <span style={{fontSize:10,color:T.t3}}>Downloads: <b style={{color:T.gr}}>{report.downloads}</b></span>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    {report.status==="generating"?(
                      <>
                        <Spin size={16}/>
                        <span style={{fontSize:10,color:T.am}}>Generating...</span>
                      </>
                    ):(
                      <>
                        <Btn sm v="sec" icon="👁️" onClick={()=>downloadReport(report.id)}>View</Btn>
                        <Btn sm v="pri" icon="⬇️" onClick={()=>downloadReport(report.id)}>Download</Btn>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab==="templates"&&(
          <div style={{padding:"40px 18px",textAlign:"center",color:T.t3}}>
            <div style={{fontSize:48,marginBottom:16}}>📋</div>
            <div style={{fontSize:16,fontWeight:700,color:T.t,marginBottom:8}}>Report Templates</div>
            <div style={{fontSize:12,color:T.t3,marginBottom:20}}>Customize report layouts and branding</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,maxWidth:400,margin:"0 auto"}}>
              <div style={{padding:"12px",background:T.bg3,border:`1px solid ${T.b}`,borderRadius:8}}>
                <div style={{fontSize:18,fontWeight:800,color:T.ind,marginBottom:4}}>A4</div>
                <div style={{fontSize:9,color:T.t3}}>Page Size</div>
              </div>
              <div style={{padding:"12px",background:T.bg3,border:`1px solid ${T.b}`,borderRadius:8}}>
                <div style={{fontSize:18,fontWeight:800,color:T.gr,marginBottom:4}}>HD</div>
                <div style={{fontSize:9,color:T.t3}}>Quality</div>
              </div>
              <div style={{padding:"12px",background:T.bg3,border:`1px solid ${T.b}`,borderRadius:8}}>
                <div style={{fontSize:18,fontWeight:800,color:T.cy,marginBottom:4}}>On</div>
                <div style={{fontSize:9,color:T.t3}}>Branding</div>
              </div>
            </div>
          </div>
        )}

        {activeTab==="settings"&&(
          <div style={{padding:"40px 18px",textAlign:"center",color:T.t3}}>
            <div style={{fontSize:48,marginBottom:16}}>📄</div>
            <div style={{fontSize:16,fontWeight:700,color:T.t,marginBottom:8}}>PDF Report Settings</div>
            <div style={{fontSize:12,color:T.t3,marginBottom:20}}>Configure default settings for PDF generation</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,maxWidth:400,margin:"0 auto"}}>
              <div style={{padding:"12px",background:T.bg3,border:`1px solid ${T.b}`,borderRadius:8}}>
                <div style={{fontSize:18,fontWeight:800,color:T.ind,marginBottom:4}}>A4</div>
                <div style={{fontSize:9,color:T.t3}}>Page Size</div>
              </div>
              <div style={{padding:"12px",background:T.bg3,border:`1px solid ${T.b}`,borderRadius:8}}>
                <div style={{fontSize:18,fontWeight:800,color:T.gr,marginBottom:4}}>HD</div>
                <div style={{fontSize:9,color:T.t3}}>Quality</div>
              </div>
              <div style={{padding:"12px",background:T.bg3,border:`1px solid ${T.b}`,borderRadius:8}}>
                <div style={{fontSize:18,fontWeight:800,color:T.cy,marginBottom:4}}>On</div>
                <div style={{fontSize:9,color:T.t3}}>Branding</div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function PDFReportsPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="border-b pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  PDF Reports
                </h1>
                <p className="text-muted-foreground">◈ Odito AI · Agency Platform</p>
              </div>
            </div>
          </div>
          <PDFReports/>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
