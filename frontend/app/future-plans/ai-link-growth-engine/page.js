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
const LGE_SUBMISSIONS = [
  {id:"sub1",domain:"seotoolsinsider.com",url:"/best-ai-seo-tools-2025",type:"article",status:"indexed",date:"2025-03-10",anchor:"AI-powered SEO audit"},
  {id:"sub2",domain:"digitalmarketingblog.net",url:"/white-label-seo",type:"blog_post",status:"indexed",date:"2025-03-08",anchor:"Agency Platform"},
  {id:"sub3",domain:"aimarketingtools.co",url:"/seo-audit-review",type:"article",status:"pending",date:"2025-03-05",anchor:"SEO audit software"},
  {id:"sub4",domain:"agencyresourcehub.com",url:"/tools/agency-platform",type:"directory",status:"indexed",date:"2025-03-01",anchor:"Agency Platform"},
  {id:"sub5",domain:"seoauditpro.net",url:"/core-web-vitals-tools",type:"article",status:"indexed",date:"2025-02-28",anchor:"learn more"},
];

const LGE_CAMPAIGNS = [
  {id:"c1",name:"AI SEO Tools 2025",domain:"agencyplatform.com",keyword:"ai seo tools",status:"active",links_built:47,links_indexed:42,velocity:7,anchor_health:94},
  {id:"c2",name:"Technical SEO Audit",domain:"seoauditpro.net",keyword:"technical seo audit",status:"paused",links_built:23,links_indexed:18,velocity:4,anchor_health:87},
];

const LGE_WORKERS = [
  {id:"w1",name:"opportunity_scanner", queue:"opp:scan",    status:"running",pending:3, done:47, color:T.bl,desc:"Scans for new link opportunities across directories and blogs"},
  {id:"w2",name:"velocity_planner",    queue:"vel:plan",    status:"running",pending:2, done:41, color:T.am,desc:"Calculates safe link velocity based on domain authority and history"},
  {id:"w3",name:"anchor_optimizer",    queue:"anchor:opt",  status:"running",pending:2, done:38, color:T.vi,desc:"Optimizes anchor text distribution for natural link profile"},
  {id:"w4",name:"content_generator",   queue:"content:gen", status:"running",pending:4, done:89, color:T.ind,desc:"Generates AI-powered content for article submissions"},
  {id:"w5",name:"publisher_worker",    queue:"pub:send",    status:"running",pending:3, done:76, color:"#0d9488",desc:"Publishes content to WordPress directories and blogs"},
  {id:"w6",name:"index_checker",       queue:"index:check", status:"running",pending:0, done:65, color:T.cy,desc:"Checks Google index status of submitted links"},
  {id:"w7",name:"recovery_worker",     queue:"index:fix",   status:"idle",   pending:0, done:28, color:"#f97316",desc:"Attempts to recover deindexed links through re-submission"},
  {id:"w8",name:"outreach_worker",     queue:"outreach",    status:"running",pending:5, done:142,color:"#f43f5e",desc:"Manages outreach campaigns and follow-ups"},
];

const LGE_ANCHOR_DIST = {brand:41,partial:31,generic:19,exact:9};

const LGE_VELOCITY_RULES = {
  new:{da_max:25,age_max:6,week:[3,5]},
  growing:{da_max:50,age_max:24,week:[5,10]},
  established:{da_max:70,age_max:60,week:[8,15]},
  authority:{da_max:100,age_max:999,week:[15,25]},
};

const SCHEDULE = [
  {day:"Mon",count:7,time:"09:00"},{day:"Tue",count:5,time:"11:30"},
  {day:"Wed",count:8,time:"14:00"},{day:"Thu",count:6,time:"16:00"},
  {day:"Fri",count:9,time:"10:30"},{day:"Sat",count:3,time:"13:00"},
  {day:"Sun",count:2,time:"15:30"},
];

function createJob(worker,task,details){console.log(`Job created: ${worker} - ${task}: ${details}`);}

const LGE_DB_SCHEMA = `// MongoDB Collections for Link Growth Engine
{
  // Link submissions tracking
  "link_submissions": {
    "_id": ObjectId,
    "campaign_id": String,
    "domain": String,
    "url": String,
    "type": String, // article, blog_post, directory, citation
    "anchor_text": String,
    "status": String, // pending, indexed, rejected
    "submission_date": Date,
    "indexed_date": Date,
    "da": Number,
    "traffic": Number
  },
  
  // Campaign management
  "campaigns": {
    "_id": ObjectId,
    "name": String,
    "domain": String,
    "target_keyword": String,
    "status": String, // active, paused, completed
    "velocity_target": Number,
    "anchor_distribution": Object
  },
  
  // Worker job tracking
  "worker_jobs": {
    "_id": ObjectId,
    "worker_type": String,
    "queue": String,
    "status": String, // pending, running, completed, failed
    "payload": Object,
    "created_at": Date,
    "completed_at": Date
  }
}`;

const LGE_API_DOCS = [
  {m:"POST",path:"/api/lge/campaigns",desc:"Create new link building campaign",color:T.ind,body:`{
  "name": "AI SEO Tools 2025",
  "domain": "agencyplatform.com",
  "target_keyword": "ai seo tools",
  "velocity_target": 7
}`},
  {m:"GET",path:"/api/lge/submissions",desc:"Get all link submissions",color:T.gr,body:`{
  "campaign_id": "c1",
  "status": "indexed",
  "limit": 50
}`},
  {m:"POST",path:"/api/lge/submissions",desc:"Submit new link",color:T.cy,body:`{
  "campaign_id": "c1",
  "domain": "example.com",
  "url": "/path/to/page",
  "anchor_text": "AI SEO platform"
}`},
  {m:"GET",path:"/api/lge/workers",desc:"Get worker status",color:T.am,body:`{
  "worker_type": "opportunity_scanner",
  "status": "running"
}`},
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

function WDot({s}){const c={running:T.gr,idle:T.am,paused:T.t3}[s]||T.t3;return <span style={{width:7,height:7,borderRadius:"50%",background:c,display:"inline-block",boxShadow:s==="running"?`0 0 5px ${c}`:undefined}}/>;}

function LGEBadge({type,xs}){const cols={active:T.gr,paused:T.am,completed:T.gr,failed:T.re};const col=cols[type]||T.t3;return <span style={{display:"inline-flex",alignItems:"center",padding:xs?"2px 7px":"3px 10px",borderRadius:99,fontSize:xs?9.5:11,fontWeight:700,background:col+"18",color:col,border:`1px solid ${col}28`,whiteSpace:"nowrap"}}>{type}</span>;}

function useJobs(){return LGE_WORKERS;}

/* ─── MODULE 1: DIRECTORY SUBMISSION ─────────────────────────────────── */
function LGEDirectoryModule(){
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
    createJob("directory_worker",directories.find(d=>d.id===dirId)?.name||"Directory","New submission");
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

/* ─── MODULE 2: ARTICLE PUBLISHER ────────────────────────────────────── */
function LGEArticleModule(){
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
    createJob("article_worker",articles.find(a=>a.id===articleId)?.title||"Article","Submit to "+publishers.find(p=>p.id===publisherId)?.name||"Publisher");
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

/* ─── MODULE 3: CITATION BUILDER ─────────────────────────────────────── */
function LGECitationModule(){
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
    createJob("citation_worker",citations.find(c=>c.id===citationId)?.businessName||"Business","Submit to "+directories.find(d=>d.id===directoryId)?.name||"Directory");
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

/* ─── MODULE 4: INDEXING AUTOMATION ───────────────────────────────────── */
function LGEIndexingModule(){
  const [submissions,setSubmissions]=useState(LGE_SUBMISSIONS);
  const [checking,setChecking]=useState(null);
  const [lastCheck,setLastCheck]=useState("2025-03-12 14:30");

  function checkIndex(id){
    setChecking(id);
    createJob("index_checker","Index Check",submissions.find(s=>s.id===id)?.url||"URL");
    setTimeout(()=>{
      setSubmissions(prev=>prev.map(s=>s.id===id?{...s,status:s.status==="pending"?"indexed":s.status}:s));
      setChecking(null);
      setLastCheck(new Date().toLocaleString());
    },1500);
  }

  function requestReindex(id){
    createJob("recovery_worker","Reindex Request",submissions.find(s=>s.id===id)?.url||"URL");
    setTimeout(()=>{
      setSubmissions(prev=>prev.map(s=>s.id===id?{...s,status:"pending"}:s));
    },1000);
  }

  return(
    <div className="fade">
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:18}}>
        <Stat value={submissions.length} label="Total URLs" color={T.ind}/>
        <Stat value={submissions.filter(s=>s.status==="indexed").length} label="Indexed" color={T.gr}/>
        <Stat value={submissions.filter(s=>s.status==="pending").length} label="Pending" color={T.am}/>
        <Stat value={Math.round(submissions.filter(s=>s.status==="indexed").length/submissions.length*100)} label="Index Rate" color={T.cy} sub="%"/>
      </div>

      <Card>
        <SHead title="Indexing Automation" sub="Google index monitoring and recovery" icon="📡"/>
        <div style={{padding:"10px 18px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,padding:"10px 14px",background:T.ind+"0a",border:`1px solid ${T.ind}22`,borderRadius:8}}>
            <div style={{fontSize:11,color:T.t2}}>
              <b style={{color:T.indL}}>Last Check:</b> {lastCheck}
            </div>
            <Btn sm v="pri" icon="🔄">Check All</Btn>
          </div>

          {submissions.map(sub=>(
            <div key={sub.id} style={{padding:"14px 16px",background:T.bg3,border:`1px solid ${T.b}`,borderRadius:11,marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:700,color:T.t,marginBottom:4}}>{sub.domain}</div>
                  <div style={{fontSize:10,color:T.cy,fontFamily:"monospace",marginBottom:4}}>{sub.url}</div>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <Pill label={sub.status} c={sub.status==="indexed"?"g":sub.status==="pending"?"a":"r"} xs/>
                    <Pill label={sub.type} c="c" xs/>
                    <span style={{fontSize:10,color:T.t3}}>Date: <b style={{color:T.t2}}>{sub.date}</b></span>
                    <span style={{fontSize:10,color:T.t3}}>Anchor: <b style={{color:T.ind}}>"{sub.anchor}"</b></span>
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:sub.status==="indexed"?T.gr:sub.status==="pending"?T.am:T.re,marginBottom:4,marginLeft:"auto",boxShadow:sub.status==="indexed"?`0 0 8px ${T.gr}`:undefined}}/>
                  <div style={{fontSize:9,color:T.t3}}>{sub.status}</div>
                </div>
              </div>
              <div style={{display:"flex",gap:6}}>
                <Btn sm v="cy" icon="🔍" loading={checking===sub.id} onClick={()=>checkIndex(sub.id)}>Check Index</Btn>
                {sub.status!=="indexed"&&<Btn sm v="am" icon="🔄" onClick={()=>requestReindex(sub.id)}>Request Reindex</Btn>}
                {sub.status==="indexed"&&<Btn sm v="gr" icon="👁">View</Btn>}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ─── MODULE 5: VELOCITY MANAGER ─────────────────────────────────────── */
function LGEVelocityModule(){
  const [domains,setDomains]=useState([
    {name:"agencyplatform.com", tier:"growing", rec:7,  min:5,  max:10, hist:[3,4,3,5,4,6,5,7]},
    {name:"seoauditpro.net",    tier:"growing", rec:6,  min:5,  max:10, hist:[2,2,3,2,3,4,3,4]},
    {name:"techmarketing.co",   tier:"new",       rec:4,  min:3,  max:5,  hist:[1,2,1,2,2,3,2,3]},
    {name:"rankfaster.io",      tier:"authority", rec:18, min:15, max:25, hist:[8,9,10,11,9,12,11,13]},
  ]);

  return(
    <div className="fade">
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:18}}>
        <Stat value={domains.length} label="Domains" color={T.ind}/>
        <Stat value={domains.filter(d=>d.tier==="growing").length} label="Growing" color={T.cy}/>
        <Stat value={domains.reduce((s,d)=>s+d.rec,0)} label="Weekly Target" color={T.am}/>
        <Stat value={Math.round(domains.reduce((s,d)=>s+d.hist.slice(-4).reduce((a,b)=>a+b,0)/4,0)/domains.length)} label="Avg/Week" color={T.gr}/>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:14}}>
        <Card>
          <SHead title="Domain Velocity Planning" sub="Safe link velocity per domain authority" icon="📈"/>
          <div style={{padding:"10px 18px"}}>
            {domains.map(dom=>(
              <div key={dom.name} style={{padding:"14px 16px",background:T.bg3,border:`1px solid ${T.b}`,borderRadius:11,marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:700,color:T.t,marginBottom:4}}>{dom.name}</div>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <Pill label={dom.tier} c={dom.tier==="new"?"am":dom.tier==="growing"?"cy":dom.tier==="authority"?"gr":"i"} xs/>
                      <span style={{fontSize:10,color:T.t3}}>Target: <b style={{color:T.am}}>{dom.rec}/wk</b></span>
                      <span style={{fontSize:10,color:T.t3}}>Range: <b style={{color:T.t2}}>{dom.min}-{dom.max}</b></span>
                    </div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:16,fontWeight:800,color:T.gr,fontFamily:"monospace"}}>{dom.hist.slice(-4).reduce((a,b)=>a+b,0)}</div>
                    <div style={{fontSize:9,color:T.t3}}>last 4 weeks</div>
                  </div>
                </div>
                <div style={{height:32,display:"flex",alignItems:"center",gap:2,marginBottom:4}}>
                  {dom.hist.map((v,i)=>(
                    <div key={i} style={{flex:1,height:`${Math.max(4,v*2)}px`,background:v>=dom.max?T.re:v>=dom.min?T.gr:T.am,borderRadius:2,opacity:i>=dom.hist.length-4?1:0.4}}/>
                  ))}
                </div>
                <div style={{fontSize:9,color:T.t3}}>8-week history · recent 4 weeks highlighted</div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SHead title="Weekly Schedule"/>
          <div style={{padding:"10px 18px"}}>
            <div style={{fontSize:10,fontWeight:700,color:T.t3,marginBottom:8}}>This Week's Distribution</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:12}}>
              {SCHEDULE.map(s=>{
                const tc=s.count>7?T.re:s.count>5?T.am:T.gr;
                return(
                  <div key={s.day} style={{padding:"8px 4px",background:s.count>0?tc+"12":T.bg3,border:`1px solid ${s.count>0?tc+"33":T.b}`,borderRadius:8}}>
                    <div style={{fontSize:9,color:T.t3,marginBottom:3}}>{s.day}</div>
                    <div style={{fontSize:16,fontWeight:800,color:s.count>0?tc:T.t3,fontFamily:"monospace"}}>{s.count}</div>
                    {s.count>0&&<div style={{fontSize:8,color:T.t3}}>{s.time}</div>}
                  </div>
                );
              })}
            </div>
            <div style={{fontSize:10,color:T.t3}}>Total this week: <b style={{color:T.cy}}>{SCHEDULE.reduce((s,d)=>s+d.count,0)} links</b> · within safe range ✓</div>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ─── MODULE 6: ANCHOR OPTIMIZER ────────────────────────────────────── */
function LGEAnchorModule(){
  const [keyword,setKeyword]=useState("ai seo audit tool");
  const [url,setUrl]=useState("https://agencyplatform.com/features/seo-audit");
  const [generating,setGenerating]=useState(false);
  const [result,setResult]=useState(null);
  const dist=LGE_ANCHOR_DIST;

  const VARS={
    brand:  ["Odito AI","Agency Platform","agencyplatform.com","Try Agency Platform","Visit Odito AI"],
    partial:["AI-powered SEO audit","AI SEO platform","SEO automation tools","best AI SEO tools","AI-driven SEO"],
    generic:["learn more","click here","read more","visit here","this guide","this resource"],
    exact:  ["ai seo audit tool","ai seo audit","best ai seo audit tool"],
  };

  function generate(){
    setGenerating(true);setResult(null);
    setTimeout(()=>{
      const type=dist.brand<40?"brand":dist.partial<30?"partial":dist.generic<20?"generic":"exact";
      const opts=VARS[type];
      const chosen=opts[Math.floor(Math.random()*opts.length)];
      setResult({anchor:chosen,type,context_match:Math.floor(Math.random()*10+85),confidence:Math.floor(Math.random()*8+88)});
      setGenerating(false);
    },1300);
  }

  const typeColor={brand:T.ind,partial:T.cy,generic:T.vi,exact:T.am};

  return(
    <div className="fade">
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:18}}>
        {[["Brand",dist.brand,40,T.ind],["Partial",dist.partial,30,T.cy],["Generic",dist.generic,20,T.vi],["Exact",dist.exact,10,T.am]].map(([l,a,t,c])=>(
          <Stat key={l} value={`${a}%`} label={`${l} (target ${t}%)`} color={c} sub={Math.abs(a-t)<=4?"✓ On target":`${a>t?"+":""}${a-t}% off`}/>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14}}>
        <Card>
          <SHead title="Anchor Generator" sub="Weighted assignment · context matching" icon="⚖"/>
          <div style={{padding:"16px 18px"}}>
            {[["Target Keyword",keyword,setKeyword],["Target URL",url,setUrl]].map(([lbl,v,s])=>(
              <div key={lbl} style={{marginBottom:12}}>
                <div style={{fontSize:10,fontWeight:700,color:T.t3,textTransform:"uppercase",letterSpacing:".06em",marginBottom:4}}>{lbl}</div>
                <input value={v} onChange={e=>s(e.target.value)} style={{width:"100%",padding:"8px 11px",borderRadius:8,border:`1px solid ${T.b}`,background:T.bg3,color:T.t,fontSize:12,outline:"none",boxSizing:"border-box"}}/>
              </div>
            ))}
            <Btn full v="pri" loading={generating} icon={generating?undefined:"⚖"} onClick={generate}>Assign Anchor</Btn>
            {result&&<div style={{marginTop:12,padding:"12px 14px",background:T.gr+"0a",border:`1px solid ${T.gr}22`,borderRadius:8}}>
              <div style={{fontSize:10,fontWeight:700,color:T.gr,marginBottom:5}}>✦ Assigned</div>
              <div style={{fontSize:14,fontWeight:800,color:T.t,marginBottom:6}}>"{result.anchor}"</div>
              <div style={{display:"flex",gap:5}}>
                <Pill label={result.type} c={result.type==="brand"?"i":result.type==="partial"?"c":result.type==="exact"?"a":"v"} xs/>
                <Pill label={`Match ${result.context_match}%`} c="g" xs/>
                <Pill label={`${result.confidence}% conf.`} c="c" xs/>
              </div>
            </div>}
          </div>
        </Card>
        <Card>
          <SHead title="Distribution vs Target"/>
          <div style={{padding:"16px 18px"}}>
            {[["Brand",dist.brand,40,T.ind],["Partial",dist.partial,30,T.cy],["Generic",dist.generic,20,T.vi],["Exact",dist.exact,10,T.am]].map(([lbl,actual,target,c])=>{
              const dev=actual-target;const ok=Math.abs(dev)<=4;
              return(
                <div key={lbl} style={{marginBottom:14}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                    <span style={{fontSize:12,fontWeight:700,color:T.t}}>{lbl}</span>
                    <div style={{display:"flex",gap:8}}>
                      <span style={{fontSize:13,fontWeight:800,color:c,fontFamily:"monospace"}}>{actual}%</span>
                      <span style={{fontSize:10,color:ok?T.gr:T.re}}>({dev>=0?"+":""}{dev}%)</span>
                    </div>
                  </div>
                  <div style={{position:"relative",height:10,borderRadius:5,background:T.b}}>
                    <div style={{position:"absolute",left:`${target}%`,top:-3,width:2,height:16,background:T.t3+"88",borderRadius:1}}/>
                    <div style={{width:`${actual}%`,height:"100%",borderRadius:5,background:c}}/>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
        <Card>
          <SHead title="Variation Library"/>
          <div style={{padding:"12px 18px",maxHeight:360,overflowY:"auto"}}>
            {Object.entries(VARS).map(([type,opts])=>(
              <div key={type} style={{marginBottom:14}}>
                <div style={{fontSize:10,fontWeight:700,color:typeColor[type]||T.t2,textTransform:"uppercase",letterSpacing:".06em",marginBottom:6}}>{type} Anchors</div>
                {opts.map((o,i)=>(
                  <div key={i} style={{fontSize:10.5,color:T.t2,padding:"3px 8px",background:T.bg3,borderRadius:5,marginBottom:4,border:`1px solid ${T.b}`}}>"{o}"</div>
                ))}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ─── MODULE 7: INTERNAL LINKING ────────────────────────────────────── */
function LGEInternalModule(){
  const [scanning,setScanning]=useState(false);
  const [scanDone,setScanDone]=useState(false);
  const [opportunities,setOpportunities]=useState([
    {from:"/blog/seo-audit-guide",to:"/features/seo-audit",keyword:"seo audit tool",context:"...using an seo audit tool you can identify...",score:94,status:"suggested"},
    {from:"/blog/core-web-vitals",to:"/features/pagespeed",keyword:"pagespeed optimization",context:"...pagespeed optimization becomes essential when...",score:88,status:"suggested"},
    {from:"/blog/ai-seo-2025",to:"/ai-seo",keyword:"AI SEO platform",context:"...the best AI SEO platform handles this automatically...",score:91,status:"applied"},
    {from:"/services/technical",to:"/features/technical",keyword:"technical seo checker",context:"...a technical seo checker catches crawl errors...",score:86,status:"suggested"},
    {from:"/blog/local-seo",to:"/features/local",keyword:"local seo audit",context:"...running a local seo audit helps you rank in...",score:82,status:"suggested"},
  ]);
  const [applying,setApplying]=useState(null);

  function scan(){
    setScanning(true);setScanDone(false);
    createJob("internal_scanner","Website Crawl","Internal link opportunity detection");
    setTimeout(()=>{setScanning(false);setScanDone(true);},2200);
  }

  function applyLink(idx){
    setApplying(idx);
    createJob("internal_worker","Internal Link",opportunities[idx].keyword);
    setTimeout(()=>{
      setOpportunities(prev=>prev.map((o,i)=>i===idx?{...o,status:"applied"}:o));
      setApplying(null);
    },1800);
  }

  function applyAll(){
    opportunities.filter((o,i)=>o.status==="suggested").forEach((o,i)=>setTimeout(()=>applyLink(opportunities.indexOf(o)),i*500));
  }

  return(
    <div className="fade">
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:18}}>
        <Stat value={opportunities.length} label="Opportunities" color={T.ind}/>
        <Stat value={opportunities.filter(o=>o.status==="applied").length} label="Applied" color={T.gr}/>
        <Stat value={opportunities.filter(o=>o.status==="suggested").length} label="Suggested" color={T.am}/>
        <Stat value="Auto" label="Detection Mode" color={T.cy}/>
      </div>
      <Card>
        <div style={{padding:"13px 18px",borderBottom:`1px solid ${T.b}`,display:"flex",alignItems:"center",gap:10}}>
          <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:T.t}}>Internal Link Opportunities</div><div style={{fontSize:10,color:T.t3}}>AI crawls pages · finds contextual anchor opportunities · injects links via WordPress API</div></div>
          <Btn sm v="pri" loading={scanning} icon={scanning?undefined:"🔍"} onClick={scan}>{scanning?"Crawling…":"Crawl Website"}</Btn>
          {scanDone&&<Btn sm v="gr" icon="⚡" onClick={applyAll}>Apply All</Btn>}
        </div>
        {scanDone&&<div style={{padding:"8px 18px",background:T.gr+"0a",borderBottom:`1px solid ${T.b}`,fontSize:11,color:T.gr}}>✓ Crawl complete — {opportunities.length} opportunities found across {new Set(opportunities.map(o=>o.from)).size} pages</div>}
        <div style={{padding:"10px 18px"}}>
          {opportunities.map((opp,i)=>(
            <div key={i} style={{padding:"12px 14px",background:T.bg3,border:`1px solid ${opp.status==="applied"?T.gr+"33":T.b}`,borderRadius:10,marginBottom:8,borderLeft:`3px solid ${opp.status==="applied"?T.gr:T.am}`}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:5}}>
                    <code style={{fontSize:10,color:T.cy,background:T.bg,padding:"1px 6px",borderRadius:4}}>{opp.from}</code>
                    <span style={{color:T.t3,fontSize:11}}>→</span>
                    <code style={{fontSize:10,color:T.indL,background:T.bg,padding:"1px 6px",borderRadius:4}}>{opp.to}</code>
                  </div>
                  <div style={{fontSize:11,color:T.t2,marginBottom:5,lineHeight:1.4}}>…{opp.context.replace(opp.keyword,`<b>${opp.keyword}</b>`)}…</div>
                  <div style={{display:"flex",gap:6}}>
                    <span style={{fontSize:9.5,fontWeight:700,color:T.ind,background:T.ind+"14",padding:"2px 7px",borderRadius:5}}>"{opp.keyword}"</span>
                    <span style={{fontSize:9.5,color:T.t3}}>Score: {opp.score}</span>
                  </div>
                </div>
                <div style={{flexShrink:0}}>
                  {opp.status==="applied"
                    ?<Pill label="✓ Applied" c="g" xs/>
                    :<Btn sm v="pri" icon="🔗" loading={applying===i} onClick={()=>applyLink(i)}>Apply</Btn>
                  }
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ─── AI LINK GROWTH ENGINE ─────────────────────────────────────────── */
function AILinkGrowthEngine({tab:initTab}){
  const [tab,setTab]=useState(initTab||"overview");

  const totalLinks  = LGE_SUBMISSIONS.length;
  const indexedLinks= LGE_SUBMISSIONS.filter(s=>s.status==="indexed").length;
  const idxRate     = Math.round(indexedLinks/totalLinks*100);

  const TABS=[
    ["overview",   "📊 Overview"],
    ["directory",  "📋 Directory"],
    ["articles",   "✍ Articles"],
    ["citations",  "📍 Citations"],
    ["indexing",   "📡 Indexing"],
    ["velocity",   "📈 Velocity"],
    ["anchor",     "⚖ Anchor"],
    ["internal",   "🔗 Internal"],
    ["pipeline",   "⚙ Pipeline"],
    ["api",        "{ } API Docs"],
  ];

  return(
    <div className="fade">
      {/* Tabs */}
      <div style={{display:"flex",gap:0,borderBottom:`1px solid ${T.b}`,marginBottom:22,overflowX:"auto"}}>
        {TABS.map(([id,lbl])=>(
          <button key={id} onClick={()=>setTab(id)} style={{padding:"9px 16px",border:"none",borderBottom:`2px solid ${tab===id?T.ind:"transparent"}`,background:"transparent",color:tab===id?T.indL:T.t3,fontSize:11,fontWeight:tab===id?700:400,cursor:"pointer",transition:"all .15s",whiteSpace:"nowrap"}}>
            {lbl}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab==="overview"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:10,marginBottom:18}}>
            <Stat value={totalLinks} label="Total Links" color={T.ind}/>
            <Stat value={indexedLinks} label="Indexed" color={T.gr} sub={`${idxRate}% rate`}/>
            <Stat value={LGE_SUBMISSIONS.filter(s=>s.type==="directory").length} label="Directories" color={T.vi}/>
            <Stat value={LGE_SUBMISSIONS.filter(s=>s.type==="article"||s.type==="blog_post").length} label="Articles" color={T.cy}/>
            <Stat value={LGE_SUBMISSIONS.filter(s=>s.type==="citation").length} label="Citations" color={T.am}/>
            <Stat value={LGE_WORKERS.filter(w=>w.status==="running").length} label="Workers" color={T.gr}/>
          </div>
          
          {/* Campaign cards */}
          <div style={{marginBottom:16}}>
            <div style={{fontSize:13,fontWeight:700,color:T.t,marginBottom:10}}>Active Campaigns</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {LGE_CAMPAIGNS.map(c=>(
                <div key={c.id} style={{padding:"14px 16px",background:T.card,border:`1px solid ${T.b}`,borderRadius:11,display:"flex",alignItems:"center",gap:14,borderLeft:`3px solid ${c.status==="active"?T.gr:T.am}`}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4}}>
                      <span style={{fontSize:12,fontWeight:700,color:T.t}}>{c.name}</span>
                      <Pill label={c.domain} c="c" xs/>
                      <LGEBadge type={c.status==="active"?"active":"paused"} xs/>
                    </div>
                    <div style={{display:"flex",gap:14,fontSize:10.5,color:T.t3}}>
                      <span>Keyword: <b style={{color:T.t2}}>{c.keyword}</b></span>
                      <span>Links built: <b style={{color:T.gr}}>{c.links_built}</b></span>
                      <span>Indexed: <b style={{color:T.gr}}>{c.links_indexed}</b></span>
                      <span>Velocity: <b style={{color:T.cy}}>{c.velocity}/wk</b></span>
                      <span>Anchor health: <b style={{color:c.anchor_health>=90?T.gr:T.am}}>{c.anchor_health}%</b></span>
                    </div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{height:6,width:120,borderRadius:3,background:T.b,overflow:"hidden"}}><div style={{width:`${Math.round(c.links_indexed/c.links_built*100)}%`,height:"100%",background:T.gr,borderRadius:3}}/></div>
                    <div style={{fontSize:9,color:T.t3,marginTop:2}}>{Math.round(c.links_indexed/c.links_built*100)}% indexed</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Module cards */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
            {["directory","articles","citations","indexing","velocity","anchor","internal","pipeline"].map(id=>(
              <div key={id} onClick={()=>setTab(id)} style={{padding:"14px 16px",background:T.card,border:`1px solid ${T.b}`,borderRadius:11,cursor:"pointer",borderTop:`2px solid ${T.ind}`,transition:"all .15s"}}>
                <div style={{fontSize:22,marginBottom:6}}>{id==="directory"?"📋":id==="articles"?"✍":id==="citations"?"📍":id==="indexing"?"📡":id==="velocity"?"📈":id==="anchor"?"⚖":id==="internal"?"🔗":"⚙"}</div>
                <div style={{fontSize:12,fontWeight:700,color:T.t,marginBottom:3}}>{id.charAt(0).toUpperCase()+id.slice(1)}</div>
                <div style={{fontSize:10.5,color:T.t3,lineHeight:1.4}}>AI-powered {id} management</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── PIPELINE TAB ── */}
      {tab==="pipeline"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:18}}>
            <Stat value={LGE_WORKERS.filter(w=>w.status==="running").length} label="Workers Running" color={T.gr}/>
            <Stat value={LGE_WORKERS.reduce((s,w)=>s+w.pending,0)} label="Jobs Queued" color={T.am}/>
            <Stat value={LGE_WORKERS.reduce((s,w)=>s+w.done,0)} label="Jobs Completed" color={T.cy}/>
          </div>
          <Card style={{marginBottom:14}}>
            <SHead title="BullMQ Workers — Redis + Node.js" sub="FastAPI backend · MongoDB persistence"/>
            <div style={{padding:"12px 18px"}}>
              {LGE_WORKERS.map(w=>(
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
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ── API DOCS TAB ── */}
      {tab==="api"&&(
        <div>
          <div style={{marginBottom:14,padding:"10px 14px",background:T.ind+"0a",border:`1px solid ${T.ind}22`,borderRadius:10,fontSize:11,color:T.t2}}>
            <b style={{color:T.indL}}>Base URL:</b> <code style={{color:T.cy,fontFamily:"monospace"}}>https://api.odito.ai</code> · Auth: Bearer token · FastAPI (Python) backend
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {LGE_API_DOCS.map((ep,i)=>(
              <div key={i} style={{padding:"14px 16px",background:T.card,border:`1px solid ${T.b}`,borderRadius:10}}>
                <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:6}}>
                  <span style={{fontSize:10,fontWeight:800,color:ep.color,background:ep.color+"18",padding:"2px 7px",borderRadius:5,fontFamily:"monospace"}}>{ep.m}</span>
                  <code style={{fontSize:10.5,color:T.indL,fontFamily:"monospace",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ep.path}</code>
                </div>
                <div style={{fontSize:11,color:T.t3,marginBottom:8}}>{ep.desc}</div>
                <pre style={{margin:0,fontSize:9.5,color:T.t2,fontFamily:"monospace",background:T.bg3,padding:"8px 10px",borderRadius:7,border:`1px solid ${T.b}`,lineHeight:1.6,whiteSpace:"pre-wrap",wordBreak:"break-word"}}>{ep.body}</pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==="directory" &&<LGEDirectoryModule/>}
      {tab==="articles"  &&<LGEArticleModule/>}
      {tab==="citations" &&<LGECitationModule/>}
      {tab==="indexing"  &&<LGEIndexingModule/>}
      {tab==="velocity"  &&<LGEVelocityModule/>}
      {tab==="anchor"    &&<LGEAnchorModule/>}
      {tab==="internal"  &&<LGEInternalModule/>}
    </div>
  );
}

export default function AILinkGrowthEnginePage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="border-b pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  AI Link Growth Engine
                </h1>
                <p className="text-muted-foreground">◈ Odito AI · Agency Platform</p>
              </div>
            </div>
          </div>
          <AILinkGrowthEngine/>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
