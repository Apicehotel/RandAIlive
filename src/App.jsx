import { useEffect, useMemo, useState } from 'react'
import { supabase } from './supabase.js'

const STALE_MS = 5 * 60 * 1000
const AGENTS = [
  ['randai','RandAI','Reception AI','💬','#56b7ff'],
  ['randbrain','RandBrain','Planning Lab','🧠','#b981ff'],
  ['randcore','RandCore','Core Hub','⚙','#ffad42'],
  ['randmind','RandMind','Knowledge Library','▤','#64d98b'],
  ['randradar','RandRadar','Radar Deck','◉','#ff5c62'],
  ['randresearch','RandResearch','Research Desk','⌕','#7fc8ff'],
  ['randsecure','RandSecure','Secure Gate','🔒','#ff6464'],
  ['randtest','RandTest','QA Station','✓','#e8d84b'],
  ['randops','RandOps','Ops Bay','🔧','#4fdbe8'],
  ['randui','RandUI','Design Studio','✦','#ff74d3'],
].map(([id,name,station,glyph,tone],index)=>({id,name,station,glyph,tone,index}))

const POSITIONS = [
  [14,33],[30,25],[50,29],[69,25],[85,34],
  [16,70],[34,72],[50,77],[68,71],[84,68],
]

function deriveStatus(row, now){
  const explicit=String(row?.status||'').toUpperCase()
  if(explicit==='ERROR'||explicit==='WAITING_APPROVAL') return explicit
  const hb=row?.heartbeat_at ? new Date(row.heartbeat_at).getTime() : NaN
  if(!Number.isFinite(hb)||now-hb>STALE_MS) return 'OFFLINE'
  if(row?.task_id||explicit==='RUNNING') return 'RUNNING'
  return 'IDLE'
}

function label(status){
  return {
    RUNNING:'Al lavoro',
    IDLE:'Disponibile',
    WAITING_APPROVAL:'Attende approvazione',
    ERROR:'Errore',
    OFFLINE:'Offline'
  }[status]||status
}

function Bot({agent}){
  const [x,y]=POSITIONS[agent.index]
  const working=agent.status==='RUNNING'
  return <article
    className={`agent agent--${agent.status.toLowerCase()} ${working?'agent--working':''}`}
    style={{'--x':`${x}%`,'--y':`${y}%`,'--tone':agent.tone}}
    aria-label={`${agent.name}: ${label(agent.status)}`}
  >
    <div className="speech">
      <strong>{label(agent.status)}</strong>
      <span>{agent.activity || agent.detail || agent.station}</span>
    </div>
    <div className="bot" aria-hidden="true">
      <i className="antenna"/>
      <div className="head"><b/><b/></div>
      <div className="body">{agent.glyph}</div>
      <i className="arm arm-l"/><i className="arm arm-r"/>
      <i className="leg leg-l"/><i className="leg leg-r"/>
    </div>
    <div className="tag"><strong>{agent.name}</strong><small>{agent.station}</small></div>
  </article>
}

export default function App(){
  const [rows,setRows]=useState([])
  const [now,setNow]=useState(Date.now())
  const [error,setError]=useState('')

  useEffect(()=>{
    const tick=window.setInterval(()=>setNow(Date.now()),30000)
    if(!supabase){
      return ()=>window.clearInterval(tick)
    }
    let alive=true
    const load=async()=>{
      const {data,error:queryError}=await supabase
        .from('randcore_agent_runtime')
        .select('agent_id,status,heartbeat_at,task_id,activity,detail,hotel_id,updated_at')
        .order('agent_id')
      if(!alive)return
      if(queryError){setError(queryError.message);return}
      setError('')
      setRows(data||[])
      setNow(Date.now())
    }
    load()
    const channel=supabase
      .channel('randailive-world')
      .on('postgres_changes',{event:'*',schema:'public',table:'randcore_agent_runtime'},load)
      .subscribe()
    return ()=>{
      alive=false
      window.clearInterval(tick)
      supabase.removeChannel(channel)
    }
  },[])

  const agents=useMemo(()=>{
    const byId=new Map(rows.map(row=>[String(row.agent_id||'').toLowerCase(),row]))
    return AGENTS.map(agent=>{
      const row=byId.get(agent.id)||{}
      return {...agent,...row,status:deriveStatus(row,now)}
    })
  },[rows,now])

  const counts=useMemo(()=>agents.reduce((acc,a)=>{acc[a.status]=(acc[a.status]||0)+1;return acc},{}),[agents])
  const recent=useMemo(()=>[...agents]
    .filter(a=>a.heartbeat_at)
    .sort((a,b)=>new Date(b.heartbeat_at)-new Date(a.heartbeat_at))
    .slice(0,8),[agents])

  return <main className="app">
    <header className="topbar">
      <div className="brand"><span className="logo">R</span><div><strong>RandAILive</strong><small>AI HOTEL WORLD</small></div><em>LIVE</em></div>
      <div className="metrics">
        <span><b>{counts.RUNNING||0}</b> al lavoro</span>
        <span><b>{counts.IDLE||0}</b> disponibili</span>
        <span><b>{counts.ERROR||0}</b> errori</span>
      </div>
    </header>

    {!supabase && <div className="config-banner">Modalità visuale: configura <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code> per collegare gli heartbeat reali.</div>}

    <section className="layout">
      <div className="world-card">
        <div className="world">
          <div className="stars">{Array.from({length:18},(_,i)=><i key={i}/>)}</div>
          <div className="hotel-title">RANDAPP HOTEL<small>10 AGENTS · ONE ECOSYSTEM</small></div>
          <div className="upper upper-left"/><div className="upper upper-right"/>
          <div className="elevator elevator-left">ELEVATOR</div><div className="elevator elevator-right">ELEVATOR</div>
          <div className="knowledge">KNOWLEDGE</div><div className="ops">OPS</div>
          <div className="radar"><i/></div>
          <div className="hub"><strong>RandApp Hub</strong><small>REAL-TIME ECOSYSTEM</small></div>
          <div className="floor-lines"/>
          <div className="plant plant-a">♣</div><div className="plant plant-b">♣</div>
          <div className="lounge"><i/><i/><i/></div>
          {agents.map(a=><Bot key={a.id} agent={a}/>)}
        </div>
        <footer className="legend">
          <span><i className="dot run"/>RUNNING: si muove e lavora</span>
          <span><i className="dot idle"/>IDLE: resta alla postazione</span>
          <span><i className="dot wait"/>WAITING: attende</span>
          <span><i className="dot err"/>ERROR: allarme</span>
          <span><i className="dot off"/>OFFLINE: si spegne</span>
        </footer>
      </div>

      <aside className="sidebar">
        <section className="panel">
          <header><strong>Attività live</strong><span>REALTIME</span></header>
          {recent.map(a=><div className="event" key={a.id}>
            <i style={{background:a.tone}}/>
            <div><b>{a.name}</b><p>{a.activity||label(a.status)}</p></div>
            <time>{new Date(a.heartbeat_at).toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'})}</time>
          </div>)}
          {!recent.length&&<p className="empty">Nessun heartbeat disponibile.</p>}
        </section>

        <section className="panel">
          <header><strong>Stato agenti</strong><span>{error?'ERRORE':'LIVE'}</span></header>
          {agents.map(a=><div className="status" key={a.id}>
            <span><i className={`dot ${a.status.toLowerCase()}`}/>{a.name}</span>
            <b>{label(a.status)}</b>
          </div>)}
        </section>
        {error&&<div className="error">{error}</div>}
      </aside>
    </section>
  </main>
}
