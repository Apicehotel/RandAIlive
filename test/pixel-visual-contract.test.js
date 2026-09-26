import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { AGENT_LOOKS, problemEmoji, urgencyAura } from '../src/pixel-sprites.js'

test('each canonical agent has a distinctive pixel look', () => {
  for (const id of ['randai', 'randbrain', 'randcore', 'randmind', 'randradar', 'randresearch', 'randsecure', 'randtest', 'randops', 'randui']) {
    assert.ok(AGENT_LOOKS[id], id)
    assert.ok(AGENT_LOOKS[id].hat)
    assert.ok(AGENT_LOOKS[id].prop)
  }
})

test('client urgency maps to agitation aura colors', () => {
  assert.equal(urgencyAura('alta').label, 'CRITICA')
  assert.equal(urgencyAura('media').label, 'AGITATA')
  assert.equal(urgencyAura('bassa').label, 'CALMA')
  assert.ok(urgencyAura('alta').pulse > urgencyAura('bassa').pulse)
})

test('problem emoji comes from category or notes', () => {
  assert.equal(problemEmoji({ categoria: 'Idraulica', note: 'perdita bagno' }), '💧')
  assert.equal(problemEmoji({ categoria: 'Elettrico', note: 'luce guasta' }), '⚡')
  assert.equal(problemEmoji({ categoria: 'Clima', note: 'aria condizionata' }), '❄️')
  assert.equal(problemEmoji({ urgenza: 'alta', categoria: 'Altro' }), '❗')
})

test('phaser world draws branded agents and living clients', () => {
  const scene = fs.readFileSync('src/phaser-world.js', 'utf8')
  const app = fs.readFileSync('src/App.jsx', 'utf8')
  assert.match(scene, /makeGuest/)
  assert.match(scene, /setClients/)
  assert.match(scene, /AGENT_LOOKS/)
  assert.match(scene, /urgencyAura/)
  assert.match(scene, /problemEmoji/)
  assert.match(scene, /buildIsoHotel/)
  assert.match(scene, /routeAreas/)
  assert.match(scene, /setActiveMap/)
  assert.match(scene, /gridToScreen/)
  assert.match(scene, /screenToGrid/)
  assert.match(scene, /getWorldPoint/)
  assert.match(scene, /startsWith\('room-'\)/)
  assert.match(scene, /dragDistance<7/)
  assert.match(app, /onSelectIssue/)
  assert.match(app, /TOCCA CAMERA = focus/)
  assert.match(app, /issues=\{issues/)
})
