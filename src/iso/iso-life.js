import { gridToScreen, isoDepth } from './iso-math.js'
import { mapById, roomById, routeAreas } from './iso-world.js'

const ROLE_STYLE=Object.freeze({
  guest:{body:0x7f5a72,accent:0xe5bf69,hair:0x392a25,skin:0xe7bea0},
  business:{body:0x35516a,accent:0x82c7df,hair:0x2a2421,skin:0xd9aa86},
  reception:{body:0x243f52,accent:0xd7ad58,hair:0x4a3026,skin:0xe6b894},
  bartender:{body:0x543743,accent:0xe5d7bd,hair:0x27211f,skin:0xdcae8c},
  waiter:{body:0x293d47,accent:0xf0e4ce,hair:0x342922,skin:0xe1b18d},
  chef:{body:0xe7e0d4,accent:0xb9c7ca,hair:0x4a3a30,skin:0xe5b38f},
  housekeeper:{body:0x3d7477,accent:0xe7d7b6,hair:0x3a2922,skin:0xdba885},
  technician:{body:0x365766,accent:0xe4ab45,hair:0x2b2522,skin:0xd9a37f},
  wellness:{body:0x66846b,accent:0xbde4c5,hair:0x4b3529,skin:0xe6ba98},
})

const GROUND_LIFE=Object.freeze([
  {id:'guest-arrival',role:'guest',icon:'🧳',route:['entrance','lobby','reception','elevators'],speed:.00072,delay:700},
  {id:'guest-lounge',role:'guest',icon:'☕',route:['entrance','lobby','bar','lobby'],speed:.0006,delay:1100},
  {id:'guest-dining',role:'business',icon:'🍽',route:['elevators','north-gallery','lobby','east-gallery','restaurant'],speed:.00066,delay:1700},
  {id:'guest-congress',role:'business',icon:'💬',route:['entrance','lobby','west-gallery','congress'],speed:.00068,delay:2200},
  {id:'front-desk',role:'reception',icon:'🔑',route:['reception','north-gallery','lobby','reception'],speed:.00058,delay:2600},
  {id:'bell-service',role:'reception',icon:'🛎',route:['reception','lobby','entrance','lobby'],speed:.00072,delay:3100},
  {id:'bar-service',role:'bartender',icon:'☕',route:['bar','north-gallery','lobby','bar'],speed:.00056,delay:3600},
  {id:'restaurant-service',role:'waiter',icon:'🍽',route:['restaurant','east-gallery','lobby','restaurant'],speed:.0007,delay:4100},
  {id:'kitchen-runner',role:'chef',icon:'♨',route:['kitchen','restaurant','kitchen','service-spine'],speed:.00062,delay:4700},
  {id:'linen-runner',role:'housekeeper',icon:'▤',route:['service','service-spine','elevators','service-spine'],speed:.00058,delay:5300,cart:true},
  {id:'maintenance-round',role:'technician',icon:'🔧',route:['technical','service-spine','warehouse','service-spine','gym'],speed:.00068,delay:5900,cart:true},
  {id:'spa-host',role:'wellness',icon:'✦',route:['spa','east-gallery','lobby','east-gallery','spa'],speed:.00056,delay:6500},
])

function guestLife(map){
  const rooms=map.areas.filter(area=>area.id.startsWith('room-')).map(area=>area.id)
  const offices=map.areas.filter(area=>area.id.startsWith('office-')).map(area=>area.id)
  const wine=map.theme==='wine'
  return [
    {id:`${map.id}-arrival`,role:wine?'guest':'business',icon:'🧳',route:['elevators','floor-corridor',rooms[2],rooms[2],'floor-lounge'],speed:.00064,delay:800},
    {id:`${map.id}-guest`,role:'guest',icon:wine?'🍷':'♫',route:[rooms[6],'floor-corridor','floor-lounge','floor-corridor',rooms[6]],speed:.00054,delay:2300},
    {id:`${map.id}-housekeeping`,role:'housekeeper',icon:'▤',route:[offices[0],'floor-corridor',rooms[0],'floor-corridor',rooms[4]],speed:.00058,delay:3900,cart:true},
    ...(offices[1]?[{id:`${map.id}-service`,role:'housekeeper',icon:'▣',route:[offices[1],'floor-corridor',rooms[7],'floor-corridor',offices[0]],speed:.00056,delay:5200,cart:true}]:[]),
  ]
}

export function ambientLifeFor(mapOrId='ground'){
  const map=typeof mapOrId==='string'?mapById(mapOrId):mapOrId
  return map.kind==='ground'?[...GROUND_LIFE]:guestLife(map)
}

function addCart(scene,style){
  const cart=scene.add.container(-24,2)
  const base=scene.add.polygon(0,0,[0,0,16,7,0,15,-16,7],0x87979b).setStrokeStyle(1,0x34434a)
  const linen=scene.add.polygon(0,-11,[0,0,13,6,0,13,-13,6],style.accent).setStrokeStyle(1,0x6d665a)
  const rail=scene.add.rectangle(-13,-14,2,25,0xd4ad5f).setRotation(-.38)
  const wheels=[scene.add.circle(-10,10,3,0x172027),scene.add.circle(10,10,3,0x172027)]
  cart.add([base,linen,rail,...wheels]);return cart
}

function makeAmbientActor(scene,spec,map,index){
  const style=ROLE_STYLE[spec.role]||ROLE_STYLE.guest
  const start=roomById(spec.route[0],map.id).anchor,p=gridToScreen(start.x,start.y)
  const c=scene.add.container(p.x,p.y).setDepth(31000+isoDepth(start.x,start.y,index))
  const shadow=scene.add.ellipse(4,14,27,9,0x000000,.3)
  const leftLeg=scene.add.polygon(-5,5,[0,0,6,3,6,17,0,14],0x26333b)
  const rightLeg=scene.add.polygon(5,5,[0,3,6,0,6,14,0,17],0x374750)
  const torso=scene.add.polygon(0,-9,[0,0,13,7,0,25,-13,7],style.body).setStrokeStyle(1,0x152027)
  const collar=scene.add.polygon(0,-7,[0,0,6,3,0,9,-6,3],style.accent,.95)
  const head=scene.add.polygon(0,-27,[0,0,8,4,8,15,0,20,-8,15,-8,4],style.skin).setStrokeStyle(1,0x172127)
  const hair=scene.add.polygon(0,-29,[0,0,8,4,6,8,0,5,-8,8,-8,4],style.hair)
  const bubble=scene.add.text(0,-51,spec.icon,{fontSize:'12px',backgroundColor:'#fffdf2ef',padding:{left:3,right:3,top:2,bottom:2}}).setOrigin(.5).setAlpha(0)
  c.add([shadow,leftLeg,rightLeg,torso,collar,head,hair,bubble])
  if(spec.cart)c.add(addCart(scene,style))
  return {container:c,leftLeg,rightLeg,torso,bubble,spec,mapId:map.id,grid:{...start},areaIndex:0,path:[],target:null,nextMoveAt:spec.delay||0,phase:index*.7}
}

function nextLeg(actor,time){
  const {spec,mapId}=actor
  const from=spec.route[actor.areaIndex],nextIndex=(actor.areaIndex+1)%spec.route.length,to=spec.route[nextIndex]
  actor.path=routeAreas(from,to,mapId).slice(1);actor.target=actor.path.shift()||null;actor.areaIndex=nextIndex
  actor.nextMoveAt=time+700+(actor.areaIndex%3)*260
}

function stepActor(actor,time,delta){
  if(!actor.target){
    if(actor.path.length)actor.target=actor.path.shift()
    else if(time>=actor.nextMoveAt)nextLeg(actor,time)
  }
  let walking=false
  if(actor.target){
    const dx=actor.target.x-actor.grid.x,dy=actor.target.y-actor.grid.y,dist=Math.hypot(dx,dy)
    if(dist<.035){actor.grid={...actor.target};actor.target=actor.path.shift()||null;if(!actor.target)actor.nextMoveAt=time+1050+(actor.areaIndex%3)*420}
    else{const step=(actor.spec.speed||.0006)*delta,k=Math.min(1,step/dist);actor.grid.x+=dx*k;actor.grid.y+=dy*k;walking=true}
  }
  const p=gridToScreen(actor.grid.x,actor.grid.y),walk=Math.sin(time/82+actor.phase)
  actor.container.setPosition(p.x,p.y+(walking?Math.abs(walk)*-1.2:Math.sin(time/430+actor.phase)*.7)).setDepth(31000+isoDepth(actor.grid.x,actor.grid.y,actor.phase*10))
  actor.leftLeg.y=5+(walking?walk*2.4:0);actor.rightLeg.y=5-(walking?walk*2.4:0);actor.torso.y=-9+(walking?Math.abs(walk):0)
  const bubbleCycle=(time+actor.phase*1300)%9200
  actor.bubble.setAlpha(bubbleCycle>6700&&bubbleCycle<8600?Math.min(1,(bubbleCycle-6700)/260,(8600-bubbleCycle)/260):0)
}

function makeEnvironment(scene,map){
  const nodes=[],steam=[],pulses=[]
  const glow=(areaId,color,w,h,alpha=.12)=>{
    const area=roomById(areaId,map.id),p=gridToScreen(area.anchor.x,area.anchor.y)
    const node=scene.add.ellipse(p.x,p.y-8,w,h,color,alpha).setDepth(29500+isoDepth(area.anchor.x,area.anchor.y));nodes.push(node);pulses.push(node);return node
  }
  glow(map.elevatorArea,0xf0c267,125,55,.11)
  if(map.kind==='ground'){
    glow('lobby',0xffd991,260,92,.09);glow('reception',0xffc86f,145,52,.08);glow('technical',0x52d7e8,130,48,.07)
    const kitchen=roomById('kitchen',map.id),kp=gridToScreen(kitchen.anchor.x-.8,kitchen.anchor.y-.3)
    for(let i=0;i<5;i++){const puff=scene.add.circle(kp.x+i*5,kp.y-46-i*7,5+i,0xeaf6f4,.16).setDepth(46000+isoDepth(kitchen.anchor.x,kitchen.anchor.y,i));nodes.push(puff);steam.push({node:puff,baseX:kp.x+i*5,baseY:kp.y-35,offset:i*620})}
  }else glow('floor-lounge',map.theme==='jazz'?0x74bde8:0xd49582,145,52,.08)
  const lift=roomById(map.elevatorArea,map.id),lp=gridToScreen(lift.anchor.x,map.kind==='ground'?lift.anchor.y-1.4:lift.anchor.y-.9)
  const indicator=scene.add.text(lp.x,lp.y-74,map.level?String(map.level):'PT',{fontFamily:'monospace',fontSize:'9px',fontStyle:'bold',color:'#ffe5a8',backgroundColor:'#17232ce8',padding:{left:5,right:5,top:2,bottom:2}}).setOrigin(.5).setDepth(47000+isoDepth(lift.anchor.x,lift.anchor.y));nodes.push(indicator)
  return {nodes,steam,pulses,update(time){
    pulses.forEach((node,i)=>node.setAlpha(.065+Math.sin(time/780+i)*.025))
    steam.forEach((puff,i)=>{const progress=((time+puff.offset)%3100)/3100;puff.node.setPosition(puff.baseX+Math.sin(time/410+i)*7,puff.baseY-progress*70).setAlpha(Math.sin(progress*Math.PI)*.22).setScale(.7+progress*.9)})
    indicator.setAlpha(.58+Math.sin(time/520)*.34)
  }}
}

export function createHotelLife(scene,mapOrId='ground'){
  const map=typeof mapOrId==='string'?mapById(mapOrId):mapOrId
  const actors=ambientLifeFor(map).map((spec,index)=>makeAmbientActor(scene,spec,map,index))
  const environment=makeEnvironment(scene,map)
  return {mapId:map.id,actors,environment,update(time,delta){for(const actor of actors)stepActor(actor,time,delta);environment.update(time)},destroy(){for(const actor of actors)actor.container.destroy(true);for(const node of environment.nodes)node.destroy?.()}}
}
