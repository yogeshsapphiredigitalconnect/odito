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

function WDot({s}){const c={running:T.gr,idle:T.am,paused:T.t3}[s]||T.t3;return <span style={{width:7,height:7,borderRadius:"50%",background:c,display:"inline-block",boxShadow:s==="running"?`0 0 5px ${c}`:undefined}}/>;}

function Bar({v,color,h=5}){return <div style={{height:h,borderRadius:h/2,background:"rgba(255,255,255,.06)",overflow:"hidden"}}><div style={{width:`${Math.min(100,v)}%`,height:"100%",borderRadius:h/2,background:color,transition:"width .5s"}}/></div>;}

/* ─── PIPELINE WORKERS MODULE ───────────────────────────────────────── */
function PipelineWorkers(){
  const [workers,setWorkers]=useState([
    {id:"w1",name:"opportunity_scanner", queue:"opp:scan",    status:"running",pending:3, done:47, color:T.bl,desc:"Scans for new link opportunities across directories and blogs"},
    {id:"w2",name:"velocity_planner",    queue:"vel:plan",    status:"running",pending:2, done:41, color:T.am,desc:"Calculates safe link velocity based on domain authority and history"},
    {id:"w3",name:"anchor_optimizer",    queue:"anchor:opt",  status:"running",pending:2, done:38, color:T.vi,desc:"Optimizes anchor text distribution for natural link profile"},
    {id:"w4",name:"content_generator",   queue:"content:gen", status:"running",pending:4, done:89, color:T.ind,desc:"Generates AI-powered content for article submissions"},
    {id:"w5",name:"publisher_worker",    queue:"pub:send",    status:"running",pending:3, done:76, color:"#0d9488",desc:"Publishes content to WordPress directories and blogs"},
    {id:"w6",name:"index_checker",       queue:"index:check", status:"running",pending:0, done:65, color:T.cy,desc:"Checks Google index status of submitted links"},
    {id:"w7",name:"recovery_worker",     queue:"index:fix",   status:"idle",   pending:0, done:28, color:"#f97316",desc:"Attempts to recover deindexed links through re-submission"},
    {id:"w8",name:"outreach_worker",     queue:"outreach",    status:"running",pending:5, done:142,color:"#f43f5e",desc:"Manages outreach campaigns and follow-ups"},
  ]);

  const [queues,setQueues]=useState([
    {name:"opp:scan",    jobs:50,   processing:true, avgTime:45},
    {name:"vel:plan",    jobs:43,   processing:true, avgTime:30},
    {name:"anchor:opt",  jobs:40,   processing:true, avgTime:25},
    {name:"content:gen", jobs:93,   processing:true, avgTime:120},
    {name:"pub:send",    jobs:79,   processing:true, avgTime:60},
    {name:"index:check", jobs:65,   processing:true, avgTime:15},
    {name:"index:fix",   jobs:28,   processing:false,avgTime:90},
    {name:"outreach",    jobs:147,  processing:true, avgTime:180},
  ]);

  const [scaling,setScaling]=useState({
    enabled:true,
    minWorkers:2,
    maxWorkers:10,
    scaleThreshold:5,
  });

  const [restarting,setRestarting]=useState(null);

  function restartWorker(workerId){
    setRestarting(workerId);
    setTimeout(()=>{
      setWorkers(prev=>prev.map(w=>w.id===workerId?{...w,pending:0,done:w.done+1}:w));
      setRestarting(null);
    },2000);
  }

  return(
    <div className="fade">
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:18}}>
        <Stat value={workers.length} label="Total Workers" color={T.ind}/>
        <Stat value={workers.filter(w=>w.status==="running").length} label="Running" color={T.gr}/>
        <Stat value={workers.reduce((s,w)=>s+w.pending,0)} label="Jobs Queued" color={T.am}/>
        <Stat value={queues.filter(q=>q.processing).length} label="Active Queues" color={T.cy}/>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:14}}>
        <Card>
          <SHead title="BullMQ Workers — Redis + Node.js" sub="FastAPI backend · MongoDB persistence"/>
          <div style={{padding:"12px 18px"}}>
            {workers.map(w=>(
              <div key={w.id} style={{padding:"11px 14px",background:T.bg3,border:`1px solid ${T.b}`,borderRadius:10,marginBottom:8}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:5}}>
                  <WDot s={w.status}/>
                  <code style={{fontSize:11,color:w.color,fontFamily:"monospace",fontWeight:700}}>{w.name}</code>
                  <code style={{fontSize:10,color:T.t3,fontFamily:"monospace"}}>{w.queue}</code>
                  <div style={{flex:1}}/>
                  <Pill label={w.status} c={w.status==="running"?"g":"a"} xs/>
                  <span style={{fontSize:10,color:T.am,fontFamily:"monospace"}}>{w.pending} queued</span>
                  <span style={{fontSize:10,color:T.gr,fontFamily:"monospace"}}>{w.done} done</span>
                </div>
                <div style={{fontSize:10.5,color:T.t3,marginBottom:6}}>{w.desc}</div>
                <Bar v={Math.min(100,w.done/(w.done+w.pending+1)*100)} color={w.color} h={4}/>
                <div style={{display:"flex",gap:6,marginTop:6}}>
                  <Btn sm v="cy" icon="🔍">Logs</Btn>
                  <Btn sm v="gr" icon="📊">Metrics</Btn>
                  <Btn sm v="am" icon="🔄" loading={restarting===w.id} onClick={()=>restartWorker(w.id)}>Restart</Btn>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <Card>
            <SHead title="Queue Status" sub="Real-time job processing"/>
            <div style={{padding:"10px 18px"}}>
              {queues.map(q=>(
                <div key={q.name} style={{padding:"8px 10px",background:T.bg3,border:`1px solid ${T.b}`,borderRadius:8,marginBottom:6}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                    <code style={{fontSize:10,color:T.indL,fontFamily:"monospace"}}>{q.name}</code>
                    <WDot s={q.processing?"running":"idle"}/>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:T.t3}}>
                    <span>{q.jobs} jobs</span>
                    <span>{q.avgTime}s avg</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <SHead title="Auto Scaling" sub="Worker management"/>
            <div style={{padding:"16px 18px"}}>
              {[
                {label:"Auto Scaling",field:"enabled"},
                {label:"Min Workers",field:"minWorkers",type:"number",min:1,max:5},
                {label:"Max Workers",field:"maxWorkers",type:"number",min:5,max:20},
                {label:"Scale Threshold",field:"scaleThreshold",type:"number",min:3,max:10},
              ].map(({label,field,type,min,max})=>(
                <div key={field} style={{marginBottom:12}}>
                  <div style={{fontSize:10,fontWeight:700,color:T.t3,textTransform:"uppercase",letterSpacing:".06em",marginBottom:4}}>{label}</div>
                  {type==="number"?(
                    <input 
                      type="number" 
                      min={min} 
                      max={max}
                      value={scaling[field]} 
                      onChange={e=>setScaling(prev=>({...prev,[field]:parseInt(e.target.value)}))}
                      style={{width:"100%",padding:"6px 9px",borderRadius:7,border:`1px solid ${T.b}`,background:T.bg3,color:T.t,fontSize:11,outline:"none"}}
                    />
                  ):(
                    <button 
                      onClick={()=>setScaling(prev=>({...prev,[field]:!prev[field]}))}
                      style={{width:"100%",padding:"6px 9px",borderRadius:7,border:`1px solid ${T.b}`,background:scaling[field]?T.ind+"18":T.bg3,color:scaling[field]?T.indL:T.t2,fontSize:11,fontWeight:700,cursor:"pointer"}}
                    >
                      {scaling[field]?"ENABLED":"DISABLED"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function PipelineWorkersPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="border-b pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Pipeline Workers
                </h1>
                <p className="text-muted-foreground">◈ Odito AI · Agency Platform</p>
              </div>
            </div>
          </div>
          <PipelineWorkers/>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
