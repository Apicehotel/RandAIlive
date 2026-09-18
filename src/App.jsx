import { useEffect, useMemo, useState } from 'react'
import { supabase } from './supabase.js'
import { zoneFor, WORLD_ZONES } from './behavior-engine.js'

const STALE_MS=5*60*1000
const AGENTS=[
['randai','RandAI','💬','#56b7ff'],['randbrain','RandBrain','🧠','#b981ff'],['randcore','RandCore','⚙','#ffad42'],['randmind','RandMind','▤','#64d98b'],['randradar','RandRadar','◉','#ff5c62'],['randresearch','RandResearch','⌕','#7fc8ff'],['randsecure','RandSecure','🔒','#ff6464'],['randtest','RandTest','✓','#e8d84b'],['randops','RandOps','🔧','#4fdbe8'],['randui','RandUI','✦','#ff74d3']
].map(([id,name,glyph,tone])=>({id,name,glyph,tone}))

function deriveStatus(row,now){
 const s=String(row?.status||'').toUpperCase()
 if(s==='ERROR'||s==='WAITING_APPROVAL')return s
 const hb=row?.heartbeat_at?new Date(row.heartbeat_at).getTime():NaN
 if(!Number.isFinite(hb)||now-hb>STALE_MS)return'OFFLINE'
 if(row?.task_id||s==='RUNNING')return'RUNNING'
 return'IDLE'
}
const label=s=>({RUNNING:'Al lavoro',IDLE:'Disponibile',WAITING_APPROVAL:'Attende',ERROR:'Errore',OFFLINE:'Offline'}[s]||s)

function Bot({agent,focused,onFocus}){
 const z=agent.life
 return <button className={`agent agent--${agent.status.toLowerCase()} agent--${z.mode.toLowerCase()} ${focused?'is-focused':''}`}
  style={{'--x':`${z.x}%`,'--y':`${z.y}%`,'--tone':agent.tone}} onClick={()=>onFocus(agent.id)} aria-label={`${agent.name}: ${z.action}`}>
   <div className="speech"><strong>{z.action}</strong><span>{z.label}</span></div>
   <div className="bot" aria-hidden="true"><i className="antenna"/><div className="head"><b/><b/></div><div className="body">{agent.glyph}</div><i className="arm arm-l"/><i className="arm arm-r"/><i className="leg leg-l"/><i className="leg leg-r"/></div>
   <div className="tag"><strong>{agent.name}</strong><small>{z.action}</small></div>
  </button>
}

export default function App(){
 const [rows,setRows]=useState([]),[now,setNow]=useState(Date.now()),[error,setError]=useState(''),[focus,setFocus]=useState(null),[director,setDirector]=useState(true)
 useEffect(()=>{
  const tick=window.setInterval(()=>setNow(Date.now()),1000)
  if(!supabase)return()=>window.clearInterval(tick)
  let alive=true
  const load=async()=>{const {data,error:e}=await supabase.from('randcore_agent_runtime').select('agent_id,status,heartbeat_at,task_id,activity,detail,hotel_id,updated_at').order('agent_id');if(!alive)return;if(e){setError(e.message);return}setError('');setRows(data||[])}
  load()
  const channel=supabase.channel('randailive-world').on('postgres_changes',{event:'*',schema:'public',table:'randcore_agent_runtime'},load).subscribe()
  return()=>{alive=false;window.clearInterval(tick);supabase.removeChannel(channel)}
 },[])
 const agents=useMemo(()=>{const byId=new Map(rows.map(r=>[String(r.agent_id||'').toLowerCase(),r]));return AGENTS.map(a=>{const row=byId.get(a.id)||{};const merged={...a,...row,status:deriveStatus(row,now)};return {...merged,life:zoneFor(merged,now)}})},[rows,now])
 const counts=useMemo(()=>agents.reduce((m,a)=>(m[a.status]=(m[a.status]||0)+1,m),{}),[agents])
 const selected=agents.find(a=>a.id===focus)||null
 const mission=agents.find(a=>a.status==='ERROR')||agents.find(a=>a.status==='RUNNING')||agents.find(a=>a.status==='WAITING_APPROVAL')||null
 const encounters=useMemo(()=>{const groups=new Map();for(const a of agents){const k=a.life.id;if(!groups.has(k))groups.set(k,[]);groups.get(k).push(a)}return [...groups.values()].filter(g=>g.length>1)},[agents])
 return <main className="app">
  <header className="topbar"><div className="brand"><span className="logo">R</span><div><strong>RandAILive</strong><small>THE LIVING AI HOTEL</small></div><em>LIVE</em></div><div className="metrics"><span><b>{counts.RUNNING||0}</b> missioni</span><span><b>{encounters.length}</b> incontri</span><span><b>{counts.ERROR||0}</b> allarmi</span><button onClick={()=>setDirector(v=>!v)}>{director?'Regia ON':'Regia OFF'}</button></div></header>
  {!supabase&&<div className="config-banner">Modalità demo comportamentale: collega Supabase per usare gli heartbeat reali.</div>}
  {mission&&<div className={`mission mission--${mission.status.toLowerCase()}`}><span>MISSION LIVE</span><strong>{mission.name}</strong><p>{mission.activity||mission.detail||label(mission.status)}</p></div>}
  <section className="layout">
   <div className="world-card">
    <div className={`world ${director&&focus?'world--focused':''}`}>
     <div className="stars">{Array.from({length:18},(_,i)=><i key={i}/>)}</div>
     <div className="hotel-title">RANDAPP HOTEL<small>10 AGENTS · ONE LIVING WORLD</small></div>
     <div className="upper upper-left"/><div className="upper upper-right"/><div className="elevator elevator-left">ELEVATOR</div><div className="elevator elevator-right">ELEVATOR</div>
     <div className="knowledge">KNOWLEDGE</div><div className="ops">OPS</div><div className="radar"><i/></div><div className="hub"><strong>RandApp Hub</strong><small>REAL-TIME ECOSYSTEM</small></div>
     <div className="floor-lines"/><div className="plant plant-a">♣</div><div className="plant plant-b">♣</div><div className="lounge"><i/><i/><i/></div><div className="coffee">☕ COFFEE</div>
     {Object.values(WORLD_ZONES).map(z=><span className="zone-label" key={z.id} style={{left:`${z.x}%`,top:`${z.y}%`}}>{z.label}</span>)}
     {agents.map(a=><Bot key={a.id} agent={a} focused={focus===a.id} onFocus={setFocus}/>)}
     {encounters.map((group,i)=><div key={i} className="encounter" style={{left:`${group[0].life.x}%`,top:`${group[0].life.y-7}%`}}>💬 {group.map(a=>a.name).join(' + ')}</div>)}
    </div>
    <footer className="legend"><span>WANDER = vita libera</span><span>WORK = missione reale</span><span>ALERT = emergenza</span><span>Tocca un agente per seguirlo</span></footer>
   </div>
   <aside className="sidebar">
    <section className="panel"><header><strong>Regia</strong><span>{selected?'FOLLOW':'FREE CAM'}</span></header>{selected?<div className="profile"><div className="profile-icon" style={{'--tone':selected.tone}}>{selected.glyph}</div><h2>{selected.name}</h2><p>{selected.life.action}</p><small>{selected.life.label}</small><b>{label(selected.status)}</b><button onClick={()=>setFocus(null)}>Smetti di seguire</button></div>:<p className="empty">Tocca un agente nella hall.</p>}</section>
    <section className="panel"><header><strong>Vita nella hall</strong><span>12s CYCLE</span></header>{agents.map(a=><button className="life-row" key={a.id} onClick={()=>setFocus(a.id)}><i style={{background:a.tone}}/><span><b>{a.name}</b><small>{a.life.action}</small></span><em>{a.life.label}</em></button>)}</section>
    <section className="panel"><header><strong>Incontri</strong><span>{encounters.length}</span></header>{encounters.length?encounters.map((g,i)=><div className="event" key={i}><div><b>{g.map(a=>a.name).join(' + ')}</b><p>si sono incontrati in {g[0].life.label}</p></div></div>):<p className="empty">Nessun incontro in questo momento.</p>}</section>
    {error&&<div className="error">{error}</div>}
   </aside>
  </section>
 </main>
}
