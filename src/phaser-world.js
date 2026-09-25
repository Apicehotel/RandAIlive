import Phaser from 'phaser'
import { ALL_AREAS, HOTEL_LAYOUT, HOTEL_SHARED, WORLD, areaById, centerOf, doorwayOf, propPositions, routeBetween } from './hotel-layout-v2.js'
import { AGENT_LOOKS, clientLane, problemEmoji, urgencyAura } from './pixel-sprites.js'

export const WORLD_SIZE={width:WORLD.width,height:WORLD.height}

const C={
  bg:0x08131b,hotel:0xe7d6b7,hotel2:0xc7ab7d,wall:0x4b382c,wallDark:0x2a201a,
  corridor:0xc9b38d,runner:0x8f2e2e,gold:0xd7b36a,cyan:0x55d8ff,
  jazz:0x6e4d3b,wine:0x6a364d,service:0x56616a,food:0x6f4a2d,
}

const toneFor=a=>{
  if(a.kind==='guest')return {floor:0x9b7655,accent:0xd9ad76}
  if(a.kind==='wine')return {floor:0x7b4c61,accent:0xe07b9a}
  if(a.kind==='food')return {floor:0x815c3d,accent:0xe4b767}
  if(a.kind==='events')return {floor:0x74413b,accent:0xd66c5e}
  if(a.kind==='service')return {floor:0x687074,accent:0x93b7c6}
  if(a.kind==='wellness')return {floor:0x61745d,accent:0x9fd49a}
  if(a.kind==='ai')return {floor:0x153746,accent:C.cyan}
  return {floor:0xb3966f,accent:C.gold}
}

function floorPattern(g,a){
  const t=toneFor(a),x=a.x+5,y=a.y+34,w=a.w-10,h=a.h-39
  g.fillStyle(t.floor,1).fillRect(x,y,w,h)
  const s=a.kind==='guest'||a.kind==='wine'?18:22
  for(let yy=0;yy<h;yy+=s)for(let xx=0;xx<w;xx+=s){
    const alt=((xx/s)+(yy/s))%2===0
    g.fillStyle(alt?0xffffff:0x000000,.035).fillRect(x+xx,y+yy,Math.min(s,w-xx),Math.min(s,h-yy))
  }
}

function wallWithDoor(g,a){
  const x=a.x,y=a.y,w=a.w,h=a.h
  g.fillStyle(C.wallDark,.55).fillRect(x-5,y-5,w+10,h+10)
  g.fillStyle(C.wall,1).fillRect(x,y,w,6)
  g.fillRect(x,y,6,h)
  g.fillRect(x+w-6,y,6,h)
  const gap=34
  if(a.door==='south'){
    const mid=x+w/2
    g.fillRect(x,y+h-6,mid-gap/2-x,6)
    g.fillRect(mid+gap/2,y+h-6,x+w-(mid+gap/2),6)
    g.fillStyle(C.gold,1).fillRect(mid-gap/2,y+h-3,gap,3)
  } else if(a.door==='north'){
    const mid=x+w/2
    g.fillStyle(C.hotel,1).fillRect(mid-gap/2,y,gap,7)
    g.fillStyle(C.gold,1).fillRect(mid-gap/2,y,gap,3)
    g.fillRect(x,y+h-6,w,6)
  } else if(a.door==='east'){
    const mid=y+h/2
    g.fillRect(x,y+h-6,w,6)
    g.fillStyle(C.hotel,1).fillRect(x+w-7,mid-gap/2,8,gap)
  } else if(a.door==='west'){
    const mid=y+h/2
    g.fillRect(x,y+h-6,w,6)
    g.fillStyle(C.hotel,1).fillRect(x-1,mid-gap/2,8,gap)
  } else g.fillRect(x,y+h-6,w,6)
}

function drawRoom(scene,g,a){
  floorPattern(g,a); wallWithDoor(g,a)
  const t=toneFor(a)
  g.fillStyle(0x1b1714,.9).fillRoundedRect(a.x+12,a.y+10,Math.min(a.w-24,126),20,3)
  g.lineStyle(1,t.accent,.9).strokeRoundedRect(a.x+12,a.y+10,Math.min(a.w-24,126),20,3)
  scene.add.text(a.x+18,a.y+14,a.label,{fontFamily:'monospace',fontSize:'9px',fontStyle:'bold',color:'#fff1d2'}).setDepth(2)
}

function drawShared(scene,g,a){
  const t=toneFor(a)
  g.fillStyle(t.floor,1).fillRoundedRect(a.x,a.y,a.w,a.h,8)
  g.lineStyle(2,t.accent,.55).strokeRoundedRect(a.x,a.y,a.w,a.h,8)
  scene.add.text(a.x+a.w/2,a.y+12,a.label,{fontFamily:'monospace',fontSize:'10px',fontStyle:'bold',color:'#f8e7c3'}).setOrigin(.5,0).setDepth(2)
}

function drawProp(g,p){
  const x=p.x,y=p.y,wood=0x6d4c33,light=0xe9ddc8,metal=0x909a9d,dark=0x2b221c
  switch(p.type){
    case'bed':g.fillStyle(dark,1).fillRoundedRect(x-24,y-14,48,30,4);g.fillStyle(light,1).fillRoundedRect(x-20,y-11,40,23,4);g.fillStyle(0xc6ae96,1).fillRoundedRect(x-17,y-8,34,8,3);break
    case'nightstand':g.fillStyle(wood,1).fillRoundedRect(x-8,y-8,16,16,2);g.fillStyle(C.gold,1).fillCircle(x+4,y,1.5);break
    case'wardrobe':case'locker':g.fillStyle(p.type==='locker'?0x657078:wood,1).fillRoundedRect(x-11,y-18,22,36,3);g.lineStyle(1,dark,.8).lineBetween(x,y-15,x,y+15);break
    case'wineRack':g.fillStyle(wood,1).fillRoundedRect(x-13,y-16,26,32,2);for(let i=0;i<6;i++)g.fillStyle(0x7a2e42,1).fillCircle(x-7+(i%2)*14,y-10+Math.floor(i/2)*10,3);break
    case'desk':case'counter':case'buffet':case'workbench':case'meetingTable':
      g.fillStyle(wood,1).fillRoundedRect(x-26,y-8,52,16,3);g.fillStyle(0xa77a50,1).fillRect(x-23,y-6,46,4);break
    case'sofa':g.fillStyle(0x4e6877,1).fillRoundedRect(x-23,y-10,46,20,6);g.fillStyle(0x688595,1).fillRoundedRect(x-19,y-6,38,9,4);break
    case'table':g.fillStyle(wood,1).fillCircle(x,y,15);g.fillStyle(C.gold,.5).fillCircle(x,y,12);break
    case'stool':g.fillStyle(0x7d3d36,1).fillCircle(x,y,7);g.fillStyle(metal,1).fillRect(x-1,y+6,2,10);break
    case'plant':case'planter':g.fillStyle(0x80583c,1).fillRoundedRect(x-6,y+2,12,10,2);g.fillStyle(0x4b9a5c,1).fillCircle(x,y-4,10);g.fillStyle(0x74bf7c,.8).fillCircle(x-5,y-7,5);break
    case'luggage':case'crate':g.fillStyle(p.type==='crate'?0x8e6842:0x573d68,1).fillRoundedRect(x-9,y-9,18,18,3);break
    case'washer':g.fillStyle(0xd8dede,1).fillRoundedRect(x-13,y-15,26,30,3);g.fillStyle(0x173848,1).fillCircle(x,y+2,8);g.lineStyle(2,C.cyan,.7).strokeCircle(x,y+2,8);break
    case'linenRack':case'rack':g.fillStyle(dark,1).fillRoundedRect(x-17,y-16,34,32,2);for(let r=0;r<3;r++)g.lineStyle(2,metal,.7).lineBetween(x-14,y-9+r*10,x+14,y-9+r*10);break
    case'ironingTable':g.fillStyle(0xa3acae,1).fillRoundedRect(x-22,y-5,44,10,5);g.lineStyle(2,metal,1).lineBetween(x-15,y+5,x-8,y+16).lineBetween(x+15,y+5,x+8,y+16);break
    case'toolWall':g.fillStyle(0x4d5559,1).fillRoundedRect(x-18,y-16,36,32,2);for(let i=0;i<4;i++)g.fillStyle([0xdc5e49,0xe1b95c,0x6bb5da][i%3],1).fillRect(x-12+i*8,y-9+(i%2)*7,4,12);break
    case'fridge':g.fillStyle(0xdce2e2,1).fillRoundedRect(x-11,y-18,22,36,3);g.lineStyle(1,0x8c9698,.8).lineBetween(x-9,y,x+9,y);break
    case'stage':g.fillStyle(0x663a31,1).fillRoundedRect(x-28,y-7,56,14,3);g.lineStyle(2,C.gold,.6).strokeRoundedRect(x-28,y-7,56,14,3);break
    case'chairs':for(let r=0;r<2;r++)for(let c=0;c<5;c++)g.fillStyle(0x773538,1).fillRoundedRect(x-28+c*14,y-8+r*12,9,8,2);break
    case'screen':case'terminal':case'core':g.fillStyle(0x0b1720,1).fillRoundedRect(x-14,y-11,28,22,3);g.lineStyle(2,C.cyan,.9).strokeRoundedRect(x-14,y-11,28,22,3);g.fillStyle(C.cyan,.35).fillRect(x-8,y-4,16,3);break
    case'lounger':g.fillStyle(0xe1d1bb,1).fillRoundedRect(x-21,y-7,42,14,7);break
    case'bench':g.fillStyle(wood,1).fillRoundedRect(x-20,y-5,40,10,3);break
    case'treadmill':g.fillStyle(0x343c42,1).fillRoundedRect(x-20,y-6,40,12,3);g.lineStyle(2,metal,1).lineBetween(x+14,y-5,x+18,y-18);break
  }
}

function makeAgent(scene,a,onSelect){
  const look=AGENT_LOOKS[a.id]||AGENT_LOOKS.randai
  const accent=Phaser.Display.Color.HexStringToColor(a.tone||'#55d8ff').color
  const c=scene.add.container(0,0).setSize(34,46).setInteractive({useHandCursor:true}).setDepth(12)
  const shadow=scene.add.ellipse(0,14,24,7,0x000000,.35)
  const ring=scene.add.circle(0,2,14,accent,.08).setStrokeStyle(1,accent,.75)
  const body=scene.add.rectangle(0,5,14,18,0xe9eef0).setStrokeStyle(2,0x15202a)
  const head=scene.add.rectangle(0,-8,14,12,0xf1e5d8).setStrokeStyle(2,0x15202a)
  const visor=scene.add.rectangle(0,-8,9,4,accent,.9)
  const badge=scene.add.circle(0,5,3,look.accent||accent,1)
  const label=scene.add.text(0,24,a.name,{fontFamily:'monospace',fontSize:'8px',fontStyle:'bold',color:'#ffffff',backgroundColor:'#07111fd9',padding:{left:3,right:3,top:1,bottom:1}}).setOrigin(.5)
  c.add([shadow,ring,body,head,visor,badge,label])
  c.on('pointerdown',()=>onSelect?.(a.id))
  return {container:c,ring,target:{x:0,y:0},route:[],zone:null,tween:null}
}

function makeClient(scene,issue,index,onSelect){
  const aura=urgencyAura(issue.urgenza),pos=clientLane(issue,index)
  const area=areaById('lobby'),x=area.x+65+(index%6)*65,y=area.y+42+(index%2)*16
  const c=scene.add.container(x,y).setSize(28,38).setInteractive({useHandCursor:true}).setDepth(11)
  const glow=scene.add.circle(0,4,16,aura.color,aura.alpha)
  const body=scene.add.rectangle(0,5,11,16,0x6b86a3).setStrokeStyle(2,0x16202a)
  const head=scene.add.rectangle(0,-6,10,10,0xe4bea0).setStrokeStyle(2,0x16202a)
  const bubble=scene.add.text(0,-22,problemEmoji(issue),{fontSize:'12px',backgroundColor:'#ffffff',padding:{left:2,right:2,top:1,bottom:1}}).setOrigin(.5)
  c.add([glow,body,head,bubble]);c.on('pointerdown',()=>onSelect?.(issue))
  return {container:c,glow,aura,pulse:aura.pulse}
}

export class LivingWorldScene extends Phaser.Scene{
  constructor(){super({key:'LivingWorld'});this.agentNodes=new Map();this.clientNodes=new Map();this.spawnPoints=new Map();this.selectedId=null;this.director=true}
  create(){
    const cb=this.game.config.callbacks||{};this.onSelect=cb.onSelect;this.onSelectIssue=cb.onSelectIssue
    this.paintWorld();this.setAgents(cb.agents||[]);this.setClients(cb.issues||[]);this.bindCamera();cb.onSceneReady?.(this)
  }
  paintWorld(){
    const g=this.add.graphics().setDepth(0)
    this.cameras.main.setBackgroundColor('#061018');this.cameras.main.setBounds(0,0,WORLD.width,WORLD.height);this.cameras.main.centerOn(WORLD.width/2,WORLD.height/2)
    g.fillStyle(C.bg,1).fillRect(0,0,WORLD.width,WORLD.height)
    g.fillStyle(0x10242c,1).fillRoundedRect(20,25,WORLD.width-40,WORLD.height-55,18)
    g.fillStyle(C.hotel,1).fillRoundedRect(28,33,WORLD.width-56,WORLD.height-71,14)

    // connected corridors: hotel first, rooms second, furnishings third.
    g.fillStyle(C.corridor,1).fillRect(45,205,1350,82)
    g.fillStyle(C.corridor,1).fillRect(45,535,1350,72)
    g.fillStyle(C.corridor,1).fillRect(565,285,310,250)
    g.fillStyle(C.runner,.82).fillRoundedRect(650,255,140,340,10)
    g.lineStyle(2,C.gold,.55).strokeRoundedRect(650,255,140,340,10)

    for(const a of HOTEL_LAYOUT)drawRoom(this,g,a)
    for(const a of Object.values(HOTEL_SHARED))drawShared(this,g,a)
    for(const a of ALL_AREAS)for(const p of propPositions(a))drawProp(g,p)

    // hotel identity
    this.add.text(720,16,'HOTEL GIÒ · RANDAILIVE',{fontFamily:'monospace',fontSize:'15px',fontStyle:'bold',color:'#f2d795'}).setOrigin(.5,0).setDepth(3)
    this.add.text(720,844,'INGRESSO · LIVE HOTEL OPERATIONS',{fontFamily:'monospace',fontSize:'9px',color:'#5ddcff'}).setOrigin(.5,0).setDepth(3)
  }
  bindCamera(){
    const cam=this.cameras.main;cam.setZoom(.78)
    let drag=false,prev=null
    this.input.on('pointerdown',p=>{if(p.button===0){drag=true;prev={x:p.x,y:p.y}}})
    this.input.on('pointermove',p=>{if(!drag||!prev||!p.isDown)return;cam.scrollX-=(p.x-prev.x)/cam.zoom;cam.scrollY-=(p.y-prev.y)/cam.zoom;prev={x:p.x,y:p.y}})
    this.input.on('pointerup',()=>{drag=false;prev=null})
    this.input.on('wheel',(_p,_o,_dx,dy)=>cam.setZoom(Phaser.Math.Clamp(cam.zoom-dy*.001,.48,1.45)))
  }
  setAgents(agents){
    for(const a of agents){
      let n=this.agentNodes.get(a.id)
      if(!n){n=makeAgent(this,a,this.onSelect);this.agentNodes.set(a.id,n);const home=areaById(a.life?.zone||'hub');const p=centerOf(home);n.container.setPosition(p.x,p.y);n.zone=a.life?.zone||'hub'}
      const z=a.life?.zone||'hub'
      if(n.zone!==z){n.route=routeBetween(n.zone,z);n.zone=z;n.target=n.route.shift()||centerOf(areaById(z))}
    }
    this.updateSelection(this.selectedId)
  }
  setClients(issues){
    const alive=new Set()
    for(const [i,issue] of (issues||[]).entries()){alive.add(issue.id);if(!this.clientNodes.has(issue.id))this.clientNodes.set(issue.id,makeClient(this,issue,i,this.onSelectIssue))}
    for(const [id,n] of this.clientNodes)if(!alive.has(id)){n.container.destroy(true);this.clientNodes.delete(id)}
  }
  updateSelection(id){
    this.selectedId=id
    for(const [aid,n] of this.agentNodes){const active=aid===id;n.ring.setStrokeStyle(active?3:1,active?0xffffff:0x55d8ff,active?1:.7);n.container.setAlpha(this.director&&id&&!active?.5:1)}
  }
  setDirector(v){this.director=v;this.updateSelection(this.selectedId)}
  update(time){
    for(const n of this.agentNodes.values()){
      if(!n.target||(!n.route.length&&Math.abs(n.container.x-n.target.x)<3&&Math.abs(n.container.y-n.target.y)<3))continue
      const d=Phaser.Math.Distance.Between(n.container.x,n.container.y,n.target.x,n.target.y)
      if(d<4&&n.route.length&&!n.tween)n.target=n.route.shift()
      if(d>4&&!n.tween)n.tween=this.tweens.add({targets:n.container,x:n.target.x,y:n.target.y,duration:900,ease:'Linear',onComplete:()=>{n.tween=null}})
    }
    for(const n of this.clientNodes.values()){const s=1+Math.sin(time/240)*.05;n.glow.setScale(s)}
  }
}

export function createLivingWorldGame(parent,callbacks){
  return new Phaser.Game({type:Phaser.AUTO,parent,width:'100%',height:'100%',backgroundColor:'#061018',pixelArt:true,antialias:false,scale:{mode:Phaser.Scale.RESIZE,autoCenter:Phaser.Scale.CENTER_BOTH},callbacks,scene:LivingWorldScene})
}
