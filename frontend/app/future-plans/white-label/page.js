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

/* ─── WHITE LABEL MODULE ───────────────────────────────────────────── */
function WhiteLabel(){
  const [branding,setBranding]=useState({
    companyName:"Agency Platform",
    logoUrl:"",
    primaryColor:"#4f46e5",
    secondaryColor:"#00dfff",
    customDomain:"",
    removeOditoBranding:true,
    customCSS:"",
  });

  const [clients,setClients]=useState([
    {id:"c1",name:"Marketing Pro Agency",domain:"seo.marketingpro.com",status:"active",users:15,created:"2025-02-15"},
    {id:"c2",name:"Tech SEO Solutions",domain:"app.techseo.com",status:"active",users:8,created:"2025-03-01"},
    {id:"c3",name:"Digital Growth Co",domain:"dashboard.digitalgrowth.co",status:"setup",users:0,created:"2025-03-10"},
  ]);

  const [deploying,setDeploying]=useState(null);

  function deployClient(clientId){
    setDeploying(clientId);
    setTimeout(()=>{
      setClients(prev=>prev.map(c=>c.id===clientId?{...c,status:"active"}:c));
      setDeploying(null);
    },3000);
  }

  return(
    <div className="fade">
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:18}}>
        <Stat value={clients.length} label="White Label Clients" color={T.ind}/>
        <Stat value={clients.filter(c=>c.status==="active").length} label="Active" color={T.gr}/>
        <Stat value={clients.reduce((s,c)=>s+c.users,0)} label="Total Users" color={T.cy}/>
        <Stat value={branding.removeOditoBranding?"Enabled":"Disabled"} label="Custom Branding" color={branding.removeOditoBranding?T.gr:T.am}/>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:14}}>
        <Card>
          <SHead title="White Label Clients" sub="Manage branded instances" icon="🏷️"/>
          <div style={{padding:"12px 18px",borderBottom:`1px solid ${T.b}`,display:"flex",gap:8}}>
            <Btn sm v="pri" icon="➕">Add Client</Btn>
            <Btn sm v="cy" icon="📊">Analytics</Btn>
            <Btn sm v="gr" icon="⚙">Settings</Btn>
          </div>
          <div style={{padding:"10px 18px"}}>
            {clients.map(client=>(
              <div key={client.id} style={{padding:"14px 16px",background:T.bg3,border:`1px solid ${T.b}`,borderRadius:11,marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:700,color:T.t,marginBottom:4}}>{client.name}</div>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <Pill label={client.status} c={client.status==="active"?"g":client.status==="setup"?"a":"i"} xs/>
                      <span style={{fontSize:10,color:T.t3}}>Domain: <b style={{color:T.cy}}>{client.domain}</b></span>
                      <span style={{fontSize:10,color:T.t3}}>Users: <b style={{color:T.t2}}>{client.users}</b></span>
                      <span style={{fontSize:10,color:T.t3}}>Created: <b style={{color:T.t2}}>{client.created}</b></span>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    <Btn sm v="cy" icon="🎨">Customize</Btn>
                    <Btn sm v="gr" icon="👁">Preview</Btn>
                    {client.status==="setup"&&<Btn sm v="pri" icon="🚀" loading={deploying===client.id} onClick={()=>deployClient(client.id)}>Deploy</Btn>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <Card>
            <SHead title="Brand Customization" sub="Default settings" icon="🎨"/>
            <div style={{padding:"16px 18px"}}>
              {[
                {label:"Company Name",field:"companyName"},
                {label:"Primary Color",field:"primaryColor",type:"color"},
                {label:"Secondary Color",field:"secondaryColor",type:"color"},
                {label:"Custom Domain",field:"customDomain",placeholder:"app.yourdomain.com"},
              ].map(({label,field,type,placeholder})=>(
                <div key={field} style={{marginBottom:12}}>
                  <div style={{fontSize:10,fontWeight:700,color:T.t3,textTransform:"uppercase",letterSpacing:".06em",marginBottom:4}}>{label}</div>
                  {type==="color"?(
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <input 
                        type="color"
                        value={branding[field]} 
                        onChange={e=>setBranding(prev=>({...prev,[field]:e.target.value}))}
                        style={{width:40,height:30,borderRadius:6,border:`1px solid ${T.b}`,background:"transparent",cursor:"pointer"}}
                      />
                      <input 
                        type="text"
                        value={branding[field]} 
                        onChange={e=>setBranding(prev=>({...prev,[field]:e.target.value}))}
                        style={{flex:1,padding:"6px 9px",borderRadius:7,border:`1px solid ${T.b}`,background:T.bg3,color:T.t,fontSize:11,outline:"none"}}
                      />
                    </div>
                  ):(
                    <input 
                      type="text"
                      value={branding[field]} 
                      onChange={e=>setBranding(prev=>({...prev,[field]:e.target.value}))}
                      placeholder={placeholder}
                      style={{width:"100%",padding:"6px 9px",borderRadius:7,border:`1px solid ${T.b}`,background:T.bg3,color:T.t,fontSize:11,outline:"none"}}
                    />
                  )}
                </div>
              ))}
              
              <div style={{marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                  <div style={{fontSize:10,fontWeight:700,color:T.t3,textTransform:"uppercase",letterSpacing:".06em"}}>Remove Odito Branding</div>
                  <button 
                    onClick={()=>setBranding(prev=>({...prev,removeOditoBranding:!prev.removeOditoBranding}))}
                    style={{width:40,height:20,borderRadius:10,border:`1px solid ${T.b}`,background:branding.removeOditoBranding?T.ind+"18":T.bg3,position:"relative",cursor:"pointer"}}
                  >
                    <div style={{width:16,height:16,borderRadius:"50%",background:branding.removeOditoBranding?T.ind:T.t3,position:"absolute",top:2,left:branding.removeOditoBranding?20:2,transition:"all .2s"}}/>
                  </button>
                </div>
              </div>
              
              <Btn full v="pri" icon="💾">Save Brand Settings</Btn>
            </div>
          </Card>

          <Card>
            <SHead title="Deployment Options" sub="White label features"/>
            <div style={{padding:"16px 18px"}}>
              {[
                {label:"Custom Subdomain",enabled:true,desc:"client.yourdomain.com"},
                {label:"Custom Domain",enabled:true,desc:"app.clientdomain.com"},
                {label:"Custom Logo",enabled:true,desc:"Upload client logo"},
                {label:"Custom CSS",enabled:false,desc:"Advanced styling"},
                {label:"API Access",enabled:true,desc:"Full API access"},
                {label:"SSO Integration",enabled:false,desc:"SAML/OAuth support"},
              ].map(({label,enabled,desc})=>(
                <div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${T.s}`}}>
                  <div>
                    <div style={{fontSize:10,fontWeight:700,color:T.t2}}>{label}</div>
                    <div style={{fontSize:9,color:T.t3}}>{desc}</div>
                  </div>
                  <Pill label={enabled?"✓":"✗"} c={enabled?"g":"r"} xs/>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function WhiteLabelPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="border-b pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  White Label
                </h1>
                <p className="text-muted-foreground">◈ Odito AI · Agency Platform</p>
              </div>
            </div>
          </div>
          <WhiteLabel/>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
