import { GAME_ACTIONS } from './game-engine.js'

const percent = (value) => `${Math.round(value)}%`

export function GameHud({ agent, stat, day, quest, log, hotel, onAction }) {
  if (!agent || !stat) return null
  const moodLabel = stat.mood > 75 ? 'Felice' : stat.mood > 45 ? 'Serena' : 'Stanca'
  const xpNeed = stat.level * 100
  return <section className="game-panel panel">
    <header><strong>Vita dell’AI</strong><span>GIORNO {day}</span></header>
    <div className="game-agent-head">
      <div className="game-avatar" style={{ '--tone': agent.tone }}>{agent.glyph}</div>
      <div><h2>{agent.name}</h2><p>{agent.role || 'AI del Rand Hotel'}</p><small>Livello {stat.level} · {moodLabel}</small></div>
    </div>

    {hotel && <div className="hotel-status">
      <div><span>Turno</span><b>{hotel.shift}</b></div>
      <div><span>Evento</span><b>{hotel.event?.icon} {hotel.event?.label}</b></div>
      <div><span>Reputazione</span><b>{hotel.reputation}/100</b></div>
      <div><span>Servizio</span><b>{hotel.service}/100</b></div>
      <div><span>Ospiti</span><b>{hotel.guestMood}/100</b></div>
      <div><span>Crediti</span><b>{hotel.credits}</b></div>
    </div>}

    <div className="game-stat"><span>Energia <b>{percent(stat.energy)}</b></span><i><em style={{ width: percent(stat.energy) }} /></i></div>
    <div className="game-stat"><span>Umore <b>{percent(stat.mood)}</b></span><i className="mood"><em style={{ width: percent(stat.mood) }} /></i></div>
    <div className="game-stat"><span>Conoscenza <b>LV {stat.knowledge}</b></span><i className="knowledge"><em style={{ width: `${Math.min(100, stat.knowledge * 10)}%` }} /></i></div>
    <div className="xp-line"><span>Esperienza</span><b>{stat.xp}/{xpNeed} XP</b></div>
    <div className="xp-track"><i style={{ width: `${Math.min(100, stat.xp / xpNeed * 100)}%` }} /></div>

    <div className="quest-box"><strong>✦ Obiettivo hotel</strong><b>{quest.title}</b><p>{quest.detail}</p><small>□ {quest.progress}/{quest.target}</small></div>

    <div className="game-actions">
      {Object.entries(GAME_ACTIONS).map(([id, action]) => <button key={id} className={`game-action game-action--${id}`} onClick={() => onAction(id)}>
        <strong>{action.icon} {action.label}</strong>
        <small>{id === 'explore' ? 'Scopri aree e opportunità' : id === 'train' ? 'Aumenta abilità' : id === 'assist' ? 'Migliora servizio e ospiti' : id === 'inspect' ? 'Aumenta sicurezza e qualità' : 'Recupera energia'}</small>
      </button>)}
    </div>

    <div className="inventory"><span>Inventario</span><b>✦ {stat.inventory.spark}</b><b>⌁ {stat.inventory.seed}</b><b>▣ {stat.inventory.module}</b></div>
    <div className="game-log">{log.map((line, index) => <p key={`${line}-${index}`}>{line}</p>)}</div>
  </section>
}
