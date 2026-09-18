export const WORLD_ZONES = Object.freeze({
  lobby: { id:'lobby', label:'Lobby', x:50, y:59 },
  cafe: { id:'cafe', label:'Coffee Corner', x:12, y:82 },
  lounge: { id:'lounge', label:'Lounge', x:24, y:78 },
  reception: { id:'reception', label:'Reception AI', x:18, y:48 },
  planning: { id:'planning', label:'Planning Lab', x:31, y:39 },
  core: { id:'core', label:'Core Hub', x:50, y:45 },
  knowledge: { id:'knowledge', label:'Knowledge Library', x:69, y:38 },
  radar: { id:'radar', label:'Radar Deck', x:87, y:50 },
  research: { id:'research', label:'Research Desk', x:18, y:69 },
  security: { id:'security', label:'Secure Gate', x:34, y:70 },
  qa: { id:'qa', label:'QA Station', x:50, y:75 },
  ops: { id:'ops', label:'Ops Bay', x:68, y:70 },
  design: { id:'design', label:'Design Studio', x:84, y:68 },
  elevatorLeft: { id:'elevatorLeft', label:'Ascensore Ovest', x:8, y:53 },
  elevatorRight: { id:'elevatorRight', label:'Ascensore Est', x:92, y:53 },
})

const HOME = Object.freeze({
  randai:'reception', randbrain:'planning', randcore:'core', randmind:'knowledge', randradar:'radar',
  randresearch:'research', randsecure:'security', randtest:'qa', randops:'ops', randui:'design',
})

const SOCIAL = Object.freeze({
  randai:['lobby','cafe','core','lounge'],
  randbrain:['planning','knowledge','core','cafe'],
  randcore:['core','lobby','security','ops'],
  randmind:['knowledge','research','lounge','cafe'],
  randradar:['radar','lobby','research','cafe'],
  randresearch:['research','knowledge','lounge','cafe'],
  randsecure:['security','lobby','elevatorLeft','core'],
  randtest:['qa','ops','design','cafe'],
  randops:['ops','qa','core','cafe'],
  randui:['design','lounge','qa','cafe'],
})

function hash(text){
  let h=2166136261
  for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619)}
  return h>>>0
}

function pick(list, seed){ return list[seed % list.length] }

export function buildLifeState(agent, now=Date.now()){
  const status=agent.status
  if(status==='OFFLINE') return { mode:'OFFLINE', zone:HOME[agent.id], action:'Spento' }
  if(status==='ERROR') return { mode:'ALERT', zone: agent.id==='randsecure' ? 'security' : 'core', action:agent.detail||'Diagnostica errore' }
  if(status==='WAITING_APPROVAL') return { mode:'WAIT', zone:'lobby', action:'Attende approvazione' }
  if(status==='RUNNING'){
    return { mode:'WORK', zone:HOME[agent.id], action:agent.activity||'Task reale in corso' }
  }

  const slot=Math.floor(now/12000)
  const seq=SOCIAL[agent.id]||['lobby']
  const seed=hash(`${agent.id}:${slot}`)
  const zone=pick(seq,seed)
  const actions={
    cafe:['Prende un caffè','Pausa rapida','Scambia due parole'],
    lounge:['Si rilassa','Osserva la hall','Chiama un collega'],
    lobby:['Fa un giro','Controlla la hall','Incrocia gli altri agenti'],
    knowledge:['Consulta la memoria','Legge documenti','Riordina conoscenza'],
    research:['Sfoglia fonti','Confronta note','Cerca segnali'],
    security:['Fa una ronda','Controlla accessi','Ispeziona il checkpoint'],
    qa:['Guarda i test','Controlla checklist','Parla con RandOps'],
    ops:['Controlla i server','Guarda la coda deploy','Fa manutenzione'],
    design:['Rivede la UI','Sistema dettagli','Prova un layout'],
    core:['Controlla il sistema','Coordina la hall','Bilancia il lavoro'],
    planning:['Pensa','Rivede un piano','Disegna una strategia'],
    radar:['Osserva il radar','Fa una scansione visiva','Controlla segnali'],
    reception:['Accoglie','Controlla richieste','Parla con gli altri'],
  }
  return { mode:'WANDER', zone, action:pick(actions[zone]||['Passeggia'],seed>>4) }
}

export function zoneFor(agent, now=Date.now()){
  const life=buildLifeState(agent,now)
  return { ...WORLD_ZONES[life.zone], ...life }
}
