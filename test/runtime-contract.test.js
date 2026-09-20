import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createGameState, performAction } from '../src/game-engine.js'

test('live world uses real runtime table and realtime subscription', () => {
  const src = fs.readFileSync('src/App.jsx', 'utf8')
  assert.match(src, /randcore_agent_runtime/)
  assert.match(src, /postgres_changes/)
  assert.match(src, /RUNNING/)
  assert.match(src, /WAITING_APPROVAL/)
  assert.match(src, /OFFLINE/)
  assert.doesNotMatch(src, /Math\.random\(/)
})

test('all canonical runtime agents are represented', () => {
  const src = fs.readFileSync('src/App.jsx', 'utf8')
  for (const id of ['randai','randbrain','randcore','randmind','randradar','randresearch','randsecure','randtest','randops','randui']) {
    assert.match(src, new RegExp(id))
  }
})

test('pending maintenance issues become live client NPCs', () => {
  const clients = fs.readFileSync('src/maintenance-clients.jsx', 'utf8')
  const app = fs.readFileSync('src/App.jsx', 'utf8')
  assert.match(clients, /from\('segnalazioni'\)/)
  assert.match(clients, /neq\('stato','done'\)/)
  assert.match(clients, /randailive-maintenance-clients/)
  assert.match(clients, /postgres_changes/)
  assert.match(app, /MaintenanceClient/)
  assert.match(app, /MaintenancePanel/)
})

test('boot path is visible and React errors are not silent', () => {
  const main = fs.readFileSync('src/main.jsx', 'utf8')
  const html = fs.readFileSync('index.html', 'utf8')
  const vite = fs.readFileSync('vite.config.js', 'utf8')
  assert.match(main, /ErrorBoundary/)
  assert.match(html, /Avvio RandAILive/)
  assert.match(vite, /@vitejs\/plugin-react/)
})

test('AI life game grows a character and advances its quest', () => {
  const initial = createGameState(['randai'])
  const explored = performAction(initial, 'randai', 'explore', 'RandAI')
  const trained = performAction(explored, 'randai', 'train', 'RandAI')
  assert.equal(explored.stats.randai.inventory.spark, 4)
  assert.equal(explored.quest.progress, 1)
  assert.equal(trained.stats.randai.knowledge, 2)
  assert.ok(trained.stats.randai.xp > 0)
})

test('the human maintainer is the player and maintenance reports are quests',()=>{
 const app=fs.readFileSync('src/App.jsx','utf8')
 const clients=fs.readFileSync('src/maintenance-clients.jsx','utf8')
 const quests=fs.readFileSync('src/player-quests.js','utf8')
 assert.match(app,/Giocatore manutentore/)
 assert.match(app,/startQuest/)
 assert.match(app,/finishQuest/)
 assert.match(clients,/Prendi quest/)
 assert.match(clients,/Completa quest/)
 assert.match(quests,/localStorage/)
 assert.match(app,/Punto 5 · quest manutentore/)
})

test('operational quest sync is authenticated and hotel-scoped',()=>{
 const app=fs.readFileSync('src/App.jsx','utf8')
 const clients=fs.readFileSync('src/maintenance-clients.jsx','utf8')
 const auth=fs.readFileSync('src/maintainer-auth.jsx','utf8')
 assert.match(auth,/signInWithPassword/)
 assert.match(app,/useMaintainerAuth/)
 assert.match(app,/tecnico_id:user\.id/)
 assert.match(app,/stato:'done'/)
 assert.match(app,/eq\('hotel_id',RANDAILIVE_HOTEL_ID\)/)
 assert.match(clients,/eq\('hotel_id',RANDAILIVE_HOTEL_ID\)/)
 assert.match(clients,/if\(!supabase\|\|!user\)/)
})
