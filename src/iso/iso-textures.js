import { ISO_TILE_H, ISO_TILE_W } from './iso-math.js'

const palettes={
  marble:{base:0xd8c9ae,light:0xf6ead4,dark:0xa89576,line:0x8b775b,accent:0xb89762,pattern:'marble'},
  marbleDark:{base:0x918777,light:0xc9bca4,dark:0x5f584d,line:0x50483e,accent:0xd0ad67,pattern:'marble'},
  wood:{base:0x956845,light:0xc08b5a,dark:0x593b2b,line:0x463025,accent:0xd0a06b,pattern:'wood'},
  woodDark:{base:0x674531,light:0x9b6b49,dark:0x3b281f,line:0x2d2019,accent:0xb27b51,pattern:'wood'},
  carpet:{base:0x5b2832,light:0x8d4350,dark:0x351820,line:0x2a1219,accent:0xd0a257,pattern:'carpet'},
  service:{base:0x6f7b7f,light:0x9ba8ab,dark:0x424b4f,line:0x343c40,accent:0xc7d1d2,pattern:'service'},
  serviceRunner:{base:0x626d70,light:0x8e999c,dark:0x394246,line:0x30383b,accent:0xe9b24e,pattern:'serviceRunner'},
  technical:{base:0x48555b,light:0x718087,dark:0x293238,line:0x20282c,accent:0x55d7e9,pattern:'technical'},
  concrete:{base:0x77756f,light:0x99968d,dark:0x4d4b47,line:0x3d3b38,accent:0xc5a45c,pattern:'concrete'},
  stone:{base:0x929184,light:0xbab9a8,dark:0x62625a,line:0x505149,accent:0x9dc6aa,pattern:'stone'},
  rubber:{base:0x384247,light:0x59656a,dark:0x20272b,line:0x181e21,accent:0x72c9d7,pattern:'rubber'},
  kitchen:{base:0xaeb8b8,light:0xdce2df,dark:0x707c7d,line:0x5d6869,accent:0xd49b43,pattern:'kitchen'},
  corridor:{base:0xc4b18e,light:0xead7af,dark:0x887255,line:0x705c45,accent:0x7c2938,pattern:'runner'},
  jazzCarpet:{base:0x33495a,light:0x54738a,dark:0x1f2e39,line:0x182631,accent:0xd1a64e,pattern:'jazz'},
  jazzCorridor:{base:0x43566a,light:0x657d94,dark:0x273746,line:0x1e2d39,accent:0xd8aa4c,pattern:'runner'},
  wineCarpet:{base:0x592d3c,light:0x82465a,dark:0x351a25,line:0x29131c,accent:0xc99755,pattern:'wine'},
  wineCorridor:{base:0x68404b,light:0x915b69,dark:0x3e252e,line:0x301b23,accent:0xd1a15f,pattern:'runner'},
}

function diamond(g,color,alpha=1,inset=0){
  const hw=ISO_TILE_W/2,hh=ISO_TILE_H/2
  g.fillStyle(color,alpha).fillPoints([{x:hw,y:inset/2},{x:ISO_TILE_W-inset,y:hh},{x:hw,y:ISO_TILE_H-inset/2},{x:inset,y:hh}],true)
}
const line=(g,a,b,color,width=1,alpha=.5)=>g.lineStyle(width,color,alpha).lineBetween(a.x,a.y,b.x,b.y)

function runner(g,p,width=.62){
  const cx=64,half=40*width
  g.fillStyle(p.accent,.94).fillPoints([{x:cx,y:11},{x:cx+half,y:32},{x:cx,y:53},{x:cx-half,y:32}],true)
  g.lineStyle(2,p.light,.36).strokePoints([{x:cx,y:14},{x:cx+half-5,y:32},{x:cx,y:50},{x:cx-half+5,y:32}],true)
  g.lineStyle(1,0xffffff,.15).strokePoints([{x:cx,y:18},{x:cx+half-12,y:32},{x:cx,y:46},{x:cx-half+12,y:32}],true)
}

function drawPattern(g,p,type){
  const hw=64,hh=32
  if(type==='wood'){
    for(let i=0;i<8;i++){
      const t=i/8
      line(g,{x:hw*t,y:hh*(1-t)},{x:hw+hw*t,y:64-hh*(1-t)},p.line,i%3===0?2:1,.34)
      if(i%2===0)line(g,{x:hw*t+7,y:hh*(1-t)+4},{x:hw+hw*t-10,y:64-hh*(1-t)-3},p.light,1,.12)
    }
  }else if(type==='marble'){
    line(g,{x:12,y:35},{x:52,y:20},p.light,2,.25);line(g,{x:52,y:20},{x:87,y:34},p.dark,1,.18)
    line(g,{x:43,y:51},{x:107,y:27},p.light,1,.18);line(g,{x:73,y:44},{x:111,y:31},p.accent,1,.12)
  }else if(type==='carpet'||type==='jazz'||type==='wine'){
    for(let y=14;y<55;y+=7)for(let x=18;x<112;x+=12){
      const on=((x*3+y*5)%4)===0
      g.fillStyle(on?p.accent:(x+y)%3?p.light:p.dark,on?.13:.09).fillCircle(x,y,on?1.4:1)
    }
    if(type==='jazz')line(g,{x:30,y:37},{x:78,y:22},p.accent,2,.12)
    if(type==='wine')for(let x=34;x<95;x+=20)g.lineStyle(1,p.accent,.12).strokeCircle(x,32,4)
  }else if(type==='service'||type==='kitchen'){
    line(g,{x:64,y:2},{x:64,y:62},p.line,1,.35);line(g,{x:9,y:32},{x:119,y:32},p.line,1,.25)
    for(let x=28;x<108;x+=26)g.fillStyle(p.light,.32).fillCircle(x,32,1.6)
  }else if(type==='serviceRunner'){
    line(g,{x:64,y:3},{x:64,y:61},p.line,1,.32);runner(g,p,.34)
    line(g,{x:35,y:30},{x:57,y:22},0x1e2528,3,.45);line(g,{x:71,y:42},{x:94,y:34},0x1e2528,3,.45)
  }else if(type==='technical'){
    for(let x=24;x<108;x+=18)g.fillStyle(p.dark,.42).fillCircle(x,32,2)
    line(g,{x:18,y:34},{x:64,y:18},p.accent,2,.16);line(g,{x:64,y:46},{x:109,y:31},p.accent,2,.16)
  }else if(type==='stone'||type==='concrete'){
    line(g,{x:15,y:35},{x:64,y:18},p.line,1,.28);line(g,{x:64,y:18},{x:111,y:34},p.line,1,.22)
    line(g,{x:38,y:49},{x:89,y:31},p.dark,1,.2)
  }else if(type==='rubber'){
    for(let y=18;y<49;y+=7)for(let x=25;x<104;x+=14)g.fillStyle(p.dark,.38).fillCircle(x,y,2.1)
  }else if(type==='runner')runner(g,p)
}

function drawTile(g,p){
  diamond(g,p.base)
  drawPattern(g,p,p.pattern)
  line(g,{x:0,y:32},{x:64,y:64},p.dark,2,.48)
  line(g,{x:64,y:64},{x:128,y:32},p.dark,2,.48)
  line(g,{x:64,y:0},{x:128,y:32},p.light,2,.38)
  line(g,{x:0,y:32},{x:64,y:0},p.light,2,.3)
  diamond(g,0xffffff,.025,4)
  for(let i=0;i<32;i++){
    const x=8+((i*37)%112),y=7+((i*23)%50)
    g.fillStyle(i%4===0?p.light:p.dark,i%4===0?.055:.035).fillCircle(x,y,.75)
  }
}

export function generateIsoTextures(scene){
  for(const [type,p] of Object.entries(palettes)){
    const key=`iso-floor-${type}`
    if(scene.textures.exists(key))continue
    const g=scene.add.graphics();drawTile(g,p);g.generateTexture(key,ISO_TILE_W,ISO_TILE_H);g.destroy()
  }
}

export const floorTexture=type=>`iso-floor-${palettes[type]?type:'marble'}`
export const ISO_PALETTES=palettes
