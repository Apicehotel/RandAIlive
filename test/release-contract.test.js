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
  assert.match(readme, /DigitalOcean/)
  assert.match(readme, /Vercel è in freeze/)
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

test('phase 2 uses a dedicated 2.5D isometric world and renderer', () => {
  const scene = read('src/phaser-world.js')
  const world = read('src/iso/iso-world.js')
  const renderer = read('src/iso/iso-renderer.js')
  const textures = read('src/iso/iso-textures.js')
  assert.match(scene, /buildIsoHotel/)
  assert.match(world, /ISO_WORLD/)
  assert.match(renderer, /buildIsoHotel/)
  assert.match(textures, /generateIsoTextures/)
})

test('phase 4 routes agents through connected isometric hotel zones', () => {
  const scene = read('src/phaser-world.js')
  const world = read('src/iso/iso-world.js')
  assert.match(scene, /routeZones/)
  assert.match(scene, /node\.route/)
  assert.match(world, /function routeZones/)
  assert.match(world, /connectors/)
})
