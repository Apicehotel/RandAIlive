export const HOTEL_AREAS = Object.freeze({
  lobby: { id: 'lobby', label: 'Lobby', floor: 0, type: 'public', x: 50, y: 52 },
  reception: { id: 'reception', label: 'Reception', floor: 0, type: 'public', x: 18, y: 28 },
  bar: { id: 'bar', label: 'Bar & Lounge', floor: 0, type: 'public', x: 48, y: 24 },
  breakfast: { id: 'breakfast', label: 'Sala Colazione', floor: 0, type: 'fb', x: 76, y: 25 },
  kitchen: { id: 'kitchen', label: 'Cucina', floor: 0, type: 'service', x: 91, y: 25 },
  congress: { id: 'congress', label: 'Sala Congressi', floor: 0, type: 'events', x: 16, y: 72 },
  meeting: { id: 'meeting', label: 'Sale Meeting', floor: 0, type: 'events', x: 38, y: 72 },
  hub: { id: 'hub', label: 'RandApp Hub', floor: 0, type: 'ai', x: 50, y: 49 },
  spa: { id: 'spa', label: 'Spa & Wellness', floor: 0, type: 'wellness', x: 74, y: 72 },
  gym: { id: 'gym', label: 'Palestra', floor: 0, type: 'wellness', x: 88, y: 72 },
  jazz1: { id: 'jazz1', label: 'Jazz · Piano 1', floor: 1, type: 'rooms', x: 18, y: 30 },
  jazz2: { id: 'jazz2', label: 'Jazz · Piano 2', floor: 2, type: 'rooms', x: 38, y: 30 },
  jazz3: { id: 'jazz3', label: 'Jazz · Piano 3', floor: 3, type: 'rooms', x: 58, y: 30 },
  jazz4: { id: 'jazz4', label: 'Jazz · Piano 4', floor: 4, type: 'rooms', x: 78, y: 30 },
  wine5: { id: 'wine5', label: 'Wine · Piano 5', floor: 5, type: 'rooms', x: 18, y: 62 },
  wine6: { id: 'wine6', label: 'Wine · Piano 6', floor: 6, type: 'rooms', x: 38, y: 62 },
  wine7: { id: 'wine7', label: 'Wine · Piano 7', floor: 7, type: 'rooms', x: 58, y: 62 },
  wine8: { id: 'wine8', label: 'Wine · Piano 8', floor: 8, type: 'rooms', x: 78, y: 62 },
  laundry: { id: 'laundry', label: 'Lavanderia', floor: -1, type: 'service', x: 18, y: 82 },
  ironing: { id: 'ironing', label: 'Stireria', floor: -1, type: 'service', x: 34, y: 82 },
  warehouse: { id: 'warehouse', label: 'Magazzino', floor: -1, type: 'service', x: 50, y: 82 },
  technical: { id: 'technical', label: 'Area Tecnica', floor: -1, type: 'service', x: 66, y: 82 },
  staff: { id: 'staff', label: 'Spogliatoi Staff', floor: -1, type: 'service', x: 82, y: 82 },
  exterior: { id: 'exterior', label: 'Ingresso & Parcheggio', floor: 0, type: 'exterior', x: 50, y: 92 },
})

export const FLOOR_GROUPS = Object.freeze([
  { id: 'ground', label: 'Piano Terra', areas: ['lobby','reception','bar','breakfast','kitchen','congress','meeting','hub','spa','gym','exterior'] },
  { id: 'jazz', label: 'Jazz', areas: ['jazz1','jazz2','jazz3','jazz4'] },
  { id: 'wine', label: 'Wine', areas: ['wine5','wine6','wine7','wine8'] },
  { id: 'service', label: 'Servizi', areas: ['laundry','ironing','warehouse','technical','staff'] },
])

export const HOTEL_OBJECTIVES = Object.freeze([
  { id: 'first-shift', title: 'Primo turno', detail: 'Completa 3 azioni senza esaurire l’energia.', target: 3, reward: { credits: 100, reputation: 2 } },
  { id: 'guest-care', title: 'Ospiti felici', detail: 'Risolvi 3 quest manutenzione.', target: 3, reward: { credits: 180, reputation: 4 } },
  { id: 'hotel-flow', title: 'Hotel in movimento', detail: 'Visita 6 aree differenti.', target: 6, reward: { credits: 220, reputation: 5 } },
  { id: 'ai-team', title: 'Squadra completa', detail: 'Porta 3 AI al livello 2.', target: 3, reward: { credits: 300, reputation: 8 } },
])

export const HOTEL_EVENTS = Object.freeze([
  { id: 'checkin-wave', label: 'Ondata check-in', area: 'reception', pressure: 2, icon: '🛎️' },
  { id: 'breakfast-rush', label: 'Rush colazione', area: 'breakfast', pressure: 2, icon: '☕' },
  { id: 'meeting-change', label: 'Cambio sala', area: 'meeting', pressure: 3, icon: '🎤' },
  { id: 'room-turnover', label: 'Riassetto camere', area: 'jazz2', pressure: 2, icon: '🛏️' },
  { id: 'wine-supply', label: 'Rifornimento Wine', area: 'wine6', pressure: 2, icon: '🧺' },
  { id: 'technical-alert', label: 'Allarme tecnico', area: 'technical', pressure: 4, icon: '🔧' },
])

export const AGENT_HOME_AREAS = Object.freeze({
  randai: 'reception',
  randbrain: 'meeting',
  randcore: 'hub',
  randmind: 'warehouse',
  randradar: 'exterior',
  randresearch: 'congress',
  randsecure: 'lobby',
  randtest: 'technical',
  randops: 'technical',
  randui: 'bar',
})

export const AGENT_ROUTES = Object.freeze({
  randai: ['reception','lobby','bar','meeting','hub'],
  randbrain: ['meeting','congress','bar','hub','jazz1'],
  randcore: ['hub','reception','technical','lobby','warehouse'],
  randmind: ['warehouse','jazz2','wine6','meeting','bar'],
  randradar: ['exterior','lobby','reception','technical','bar'],
  randresearch: ['congress','meeting','breakfast','jazz3','hub'],
  randsecure: ['lobby','exterior','reception','technical','hub'],
  randtest: ['technical','jazz4','wine8','meeting','hub'],
  randops: ['technical','warehouse','laundry','wine5','hub'],
  randui: ['bar','lobby','spa','meeting','hub'],
})

export function getHotelArea(id) {
  return HOTEL_AREAS[id] || HOTEL_AREAS.hub
}

export function getEventForDay(day = 1) {
  return HOTEL_EVENTS[(Math.max(1, day) - 1) % HOTEL_EVENTS.length]
}
