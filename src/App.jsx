import { useEffect, useMemo, useState } from 'react'
import { RANDAILIVE_HOTEL_ID, supabase } from './supabase.js'
import { zoneFor } from './behavior-engine.js'
import { MaintenancePanel, useMaintenanceClients } from './maintenance-clients.jsx'
import { GameHud } from './GameHud.jsx'
import { loadGameState, performAction, registerMaintenanceQuest, saveGameState, visitArea } from './game-engine.js'
import { PhaserWorld } from './PhaserWorld.jsx'
import { finishQuest, loadPlayerState, savePlayerState, startQuest } from './player-quests.js'
import { signInMaintainer, signOutMaintainer, useMaintainerAuth } from './maintainer-auth.jsx'
import './player-quests.css'
import './maintainer-auth.css'

const STALE_MS=5*60*1000
const AGENTS=[
['randai','RandAI','💬','#56b7ff','Esploratrice'],['randbrain','RandBrain','🧠','#b981ff','Stratega'],['randcore','RandCore','⚙','#ffad42','Custode'],['randmind','RandMind','▤','#64d98b','Memoria'],['randradar','RandRadar','◉','#ff5c62','Esploratore'],['randresearch','RandResearch','⌕','#7fc8ff','Ricercatrice'],['randsecure','RandSecure','🔒','#ff6464','Guardiana'],['randtest','RandTest','✓','#e8d84b','Collaudatore'],['randops','RandOps','🔧','#4fdbe8','Tecnico'],['randui','RandUI','✦','#ff74d3','Designer']
].map(([id,name,glyph,tone,role])=>({id,name,glyph,tone,role}))

function deriveStatus(row,now){
 const s=String(row?.status||'').toUpperCase()
 if(s==='ERROR'||s==='WAITING_APPROVAL')return s
 const hb=row?.heartbeat_at?new Date(row.heartbeat_at).getTime():NaN
 if(!Number.isFinite(hb)||now-hb>STALE_MS)return'OFFLINE'
 if(row?.task_id||s==='RUNNING')return'RUNNING'
 return'IDLE'
}
const label=s=>({RUNNING:'Al lavoro',IDLE:'Disponibile',WAITING_APPROVAL:'Attende',ERROR:'Errore',OFFLINE:'Offline'}[s]||s)

export default function App(){
 const [rows,setRows]=useState([]),[now,setNow]=useState(Date.now()),[error,setError]=useState(''),[focus,setFocus]=useState(null),[director,setDirector]=useState(true),[selectedIssue,setSelectedIssue]=useState(null)
 const [game,setGame]=useState(()=>loadGameState(AGENTS.map(a=>a.id)))
 const [player,setPlayer]=useState(()=>loadPlayerState())
 const [questMessage,setQuestMessage]=useState('')
 const {user,loading:authLoading}=useMaintainerAuth()
 const issues=useMaintenanceClients(user)
 useEffect(()=>{
  const tick=window.setInterval(()=>setNow(Date.now()),1000)
  if(!supabase||!user){setRows([]);return()=>window.clearInterval(tick)}
  let alive=true
  const load=async()=>{const {data,error:e}=await supabase.from('randcore_agent_runtime').select('agent_id,status,heartbeat_at,task_id,activity,detail,hotel_id,updated_at').eq('hotel_id',RANDAILIVE_HOTEL_ID).order('agent_id');if(!alive)return;if(e){setError(e.message);return}setError('');setRows(data||[])}
  load()
  const channel=supabase.channel('randailive-world').on('postgres_changes',{event:'*',schema:'public',table:'randcore_agent_runtime'},load).subscribe()
  return()=>{alive=false;window.clearInterval(tick);supabase.removeChannel(channel)}
 },[user])
 useEffect(()=>{saveGameState(game)},[game])
 useEffect(()=>{savePlayerState(player)},[player])
 const agents=useMemo(()=>{const byId=new Map(rows.map(r=>[String(r.agent_id||'').toLowerCase(),r]));return AGENTS.map(a=>{const row=byId.get(a.id)||{};const merged={...a,...row,status:deriveStatus(row,now)};return {...merged,life:zoneFor(merged,now,{issues})}})},[rows,now,issues])
 const counts=useMemo(()=>agents.reduce((m,a)=>(m[a.status]=(m[a.status]||0)+1,m),{}),[agents])
 const selected=agents.find(a=>a.id===focus)||null
 const gameAgent=agents.find(a=>a.id===game.selected)||agents[0]
 const selectAgent=(id)=>{const agent=agents.find(item=>item.id===id);setFocus(id);setGame(previous=>visitArea({...previous,selected:id},agent?.life?.id))}
 const act=(action)=>setGame(previous=>performAction(previous,gameAgent.id,action,gameAgent.name))
 const startPlayerQuest=async(issue)=>{
  if(!user)return
  const {error}=await supabase.from('segnalazioni').update({stato:'tecnico',tecnico_id:user.id,tecnico_nome:user.email||player.name}).eq('id',issue.id).eq('hotel_id',RANDAILIVE_HOTEL_ID).select('id').single()
  if(error){setQuestMessage(`Presa non autorizzata: ${error.message}`);return}
  setPlayer(previous=>startQuest(previous,issue));setQuestMessage(`Quest presa da ${user.email||player.name}. Salvata su RandApp.`)
 }
 const finishPlayerQuest=async(issue)=>{
  if(!user)return
  const {error}=await supabase.from('segnalazioni').update({stato:'done',completato_da:user.email||player.name,completato_il:new Date().toISOString(),nota_completamento:'Completata da RandAILive'}).eq('id',issue.id).eq('hotel_id',RANDAILIVE_HOTEL_ID).select('id').single()
  if(error){setQuestMessage(`Completamento non autorizzato: ${error.message}`);return}
  setPlayer(previous=>finishQuest(previous,issue));setGame(previous=>registerMaintenanceQuest(previous,true));setQuestMessage(`Quest completata da ${user.email||player.name}. Aggiornata su RandApp.`)
 }
 const login=async(event)=>{event.preventDefault();const form=new FormData(event.currentTarget);const {error}=await signInMaintainer(String(form.get('email')||''),String(form.get('password')||''));setQuestMessage(error?`Accesso negato: ${error.message}`:'Accesso manutentore riuscito.');if(!error)event.currentTarget.reset()}
 const mission=agents.find(a=>a.status==='ERROR')||agents.find(a=>a.status==='RUNNING')||agents.find(a=>a.status==='WAITING_APPROVAL')||null
 const encounters=useMemo(()=>{const groups=new Map();for(const a of agents){const k=a.life.id;if(!groups.has(k))groups.set(k,[]);groups.get(k).push(a)}return [...groups.values()].filter(g=>g.length>1)},[agents])
 return <main className="app">
  <header className="topbar"><div className="brand"><span className="logo">R</span><div><strong>RandAILive</strong><small>THE LIVING AI HOTEL</small></div><em>LIVE</em></div><div className="metrics"><span><b>{counts.RUNNING||0}</b> missioni</span><span><b>{issues.length}</b> clienti</span><span><b>{encounters.length}</b> incontri</span><span><b>{counts.ERROR||0}</b> allarmi</span><button onClick={()=>setDirector(v=>!v)}>{director?'Regia ON':'Regia OFF'}</button></div></header>
  {!supabase&&<div className="config-banner">Modalità demo comportamentale: collega Supabase per usare gli heartbeat reali.</div>}
  {mission&&<div className={`mission mission--${mission.status.toLowerCase()}`}><span>MISSION LIVE</span><strong>{mission.name}</strong><p>{mission.activity||mission.detail||label(mission.status)}</p></div>}
  <section className="layout">
   <div className="world-card">
    <PhaserWorld agents={agents} issues={issues.filter(issue=>!player.completedIssueIds.includes(issue.id))} selectedId={focus} onSelect={selectAgent} onSelectIssue={setSelectedIssue} director={director}/>
    <footer className="legend"><span>TRASCINA = camera</span><span>ROTELLINA = zoom</span><span>CLICCA AI = segui</span><span>AURA CLIENTE = urgenza · fumetto = problema</span><span>Punto 5 · quest manutentore</span></footer>
   </div>
   <aside className="sidebar">
    <GameHud agent={gameAgent} stat={game.stats[gameAgent.id]} day={game.day} quest={game.quest} log={game.log} hotel={game.hotel} onAction={act}/>
    <section className="panel"><header><strong>Regia</strong><span>{selected?'FOLLOW':'FREE CAM'}</span></header>{selected?<div className="profile"><div className="profile-icon" style={{'--tone':selected.tone}}>{selected.glyph}</div><h2>{selected.name}</h2><p>{selected.life.action}</p><small>{selected.life.label}</small><b>{label(selected.status)}</b><button onClick={()=>setFocus(null)}>Smetti di seguire</button></div>:<p className="empty">Tocca un agente nella hall.</p>}</section>
    <section className="panel"><header><strong>Vita nell’Hotel Giò</strong><span>12s CYCLE</span></header>{agents.map(a=><button className="life-row" key={a.id} onClick={()=>setFocus(a.id)}><i style={{background:a.tone}}/><span><b>{a.name}</b><small>{a.life.action}</small></span><em>{a.life.label}</em></button>)}</section>
    <section className="panel"><header><strong>Incontri</strong><span>{encounters.length}</span></header>{encounters.length?encounters.map((g,i)=><div className="event" key={i}><div><b>{g.map(a=>a.name).join(' + ')}</b><p>si sono incontrati in {g[0].life.label}</p></div></div>):<p className="empty">Nessun incontro in questo momento.</p>}</section>
    <section className="panel player-panel"><header><strong>Giocatore manutentore</strong><span>{user?.email||player.name}</span></header><p className="empty">Le AI sono NPC. Tu prendi le quest dei clienti e le svolgi.</p>{player.activeIssueId&&<p className="quest-active">Quest attiva: {issues.find(issue=>issue.id===player.activeIssueId)?.camera||'segnalazione'}</p>}</section>
    <section className="maintainer-auth"><h3>Accesso operativo</h3>{authLoading?<p>Verifica sessione…</p>:user?<div className="auth-user"><span className="auth-ok">Autenticato · {user.email}</span><button onClick={signOutMaintainer}>Esci</button></div>:<form onSubmit={login}><input name="email" type="email" autoComplete="username" placeholder="Email manutentore" required/><input name="password" type="password" autoComplete="current-password" placeholder="Password" required/><button type="submit">Accedi per sincronizzare</button><p>Hotel operativo: {RANDAILIVE_HOTEL_ID}. Senza sessione non vengono mostrate né modificate segnalazioni.</p></form>}</section>
    <MaintenancePanel issues={issues.filter(issue=>!player.completedIssueIds.includes(issue.id))} selected={selectedIssue} onSelect={setSelectedIssue} player={player} onStart={startPlayerQuest} onFinish={finishPlayerQuest} syncMessage={questMessage} canSync={Boolean(user)}/>
    {error&&<div className="error">{error}</div>}
   </aside>
  </section>
 </main>
}
