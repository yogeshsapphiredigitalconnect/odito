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

/* ─── ARTICLE PUBLISHER MODULE ───────────────────────────────────────── */
function ArticlePublisher(){
  const [articles,setArticles]=useState([
    {id:"a1",title:"10 AI SEO Tools That Will Transform Your Strategy",status:"published",publisher:"SEO Blog Hub",date:"2025-03-10",views:1240,backlinks:3,anchor:"AI SEO tools"},
    {id:"a2",title:"Complete Guide to Technical SEO Audits",status:"in_review",publisher:"Marketing Insights",date:"2025-03-12",views:0,backlinks:0,anchor:"technical SEO audit"},
    {id:"a3",title:"How to Optimize Core Web Vitals in 2025",status:"draft",publisher:"",date:"",views:0,backlinks:0,anchor:"Core Web Vitals"},
    {id:"a4",title:"The Future of AI in Search Engine Optimization",status:"published",publisher:"Digital Marketing Today",date:"2025-03-08",views:890,backlinks:2,anchor:"AI in SEO"},
  ]);

  const [publishers,setPublishers]=useState([
    {id:"p1",name:"SEO Blog Hub",da:65,status:"active",lastAccept:"2025-03-10",guidelines:"1000+ words, original content"},
    {id:"p2",name:"Marketing Insights",da:58,status:"active",lastAccept:"2025-03-09",guidelines:"800+ words, data-driven"},
    {id:"p3",name:"Digital Marketing Today",da:52,status:"paused",lastAccept:"2025-03-01",guidelines:"1200+ words, case studies"},
  ]);

  const [submitting,setSubmitting]=useState(null);
  const [activeTab,setActiveTab]=useState("articles");

  function submitArticle(articleId,publisherId){
    setSubmitting(`${articleId}-${publisherId}`);
    setTimeout(()=>{
      setArticles(prev=>prev.map(a=>a.id===articleId?{...a,status:"in_review",publisher:publishers.find(p=>p.id===publisherId)?.name||"",date:new Date().toISOString().split('T')[0]}:a));
      setSubmitting(null);
    },2000);
  }

  return(
    <div className="fade">
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:18}}>
        <Stat value={articles.length} label="Total Articles" color={T.ind}/>
        <Stat value={articles.filter(a=>a.status==="published").length} label="Published" color={T.gr}/>
        <Stat value={articles.filter(a=>a.status==="in_review").length} label="In Review" color={T.am}/>
        <Stat value={publishers.filter(p=>p.status==="active").length} label="Active Publishers" color={T.cy}/>
      </div>

      <Card>
        <div style={{padding:"13px 18px",borderBottom:`1px solid ${T.b}`,display:"flex",alignItems:"center",gap:10}}>
          <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:T.t}}>Article Publisher</div><div style={{fontSize:10,color:T.t3,marginTop:1}}>AI-powered content creation and distribution</div></div>
        </div>
        
        <div style={{display:"flex",gap:0,borderBottom:`1px solid ${T.b}`}}>
          {["articles","publishers","queue"].map(tab=>(
            <button key={tab} onClick={()=>setActiveTab(tab)} style={{padding:"10px 16px",border:"none",borderBottom:`2px solid ${activeTab===tab?T.ind:"transparent"}`,background:"transparent",color:activeTab===tab?T.indL:T.t3,fontSize:11,fontWeight:activeTab===tab?700:400,cursor:"pointer",textTransform:"capitalize"}}>
              {tab} ({tab==="articles"?articles.length:tab==="publishers"?publishers.length:articles.filter(a=>a.status==="draft").length})
            </button>
          ))}
        </div>

        {activeTab==="articles"&&(
          <div style={{padding:"10px 18px"}}>
            {articles.map(article=>(
              <div key={article.id} style={{padding:"14px 16px",background:T.bg3,border:`1px solid ${T.b}`,borderRadius:11,marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:700,color:T.t,marginBottom:4}}>{article.title}</div>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <Pill label={article.status.replace(/_/g," ")} c={article.status==="published"?"g":article.status==="in_review"?"a":"i"} xs/>
                      {article.publisher&&<span style={{fontSize:10,color:T.t3}}>Publisher: <b style={{color:T.t2}}>{article.publisher}</b></span>}
                      {article.date&&<span style={{fontSize:10,color:T.t3}}>Date: <b style={{color:T.t2}}>{article.date}</b></span>}
                      {article.views>0&&<span style={{fontSize:10,color:T.t3}}>Views: <b style={{color:T.gr}}>{article.views.toLocaleString()}</b></span>}
                    </div>
                    {article.anchor&&<div style={{fontSize:10,color:T.t3,marginTop:4}}>Anchor: <b style={{color:T.ind}}>"{article.anchor}"</b></div>}
                  </div>
                  <div style={{textAlign:"right"}}>
                    {article.backlinks>0&&<div style={{fontSize:9,color:T.gr,marginBottom:2}}>{article.backlinks} links</div>}
                    <div style={{fontSize:10,color:T.t3}}>{article.views>0?`${Math.round(article.views/100)}K views`:"Not published"}</div>
                  </div>
                </div>
                <div style={{display:"flex",gap:6}}>
                  {article.status==="draft"&&<Btn sm v="pri" icon="✍">Edit</Btn>}
                  {article.status==="draft"&&<Btn sm v="cy" icon="📤">Submit</Btn>}
                  {article.status==="published"&&<Btn sm v="gr" icon="👁">View</Btn>}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab==="publishers"&&(
          <div style={{padding:"10px 18px"}}>
            {publishers.map(publisher=>(
              <div key={publisher.id} style={{padding:"14px 16px",background:T.bg3,border:`1px solid ${T.b}`,borderRadius:11,marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:700,color:T.t,marginBottom:4}}>{publisher.name}</div>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <Pill label={`DA ${publisher.da}`} c="c" xs/>
                      <Pill label={publisher.status} c={publisher.status==="active"?"g":"a"} xs/>
                      <span style={{fontSize:10,color:T.t3}}>Last: <b style={{color:T.t2}}>{publisher.lastAccept}</b></span>
                    </div>
                    <div style={{fontSize:10,color:T.t3,marginTop:4}}>{publisher.guidelines}</div>
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    <Btn sm v="cy" icon="📤">Submit Article</Btn>
                    <Btn sm v="gh" icon="👁">Guidelines</Btn>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab==="queue"&&(
          <div style={{padding:"40px 18px",textAlign:"center",color:T.t3}}>
            <div style={{fontSize:48,marginBottom:16}}>📝</div>
            <div style={{fontSize:16,fontWeight:700,color:T.t,marginBottom:8}}>Publishing Queue</div>
            <div style={{fontSize:12,color:T.t3}}>No articles currently in the publishing queue.</div>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function ArticlePublisherPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="border-b pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Article Publisher
                </h1>
                <p className="text-muted-foreground">◈ Odito AI · Agency Platform</p>
              </div>
            </div>
          </div>
          <ArticlePublisher/>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
