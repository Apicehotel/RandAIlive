import { AGENT_HOME_AREAS, AGENT_ROUTES, HOTEL_AREAS, getHotelArea } from './hotel-world.js'
import { liveDirectiveFor } from './living-runtime.js'

export const WORLD_ZONES = HOTEL_AREAS

function hash(text){
  let h=2166136261
  for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619)}
  return h>>>0
}

function pick(list, seed){ return list[seed % list.length] }

const ACTIONS = Object.freeze({
  lobby:['Accoglie gli ospiti','Controlla la hall','Incrocia la squadra'],
  reception:['Supporta il check-in','Controlla le richieste','Aiuta la reception'],
  bar:['Fa una pausa','Parla con la squadra','Osserva il flusso ospiti'],
  breakfast:['Controlla la colazione','Verifica il servizio','Aiuta il team F&B'],
  kitchen:['Controlla la cucina','Verifica una richiesta','Coordina il servizio'],
  congress:['Prepara un evento','Controlla la sala','Analizza il programma'],
  meeting:['Rivede il planning','Prepara una sala','Coordina un incontro'],
  hub:['Coordina il sistema','Controlla il RandApp Hub','Condivide informazioni'],
  spa:['Controlla l’area wellness','Verifica il comfort','Fa un giro in spa'],
  gym:['Controlla la palestra','Verifica le attrezzature','Fa un’ispezione'],
  jazz1:['Controlla il piano Jazz','Verifica le camere','Controlla un office'],
  jazz2:['Rifornisce il piano Jazz','Verifica le camere','Controlla un office'],
  jazz3:['Controlla il piano Jazz','Analizza il flusso camere','Aiuta ai piani'],
  jazz4:['Verifica il piano Jazz','Controlla un’anomalia','Aiuta ai piani'],
  wine5:['Controlla il piano Wine','Rifornisce un office','Verifica le camere'],
  wine6:['Controlla il piano Wine','Rifornisce un office','Verifica le camere'],
  wine7:['Controlla il piano Wine','Analizza il flusso camere','Aiuta ai piani'],
  wine8:['Verifica il piano Wine','Controlla un’anomalia','Aiuta ai piani'],
  laundry:['Controlla la lavanderia','Verifica la biancheria','Coordina i rifornimenti'],
  ironing:['Controlla la stireria','Verifica la biancheria','Aiuta il servizio'],
  warehouse:['Controlla il magazzino','Riordina le scorte','Cerca materiale'],
  technical:['Fa manutenzione','Controlla gli impianti','Verifica un allarme'],
  staff:['Passa dagli spogliatoi','Controlla il turno','Incontra la squadra'],
  exterior:['Controlla l’ingresso','Fa una ronda esterna','Osserva il parcheggio'],
})

export function buildLifeState(agent, now=Date.now(), context={}){
  const live=liveDirectiveFor(agent, context.issues || [])
  if(live?.zone) return { mode:'LIVE', zone:live.zone, action:live.action, source:'LIVE', taskId:live.taskId || null, issueId:live.issueId || null }
  const status=agent.status
  const home=AGENT_HOME_AREAS[agent.id]||'hub'
  if(status==='OFFLINE') return { mode:'OFFLINE', zone:home, action:'Spento' }
  if(status==='ERROR') return { mode:'ALERT', zone:agent.id==='randsecure'?'lobby':'technical', action:agent.detail||'Diagnostica errore' }
  if(status==='WAITING_APPROVAL') return { mode:'WAIT', zone:'reception', action:'Attende approvazione' }
  if(status==='RUNNING') return { mode:'WORK', zone:home, action:live?.action||agent.activity||'Task reale in corso', source:live?.source||'LIVE', taskId:live?.taskId||agent.task_id||null }

  const slot=Math.floor(now/12000)
  const seq=AGENT_ROUTES[agent.id]||['hub']
  const seed=hash(`${agent.id}:${slot}`)
  const zone=pick(seq,seed)
  return { mode:'WANDER', zone, action:pick(ACTIONS[zone]||['Passeggia nell’hotel'],seed>>4), source:'DEMO' }
}

export function zoneFor(agent, now=Date.now(), context={}){
  const life=buildLifeState(agent,now,context)
  const area=getHotelArea(life.zone)
  return { ...area, ...life, id: life.zone, label: area.label }
}
