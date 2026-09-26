import { gridToScreen, isoDepth } from './iso-math.js'

const P={
  wood:{top:0xa77850,left:0x6a4934,right:0x7d583e,edge:0x3d2b20,hi:0xc99c6a},
  stone:{top:0xd2c4a9,left:0x998b73,right:0xb0a086,edge:0x655b4b,hi:0xeee1c7},
  teal:{top:0x5f8790,left:0x365963,right:0x47727c,edge:0x203b42,hi:0x84aeb6},
  red:{top:0xa5585f,left:0x6b3339,right:0x81434a,edge:0x472329,hi:0xce7a80},
  steel:{top:0x91a0a6,left:0x56646a,right:0x6d7b81,edge:0x354147,hi:0xc0ccd0},
  green:{top:0x6f9c6f,left:0x416f48,right:0x54865a,edge:0x2d5133,hi:0x91bc8d},
}

function prism(g,x,y,w,h,z,m=P.wood){
  const top=[{x,y:y-z},{x:x+w,y:y-z+h/2},{x,y:y-z+h},{x:x-w,y:y-z+h/2}]
  const left=[top[3],top[2],{x:top[2].x,y:top[2].y+z},{x:top[3].x,y:top[3].y+z}]
  const right=[top[2],top[1],{x:top[1].x,y:top[1].y+z},{x:top[2].x,y:top[2].y+z}]
  g.fillStyle(m.left,1).fillPoints(left,true)
  g.fillStyle(m.right,1).fillPoints(right,true)
  g.fillStyle(m.top,1).fillPoints(top,true)
  g.lineStyle(2,m.edge,.65).strokePoints(top,true)
  g.lineStyle(1,m.hi,.35).lineBetween(top[0].x,top[0].y,top[1].x,top[1].y)
}

function sofa(g,x,y){
  prism(g,x,y,28,20,18,P.teal)
  prism(g,x,y-18,27,17,20,P.teal)
}
function table(g,x,y){
  prism(g,x,y,24,18,10,P.wood)
  prism(g,x,y+8,5,4,24,P.steel)
}
function counter(g,x,y){
  prism(g,x,y,44,22,28,P.wood)
  prism(g,x,y-27,40,18,7,P.stone)
}
function plant(g,x,y){
  prism(g,x,y,9,7,12,P.stone)
  g.fillStyle(P.green.left,1).fillEllipse(x-4,y-22,16,26)
  g.fillStyle(P.green.top,1).fillEllipse(x+5,y-27,15,25)
  g.fillStyle(P.green.hi,.65).fillEllipse(x,y-34,12,22)
}
function screen(g,x,y){
  prism(g,x,y,17,12,22,P.steel)
  g.fillStyle(0x0b1d25,1).fillPoints([{x:x,y:y-31},{x:x+13,y:y-25},{x,y:y-18},{x:x-13,y:y-25}],true)
  g.lineStyle(2,0x58dfff,.8).strokePoints([{x:x,y:y-31},{x:x+13,y:y-25},{x,y:y-18},{x:x-13,y:y-25}],true)
}
function luggage(g,x,y){prism(g,x,y,10,8,22,P.red)}
function stool(g,x,y){prism(g,x,y,10,8,10,P.red);prism(g,x,y+6,3,2,20,P.steel)}

const roomProps={
  lobby:[['sofa',1.4,1.6],['sofa',5.2,3.9],['table',3.4,3],['plant',.6,4.8],['plant',6.2,.7]],
  reception:[['counter',1.7,1.5],['counter',3,1.5],['screen',2.2,.6],['luggage',.5,2.2]],
  bar:[['counter',1,1],['stool',1.4,2],['stool',2.1,2.4],['stool',2.8,2.8],['table',4,3.6],['plant',.5,4]],
  congress:[['screen',2.8,.7],['table',2,2.4],['table',3.5,3.3],['table',4.7,4],['plant',.4,4.2]],
  meeting:[['table',1.9,1.7],['screen',3.1,.5],['plant',.5,3.1]],
  restaurant:[['table',1.1,1.2],['table',2.7,2.3],['table',4.1,3.2],['plant',.5,4]],
  kitchen:[['counter',1,1],['counter',2.2,2.2],['screen',.6,3.4]],
  service:[['counter',1,1],['luggage',3,2.1],['luggage',4.2,3.4],['screen',5.6,1.1]],
  technical:[['counter',1,1],['screen',2.7,.7],['luggage',.5,2.1]],
  warehouse:[['luggage',.7,.7],['luggage',2,.9],['luggage',3,1.8]],
  spa:[['sofa',1,1],['sofa',2.8,2.3],['plant',.4,3]],
  gym:[['counter',1.2,1],['screen',2.7,.7]],
  elevators:[['screen',1.4,.6],['plant',.4,1.9]],
  entrance:[['plant',.5,.5],['plant',4,.6],['luggage',2,1]],
}

const DRAW={sofa,table,counter,plant,screen,luggage,stool}

export function drawIsoProps(scene,rooms){
  const nodes=[]
  for(const room of rooms){
    for(const [type,dx,dy] of roomProps[room.id]||[]){
      const gx=room.x+dx,gy=room.y+dy
      const p=gridToScreen(gx,gy)
      const g=scene.add.graphics().setDepth(5000+isoDepth(gx,gy))
      DRAW[type]?.(g,p.x,p.y)
      nodes.push(g)
    }
  }
  return nodes
}
