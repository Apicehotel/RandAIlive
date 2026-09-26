import { gridToScreen, isoDepth } from './iso-math.js'
import { allTiles, ISO_WORLD, roomById, themeFor } from './iso-world.js'
import { floorTexture, generateIsoTextures, ISO_PALETTES } from './iso-textures.js'
import { drawIsoProps } from './iso-props.js'

const wallPalette={
  hotel:{top:0xd0b98d,left:0x876e52,right:0xa48a68,edge:0x554433},
  wood:{top:0xa8794f,left:0x64452f,right:0x7b563a,edge:0x402d21},
  service:{top:0x89979b,left:0x535f64,right:0x68767b,edge:0x354147},
  spa:{top:0x9aa594,left:0x5d6d5c,right:0x738270,edge:0x3f4d40},
}

function areaAtTile(x,y){
  return ISO_WORLD.rooms.find(r=>x>=r.x&&x<r.x+r.w&&y>=r.y&&y<r.y+r.h)
    || ISO_WORLD.corridors.find(r=>x>=r.x&&x<r.x+r.w&&y>=r.y&&y<r.y+r.h)
}

function drawWallSegment(scene,a,b,height,pal,depth){
  const topA={x:a.x,y:a.y-height},topB={x:b.x,y:b.y-height}
  const face=[topA,topB,b,a]
  const g=scene.add.graphics().setDepth(depth)
  const leftish=b.x<a.x
  g.fillStyle(leftish?pal.left:pal.right,1).fillPoints(face,true)
  g.lineStyle(2,pal.edge,.7).strokePoints(face,true)
  g.lineStyle(2,pal.top,.75).lineBetween(topA.x,topA.y,topB.x,topB.y)
  g.lineStyle(1,0xffffff,.10).lineBetween(topA.x,topA.y+3,topB.x,topB.y+3)
  return g
}

function drawRoomWalls(scene,room){
  const t=themeFor(room),pal=wallPalette[t.wall]||wallPalette.hotel
  const h=78
  const a=gridToScreen(room.x,room.y)
  const b=gridToScreen(room.x+room.w,room.y)
  const c=gridToScreen(room.x,room.y+room.h)
  // Cutaway: only north + west backs, leaving front open.
  const d1=drawWallSegment(scene,a,b,h,pal,1000+isoDepth(room.x+room.w,room.y))
  const d2=drawWallSegment(scene,a,c,h,pal,1000+isoDepth(room.x,room.y+room.h))
  return [d1,d2]
}


function drawCorridorRails(scene,corridor){
  const pal=wallPalette.hotel,h=18
  const a=gridToScreen(corridor.x,corridor.y)
  const b=gridToScreen(corridor.x+corridor.w,corridor.y)
  const c=gridToScreen(corridor.x+corridor.w,corridor.y+corridor.h)
  const d=gridToScreen(corridor.x,corridor.y+corridor.h)
  const depth=700+isoDepth(corridor.x+corridor.w,corridor.y+corridor.h)
  const rails=corridor.axis==='h'
    ? [drawWallSegment(scene,a,b,h,pal,depth),drawWallSegment(scene,d,c,h,pal,depth+1)]
    : [drawWallSegment(scene,a,d,h,pal,depth),drawWallSegment(scene,b,c,h,pal,depth+1)]
  const mid=gridToScreen(corridor.x+corridor.w/2,corridor.y+corridor.h/2)
  const lamp=scene.add.ellipse(mid.x,mid.y,82,34,0xffd88f,.07).setDepth(250)
  return [...rails,lamp]
}

function drawDoorThreshold(scene,p){
  const s=gridToScreen(p.x,p.y)
  const g=scene.add.graphics().setDepth(10500+isoDepth(p.x,p.y))
  g.fillStyle(0x5b3a28,.95).fillEllipse(s.x,s.y,34,14)
  g.lineStyle(3,0xd9b76b,.9).strokeEllipse(s.x,s.y,34,14)
  g.fillStyle(0xffd88f,.12).fillEllipse(s.x,s.y-9,42,20)
  return g
}

function drawDoorways(scene){
  const nodes=[]
  for(const connector of ISO_WORLD.connectors){
    if(!connector.via?.length)continue
    nodes.push(drawDoorThreshold(scene,connector.via[0]))
    if(connector.via.length>1)nodes.push(drawDoorThreshold(scene,connector.via.at(-1)))
  }
  return nodes
}

function addRoomLabel(scene,room){
  const p=gridToScreen(room.x+room.w/2,room.y+.1,88)
  const t=scene.add.text(p.x,p.y,room.label,{
    fontFamily:'monospace',fontSize:'11px',fontStyle:'bold',color:'#fff6df',
    backgroundColor:'#111820d9',padding:{left:7,right:7,top:3,bottom:3}
  }).setOrigin(.5).setDepth(12000)
  return t
}

function addAmbientPools(scene){
  const defs=[
    ['lobby',0xffd58b,.10,180],
    ['bar',0xffb45d,.08,130],
    ['reception',0xffd58b,.09,120],
    ['technical',0x5ddcff,.08,110],
    ['spa',0xb8e9aa,.07,120],
  ]
  return defs.map(([id,color,alpha,r])=>{
    const room=roomById(id),p=gridToScreen(room.anchor.x,room.anchor.y)
    return scene.add.ellipse(p.x,p.y,r*2,r,color,alpha).setDepth(200)
  })
}

export function buildIsoHotel(scene){
  generateIsoTextures(scene)
  const nodes=[]
  const tiles=allTiles().sort((a,b)=>(a.x+a.y)-(b.x+b.y))
  for(const tile of tiles){
    const area=areaAtTile(tile.x,tile.y)
    if(!area)continue
    const p=gridToScreen(tile.x+.5,tile.y+.5)
    const tex=floorTexture(themeFor(area).floor)
    const image=scene.add.image(p.x,p.y,tex).setOrigin(.5,.5)
    image.setDepth(-10000+isoDepth(tile.x,tile.y))
    nodes.push(image)
  }
  for(const corridor of ISO_WORLD.corridors)nodes.push(...drawCorridorRails(scene,corridor))
  for(const room of ISO_WORLD.rooms){
    nodes.push(...drawRoomWalls(scene,room))
    nodes.push(addRoomLabel(scene,room))
  }
  nodes.push(...drawDoorways(scene))
  nodes.push(...addAmbientPools(scene))
  nodes.push(...drawIsoProps(scene,ISO_WORLD.rooms))
  return {nodes,destroy(){for(const n of nodes)n?.destroy?.()}}
}
