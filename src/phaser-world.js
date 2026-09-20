import Phaser from 'phaser'
import hallMap from './hall-map.json'

export const WORLD_SIZE = { width: hallMap.width * hallMap.tilewidth, height: hallMap.height * hallMap.tileheight }

const layers = new Map(hallMap.layers.map(layer => [layer.name, layer]))
const objects = name => layers.get(name)?.objects || []
const property = (object, name, fallback = '') => object.properties?.find(item => item.name === name)?.value ?? fallback

const roomPalette = {
  reception: { fill: 0x153a54, line: 0x41d8ff },
  knowledge: { fill: 0x163e3b, line: 0x64e8ad },
  radar: { fill: 0x292246, line: 0xff6b85 },
  ops: { fill: 0x46351b, line: 0xffc14f },
  qa: { fill: 0x193a51, line: 0x70d9ff },
  design: { fill: 0x3b2443, line: 0xf18bff },
  coffee: { fill: 0x3e291d, line: 0xffba69 },
}

const toColor = tone => Phaser.Display.Color.HexStringToColor(tone || '#67d9ff').color

function drawRoom(scene, graphics, { x, y, width, height, title, subtitle, palette }) {
  graphics.fillStyle(palette.fill, 0.96)
  graphics.fillRoundedRect(x, y, width, height, 12)
  graphics.lineStyle(3, palette.line, 0.95)
  graphics.strokeRoundedRect(x, y, width, height, 12)
  graphics.lineStyle(1, 0xffffff, 0.12)
  graphics.strokeRoundedRect(x + 8, y + 8, width - 16, height - 16, 8)
  scene.add.text(x + 18, y + 16, title, { color: '#f4fbff', fontFamily: 'monospace', fontSize: '20px', fontStyle: 'bold' })
  scene.add.text(x + 18, y + 43, subtitle, { color: '#9ed6e8', fontFamily: 'monospace', fontSize: '10px', letterSpacing: 1 })
}

function drawGrid(graphics) {
  graphics.lineStyle(1, 0x75dfff, 0.08)
  for (let x = 0; x <= WORLD_SIZE.width; x += 40) graphics.lineBetween(x, 250, x, WORLD_SIZE.height)
  for (let y = 250; y <= WORLD_SIZE.height; y += 40) graphics.lineBetween(0, y, WORLD_SIZE.width, y)
}

function drawMappedRoom(scene, graphics, object) {
  if (object.type === 'hub') return
  drawRoom(scene, graphics, {
    x: object.x,
    y: object.y,
    width: object.width,
    height: object.height,
    title: property(object, 'title', object.name.toUpperCase()),
    subtitle: property(object, 'subtitle'),
    palette: roomPalette[property(object, 'palette', 'reception')] || roomPalette.reception,
  })
}

function makeAgent(scene, agent, onSelect) {
  const tone = toColor(agent.tone)
  const container = scene.add.container(0, 0).setSize(86, 86).setInteractive({ useHandCursor: true })
  const shadow = scene.add.ellipse(0, 28, 55, 14, 0x02070d, 0.6)
  const ring = scene.add.circle(0, 0, 34, tone, 0.14).setStrokeStyle(2, tone, 0.75)
  const body = scene.add.rectangle(0, 2, 30, 34, 0xe4f1f5).setStrokeStyle(4, 0x07111f, 1)
  const screen = scene.add.rectangle(0, -7, 22, 10, 0x07111f).setStrokeStyle(1, tone, 1)
  const eyeLeft = scene.add.rectangle(-6, -7, 3, 3, tone)
  const eyeRight = scene.add.rectangle(6, -7, 3, 3, tone)
  const antenna = scene.add.rectangle(0, -27, 3, 9, tone)
  const label = scene.add.text(0, 45, agent.name, { color: '#ffffff', backgroundColor: '#07111fe8', fontFamily: 'monospace', fontSize: '11px', padding: { left: 6, right: 6, top: 4, bottom: 4 } }).setOrigin(0.5)
  const activity = scene.add.text(0, 68, agent.life?.action || 'Disponibile', { color: agent.tone || '#67d9ff', fontFamily: 'monospace', fontSize: '9px' }).setOrigin(0.5)
  container.add([shadow, ring, body, screen, eyeLeft, eyeRight, antenna, label, activity])
  container.on('pointerdown', () => onSelect?.(agent.id))
  container.on('pointerover', () => ring.setStrokeStyle(4, 0xffffff, 1))
  container.on('pointerout', () => ring.setStrokeStyle(2, tone, 0.75))
  return { container, ring, activity, tone, target: { x: 0, y: 0 }, tween: null }
}

export class LivingWorldScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LivingWorld' })
    this.agentNodes = new Map()
    this.selectedId = null
    this.director = true
    this.spawnPoints = new Map(objects('spawns').map(spawn => [spawn.name, { x: spawn.x, y: spawn.y }]))
  }

  create() {
    const callbacks = this.game.config.callbacks || {}
    this.onSelect = callbacks.onSelect
    this.paintWorld()
    this.setAgents(callbacks.agents || [])
    this.bindCamera()
    callbacks.onSceneReady?.(this)
  }

  paintWorld() {
    this.cameras.main.setBackgroundColor('#050a12')
    this.cameras.main.setBounds(0, 0, WORLD_SIZE.width, WORLD_SIZE.height)
    this.cameras.main.centerOn(WORLD_SIZE.width / 2, WORLD_SIZE.height / 2)
    const background = this.add.graphics()
    background.fillStyle(0x071525, 1).fillRect(0, 0, WORLD_SIZE.width, WORLD_SIZE.height)
    background.fillStyle(0x0b2b45, 1).fillRect(0, 0, WORLD_SIZE.width, 230)
    background.fillStyle(0x11273a, 1).fillRect(0, 230, WORLD_SIZE.width, 40)
    background.fillStyle(0x0e1b2a, 1).fillRect(0, 270, WORLD_SIZE.width, WORLD_SIZE.height - 270)
    drawGrid(background)
    for (let i = 0; i < 26; i += 1) this.add.circle(30 + ((i * 173) % 1210), 30 + ((i * 71) % 150), i % 3 === 0 ? 2 : 1, 0xb9efff, 0.8)

    for (const room of objects('rooms')) drawMappedRoom(this, background, room)

    const hubMap = objects('rooms').find(room => room.type === 'hub')
    const hub = this.add.graphics()
    const hubX = hubMap.x + hubMap.width / 2
    const hubY = hubMap.y + hubMap.height / 2
    hub.fillStyle(0x0c456a, 0.95).fillCircle(hubX, hubY, 122)
    hub.lineStyle(5, 0x38d9ff, 0.95).strokeCircle(hubX, hubY, 122)
    hub.lineStyle(2, 0x8beaff, 0.4).strokeCircle(hubX, hubY, 96)
    hub.lineBetween(hubX - 100, hubY, hubX + 100, hubY)
    hub.lineBetween(hubX, hubY - 100, hubX, hubY + 100)
    this.add.text(hubX, hubY - 30, property(hubMap, 'title'), { color: '#e9fbff', fontFamily: 'monospace', fontSize: '22px', fontStyle: 'bold' }).setOrigin(0.5)
    this.add.text(hubX, hubY + 2, property(hubMap, 'subtitle'), { color: '#8deaff', fontFamily: 'monospace', fontSize: '11px', letterSpacing: 1 }).setOrigin(0.5)
    this.add.text(hubX, hubY + 60, 'ALL AIS WELCOME', { color: '#b7f5ff', fontFamily: 'monospace', fontSize: '10px' }).setOrigin(0.5)

    const collision = this.add.graphics()
    for (const wall of objects('collision')) {
      collision.fillStyle(0x02070d, 0.5).fillRect(wall.x, wall.y, wall.width, wall.height)
      collision.lineStyle(2, 0x6ea4ba, 0.35).strokeRect(wall.x, wall.y, wall.width, wall.height)
    }
    for (const door of objects('doors')) {
      collision.fillStyle(0xffc14f, 0.9).fillRect(door.x, door.y, door.width, door.height)
      collision.lineStyle(1, 0xfff0a8, 0.8).strokeRect(door.x, door.y, door.width, door.height)
    }
    this.add.text(640, 28, 'RANDAPP HOTEL  ·  ONE LIVING WORLD', { color: '#b9f0ff', fontFamily: 'monospace', fontSize: '18px', fontStyle: 'bold' }).setOrigin(0.5)
    this.add.text(640, 54, 'PHASER WORLD RUNTIME', { color: '#54d8ff', fontFamily: 'monospace', fontSize: '10px', letterSpacing: 2 }).setOrigin(0.5)
  }

  bindCamera() {
    const camera = this.cameras.main
    let dragging = false
    let previous = null
    this.input.on('pointerdown', pointer => { if (pointer.button === 0) { dragging = true; previous = { x: pointer.x, y: pointer.y } } })
    this.input.on('pointermove', pointer => {
      if (!dragging || !previous || pointer.isDown === false) return
      camera.scrollX -= (pointer.x - previous.x) / camera.zoom
      camera.scrollY -= (pointer.y - previous.y) / camera.zoom
      previous = { x: pointer.x, y: pointer.y }
    })
    this.input.on('pointerup', () => { dragging = false; previous = null })
    this.input.on('wheel', (_pointer, _over, _dx, dy) => camera.setZoom(Phaser.Math.Clamp(camera.zoom - dy * 0.001, 0.72, 1.35)))
  }

  setAgents(agents) {
    for (const agent of agents) {
      let node = this.agentNodes.get(agent.id)
      if (!node) {
        node = makeAgent(this, agent, this.onSelect)
        this.agentNodes.set(agent.id, node)
      }
      const spawn = this.spawnPoints.get(agent.id) || { x: WORLD_SIZE.width / 2, y: WORLD_SIZE.height / 2 }
      const driftX = ((agent.life?.x || 50) - 50) * 1.6
      const driftY = ((agent.life?.y || 50) - 50) * 0.7
      node.target = { x: spawn.x + driftX, y: spawn.y + driftY }
      node.activity.setText(agent.life?.action || 'Disponibile')
      node.activity.setColor(agent.tone || '#67d9ff')
    }
    this.updateSelection(this.selectedId)
  }

  updateSelection(id) {
    this.selectedId = id
    for (const [agentId, node] of this.agentNodes) {
      const active = agentId === id
      node.ring.setStrokeStyle(active ? 5 : 2, active ? 0xffffff : node.tone, active ? 1 : 0.75)
      node.container.setDepth(active ? 20 : 10)
      node.container.setAlpha(this.director && id && !active ? 0.42 : 1)
    }
  }

  setDirector(enabled) {
    this.director = enabled
    this.updateSelection(this.selectedId)
  }

  update(time) {
    for (const node of this.agentNodes.values()) {
      const distance = Phaser.Math.Distance.Between(node.container.x, node.container.y, node.target.x, node.target.y)
      if (distance > 4 && !node.tween) node.tween = this.tweens.add({ targets: node.container, x: node.target.x, y: node.target.y, duration: 2600, ease: 'Sine.easeInOut', onComplete: () => { node.tween = null } })
      node.container.rotation = Math.sin((time + node.container.y) / 5000) * 0.015
    }
  }
}

export function createLivingWorldGame(parent, callbacks) {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: '100%',
    height: '100%',
    backgroundColor: '#050a12',
    pixelArt: true,
    antialias: false,
    scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
    callbacks,
    scene: LivingWorldScene,
  })
}
