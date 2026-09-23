import test from 'node:test'
import assert from 'node:assert/strict'
import { HOTEL_AREAS, HOTEL_OBJECTIVES, AGENT_HOME_AREAS } from '../src/hotel-world.js'
import { createGameState, performAction, registerMaintenanceQuest, visitArea } from '../src/game-engine.js'

test('Hotel Gio world includes the operational areas and all eight guest floors',()=>{
  for(const id of ['reception','bar','breakfast','kitchen','congress','meeting','spa','gym','laundry','warehouse','technical','exterior']){
    assert.ok(HOTEL_AREAS[id], id)
  }
  for(const id of ['jazz1','jazz2','jazz3','jazz4','wine5','wine6','wine7','wine8']){
    assert.ok(HOTEL_AREAS[id], id)
  }
})

test('all canonical AI agents have a Hotel Gio home area',()=>{
  for(const id of ['randai','randbrain','randcore','randmind','randradar','randresearch','randsecure','randtest','randops','randui']){
    assert.ok(HOTEL_AREAS[AGENT_HOME_AREAS[id]], id)
  }
})

test('game loop exposes a full hotel objective chain',()=>{
  assert.ok(HOTEL_OBJECTIVES.length>=4)
  const state=createGameState(['randai'])
  const a=performAction(state,'randai','explore','RandAI')
  const b=performAction(a,'randai','assist','RandAI')
  const c=performAction(b,'randai','inspect','RandAI')
  assert.equal(c.objectiveIndex,1)
  assert.ok(c.hotel.credits>state.hotel.credits)
  assert.ok(c.hotel.reputation>=state.hotel.reputation)
})

test('maintenance quests and exploration affect hotel progression',()=>{
  const base=createGameState(['randai'])
  const visited=visitArea(base,'technical')
  assert.ok(visited.hotel.visitedAreas.includes('technical'))
  const done=registerMaintenanceQuest(visited,true)
  assert.equal(done.hotel.completedQuests,1)
  assert.ok(done.hotel.service>visited.hotel.service)
})
