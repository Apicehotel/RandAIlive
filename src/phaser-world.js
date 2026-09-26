import Phaser from 'phaser'
import { buildIsoHotel } from './iso/iso-renderer.js'
import { gridToScreen, isoDepth } from './iso/iso-math.js'
import { destinationForZone, mapById, roomById, routeAreas } from './iso/iso-world.js'
import { areaForIssue } from './living-runtime.js'
import { AGENT_LOOKS, problemEmoji, urgencyAura } from './pixel-sprites.js'

export const WORLD_SIZE={width:4600,height:2500}

function makeIsoAgent(scene,agent,onSelect){
  const look=AGENT_LOOKS[agent.id]||AGENT_LOOKS.randai
  const accent=Phaser.Display.Color.HexStringToColor(agent.tone||'#58dfff').color
  const c=scene.add.container(0,0).setSize(44,68).setInteractive({useHandCursor:true})
  const shadow=scene.add.ellipse(5,14,32,11,0x000000,.32)
  const leftLeg=scene.add.polygon(-6,7,[0,0,8,3,8,20,0,17],0x303b42).setStrokeStyle(1,0x12191e)
  const rightLeg=scene.add.polygon(6,7,[0,3,8,0,8,17,0,20],0x445159).setStrokeStyle(1,0x12191e)
  const torso=scene.add.polygon(0,-9,[0,0,15,8,0,28,-15,8],look.accent||accent).setStrokeStyle(2,0x14212a)
  const shirt=scene.add.polygon(0,-5,[0,4,10,10,0,20,-10,10],0xe7ecec,.82)
  const head=scene.add.polygon(0,-31,[0,0,10,5,10,18,0,23,-10,18,-10,5],0xe7c5a7).setStrokeStyle(2,0x14212a)
  const visor=scene.add.polygon(0,-21,[0,0,8,4,0,9,-8,4],accent,.95)
  const ring=scene.add.ellipse(0,2,40,27,accent,.05).setStrokeStyle(1,accent,.5)
  const source=scene.add.text(0,-49,agent.life?.source||'SIM',{fontFamily:'monospace',fontSize:'7px',fontStyle:'bold',color:agent.life?.source==='LIVE'?'#78ffb0':'#9edfff',backgroundColor:'#071018e8',padding:{left:3,right:3,top:1,bottom:1}}).setOrigin(.5)
  const label=scene.add.text(0,31,agent.name||agent.id,{fontFamily:'monospace',fontSize:'9px',fontStyle:'bold',color:'#fff',backgroundColor:'#071018e8',padding:{left:4,right:4,top:2,bottom:2}}).setOrigin(.5)
  c.add([shadow,ring,leftLeg,rightLeg,torso,shirt,head,visor,source,label]);c.on('pointerdown',()=>onSelect?.(agent.id))
  return {container:c,ring,leftLeg,rightLeg,torso,source,route:[],target:null,mapId:null,zone:null,grid:null,pending:null,travelStage:null}
}

function issueDestination(issue){
  const destination=destinationForZone(areaForIssue(issue))
  const room=String(issue.camera||'').match(/([1-8]\d{2})/i)?.[1]
  if(room&&mapById(destination.mapId).areas.some(a=>a.id===`room-${room}`))destination.areaId=`room-${room}`
  return destination
}

function makeGuest(scene,issue,index,onSelect){
  const aura=urgencyAura(issue.urgenza),destination=issueDestination(issue),room=roomById(destination.areaId,destination.mapId)
  const gx=room.anchor.x+((index%3)-1)*.34,gy=room.anchor.y+Math.floor(index/3)*.32,p=gridToScreen(gx,gy)
  const c=scene.add.container(p.x,p.y).setSize(30,52).setInteractive({useHandCursor:true}).setDepth(30500+isoDepth(gx,gy))
  const glow=scene.add.ellipse(0,8,30,13,aura.color,aura.alpha)
  const legs=scene.add.polygon(0,5,[0,0,10,5,0,18,-10,5],0x35434d)
  const body=scene.add.polygon(0,-8,[0,0,13,7,0,24,-13,7],0x6b86a3).setStrokeStyle(1,0x19232b)
  const head=scene.add.polygon(0,-27,[0,0,9,4,9,15,0,20,-9,15,-9,4],0xe4bea0).setStrokeStyle(1,0x19232b)
  const live=scene.add.text(0,-55,'LIVE',{fontFamily:'monospace',fontSize:'7px',fontStyle:'bold',color:'#78ffb0',backgroundColor:'#071018e8',padding:{left:3,right:3,top:1,bottom:1}}).setOrigin(.5)
  const bubble=scene.add.text(0,-43,problemEmoji(issue),{fontSize:'14px',backgroundColor:'#fffffff2',padding:{left:3,right:3,top:2,bottom:2}}).setOrigin(.5)
  c.add([glow,legs,body,head,live,bubble]);c.on('pointerdown',()=>onSelect?.(issue))
  return {container:c,glow,pulse:aura.pulse,mapId:destination.mapId,grid:{x:gx,y:gy}}
}

export class LivingWorldScene extends Phaser.Scene{
  constructor(){super({key:'LivingWorld'});this.agentNodes=new Map();this.clientNodes=new Map();this.hotel=null;this.activeMapId='ground';this.selectedId=null;this.director=true}

  create(){
    const cb=this.game.config.callbacks||{};this.callbacks=cb;this.onSelect=cb.onSelect;this.onSelectIssue=cb.onSelectIssue
    this.cameras.main.setBackgroundColor('#071018');this.buildWorld(cb.initialMapId||'ground')
    this.setAgents(cb.agents||[]);this.setClients(cb.issues||[]);this.bindCamera();cb.onSceneReady?.(this)
  }

  buildWorld(mapId){
    this.hotel?.destroy?.();this.activeMapId=mapById(mapId).id
    this.hotel=buildIsoHotel(this,this.activeMapId,{onElevator:()=>this.callbacks?.onElevator?.(this.activeMapId)})
    for(const node of this.agentNodes.values())this.syncNodeVisibility(node)
    for(const node of this.clientNodes.values())node.container.setVisible(node.mapId===this.activeMapId)
    this.fitCamera(false);this.callbacks?.onMapChanged?.(this.activeMapId)
  }

  setActiveMap(mapId){if(mapId!==this.activeMapId)this.buildWorld(mapId)}

  fitCamera(animate=true){
    if(!this.hotel)return
    const cam=this.cameras.main,b=this.hotel.bounds,pad=120
    cam.setBounds(b.x-pad,b.y-pad,b.width+pad*2,b.height+pad*2)
    const fit=Math.min(this.scale.width/(b.width+pad),this.scale.height/(b.height+pad))*.92
    const zoom=Phaser.Math.Clamp(fit,this.scale.width<760?.22:.25,this.scale.width<760?.62:.78)
    if(animate)cam.pan(b.centerX,b.centerY,280,'Sine.easeInOut');else cam.centerOn(b.centerX,b.centerY)
    cam.setZoom(zoom)
  }

  bindCamera(){
    const cam=this.cameras.main;let dragging=false,last=null,pinchDistance=null
    this.input.on('pointerdown',p=>{if(p.button===0){dragging=true;last={x:p.x,y:p.y}}})
    this.input.on('pointermove',p=>{
      const pointers=this.input.manager.pointers.filter(pointer=>pointer.isDown)
      if(pointers.length>=2){
        const d=Phaser.Math.Distance.Between(pointers[0].x,pointers[0].y,pointers[1].x,pointers[1].y)
        if(pinchDistance)cam.setZoom(Phaser.Math.Clamp(cam.zoom+(d-pinchDistance)*.002,.2,1.25))
        pinchDistance=d;return
      }
      pinchDistance=null
      if(!dragging||!last||!p.isDown)return
      cam.scrollX-=(p.x-last.x)/cam.zoom;cam.scrollY-=(p.y-last.y)/cam.zoom;last={x:p.x,y:p.y}
    })
    this.input.on('pointerup',()=>{dragging=false;last=null;pinchDistance=null})
    this.input.on('wheel',(_p,_o,_dx,dy)=>cam.setZoom(Phaser.Math.Clamp(cam.zoom-dy*.001,.2,1.25)))
    this.scale.on('resize',()=>this.fitCamera(false));this.input.keyboard?.on('keydown-ZERO',()=>this.fitCamera(true))
  }

  syncNodeVisibility(node){
    const visible=node.mapId===this.activeMapId;node.container.setVisible(visible)
    if(visible&&node.grid){const p=gridToScreen(node.grid.x,node.grid.y);node.container.setPosition(p.x,p.y);node.container.setDepth(30500+isoDepth(node.grid.x,node.grid.y,500))}
  }

  planAgent(node,destination){
    if(node.mapId===destination.mapId){
      if(node.zone===destination.areaId&&!node.travelStage)return
      node.route=routeAreas(node.zone,destination.areaId,node.mapId).slice(1);node.target=node.route.shift()||null;node.pending={...destination};node.travelStage='local';return
    }
    node.route=routeAreas(node.zone,mapById(node.mapId).elevatorArea,node.mapId).slice(1);node.target=node.route.shift()||null;node.pending={...destination};node.travelStage='to-elevator'
    if(!node.target)this.completeAgentLeg(node)
  }

  setAgents(agents=[]){
    const alive=new Set()
    for(const agent of agents){
      alive.add(agent.id);let node=this.agentNodes.get(agent.id);const desired=destinationForZone(agent.life?.zone)
      if(!node){
        node=makeIsoAgent(this,agent,this.onSelect);this.agentNodes.set(agent.id,node);node.mapId=desired.mapId;node.zone=desired.areaId;node.grid={...roomById(desired.areaId,desired.mapId).anchor};this.syncNodeVisibility(node)
      }else if(node.pending?.mapId!==desired.mapId||node.pending?.areaId!==desired.areaId){this.planAgent(node,desired)}
      node.source.setText(agent.life?.source||'SIM').setColor(agent.life?.source==='LIVE'?'#78ffb0':'#9edfff')
    }
    for(const [id,node] of this.agentNodes)if(!alive.has(id)){node.container.destroy(true);this.agentNodes.delete(id)}
    this.updateSelection(this.selectedId)
  }

  setClients(issues=[]){
    const alive=new Set()
    issues.forEach((issue,index)=>{
      alive.add(issue.id);const expected=issueDestination(issue);let node=this.clientNodes.get(issue.id)
      if(node&&node.mapId!==expected.mapId){node.container.destroy(true);this.clientNodes.delete(issue.id);node=null}
      if(!node){node=makeGuest(this,issue,index,this.onSelectIssue);this.clientNodes.set(issue.id,node)}
      node.container.setVisible(node.mapId===this.activeMapId)
    })
    for(const [id,node] of this.clientNodes)if(!alive.has(id)){node.container.destroy(true);this.clientNodes.delete(id)}
  }

  updateSelection(id){
    this.selectedId=id
    for(const [aid,node] of this.agentNodes){
      const active=aid===id
      node.ring.setStrokeStyle(active?3:1,active?0xffffff:0x58dfff,active?1:.5)
      node.container.setAlpha(this.director&&id&&!active ? 0.48 : 1)
    }
    const selected=this.agentNodes.get(id);if(selected?.container.visible&&this.director)this.cameras.main.pan(selected.container.x,selected.container.y,320,'Sine.easeInOut')
  }
  setDirector(v){this.director=Boolean(v);this.updateSelection(this.selectedId)}

  completeAgentLeg(node){
    if(node.travelStage==='to-elevator'&&node.pending){
      node.mapId=node.pending.mapId;node.zone=mapById(node.mapId).elevatorArea;node.grid={...roomById(node.zone,node.mapId).anchor}
      node.route=routeAreas(node.zone,node.pending.areaId,node.mapId).slice(1);node.target=node.route.shift()||null;node.travelStage='from-elevator';this.syncNodeVisibility(node);return
    }
    if((node.travelStage==='from-elevator'||node.travelStage==='local')&&node.pending){node.zone=node.pending.areaId;node.pending=null;node.travelStage=null;node.target=null;node.route=[]}
  }

  stepAgent(node,delta,time){
    if(!node.target&&node.route.length)node.target=node.route.shift()
    if(!node.target){if(node.travelStage)this.completeAgentLeg(node);return}
    const dx=node.target.x-node.grid.x,dy=node.target.y-node.grid.y,dist=Math.hypot(dx,dy)
    if(dist<.035){node.grid={...node.target};node.target=node.route.shift()||null;if(!node.target)this.completeAgentLeg(node)}
    else{const step=.00135*delta,k=Math.min(1,step/dist);node.grid.x+=dx*k;node.grid.y+=dy*k}
    if(node.mapId===this.activeMapId){
      const p=gridToScreen(node.grid.x,node.grid.y);node.container.setPosition(p.x,p.y).setDepth(30500+isoDepth(node.grid.x,node.grid.y,500))
      const phase=Math.sin(time/85);node.leftLeg.y=7+phase*2;node.rightLeg.y=7-phase*2;node.torso.y=-9+Math.abs(phase)*.8
    }
  }

  update(time,delta){for(const node of this.agentNodes.values())this.stepAgent(node,delta,time);for(const node of this.clientNodes.values())if(node.container.visible)node.glow.setScale(1+Math.sin(time/(260-Math.min(120,node.pulse||0)))*.05)}
}

export function createLivingWorldGame(parent,callbacks){
  return new Phaser.Game({type:Phaser.AUTO,parent,width:'100%',height:'100%',backgroundColor:'#071018',pixelArt:false,antialias:true,roundPixels:false,scale:{mode:Phaser.Scale.RESIZE,autoCenter:Phaser.Scale.CENTER_BOTH},callbacks,scene:LivingWorldScene})
}
