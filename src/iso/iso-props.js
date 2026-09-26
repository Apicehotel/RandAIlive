import { gridToScreen, isoDepth } from './iso-math.js'

const P={
  walnut:{top:0xa8774d,left:0x62432f,right:0x7b5439,edge:0x34241b,hi:0xd3a36f},
  oak:{top:0xc69a64,left:0x84613f,right:0xa77b4f,edge:0x493522,hi:0xe6bd83},
  cream:{top:0xe6d7bd,left:0xa99a82,right:0xc7b79c,edge:0x6a604f,hi:0xfff3dd},
  teal:{top:0x4d8891,left:0x2b565e,right:0x39717a,edge:0x18373d,hi:0x77b9bf},
  red:{top:0xa34c58,left:0x632d36,right:0x7f3b45,edge:0x3d1d23,hi:0xd8757e},
  gold:{top:0xd4ad5f,left:0x8c6e38,right:0xb18b48,edge:0x59451f,hi:0xf3d392},
  steel:{top:0xaab7ba,left:0x627176,right:0x7f8d91,edge:0x3c484c,hi:0xd8e1e2},
  dark:{top:0x43505a,left:0x222c34,right:0x303b44,edge:0x12191f,hi:0x70808a},
  green:{top:0x6f9f70,left:0x3f6f49,right:0x51865b,edge:0x274a31,hi:0x9ac99a},
  blue:{top:0x4d7299,left:0x2c4865,right:0x3a5d7e,edge:0x1c3145,hi:0x739dc5},
}

function shadow(g,x,y,w,h,alpha=.24){g.fillStyle(0x071016,alpha).fillEllipse(x+8,y+7,w,h)}
function prism(g,x,y,w,d,h,m=P.walnut){
  const top=[{x,y:y-h},{x:x+w,y:y-h+d/2},{x,y:y-h+d},{x:x-w,y:y-h+d/2}]
  const left=[top[3],top[2],{x:top[2].x,y:top[2].y+h},{x:top[3].x,y:top[3].y+h}]
  const right=[top[2],top[1],{x:top[1].x,y:top[1].y+h},{x:top[2].x,y:top[2].y+h}]
  g.fillStyle(m.left,1).fillPoints(left,true);g.fillStyle(m.right,1).fillPoints(right,true);g.fillStyle(m.top,1).fillPoints(top,true)
  g.lineStyle(2,m.edge,.78).strokePoints(top,true);g.lineStyle(1,m.hi,.46).lineBetween(top[0].x,top[0].y,top[1].x,top[1].y)
}
function leg(g,x,y,h=22,m=P.dark){prism(g,x,y,3,3,h,m)}

function sofa(g,x,y,m=P.teal){
  shadow(g,x,y,74,25);prism(g,x,y,31,23,17,m);prism(g,x,y-18,30,16,23,m)
  prism(g,x-31,y-5,7,13,22,m);prism(g,x+31,y-5,7,13,22,m)
  g.lineStyle(1,m.hi,.35).lineBetween(x,y-32,x,y-14)
}
function coffeeTable(g,x,y){shadow(g,x,y,56,18);leg(g,x,y+8,20,P.steel);prism(g,x,y,27,18,8,P.oak)}
function diningTable(g,x,y){
  shadow(g,x,y,72,25);for(const dx of [-20,20])leg(g,x+dx,y+8,24,P.dark);prism(g,x,y,37,24,8,P.walnut)
}
function chair(g,x,y,m=P.red){shadow(g,x,y,30,12,.18);leg(g,x-7,y+5,15);leg(g,x+7,y+5,15);prism(g,x,y,13,12,7,m);prism(g,x,y-12,12,8,20,m)}
function receptionDesk(g,x,y){
  shadow(g,x,y,108,32);prism(g,x,y,48,28,35,P.walnut);prism(g,x,y-34,45,24,8,P.cream)
  g.fillStyle(P.gold.top,.9).fillPoints([{x:x-24,y:y-16},{x,y:y-5},{x:x+24,y:y-16},{x,y:y-26}],true)
}
function barCounter(g,x,y){
  shadow(g,x,y,112,34);prism(g,x,y,51,28,37,P.walnut);prism(g,x,y-36,50,25,7,P.steel)
  for(let i=-30;i<=30;i+=20)g.fillStyle(0xf5d99a,.32).fillCircle(x+i,y-29,3)
}
function plant(g,x,y){
  shadow(g,x,y,35,14,.18);prism(g,x,y,11,9,15,P.cream)
  g.fillStyle(P.green.left,1).fillEllipse(x-8,y-30,18,30);g.fillStyle(P.green.right,1).fillEllipse(x+8,y-34,18,32);g.fillStyle(P.green.top,1).fillEllipse(x,y-43,17,34)
  g.lineStyle(2,P.green.hi,.35).lineBetween(x,y-18,x,y-48)
}
function lamp(g,x,y){
  g.fillStyle(0xffdf9a,.09).fillEllipse(x,y-20,90,48);prism(g,x,y,6,5,31,P.gold)
  g.fillStyle(0xffe3a0,1).fillPoints([{x,y:y-52},{x:x+18,y:y-43},{x,y:y-34},{x:x-18,y:y-43}],true)
  g.fillStyle(0xfff0be,.7).fillCircle(x,y-43,4)
}
function screen(g,x,y){
  shadow(g,x,y,38,13,.15);prism(g,x,y,18,12,28,P.steel)
  g.fillStyle(0x071a23,1).fillPoints([{x,y:y-38},{x:x+14,y:y-31},{x,y:y-23},{x:x-14,y:y-31}],true)
  g.lineStyle(2,0x5fe4ff,.9).strokePoints([{x,y:y-38},{x:x+14,y:y-31},{x,y:y-23},{x:x-14,y:y-31}],true)
}
function trolley(g,x,y){
  shadow(g,x,y,52,17);prism(g,x,y,22,15,30,P.steel);prism(g,x,y-28,20,13,8,P.cream)
  g.fillStyle(0x1a2227,1).fillCircle(x-17,y+4,4);g.fillCircle(x+17,y+4,4)
  g.lineStyle(2,P.gold.top,.8).strokeRoundedRect(x-25,y-40,50,31,3)
}
function luggage(g,x,y,m=P.red){shadow(g,x,y,25,10);prism(g,x,y,11,9,25,m);g.lineStyle(2,P.steel.top,.9).strokeRect(x-5,y-36,10,13)}
function shelf(g,x,y,m=P.dark){
  shadow(g,x,y,58,16);prism(g,x,y,26,11,52,m)
  for(const py of [y-12,y-27,y-42]){g.lineStyle(3,m.hi,.55).lineBetween(x-21,py+5,x,py+15);g.lineBetween(x,py+15,x+21,py+5)}
}
function crate(g,x,y,m=P.oak){shadow(g,x,y,34,13);prism(g,x,y,16,13,19,m);g.lineStyle(2,m.edge,.4).lineBetween(x-10,y-10,x+10,y)}
function kitchenUnit(g,x,y){
  shadow(g,x,y,70,22);prism(g,x,y,31,20,30,P.steel)
  for(let i=-18;i<=18;i+=12){g.fillStyle(0x182126,.8).fillEllipse(x+i,y-28,8,4);g.lineStyle(1,0xeaf5f5,.45).strokeEllipse(x+i,y-28,8,4)}
}
function washer(g,x,y){
  shadow(g,x,y,48,18);prism(g,x,y,21,18,35,P.steel)
  g.fillStyle(0x172b34,1).fillEllipse(x+9,y-16,21,13);g.lineStyle(3,0xbfe7ef,.8).strokeEllipse(x+9,y-16,21,13)
}
function workbench(g,x,y){
  shadow(g,x,y,70,22);prism(g,x,y,31,20,24,P.dark);prism(g,x,y-24,30,18,5,P.steel)
  g.lineStyle(3,0xe2aa47,.9).lineBetween(x-21,y-18,x+5,y-7);g.lineStyle(3,0x56c7dd,.8).lineBetween(x-5,y-12,x+20,y-21)
}
function spaBed(g,x,y){shadow(g,x,y,75,23);prism(g,x,y,34,21,14,P.cream);prism(g,x-22,y-10,10,9,8,P.teal)}
function treadmill(g,x,y){
  shadow(g,x,y,62,18);prism(g,x,y,27,15,8,P.dark);g.lineStyle(4,P.steel.top,.9).lineBetween(x+18,y-4,x+18,y-42);g.lineBetween(x+18,y-42,x-2,y-49)
  g.fillStyle(0x55d7e9,.9).fillRect(x-7,y-52,13,7)
}
function bed(g,x,y,m=P.blue){
  shadow(g,x,y,82,25);prism(g,x,y,37,23,16,P.walnut);prism(g,x,y-15,35,21,10,m)
  prism(g,x-19,y-19,14,10,7,P.cream);prism(g,x+12,y-13,14,10,7,P.cream)
}
function wardrobe(g,x,y,m=P.walnut){shadow(g,x,y,49,15);prism(g,x,y,22,13,55,m);g.fillStyle(P.gold.top,1).fillCircle(x+8,y-25,2)}
function desk(g,x,y){shadow(g,x,y,51,16);leg(g,x-15,y+5,22);leg(g,x+15,y+5,22);prism(g,x,y,23,14,6,P.oak);screen(g,x+3,y-8)}
function elevatorDoors(g,x,y,accent=0xd4ad5f){
  shadow(g,x,y,105,20,.18);prism(g,x,y,48,12,64,P.dark)
  const left=[{x:x-36,y:y-58},{x,y:y-41},{x,y:y+3},{x:x-36,y:y-14}]
  const right=[{x,y:y-41},{x:x+36,y:y-58},{x:x+36,y:y-14},{x,y:y+3}]
  g.fillStyle(0x829096,1).fillPoints(left,true);g.fillStyle(0x69777e,1).fillPoints(right,true)
  g.lineStyle(3,accent,.82).strokePoints([...left.slice(0,2),...right.slice(1,3),right[3],left[3]],true)
  g.lineStyle(2,0xdce6e7,.35).lineBetween(x,y-40,x,y+2)
}

const DRAW={sofa,coffeeTable,diningTable,chair,receptionDesk,barCounter,plant,lamp,screen,trolley,luggage,shelf,crate,kitchenUnit,washer,workbench,spaBed,treadmill,bed,wardrobe,desk,elevatorDoors}

const groundProps=[
  ['elevatorDoors',18.5,4.1],['receptionDesk',11.7,5.4],['receptionDesk',13.3,5.4],['screen',10.4,4.2],['luggage',14.2,5.8],['plant',9.5,5.7],
  ['sofa',11.4,12],['sofa',16.6,14.7],['sofa',12.2,16.7],['coffeeTable',13.8,13.7],['coffeeTable',15.3,16],['plant',10.6,15.2],['plant',17.1,11.2],['lamp',15.6,11.3],
  ['barCounter',3.1,5.8],['barCounter',5.1,5.8],['chair',2.2,7.2],['chair',3.4,8.2],['chair',4.8,8.7],['diningTable',6.2,7.4],['plant',6.8,9],['shelf',1.7,5.2],
  ['screen',2.7,14.4],['diningTable',2,17],['diningTable',4.2,18.5],['diningTable',2.3,21],['chair',1.1,16],['chair',3.1,16],['chair',4.5,17.3],['chair',1,19.5],['chair',4.5,21],
  ['diningTable',10.5,17.2],['chair',9.5,18.2],['chair',11.2,19.4],['screen',10.5,16.2],
  ['diningTable',29.5,11.8],['diningTable',32,13],['diningTable',29.5,15],['chair',28.8,12.8],['chair',31,11.8],['chair',32.8,14.3],['plant',33,16],
  ['kitchenUnit',29.5,18.5],['kitchenUnit',32,20],['shelf',33,18.2],['trolley',29.2,21.8],['crate',32.5,22.2],
  ['washer',22.2,15],['washer',24.2,16.4],['trolley',25.2,14.2],['shelf',22,17],['crate',25,17],
  ['workbench',23.5,22.5],['workbench',25.5,24],['shelf',26.8,23],['crate',22.7,25],
  ['shelf',18,25],['shelf',20.7,26.4],['crate',18.5,27.2],['crate',20,24.8],['trolley',21,27],
  ['spaBed',24.3,3.7],['spaBed',27.1,5.4],['plant',28.1,3],['lamp',25.8,6],
  ['treadmill',30.2,5.5],['treadmill',32.4,7.1],['workbench',30.3,9],['screen',33,5],
  ['plant',12,24.2],['plant',16,25.5],['luggage',13.5,26],['luggage',15,26.2,P.blue],
]

function guestProps(map){
  const items=[['elevatorDoors',13,2.1],['sofa',12,10],['coffeeTable',13.4,11],['plant',14.2,9.1],['lamp',12.8,12]]
  for(const a of map.areas.filter(v=>v.id.startsWith('room-'))){
    items.push(['bed',a.anchor.x-.6,a.anchor.y+.4,map.theme==='wine'?P.red:P.blue])
    items.push(['wardrobe',a.anchor.x+1.3,a.anchor.y-1,map.theme==='wine'?P.walnut:P.oak])
    items.push(['desk',a.anchor.x-1.4,a.anchor.y-1])
  }
  for(const a of map.areas.filter(v=>v.id.startsWith('office-'))){items.push(['shelf',a.anchor.x,a.anchor.y-.5],['trolley',a.anchor.x,a.anchor.y+.8])}
  return items
}

export function propLayoutFor(map){return map.id==='ground'?groundProps:guestProps(map)}

export function drawIsoProps(scene,map){
  const nodes=[]
  for(const [type,gx,gy,variant] of propLayoutFor(map)){
    const p=gridToScreen(gx,gy),g=scene.add.graphics().setDepth(30000+isoDepth(gx,gy,200))
    DRAW[type]?.(g,p.x,p.y,variant);nodes.push(g)
  }
  return nodes
}
