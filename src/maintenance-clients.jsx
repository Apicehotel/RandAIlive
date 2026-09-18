import { useEffect, useMemo, useState } from 'react'
import { supabase } from './supabase.js'

function npcPosition(issue,index){
  const state=String(issue.stato||'todo')
  const lane=index%7
  if(state==='waiting') return {x:12+(lane*9)%66,y:82-(index%2)*5}
  if(state==='tecnico') return {x:88-(index%3)*5,y:58+(index%4)*5}
  return {x:22+(lane*8)%58,y:57+(index%3)*7}
}

export function useMaintenanceClients(){
  const [issues,setIssues]=useState([])
  useEffect(()=>{
    if(!supabase)return undefined
    let alive=true
    const load=async()=>{
      const {data,error}=await supabase
        .from('segnalazioni')
        .select('id,hotel_id,camera,urgenza,categoria,stato,note,creato_il,tecnico_nome')
        .neq('stato','done')
        .order('creato_il',{ascending:true})
        .limit(24)
      if(!alive)return
      if(error){console.warn('RandAILive manutenzioni non disponibili',error);return}
      setIssues(data||[])
    }
    load()
    const channel=supabase.channel('randailive-maintenance-clients')
      .on('postgres_changes',{event:'*',schema:'public',table:'segnalazioni'},load)
      .subscribe()
    return()=>{alive=false;supabase.removeChannel(channel)}
  },[])
  return issues
}

export function MaintenanceClient({issue,index,onSelect}){
  const p=npcPosition(issue,index)
  const urgency=String(issue.urgenza||'media')
  const state=String(issue.stato||'todo')
  const mood=urgency==='alta'?'!':urgency==='bassa'?'·':'?'
  return <button className={'client client--'+state+' client--'+urgency} style={{'--cx':p.x+'%','--cy':p.y+'%'}} onClick={()=>onSelect(issue)}>
    <span className="client-mood">{mood}</span>
    <span className="client-head"/>
    <span className="client-body"/>
    <span className="client-legs"/>
    <small>{issue.camera||'Hotel'}</small>
  </button>
}

export function MaintenancePanel({issues,selected,onSelect}){
  const counts=useMemo(()=>({
    todo:issues.filter(i=>i.stato==='todo').length,
    waiting:issues.filter(i=>i.stato==='waiting').length,
    tecnico:issues.filter(i=>i.stato==='tecnico').length,
  }),[issues])
  return <section className="panel">
    <header><strong>Clienti = manutenzioni</strong><span>{issues.length} IN ATTESA</span></header>
    {selected?<div className="ticket-card">
      <button onClick={()=>onSelect(null)}>×</button>
      <strong>{selected.camera||'Segnalazione'}</strong>
      <em>{selected.categoria||'Varie'} · {selected.urgenza||'media'}</em>
      <p>{selected.note||'Nessuna descrizione'}</p>
      <small>{selected.stato==='todo'?'Aspetta di essere presa in carico':selected.stato==='waiting'?'Aspetta un pezzo o una decisione':selected.stato==='tecnico'?'Aspetta il tecnico '+(selected.tecnico_nome||'esterno'):'In attesa'}</small>
    </div>:<div className="ticket-summary">
      <p><b>{counts.todo}</b> in lobby</p>
      <p><b>{counts.waiting}</b> in attesa pezzo</p>
      <p><b>{counts.tecnico}</b> aspettano tecnico</p>
    </div>}
  </section>
}
