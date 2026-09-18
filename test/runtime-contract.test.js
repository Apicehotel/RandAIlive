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
