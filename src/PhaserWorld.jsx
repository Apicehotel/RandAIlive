import { useEffect, useRef } from 'react'
import './phaser-world.css'

export function PhaserWorld({ agents, issues = [], selectedId, onSelect, onSelectIssue, director }) {
  const hostRef = useRef(null)
  const gameRef = useRef(null)
  const sceneRef = useRef(null)

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

  return <div className="phaser-world" ref={hostRef} role="application" aria-label="Mappa 2D interattiva della hall RandAILive" />
}
