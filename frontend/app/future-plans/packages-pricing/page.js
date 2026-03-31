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

/* ─── PACKAGES & PRICING MODULE ─────────────────────────────────────── */
function PackagesPricing(){
  const [packages,setPackages]=useState([
    {id:"starter",name:"Starter",price:99,features:["100 URLs","Basic SEO audit","Monthly reports","Email support"],active:true,users:12},
    {id:"professional",name:"Professional",price:299,features:["500 URLs","Advanced SEO audit","Weekly reports","Priority support","AI insights"],active:true,users:47},
    {id:"enterprise",name:"Enterprise",price:799,features:["Unlimited URLs","Full SEO suite","Daily reports","Dedicated support","Custom integrations","White label"],active:true,users:23},
    {id:"agency",name:"Agency",price:1299,features:["Multi-client","Unlimited everything","White label","Reseller rights","Custom branding","API access"],active:true,users:8},
  ]);

  const [billing,setBilling]=useState("monthly");
  const [editing,setEditing]=useState(null);
  const [newPackage,setNewPackage]=useState({name:"",price:"",features:""});

  function updatePackage(id,field,value){
    setPackages(prev=>prev.map(p=>p.id===id?{...p,[field]:value}:p));
  }

  function addPackage(){
    if(newPackage.name && newPackage.price){
      const id = newPackage.name.toLowerCase().replace(/\s+/g,"-");
      setPackages(prev=>[...prev,{id,name:newPackage.name,price:parseInt(newPackage.price),features:newPackage.features.split(",").map(f=>f.trim()),active:true,users:0}]);
      setNewPackage({name:"",price:"",features:""});
    }
  }

  function togglePackage(id){
    setPackages(prev=>prev.map(p=>p.id===id?{...p,active:!p.active}:p));
  }

  return(
    <div className="fade">
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:18}}>
        <Stat value={packages.length} label="Total Packages" color={T.ind}/>
        <Stat value={packages.filter(p=>p.active).length} label="Active" color={T.gr}/>
        <Stat value={packages.reduce((s,p)=>s+p.users,0)} label="Total Users" color={T.cy}/>
        <Stat value={billing} label="Billing Cycle" color={T.am}/>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"3fr 1fr",gap:14}}>
        <Card>
          <SHead title="Package Management" sub="Configure pricing and features" icon="💎"/>
          <div style={{padding:"12px 18px",borderBottom:`1px solid ${T.b}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{display:"flex",gap:8}}>
              {["monthly","annual"].map(b=>(
                <button key={b} onClick={()=>setBilling(b)} style={{padding:"6px 12px",borderRadius:8,border:"none",background:billing===b?T.ind+"18":"transparent",color:billing===b?T.indL:T.t3,fontSize:10,fontWeight:700,cursor:"pointer",textTransform:"capitalize"}}>
                  {b}
                </button>
              ))}
            </div>
            <Btn sm v="pri" icon="➕">Add Package</Btn>
          </div>
          <div style={{padding:"10px 18px"}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
              {packages.map(pkg=>(
                <div key={pkg.id} style={{padding:"14px",background:T.bg3,border:`1px solid ${T.b}`,borderRadius:11,borderTop:`3px solid ${pkg.id==="enterprise"||pkg.id==="agency"?T.vi:pkg.id==="professional"?T.ind:T.gr}`}}>
                  <div style={{textAlign:"center",marginBottom:12}}>
                    <div style={{fontSize:16,fontWeight:800,color:T.t,marginBottom:4}}>{pkg.name}</div>
                    <div style={{fontSize:24,fontWeight:800,color:T.ind,fontFamily:"'DM Mono',monospace"}}>${pkg.price}</div>
                    <div style={{fontSize:9,color:T.t3}}>/month</div>
                  </div>
                  <div style={{marginBottom:12}}>
                    {pkg.features.map((f,i)=>(
                      <div key={i} style={{fontSize:10,color:T.t2,marginBottom:3,display:"flex",alignItems:"center",gap:4}}>
                        <span style={{color:T.gr}}>✓</span> {f}
                      </div>
                    ))}
                  </div>
                  <div style={{marginBottom:10}}>
                    <div style={{fontSize:9,color:T.t3,marginBottom:2}}>{pkg.users} active users</div>
                    <Pill label={pkg.active?"Active":"Inactive"} c={pkg.active?"g":"a"} xs/>
                  </div>
                  <div style={{display:"flex",gap:4}}>
                    <Btn sm v="cy" icon="✏" onClick={()=>setEditing(editing===pkg.id?null:pkg.id)}>Edit</Btn>
                    <Btn sm v="gh" onClick={()=>togglePackage(pkg.id)}>{pkg.active?"Hide":"Show"}</Btn>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {editing&&(
            <Card>
              <SHead title="Edit Package" sub={`Editing ${packages.find(p=>p.id===editing)?.name}`} icon="✏"/>
              <div style={{padding:"16px 18px"}}>
                {[
                  {label:"Package Name",field:"name"},
                  {label:"Price ($)",field:"price",type:"number"},
                  {label:"Features",field:"features",type:"textarea"},
                ].map(({label,field,type})=>(
                  <div key={field} style={{marginBottom:12}}>
                    <div style={{fontSize:10,fontWeight:700,color:T.t3,textTransform:"uppercase",letterSpacing:".06em",marginBottom:4}}>{label}</div>
                    {type==="textarea"?(
                      <textarea 
                        value={packages.find(p=>p.id===editing)?.features.join(", ")} 
                        onChange={e=>updatePackage(editing,"features",e.target.value.split(",").map(f=>f.trim()))}
                        style={{width:"100%",padding:"8px 11px",borderRadius:8,border:`1px solid ${T.b}`,background:T.bg3,color:T.t,fontSize:11,outline:"none",minHeight:60,resize:"vertical"}}
                      />
                    ):(
                      <input 
                        type={type||"text"}
                        value={packages.find(p=>p.id===editing)?.[field]} 
                        onChange={e=>updatePackage(editing,field,type==="number"?parseInt(e.target.value):e.target.value)}
                        style={{width:"100%",padding:"8px 11px",borderRadius:8,border:`1px solid ${T.b}`,background:T.bg3,color:T.t,fontSize:12,outline:"none"}}
                      />
                    )}
                  </div>
                ))}
                <Btn full v="pri" onClick={()=>setEditing(null)}>Save Changes</Btn>
              </div>
            </Card>
          )}

          <Card>
            <SHead title="Add New Package" sub="Create pricing tier" icon="➕"/>
            <div style={{padding:"16px 18px"}}>
              {[
                {label:"Name",field:"name"},
                {label:"Price ($)",field:"price",type:"number"},
                {label:"Features",field:"features",placeholder:"Feature 1, Feature 2, Feature 3"},
              ].map(({label,field,type,placeholder})=>(
                <div key={field} style={{marginBottom:12}}>
                  <div style={{fontSize:10,fontWeight:700,color:T.t3,textTransform:"uppercase",letterSpacing:".06em",marginBottom:4}}>{label}</div>
                  <input 
                    type={type||"text"}
                    value={newPackage[field]} 
                    onChange={e=>setNewPackage(prev=>({...prev,[field]:e.target.value}))}
                    placeholder={placeholder}
                    style={{width:"100%",padding:"8px 11px",borderRadius:8,border:`1px solid ${T.b}`,background:T.bg3,color:T.t,fontSize:12,outline:"none"}}
                  />
                </div>
              ))}
              <Btn full v="pri" onClick={addPackage}>Add Package</Btn>
            </div>
          </Card>

          <Card>
            <SHead title="Pricing Settings" sub="Global configuration" icon="⚙"/>
            <div style={{padding:"16px 18px"}}>
              {[
                {label:"Show Annual Discount",value:true},
                {label:"Free Trial Period",value:"14 days"},
                {label:"Currency",value:"USD"},
                {label:"Tax Configuration",value:"Enabled"},
              ].map(({label,value})=>(
                <div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",fontSize:10,color:T.t3}}>
                  <span>{label}</span>
                  <span style={{color:T.t2,fontWeight:700}}>{value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function PackagesPricingPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="border-b pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Packages & Pricing
                </h1>
                <p className="text-muted-foreground">◈ Odito AI · Agency Platform</p>
              </div>
            </div>
          </div>
          <PackagesPricing/>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
