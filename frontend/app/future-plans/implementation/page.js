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

/* ─── IMPLEMENTATION ENGINE ─────────────────────────────────────────── */
function ImplEngine(){
  const [tasks,setTasks]=useState([
    {id:"t1",title:"Add JSON-LD schema to service pages",status:"in_progress",priority:"critical",assignee:"John D.",due:"2025-04-02",progress:65},
    {id:"t2",title:"Fix duplicate meta descriptions",status:"pending",priority:"high",assignee:"Sarah M.",due:"2025-04-03",progress:0},
    {id:"t3",title:"Compress hero images for mobile",status:"completed",priority:"medium",assignee:"Mike R.",due:"2025-03-28",progress:100},
    {id:"t4",title:"Add FAQ sections to top pages",status:"in_progress",priority:"high",assignee:"Lisa K.",due:"2025-04-05",progress:40},
    {id:"t5",title:"Update title tags with power words",status:"pending",priority:"medium",assignee:"Tom H.",due:"2025-04-07",progress:0},
  ]);

  const [filter,setFilter]=useState("all");
  const [updating,setUpdating]=useState(null);

  const filtered = filter==="all"?tasks:
    filter==="completed"?tasks.filter(t=>t.status==="completed"):
    filter==="in_progress"?tasks.filter(t=>t.status==="in_progress"):
    tasks.filter(t=>t.status==="pending");

  function updateStatus(id,status){
    setUpdating(id);
    setTimeout(()=>{
      setTasks(prev=>prev.map(t=>t.id===id?{...t,status,progress:status==="completed"?100:status==="in_progress"?50:0}:t));
      setUpdating(null);
    },1000);
  }

  const statusColor={completed:T.gr,in_progress:T.ind,pending:T.am};
  const priorityColor={critical:T.re,high:T.am,medium:T.cy,low:T.gr};

  return(
    <div className="fade">
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:18}}>
        <Stat value={tasks.length} label="Total Tasks" color={T.ind}/>
        <Stat value={tasks.filter(t=>t.status==="completed").length} label="Completed" color={T.gr}/>
        <Stat value={tasks.filter(t=>t.status==="in_progress").length} label="In Progress" color={T.cy}/>
        <Stat value={tasks.filter(t=>t.status==="pending").length} label="Pending" color={T.am}/>
      </div>

      <Card>
        <SHead title="Implementation Tracker" sub="Track progress of SEO fixes and optimizations" icon="⚡"/>
        <div style={{padding:"12px 18px",borderBottom:`1px solid ${T.b}`,display:"flex",gap:8}}>
          {["all","completed","in_progress","pending"].map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{padding:"6px 12px",borderRadius:8,border:"none",background:filter===f?T.ind+"18":"transparent",color:filter===f?T.indL:T.t3,fontSize:10,fontWeight:700,cursor:"pointer",textTransform:"capitalize"}}>
              {f.replace(/_/g," ")} ({f==="all"?tasks.length:f==="completed"?tasks.filter(t=>t.status==="completed").length:f==="in_progress"?tasks.filter(t=>t.status==="in_progress").length:tasks.filter(t=>t.status==="pending").length})
            </button>
          ))}
        </div>
        <div style={{padding:"10px 18px"}}>
          {filtered.map(task=>(
            <div key={task.id} style={{padding:"14px 16px",background:T.bg3,border:`1px solid ${T.b}`,borderRadius:11,marginBottom:10,borderLeft:`3px solid ${statusColor[task.status]}`}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:700,color:T.t,marginBottom:4}}>{task.title}</div>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <Pill label={task.priority} c={task.priority==="critical"?"r":task.priority==="high"?"a":"c"} xs/>
                    <Pill label={task.status.replace(/_/g," ")} c={task.status==="completed"?"g":task.status==="in_progress"?"c":"a"} xs/>
                    <span style={{fontSize:10,color:T.t3}}>Assigned to: <b style={{color:T.t2}}>{task.assignee}</b></span>
                    <span style={{fontSize:10,color:T.t3}}>Due: <b style={{color:T.t2}}>{task.due}</b></span>
                  </div>
                </div>
                <div style={{width:120}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                    <span style={{fontSize:9,color:T.t3}}>Progress</span>
                    <span style={{fontSize:9,fontWeight:700,color:T.t2}}>{task.progress}%</span>
                  </div>
                  <Bar v={task.progress} color={statusColor[task.status]} h={6}/>
                </div>
              </div>
              <div style={{display:"flex",gap:6}}>
                {task.status!=="completed"&&<Btn sm v="gr" icon="✓" loading={updating===task.id} onClick={()=>updateStatus(task.id,"completed")}>Mark Complete</Btn>}
                {task.status==="pending"&&<Btn sm v="cy" icon="▶" loading={updating===task.id} onClick={()=>updateStatus(task.id,"in_progress")}>Start Task</Btn>}
                {task.status==="completed"&&<Pill label="✓ Done" c="g" xs/>}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default function ImplementationPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="border-b pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Implementation
                </h1>
                <p className="text-muted-foreground">◈ Odito AI · Agency Platform</p>
              </div>
            </div>
          </div>
          <ImplEngine/>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
