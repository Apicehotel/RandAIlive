import { HOTEL_OBJECTIVES, getEventForDay } from './hotel-world.js'

export const GAME_ACTIONS = Object.freeze({
  explore: { label: 'Esplora', icon: '◈', energy: -10, mood: 5, xp: 20, service: 1 },
  train: { label: 'Allena', icon: '✦', energy: -18, mood: -2, xp: 45, service: 0 },
  assist: { label: 'Aiuta', icon: '♥', energy: -14, mood: 4, xp: 30, service: 3 },
  inspect: { label: 'Ispeziona', icon: '⌕', energy: -12, mood: 1, xp: 28, service: 2 },
  rest: { label: 'Riposa', icon: '☾', energy: 28, mood: 8, xp: 5, service: 0 },
})

const STORAGE_KEY = 'randailive-life-v2'
const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

function initialHotelState(){
  return {
    reputation: 50,
    service: 62,
    cleanliness: 74,
    safety: 78,
    guestMood: 68,
    credits: 250,
    completedQuests: 0,
    visitedAreas: ['lobby'],
    shift: 'Mattina',
    event: getEventForDay(1),
  }
}

function objectiveFor(index=0){
  return HOTEL_OBJECTIVES[Math.min(index,HOTEL_OBJECTIVES.length-1)]
}

export function createGameState(agentIds) {
  const stats = Object.fromEntries(agentIds.map((id) => [id, {
    level: 1,
    xp: 0,
    energy: 78,
    mood: 72,
    knowledge: 1,
    inventory: { spark: 3, seed: 1, module: 1 },
  }]))
  const first=objectiveFor(0)
  return {
    day: 1,
    selected: agentIds[0] || 'randai',
    stats,
    hotel: initialHotelState(),
    objectiveIndex: 0,
    quest: { title: first.title, detail: first.detail, progress: 0, target: first.target, id:first.id },
    log: ['Benvenuto all’Hotel Giò. Gestisci il turno, le AI e le richieste degli ospiti.'],
  }
}

export function loadGameState(agentIds) {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    if (!saved?.stats) return createGameState(agentIds)
    const fresh = createGameState(agentIds)
    return {
      ...fresh,
      ...saved,
      hotel:{...fresh.hotel,...(saved.hotel||{})},
      stats: Object.fromEntries(agentIds.map((id) => [id, {
        ...fresh.stats[id],
        ...(saved.stats[id] || {}),
        inventory: { ...fresh.stats[id].inventory, ...(saved.stats[id]?.inventory || {}) },
      }])),
    }
  } catch {
    return createGameState(agentIds)
  }
}

export function saveGameState(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch { /* private mode */ }
}

function nextShift(day){
  return ['Mattina','Pomeriggio','Sera'][(day-1)%3]
}

function advanceObjective(state, amount, agentName){
  const progress=clamp(state.quest.progress+amount,0,state.quest.target)
  if(progress<state.quest.target) return {...state,quest:{...state.quest,progress}}

  const current=objectiveFor(state.objectiveIndex)
  const reward=current.reward||{credits:0,reputation:0}
  const nextIndex=Math.min(state.objectiveIndex+1,HOTEL_OBJECTIVES.length-1)
  const next=objectiveFor(nextIndex)
  return {
    ...state,
    objectiveIndex:nextIndex,
    hotel:{
      ...state.hotel,
      credits:state.hotel.credits+(reward.credits||0),
      reputation:clamp(state.hotel.reputation+(reward.reputation||0),0,100),
    },
    quest:{title:next.title,detail:next.detail,progress:0,target:next.target,id:next.id},
    log:[`Obiettivo completato da ${agentName}: ${current.title}. Premio +${reward.credits||0} crediti.`,...state.log].slice(0,8),
  }
}

export function visitArea(state, areaId){
  if(!areaId)return state
  const visited=[...new Set([...(state.hotel?.visitedAreas||[]),areaId])]
  let next={...state,hotel:{...state.hotel,visitedAreas:visited}}
  if(state.quest?.id==='hotel-flow'){
    next={...next,quest:{...state.quest,progress:Math.min(state.quest.target,visited.length)}}
  }
  return next
}

export function registerMaintenanceQuest(state, completed=true){
  if(!completed)return state
  let next={
    ...state,
    hotel:{
      ...state.hotel,
      completedQuests:(state.hotel.completedQuests||0)+1,
      service:clamp(state.hotel.service+3,0,100),
      guestMood:clamp(state.hotel.guestMood+2,0,100),
      reputation:clamp(state.hotel.reputation+1,0,100),
      credits:state.hotel.credits+35,
    }
  }
  if(state.quest?.id==='guest-care') next=advanceObjective(next,1,'Squadra manutenzione')
  return next
}

export function performAction(state, agentId, actionId, agentName) {
  const action = GAME_ACTIONS[actionId]
  if (!action) return state
  const current = state.stats[agentId] || createGameState([agentId]).stats[agentId]
  if (actionId !== 'rest' && current.energy < Math.abs(action.energy)) return {
    ...state,
    log: [`${agentName} è stanca: serve una pausa.`, ...state.log].slice(0, 8),
  }

  const need=current.level*100
  const rawXp=current.xp+action.xp
  const leveled=rawXp>=need
  const level=current.level+(leveled?1:0)
  const xp=leveled?rawXp-need:rawXp
  const nextStat={
    ...current,
    level,
    xp,
    energy:clamp(current.energy+action.energy,0,100),
    mood:clamp(current.mood+action.mood,0,100),
    knowledge:clamp(current.knowledge+(actionId==='train'?1:0),1,99),
    inventory:{
      ...current.inventory,
      spark:current.inventory.spark+(actionId==='explore'?1:0),
      seed:current.inventory.seed+(actionId==='assist'?1:0),
      module:current.inventory.module+(actionId==='inspect'&&leveled?1:0),
    },
  }

  const day=actionId==='rest'?state.day+1:state.day
  const hotel={
    ...state.hotel,
    service:clamp(state.hotel.service+(action.service||0),0,100),
    guestMood:clamp(state.hotel.guestMood+(actionId==='assist'?2:actionId==='rest'?1:0),0,100),
    safety:clamp(state.hotel.safety+(actionId==='inspect'?2:0),0,100),
    cleanliness:clamp(state.hotel.cleanliness+(actionId==='inspect'?1:0),0,100),
    shift:nextShift(day),
    event:getEventForDay(day),
  }

  const verb={
    explore:'ha esplorato l’hotel e trovato una scintilla',
    train:'ha migliorato le proprie capacità',
    assist:'ha aiutato il team e gli ospiti',
    inspect:'ha completato un controllo',
    rest:'si è ricaricata per il turno successivo',
  }[actionId]

  let nextState={
    ...state,
    day,
    selected:agentId,
    stats:{...state.stats,[agentId]:nextStat},
    hotel,
    log:[`${agentName} ${verb}.`,...state.log].slice(0,8),
  }

  if(state.quest?.id==='first-shift') nextState=advanceObjective(nextState,1,agentName)
  if(state.quest?.id==='ai-team'){
    const levelTwo=Object.values(nextState.stats).filter(stat=>stat.level>=2).length
    nextState={...nextState,quest:{...nextState.quest,progress:Math.min(nextState.quest.target,levelTwo)}}
    if(levelTwo>=nextState.quest.target) nextState=advanceObjective(nextState,0,agentName)
  }

  return nextState
}
