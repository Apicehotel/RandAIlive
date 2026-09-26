import { ISO_TILE_H, ISO_TILE_W } from './iso-math.js'

// Materials deliberately stay low-contrast. Strong motifs repeated once per
// tile make an isometric floor look like a board game instead of architecture.
const palettes={
  marble:{base:0xd8d1c2,light:0xf1ede4,dark:0xaaa394,line:0x8f887b,accent:0xb59a70,pattern:'marble'},
  marbleDark:{base:0x77736c,light:0xa39e93,dark:0x4f4c47,line:0x45423d,accent:0xbda477,pattern:'marble'},
  wood:{base:0x8e6345,light:0xb7845e,dark:0x583c2d,line:0x4d3528,accent:0xc2946d,pattern:'wood'},
  woodDark:{base:0x5d4031,light:0x805b45,dark:0x382820,line:0x30231c,accent:0x9d7255,pattern:'wood'},
  carpet:{base:0x54333a,light:0x74505a,dark:0x39252b,line:0x312027,accent:0xa88468,pattern:'carpet'},
  service:{base:0x778083,light:0x969ea0,dark:0x555d60,line:0x485053,accent:0xaeb7b9,pattern:'epoxy'},
  serviceRunner:{base:0x687276,light:0x889296,dark:0x454e52,line:0x3b4448,accent:0xc7a965,pattern:'serviceRunner'},
  technical:{base:0x465155,light:0x657176,dark:0x2f383c,line:0x273034,accent:0x57909a,pattern:'technical'},
  concrete:{base:0x85827b,light:0xa39f96,dark:0x625f59,line:0x56534e,accent:0xa9916c,pattern:'mineral'},
  stone:{base:0x99998f,light:0xb8b8ad,dark:0x74756d,line:0x65665f,accent:0x819d8d,pattern:'stone'},
  rubber:{base:0x374044,light:0x505b5f,dark:0x252d30,line:0x20272a,accent:0x587d83,pattern:'rubber'},
  kitchen:{base:0xb3b8b6,light:0xd2d6d3,dark:0x858c8b,line:0x737a79,accent:0xb29b70,pattern:'kitchen'},
  corridor:{base:0x9c8770,light:0xb6a28b,dark:0x766351,line:0x685544,accent:0x6d3c43,pattern:'woven'},
  jazzCarpet:{base:0x344654,light:0x4c6272,dark:0x24323c,line:0x1f2c35,accent:0x9b8964,pattern:'carpet'},
  jazzCorridor:{base:0x445666,light:0x5e7080,dark:0x30404d,line:0x293843,accent:0xad9360,pattern:'woven'},
  wineCarpet:{base:0x573a43,light:0x74515c,dark:0x3b2930,line:0x332229,accent:0xa88b70,pattern:'carpet'},
  wineCorridor:{base:0x654851,light:0x81616a,dark:0x49323a,line:0x3e2b32,accent:0xb09272,pattern:'woven'},
}

const point=(x,y)=>({x,y})
const diamondPoints=(inset=0)=>[
  point(ISO_TILE_W/2,inset/2),
  point(ISO_TILE_W-inset,ISO_TILE_H/2),
  point(ISO_TILE_W/2,ISO_TILE_H-inset/2),
  point(inset,ISO_TILE_H/2),
]

function random(seed,index=0){
  const value=Math.sin((seed+1)*91.733+(index+1)*37.719)*43758.5453
  return value-Math.floor(value)
}

function insideDiamond(x,y,inset=5){
  const nx=Math.abs(x-ISO_TILE_W/2)/(ISO_TILE_W/2-inset)
  const ny=Math.abs(y-ISO_TILE_H/2)/(ISO_TILE_H/2-inset/2)
  return nx+ny<=1
}

function segment(g,a,b,color,width=1,alpha=.5){
  g.lineStyle(width,color,alpha).lineBetween(a.x,a.y,b.x,b.y)
}

function scatter(g,p,seed,count=34,alpha=.045,size=.65){
  for(let i=0;i<count;i++){
    const x=5+random(seed,i*2)*118,y=4+random(seed,i*2+1)*56
    if(!insideDiamond(x,y,4))continue
    const light=random(seed,i+91)>.54
    g.fillStyle(light?p.light:p.dark,alpha*(light?1:.82)).fillCircle(x,y,size+random(seed,i+171)*.35)
  }
}

function drawMarble(g,p,seed){
  for(let vein=0;vein<2;vein++){
    const baseY=19+random(seed,vein)*22
    const pts=[]
    for(let i=0;i<6;i++){
      const x=16+i*19
      const y=baseY+(i-2.5)*3.4+(random(seed,vein*20+i)-.5)*7
      if(insideDiamond(x,y,7))pts.push(point(x,y))
    }
    for(let i=1;i<pts.length;i++)segment(g,pts[i-1],pts[i],vein?p.accent:p.light,vein?1:1.35,vein?.09:.16)
  }
  scatter(g,p,seed,22,.032,.55)
}

function drawWood(g,p,seed){
  const shift=(random(seed,2)-.5)*8
  for(let i=-2;i<9;i++){
    const sx=8+i*16+shift
    segment(g,point(sx,35-sx*.22),point(sx+56,48-sx*.22),p.line,i%3===0?1.25:.7,i%3===0?.22:.12)
    if(i%2===0)segment(g,point(sx+9,36-sx*.22),point(sx+38,42-sx*.22),p.light,.7,.09)
  }
  segment(g,point(24,41),point(83,20),p.dark,1,.17)
  segment(g,point(49,53),point(108,32),p.dark,1,.14)
  scatter(g,p,seed,18,.035,.5)
}

function drawCarpet(g,p,seed){
  scatter(g,p,seed,82,.055,.52)
  for(let i=0;i<7;i++){
    const x=22+random(seed,200+i)*84,y=17+random(seed,230+i)*30
    if(insideDiamond(x,y,9))segment(g,point(x-2,y+1),point(x+3,y-1),i%3===0?p.accent:p.light,.65,i%3===0?.09:.06)
  }
}

function drawWoven(g,p,seed){
  drawCarpet(g,p,seed)
  g.lineStyle(1,p.accent,.13).strokePoints(diamondPoints(15),true)
  g.lineStyle(1,p.light,.075).strokePoints(diamondPoints(22),true)
}

function drawEpoxy(g,p,seed){
  scatter(g,p,seed,42,.04,.58)
  segment(g,point(10,32),point(64,51),p.line,1,.12)
  segment(g,point(64,13),point(118,32),p.light,1,.09)
}

function drawServiceRunner(g,p,seed){
  drawEpoxy(g,p,seed)
  segment(g,point(38,18),point(92,37),p.accent,1.2,.2)
  segment(g,point(36,46),point(90,27),p.accent,1.2,.16)
}

function drawTechnical(g,p,seed){
  scatter(g,p,seed,28,.035,.55)
  for(let y=21;y<47;y+=8)for(let x=28;x<105;x+=15){
    if(insideDiamond(x,y,8))g.fillStyle(p.dark,.23).fillCircle(x,y,1.25)
  }
}

function drawMineral(g,p,seed,stone=false){
  scatter(g,p,seed,stone?48:31,.045,.7)
  if(stone){
    segment(g,point(23,38),point(62,24),p.line,1,.13)
    segment(g,point(62,24),point(99,37),p.line,1,.11)
  }
}

function drawRubber(g,p,seed){
  scatter(g,p,seed,20,.03,.5)
  for(let y=22;y<46;y+=8)for(let x=31;x<101;x+=14){
    if(insideDiamond(x,y,9))g.fillStyle(p.dark,.3).fillCircle(x,y,1.55)
  }
}

function drawKitchen(g,p,seed){
  drawEpoxy(g,p,seed)
  segment(g,point(37,23),point(90,42),p.line,1,.16)
  segment(g,point(37,42),point(90,23),p.line,1,.13)
}

function drawPattern(g,p,seed){
  if(p.pattern==='marble')drawMarble(g,p,seed)
  else if(p.pattern==='wood')drawWood(g,p,seed)
  else if(p.pattern==='carpet')drawCarpet(g,p,seed)
  else if(p.pattern==='woven')drawWoven(g,p,seed)
  else if(p.pattern==='epoxy')drawEpoxy(g,p,seed)
  else if(p.pattern==='serviceRunner')drawServiceRunner(g,p,seed)
  else if(p.pattern==='technical')drawTechnical(g,p,seed)
  else if(p.pattern==='mineral')drawMineral(g,p,seed)
  else if(p.pattern==='stone')drawMineral(g,p,seed,true)
  else if(p.pattern==='rubber')drawRubber(g,p,seed)
  else if(p.pattern==='kitchen')drawKitchen(g,p,seed)
}

function drawTile(g,p,seed){
  g.fillStyle(p.base,1).fillPoints(diamondPoints(),true)
  g.fillStyle(p.light,.025).fillPoints(diamondPoints(5),true)
  drawPattern(g,p,seed)
  g.lineStyle(1,p.dark,.22).strokePoints(diamondPoints(1),true)
  segment(g,point(2,32),point(64,1),p.light,1,.17)
  segment(g,point(64,1),point(126,32),p.light,1,.13)
}

export function generateIsoTextures(scene){
  const materials=Object.entries(palettes)
  for(let materialIndex=0;materialIndex<materials.length;materialIndex++){
    const [type,p]=materials[materialIndex]
    for(let variant=0;variant<4;variant++){
      const key=`iso-floor-${type}-${variant}`
      if(scene.textures.exists(key))continue
      const g=scene.add.graphics()
      drawTile(g,p,variant+materialIndex*11)
      g.generateTexture(key,ISO_TILE_W,ISO_TILE_H)
      g.destroy()
    }
  }
}

export function floorTexture(type,x=0,y=0){
  const material=palettes[type]?type:'marble'
  const variant=Math.abs((Math.trunc(x)*17+Math.trunc(y)*31)%4)
  return `iso-floor-${material}-${variant}`
}

export const ISO_PALETTES=palettes
