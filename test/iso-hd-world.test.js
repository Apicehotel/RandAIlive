import test from 'node:test'
import assert from 'node:assert/strict'
import { gridToScreen, screenToGrid, ISO_TILE_W, ISO_TILE_H } from '../src/iso/iso-math.js'
import { ISO_WORLD, allTiles, roomById, routeZones, tilesForRoom } from '../src/iso/iso-world.js'

test('isometric projection uses HD 2:1 tiles and round-trips',()=>{
  assert.equal(ISO_TILE_W,128)
  assert.equal(ISO_TILE_H,64)
  const p=gridToScreen(4.25,7.5)
  const g=screenToGrid(p.x,p.y)
  assert.ok(Math.abs(g.gx-4.25)<1e-9)
  assert.ok(Math.abs(g.gy-7.5)<1e-9)
})

test('ground floor is irregular and connected instead of eight aligned boxes',()=>{
  assert.ok(ISO_WORLD.rooms.length>=12)
  const ys=new Set(ISO_WORLD.rooms.map(r=>r.y))
  const widths=new Set(ISO_WORLD.rooms.map(r=>r.w))
  assert.ok(ys.size>=6)
  assert.ok(widths.size>=4)
  assert.ok(ISO_WORLD.connectors.length>=12)
})

test('hall, reception, bar and service have real tile footprints',()=>{
  for(const id of ['lobby','reception','bar','congress','restaurant','service','technical','elevators']){
    assert.ok(tilesForRoom(roomById(id)).length>=6,id)
  }
  assert.ok(allTiles().length>150)
})

test('guest-floor runtime destinations are represented by the elevator core',()=>{
  assert.equal(roomById('elevators').label,'ASCENSORI')
  const route=routeZones('bar','technical')
  assert.ok(route.length>=2)
  assert.deepEqual(route.at(-1),roomById('technical').anchor)
})
