import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

test('live verification guards the Apice path and accepts DigitalOcean staging', () => {
  const script = fs.readFileSync('scripts/verify-live.mjs', 'utf8')
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  assert.equal(pkg.scripts['verify:live'], 'node scripts/verify-live.mjs')
  assert.match(script, /apicehotel\.vercel\.app\/randailive/)
  assert.match(script, /RANDAILIVE_LIVE_URL/)
  assert.match(script, /RandApp/)
  assert.match(script, /Manutenzioni/)
  assert.match(script, /RandAILive marker not found/)
  assert.equal(pkg.scripts['ocean:up'], 'docker compose up --build -d')
  assert.ok(fs.existsSync('Dockerfile'))
  assert.ok(fs.existsSync('.do/app.yaml'))
  assert.ok(fs.existsSync('deploy/nginx.conf'))
})
