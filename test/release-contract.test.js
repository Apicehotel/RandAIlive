import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

const read = path => fs.readFileSync(path, 'utf8')

test('release has a reproducible package contract', () => {
  const pkg = JSON.parse(read('package.json'))
  const lock = JSON.parse(read('package-lock.json'))

  assert.equal(lock.name, pkg.name)
  assert.equal(lock.version, pkg.version)
  assert.equal(lock.lockfileVersion, 3)
  assert.equal(pkg.scripts.verify, 'npm test && npm run build')
})

test('release keeps the RandAILive bootstrap and route contract visible', () => {
  const html = read('index.html')
  const main = read('src/main.jsx')
  const vercel = read('vercel.json')
  const readme = read('README.md')

  assert.match(html, /<title>RandAILive<\/title>/)
  assert.match(html, /Avvio RandAILive/)
  assert.match(main, /ErrorBoundary/)
  assert.match(vercel, /index\.html/)
  assert.match(readme, /apicehotel\.vercel\.app\/randailive/)
  assert.match(readme, /RandApp - Manutenzioni/)
  assert.doesNotMatch(readme, /service_role/i)
})

test('phase 1 uses a separate Phaser world runtime', () => {
  const app = read('src/App.jsx')
  const component = read('src/PhaserWorld.jsx')
  const scene = read('src/phaser-world.js')
  const pkg = JSON.parse(read('package.json'))

  assert.ok(pkg.dependencies.phaser)
  assert.match(app, /PhaserWorld/)
  assert.match(component, /import\('\.\/phaser-world\.js'\)/)
  assert.match(scene, /class LivingWorldScene extends Phaser\.Scene/)
  assert.match(scene, /createLivingWorldGame/)
})

test('phase 2 hall is driven by a Tiled-compatible object map', () => {
  const map = JSON.parse(read('src/hall-map.json'))
  const layerNames = map.layers.map(layer => layer.name)
  const rooms = map.layers.find(layer => layer.name === 'rooms').objects
  const spawns = map.layers.find(layer => layer.name === 'spawns').objects

  assert.equal(map.orientation, 'orthogonal')
  assert.deepEqual(layerNames, ['rooms', 'collision', 'doors', 'spawns', 'decorations'])
  assert.equal(rooms.filter(room => room.type === 'room').length, 7)
  assert.equal(rooms.filter(room => room.type === 'hub').length, 1)
  assert.equal(spawns.length, 10)
  assert.ok(map.layers.find(layer => layer.name === 'collision').objects.length >= 10)
  assert.ok(map.layers.find(layer => layer.name === 'doors').objects.length >= 7)
  const decorations = map.layers.find(layer => layer.name === 'decorations').objects
  assert.ok(decorations.length >= 8)
  assert.ok(decorations.some(item => item.type === 'shelves'))
  assert.ok(decorations.some(item => item.type === 'terminal'))
})
