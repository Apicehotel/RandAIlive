import test from 'node:test'
import assert from 'node:assert/strict'
import { gridToScreen, screenToGrid, ISO_TILE_W, ISO_TILE_H } from '../src/iso/iso-math.js'
import { floorTexture } from '../src/iso/iso-textures.js'
import { propLayoutFor } from '../src/iso/iso-props.js'
import { ambientLifeFor } from '../src/iso/iso-life.js'
import { ISO_MAPS, ISO_WORLD, allTiles, destinationForZone, isStepWalkable, roomById, routeAreas, tilesForRoom } from '../src/iso/iso-world.js'

test('isometric projection uses HD 2:1 tiles and round-trips',()=>{
  assert.equal(ISO_TILE_W,128);assert.equal(ISO_TILE_H,64)
  const p=gridToScreen(4.25,7.5),g=screenToGrid(p.x,p.y)
  assert.ok(Math.abs(g.gx-4.25)<1e-9);assert.ok(Math.abs(g.gy-7.5)<1e-9)
})

test('floor materials use deterministic variants to avoid visible tiling',()=>{
  const variants=new Set(Array.from({length:8},(_,x)=>floorTexture('marble',x,0)))
  assert.equal(variants.size,4)
  assert.equal(floorTexture('jazzCarpet',3,7),floorTexture('jazzCarpet',3,7))
  assert.match(floorTexture('unknown',0,0),/^iso-floor-marble-/)
})

test('ground floor uses an irregular connected hotel footprint',()=>{
  assert.ok(ISO_WORLD.areas.length>=18)
  assert.ok(ISO_WORLD.areas.some(area=>area.shapes.length>1),'at least one room has a real recess')
  assert.ok(ISO_WORLD.areas.filter(area=>area.kind==='circulation').length>=6)
  assert.ok(ISO_WORLD.doors.length>=14)
  assert.ok(allTiles(ISO_WORLD).length>600)
})

test('hall, reception, bar and service have substantial tile footprints',()=>{
  for(const id of ['lobby','reception','bar','congress','restaurant','service','technical','elevators'])assert.ok(tilesForRoom(roomById(id)).length>=15,id)
})

test('all areas route to elevators on walkable orthogonal cells',()=>{
  for(const map of ISO_MAPS)for(const area of map.areas){
    const route=routeAreas(area.id,map.elevatorArea,map.id)
    assert.ok(route.length,`${map.id}:${area.id}`)
    for(let i=1;i<route.length;i++){
      const a={x:Math.floor(route[i-1].x),y:Math.floor(route[i-1].y)},b={x:Math.floor(route[i].x),y:Math.floor(route[i].y)}
      assert.equal(Math.abs(a.x-b.x)+Math.abs(a.y-b.y),1,`${map.id}:${area.id} has no teleport steps`)
      assert.ok(isStepWalkable(map,a,b),`${map.id}:${area.id} stays inside doors and corridors`)
    }
  }
})

test('Jazz and Wine are eight separate elevator maps',()=>{
  assert.deepEqual(ISO_MAPS.map(map=>map.id),['ground','jazz1','jazz2','jazz3','jazz4','wine5','wine6','wine7','wine8'])
  for(const id of ISO_MAPS.slice(1).map(map=>map.id)){
    assert.deepEqual(destinationForZone(id),{mapId:id,areaId:'floor-lounge'})
    assert.equal(roomById('elevators',id).label,'ASCENSORI')
  }
})

test('Jazz furniture is modern while Wine uses cellar and arte povera pieces',()=>{
  const jazzTypes=new Set(propLayoutFor(ISO_MAPS.find(map=>map.id==='jazz1')).map(([type])=>type))
  const wineTypes=new Set(propLayoutFor(ISO_MAPS.find(map=>map.id==='wine5')).map(([type])=>type))
  for(const type of ['jazzBed','jazzWardrobe','jazzDesk','sculpture'])assert.ok(jazzTypes.has(type),type)
  for(const type of ['wineBed','wineWardrobe','wineDesk','barrel','bottleRack'])assert.ok(wineTypes.has(type),type)
  assert.ok(!jazzTypes.has('barrel'));assert.ok(!wineTypes.has('sculpture'))
})

test('the hotel has ambient life routed through walkable corridors and doors',()=>{
  for(const map of ISO_MAPS){
    const population=ambientLifeFor(map)
    assert.ok(population.length>=(map.kind==='ground'?10:3),`${map.id} population`)
    for(const actor of population){
      assert.ok(actor.route.length>=3,`${actor.id} route`)
      for(let i=1;i<actor.route.length;i++){
        const path=routeAreas(actor.route[i-1],actor.route[i],map.id)
        assert.ok(path.length,`${actor.id}: ${actor.route[i-1]} -> ${actor.route[i]}`)
        for(let step=1;step<path.length;step++){
          const a={x:Math.floor(path[step-1].x),y:Math.floor(path[step-1].y)},b={x:Math.floor(path[step].x),y:Math.floor(path[step].y)}
          assert.ok(isStepWalkable(map,a,b),`${actor.id} crosses a wall`)
        }
      }
    }
  }
})
