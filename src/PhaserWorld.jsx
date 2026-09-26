import { useEffect, useRef, useState } from 'react'
import { ISO_MAPS, mapById } from './iso/iso-world.js'
import './phaser-world.css'

export function PhaserWorld({ agents, issues = [], selectedId, onSelect, onSelectIssue, director }) {
  const hostRef = useRef(null)
  const gameRef = useRef(null)
  const sceneRef = useRef(null)
  const [activeMap, setActiveMap] = useState('ground')
  const [floorsOpen, setFloorsOpen] = useState(false)

  useEffect(() => {
    if (!hostRef.current) return undefined
    let disposed = false
    import('./phaser-world.js').then(({ createLivingWorldGame }) => {
      if (disposed || !hostRef.current) return
      gameRef.current = createLivingWorldGame(hostRef.current, {
        agents,
        issues,
        onSelect,
        onSelectIssue,
        initialMapId: activeMap,
        onElevator: () => setFloorsOpen(true),
        onMapChanged: setActiveMap,
        onSceneReady: scene => { sceneRef.current = scene },
      })
    })
    return () => {
      disposed = true
      sceneRef.current = null
      gameRef.current?.destroy(true)
      gameRef.current = null
    }
  }, [])

  useEffect(() => {
    const scene = sceneRef.current || gameRef.current?.scene.getScene('LivingWorld')
    if (!scene || !scene.sys?.isActive()) return
    sceneRef.current = scene
    scene.setAgents(agents)
  }, [agents])

  useEffect(() => {
    const scene = sceneRef.current || gameRef.current?.scene.getScene('LivingWorld')
    if (!scene || !scene.sys?.isActive()) return
    scene.setClients(issues)
  }, [issues])

  useEffect(() => {
    const scene = sceneRef.current || gameRef.current?.scene.getScene('LivingWorld')
    if (scene?.sys?.isActive()) scene.updateSelection(selectedId)
  }, [selectedId])

  useEffect(() => {
    const scene = sceneRef.current || gameRef.current?.scene.getScene('LivingWorld')
    if (scene?.sys?.isActive()) scene.setDirector(director)
  }, [director])

  useEffect(() => {
    const scene = sceneRef.current || gameRef.current?.scene.getScene('LivingWorld')
    if (scene?.sys?.isActive()) scene.setActiveMap(activeMap)
  }, [activeMap])

  const chooseFloor = id => { setActiveMap(id); setFloorsOpen(false) }
  return <div className="phaser-shell">
    <div className="world-toolbar">
      <button className="floor-trigger" type="button" onClick={() => setFloorsOpen(value => !value)} aria-expanded={floorsOpen}>
        <span>ASCENSORI</span><strong>{mapById(activeMap).shortLabel}</strong><i>{floorsOpen?'×':'⌄'}</i>
      </button>
      <div className="truth-badges"><span className="truth-live">LIVE · dati runtime</span><span className="truth-sim">SIM · vita locale</span></div>
    </div>
    {floorsOpen&&<div className="floor-picker" role="dialog" aria-label="Seleziona piano dell'hotel">
      <header><b>Ascensori Hotel Giò</b><small>Ogni piano è una mappa separata</small></header>
      <div>{ISO_MAPS.map(map=><button key={map.id} className={map.id===activeMap?'active':''} type="button" onClick={()=>chooseFloor(map.id)}><span>{map.level===0?'PT':map.level}</span><b>{map.shortLabel}</b></button>)}</div>
    </div>}
    <div className="phaser-world" ref={hostRef} role="application" aria-label={`Mappa 2.5D interattiva: ${mapById(activeMap).label}`} />
  </div>
}
