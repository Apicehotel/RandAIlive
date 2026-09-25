import test from 'node:test'
import assert from 'node:assert/strict'
import { AREAS, ROOMS, WORLD, areaById, placedProps, projectWorld, routeBetween } from '../src/hotel-world-v3.js'
import { shade } from '../src/hotel-bake-v3.js'

test('v3 world keeps the complete eight-floor Jazz/Wine identity',()=>{
  for(const id of ['jazz1','jazz2','jazz3','jazz4','wine5','wine6','wine7','wine8'])assert.equal(areaById(id).id,id)
})

test('v3 hotel stays bounded and is not a card-grid data model',()=>{
  assert.equal(WORLD.width,1536)
  assert.equal(WORLD.height,960)
  assert.ok(ROOMS.length>=20)
  for(const a of AREAS){
    assert.ok(a.x>=0&&a.y>=0,a.id)
    assert.ok(a.x+a.w<=WORLD.width,a.id)
    assert.ok(a.y+a.h<=WORLD.height,a.id)
  }
})

test('projection owns furniture independently of Phaser',()=>{
  const p=projectWorld()
  assert.ok(p.rooms.find(r=>r.id==='reception').props.some(x=>x.type==='desk'))
  assert.ok(p.rooms.find(r=>r.id==='laundry').props.some(x=>x.type==='washer'))
  assert.deepEqual(placedProps(areaById('jazz3')),placedProps(areaById('jazz3')))
})

test('routing crosses shared hotel corridors',()=>{
  const path=routeBetween('jazz2','technical')
  assert.ok(path.length>=5)
  assert.ok(path.some(p=>p.y===282))
  assert.ok(path.some(p=>p.y===648))
  assert.deepEqual(path.at(-1),{x:areaById('technical').x+areaById('technical').w/2,y:areaById('technical').y+areaById('technical').h/2})
})

test('bake shading has a stable material ramp',()=>{
  assert.equal(shade('#808080',0),'#808080')
  assert.notEqual(shade('#808080',-.3),'#808080')
  assert.notEqual(shade('#808080',.3),'#808080')
})
