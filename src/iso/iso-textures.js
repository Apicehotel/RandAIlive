import { ISO_TILE_H, ISO_TILE_W } from './iso-math.js'

const palettes={
  marble:{top:0xd8c7a8,light:0xf0dfc1,dark:0xa28c6d,line:0x927b5d},
  wood:{top:0x8b6546,light:0xb28258,dark:0x5c3f2e,line:0x4b3326},
  carpet:{top:0x6f3740,light:0x944b59,dark:0x4b252b,line:0x3c1d22},
  service:{top:0x667278,light:0x87959a,dark:0x434c51,line:0x343c40},
  stone:{top:0x8f8b7d,light:0xb2ad9b,dark:0x625f56,line:0x535048},
  rubber:{top:0x4b545a,light:0x667177,dark:0x30373b,line:0x272d30},
}

function diamond(g,c){
  const hw=ISO_TILE_W/2,hh=ISO_TILE_H/2
  g.fillStyle(c,1)
  g.fillPoints([{x:hw,y:0},{x:ISO_TILE_W,y:hh},{x:hw,y:ISO_TILE_H},{x:0,y:hh}],true)
}
function line(g,a,b,c,w=1,alpha=.5){g.lineStyle(w,c,alpha).lineBetween(a.x,a.y,b.x,b.y)}

function drawTile(g,p,type){
  diamond(g,p.top)
  const hw=ISO_TILE_W/2,hh=ISO_TILE_H/2
  line(g,{x:0,y:hh},{x:hw,y:ISO_TILE_H},p.dark,2,.45)
  line(g,{x:hw,y:ISO_TILE_H},{x:ISO_TILE_W,y:hh},p.dark,2,.45)
  line(g,{x:hw,y:0},{x:ISO_TILE_W,y:hh},p.light,2,.32)
  line(g,{x:0,y:hh},{x:hw,y:0},p.light,2,.24)

  if(type==='wood'){
    for(let i=1;i<7;i++){
      const t=i/7
      line(g,{x:ISO_TILE_W*t/2,y:hh*(1-t)},{x:hw+ISO_TILE_W*t/2,y:ISO_TILE_H-hh*(1-t)},p.line,1,.28)
    }
    line(g,{x:hw,y:2},{x:hw,y:ISO_TILE_H-2},p.light,1,.18)
  }else if(type==='marble'){
    line(g,{x:22,y:34},{x:58,y:22},p.light,2,.16)
    line(g,{x:62,y:42},{x:104,y:28},p.dark,2,.12)
    line(g,{x:39,y:48},{x:74,y:36},p.light,1,.12)
  }else if(type==='carpet'){
    for(let y=12;y<54;y+=8)for(let x=20;x<108;x+=16)g.fillStyle((x+y)%32?p.light:p.dark,.10).fillCircle(x,y,1)
  }else if(type==='service'){
    line(g,{x:hw,y:4},{x:hw,y:ISO_TILE_H-4},p.line,1,.26)
    line(g,{x:18,y:hh},{x:110,y:hh},p.line,1,.18)
    for(let x=31;x<100;x+=34)g.fillStyle(p.light,.22).fillCircle(x,hh,1.5)
  }else if(type==='stone'){
    line(g,{x:18,y:34},{x:64,y:20},p.line,1,.18)
    line(g,{x:64,y:20},{x:108,y:34},p.line,1,.18)
    line(g,{x:40,y:48},{x:86,y:34},p.dark,1,.14)
  }else if(type==='rubber'){
    for(let y=17;y<49;y+=8)for(let x=28;x<100;x+=16)g.fillStyle(p.dark,.26).fillCircle(x,y,2)
  }
}

export function generateIsoTextures(scene){
  for(const [type,p] of Object.entries(palettes)){
    const key=`iso-floor-${type}`
    if(scene.textures.exists(key))continue
    const g=scene.add.graphics()
    drawTile(g,p,type)
    g.generateTexture(key,ISO_TILE_W,ISO_TILE_H)
    g.destroy()
  }
}

export const floorTexture=type=>`iso-floor-${palettes[type]?type:'marble'}`
export const ISO_PALETTES=palettes
