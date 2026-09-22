import Phaser from 'phaser'
import hallMap from './hall-map.json'
import { AGENT_LOOKS, clientLane, problemEmoji, urgencyAura } from './pixel-sprites.js'

export const WORLD_SIZE = { width: hallMap.width * hallMap.tilewidth, height: hallMap.height * hallMap.tileheight }

const layers = new Map(hallMap.layers.map(layer => [layer.name, layer]))
const objects = name => layers.get(name)?.objects || []
const property = (object, name, fallback = '') => object.properties?.find(item => item.name === name)?.value ?? fallback
const roomFor = name => objects('rooms').find(room => room.name === name)
const doorFor = name => objects('doors').find(door => door.name === `${name}-door`)
const center = object => ({ x: object.x + object.width / 2, y: object.y + object.height / 2 })
const hubCenter = () => center(roomFor('hub'))
const doorCenter = door => ({ x: door.x + door.width / 2, y: door.y + door.height / 2 })

function routeFor(start, fromZone, toZone) {
  const targetRoom = roomFor(toZone)
  const target = targetRoom ? center(targetRoom) : hubCenter()
  if (!fromZone || fromZone === toZone) return [target]
  const route = []
  const sourceDoor = doorFor(fromZone)
  const targetDoor = doorFor(toZone)
  if (sourceDoor) route.push(doorCenter(sourceDoor))
  route.push(hubCenter())
  if (targetDoor) route.push(doorCenter(targetDoor))
  route.push(target)
  return route.filter((point, index, points) => index === 0 || point.x !== points[index - 1].x || point.y !== points[index - 1].y)
}

const roomPalette = {
  reception: { fill: 0x1a3f5c, floor: 0xc4a574, line: 0x41d8ff, glow: 0x2ac9ff, rug: 0xb83a3a },
  knowledge: { fill: 0x163e3b, floor: 0x2a6b52, line: 0x64e8ad, glow: 0x45e7a0, rug: 0x1f5a40 },
  radar: { fill: 0x3a1f3a, floor: 0x5a2f4a, line: 0xff6b85, glow: 0xff4e89, rug: 0x7a2040 },
  ops: { fill: 0x1a3548, floor: 0x2a4a5c, line: 0x4fdbe8, glow: 0x38c9d8, rug: 0x1a5060 },
  qa: { fill: 0x3a3a1a, floor: 0x5a5a2a, line: 0xe8d84b, glow: 0xd4c040, rug: 0x6a6a20 },
  design: { fill: 0x3b2443, floor: 0x7a4a78, line: 0xf18bff, glow: 0xe36cff, rug: 0x9a3a88 },
  coffee: { fill: 0x3e291d, floor: 0x8a6a48, line: 0xffba69, glow: 0xffa63d, rug: 0x6a4028 },
}

const toColor = tone => Phaser.Display.Color.HexStringToColor(tone || '#67d9ff').color

function drawCheckerFloor(graphics, x, y, width, height, a, b) {
  const size = 16
  for (let row = 0; row < height; row += size) {
    for (let col = 0; col < width; col += size) {
      const light = ((col / size) + (row / size)) % 2 === 0
      graphics.fillStyle(light ? a : b, 1)
      graphics.fillRect(x + col, y + row, Math.min(size, width - col), Math.min(size, height - row))
    }
  }
}

function drawRoom(scene, graphics, { x, y, width, height, title, subtitle, palette }) {
  graphics.fillStyle(palette.glow, 0.1)
  graphics.fillRoundedRect(x - 6, y - 6, width + 12, height + 12, 14)
  graphics.fillStyle(0x0a1624, 1)
  graphics.fillRoundedRect(x, y, width, height, 10)
  graphics.lineStyle(4, palette.line, 0.95)
  graphics.strokeRoundedRect(x, y, width, height, 10)
  graphics.lineStyle(2, 0xffffff, 0.12)
  graphics.strokeRoundedRect(x + 4, y + 4, width - 8, height - 8, 8)

  // Wall band
  graphics.fillStyle(palette.fill, 1)
  graphics.fillRect(x + 6, y + 6, width - 12, 44)
  // Floor
  drawCheckerFloor(graphics, x + 6, y + 52, width - 12, height - 58, palette.floor, Phaser.Display.Color.IntegerToColor(palette.floor).darken(18).color)
  // Accent rug
  graphics.fillStyle(palette.rug, 0.85)
  graphics.fillRoundedRect(x + width * 0.18, y + height * 0.55, width * 0.64, height * 0.28, 6)
  graphics.lineStyle(2, 0xffd46c, 0.55)
  graphics.strokeRoundedRect(x + width * 0.18, y + height * 0.55, width * 0.64, height * 0.28, 6)

  // Sign plate
  graphics.fillStyle(0x08111c, 0.92)
  graphics.fillRoundedRect(x + 12, y + 12, Math.min(width - 24, 18 + title.length * 9), 28, 4)
  graphics.lineStyle(2, palette.line, 0.9)
  graphics.strokeRoundedRect(x + 12, y + 12, Math.min(width - 24, 18 + title.length * 9), 28, 4)
  scene.add.text(x + 20, y + 16, title, { color: '#f4fbff', fontFamily: 'monospace', fontSize: '12px', fontStyle: 'bold' })
  scene.add.text(x + 20, y + 34, subtitle, { color: '#9ed6ea', fontFamily: 'monospace', fontSize: '8px', letterSpacing: 1 })
}

function drawGrid(graphics) {
  graphics.lineStyle(1, 0x75dfff, 0.05)
  for (let x = 0; x <= WORLD_SIZE.width; x += 32) graphics.lineBetween(x, 270, x, WORLD_SIZE.height)
  for (let y = 270; y <= WORLD_SIZE.height; y += 32) graphics.lineBetween(0, y, WORLD_SIZE.width, y)
}

function drawLamp(graphics, x, y, color = 0xffc14f) {
  graphics.fillStyle(0x07111f, 0.9).fillRoundedRect(x - 8, y, 16, 24, 4)
  graphics.fillStyle(color, 0.18).fillCircle(x, y + 10, 23)
  graphics.fillStyle(color, 0.95).fillCircle(x, y + 10, 5)
  graphics.lineStyle(1, color, 0.75).strokeCircle(x, y + 10, 9)
}

function drawWayfinding(scene, graphics) {
  const signs = [
    { x: 380, label: '← LOUNGE · MIND' },
    { x: 760, label: 'OPS · QA →' },
  ]
  for (const sign of signs) {
    graphics.fillStyle(0x081827, 0.94).fillRoundedRect(sign.x, 108, 170, 30, 8)
    graphics.lineStyle(2, 0xffd46c, 0.85).strokeRoundedRect(sign.x, 108, 170, 30, 8)
    scene.add.text(sign.x + 85, 123, sign.label, { color: '#ffe9a8', fontFamily: 'monospace', fontSize: '10px', fontStyle: 'bold' }).setOrigin(0.5)
  }
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

const decorationStyle = {
  reception: { fill: 0x0d283d, line: 0x62ddff },
  knowledge: { fill: 0x15352e, line: 0x75e8b0 },
  radar: { fill: 0x2c1d45, line: 0xff7892 },
  ops: { fill: 0x1a3548, line: 0x4fdbe8 },
}

function drawDecoration(scene, graphics, object) {
  const { x, y, width, height } = object
  const style = decorationStyle[property(object, 'style', 'ops')] || decorationStyle.ops
  graphics.lineStyle(2, style.line, 0.85)

  if (object.type === 'plant') {
    graphics.fillStyle(0x8b5538, 1).fillRoundedRect(x + 7, y + height - 15, width - 14, 15, 4)
    graphics.fillStyle(0x2d8a4e, 1).fillEllipse(x + width / 2, y + 15, width, height - 12)
    graphics.fillStyle(0x5ed98a, 0.9).fillEllipse(x + 7, y + 10, width / 2, height - 20)
    graphics.fillStyle(0x8be69e, 0.7).fillEllipse(x + width - 8, y + 14, width / 2.5, height - 24)
    return
  }

  if (object.type === 'shelves') {
    graphics.fillStyle(0x1a1008, 0.98).fillRoundedRect(x, y, width, height, 6)
    graphics.lineStyle(2, 0xc4a574, 0.7).strokeRoundedRect(x, y, width, height, 6)
    for (let shelf = 0; shelf < 3; shelf += 1) {
      const shelfY = y + 12 + shelf * 26
      graphics.lineStyle(2, 0xc4a574, 0.8).lineBetween(x + 8, shelfY + 19, x + width - 8, shelfY + 19)
      for (let book = 0; book < 9; book += 1) {
        graphics.fillStyle([0x64e8ad, 0x41d8ff, 0xf18bff, 0xffc14f, 0xff6b85][(book + shelf) % 5], 0.92)
          .fillRect(x + 14 + book * 26, shelfY, 12, 17)
      }
    }
    return
  }

  if (object.type === 'screen') {
    graphics.fillStyle(0x08111c, 1).fillRoundedRect(x, y, width, height, 8)
    graphics.strokeRoundedRect(x, y, width, height, 8)
    graphics.fillStyle(0x0a2a20, 1).fillRoundedRect(x + 10, y + 10, width - 20, height - 24, 4)
    graphics.fillStyle(0x41d8ff, 0.35).fillCircle(x + width / 2, y + height / 2 - 4, 18)
    graphics.lineStyle(2, 0xff6b85, 0.8).strokeCircle(x + width / 2, y + height / 2 - 4, 22)
    graphics.lineStyle(1, 0xff6b85, 0.6).lineBetween(x + width / 2, y + height / 2 - 4, x + width / 2 + 16, y + height / 2 - 16)
    return
  }

  if (object.type === 'terminal') {
    graphics.fillStyle(0x0c1a28, 1).fillRoundedRect(x, y + height - 18, width, 18, 4)
    for (let monitor = 0; monitor < 3; monitor += 1) {
      const monitorX = x + 14 + monitor * ((width - 28) / 3)
      graphics.fillStyle(0x08111c, 1).fillRoundedRect(monitorX, y, 54, height - 20, 4)
      graphics.lineStyle(2, style.line, 0.85).strokeRoundedRect(monitorX, y, 54, height - 20, 4)
      graphics.fillStyle(style.line, 0.7).fillRect(monitorX + 8, y + 12, 38, 3)
      graphics.fillStyle(0x64e8ad, 0.5).fillRect(monitorX + 8, y + 22, 28, 3)
      graphics.fillStyle(0xffc14f, 0.4).fillRect(monitorX + 8, y + 32, 22, 3)
    }
    return
  }

  // desk / table
  graphics.fillStyle(0x3a2818, 1).fillRoundedRect(x, y, width, height, 8)
  graphics.lineStyle(3, 0xc4a574, 0.9).strokeRoundedRect(x, y, width, height, 8)
  graphics.fillStyle(0x5a4030, 1).fillRoundedRect(x + 8, y + 8, width - 16, height - 22, 4)
  graphics.fillStyle(style.line, 0.55).fillRoundedRect(x + 14, y + 12, width - 28, 8, 3)
  for (let seat = 0; seat < Math.max(2, Math.floor(width / 70)); seat += 1) {
    graphics.fillStyle(0x2a4a6a, 1).fillRoundedRect(x + 18 + seat * 66, y + height - 6, 28, 10, 3)
    graphics.fillStyle(0x4a7aaa, 0.9).fillCircle(x + 32 + seat * 66, y + height - 2, 5)
  }
}

function addHat(parts, scene, look, accent) {
  if (look.hat === 'brain') {
    parts.push(scene.add.ellipse(0, -30, 28, 18, 0xff8ad8, 1).setStrokeStyle(2, 0x07111f))
    parts.push(scene.add.ellipse(-6, -32, 8, 6, 0xffb8e8, 0.9))
    parts.push(scene.add.ellipse(6, -28, 7, 5, 0xffb8e8, 0.9))
  } else if (look.hat === 'hood') {
    parts.push(scene.add.triangle(0, -22, 0, -40, -22, -8, 22, -8, accent, 1).setStrokeStyle(2, 0x07111f))
    parts.push(scene.add.rectangle(0, -12, 30, 14, 0x1a3a28).setStrokeStyle(2, 0x07111f))
  } else if (look.hat === 'dish') {
    parts.push(scene.add.ellipse(0, -32, 26, 12, accent, 1).setStrokeStyle(2, 0x07111f))
    parts.push(scene.add.rectangle(0, -24, 4, 10, 0xdde8ef).setStrokeStyle(1, 0x07111f))
    parts.push(scene.add.circle(8, -34, 4, 0xffe08a, 1))
  } else if (look.hat === 'helmet') {
    parts.push(scene.add.rectangle(0, -24, 34, 16, 0x4a2028).setStrokeStyle(2, 0x07111f))
    parts.push(scene.add.rectangle(0, -18, 28, 6, accent, 0.9))
  } else if (look.hat === 'ears') {
    parts.push(scene.add.triangle(-14, -26, -14, -40, -22, -20, -6, -20, accent, 1).setStrokeStyle(2, 0x07111f))
    parts.push(scene.add.triangle(14, -26, 14, -40, 6, -20, 22, -20, accent, 1).setStrokeStyle(2, 0x07111f))
    parts.push(scene.add.rectangle(0, -18, 36, 8, 0x2a1a30).setStrokeStyle(2, accent))
  } else if (look.hat === 'goggles') {
    parts.push(scene.add.circle(-8, -8, 7, 0x7fc8ff, 0.85).setStrokeStyle(2, 0x07111f))
    parts.push(scene.add.circle(8, -8, 7, 0x7fc8ff, 0.85).setStrokeStyle(2, 0x07111f))
    parts.push(scene.add.rectangle(0, -8, 8, 3, 0x07111f))
  } else if (look.hat === 'headset') {
    parts.push(scene.add.rectangle(-18, -6, 6, 14, accent).setStrokeStyle(1, 0x07111f))
    parts.push(scene.add.rectangle(18, -6, 6, 14, accent).setStrokeStyle(1, 0x07111f))
    parts.push(scene.add.rectangle(0, -20, 30, 4, accent).setStrokeStyle(1, 0x07111f))
  } else if (look.hat === 'cap') {
    parts.push(scene.add.rectangle(0, -24, 30, 10, accent).setStrokeStyle(2, 0x07111f))
    parts.push(scene.add.rectangle(8, -20, 18, 5, 0x07111f, 0.85))
  }
}

function addProp(parts, scene, look, accent) {
  if (look.prop === 'laptop') {
    parts.push(scene.add.rectangle(18, 10, 16, 12, 0x1a2a38).setStrokeStyle(2, accent))
    parts.push(scene.add.rectangle(18, 8, 12, 6, 0x41d8ff, 0.7))
  } else if (look.prop === 'tablet') {
    parts.push(scene.add.rectangle(16, 8, 12, 16, 0x2a1a40).setStrokeStyle(2, accent))
  } else if (look.prop === 'core') {
    parts.push(scene.add.circle(0, 8, 8, accent, 1).setStrokeStyle(2, 0xffe08a))
    parts.push(scene.add.circle(0, 8, 4, 0xfff0c0, 0.9))
  } else if (look.prop === 'book') {
    parts.push(scene.add.rectangle(16, 10, 12, 14, 0x1a4a30).setStrokeStyle(2, accent))
    parts.push(scene.add.rectangle(16, 10, 2, 14, 0xffe08a))
  } else if (look.prop === 'shield') {
    parts.push(scene.add.rectangle(-18, 8, 12, 18, 0x4a2028).setStrokeStyle(2, accent))
    parts.push(scene.add.rectangle(-18, 6, 6, 6, 0xffe08a, 0.9))
  } else if (look.prop === 'clipboard') {
    parts.push(scene.add.rectangle(16, 8, 12, 16, 0xf0e8c0).setStrokeStyle(2, 0x07111f))
    parts.push(scene.add.rectangle(16, 2, 8, 3, accent))
  } else if (look.prop === 'wrench') {
    parts.push(scene.add.rectangle(18, 6, 5, 18, 0xb0c0c8).setStrokeStyle(1, 0x07111f).setAngle(25))
    parts.push(scene.add.circle(22, -2, 5, accent, 1).setStrokeStyle(1, 0x07111f))
  } else if (look.prop === 'stylus') {
    parts.push(scene.add.rectangle(16, 8, 12, 14, 0x2a1a30).setStrokeStyle(2, accent))
    parts.push(scene.add.rectangle(22, 0, 3, 12, 0xffe08a).setAngle(20))
  } else if (look.prop === 'scanner') {
    parts.push(scene.add.rectangle(16, 6, 10, 14, 0x3a1018).setStrokeStyle(2, accent))
  } else if (look.prop === 'glass') {
    parts.push(scene.add.circle(16, 6, 7, 0xffffff, 0.15).setStrokeStyle(2, accent))
  }
}

function makeAgent(scene, agent, onSelect) {
  const look = AGENT_LOOKS[agent.id] || AGENT_LOOKS.randai
  const tone = toColor(agent.tone || `#${look.accent.toString(16).padStart(6, '0')}`)
  const accent = look.accent
  const container = scene.add.container(0, 0).setSize(72, 88).setInteractive({ useHandCursor: true })

  const shadow = scene.add.ellipse(0, 30, 42, 12, 0x02070d, 0.55)
  const ring = scene.add.circle(0, 2, 30, accent, 0.12).setStrokeStyle(2, accent, 0.8)
  const body = scene.add.rectangle(0, 8, 28, 30, 0xe8f0f4).setStrokeStyle(3, 0x07111f, 1)
  const torso = scene.add.rectangle(0, 14, 34, 10, accent, 0.85).setStrokeStyle(2, 0x07111f, 1)
  const head = scene.add.rectangle(0, -8, 30, 22, 0xe8f0f4).setStrokeStyle(3, 0x07111f, 1)
  const visor = scene.add.rectangle(0, -8, 22, 10, 0x07111f).setStrokeStyle(2, accent, 1)
  const eyeLeft = scene.add.rectangle(-6, -8, 4, 4, accent)
  const eyeRight = scene.add.rectangle(6, -8, 4, 4, accent)
  const legL = scene.add.rectangle(-7, 28, 8, 8, 0xc8d4dc).setStrokeStyle(2, 0x07111f)
  const legR = scene.add.rectangle(7, 28, 8, 8, 0xc8d4dc).setStrokeStyle(2, 0x07111f)

  const parts = [shadow, ring, body, torso, head, visor, eyeLeft, eyeRight, legL, legR]
  addHat(parts, scene, look, accent)
  addProp(parts, scene, look, accent)

  const label = scene.add.text(0, 44, agent.name, {
    color: '#ffffff',
    backgroundColor: '#07111fee',
    fontFamily: 'monospace',
    fontSize: '10px',
    fontStyle: 'bold',
    padding: { left: 5, right: 5, top: 3, bottom: 3 },
  }).setOrigin(0.5)
  const activity = scene.add.text(0, 62, agent.life?.action || look.motto, {
    color: agent.tone || '#67d9ff',
    fontFamily: 'monospace',
    fontSize: '8px',
    backgroundColor: '#07111fcc',
    padding: { left: 4, right: 4, top: 2, bottom: 2 },
  }).setOrigin(0.5)

  parts.push(label, activity)
  container.add(parts)
  container.on('pointerdown', () => onSelect?.(agent.id))
  container.on('pointerover', () => ring.setStrokeStyle(4, 0xffffff, 1))
  container.on('pointerout', () => ring.setStrokeStyle(2, accent, 0.8))
  return { container, ring, activity, tone: accent, target: { x: 0, y: 0 }, tween: null }
}

function makeClient(scene, issue, index, onSelect) {
  const aura = urgencyAura(issue.urgenza)
  const emoji = problemEmoji(issue)
  const pos = clientLane(issue, index)
  const container = scene.add.container(pos.x, pos.y).setSize(48, 64).setInteractive({ useHandCursor: true })

  const glow = scene.add.circle(0, 8, 26, aura.color, aura.alpha)
  const shadow = scene.add.ellipse(0, 26, 28, 10, 0x02070d, 0.5)
  const body = scene.add.rectangle(0, 10, 18, 22, 0x6f89a7).setStrokeStyle(3, 0x111923)
  const head = scene.add.rectangle(0, -6, 16, 16, 0xe8c6a0).setStrokeStyle(3, 0x111923)
  const leg = scene.add.rectangle(0, 24, 14, 6, 0x1c2530).setStrokeStyle(2, 0x111923)

  const bubble = scene.add.rectangle(0, -30, 28, 22, 0xffffff, 1).setStrokeStyle(2, aura.color)
  const bubbleTip = scene.add.triangle(0, -16, 0, 0, -5, -8, 5, -8, 0xffffff, 1)
  const icon = scene.add.text(0, -32, emoji, { fontSize: '14px' }).setOrigin(0.5)
  const tag = scene.add.text(0, 36, issue.camera || 'Hotel', {
    color: '#f6ead8',
    backgroundColor: '#0b1119dd',
    fontFamily: 'monospace',
    fontSize: '8px',
    padding: { left: 4, right: 4, top: 2, bottom: 2 },
  }).setOrigin(0.5)

  container.add([glow, shadow, body, head, leg, bubbleTip, bubble, icon, tag])
  container.on('pointerdown', () => onSelect?.(issue))
  container.setDepth(8)
  return { container, glow, aura, issueId: issue.id, pulse: aura.pulse }
}

export class LivingWorldScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LivingWorld' })
    this.agentNodes = new Map()
    this.clientNodes = new Map()
    this.selectedId = null
    this.director = true
    this.spawnPoints = new Map(objects('spawns').map(spawn => [spawn.name, { x: spawn.x, y: spawn.y }]))
  }

  create() {
    const callbacks = this.game.config.callbacks || {}
    this.onSelect = callbacks.onSelect
    this.onSelectIssue = callbacks.onSelectIssue
    this.paintWorld()
    this.setAgents(callbacks.agents || [])
    this.setClients(callbacks.issues || [])
    this.bindCamera()
    callbacks.onSceneReady?.(this)
  }

  paintWorld() {
    this.cameras.main.setBackgroundColor('#050a12')
    this.cameras.main.setBounds(0, 0, WORLD_SIZE.width, WORLD_SIZE.height)
    this.cameras.main.centerOn(WORLD_SIZE.width / 2, WORLD_SIZE.height / 2)
    const background = this.add.graphics()

    // Night atrium + warm lobby floor (concept: blue night / gold / wood)
    background.fillStyle(0x071525, 1).fillRect(0, 0, WORLD_SIZE.width, WORLD_SIZE.height)
    background.fillStyle(0x0b2b45, 1).fillRect(0, 0, WORLD_SIZE.width, 230)
    background.fillStyle(0x11273a, 1).fillRect(0, 230, WORLD_SIZE.width, 40)
    drawCheckerFloor(background, 0, 270, WORLD_SIZE.width, WORLD_SIZE.height - 270, 0xb8956a, 0xa67d52)
    drawGrid(background)

    // Central red check-in runner
    background.fillStyle(0x9a2a2a, 0.92).fillRect(560, 500, 160, 220)
    background.lineStyle(3, 0xffd46c, 0.7).strokeRect(560, 500, 160, 220)
    this.add.text(640, 700, 'CHECK IN · SOLVE ON · STAY BETTER', {
      color: '#ffe9a8', fontFamily: 'monospace', fontSize: '9px', fontStyle: 'bold',
    }).setOrigin(0.5)

    for (let x = 48; x < WORLD_SIZE.width; x += 128) drawLamp(background, x, 38, x % 256 === 48 ? 0x41d8ff : 0xffc14f)
    for (let i = 0; i < 26; i += 1) this.add.circle(30 + ((i * 173) % 1210), 30 + ((i * 71) % 150), i % 3 === 0 ? 2 : 1, 0xb9efff, 0.8)

    for (const room of objects('rooms')) drawMappedRoom(this, background, room)
    for (const decoration of objects('decorations')) drawDecoration(this, background, decoration)
    drawWayfinding(this, background)

    const hubMap = objects('rooms').find(room => room.type === 'hub')
    const hub = this.add.graphics()
    const hubX = hubMap.x + hubMap.width / 2
    const hubY = hubMap.y + hubMap.height / 2
    hub.fillStyle(0x2ac9ff, 0.1).fillCircle(hubX, hubY, 148)
    hub.fillStyle(0x0c456a, 0.96).fillCircle(hubX, hubY, 122)
    hub.fillStyle(0x081827, 0.8).fillCircle(hubX, hubY, 84)
    hub.lineStyle(5, 0x38d9ff, 0.95).strokeCircle(hubX, hubY, 122)
    hub.lineStyle(2, 0xffd46c, 0.55).strokeCircle(hubX, hubY, 96)
    hub.lineStyle(2, 0x8beaff, 0.35).lineBetween(hubX - 100, hubY, hubX + 100, hubY)
    hub.lineBetween(hubX, hubY - 100, hubX, hubY + 100)
    // Hologram core
    hub.fillStyle(0x56b7ff, 0.35).fillCircle(hubX, hubY + 8, 28)
    hub.fillStyle(0xe8f4ff, 0.9).fillCircle(hubX, hubY + 2, 14)
    hub.fillStyle(0x56b7ff, 1).fillCircle(hubX - 4, hubY, 3)
    hub.fillStyle(0x56b7ff, 1).fillCircle(hubX + 4, hubY, 3)
    this.add.text(hubX, hubY - 48, property(hubMap, 'title'), { color: '#e9fbff', fontFamily: 'monospace', fontSize: '20px', fontStyle: 'bold' }).setOrigin(0.5)
    this.add.text(hubX, hubY - 26, property(hubMap, 'subtitle'), { color: '#8deaff', fontFamily: 'monospace', fontSize: '10px', letterSpacing: 1 }).setOrigin(0.5)
    this.add.text(hubX, hubY + 58, 'ALL AIS WELCOME', { color: '#b7f5ff', fontFamily: 'monospace', fontSize: '10px' }).setOrigin(0.5)
    this.add.text(hubX, hubY + 76, 'CLICK AN NPC TO FOLLOW', { color: '#6cc6df', fontFamily: 'monospace', fontSize: '9px' }).setOrigin(0.5)

    const collision = this.add.graphics()
    for (const wall of objects('collision')) {
      collision.fillStyle(0x02070d, 0.45).fillRect(wall.x, wall.y, wall.width, wall.height)
      collision.lineStyle(2, 0x6ea4ba, 0.3).strokeRect(wall.x, wall.y, wall.width, wall.height)
    }
    for (const door of objects('doors')) {
      collision.fillStyle(0xffc14f, 0.95).fillRect(door.x, door.y, door.width, door.height)
      collision.lineStyle(1, 0xfff0a8, 0.85).strokeRect(door.x, door.y, door.width, door.height)
    }
    this.add.text(640, 24, 'RANDAILIVE HOTEL', { color: '#ffe9a8', fontFamily: 'monospace', fontSize: '20px', fontStyle: 'bold' }).setOrigin(0.5)
    this.add.text(640, 48, 'PIXEL HALL  ·  CHECK IN, SOLVE ON, STAY BETTER', { color: '#54d8ff', fontFamily: 'monospace', fontSize: '10px', letterSpacing: 2 }).setOrigin(0.5)
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
      const spawn = this.spawnPoints.get(agent.id) || hubCenter()
      const zone = agent.life?.zone || 'hub'
      if (!node.initialized) {
        node.container.setPosition(spawn.x, spawn.y)
        node.initialized = true
      }
      if (node.zone !== zone) {
        const route = routeFor({ x: node.container.x, y: node.container.y }, node.zone, zone)
        if (node.tween) node.tween.stop()
        node.route = route
        node.zone = zone
        node.target = node.route.shift() || spawn
      }
      node.activity.setText(agent.life?.action || 'Disponibile')
      node.activity.setColor(agent.tone || '#67d9ff')
    }
    this.updateSelection(this.selectedId)
  }

  setClients(issues) {
    const alive = new Set()
    for (const [index, issue] of (issues || []).entries()) {
      alive.add(issue.id)
      let node = this.clientNodes.get(issue.id)
      if (!node) {
        node = makeClient(this, issue, index, this.onSelectIssue)
        this.clientNodes.set(issue.id, node)
      } else {
        const pos = clientLane(issue, index)
        node.container.setPosition(pos.x, pos.y)
        const aura = urgencyAura(issue.urgenza)
        node.glow.setFillStyle(aura.color, aura.alpha)
        node.aura = aura
        node.pulse = aura.pulse
      }
    }
    for (const [id, node] of this.clientNodes) {
      if (!alive.has(id)) {
        node.container.destroy(true)
        this.clientNodes.delete(id)
      }
    }
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
      if (distance <= 4 && node.route?.length && !node.tween) {
        node.target = node.route.shift()
      }
      if (distance > 4 && !node.tween) node.tween = this.tweens.add({ targets: node.container, x: node.target.x, y: node.target.y, duration: 1800, ease: 'Sine.easeInOut', onComplete: () => { node.tween = null } })
      node.container.rotation = Math.sin((time + node.container.x) / 5000) * 0.015
    }
    for (const node of this.clientNodes.values()) {
      const scale = 1 + Math.sin(time / (220 - node.pulse * 120)) * node.pulse * 0.12
      node.glow.setScale(scale)
      node.glow.setAlpha(node.aura.alpha * (0.75 + node.pulse * 0.4 * Math.abs(Math.sin(time / 180))))
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
