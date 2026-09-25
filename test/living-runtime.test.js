import test from 'node:test'
import assert from 'node:assert/strict'
import { areaForIssue, linkedIssueFor, liveDirectiveFor, runtimeEventFeed } from '../src/living-runtime.js'

test('maps hotel room numbers to the canonical playable floor', () => {
  assert.equal(areaForIssue({camera:'312'}),'jazz3')
  assert.equal(areaForIssue({camera:'704'}),'wine7')
  assert.equal(areaForIssue({camera:'',categoria:'Aria condizionata'}),'technical')
})

test('binds a running agent to its real maintenance task', () => {
  const issue={id:42,camera:'612',categoria:'Climatizzazione'}
  const agent={id:'randops',name:'RandOps',status:'RUNNING',task_id:'42'}
  assert.equal(linkedIssueFor(agent,[issue]),issue)
  assert.deepEqual(liveDirectiveFor(agent,[issue]),{
    source:'LIVE',
    zone:'wine6',
    action:'Intervento · 612: Climatizzazione',
    taskId:'42',
    issueId:42,
  })
})

test('never labels idle demo wandering as a live directive', () => {
  assert.equal(liveDirectiveFor({id:'randai',status:'IDLE'},[]),null)
})

test('event feed contains only traceable runtime and maintenance facts', () => {
  const feed=runtimeEventFeed(
    [{id:'randcore',name:'RandCore',status:'WAITING_APPROVAL',task_id:'pr-12'}],
    [{id:7,camera:'201',categoria:'TV'}],
  )
  assert.equal(feed.length,2)
  assert.ok(feed.every(event=>event.source==='LIVE'))
})
