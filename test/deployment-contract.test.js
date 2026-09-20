import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

test('live verification is explicit and protects the official route from the wrong app',()=>{
  const script=fs.readFileSync('scripts/verify-live.mjs','utf8')
  const pkg=JSON.parse(fs.readFileSync('package.json','utf8'))
  assert.equal(pkg.scripts['verify:live'],'node scripts/verify-live.mjs')
  assert.match(script,/apicehotel\.vercel\.app\/randailive/)
  assert.match(script,/RandApp/)
  assert.match(script,/Manutenzioni/)
  assert.match(script,/RandAILive marker not found/)
})
