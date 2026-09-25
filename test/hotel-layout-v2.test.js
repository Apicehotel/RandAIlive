import test from 'node:test'
import assert from 'node:assert/strict'
import { ALL_AREAS, HOTEL_LAYOUT, HOTEL_SHARED, WORLD, areaById, propPositions, routeBetween } from '../src/hotel-layout-v2.js'

test('Hotel Gio v2 is a continuous bounded world',()=>{
  assert.equal(WORLD.width,1440)
  assert.equal(WORLD.height,900)
  assert.ok(HOTEL_LAYOUT.length>=20)
  for(const a of ALL_AREAS){
    assert.ok(a.x>=0&&a.y>=0)
    assert.ok(a.x+a.w<=WORLD.width)
    assert.ok(a.y+a.h<=WORLD.height)
  }
})

test('canonical operational zones still exist after rebuild',()=>{
  for(const id of ['reception','lobby','bar','congress','meeting','technical','warehouse','laundry','jazz1','jazz4','wine5','wine8','hub','exterior']){
    assert.equal(areaById(id).id,id)
  }
})

test('rooms get deterministic furniture without owning renderer state',()=>{
  const room=areaById('reception')
  assert.deepEqual(propPositions(room),propPositions(room))
  assert.ok(propPositions(room).some(p=>p.type==='desk'))
  assert.ok(propPositions(areaById('jazz2')).some(p=>p.type==='bed'))
  assert.ok(propPositions(areaById('laundry')).some(p=>p.type==='washer'))
})

test('routes use shared corridors instead of teleporting between cards',()=>{
  const path=routeBetween('jazz2','technical')
  assert.ok(path.length>=4)
  assert.deepEqual(path.at(-1),{x:areaById('technical').x+areaById('technical').w/2,y:areaById('technical').y+areaById('technical').h/2})
  assert.ok(path.some(p=>p.y===238))
  assert.ok(path.some(p=>p.y===595))
})
