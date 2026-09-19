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
