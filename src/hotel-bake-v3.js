// Static world bake for RandAILive v3.
// StarNet-inspired responsibilities: surfaces, walls, light pools. No runtime authority.
const hexToRgb=hex=>{
  const n=parseInt(String(hex).replace('#',''),16)
  return {r:(n>>16)&255,g:(n>>8)&255,b:n&255}
}
const rgbToHex=({r,g,b})=>'#'+[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('')

export function shade(hex,f){
  const c=hexToRgb(hex)
  if(f>=0)return rgbToHex({r:c.r+(255-c.r)*f,g:c.g+(255-c.g)*f,b:c.b+(255-c.b)*f})
  return rgbToHex({r:c.r*(1+f),g:c.g*(1+f),b:c.b*(1+f)})
}
export const colorInt=hex=>parseInt(String(hex).replace('#',''),16)

function drawParquet(g,a,t){
  const x=a.x+7,y=a.y+34,w=a.w-14,h=a.h-41
  g.fillStyle(colorInt(t.floor),1).fillRect(x,y,w,h)
  for(let yy=0;yy<h;yy+=10){
    const off=(Math.floor(yy/10)%2)*12
    for(let xx=-off;xx<w;xx+=24){
      g.fillStyle(colorInt(((xx/24+yy/10)&1)?t.floor:t.floor2),1).fillRect(x+xx,y+yy,23,9)
      g.fillStyle(colorInt(shade(t.floor,-.28)),.42).fillRect(x+xx,y+yy+9,23,1)
      g.fillStyle(colorInt(shade(t.floor,.16)),.18).fillRect(x+xx,y+yy,23,1)
    }
  }
}
function drawTile(g,a,t,size=16){
  const x=a.x+7,y=a.y+34,w=a.w-14,h=a.h-41
  g.fillStyle(colorInt(t.floor),1).fillRect(x,y,w,h)
  for(let yy=0;yy<h;yy+=size)for(let xx=0;xx<w;xx+=size){
    const alt=((xx/size)+(yy/size))%2
    g.fillStyle(colorInt(alt?t.floor2:t.floor),1).fillRect(x+xx,y+yy,Math.min(size-1,w-xx),Math.min(size-1,h-yy))
    g.fillStyle(colorInt(shade(t.floor,-.34)),.22).fillRect(x+xx+size-1,y+yy,1,Math.min(size,h-yy))
    g.fillRect(x+xx,y+yy+size-1,Math.min(size,w-xx),1)
  }
}
function drawCarpet(g,a,t){
  const x=a.x+7,y=a.y+34,w=a.w-14,h=a.h-41
  g.fillStyle(colorInt(t.floor),1).fillRect(x,y,w,h)
  for(let yy=1;yy<h;yy+=4)for(let xx=(yy%8?1:3);xx<w;xx+=8){
    g.fillStyle(colorInt(shade(t.floor2,(xx%16?-.06:.08))),.5).fillRect(x+xx,y+yy,1,1)
  }
}
function drawRubber(g,a,t){
  const x=a.x+7,y=a.y+34,w=a.w-14,h=a.h-41
  g.fillStyle(colorInt(t.floor),1).fillRect(x,y,w,h)
  for(let yy=4;yy<h;yy+=12)for(let xx=4;xx<w;xx+=12){
    g.fillStyle(colorInt(shade(t.floor,-.28)),.45).fillCircle(x+xx,y+yy,1.2)
  }
}
function floor(g,a){
  if(['jazz','wine','bar','restaurant'].includes(a.theme))return drawParquet(g,a,a.themeData)
  if(['event','lobby','corridor','entrance'].includes(a.theme))return drawTile(g,a,a.themeData,a.theme==='event'?12:18)
  if(['service','technical','gym'].includes(a.theme))return drawRubber(g,a,a.themeData)
  if(a.theme==='spa')return drawTile(g,a,a.themeData,20)
  if(a.theme==='hub')return drawTile(g,a,a.themeData,14)
  return drawCarpet(g,a,a.themeData)
}

function wallSegments(g,a){
  const t=a.themeData, x=a.x,y=a.y,w=a.w,h=a.h
  const face=colorInt(shade(t.wall,-.34)), top=colorInt(shade(t.wall,.18)), cap=colorInt(shade(t.wall,.38))
  const H=12
  // north wall has height: cap + front face. This creates the cutaway / baked room read.
  g.fillStyle(face,1).fillRect(x,y-H,w,H+6)
  g.fillStyle(top,1).fillRect(x,y-H,w,4)
  g.fillStyle(cap,.8).fillRect(x,y-H,w,1)
  g.fillStyle(face,1).fillRect(x,y,6,h)
  g.fillStyle(face,1).fillRect(x+w-6,y,6,h)
  const d=a.doorway
  if(a.door==='south'){
    const left=d.x-d.w/2,right=d.x+d.w/2
    g.fillStyle(face,1).fillRect(x,y+h-6,left-x,6)
    g.fillRect(right,y+h-6,x+w-right,6)
    g.fillStyle(colorInt(t.accent),.9).fillRect(left,y+h-3,d.w,3)
  }else if(a.door==='north'){
    g.fillStyle(face,1).fillRect(x,y+h-6,w,6)
    g.fillStyle(colorInt(t.accent),.9).fillRect(d.x-d.w/2,y-H,d.w,3)
  }else if(a.door==='east'){
    g.fillStyle(face,1).fillRect(x,y+h-6,w,6)
    g.fillStyle(colorInt(t.accent),.9).fillRect(x+w-3,d.y-d.h/2,3,d.h)
  }else if(a.door==='west'){
    g.fillStyle(face,1).fillRect(x,y+h-6,w,6)
    g.fillStyle(colorInt(t.accent),.9).fillRect(x,d.y-d.h/2,3,d.h)
  }else g.fillStyle(face,1).fillRect(x,y+h-6,w,6)
}

function label(scene,a){
  const t=a.themeData
  const plate=scene.add.rectangle(a.x+10,a.y+10,Math.min(132,a.w-20),19,colorInt(shade(t.wall,-.48)),.96).setOrigin(0).setDepth(4)
  plate.setStrokeStyle(1,colorInt(t.accent),.8)
  scene.add.text(a.x+16,a.y+13,a.label,{fontFamily:'monospace',fontSize:'9px',fontStyle:'bold',color:'#fff3d5'}).setDepth(5)
}

function roomGlow(scene,a){
  const t=a.themeData
  const r=Math.min(a.w,a.h)*.45
  const glow=scene.add.circle(a.x+a.w/2,a.y+a.h/2+20,r,colorInt(t.light),.075).setDepth(1)
  return glow
}

export function bakeHotel(scene,projection){
  const base=scene.add.graphics().setDepth(0)
  base.fillStyle(0x071018,1).fillRect(0,0,projection.world.width,projection.world.height)
  base.fillStyle(0x15232b,1).fillRoundedRect(20,24,projection.world.width-40,projection.world.height-48,18)
  base.fillStyle(0xcbb58c,1).fillRoundedRect(30,34,projection.world.width-60,projection.world.height-68,14)

  // Draw open spaces first: they are the connective tissue of the hotel.
  for(const a0 of projection.spaces){
    const a={...a0,themeData:a0.theme}
    a.theme=a0.id==='randhub'?'hub':a0.id==='entrance'?'entrance':a0.id==='northHall'?'corridor':a0.id==='serviceHall'?'service':'lobby'
    a.themeData=a0.theme
    floor(base,a)
    base.lineStyle(2,colorInt(a.themeData.accent),.35).strokeRoundedRect(a.x,a.y,a.w,a.h,8)
    label(scene,a)
    roomGlow(scene,a)
  }

  for(const a0 of projection.rooms){
    const a={...a0,themeData:a0.theme}
    a.theme=a0.theme===projection.rooms[0]?.theme?'jazz':a0.id.startsWith('wine')?'wine':a0.theme
    // projected theme object is stored in themeData; recover logical theme name from id/kind.
    if(a0.id.startsWith('jazz'))a.theme='jazz'
    else if(a0.id.startsWith('wine'))a.theme='wine'
    else if(a0.kind==='events')a.theme='event'
    else if(a0.id==='reception')a.theme='lobby'
    else if(a0.id==='bar')a.theme='bar'
    else if(a0.id==='breakfast')a.theme='restaurant'
    else if(a0.kind==='service')a.theme=a0.id==='technical'?'technical':'service'
    else if(a0.id==='spa')a.theme='spa'
    else if(a0.id==='gym')a.theme='gym'
    floor(base,a)
    wallSegments(base,a)
    label(scene,a)
    roomGlow(scene,a)
  }
  return {base}
}
