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

function roomNumber(floor,number){return `${floor}${String(number).padStart(2,'0')}`}

// Jazz: unico corridoio, dispari a sinistra e pari a destra. I 76 Jazz Rooms
// pubblici diventano 19 camere per ciascuno dei quattro piani Jazz.
function jazzFloor(floorNumber){
  const areas=[
    area('floor-corridor',`JAZZ · PIANO ${floorNumber}`,'jazzCorridor',[rect(6,10,35,3)],{x:23.5,y:11.5},'circulation'),
    area('service-foyer','PASSAGGIO OFFICE','jazzService',[rect(4,8,2,13)],{x:5,y:14.5},'circulation'),
    area('elevators','ASCENSORI','elevator',[rect(0,8,4,4)],{x:2,y:10}),
    area('service-elevator','ASCENSORE SERVICE','elevator',[rect(0,13,4,4)],{x:2,y:15}),
    area('office-1','OFFICE DI PIANO','jazzService',[rect(0,17,4,4)],{x:2,y:19}),
    area('floor-lounge','NICCHIA JAZZ','jazzLounge',[rect(36,13,5,5)],{x:38.5,y:15.5}),
  ]
  const doors=[
    door('lift-foyer','elevators','service-foyer',{x:3,y:10},{x:4,y:10},2),
    door('service-lift-foyer','service-elevator','service-foyer',{x:3,y:15},{x:4,y:15},2),
    door('office-foyer','office-1','service-foyer',{x:3,y:19},{x:4,y:19},2),
    door('foyer-corridor','service-foyer','floor-corridor',{x:5,y:11},{x:6,y:11},2),
    door('jazz-lounge','floor-lounge','floor-corridor',{x:38,y:13},{x:38,y:12},2),
  ]
  for(let number=1;number<=19;number++){
    const slot=Math.floor((number-1)/2),odd=number%2===1,x=6+slot*3,y=odd?4:13,roomId=`room-${roomNumber(floorNumber,number)}`
    areas.push(area(roomId,`CAMERA ${roomNumber(floorNumber,number)}`,'jazz',[rect(x,y,3,odd?6:5)],{x:x+1.5,y:y+(odd?3:2.5)}))
    doors.push(door(`${roomId}-door`,roomId,'floor-corridor',{x:x+1,y:odd?9:13},{x:x+1,y:odd?10:12}))
  }
  return {id:`jazz${floorNumber}`,label:`Jazz · Piano ${floorNumber}`,shortLabel:`Jazz ${floorNumber}`,kind:'guest',theme:'jazz',level:floorNumber,width:42,height:22,areas,doors,elevatorArea:'elevators',elevatorAreas:['elevators','service-elevator'],roomCount:19}
}

// Wine: camere cantina nella fascia sinistra uscendo dagli ascensori, camere
// normali nella fascia opposta, due nuclei ascensori e office dopo i blocchi.
function wineFloor(floorNumber,roomCount){
  const areas=[
    area('floor-corridor',`WINE · PIANO ${floorNumber}`,'wineCorridor',[rect(6,14,62,3)],{x:37,y:15.5},'circulation'),
    area('elevators','ASCENSORI','elevator',[rect(26,9,5,5)],{x:28.5,y:11.5}),
    area('elevators-15','ASCENSORI · BLOCCO 15','elevator',[rect(56,9,5,5)],{x:58.5,y:11.5}),
    area('office-1','OFFICE · DOPO CAMERA 15','wineService',[rect(66,9,4,5)],{x:68,y:11.5}),
    area('office-2','OFFICE · FINE PIANO','wineService',[rect(58,17,4,5)],{x:60,y:19.5}),
    area('floor-lounge','ANGOLO ENOTECA','wineLounge',[rect(1,17,6,5)],{x:4,y:19.5}),
  ]
  const doors=[
    door('wine-lift-7','elevators','floor-corridor',{x:28,y:13},{x:28,y:14},2),
    door('wine-lift-15','elevators-15','floor-corridor',{x:58,y:13},{x:58,y:14},2),
    door('wine-office-15','office-1','floor-corridor',{x:66,y:13},{x:66,y:14},2),
    door('wine-office-end','office-2','floor-corridor',{x:59,y:17},{x:59,y:16},2),
    door('wine-lounge','floor-lounge','floor-corridor',{x:6,y:17},{x:6,y:16},2),
  ]
  for(let number=1;number<=roomCount;number++){
    const upper=number<=15,slot=upper?number-1:number-16
    const upperX=[8,11,14,17,20,23,32,35,38,41,44,47,50,53,62][slot]
    const x=upper?upperX:(slot===16?63:8+slot*3),y=upper?4:17,cellar=upper&&number<=6
    const roomId=`room-${roomNumber(floorNumber,number)}`,theme=cellar?'wineCellar':'wine'
    areas.push(area(roomId,`${cellar?'CANTINA':'CAMERA'} ${roomNumber(floorNumber,number)}`,theme,[rect(x,y,3,upper?10:5)],{x:x+1.5,y:y+(upper?5:2.5)}))
    doors.push(door(`${roomId}-door`,roomId,'floor-corridor',{x:x+1,y:upper?13:17},{x:x+1,y:upper?14:16}))
  }
  return {id:`wine${floorNumber}`,label:`Wine · Piano ${floorNumber}`,shortLabel:`Wine ${floorNumber}`,kind:'guest',theme:'wine',level:floorNumber,width:71,height:23,areas,doors,elevatorArea:'elevators',elevatorAreas:['elevators','elevators-15'],roomCount}
}

const ground={id:'ground',label:'Hotel Giò · Piano Terra',shortLabel:'Piano Terra',kind:'ground',level:0,width:35,height:29,areas:GROUND_AREAS,doors:GROUND_DOORS,elevatorArea:'elevators'}
const floors=[1,2,3,4].map(jazzFloor).concat([5,6,7,8].map((floor,index)=>wineFloor(floor,index<2?31:32)))

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
  lobby:{floor:'marble',wall:'hotel'},reception:{floor:'marbleDark',wall:'hotel'},bar:{floor:'wood',wall:'wood'},event:{floor:'carpet',wall:'hotel'},restaurant:{floor:'wood',wall:'hotel'},kitchen:{floor:'kitchen',wall:'service'},service:{floor:'service',wall:'service'},serviceCorridor:{floor:'serviceRunner',wall:'service'},technical:{floor:'technical',wall:'service'},warehouse:{floor:'concrete',wall:'service'},spa:{floor:'stone',wall:'spa'},gym:{floor:'rubber',wall:'service'},elevator:{floor:'marbleDark',wall:'hotel'},entrance:{floor:'stone',wall:'hotel'},corridor:{floor:'corridor',wall:'hotel'},jazz:{floor:'jazzCarpet',wall:'jazz'},jazzCorridor:{floor:'jazzCorridor',wall:'jazz'},jazzLounge:{floor:'wood',wall:'jazz'},jazzService:{floor:'service',wall:'service'},wine:{floor:'wineCarpet',wall:'wine'},wineCellar:{floor:'woodDark',wall:'wine'},wineCorridor:{floor:'wineCorridor',wall:'wine'},wineLounge:{floor:'woodDark',wall:'wine'},wineService:{floor:'service',wall:'service'},
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
  const cache=cacheFor(map)
  const cells=allTiles(map).filter(cell=>!cache.blocked.has(cellKey(cell.x,cell.y)))
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
