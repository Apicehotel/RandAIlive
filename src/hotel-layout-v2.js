export const WORLD = Object.freeze({ width: 1440, height: 900 })

const area = (id,label,x,y,w,h,kind,door='south') => ({id,label,x,y,w,h,kind,door})

export const HOTEL_LAYOUT = Object.freeze([
  area('jazz1','JAZZ · PIANO 1',40,45,150,150,'guest','south'),
  area('jazz2','JAZZ · PIANO 2',205,45,150,150,'guest','south'),
  area('jazz3','JAZZ · PIANO 3',370,45,150,150,'guest','south'),
  area('jazz4','JAZZ · PIANO 4',535,45,150,150,'guest','south'),
  area('wine5','WINE · PIANO 5',755,45,150,150,'wine','south'),
  area('wine6','WINE · PIANO 6',920,45,150,150,'wine','south'),
  area('wine7','WINE · PIANO 7',1085,45,150,150,'wine','south'),
  area('wine8','WINE · PIANO 8',1250,45,150,150,'wine','south'),

  area('congress','SALA CONGRESSI',40,310,250,205,'events','east'),
  area('meeting','SALE MEETING',305,310,190,205,'events','south'),
  area('reception','RECEPTION',510,310,260,205,'public','south'),
  area('bar','BAR & LOUNGE',785,310,220,205,'food','south'),
  area('breakfast','RISTORANTE',1020,310,230,205,'food','south'),
  area('kitchen','CUCINA',1265,310,135,205,'service','west'),

  area('laundry','LAVANDERIA',40,630,190,165,'service','north'),
  area('ironing','STIRERIA',245,630,170,165,'service','north'),
  area('warehouse','MAGAZZINO',430,630,190,165,'service','north'),
  area('technical','MANUTENZIONE',635,630,220,165,'service','north'),
  area('staff','STAFF',870,630,155,165,'service','north'),
  area('spa','SPA',1040,630,165,165,'wellness','north'),
  area('gym','PALESTRA',1220,630,180,165,'wellness','north'),
])

export const HOTEL_SHARED = Object.freeze({
  lobby: area('lobby','LOBBY',505,225,510,70,'public','none'),
  hub: area('hub','RAND HUB',595,530,250,70,'ai','none'),
  exterior: area('exterior','INGRESSO',565,810,310,65,'exterior','none'),
})

export const ALL_AREAS = Object.freeze([...HOTEL_LAYOUT, ...Object.values(HOTEL_SHARED)])

export const areaById = id => ALL_AREAS.find(a=>a.id===id) || HOTEL_SHARED.hub

export function centerOf(a){ return {x:a.x+a.w/2,y:a.y+a.h/2} }

export function doorwayOf(a){
  if(a.door==='none') return centerOf(a)
  if(a.door==='north') return {x:a.x+a.w/2,y:a.y}
  if(a.door==='east') return {x:a.x+a.w,y:a.y+a.h/2}
  if(a.door==='west') return {x:a.x,y:a.y+a.h/2}
  return {x:a.x+a.w/2,y:a.y+a.h}
}

const topIds=new Set(['jazz1','jazz2','jazz3','jazz4','wine5','wine6','wine7','wine8'])
const bottomIds=new Set(['laundry','ironing','warehouse','technical','staff','spa','gym'])

export function routeBetween(fromId,toId){
  const target=areaById(toId)
  const from=areaById(fromId)
  const points=[]
  const src=doorwayOf(from),dst=doorwayOf(target)
  points.push(src)

  if(topIds.has(from.id)||topIds.has(target.id)){
    const topHallY=238
    if(topIds.has(from.id)) points.push({x:src.x,y:topHallY})
    else points.push({x:centerOf(HOTEL_SHARED.lobby).x,y:topHallY})
    if(topIds.has(target.id)) points.push({x:dst.x,y:topHallY})
  }

  if(bottomIds.has(from.id)||bottomIds.has(target.id)){
    const serviceHallY=595
    if(bottomIds.has(from.id)) points.push({x:src.x,y:serviceHallY})
    else points.push({x:centerOf(HOTEL_SHARED.hub).x,y:serviceHallY})
    if(bottomIds.has(target.id)) points.push({x:dst.x,y:serviceHallY})
  }

  if(!topIds.has(target.id)&&!bottomIds.has(target.id)){
    const lobby=centerOf(HOTEL_SHARED.lobby)
    points.push({x:lobby.x,y:lobby.y})
  }

  points.push(dst)
  points.push(centerOf(target))
  return points.filter((p,i,a)=>i===0||p.x!==a[i-1].x||p.y!==a[i-1].y)
}

export const ROOM_PROPS = Object.freeze({
  guest:['bed','nightstand','wardrobe','plant'],
  wine:['bed','nightstand','wineRack','plant'],
  public:['desk','sofa','plant','luggage'],
  food:['counter','table','table','plant'],
  events:['stage','chairs','screen'],
  service:['rack','workbench','crate'],
  wellness:['lounger','plant','bench'],
  ai:['terminal','terminal','core'],
  exterior:['planter','planter'],
})

export function propsForArea(a){
  if(a.id==='reception') return ['desk','desk','sofa','plant','luggage']
  if(a.id==='bar') return ['counter','stool','stool','table','plant']
  if(a.id==='breakfast') return ['table','table','table','buffet','plant']
  if(a.id==='kitchen') return ['counter','fridge','rack']
  if(a.id==='laundry') return ['washer','washer','linenRack']
  if(a.id==='ironing') return ['ironingTable','linenRack']
  if(a.id==='technical') return ['workbench','toolWall','rack']
  if(a.id==='warehouse') return ['rack','rack','crate','crate']
  if(a.id==='congress') return ['stage','chairs','chairs','screen']
  if(a.id==='meeting') return ['meetingTable','screen','plant']
  if(a.id==='gym') return ['treadmill','bench']
  if(a.id==='spa') return ['lounger','lounger','plant']
  return ROOM_PROPS[a.kind] || ['plant']
}

export function propPositions(a){
  const list=propsForArea(a)
  const cols=Math.min(3,Math.max(2,Math.ceil(Math.sqrt(list.length))))
  const rows=Math.ceil(list.length/cols)
  const left=a.x+24,top=a.y+58,right=a.x+a.w-24,bottom=a.y+a.h-26
  const width=Math.max(20,right-left),height=Math.max(20,bottom-top)
  return list.map((type,i)=>({
    id:`${a.id}-${i}-${type}`,type,
    x:left+(i%cols+.5)*(width/cols),
    y:top+(Math.floor(i/cols)+.5)*(height/rows),
  }))
}
