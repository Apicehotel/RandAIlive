export const GAME_ACTIONS = Object.freeze({
  explore: { label: 'Esplora', icon: '◈', energy: -10, mood: 5, xp: 20 },
  train: { label: 'Allena', icon: '✦', energy: -18, mood: -2, xp: 45 },
  rest: { label: 'Riposa', icon: '☾', energy: 28, mood: 8, xp: 5 },
})

const STORAGE_KEY = 'randailive-life-v1'
const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

export function createGameState(agentIds) {
  const stats = Object.fromEntries(agentIds.map((id) => [id, {
    level: 1,
    xp: 0,
    energy: 78,
    mood: 72,
    knowledge: 1,
    inventory: { spark: 3, seed: 1, module: 1 },
  }]))
  return {
    day: 1,
    selected: agentIds[0] || 'randai',
    stats,
    quest: { title: 'Conosci la hall', detail: 'Fai vivere la tua prima AI', progress: 0, target: 3 },
    log: ['Benvenuto nella hall. Scegli un’AI e aiutala a crescere.'],
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

export function performAction(state, agentId, actionId, agentName) {
  const action = GAME_ACTIONS[actionId]
  if (!action) return state
  const current = state.stats[agentId] || createGameState([agentId]).stats[agentId]
  if (actionId !== 'rest' && current.energy < Math.abs(action.energy)) return {
    ...state,
    log: [`${agentName} è stanca: serve una pausa.`, ...state.log].slice(0, 6),
  }
  const rawXp = current.xp + action.xp
  const level = current.level + Math.floor(rawXp / (current.level * 100))
  const xp = rawXp >= current.level * 100 ? rawXp - (current.level * 100) : rawXp
  const next = {
    ...current,
    level,
    xp,
    energy: clamp(current.energy + action.energy, 0, 100),
    mood: clamp(current.mood + action.mood, 0, 100),
    knowledge: clamp(current.knowledge + (actionId === 'train' ? 1 : 0), 1, 99),
    inventory: { ...current.inventory, spark: current.inventory.spark + (actionId === 'explore' ? 1 : 0) },
  }
  const progress = clamp(state.quest.progress + (actionId === 'explore' ? 1 : 0), 0, state.quest.target)
  const questDone = progress >= state.quest.target && state.quest.progress < state.quest.target
  const message = questDone
    ? `Missione completata: ${agentName} ha conosciuto la hall.`
    : `${agentName} ${actionId === 'explore' ? 'ha trovato una scintilla' : actionId === 'train' ? 'ha imparato qualcosa' : 'si è ricaricata'}.`
  return {
    ...state,
    day: actionId === 'rest' ? state.day + 1 : state.day,
    selected: agentId,
    stats: { ...state.stats, [agentId]: next },
    quest: { ...state.quest, progress },
    log: [message, ...state.log].slice(0, 6),
  }
}
