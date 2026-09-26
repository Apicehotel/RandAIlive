import Phaser from 'phaser'
import { buildIsoHotel } from './iso/iso-renderer.js'
import { gridToScreen, isoDepth } from './iso/iso-math.js'
import { ISO_WORLD, roomById, routeZones } from './iso/iso-world.js'
import { AGENT_LOOKS, problemEmoji, urgencyAura } from './pixel-sprites.js'

export const WORLD_SIZE={width:1920,height:1180}

const normalizeZone=zone=>{
  if(!zone)return 'lobby'
  if(/^jazz[1-4]$/.test(zone)||/^wine[5-8]$/.test(zone))return 'elevators'
  if(zone==='hub'||zone==='randhub'||zone==='exterior')return zone==='exterior'?'entrance':'lobby'
  if(zone==='ironing'||zone==='laundry'||zone==='staff')return 'service'
  if(zone==='breakfast')return 'restaurant'
  return ISO_WORLD.rooms.some(r=>r.id===zone)?zone:'lobby'
}

function makeIsoAgent(scene,agent,onSelect){
  const look=AGENT_LOOKS[agent.id]||AGENT_LOOKS.randai
  const accent=Phaser.Display.Color.HexStringToColor(agent.tone||'#58dfff').color
  const c=scene.add.container(0,0).setSize(38,62).setInteractive({useHandCursor:true})
  const shadow=scene.add.ellipse(0,12,28,10,0x000000,.28)
  const leftLeg=scene.add.polygon(-5,6,[0,0,7,3,7,19,0,16],0x303b42).setStrokeStyle(1,0x12191e)
  const rightLeg=scene.add.polygon(5,6,[0,3,7,0,7,16,0,19],0x445159).setStrokeStyle(1,0x12191e)
  const torso=scene.add.polygon(0,-8,[0,0,14,7,0,26,-14,7],look.accent||accent).setStrokeStyle(2,0x14212a)
  const shirt=scene.add.polygon(0,-5,[0,4,9,9,0,18,-9,9],0xe7ecec,.82)
  const head=scene.add.polygon(0,-28,[0,0,9,5,9,16,0,21,-9,16,-9,5],0xe7c5a7).setStrokeStyle(2,0x14212a)
  const visor=scene.add.polygon(0,-20,[0,0,7,4,0,8,-7,4],accent,.95)
  const ring=scene.add.ellipse(0,0,35,24,accent,.05).setStrokeStyle(1,accent,.5)
  const label=scene.add.text(0,26,agent.name||agent.id,{fontFamily:'monospace',fontSize:'8px',fontStyle:'bold',color:'#fff',backgroundColor:'#071018d9',padding:{left:3,right:3,top:1,bottom:1}}).setOrigin(.5)
  c.add([shadow,ring,leftLeg,rightLeg,torso,shirt,head,visor,label])
  c.on('pointerdown',()=>onSelect?.(agent.id))
  return {container:c,ring,leftLeg,rightLeg,torso,route:[],zone:null,target:null}
}

function makeGuest(scene,issue,index,onSelect){
  const aura=urgencyAura(issue.urgenza)
  const room=roomById('lobby')
  const gx=room.x+1.2+(index%4)*1.25,gy=room.y+3.8+Math.floor(index/4)*.8
  const p=gridToScreen(gx,gy)
  const c=scene.add.container(p.x,p.y).setSize(28,48).setInteractive({useHandCursor:true}).setDepth(6000+isoDepth(gx,gy))
  const glow=scene.add.ellipse(0,7,26,12,aura.color,aura.alpha)
  const legs=scene.add.polygon(0,4,[0,0,9,4,0,16,-9,4],0x35434d)
  const body=scene.add.polygon(0,-7,[0,0,12,6,0,22,-12,6],0x6b86a3).setStrokeStyle(1,0x19232b)
  const head=scene.add.polygon(0,-24,[0,0,8,4,8,14,0,18,-8,14,-8,4],0xe4bea0).setStrokeStyle(1,0x19232b)
  const bubble=scene.add.text(0,-44,problemEmoji(issue),{fontSize:'13px',backgroundColor:'#fffffff2',padding:{left:3,right:3,top:2,bottom:2}}).setOrigin(.5)
  c.add([glow,legs,body,head,bubble])
  c.on('pointerdown',()=>onSelect?.(issue))
  return {container:c,glow,pulse:aura.pulse}
}

export class LivingWorldScene extends Phaser.Scene{
  constructor(){
    super({key:'LivingWorld'})
    this.agentNodes=new Map()
    this.clientNodes=new Map()
    this.hotel=null
    this.selectedId=null
    this.director=true
  }

  create(){
    const cb=this.game.config.callbacks||{}
    this.onSelect=cb.onSelect
    this.onSelectIssue=cb.onSelectIssue
    this.cameras.main.setBackgroundColor('#071018')
    this.cameras.main.setBounds(-400,-150,2600,1700)
    this.hotel=buildIsoHotel(this)
    this.setAgents(cb.agents||[])
    this.setClients(cb.issues||[])
    this.bindCamera()
    cb.onSceneReady?.(this)
  }

  bindCamera(){
    const cam=this.cameras.main
    const mobile=this.scale.width<760
    cam.setZoom(mobile?.48:.72)
    cam.centerOn(960,560)
    let dragging=false,last=null
    this.input.on('pointerdown',p=>{if(p.button===0){dragging=true;last={x:p.x,y:p.y}}})
    this.input.on('pointermove',p=>{
      if(!dragging||!last||!p.isDown)return
      cam.scrollX-=(p.x-last.x)/cam.zoom
      cam.scrollY-=(p.y-last.y)/cam.zoom
      last={x:p.x,y:p.y}
    })
    this.input.on('pointerup',()=>{dragging=false;last=null})
    this.input.on('wheel',(_p,_o,_dx,dy)=>cam.setZoom(Phaser.Math.Clamp(cam.zoom-dy*.001,.36,1.3)))
  }

  setAgents(agents=[]){
    const alive=new Set()
    for(const a of agents){
      alive.add(a.id)
      let node=this.agentNodes.get(a.id)
      const desired=normalizeZone(a.life?.zone)
      if(!node){
        node=makeIsoAgent(this,a,this.onSelect)
        this.agentNodes.set(a.id,node)
        const anchor=roomById(desired).anchor
        const p=gridToScreen(anchor.x,anchor.y)
        node.container.setPosition(p.x,p.y)
        node.container.setDepth(6000+isoDepth(anchor.x,anchor.y))
        node.zone=desired
      }
      if(node.zone!==desired){
        node.route=routeZones(node.zone,desired)
        node.zone=desired
        node.target=node.route.shift()||roomById(desired).anchor
      }
    }
    for(const [id,node] of this.agentNodes)if(!alive.has(id)){node.container.destroy(true);this.agentNodes.delete(id)}
    this.updateSelection(this.selectedId)
  }

  setClients(issues=[]){
    const alive=new Set()
    issues.forEach((issue,index)=>{
      alive.add(issue.id)
      if(!this.clientNodes.has(issue.id))this.clientNodes.set(issue.id,makeGuest(this,issue,index,this.onSelectIssue))
    })
    for(const [id,node] of this.clientNodes)if(!alive.has(id)){node.container.destroy(true);this.clientNodes.delete(id)}
  }

  updateSelection(id){
    this.selectedId=id
    for(const [aid,node] of this.agentNodes){
      const active=aid===id
      node.ring.setStrokeStyle(active?3:1,active?0xffffff:0x58dfff,active?1:.5)
      node.container.setAlpha(this.director&&id&&!active?.5:1)
    }
  }

  setDirector(v){this.director=Boolean(v);this.updateSelection(this.selectedId)}

  stepAgent(node,delta,time){
    if(!node.target&&node.route.length)node.target=node.route.shift()
    if(!node.target)return
    const target=gridToScreen(node.target.x,node.target.y)
    const dx=target.x-node.container.x,dy=target.y-node.container.y
    const dist=Math.hypot(dx,dy)
    if(dist<5){
      node.container.setPosition(target.x,target.y)
      node.target=node.route.shift()||null
      return
    }
    const speed=.12*delta,k=Math.min(1,speed/dist)
    node.container.x+=dx*k;node.container.y+=dy*k
    node.container.setDepth(6000+node.container.y)
    const phase=Math.sin(time/85)
    node.leftLeg.y=6+phase*2
    node.rightLeg.y=6-phase*2
    node.torso.y=-8+Math.abs(phase)*.7
  }

  update(time,delta){
    for(const node of this.agentNodes.values())this.stepAgent(node,delta,time)
    for(const node of this.clientNodes.values())node.glow.setScale(1+Math.sin(time/(260-Math.min(120,node.pulse||0)))*.05)
  }
}

export function createLivingWorldGame(parent,callbacks){
  return new Phaser.Game({
    type:Phaser.AUTO,parent,width:'100%',height:'100%',backgroundColor:'#071018',
    pixelArt:false,antialias:true,
    scale:{mode:Phaser.Scale.RESIZE,autoCenter:Phaser.Scale.CENTER_BOTH},
    callbacks,scene:LivingWorldScene,
  })
}
