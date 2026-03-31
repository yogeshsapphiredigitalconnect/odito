"use client";

import { useState, useEffect, useRef } from "react";

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

/* ─── SCRIPT & WEBHOOK MANAGER ───────────────────────────────────────── */
function ScriptWebhook(){
  const [scripts,setScripts]=useState([
    {id:"s1",name:"Schema Injector",type:"javascript",status:"active",triggers:["page_load","manual"],lastRun:"2h ago",successRate:98},
    {id:"s2",name:"Meta Tag Optimizer",type:"javascript",status:"active",triggers:["page_update"],lastRun:"5m ago",successRate:100},
    {id:"s3",name:"Image Alt Generator",type:"python",status:"paused",triggers:["image_upload"],lastRun:"1d ago",successRate:95},
    {id:"s4",name:"Link Checker",type:"javascript",status:"active",triggers:["scheduled"],lastRun:"30m ago",successRate:92},
  ]);

  const [webhooks,setWebhooks]=useState([
    {id:"w1",name:"SEO Audit Complete",url:"https://api.odito.ai/webhooks/audit-complete",method:"POST",status:"active",lastTriggered:"1h ago",events:["audit_finished"]},
    {id:"w2",name:"New Issue Detected",url:"https://slack.com/webhooks/seo-alerts",method:"POST",status:"active",lastTriggered:"3h ago",events:["critical_issue_found"]},
    {id:"w3",name:"Weekly Report",url:"https://email.service.com/send-report",method:"POST",status:"inactive",lastTriggered:"7d ago",events:["weekly_report"]},
  ]);

  const [activeTab,setActiveTab]=useState("scripts");
  const [testing,setTesting]=useState(null);

  function testScript(id){
    setTesting(id);
    setTimeout(()=>setTesting(null),2000);
  }

  function toggleStatus(type,id){
    if(type==="script"){
      setScripts(prev=>prev.map(s=>s.id===id?{...s,status:s.status==="active"?"paused":"active"}:s));
    }else{
      setWebhooks(prev=>prev.map(w=>w.id===id?{...w,status:w.status==="active"?"inactive":"active"}:w));
    }
  }

  return(
    <div className="fade">
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:18}}>
        <Stat value={scripts.length} label="Scripts" color={T.ind}/>
        <Stat value={webhooks.length} label="Webhooks" color={T.cy}/>
        <Stat value={scripts.filter(s=>s.status==="active").length} label="Active Scripts" color={T.gr}/>
        <Stat value={webhooks.filter(w=>w.status==="active").length} label="Active Webhooks" color={T.gr}/>
      </div>

      <Card>
        <div style={{padding:"13px 18px",borderBottom:`1px solid ${T.b}`,display:"flex",alignItems:"center",gap:10}}>
          <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:T.t}}>Script & Webhook Manager</div><div style={{fontSize:10,color:T.t3,marginTop:1}}>Automate SEO tasks and external integrations</div></div>
        </div>
        
        <div style={{display:"flex",gap:0,borderBottom:`1px solid ${T.b}`}}>
          {["scripts","webhooks"].map(tab=>(
            <button key={tab} onClick={()=>setActiveTab(tab)} style={{padding:"10px 16px",border:"none",borderBottom:`2px solid ${activeTab===tab?T.ind:"transparent"}`,background:"transparent",color:activeTab===tab?T.indL:T.t3,fontSize:11,fontWeight:activeTab===tab?700:400,cursor:"pointer",textTransform:"capitalize"}}>
              {tab} ({tab==="scripts"?scripts.length:webhooks.length})
            </button>
          ))}
        </div>

        {activeTab==="scripts"&&(
          <div style={{padding:"10px 18px"}}>
            {scripts.map(script=>(
              <div key={script.id} style={{padding:"14px 16px",background:T.bg3,border:`1px solid ${T.b}`,borderRadius:11,marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:700,color:T.t,marginBottom:4}}>{script.name}</div>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <Pill label={script.type} c="c" xs/>
                      <Pill label={script.status} c={script.status==="active"?"g":"a"} xs/>
                      <span style={{fontSize:10,color:T.t3}}>Last run: <b style={{color:T.t2}}>{script.lastRun}</b></span>
                      <span style={{fontSize:10,color:T.t3}}>Success: <b style={{color:T.gr}}>{script.successRate}%</b></span>
                    </div>
                    <div style={{fontSize:10,color:T.t3,marginTop:4}}>Triggers: {script.triggers.join(", ")}</div>
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    <Btn sm v="cy" icon="⚡" loading={testing===script.id} onClick={()=>testScript(script.id)}>Test</Btn>
                    <Btn sm v="gh" onClick={()=>toggleStatus("script",script.id)}>{script.status==="active"?"Pause":"Resume"}</Btn>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab==="webhooks"&&(
          <div style={{padding:"10px 18px"}}>
            {webhooks.map(webhook=>(
              <div key={webhook.id} style={{padding:"14px 16px",background:T.bg3,border:`1px solid ${T.b}`,borderRadius:11,marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:700,color:T.t,marginBottom:4}}>{webhook.name}</div>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <Pill label={webhook.method} c="v" xs/>
                      <Pill label={webhook.status} c={webhook.status==="active"?"g":"a"} xs/>
                      <span style={{fontSize:10,color:T.t3}}>Last: <b style={{color:T.t2}}>{webhook.lastTriggered}</b></span>
                    </div>
                    <div style={{fontSize:10,color:T.t3,marginTop:4}}>
                      <div>Events: {webhook.events.join(", ")}</div>
                      <div style={{color:T.cy,fontFamily:"monospace",marginTop:2}}>{webhook.url}</div>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    <Btn sm v="cy" icon="⚡">Test</Btn>
                    <Btn sm v="gh" onClick={()=>toggleStatus("webhook",webhook.id)}>{webhook.status==="active"?"Disable":"Enable"}</Btn>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export default function ScriptWebhookPage() {
  return (
    <div style={{minHeight:"100vh",background:T.bg,color:T.t,fontFamily:"'DM Sans',system-ui,sans-serif"}}>
      <G/>
      <div style={{padding:"20px 24px"}}>
        <div style={{fontSize:20,fontWeight:800,color:T.t,letterSpacing:"-.02em",marginBottom:8,fontFamily:"'Syne',sans-serif"}}>Script & Webhook</div>
        <div style={{fontSize:11,color:T.t3,marginBottom:20}}>◈ Odito AI · Agency Platform</div>
        <ScriptWebhook/>
      </div>
    </div>
  );
}
