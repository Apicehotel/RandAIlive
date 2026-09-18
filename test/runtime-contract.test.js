import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

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
