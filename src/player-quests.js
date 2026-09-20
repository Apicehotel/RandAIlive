const PLAYER_KEY='randailive-player-v1'

export function createPlayerState(name='Randagio'){
 return {name,activeIssueId:null,completedIssueIds:[],log:['Sei entrato nella hall: scegli una segnalazione per iniziare una quest.']}
}

export function loadPlayerState(){
 try{
  const saved=JSON.parse(localStorage.getItem(PLAYER_KEY)||'null')
  return {...createPlayerState(),...(saved||{}),completedIssueIds:Array.isArray(saved?.completedIssueIds)?saved.completedIssueIds:[]}
 }catch{return createPlayerState()}
}

export function savePlayerState(state){try{localStorage.setItem(PLAYER_KEY,JSON.stringify(state))}catch{/* private mode */}}

export function startQuest(state,issue){
 if(!issue?.id)return state
 return {...state,activeIssueId:issue.id,log:[`Quest presa: ${issue.camera||'segnalazione'} · ${issue.categoria||'manutenzione'}`,...state.log].slice(0,8)}
}

export function finishQuest(state,issue){
 if(!issue?.id)return state
 return {...state,activeIssueId:null,completedIssueIds:[...new Set([...state.completedIssueIds,issue.id])],log:[`Quest completata: ${issue.camera||'segnalazione'}`,...state.log].slice(0,8)}
}
