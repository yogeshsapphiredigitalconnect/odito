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

/* ─── LINK VELOCITY MANAGER MODULE ─────────────────────────────────── */
function LinkVelocityManager(){
  const [domains,setDomains]=useState([
    {name:"agencyplatform.com", tier:"growing", rec:7, min:5, max:10, hist:[3,4,3,5,4,6,5,7], current:6, risk:"low"},
    {name:"seoauditpro.net", tier:"growing", rec:6, min:5, max:10, hist:[2,2,3,2,3,4,3,4], current:4, risk:"low"},
    {name:"techmarketing.co", tier:"new", rec:4, min:3, max:5, hist:[1,2,1,2,2,3,2,3], current:3, risk:"low"},
    {name:"rankfaster.io", tier:"authority", rec:18, min:15, max:25, hist:[8,9,10,11,9,12,11,13], current:12, risk:"medium"},
  ]);

  const [velocitySettings,setVelocitySettings]=useState({
    enabled:true,
    autoAdjust:true,
    maxDaily:25,
    safetyMargin:0.8,
    monitoringEnabled:true,
  });

  const [updating,setUpdating] = useState(null);

  function updateVelocity(domainName,newVelocity){
    setUpdating(domainName);
    setTimeout(()=>{
      setDomains(prev=>prev.map(d=>d.name===domainName?{...d,current:newVelocity,hist:[...d.hist.slice(1),newVelocity]}:d));
      setUpdating(null);
    },1500);
  }

  function calculateRisk(current,rec){
    const ratio = current/rec;
    if(ratio > 1.5) return "high";
    if(ratio > 1.2) return "medium";
    return "low";
  }

  const riskColor = {low:T.gr,medium:T.am,high:T.re};

  return(
    <div className="fade">
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:18}}>
        <Stat value={domains.length} label="Domains" color={T.ind}/>
        <Stat value={domains.reduce((s,d)=>s+d.current,0)} label="Current/Week" color={T.cy}/>
        <Stat value={domains.reduce((s,d)=>s+d.rec,0)} label="Recommended" color={T.am}/>
        <Stat value={domains.filter(d=>calculateRisk(d.current,d.rec)==="high").length} label="High Risk" color={T.re}/>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:14}}>
        <Card>
          <SHead title="Domain Velocity Management" sub="Control link building speed per domain" icon="📈"/>
          <div style={{padding:"10px 18px"}}>
            {domains.map(domain=>(
              <div key={domain.name} style={{padding:"14px 16px",background:T.bg3,border:`1px solid ${T.b}`,borderRadius:11,marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:700,color:T.t,marginBottom:4}}>{domain.name}</div>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <Pill label={domain.tier} c={domain.tier==="authority"?"v":domain.tier==="growing"?"c":"i"} xs/>
                      <Pill label={calculateRisk(domain.current,domain.rec)} c={calculateRisk(domain.current,domain.rec)==="low"?"g":calculateRisk(domain.current,domain.rec)==="medium"?"a":"r"} xs/>
                      <span style={{fontSize:10,color:T.t3}}>Target: <b style={{color:T.am}}>{domain.rec}/wk</b></span>
                      <span style={{fontSize:10,color:T.t3}}>Range: <b style={{color:T.t2}}>{domain.min}-{domain.max}</b></span>
                    </div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:18,fontWeight:800,color:T.ind,marginBottom:2}}>{domain.current}</div>
                    <div style={{fontSize:9,color:T.t3}}>current/week</div>
                  </div>
                </div>
                
                <div style={{marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                    <span style={{fontSize:9,color:T.t3}}>8-week history</span>
                    <span style={{fontSize:9,fontWeight:700,color:T.t2}}>{domain.current}/{domain.rec}</span>
                  </div>
                  <div style={{height:20,display:"flex",gap:1,alignItems:"flex-end"}}>
                    {domain.hist.map((val,i)=>(
                      <div key={i} style={{flex:1,background:val>=domain.rec?T.am:T.gr,height:`${(val/domain.max)*100}%`,borderRadius:"2px 2px 0 0",minHeight:2}}/>
                    ))}
                  </div>
                </div>

                <div style={{display:"flex",gap:6,alignItems:"center"}}>
                  <Btn sm v="cy" icon="➖" onClick={()=>updateVelocity(domain.name,Math.max(domain.min,domain.current-1))}>-</Btn>
                  <Btn sm v="cy" icon="➕" onClick={()=>updateVelocity(domain.name,Math.min(domain.max,domain.current+1))}>+</Btn>
                  <Btn sm v="gr" icon="⚖">Auto Adjust</Btn>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SHead title="Velocity Settings" sub="Global configuration" icon="⚙"/>
          <div style={{padding:"16px 18px"}}>
            {[
              {label:"Auto Velocity Control",field:"enabled",type:"toggle"},
              {label:"Auto-Adjust Weekly",field:"autoAdjust",type:"toggle"},
              {label:"Max Daily Links",field:"maxDaily",type:"number",min:1,max:50},
              {label:"Safety Margin",field:"safetyMargin",type:"number",min:0.1,max:1,step:0.1},
              {label:"Risk Monitoring",field:"monitoringEnabled",type:"toggle"},
            ].map(({label,field,type,min,max,step})=>(
              <div key={field} style={{marginBottom:16}}>
                <div style={{fontSize:10,fontWeight:700,color:T.t3,textTransform:"uppercase",letterSpacing:".06em",marginBottom:6}}>{label}</div>
                {type==="toggle"?(
                  <button 
                    onClick={()=>setVelocitySettings(prev=>({...prev,[field]:!prev[field]}))}
                    style={{width:"100%",padding:"8px 12px",borderRadius:8,border:`1px solid ${T.b}`,background:velocitySettings[field]?T.ind+"18":T.bg3,color:velocitySettings[field]?T.indL:T.t2,fontSize:11,fontWeight:700,cursor:"pointer"}}
                  >
                    {velocitySettings[field]?"ENABLED":"DISABLED"}
                  </button>
                ):(
                  <input 
                    type="number" 
                    min={min} 
                    max={max} 
                    step={step}
                    value={velocitySettings[field]} 
                    onChange={e=>setVelocitySettings(prev=>({...prev,[field]:parseFloat(e.target.value)}))}
                    style={{width:"100%",padding:"8px 11px",borderRadius:8,border:`1px solid ${T.b}`,background:T.bg3,color:T.t,fontSize:12,outline:"none"}}
                  />
                )}
              </div>
            ))}
            
            <div style={{padding:"12px",background:T.re+"0a",border:`1px solid ${T.re}22`,borderRadius:8,marginTop:12}}>
              <div style={{fontSize:9,fontWeight:700,color:T.re,marginBottom:4}}>⚠️ Risk Alert</div>
              <div style={{fontSize:10,color:T.t3,lineHeight:1.4}}>
                {domains.filter(d=>calculateRisk(d.current,d.rec)==="high").length} domains at high risk of penalty. Consider reducing velocity.
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function LinkVelocityManagerPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="border-b pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Link Velocity Manager
                </h1>
                <p className="text-muted-foreground">◈ Odito AI · Agency Platform</p>
              </div>
            </div>
          </div>
          <LinkVelocityManager/>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
