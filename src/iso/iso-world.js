import { propLayoutFor } from './iso-props.js'

const rect=(x,y,w,h)=>({x,y,w,h})
const area=(id,label,theme,shapes,anchor,kind='room')=>({id,label,theme,shapes,anchor,kind})
const door=(id,areaA,areaB,a,b,width=1)=>({id,areaA,areaB,a,b,width})

const GROUND_AREAS=[
  area('lobby','HALL · CUORE HOTEL','lobby',[rect(10,10,8,6),rect(12,16,6,4)],{x:14,y:13.5},'circulation'),
  area('north-gallery','GALLERIA ASCENSORI','corridor',[rect(8,7,15,3)],{x:15.5,y:8.5},'circulation'),
  area('west-gallery','GALLERIA EVENTI','corridor',[rect(4,10,6,3),rect(6,13,3,7)],{x:7.5,y:12.5},'circulation'),
  area('east-gallery','GALLERIA RISTORANTE','corridor',[rect(18,10,10,3),rect(23,7,6,3)],{x:24.5,y:11.5},'circulation'),
  area('service-spine','PASSAGGIO SERVICE','serviceCorridor',[rect(18,13,3,11),rect(20,18,8,3)],{x:19.5,y:18.5},'circulation'),
  area('entrance-promenade','PROMENADE','corridor',[rect(13,20,4,3)],{x:14.5,y:21.5},'circulation'),
  area('reception','RECEPTION','reception',[rect(9,3,6,4),rect(8,4,1,2)],{x:12.5,y:5.5}),
  area('elevators','ASCENSORI','elevator',[rect(16,3,5,4)],{x:18.5,y:5.5}),
  area('bar','BAR & LOUNGE','bar',[rect(1,4,7,6),rect(2,3,4,1)],{x:4.5,y:7.5}),
  area('congress','CONGRESSI','event',[rect(0,14,6,9),rect(1,13,4,1)],{x:3.5,y:18.5}),
  area('meeting','MEETING','event',[rect(9,16,3,6)],{x:10.5,y:18.5}),
  area('restaurant','RISTORANTE','restaurant',[rect(28,10,6,7),rect(26,13,2,3)],{x:30.5,y:13.5}),
  area('kitchen','CUCINA','kitchen',[rect(28,17,6,6),rect(30,23,4,1)],{x:31,y:20}),
  area('service','SERVICE & LAVANDERIA','service',[rect(21,13,5,5)],{x:23.5,y:15.5}),
  area('technical','MANUTENZIONE','technical',[rect(22,21,5,5),rect(27,22,1,3)],{x:24.5,y:23.5}),
  area('warehouse','MAGAZZINO','warehouse',[rect(17,24,5,4)],{x:19.5,y:26}),
  area('spa','SPA','spa',[rect(23,2,6,5),rect(25,1,3,1)],{x:26,y:4.5}),
  area('gym','PALESTRA','gym',[rect(29,4,5,6),rect(30,3,3,1)],{x:31.5,y:7}),
  area('entrance','INGRESSO','entrance',[rect(11,23,5,4),rect(16,24,1,3)],{x:14,y:25},'circulation'),
]

const GROUND_DOORS=[
  door('reception-main','reception','north-gallery',{x:11,y:6},{x:11,y:7},2),
  door('reception-side','reception','north-gallery',{x:14,y:6},{x:14,y:7}),
  door('lift-main','elevators','north-gallery',{x:18,y:6},{x:18,y:7},2),
  door('bar-gallery','bar','north-gallery',{x:7,y:8},{x:8,y:8},2),
  door('congress-gallery','congress','west-gallery',{x:5,y:17},{x:6,y:17},2),
  door('meeting-gallery','meeting','west-gallery',{x:9,y:18},{x:8,y:18},2),
  door('restaurant-main','restaurant','east-gallery',{x:28,y:11},{x:27,y:11},2),
  door('restaurant-kitchen','restaurant','kitchen',{x:30,y:16},{x:30,y:17},2),
  door('kitchen-service','kitchen','service-spine',{x:28,y:19},{x:27,y:19}),
  door('service-main','service','service-spine',{x:21,y:15},{x:20,y:15},2),
  door('technical-main','technical','service-spine',{x:23,y:21},{x:23,y:20},2),
  door('warehouse-main','warehouse','service-spine',{x:19,y:24},{x:19,y:23},2),
  door('spa-gallery','spa','east-gallery',{x:25,y:6},{x:25,y:7},2),
  door('gym-gallery','gym','east-gallery',{x:29,y:8},{x:28,y:8},2),
]

function guestFloor(id,label,theme,floorNumber,officeCount){
  const prefix=String(floorNumber)
  const areas=[
    area('floor-corridor',`${label.toUpperCase()} · PIANO ${floorNumber}`,theme==='jazz'?'jazzCorridor':'wineCorridor',[rect(4,5,21,3)],{x:14.5,y:6.5},'circulation'),
    area('elevators','ASCENSORI','elevator',[rect(11,1,4,4)],{x:13,y:3}),
    area('floor-lounge','LOUNGE DI PIANO',theme==='jazz'?'jazzLounge':'wineLounge',[rect(11,8,4,5)],{x:13,y:10.5}),
  ]
  const rooms=[
    [1,1,1,5,4,3,4,3,5],[2,6,1,5,4,8,4,8,5],[3,15,1,5,4,17,4,17,5],[4,20,1,5,4,22,4,22,5],
    [5,1,8,5,5,3,8,3,7],[6,6,8,5,5,8,8,8,7],[7,15,8,5,5,17,8,17,7],[8,20,8,5,5,22,8,22,7],
  ]
  const doors=[door('lift-floor','elevators','floor-corridor',{x:12,y:4},{x:12,y:5},2),door('lounge-floor','floor-lounge','floor-corridor',{x:12,y:8},{x:12,y:7},2)]
  for(const [n,x,y,w,h,dx,dy,cx,cy] of rooms){
    const roomId=`room-${prefix}${String(n).padStart(2,'0')}`
    areas.push(area(roomId,`CAMERA ${prefix}${String(n).padStart(2,'0')}`,theme,[rect(x,y,w,h)],{x:x+w/2,y:y+h/2}))
    doors.push(door(`${roomId}-door`,roomId,'floor-corridor',{x:dx,y:dy},{x:cx,y:cy}))
  }
  for(let i=0;i<officeCount;i++){
    const x=i?25:0
    areas.push(area(`office-${i+1}`,`OFFICE ${i+1}`,theme==='jazz'?'jazzService':'wineService',[rect(x,5,4,3)],{x:x+2,y:6.5}))
    doors.push(door(`office-${i+1}-door`,`office-${i+1}`,'floor-corridor',i?{x:25,y:6}:{x:3,y:6},i?{x:24,y:6}:{x:4,y:6}))
  }
  return {id,label:`${label} · Piano ${floorNumber}`,shortLabel:`${label} ${floorNumber}`,kind:'guest',theme,level:floorNumber,width:29,height:14,areas,doors,elevatorArea:'elevators'}
}

const ground={id:'ground',label:'Hotel Giò · Piano Terra',shortLabel:'Piano Terra',kind:'ground',level:0,width:35,height:29,areas:GROUND_AREAS,doors:GROUND_DOORS,elevatorArea:'elevators'}
const floors=[1,2,3,4].map(n=>guestFloor(`jazz${n}`,'Jazz','jazz',n,1)).concat([5,6,7,8].map(n=>guestFloor(`wine${n}`,'Wine','wine',n,2)))

export const ISO_MAPS=Object.freeze([ground,...floors])
export const ISO_WORLD=ground
export const DEFAULT_MAP_ID='ground'

const cellKey=(x,y)=>`${x},${y}`
const edgeKey=(a,b)=>[cellKey(a.x,a.y),cellKey(b.x,b.y)].sort().join('|')

function cellsForArea(areaDef){
  const seen=new Map()
  for(const shape of areaDef.shapes)for(let y=shape.y;y<shape.y+shape.h;y++)for(let x=shape.x;x<shape.x+shape.w;x++)seen.set(cellKey(x,y),{x,y,areaId:areaDef.id,kind:areaDef.kind})
  return [...seen.values()]
}

const mapCaches=new Map()
function cacheFor(mapOrId=DEFAULT_MAP_ID){
  const map=typeof mapOrId==='string'?mapById(mapOrId):mapOrId
  if(mapCaches.has(map.id))return mapCaches.get(map.id)
  const cells=new Map()
  for(const a of map.areas)for(const cell of cellsForArea(a)){
    if(cells.has(cellKey(cell.x,cell.y)))throw new Error(`Overlapping isometric cells at ${map.id}:${cell.x},${cell.y}`)
    cells.set(cellKey(cell.x,cell.y),cell)
  }
  const doors=new Map()
  for(const d of map.doors){
    doors.set(edgeKey(d.a,d.b),d)
    if(d.width>1){
      const horizontal=d.a.y===d.b.y
      for(let i=1;i<d.width;i++){
        const da={x:d.a.x+(horizontal?0:i),y:d.a.y+(horizontal?i:0)}
        const db={x:d.b.x+(horizontal?0:i),y:d.b.y+(horizontal?i:0)}
        doors.set(edgeKey(da,db),{...d,a:da,b:db,part:i})
      }
    }
  }
  const nonBlocking=new Set(['lamp','elevatorDoors','screen'])
  const blocked=new Set(propLayoutFor(map).filter(([type])=>!nonBlocking.has(type)).map(([,x,y])=>cellKey(Math.floor(x),Math.floor(y))))
  const value={map,cells,doors,blocked}
  mapCaches.set(map.id,value)
  return value
}

export function mapById(id=DEFAULT_MAP_ID){return ISO_MAPS.find(m=>m.id===id)||ground}
export function roomById(id,mapId=DEFAULT_MAP_ID){const map=mapById(mapId);return map.areas.find(r=>r.id===id)||map.areas[0]}
export function areaAt(mapOrId,x,y){const {map,cells}=cacheFor(mapOrId);const cell=cells.get(cellKey(Math.floor(x),Math.floor(y)));return cell?roomById(cell.areaId,map.id):null}
export function allTiles(mapOrId=DEFAULT_MAP_ID){return [...cacheFor(mapOrId).cells.values()]}
export function tilesForRoom(areaDef){return cellsForArea(areaDef)}
export const tilesForRect=shape=>cellsForArea({...shape,id:'shape',kind:'room',shapes:[shape]})
export function doorBetween(mapOrId,a,b){return cacheFor(mapOrId).doors.get(edgeKey(a,b))||null}

const themes={
  lobby:{floor:'marble',wall:'hotel'},reception:{floor:'marbleDark',wall:'hotel'},bar:{floor:'wood',wall:'wood'},event:{floor:'carpet',wall:'hotel'},restaurant:{floor:'wood',wall:'hotel'},kitchen:{floor:'kitchen',wall:'service'},service:{floor:'service',wall:'service'},serviceCorridor:{floor:'serviceRunner',wall:'service'},technical:{floor:'technical',wall:'service'},warehouse:{floor:'concrete',wall:'service'},spa:{floor:'stone',wall:'spa'},gym:{floor:'rubber',wall:'service'},elevator:{floor:'marbleDark',wall:'hotel'},entrance:{floor:'stone',wall:'hotel'},corridor:{floor:'corridor',wall:'hotel'},jazz:{floor:'jazzCarpet',wall:'jazz'},jazzCorridor:{floor:'jazzCorridor',wall:'jazz'},jazzLounge:{floor:'wood',wall:'jazz'},jazzService:{floor:'service',wall:'service'},wine:{floor:'wineCarpet',wall:'wine'},wineCorridor:{floor:'wineCorridor',wall:'wine'},wineLounge:{floor:'woodDark',wall:'wine'},wineService:{floor:'service',wall:'service'},
}
export const themeFor=a=>themes[a?.theme]||themes.lobby

function canCross(map,a,b){
  const cache=cacheFor(map),ca=cache.cells.get(cellKey(a.x,a.y)),cb=cache.cells.get(cellKey(b.x,b.y))
  if(!ca||!cb)return false
  if(cache.blocked.has(cellKey(b.x,b.y)))return false
  if(ca.areaId===cb.areaId)return true
  const aa=roomById(ca.areaId,map.id),ab=roomById(cb.areaId,map.id)
  if(aa.kind==='circulation'&&ab.kind==='circulation')return true
  return Boolean(doorBetween(map,a,b))
}

export function isStepWalkable(mapOrId,a,b){
  const map=typeof mapOrId==='string'?mapById(mapOrId):mapOrId
  return canCross(map,a,b)
}

function nearestCell(map,point){
  const cells=allTiles(map)
  return cells.reduce((best,c)=>{
    const d=(c.x+.5-point.x)**2+(c.y+.5-point.y)**2
    return !best||d<best.d?{...c,d}:best
  },null)
}

export function findPath(mapOrId,start,end){
  const map=typeof mapOrId==='string'?mapById(mapOrId):mapOrId
  const from=nearestCell(map,start),to=nearestCell(map,end)
  if(!from||!to)return []
  const q=[from],came=new Map([[cellKey(from.x,from.y),null]])
  for(let qi=0;qi<q.length;qi++){
    const current=q[qi]
    if(current.x===to.x&&current.y===to.y)break
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
      const next={x:current.x+dx,y:current.y+dy},key=cellKey(next.x,next.y)
      if(came.has(key)||!canCross(map,current,next))continue
      came.set(key,current);q.push(next)
    }
  }
  if(!came.has(cellKey(to.x,to.y)))return []
  const result=[]
  for(let cur=to;cur;cur=came.get(cellKey(cur.x,cur.y)))result.push({x:cur.x+.5,y:cur.y+.5})
  return result.reverse()
}

export function routeAreas(fromId,toId,mapId=DEFAULT_MAP_ID){
  const map=mapById(mapId),from=roomById(fromId,map.id),to=roomById(toId,map.id)
  return findPath(map,from.anchor,to.anchor)
}
export const routeZones=(fromId,toId)=>routeAreas(fromId,toId,DEFAULT_MAP_ID)

export function destinationForZone(zone){
  if(/^jazz[1-4]$/.test(zone)||/^wine[5-8]$/.test(zone))return {mapId:zone,areaId:'floor-lounge'}
  if(zone==='hub'||zone==='randhub')return {mapId:'ground',areaId:'lobby'}
  if(zone==='exterior')return {mapId:'ground',areaId:'entrance'}
  if(zone==='ironing'||zone==='laundry'||zone==='staff')return {mapId:'ground',areaId:'service'}
  if(zone==='breakfast')return {mapId:'ground',areaId:'restaurant'}
  return {mapId:'ground',areaId:ground.areas.some(r=>r.id===zone)?zone:'lobby'}
}
