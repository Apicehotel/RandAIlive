const rect=(id,label,x,y,w,h,theme,anchor)=>({id,label,x,y,w,h,theme,anchor:anchor||{x:x+w/2,y:y+h/2}})

export const ISO_WORLD={
  width:1920,
  height:1180,
  rooms:[
    rect('lobby','HALL',{x:0}.x,0,7,6,'lobby',{x:3.5,y:3}),
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
  connectors:[
    {from:'reception',to:'lobby'},
    {from:'bar',to:'lobby'},
    {from:'congress',to:'lobby'},
    {from:'meeting',to:'lobby'},
    {from:'restaurant',to:'lobby'},
    {from:'kitchen',to:'restaurant'},
    {from:'service',to:'lobby'},
    {from:'technical',to:'service'},
    {from:'warehouse',to:'service'},
    {from:'spa',to:'service'},
    {from:'gym',to:'spa'},
    {from:'elevators',to:'reception'},
    {from:'entrance',to:'lobby'},
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
}
export const roomById=id=>ISO_WORLD.rooms.find(r=>r.id===id)||ISO_WORLD.rooms[0]
export const themeFor=r=>themes[r.theme]||themes.lobby

export function tilesForRoom(room){
  const out=[]
  for(let y=room.y;y<room.y+room.h;y++)for(let x=room.x;x<room.x+room.w;x++)out.push({x,y,roomId:room.id})
  return out
}

export function allTiles(){
  const seen=new Map()
  for(const room of ISO_WORLD.rooms)for(const t of tilesForRoom(room))seen.set(`${t.x},${t.y}`,t)
  return [...seen.values()]
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
  return (chain||[fromId,toId]).slice(1).map(id=>roomById(id).anchor)
}
