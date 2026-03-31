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

/* ─── DIRECTORY SUBMISSION MODULE ───────────────────────────────────── */
function DirectorySubmission(){
  const [directories,setDirectories]=useState([
    {id:"d1",name:"SEO Tools Directory",url:"https://seotools.com/submit",da:65,status:"active",lastSubmit:"2025-03-10",approved:3,pending:2,rejected:0},
    {id:"d2",name:"Marketing Software List",url:"https://marketingsoftware.org/list",da:58,status:"active",lastSubmit:"2025-03-08",approved:2,pending:1,rejected:0},
    {id:"d3",name:"AI Marketing Hub",url:"https://aimarketinghub.com/submit",da:52,status:"paused",lastSubmit:"2025-03-01",approved:1,pending:0,rejected:1},
    {id:"d4",name:"Digital Agency Directory",url:"https://digitalagency.org/add",da:71,status:"active",lastSubmit:"2025-03-12",approved:4,pending:3,rejected:1},
  ]);

  const [submitting,setSubmitting]=useState(null);
  const [newSubmission,setNewSubmission]=useState({url:"",title:"",description:"",category:"seo-tools"});

  function submitToDirectory(dirId){
    setSubmitting(dirId);
    setTimeout(()=>{
      setDirectories(prev=>prev.map(d=>d.id===dirId?{...d,pending:d.pending+1,lastSubmit:new Date().toISOString().split('T')[0]}:d));
      setSubmitting(null);
      setNewSubmission({url:"",title:"",description:"",category:"seo-tools"});
    },2000);
  }

  return(
    <div className="fade">
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:18}}>
        <Stat value={directories.length} label="Total Directories" color={T.ind}/>
        <Stat value={directories.filter(d=>d.status==="active").length} label="Active" color={T.gr}/>
        <Stat value={directories.reduce((s,d)=>s+d.approved,0)} label="Approved" color={T.gr}/>
        <Stat value={directories.reduce((s,d)=>s+d.pending,0)} label="Pending" color={T.am}/>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:14}}>
        <Card>
          <SHead title="Directory List" sub="Manage submissions to SEO directories" icon="📋"/>
          <div style={{padding:"10px 18px"}}>
            {directories.map(dir=>(
              <div key={dir.id} style={{padding:"14px 16px",background:T.bg3,border:`1px solid ${T.b}`,borderRadius:11,marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:700,color:T.t,marginBottom:4}}>{dir.name}</div>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <Pill label={`DA ${dir.da}`} c="c" xs/>
                      <Pill label={dir.status} c={dir.status==="active"?"g":"a"} xs/>
                      <span style={{fontSize:10,color:T.t3}}>Last: <b style={{color:T.t2}}>{dir.lastSubmit}</b></span>
                    </div>
                    <div style={{fontSize:10,color:T.cy,fontFamily:"monospace",marginTop:4}}>{dir.url}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:9,color:T.t3,marginBottom:2}}>{dir.approved}/{dir.pending}/{dir.rejected}</div>
                    <div style={{fontSize:10,color:T.t3}}>✓/⏳/✗</div>
                  </div>
                </div>
                <div style={{display:"flex",gap:6}}>
                  <Btn sm v="pri" icon="📤" loading={submitting===dir.id} onClick={()=>submitToDirectory(dir.id)}>Submit</Btn>
                  <Btn sm v="cy" icon="👁">View</Btn>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SHead title="New Submission" sub="Submit to directories" icon="📤"/>
          <div style={{padding:"16px 18px"}}>
            {[
              {label:"URL",field:"url",placeholder:"https://example.com/page"},
              {label:"Title",field:"title",placeholder:"SEO Audit Tool"},
              {label:"Description",field:"description",placeholder:"Comprehensive SEO analysis platform"},
              {label:"Category",field:"category",type:"select",options:["seo-tools","marketing-software","ai-tools","agency"]},
            ].map(({label,field,placeholder,type,options})=>(
              <div key={field} style={{marginBottom:12}}>
                <div style={{fontSize:10,fontWeight:700,color:T.t3,textTransform:"uppercase",letterSpacing:".06em",marginBottom:4}}>{label}</div>
                {type==="select"?(
                  <select value={newSubmission[field]} onChange={e=>setNewSubmission(prev=>({...prev,[field]:e.target.value}))} style={{width:"100%",padding:"8px 11px",borderRadius:8,border:`1px solid ${T.b}`,background:T.bg3,color:T.t,fontSize:12,outline:"none"}}>
                    {options.map(opt=>(
                      <option key={opt} value={opt}>{opt.replace(/-/g," ").replace(/\b\w/g,l=>l.toUpperCase())}</option>
                    ))}
                  </select>
                ):(
                  <input value={newSubmission[field]} onChange={e=>setNewSubmission(prev=>({...prev,[field]:e.target.value}))} placeholder={placeholder} style={{width:"100%",padding:"8px 11px",borderRadius:8,border:`1px solid ${T.b}`,background:T.bg3,color:T.t,fontSize:12,outline:"none"}}/>
                )}
              </div>
            ))}
            <Btn full v="pri" icon="📤">Submit to Selected Directories</Btn>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function DirectorySubmissionPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="border-b pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Directory Submission
                </h1>
                <p className="text-muted-foreground">◈ Odito AI · Agency Platform</p>
              </div>
            </div>
          </div>
          <DirectorySubmission/>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
