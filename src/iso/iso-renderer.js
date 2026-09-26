import { gridToScreen, isoDepth } from './iso-math.js'
import { allTiles, areaAt, doorBetween, mapById, roomById, themeFor } from './iso-world.js'
import { floorTexture, generateIsoTextures } from './iso-textures.js'
import { drawIsoProps } from './iso-props.js'

const wallPalette={
  hotel:{top:0xe5d2ad,upper:0xcdb990,left:0x806b50,right:0xa28a66,lower:0x695642,edge:0x443729,trim:0xd3aa61},
  wood:{top:0xc39769,upper:0x9c704c,left:0x60432f,right:0x79553b,lower:0x4c3325,edge:0x35241b,trim:0xd2a16c},
  service:{top:0xb0bdc0,upper:0x859397,left:0x515f64,right:0x69777b,lower:0x3d494d,edge:0x2c383c,trim:0xd9a847},
  spa:{top:0xbdc6b7,upper:0x99a594,left:0x5d6d5c,right:0x788674,lower:0x465546,edge:0x354236,trim:0xa8d3ae},
  jazz:{top:0xbec8cc,upper:0x879ca7,left:0x526976,right:0x667f8d,lower:0x3b5260,edge:0x293c48,trim:0xd7ad58},
  wine:{top:0xd0b8b7,upper:0xa37d80,left:0x674a50,right:0x805c62,lower:0x4e353b,edge:0x38252a,trim:0xd0a15f},
}

const pairKey=(a,b)=>[`${a.x},${a.y}`,`${b.x},${b.y}`].sort().join('|')

function drawWallSegment(scene,a,b,height,pal,depth,cutaway=false){
  const g=scene.add.graphics().setDepth(depth)
  const topA={x:a.x,y:a.y-height},topB={x:b.x,y:b.y-height}
  const face=[topA,topB,b,a],leftish=b.x<a.x
  g.fillStyle(leftish?pal.left:pal.right,1).fillPoints(face,true)
  const lowerA={x:a.x,y:a.y-Math.min(17,height)},lowerB={x:b.x,y:b.y-Math.min(17,height)}
  g.fillStyle(pal.lower,.92).fillPoints([lowerA,lowerB,b,a],true)
  g.lineStyle(3,pal.edge,.78).strokePoints(face,true)
  g.lineStyle(4,pal.top,.96).lineBetween(topA.x,topA.y,topB.x,topB.y)
  g.lineStyle(3,pal.trim,.72).lineBetween(lowerA.x,lowerA.y,lowerB.x,lowerB.y)
  if(!cutaway&&height>40){
    for(let t=.22;t<.9;t+=.28){
      const ax=topA.x+(a.x-topA.x)*t,ay=topA.y+(a.y-topA.y)*t
      const bx=topB.x+(b.x-topB.x)*t,by=topB.y+(b.y-topB.y)*t
      g.lineStyle(1,pal.top,.14).lineBetween(ax,ay,bx,by)
    }
    g.lineStyle(1,0xffffff,.13).lineBetween(topA.x,topA.y+5,topB.x,topB.y+5)
  }
  return g
}

function boundaryPalette(map,tile,neighbor){
  const a=roomById(tile.areaId,map.id),b=neighbor?roomById(neighbor.areaId,map.id):null
  const wall=themeFor(a).wall||themeFor(b).wall
  return wallPalette[wall]||wallPalette.hotel
}

function drawWalls(scene,map,tiles){
  const nodes=[],seen=new Set(),cellMap=new Map(tiles.map(t=>[`${t.x},${t.y}`,t]))
  const directions=[
    {dx:0,dy:-1,edge:t=>[{x:t.x,y:t.y},{x:t.x+1,y:t.y}],cutaway:false},
    {dx:-1,dy:0,edge:t=>[{x:t.x,y:t.y},{x:t.x,y:t.y+1}],cutaway:false},
    {dx:0,dy:1,edge:t=>[{x:t.x,y:t.y+1},{x:t.x+1,y:t.y+1}],cutaway:true,outerOnly:true},
    {dx:1,dy:0,edge:t=>[{x:t.x+1,y:t.y},{x:t.x+1,y:t.y+1}],cutaway:true,outerOnly:true},
  ]
  for(const tile of tiles)for(const dir of directions){
    const next={x:tile.x+dir.dx,y:tile.y+dir.dy},neighbor=cellMap.get(`${next.x},${next.y}`)
    if(dir.outerOnly&&neighbor)continue
    if(neighbor){
      const aa=roomById(tile.areaId,map.id),ab=roomById(neighbor.areaId,map.id)
      if(tile.areaId===neighbor.areaId||(aa.kind==='circulation'&&ab.kind==='circulation'))continue
      if(doorBetween(map,tile,next))continue
    }
    const edge=dir.edge(tile),key=pairKey(edge[0],edge[1]);if(seen.has(key))continue;seen.add(key)
    const a=gridToScreen(edge[0].x,edge[0].y),b=gridToScreen(edge[1].x,edge[1].y)
    const height=dir.cutaway?18:82,pal=boundaryPalette(map,tile,neighbor)
    nodes.push(drawWallSegment(scene,a,b,height,pal,19000+isoDepth((edge[0].x+edge[1].x)/2,(edge[0].y+edge[1].y)/2),dir.cutaway))
  }
  return nodes
}

function doorwayEdge(d){
  if(d.a.x===d.b.x){const y=Math.max(d.a.y,d.b.y);return [{x:d.a.x,y},{x:d.a.x+1,y}]}
  const x=Math.max(d.a.x,d.b.x);return [{x,y:d.a.y},{x,y:d.a.y+1}]
}

function drawDoorways(scene,map){
  const nodes=[],seen=new Set()
  for(const d of map.doors){
    const horizontal=d.a.y===d.b.y,segments=[]
    for(let i=0;i<(d.width||1);i++){
      const shifted={...d,a:{x:d.a.x+(horizontal?0:i),y:d.a.y+(horizontal?i:0)},b:{x:d.b.x+(horizontal?0:i),y:d.b.y+(horizontal?i:0)}}
      const edge=doorwayEdge(shifted),key=pairKey(edge[0],edge[1]);if(seen.has(key))continue;seen.add(key);segments.push(edge)
    }
    if(!segments.length)continue
    const first=segments[0][0],last=segments.at(-1)[1],a=gridToScreen(first.x,first.y),b=gridToScreen(last.x,last.y),mx=(a.x+b.x)/2,my=(a.y+b.y)/2
    const depth=20500+isoDepth((first.x+last.x)/2,(first.y+last.y)/2)
    const g=scene.add.graphics().setDepth(depth)
    for(const edge of segments){
      const s=gridToScreen(edge[0].x,edge[0].y),e=gridToScreen(edge[1].x,edge[1].y)
      g.lineStyle(12,0x4b3024,.95).lineBetween(s.x,s.y,e.x,e.y);g.lineStyle(7,0xd3aa61,.92).lineBetween(s.x,s.y-2,e.x,e.y-2);g.lineStyle(2,0xffedbf,.62).lineBetween(s.x,s.y-4,e.x,e.y-4)
    }
    for(const p of [a,b]){
      g.fillStyle(0x3d2b22,1).fillRect(p.x-4,p.y-52,8,52)
      g.fillStyle(0xd3aa61,1).fillRect(p.x-2,p.y-51,4,48)
      g.fillStyle(0xffe4a0,.8).fillCircle(p.x,p.y-52,5)
    }
    g.fillStyle(0xffd88f,.075).fillEllipse(mx,my-17,76,38)
    nodes.push(g)
  }
  return nodes
}

function addRoomLabel(scene,map,room){
  if(room.kind==='circulation'&&room.id!=='lobby'&&room.id!=='entrance')return null
  const p=gridToScreen(room.anchor.x,room.anchor.y,96)
  const compact=map.kind==='guest'&&room.id.startsWith('room-')
  return scene.add.text(p.x,p.y,room.label,{
    fontFamily:'Inter,system-ui,sans-serif',fontSize:compact?'10px':'12px',fontStyle:'bold',color:'#fff7e6',
    backgroundColor:'#101820e6',padding:{left:compact?5:9,right:compact?5:9,top:4,bottom:4},stroke:'#000000',strokeThickness:1,
  }).setOrigin(.5).setDepth(48000+isoDepth(room.anchor.x,room.anchor.y))
}

function addAmbientPools(scene,map){
  const colors={lobby:0xffd58b,reception:0xffc96b,bar:0xffa44f,event:0x78a8ff,restaurant:0xffb65f,kitchen:0xc7e9ef,service:0x8bddeb,technical:0x55d7e9,warehouse:0xe2b76a,spa:0xa9e7b5,gym:0x72d9e8,jazz:0x78bde8,wine:0xe39a9f}
  const nodes=[]
  for(const room of map.areas){
    if(room.kind==='circulation'&&room.id!=='lobby')continue
    const p=gridToScreen(room.anchor.x,room.anchor.y),color=colors[room.theme]||0xffd58b
    nodes.push(scene.add.ellipse(p.x,p.y,room.id==='lobby'?330:190,room.id==='lobby'?118:72,color,room.id==='lobby'?.09:.055).setDepth(-20000+isoDepth(room.anchor.x,room.anchor.y)))
  }
  return nodes
}

function addCeilingLights(scene,map){
  const nodes=[]
  for(const room of map.areas.filter(a=>a.kind==='circulation')){
    const p=gridToScreen(room.anchor.x,room.anchor.y,112),g=scene.add.graphics().setDepth(47000+isoDepth(room.anchor.x,room.anchor.y))
    g.fillStyle(0xffe1a0,.12).fillEllipse(p.x,p.y+80,145,54);g.fillStyle(0xffe8b3,1).fillEllipse(p.x,p.y,28,12);g.fillStyle(0xffffff,.75).fillEllipse(p.x,p.y-1,13,5)
    nodes.push(g)
  }
  return nodes
}

function mapBounds(tiles){
  const points=tiles.map(t=>gridToScreen(t.x+.5,t.y+.5)),xs=points.map(p=>p.x),ys=points.map(p=>p.y)
  const minX=Math.min(...xs)-150,maxX=Math.max(...xs)+150,minY=Math.min(...ys)-190,maxY=Math.max(...ys)+145
  return {x:minX,y:minY,width:maxX-minX,height:maxY-minY,centerX:(minX+maxX)/2,centerY:(minY+maxY)/2}
}

export function buildIsoHotel(scene,mapId='ground',{onElevator}={}){
  const map=mapById(mapId);generateIsoTextures(scene)
  const nodes=[],tiles=allTiles(map).sort((a,b)=>(a.x+a.y)-(b.x+b.y))
  const bounds=mapBounds(tiles)
  const base=scene.add.ellipse(bounds.centerX,bounds.centerY+90,bounds.width*.88,bounds.height*.53,0x000000,.32).setDepth(-50000);nodes.push(base)
  for(const tile of tiles){
    const room=areaAt(map,tile.x,tile.y),p=gridToScreen(tile.x+.5,tile.y+.5)
    const image=scene.add.image(p.x,p.y,floorTexture(themeFor(room).floor)).setOrigin(.5).setDepth(-10000+isoDepth(tile.x,tile.y));nodes.push(image)
  }
  nodes.push(...addAmbientPools(scene,map),...drawWalls(scene,map,tiles),...drawDoorways(scene,map),...drawIsoProps(scene,map),...addCeilingLights(scene,map))
  for(const room of map.areas){const label=addRoomLabel(scene,map,room);if(label)nodes.push(label)}
  const lift=roomById(map.elevatorArea,map.id),lp=gridToScreen(lift.anchor.x,lift.anchor.y)
  const liftZone=scene.add.zone(lp.x,lp.y-28,170,120).setInteractive({useHandCursor:true}).setDepth(60000+isoDepth(lift.anchor.x,lift.anchor.y))
  liftZone.on('pointerdown',()=>onElevator?.(map.id));nodes.push(liftZone)
  return {map,nodes,bounds,liftZone,destroy(){for(const n of nodes)n?.destroy?.()}}
}
