// Rand-owned procedural prop renderer for Hotel Giò v3.
// Uses StarNet's useful principle: authored material ramps + depth-sorted furniture.
const n=h=>parseInt(String(h).replace('#',''),16)
const mix=(hex,f)=>{
  const c=n(hex),r=(c>>16)&255,g=(c>>8)&255,b=c&255
  const k=v=>Math.max(0,Math.min(255,Math.round(f>=0?v+(255-v)*f:v*(1+f))))
  return (k(r)<<16)|(k(g)<<8)|k(b)
}
const MAT={
  wood:{ink:0x2b1d16,face:0x6b4933,top:0x8b6547,hi:0xb68b5e},
  steel:{ink:0x202a30,face:0x59666d,top:0x78858b,hi:0xa8b2b5},
  linen:{ink:0x756d61,face:0xd9d0c0,top:0xf1eadb,hi:0xfff8e9},
  teal:{ink:0x17333a,face:0x356a74,top:0x4e8c97,hi:0x79c4cf},
  red:{ink:0x3c1f24,face:0x7b3b45,top:0xa6505e,hi:0xd77b87},
  green:{ink:0x1d3523,face:0x3f704b,top:0x57945f,hi:0x83c189},
}
function box(g,x,y,w,h,m=MAT.wood){
  g.fillStyle(m.ink,1).fillRect(x-1,y-1,w+2,h+2)
  g.fillStyle(m.face,1).fillRect(x,y,w,h)
  g.fillStyle(m.top,1).fillRect(x,y,w,3)
  g.fillStyle(m.hi,.55).fillRect(x+1,y+1,Math.max(1,w-2),1)
  g.fillStyle(mix('#'+m.face.toString(16).padStart(6,'0'),-.25),.7).fillRect(x,y+h-2,w,2)
}
function screen(g,x,y,w,h){
  box(g,x,y,w,h,MAT.steel)
  g.fillStyle(0x071820,1).fillRect(x+3,y+3,w-6,h-6)
  g.fillStyle(0x56dfff,.65).fillRect(x+5,y+5,w-10,2)
  g.fillStyle(0x56dfff,.25).fillRect(x+5,y+9,Math.max(4,w-16),2)
}
function plant(g,x,y){
  box(g,x-6,y+2,12,10,{ink:0x492f20,face:0x765139,top:0x9a6a47,hi:0xb98762})
  g.fillStyle(MAT.green.face,1).fillCircle(x,y-4,10)
  g.fillStyle(MAT.green.top,1).fillCircle(x-6,y-8,5)
  g.fillStyle(MAT.green.hi,.8).fillCircle(x+6,y-7,5)
  g.fillStyle(MAT.green.face,1).fillRect(x-1,y-3,2,8)
}
function chair(g,x,y,c=MAT.red){
  g.fillStyle(c.ink,.35).fillEllipse(x,y+8,18,6)
  box(g,x-7,y-7,14,13,c)
  g.fillStyle(c.top,1).fillRect(x-6,y-11,12,5)
  g.fillStyle(MAT.steel.face,1).fillRect(x-5,y+6,2,7)
  g.fillRect(x+3,y+6,2,7)
}
function draw(g,p){
  const x=Math.round(p.x),y=Math.round(p.y)
  g.fillStyle(0x000000,.20).fillEllipse(x,y+10,34,8)
  switch(p.type){
    case'bed':
      box(g,x-26,y-16,52,31,MAT.wood)
      box(g,x-22,y-13,44,25,MAT.linen)
      g.fillStyle(0xcdbca6,1).fillRoundedRect(x-18,y-10,36,9,3)
      g.fillStyle(MAT.red.face,.72).fillRect(x-20,y+2,40,8);break
    case'nightstand':box(g,x-8,y-8,16,16,MAT.wood);g.fillStyle(0xd7b36a,1).fillCircle(x+4,y,1.5);break
    case'wardrobe':case'locker':
      box(g,x-13,y-20,26,40,p.type==='locker'?MAT.steel:MAT.wood)
      g.fillStyle(p.type==='locker'?MAT.steel.ink:MAT.wood.ink,.55).fillRect(x,y-17,1,34);break
    case'deskLamp':
      g.fillStyle(MAT.steel.face,1).fillRect(x-1,y-2,2,12);g.fillStyle(0xffd477,.9).fillCircle(x,y-5,6);g.fillStyle(0xffd477,.16).fillCircle(x,y-5,13);break
    case'wineRack':
      box(g,x-14,y-18,28,36,MAT.wood)
      for(let i=0;i<6;i++)g.fillStyle(i%2?0x7d3048:0x56394b,1).fillCircle(x-7+(i%2)*14,y-11+Math.floor(i/2)*11,3);break
    case'desk':
      box(g,x-34,y-10,68,20,MAT.wood);screen(g,x-12,y-18,24,14);break
    case'sofa':
      box(g,x-28,y-11,56,22,MAT.teal)
      g.fillStyle(MAT.teal.top,1).fillRoundedRect(x-23,y-8,46,10,5);break
    case'coffeeTable':case'table':case'meetingTable':
      if(p.type==='table'){g.fillStyle(MAT.wood.ink,1).fillCircle(x,y,17);g.fillStyle(MAT.wood.top,1).fillCircle(x,y-1,14)}
      else box(g,x-(p.type==='meetingTable'?30:22),y-7,p.type==='meetingTable'?60:44,14,MAT.wood)
      break
    case'luggage':case'crate':
      box(g,x-10,y-12,20,24,p.type==='crate'?MAT.wood:MAT.red)
      if(p.type==='luggage')g.fillStyle(MAT.steel.face,1).fillRect(x-4,y-16,8,4);break
    case'barCounter':case'counter':case'buffet':case'prepCounter':case'workbench':
      box(g,x-32,y-9,64,18,p.type==='prepCounter'||p.type==='workbench'?MAT.steel:MAT.wood)
      if(p.type==='workbench'){g.fillStyle(0xd65f4c,1).fillRect(x-18,y-5,11,4);g.fillStyle(0x59d9ff,1).fillRect(x+5,y-5,14,4)}
      break
    case'stool':chair(g,x,y,MAT.red);break
    case'bottleRack':case'rack':case'linenRack':
      box(g,x-18,y-20,36,40,p.type==='bottleRack'?MAT.wood:MAT.steel)
      for(let r=0;r<3;r++)g.fillStyle(0x20272a,.65).fillRect(x-15,y-12+r*12,30,2);break
    case'stage':box(g,x-35,y-8,70,16,MAT.red);break
    case'chairs':
      for(let r=0;r<2;r++)for(let c=0;c<4;c++)chair(g,x-27+c*18,y-8+r*17,MAT.red);break
    case'screen':case'terminal':screen(g,x-16,y-13,32,26);break
    case'core':
      g.fillStyle(0x071820,1).fillCircle(x,y,18);g.lineStyle(3,0x56dfff,.9).strokeCircle(x,y,16);g.fillStyle(0x56dfff,.32).fillCircle(x,y,11);g.fillStyle(0xd9f8ff,1).fillCircle(x,y,4);break
    case'washer':
      box(g,x-15,y-18,30,36,MAT.linen);g.fillStyle(0x153541,1).fillCircle(x,y+4,9);g.lineStyle(2,0x5cdbff,.7).strokeCircle(x,y+4,9);break
    case'cart':
      box(g,x-15,y-8,30,16,MAT.steel);g.fillStyle(0x15191b,1).fillCircle(x-10,y+11,3);g.fillCircle(x+10,y+11,3);break
    case'ironingTable':
      box(g,x-25,y-5,50,10,MAT.steel);g.lineStyle(2,MAT.steel.face,1).lineBetween(x-17,y+5,x-8,y+18).lineBetween(x+17,y+5,x+8,y+18);break
    case'toolWall':
      box(g,x-20,y-18,40,36,MAT.steel);for(let i=0;i<4;i++)g.fillStyle([0xd95c49,0xe1b45b,0x58c8ef][i%3],1).fillRect(x-13+i*8,y-10+(i%2)*8,4,13);break
    case'fridge':box(g,x-13,y-22,26,44,MAT.linen);g.fillStyle(0x8b9699,.7).fillRect(x-10,y,20,1);break
    case'lounger':
      box(g,x-24,y-7,48,14,MAT.linen);g.fillStyle(0xc6b59f,1).fillRoundedRect(x+9,y-14,15,14,5);break
    case'bench':box(g,x-22,y-5,44,10,MAT.wood);break
    case'treadmill':
      box(g,x-23,y-6,46,12,MAT.steel);g.lineStyle(3,MAT.steel.hi,1).lineBetween(x+16,y-5,x+21,y-20);break
    case'plant':case'planter':plant(g,x,y);break
    default:box(g,x-9,y-9,18,18,MAT.steel)
  }
}

export function drawProps(scene,projection){
  const all=[...projection.spaces.flatMap(a=>a.props||[]),...projection.rooms.flatMap(a=>a.props||[])]
    .slice().sort((a,b)=>a.z-b.z)
  const nodes=[]
  for(const p of all){
    const g=scene.add.graphics().setDepth(6+p.z/1000)
    draw(g,p)
    nodes.push({id:p.id,graphics:g,depth:g.depth})
  }
  return nodes
}
