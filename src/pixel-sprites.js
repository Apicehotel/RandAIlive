/** Procedural pixel identities matching the Rand concept sheets. */

export const AGENT_LOOKS = Object.freeze({
  randai: { accent: 0x56b7ff, prop: 'laptop', hat: 'headset', motto: 'GUIDE' },
  randbrain: { accent: 0xb981ff, prop: 'tablet', hat: 'brain', motto: 'PLAN' },
  randcore: { accent: 0xffad42, prop: 'core', hat: 'none', motto: 'POWER' },
  randmind: { accent: 0x64d98b, prop: 'book', hat: 'hood', motto: 'REMEMBER' },
  randradar: { accent: 0xff5c62, prop: 'scanner', hat: 'dish', motto: 'SCAN' },
  randresearch: { accent: 0x7fc8ff, prop: 'glass', hat: 'goggles', motto: 'EXPLORE' },
  randsecure: { accent: 0xff6464, prop: 'shield', hat: 'helmet', motto: 'PROTECT' },
  randtest: { accent: 0xe8d84b, prop: 'clipboard', hat: 'cap', motto: 'VERIFY' },
  randops: { accent: 0x4fdbe8, prop: 'wrench', hat: 'cap', motto: 'DEPLOY' },
  randui: { accent: 0xff74d3, prop: 'stylus', hat: 'ears', motto: 'DELIGHT' },
})

const CATEGORY_EMOJI = [
  [/idraul|acqua|bagno|perdit|wc|rubinet/i, '💧'],
  [/elettr|luce|lampad|presa|corrente|quadro/i, '⚡'],
  [/clim|condizion|riscald|calorifer|term|fredd|caldo/i, '❄️'],
  [/wifi|rete|tv|telecom|internet|router/i, '📶'],
  [/puliz|sporc|macchia|rifiut|spazz/i, '🧹'],
  [/biancher|asciugam|lenzuol|lavander/i, '🧺'],
  [/porta|serratur|chiav|accesso|badge/i, '🔑'],
  [/ascensor|montacaric/i, '🛗'],
  [/rumor|odore|insett|animal/i, '⚠️'],
  [/arred|mobile|specchio|tenda/i, '🛋️'],
]

export function problemEmoji(issue) {
  const hay = `${issue?.categoria || ''} ${issue?.note || ''} ${issue?.camera || ''}`
  for (const [re, emoji] of CATEGORY_EMOJI) {
    if (re.test(hay)) return emoji
  }
  const urgency = String(issue?.urgenza || 'media').toLowerCase()
  if (urgency === 'alta') return '❗'
  if (urgency === 'bassa') return '💬'
  return '🔧'
}

export function urgencyAura(urgency) {
  const key = String(urgency || 'media').toLowerCase()
  if (key === 'alta') return { color: 0xff3b4a, alpha: 0.42, pulse: 0.55, label: 'CRITICA' }
  if (key === 'bassa') return { color: 0x4fdbe8, alpha: 0.18, pulse: 0.18, label: 'CALMA' }
  return { color: 0xffc14f, alpha: 0.28, pulse: 0.34, label: 'AGITATA' }
}

export function clientLane(issue, index) {
  const state = String(issue?.stato || 'todo')
  const lane = index % 7
  if (state === 'waiting') return { x: 560 + (lane % 4) * 48, y: 430 + (index % 2) * 36 }
  if (state === 'tecnico') return { x: 980 + (index % 3) * 42, y: 360 + (index % 4) * 38 }
  return { x: 120 + (lane % 5) * 44, y: 200 + (index % 3) * 36 }
}
