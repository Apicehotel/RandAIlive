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

test('phase 2 projects a dedicated Hotel Gio world model into the renderer', () => {
  const scene = read('src/phaser-world.js')
  const world = read('src/hotel-world-v3.js')
  const bake = read('src/hotel-bake-v3.js')
  const renderer = read('src/hotel-renderer-v3.js')
  assert.match(scene, /projectWorld/)
  assert.match(world, /function projectWorld/)
  assert.match(bake, /function bakeHotel/)
  assert.match(renderer, /createHotelRenderer/)
})

test('phase 4 routes agents through the v3 hotel corridors instead of teleporting', () => {
  const scene = read('src/phaser-world.js')
  const world = read('src/hotel-world-v3.js')
  assert.match(scene, /routeBetween/)
  assert.match(scene, /node\.route/)
  assert.match(world, /function routeBetween/)
  assert.match(world, /doorwayOf/)
  assert.match(world, /y:282/)
  assert.match(world, /y:648/)
})
