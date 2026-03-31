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

/* ─── CITATION BUILDER MODULE ───────────────────────────────────────── */
function CitationBuilder(){
  const [citations,setCitations]=useState([
    {id:"c1",businessName:"Agency Platform",address:"123 Main St, New York, NY",phone:"(555) 123-4567",website:"https://agencyplatform.com",status:"verified",sources:12,consistency:95},
    {id:"c2",businessName:"SEO Audit Pro",address:"456 Oak Ave, Los Angeles, CA",phone:"(555) 987-6543",website:"https://seoauditpro.net",status:"inconsistent",sources:8,consistency:72},
    {id:"c3",businessName:"Tech Marketing Co",address:"789 Pine Rd, Chicago, IL",phone:"(555) 456-7890",website:"https://techmarketing.co",status:"pending",sources:0,consistency:0},
  ]);

  const [directories,setDirectories]=useState([
    {id:"d1",name:"Google Business Profile",da:100,status:"active",lastUpdate:"2025-03-10",importance:"critical"},
    {id:"d2",name:"Yelp",da:93,status:"active",lastUpdate:"2025-03-08",importance:"high"},
    {id:"d3",name:"Yellow Pages",da:87,status:"pending",lastUpdate:"2025-02-28",importance:"medium"},
    {id:"d4",name:"Foursquare",da:82,status:"active",lastUpdate:"2025-03-12",importance:"medium"},
  ]);

  const [submitting,setSubmitting]=useState(null);
  const [activeTab,setActiveTab]=useState("citations");

  function submitCitation(citationId,directoryId){
    setSubmitting(`${citationId}-${directoryId}`);
    setTimeout(()=>{
      setCitations(prev=>prev.map(c=>c.id===citationId?{...c,sources:c.sources+1}:c));
      setDirectories(prev=>prev.map(d=>d.id===directoryId?{...d,lastUpdate:new Date().toISOString().split('T')[0]}:d));
      setSubmitting(null);
    },2000);
  }

  const statusColor={verified:T.gr,inconsistent:T.am,pending:T.t3};

  return(
    <div className="fade">
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:18}}>
        <Stat value={citations.length} label="Businesses" color={T.ind}/>
        <Stat value={citations.filter(c=>c.status==="verified").length} label="Verified" color={T.gr}/>
        <Stat value={citations.reduce((s,c)=>s+c.sources,0)} label="Total Citations" color={T.cy}/>
        <Stat value={Math.round(citations.reduce((s,c)=>s+c.consistency,0)/citations.length)} label="Avg Consistency" color={T.am}/>
      </div>

      <Card>
        <div style={{padding:"13px 18px",borderBottom:`1px solid ${T.b}`,display:"flex",alignItems:"center",gap:10}}>
          <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:T.t}}>Citation Builder</div><div style={{fontSize:10,color:T.t3,marginTop:1}}>NAP consistency and local SEO citations</div></div>
        </div>
        
        <div style={{display:"flex",gap:0,borderBottom:`1px solid ${T.b}`}}>
          {["citations","directories","audit"].map(tab=>(
            <button key={tab} onClick={()=>setActiveTab(tab)} style={{padding:"10px 16px",border:"none",borderBottom:`2px solid ${activeTab===tab?T.ind:"transparent"}`,background:"transparent",color:activeTab===tab?T.indL:T.t3,fontSize:11,fontWeight:activeTab===tab?700:400,cursor:"pointer",textTransform:"capitalize"}}>
              {tab} ({tab==="citations"?citations.length:tab==="directories"?directories.length:"1"})
            </button>
          ))}
        </div>

        {activeTab==="citations"&&(
          <div style={{padding:"10px 18px"}}>
            {citations.map(citation=>(
              <div key={citation.id} style={{padding:"14px 16px",background:T.bg3,border:`1px solid ${T.b}`,borderRadius:11,marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:700,color:T.t,marginBottom:4}}>{citation.businessName}</div>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <Pill label={citation.status} c={citation.status==="verified"?"g":citation.status==="inconsistent"?"a":"i"} xs/>
                      <span style={{fontSize:10,color:T.t3}}>Sources: <b style={{color:T.t2}}>{citation.sources}</b></span>
                      <span style={{fontSize:10,color:T.t3}}>Consistency: <b style={{color:citation.consistency>=90?T.gr:citation.consistency>=70?T.am:T.re}}>{citation.consistency}%</b></span>
                    </div>
                    <div style={{fontSize:10,color:T.t3,marginTop:4,lineHeight:1.4}}>
                      <div>📍 {citation.address}</div>
                      <div>📞 {citation.phone}</div>
                      <div>🌐 {citation.website}</div>
                    </div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{width:60,height:60,borderRadius:"50%",background:`conic-gradient(${statusColor[citation.status]} ${citation.consistency}%, rgba(255,255,255,.1) 0)`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:4}}>
                      <div style={{width:48,height:48,borderRadius:"50%",background:T.card,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:statusColor[citation.status]}}>{citation.consistency}%</div>
                    </div>
                  </div>
                </div>
                <div style={{display:"flex",gap:6}}>
                  <Btn sm v="cy" icon="🔍">Audit</Btn>
                  <Btn sm v="pri" icon="📤">Submit</Btn>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab==="directories"&&(
          <div style={{padding:"10px 18px"}}>
            {directories.map(directory=>(
              <div key={directory.id} style={{padding:"14px 16px",background:T.bg3,border:`1px solid ${T.b}`,borderRadius:11,marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:700,color:T.t,marginBottom:4}}>{directory.name}</div>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <Pill label={`DA ${directory.da}`} c="c" xs/>
                      <Pill label={directory.status} c={directory.status==="active"?"g":"a"} xs/>
                      <Pill label={directory.importance} c={directory.importance==="critical"?"r":directory.importance==="high"?"a":"c"} xs/>
                      <span style={{fontSize:10,color:T.t3}}>Last: <b style={{color:T.t2}}>{directory.lastUpdate}</b></span>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    <Btn sm v="cy" icon="🔍">Check</Btn>
                    <Btn sm v="pri" icon="📤">Submit</Btn>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab==="audit"&&(
          <div style={{padding:"40px 18px",textAlign:"center",color:T.t3}}>
            <div style={{fontSize:48,marginBottom:16}}>📍</div>
            <div style={{fontSize:16,fontWeight:700,color:T.t,marginBottom:8}}>Citation Audit Report</div>
            <div style={{fontSize:12,color:T.t3,marginBottom:20}}>Comprehensive NAP consistency analysis across all directories</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,maxWidth:400,margin:"0 auto"}}>
              <div style={{padding:"12px",background:T.bg3,border:`1px solid ${T.b}`,borderRadius:8}}>
                <div style={{fontSize:18,fontWeight:800,color:T.gr,marginBottom:4}}>{citations.filter(c=>c.status==="verified").length}</div>
                <div style={{fontSize:9,color:T.t3}}>Verified</div>
              </div>
              <div style={{padding:"12px",background:T.bg3,border:`1px solid ${T.b}`,borderRadius:8}}>
                <div style={{fontSize:18,fontWeight:800,color:T.am,marginBottom:4}}>{citations.filter(c=>c.status==="inconsistent").length}</div>
                <div style={{fontSize:9,color:T.t3}}>Issues</div>
              </div>
              <div style={{padding:"12px",background:T.bg3,border:`1px solid ${T.b}`,borderRadius:8}}>
                <div style={{fontSize:18,fontWeight:800,color:T.ind,marginBottom:4}}>{Math.round(citations.reduce((s,c)=>s+c.consistency,0)/citations.length)}%</div>
                <div style={{fontSize:9,color:T.t3}}>Avg Score</div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function CitationBuilderPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="border-b pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Citation Builder
                </h1>
                <p className="text-muted-foreground">◈ Odito AI · Agency Platform</p>
              </div>
            </div>
          </div>
          <CitationBuilder/>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
