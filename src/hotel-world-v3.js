// RandAILive v3 world model.
// Inspired by StarNet's model -> projection -> renderer separation, but authored for Hotel Giò.
export const TILE=16
export const WORLD={width:1536,height:960}

const room=(id,label,x,y,w,h,kind,door='south',theme='hotel')=>({id,label,x,y,w,h,kind,door,theme})

export const ROOMS=Object.freeze([
  room('jazz1','JAZZ 1',64,70,176,160,'guest','south','jazz'),
  room('jazz2','JAZZ 2',252,70,176,160,'guest','south','jazz'),
  room('jazz3','JAZZ 3',440,70,176,160,'guest','south','jazz'),
  room('jazz4','JAZZ 4',628,70,176,160,'guest','south','jazz'),
  room('wine5','WINE 5',836,70,176,160,'guest','south','wine'),
  room('wine6','WINE 6',1024,70,176,160,'guest','south','wine'),
  room('wine7','WINE 7',1212,70,176,160,'guest','south','wine'),

  room('congress','CONGRESSI',64,356,250,230,'events','east','event'),
  room('meeting','MEETING',326,356,180,230,'events','south','event'),
  room('reception','RECEPTION',520,338,270,250,'public','south','lobby'),
  room('bar','BAR & LOUNGE',804,356,210,230,'food','south','bar'),
  room('breakfast','RISTORANTE',1028,356,250,230,'food','south','restaurant'),
  room('kitchen','CUCINA',1292,356,180,230,'service','west','service'),

  room('laundry','LAVANDERIA',64,700,190,170,'service','north','service'),
  room('ironing','STIRERIA',268,700,170,170,'service','north','service'),
  room('warehouse','MAGAZZINO',452,700,190,170,'service','north','service'),
  room('technical','MANUTENZIONE',656,700,230,170,'service','north','technical'),
  room('staff','STAFF',900,700,165,170,'service','north','service'),
  room('spa','SPA',1079,700,180,170,'wellness','north','spa'),
  room('gym','PALESTRA',1273,700,199,170,'wellness','north','gym'),
])

export const OPEN_SPACES=Object.freeze([
  room('northHall','CORRIDOIO CAMERE',48,246,1424,72,'corridor','none','corridor'),
  room('lobby','HALL',500,272,550,64,'public','none','lobby'),
  room('randhub','RAND HUB',616,602,320,70,'ai','none','hub'),
  room('serviceHall','CORRIDOIO SERVICE',48,612,1424,72,'corridor','none','service'),
  room('entrance','INGRESSO',604,884,328,56,'exterior','none','entrance'),
])

export const AREAS=Object.freeze([...ROOMS,...OPEN_SPACES])
export const areaById=id=>AREAS.find(a=>a.id===id)||OPEN_SPACES.find(a=>a.id==='randhub')
export const centerOf=a=>({x:a.x+a.w/2,y:a.y+a.h/2})

export function doorwayOf(a){
  const g=40
  if(a.door==='north')return{x:a.x+a.w/2,y:a.y+2,w:g,h:6}
  if(a.door==='south')return{x:a.x+a.w/2,y:a.y+a.h-2,w:g,h:6}
  if(a.door==='east')return{x:a.x+a.w-2,y:a.y+a.h/2,w:6,h:g}
  if(a.door==='west')return{x:a.x+2,y:a.y+a.h/2,w:6,h:g}
  return{x:a.x+a.w/2,y:a.y+a.h/2,w:g,h:g}
}

const top=new Set(['jazz1','jazz2','jazz3','jazz4','wine5','wine6','wine7'])
const bottom=new Set(['laundry','ironing','warehouse','technical','staff','spa','gym'])

export function routeBetween(fromId,toId){
  const from=areaById(fromId),to=areaById(toId)
  const points=[]
  const push=p=>{const last=points.at(-1);if(!last||last.x!==p.x||last.y!==p.y)points.push(p)}
  const f=doorwayOf(from),t=doorwayOf(to)
  push({x:f.x,y:f.y})
  if(top.has(from.id))push({x:f.x,y:282})
  if(bottom.has(from.id))push({x:f.x,y:648})

  if(top.has(to.id)){
    push({x:768,y:304})
    push({x:t.x,y:282})
  }else if(bottom.has(to.id)){
    push({x:768,y:637})
    push({x:t.x,y:648})
  }else{
    push({x:768,y:304})
    push({x:768,y:520})
  }
  push({x:t.x,y:t.y})
  push(centerOf(to))
  return points
}

export const THEME=Object.freeze({
  jazz:{floor:'#7f6048',floor2:'#6d503d',wall:'#684a39',accent:'#e1b56f',light:'#ffd08a'},
  wine:{floor:'#724556',floor2:'#613949',wall:'#5b3443',accent:'#e582a1',light:'#ffc0d2'},
  event:{floor:'#74453f',floor2:'#633a36',wall:'#56352f',accent:'#e37d66',light:'#ffc17d'},
  lobby:{floor:'#b59b74',floor2:'#a58a64',wall:'#735845',accent:'#e7c77e',light:'#ffd891'},
  bar:{floor:'#795437',floor2:'#66442f',wall:'#5b3d2c',accent:'#e5b666',light:'#ffbd68'},
  restaurant:{floor:'#8b6545',floor2:'#735239',wall:'#624531',accent:'#e2b26b',light:'#ffc77a'},
  service:{floor:'#697278',floor2:'#586168',wall:'#4b555b',accent:'#96bccb',light:'#d6f1ff'},
  technical:{floor:'#535b60',floor2:'#444b50',wall:'#394247',accent:'#65c8ec',light:'#bbebff'},
  spa:{floor:'#6d7967',floor2:'#5b6857',wall:'#52604e',accent:'#a8d7a2',light:'#dbffd4'},
  gym:{floor:'#4c555b',floor2:'#3d464c',wall:'#353f45',accent:'#a2c2d4',light:'#d7f1ff'},
  corridor:{floor:'#bda782',floor2:'#a9916d',wall:'#765f49',accent:'#dfbd77',light:'#ffd48c'},
  hub:{floor:'#183b49',floor2:'#102f3b',wall:'#17303b',accent:'#56ddff',light:'#7feaff'},
  entrance:{floor:'#a98f68',floor2:'#8c7658',wall:'#6c5842',accent:'#e1c37a',light:'#ffe0a0'},
})

export const roomTheme=a=>THEME[a.theme]||THEME.lobby

export const PROP_SETS=Object.freeze({
  jazz:['bed','nightstand','wardrobe','deskLamp','plant'],
  wine:['bed','nightstand','wineRack','deskLamp','plant'],
  event:['stage','chairs','screen','plant'],
  lobby:['desk','sofa','coffeeTable','plant','luggage'],
  bar:['barCounter','stool','stool','bottleRack','table'],
  restaurant:['table','table','buffet','plant','table'],
  service:['rack','crate','locker','cart'],
  technical:['workbench','toolWall','rack','terminal'],
  spa:['lounger','lounger','plant','plant'],
  gym:['treadmill','bench','rack'],
  hub:['terminal','core','terminal'],
  entrance:['planter','planter','luggage'],
})

export function propsForArea(a){
  if(a.id==='reception')return ['desk','desk','sofa','plant','luggage']
  if(a.id==='laundry')return ['washer','washer','linenRack','cart']
  if(a.id==='ironing')return ['ironingTable','linenRack','cart']
  if(a.id==='warehouse')return ['rack','rack','crate','crate']
  if(a.id==='staff')return ['locker','locker','bench']
  if(a.id==='meeting')return ['meetingTable','screen','plant']
  if(a.id==='breakfast')return PROP_SETS.restaurant
  if(a.id==='kitchen')return ['prepCounter','fridge','rack','prepCounter']
  return PROP_SETS[a.theme]||['plant']
}

export function placedProps(a){
  const list=propsForArea(a), cols=Math.min(3,Math.max(2,Math.ceil(Math.sqrt(list.length))))
  const rows=Math.ceil(list.length/cols)
  const x0=a.x+26,y0=a.y+58,x1=a.x+a.w-26,y1=a.y+a.h-26
  return list.map((type,i)=>({
    id:`${a.id}:${type}:${i}`,type,roomId:a.id,
    x:x0+(i%cols+.5)*(x1-x0)/cols,
    y:y0+(Math.floor(i/cols)+.5)*(y1-y0)/rows,
    z:y0+(Math.floor(i/cols)+.5)*(y1-y0)/rows,
  }))
}

export function projectWorld(){
  return {
    world:WORLD,
    rooms:ROOMS.map(r=>({...r,theme:roomTheme(r),doorway:doorwayOf(r),props:placedProps(r)})),
    spaces:OPEN_SPACES.map(r=>({...r,theme:roomTheme(r),props:placedProps(r)})),
  }
}
