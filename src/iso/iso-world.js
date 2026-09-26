const rect=(id,label,x,y,w,h,theme,anchor)=>({id,label,x,y,w,h,theme,anchor:anchor||{x:x+w/2,y:y+h/2}})
const hall=(id,x,y,w,h,axis='v')=>({id,x,y,w,h,axis,theme:'corridor'})

export const ISO_WORLD={
  width:1920,
  height:1180,
  rooms:[
    rect('lobby','HALL',0,0,7,6,'lobby',{x:3.5,y:3}),
    rect('reception','RECEPTION',1,-3,4,3,'reception',{x:3,y:-1.3}),
    rect('bar','BAR & LOUNGE',-5,-1,5,5,'bar',{x:-2.3,y:1.5}),
    rect('congress','CONGRESSI',-7,5,6,5,'event',{x:-4,y:7.5}),
    rect('meeting','MEETING',-1,6,4,4,'event',{x:1,y:8}),
    rect('restaurant','RISTORANTE',7,-1,5,5,'restaurant',{x:9.3,y:1.5}),
    rect('kitchen','CUCINA',11,4,4,4,'service',{x:13,y:6}),
    rect('service','SERVICE',4,8,7,5,'service',{x:7.5,y:10.4}),
    rect('technical','MANUTENZIONE',3,13,4,3,'technical',{x:5,y:14.5}),
    rect('warehouse','MAGAZZINO',8,13,4,3,'service',{x:10,y:14.5}),
    rect('spa','SPA',12,9,4,4,'spa',{x:14,y:11}),
    rect('gym','PALESTRA',12,14,4,3,'gym',{x:14,y:15.5}),
    rect('elevators','ASCENSORI',2,-7,3,3,'elevator',{x:3.5,y:-5.5}),
    rect('entrance','INGRESSO',1,7,5,2,'entrance',{x:3.5,y:8}),
  ],
  corridors:[
    hall('lift-corridor',2,-4,3,1,'v'),
    hall('west-gallery',-2,4,3,3,'h'),
    hall('congress-gallery',-3,5,2,4,'v'),
    hall('south-gallery',2,6,3,2,'v'),
    hall('service-link',4,6,4,2,'h'),
    hall('east-gallery',7,4,5,2,'h'),
    hall('kitchen-link',10,5,2,3,'v'),
    hall('service-spine',6,7,3,2,'v'),
    hall('spa-link',11,10,2,2,'h'),
    hall('gym-link',13,13,2,2,'v'),
  ],
  connectors:[
    {from:'reception',to:'lobby',via:[{x:3,y:-.2},{x:3,y:.6}]},
    {from:'bar',to:'lobby',via:[{x:-.3,y:1.8},{x:.7,y:1.8}]},
    {from:'congress',to:'lobby',via:[{x:-1.8,y:6.5},{x:-.5,y:5.2},{x:.7,y:4.4}]},
    {from:'meeting',to:'lobby',via:[{x:1.2,y:6.3},{x:1.5,y:5.3}]},
    {from:'restaurant',to:'lobby',via:[{x:7.3,y:1.8},{x:6.3,y:1.8}]},
    {from:'kitchen',to:'restaurant',via:[{x:11.2,y:5.5},{x:10.5,y:4.6}]},
    {from:'service',to:'lobby',via:[{x:7.1,y:8.1},{x:6.4,y:7.2},{x:5.2,y:6.2}]},
    {from:'technical',to:'service',via:[{x:5.1,y:13.1},{x:5.5,y:12.2}]},
    {from:'warehouse',to:'service',via:[{x:10,y:13.1},{x:9.6,y:12.2}]},
    {from:'spa',to:'service',via:[{x:12.1,y:11},{x:11.2,y:10.8},{x:10.5,y:10.8}]},
    {from:'gym',to:'spa',via:[{x:14,y:14.1},{x:14,y:12.8}]},
    {from:'elevators',to:'reception',via:[{x:3.5,y:-4.1},{x:3.5,y:-3.2}]},
    {from:'entrance',to:'lobby',via:[{x:3.5,y:7.1},{x:3.5,y:5.7}]},
  ]
}

const themes={
  lobby:{floor:'marble',wall:'hotel'},
  reception:{floor:'marble',wall:'hotel'},
  bar:{floor:'wood',wall:'wood'},
  event:{floor:'carpet',wall:'hotel'},
  restaurant:{floor:'wood',wall:'hotel'},
  service:{floor:'service',wall:'service'},
  technical:{floor:'service',wall:'service'},
  spa:{floor:'stone',wall:'spa'},
  gym:{floor:'rubber',wall:'service'},
  elevator:{floor:'marble',wall:'hotel'},
  entrance:{floor:'stone',wall:'hotel'},
  corridor:{floor:'corridor',wall:'hotel'},
}
export const roomById=id=>ISO_WORLD.rooms.find(r=>r.id===id)||ISO_WORLD.rooms[0]
export const themeFor=r=>themes[r.theme]||themes.lobby

export function tilesForRect(r){
  const out=[]
  for(let y=r.y;y<r.y+r.h;y++)for(let x=r.x;x<r.x+r.w;x++)out.push({x,y,roomId:r.id,kind:r.theme==='corridor'?'corridor':'room'})
  return out
}
export const tilesForRoom=tilesForRect

export function allTiles(){
  const seen=new Map()
  for(const corridor of ISO_WORLD.corridors)for(const t of tilesForRect(corridor))seen.set(`${t.x},${t.y}`,t)
  for(const room of ISO_WORLD.rooms)for(const t of tilesForRect(room))seen.set(`${t.x},${t.y}`,t)
  return [...seen.values()]
}

export function connectorByRooms(a,b){
  return ISO_WORLD.connectors.find(c=>(c.from===a&&c.to===b)||(c.from===b&&c.to===a))
}

export function routeZones(fromId,toId){
  if(fromId===toId)return [roomById(toId).anchor]
  const graph=new Map()
  for(const c of ISO_WORLD.connectors){
    if(!graph.has(c.from))graph.set(c.from,[])
    if(!graph.has(c.to))graph.set(c.to,[])
    graph.get(c.from).push(c.to);graph.get(c.to).push(c.from)
  }
  const q=[[fromId]],seen=new Set([fromId])
  let chain=null
  while(q.length){
    const p=q.shift(),last=p.at(-1)
    if(last===toId){chain=p;break}
    for(const n of graph.get(last)||[])if(!seen.has(n)){seen.add(n);q.push([...p,n])}
  }
  const rooms=chain||[fromId,toId]
  const points=[]
  for(let i=0;i<rooms.length-1;i++){
    const c=connectorByRooms(rooms[i],rooms[i+1])
    if(c?.via?.length)points.push(...(c.from===rooms[i]?c.via:[...c.via].reverse()))
    points.push(roomById(rooms[i+1]).anchor)
  }
  return points
}
