import Phaser from 'phaser'
import { WORLD, areaById, centerOf, projectWorld, routeBetween } from './hotel-world-v3.js'
import { createHotelRenderer } from './hotel-renderer-v3.js'
import { AGENT_LOOKS, problemEmoji, urgencyAura } from './pixel-sprites.js'

export const WORLD_SIZE={width:WORLD.width,height:WORLD.height}

function agentBody(scene,a,onSelect){
  const look=AGENT_LOOKS[a.id]||AGENT_LOOKS.randai
  const accent=Phaser.Display.Color.HexStringToColor(a.tone||'#58dfff').color
  const c=scene.add.container(0,0).setSize(28,38).setInteractive({useHandCursor:true}).setDepth(12)
  const shadow=scene.add.ellipse(0,13,19,5,0x000000,.32)
  const legs=scene.add.rectangle(0,10,11,8,0x26323a).setStrokeStyle(1,0x11181d)
  const body=scene.add.rectangle(0,2,15,18,look.accent||accent).setStrokeStyle(2,0x13202a)
  const shirt=scene.add.rectangle(0,4,11,8,0xe4e9e9,.82)
  const head=scene.add.rectangle(0,-9,13,11,0xe7c7a8).setStrokeStyle(2,0x13202a)
  const visor=scene.add.rectangle(0,-9,8,3,accent,.95)
  const ring=scene.add.ellipse(0,2,25,31,accent,.04).setStrokeStyle(1,accent,.6)
  const label=scene.add.text(0,22,a.name||a.id,{
    fontFamily:'monospace',fontSize:'7px',fontStyle:'bold',color:'#fff',
    backgroundColor:'#071018cc',padding:{left:3,right:3,top:1,bottom:1}
  }).setOrigin(.5)
  c.add([shadow,ring,legs,body,shirt,head,visor,label])
  c.on('pointerdown',()=>onSelect?.(a.id))
  return {container:c,ring,legs,body,target:null,route:[],zone:null,moving:false}
}

function guestBody(scene,issue,index,onSelect){
  const aura=urgencyAura(issue.urgenza)
  const lobby=areaById('lobby')
  const x=lobby.x+75+(index%6)*70,y=lobby.y+37+(Math.floor(index/6)%2)*20
  const c=scene.add.container(x,y).setSize(24,34).setInteractive({useHandCursor:true}).setDepth(11)
  const glow=scene.add.circle(0,3,13,aura.color,aura.alpha)
  const legs=scene.add.rectangle(0,10,9,7,0x26323a)
  const body=scene.add.rectangle(0,3,12,15,0x6b86a3).setStrokeStyle(1,0x17212a)
  const head=scene.add.rectangle(0,-7,10,10,0xe4bea0).setStrokeStyle(1,0x17212a)
  const bubble=scene.add.text(0,-20,problemEmoji(issue),{fontSize:'10px',backgroundColor:'#fffffff0',padding:{left:2,right:2,top:1,bottom:1}}).setOrigin(.5)
  c.add([glow,legs,body,head,bubble])
  c.on('pointerdown',()=>onSelect?.(issue))
  return {container:c,glow,pulse:aura.pulse}
}

export class LivingWorldScene extends Phaser.Scene{
  constructor(){
    super({key:'LivingWorld'})
    this.agentNodes=new Map()
    this.clientNodes=new Map()
    this.selectedId=null
    this.director=true
    this.hotelRenderer=null
    this.projection=null
  }

  create(){
    const cb=this.game.config.callbacks||{}
    this.onSelect=cb.onSelect
    this.onSelectIssue=cb.onSelectIssue
    this.projection=projectWorld()
    this.cameras.main.setBackgroundColor('#061018')
    this.cameras.main.setBounds(0,0,WORLD.width,WORLD.height)
    this.hotelRenderer=createHotelRenderer(this,this.projection)
    this.setAgents(cb.agents||[])
    this.setClients(cb.issues||[])
    this.bindCamera()
    cb.onSceneReady?.(this)
  }

  bindCamera(){
    const cam=this.cameras.main
    const mobile=this.scale.width<760
    cam.setZoom(mobile?.58:.74)
    cam.centerOn(WORLD.width/2,WORLD.height/2)
    let dragging=false,last=null
    this.input.on('pointerdown',p=>{if(p.button===0){dragging=true;last={x:p.x,y:p.y}}})
    this.input.on('pointermove',p=>{
      if(!dragging||!last||!p.isDown)return
      cam.scrollX-=(p.x-last.x)/cam.zoom
      cam.scrollY-=(p.y-last.y)/cam.zoom
      last={x:p.x,y:p.y}
    })
    this.input.on('pointerup',()=>{dragging=false;last=null})
    this.input.on('wheel',(_p,_o,_dx,dy)=>cam.setZoom(Phaser.Math.Clamp(cam.zoom-dy*.001,.42,1.45)))
  }

  setAgents(agents=[]){
    const alive=new Set()
    for(const a of agents){
      alive.add(a.id)
      let node=this.agentNodes.get(a.id)
      const desired=a.life?.zone||'randhub'
      if(!node){
        node=agentBody(this,a,this.onSelect)
        this.agentNodes.set(a.id,node)
        const start=centerOf(areaById(desired))
        node.container.setPosition(start.x,start.y)
        node.zone=desired
      }
      if(node.zone!==desired){
        node.route=routeBetween(node.zone,desired)
        node.zone=desired
        node.target=node.route.shift()||centerOf(areaById(desired))
      }
    }
    for(const [id,node] of this.agentNodes)if(!alive.has(id)){node.container.destroy(true);this.agentNodes.delete(id)}
    this.updateSelection(this.selectedId)
  }

  setClients(issues=[]){
    const alive=new Set()
    issues.forEach((issue,index)=>{
      alive.add(issue.id)
      if(!this.clientNodes.has(issue.id))this.clientNodes.set(issue.id,guestBody(this,issue,index,this.onSelectIssue))
    })
    for(const [id,node] of this.clientNodes)if(!alive.has(id)){node.container.destroy(true);this.clientNodes.delete(id)}
  }

  updateSelection(id){
    this.selectedId=id
    for(const [aid,node] of this.agentNodes){
      const active=aid===id
      node.ring.setStrokeStyle(active?3:1,active?0xffffff:0x58dfff,active?1:.55)
      node.container.setAlpha(this.director && id && !active ? .55 : 1)
    }
  }

  setDirector(value){this.director=Boolean(value);this.updateSelection(this.selectedId)}

  stepAgent(node,delta,time){
    if(!node.target&&node.route.length)node.target=node.route.shift()
    if(!node.target)return
    const dx=node.target.x-node.container.x,dy=node.target.y-node.container.y
    const dist=Math.hypot(dx,dy)
    if(dist<4){
      node.container.setPosition(node.target.x,node.target.y)
      node.target=node.route.shift()||null
      node.moving=Boolean(node.target)
      return
    }
    node.moving=true
    const speed=.095*delta
    const k=Math.min(1,speed/dist)
    node.container.x+=dx*k
    node.container.y+=dy*k
    node.container.setDepth(12+node.container.y/1000)
    const bob=Math.sin(time/90)*1.2
    node.body.y=2+bob
    node.legs.scaleY=.85+Math.abs(Math.sin(time/90))*.2
  }

  update(time,delta){
    this.hotelRenderer?.drawAmbient(time)
    for(const node of this.agentNodes.values())this.stepAgent(node,delta,time)
    for(const node of this.clientNodes.values())node.glow.setScale(1+Math.sin(time/(260-Math.min(120,node.pulse||0)))*.05)
  }
}

export function createLivingWorldGame(parent,callbacks){
  return new Phaser.Game({
    type:Phaser.AUTO,parent,width:'100%',height:'100%',backgroundColor:'#061018',
    pixelArt:true,antialias:false,
    scale:{mode:Phaser.Scale.RESIZE,autoCenter:Phaser.Scale.CENTER_BOTH},
    callbacks,scene:LivingWorldScene,
  })
}
