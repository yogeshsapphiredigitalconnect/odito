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

/* ─── ALL SCORES / DATA ─────────────────────────────────────────────── */
const DOMAIN = "agencyplatform.com";
const SCORES = { seo:74, ai:61, perf:83, trust:68 };

const REC_ENGINE = [
  {id:"fx001",page:"/services/seo-audit",fix_type:"add_schema_markup",      priority:"critical",impact:94,source:"on_page_audit",   status:"pending",   traffic:"+3,200/mo",reason:"No structured data on primary service page. AI models cannot extract entity relationships."},
  {id:"fx002",page:"/blog/seo-tools-2025",fix_type:"add_faq_schema",        priority:"critical",impact:91,source:"ai_visibility",   status:"pending",   traffic:"+2,800/mo",reason:"8 Q&A pairs with no FAQPage schema. Google AI Overviews and Perplexity extract from FAQPage."},
  {id:"fx003",page:"/services/seo-audit",fix_type:"update_title_tag",       priority:"high",    impact:88,source:"on_page_audit",   status:"approved",  traffic:"+1,900/mo",reason:"Current title is 19 chars. Missing power words, brand name, and CTA."},
  {id:"fx004",page:"/about",             fix_type:"update_meta_description", priority:"high",    impact:85,source:"on_page_audit",   status:"applied",   traffic:"+1,100/mo",reason:"Empty meta description causes Google to auto-generate snippet, reducing CTR by ~27%."},
  {id:"fx005",page:"/",                  fix_type:"add_kg_entity",           priority:"critical",impact:90,source:"ai_visibility",   status:"pending",   traffic:"+4,100/mo",reason:"Brand Knowledge Graph entity not claimed. AI models may inaccurately describe your brand."},
];

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

/* ─── RECOMMENDATIONS ENGINE ─────────────────────────────────────────── */
function RecEngine(){
  const [applying,setApplying]=useState(null);
  const [filter,setFilter]=useState("all");

  const filtered = filter==="all"?REC_ENGINE:
    filter==="critical"?REC_ENGINE.filter(r=>r.priority==="critical"):
    filter==="high"?REC_ENGINE.filter(r=>r.priority==="high"):
    REC_ENGINE.filter(r=>r.status===filter);

  function applyFix(id){
    setApplying(id);
    setTimeout(()=>{
      setApplying(null);
    },2000);
  }

  function applyAll(){
    filtered.filter(r=>r.status==="pending").forEach((r,i)=>setTimeout(()=>applyFix(r.id),i*300));
  }

  const priorityColor={critical:"destructive",high:"warning",medium:"default",low:"secondary"};

  return(
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold text-primary">{REC_ENGINE.length}</div>
          <div className="text-sm text-muted-foreground font-medium">Total Fixes</div>
        </div>
        <div className="bg-card border rounded-lg p-4 border-l-4 border-l-destructive">
          <div className="text-2xl font-bold text-destructive">{REC_ENGINE.filter(r=>r.priority==="critical").length}</div>
          <div className="text-sm text-muted-foreground font-medium">Critical</div>
        </div>
        <div className="bg-card border rounded-lg p-4 border-l-4 border-l-warning">
          <div className="text-2xl font-bold text-warning">{REC_ENGINE.filter(r=>r.status==="pending").length}</div>
          <div className="text-sm text-muted-foreground font-medium">Pending</div>
        </div>
        <div className="bg-card border rounded-lg p-4 border-l-4 border-l-green-600">
          <div className="text-2xl font-bold text-green-600">{REC_ENGINE.filter(r=>r.status==="applied").length}</div>
          <div className="text-sm text-muted-foreground font-medium">Applied</div>
        </div>
      </div>

      <div className="bg-card border rounded-lg shadow-sm">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">✦</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold">AI Recommendations Engine</h3>
                <p className="text-sm text-muted-foreground">Prioritized fixes based on impact & effort</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-b flex flex-wrap gap-2">
          {["all","critical","high","pending","applied"].map(f=>(
            <button 
              key={f} 
              onClick={()=>setFilter(f)} 
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filter===f 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {f} ({f==="all"?REC_ENGINE.length:f==="critical"?REC_ENGINE.filter(r=>r.priority==="critical").length:f==="high"?REC_ENGINE.filter(r=>r.priority==="high").length:f==="pending"?REC_ENGINE.filter(r=>r.status==="pending").length:REC_ENGINE.filter(r=>r.status==="applied").length})
            </button>
          ))}
          <div className="flex-1"/>
          <button 
            onClick={applyAll}
            className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            ⚡ Apply All Pending
          </button>
        </div>
        
        <div className="p-4 space-y-3">
          {filtered.map(rec=>(
            <div key={rec.id} className="bg-muted/50 border rounded-lg p-4 border-l-4 border-l-destructive">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2 items-center mb-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      rec.priority==="critical" ? "bg-destructive/10 text-destructive border border-destructive/20" :
                      rec.priority==="high" ? "bg-warning/10 text-warning border border-warning/20" :
                      "bg-default/10 text-default border border-default/20"
                    }`}>
                      {rec.priority}
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 border border-green-200 rounded text-xs font-medium">
                      {rec.impact}% impact
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      rec.status==="applied" ? "bg-green-100 text-green-800 border border-green-200" :
                      rec.status==="pending" ? "bg-yellow-100 text-yellow-800 border border-yellow-200" :
                      "bg-gray-100 text-gray-800 border border-gray-200"
                    }`}>
                      {rec.status}
                    </span>
                    <code className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-mono">
                      {rec.page}
                    </code>
                  </div>
                  <div className="text-sm font-semibold mb-2">{rec.fix_type.replace(/_/g," ").replace(/\b\w/g,l=>l.toUpperCase())}</div>
                  <div className="text-sm text-muted-foreground leading-relaxed mb-3">{rec.reason}</div>
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span>Source: <b className="text-foreground">{rec.source.replace(/_/g," ")}</b></span>
                    <span>Traffic: <b className="text-green-600">{rec.traffic}</b></span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {rec.status==="applied"
                    ?<span className="px-3 py-1.5 bg-green-100 text-green-800 border border-green-200 rounded text-xs font-medium">✓ Applied</span>
                    :<button 
                      onClick={()=>applyFix(rec.id)}
                      disabled={applying===rec.id}
                      className="px-3 py-1.5 bg-primary text-primary-foreground rounded text-xs font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      {applying===rec.id ? (
                        <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"/>
                      ) : (
                        "⚡"
                      )}
                      Apply
                    </button>
                  }
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AIRecommendationsPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="border-b pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  AI Recommendations
                </h1>
                <p className="text-muted-foreground">◈ Odito AI · Agency Platform</p>
              </div>
            </div>
          </div>
          <RecEngine/>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
