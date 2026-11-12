import { useState, useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { useColorMode } from '@chakra-ui/react'
import { DogSpinner, DogContainer } from './voxel-dog-loader'
import { loadGLTFModel } from '../libs/model'

function easeOutCirc(x) {
  return Math.sqrt(1 - Math.pow(x - 1, 4))
}

// Lighting presets per color mode: daylight vs cozy reading lamp
const LIGHTS = {
  light: {
    // Golden afternoon: warm sun, soft sky ambient, sunlit dust
    ambient: { color: 0xbcd6de, intensity: 0.55 },
    directional: { color: 0xffe3b8, intensity: 1.2 },
    lamp: { color: 0xffd9b0, intensity: 0.35 },
    lampGlow: 0.05,
    dust: 0.3
  },
  dark: {
    ambient: { color: 0x46626b, intensity: 0.3 },
    directional: { color: 0x7790a0, intensity: 0.25 },
    lamp: { color: 0xfd8b51, intensity: 2 },
    lampGlow: 0.9,
    dust: 0.65
  }
}

// Season from current month: props and effects change through the year
function getSeason(month = new Date().getMonth()) {
  if (month >= 2 && month <= 4) return 'spring'
  if (month >= 5 && month <= 7) return 'summer'
  if (month >= 8 && month <= 10) return 'autumn'
  return 'winter'
}

function currentHour() {
  const now = new Date()
  return now.getHours() + now.getMinutes() / 60
}

// Perrito naps between 23:00 and 06:00 local time
const isSleepTime = (hour) => hour >= 23 || hour < 6

// Light mode follows the real clock: keyframes by hour, interpolated
const NIGHT = {
  ambient: [0x5a7080, 0.35],
  directional: [0x8fa6c0, 0.3],
  lamp: [0xfd8b51, 1.6],
  lampGlow: 0.8,
  dust: 0.55
}
const DAY_KEYS = [
  { h: 0, ...NIGHT },
  { h: 5.5, ...NIGHT },
  {
    h: 7, // dawn: pink sky, low orange sun, lamp still on
    ambient: [0xc9b8c8, 0.45],
    directional: [0xffb38a, 0.7],
    lamp: [0xffd9b0, 0.8],
    lampGlow: 0.4,
    dust: 0.4
  },
  {
    h: 10, // morning: fresh and bright
    ambient: [0xc4dde4, 0.55],
    directional: [0xfff1dc, 1.15],
    lamp: [0xffd9b0, 0.3],
    lampGlow: 0.05,
    dust: 0.3
  },
  {
    h: 14, // noon: neutral white sun
    ambient: [0xd0e4ea, 0.6],
    directional: [0xffffff, 1.3],
    lamp: [0xffd9b0, 0.25],
    lampGlow: 0.03,
    dust: 0.25
  },
  {
    h: 17.5, // golden afternoon
    ambient: [0xbcd6de, 0.55],
    directional: [0xffd0a0, 1.15],
    lamp: [0xffd9b0, 0.35],
    lampGlow: 0.05,
    dust: 0.3
  },
  {
    h: 19.5, // dusk: purple sky, lamp switches on
    ambient: [0x9a8fb0, 0.45],
    directional: [0xff9a6a, 0.6],
    lamp: [0xfd8b51, 1],
    lampGlow: 0.5,
    dust: 0.45
  },
  { h: 21.5, ...NIGHT },
  { h: 24, ...NIGHT }
]

// Daylight tint per season, blended into the sun while it is up
const SEASONAL_SUN = {
  autumn: 0xffc089, // rusty low sun
  winter: 0xe6f0f7 // cold bright sky
}

function mixColor(a, b, t) {
  return new THREE.Color(a).lerp(new THREE.Color(b), t).getHex()
}

function lightModeAt(hour) {
  let i = 0
  while (DAY_KEYS[i + 1].h < hour) i++
  const a = DAY_KEYS[i]
  const b = DAY_KEYS[i + 1]
  const t = (hour - a.h) / (b.h - a.h)
  const mix = (key) => ({
    color: mixColor(a[key][0], b[key][0], t),
    intensity: a[key][1] + (b[key][1] - a[key][1]) * t
  })
  return {
    ambient: mix('ambient'),
    directional: mix('directional'),
    lamp: mix('lamp'),
    lampGlow: a.lampGlow + (b.lampGlow - a.lampGlow) * t,
    dust: a.dust + (b.dust - a.dust) * t
  }
}

// Sun by day, moon by night: both travel an east-to-west arc
function skyLightPosition(hour) {
  const t = ((((hour - 6) % 12) + 12) % 12) / 12
  return new THREE.Vector3(
    Math.cos(Math.PI * t) * 10,
    2 + Math.sin(Math.PI * t) * 9,
    5
  )
}

function getLightTarget({ colorMode, hour, season, asleep }) {
  let target
  if (colorMode === 'light') {
    target = lightModeAt(hour)
    const tint = SEASONAL_SUN[season]
    const daylight = Math.max(0, Math.sin(((hour - 6) / 12) * Math.PI))
    if (tint) {
      target.directional.color = mixColor(
        target.directional.color,
        tint,
        0.5 * daylight
      )
    }
  } else {
    target = { ...LIGHTS.dark }
  }
  if (asleep) {
    // Lamp left on low while Perrito sleeps
    target.lamp = { ...target.lamp, intensity: target.lamp.intensity * 0.45 }
    target.lampGlow *= 0.5
  }
  target.skyPosition = skyLightPosition(hour)
  target.sleep = asleep ? 1 : 0
  target.zColor = colorMode === 'light' ? 0x1d5a66 : 0xf2e5bf
  target.sky = skyAt(hour)
  return target
}

// Real sky seen through the window, by hour (same in light and dark mode)
const SKY_KEYS = [
  { h: 0, top: 0x0b1430, bottom: 0x1e2d52, night: 1 },
  { h: 5.5, top: 0x0b1430, bottom: 0x1e2d52, night: 1 },
  { h: 7, top: 0x6d7fb8, bottom: 0xf4a582, night: 0.2 },
  { h: 10, top: 0x4f9be0, bottom: 0xbfe3f5, night: 0 },
  { h: 15, top: 0x5aa6ea, bottom: 0xcdeaf7, night: 0 },
  { h: 18, top: 0x6f8fc4, bottom: 0xffc27a, night: 0 },
  { h: 19.5, top: 0x3b3f78, bottom: 0xe57a5a, night: 0.4 },
  { h: 21, top: 0x0b1430, bottom: 0x1e2d52, night: 1 },
  { h: 24, top: 0x0b1430, bottom: 0x1e2d52, night: 1 }
]

function skyAt(hour) {
  let i = 0
  while (SKY_KEYS[i + 1].h < hour) i++
  const a = SKY_KEYS[i]
  const b = SKY_KEYS[i + 1]
  const t = (hour - a.h) / (b.h - a.h)
  const night = a.night + (b.night - a.night) * t
  // Sun by day, moon by night, crossing the window left to right
  const isDay = hour >= 6 && hour < 18.5
  const arc = isDay ? (hour - 6) / 12.5 : ((hour - 18.5 + 24) % 24) / 11.5
  const lowSun = isDay && (hour < 8 || hour > 16.5)
  return {
    top: mixColor(a.top, b.top, t),
    bottom: mixColor(a.bottom, b.bottom, t),
    night,
    disc: [0.12 + 0.76 * arc, 0.3 + 0.55 * Math.sin(Math.PI * arc)],
    discColor: isDay ? (lowSun ? 0xffb070 : 0xfff4d6) : 0xe8eef8,
    discSize: isDay ? 0.09 : 0.065
  }
}

const SKY_VERTEX = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const SKY_FRAGMENT = `
  varying vec2 vUv;
  uniform vec3 uTop;
  uniform vec3 uBottom;
  uniform vec3 uDiscColor;
  uniform vec2 uDisc;
  uniform float uDiscSize;
  uniform float uNight;
  uniform float uAspect;
  uniform float uTime;
  uniform float uFall; // 0 nothing, 1 snow, 2 leaves

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    vec2 p = vec2(vUv.x * uAspect, vUv.y);
    vec3 col = mix(uBottom, uTop, smoothstep(0.0, 1.0, vUv.y));

    // Twinkling stars at night
    vec2 cell = floor(p * 16.0);
    float h = hash(cell);
    vec2 f = fract(p * 16.0) - 0.5;
    float star = step(0.9, h) * smoothstep(0.14, 0.0, length(f));
    col += star * uNight * (0.6 + 0.4 * sin(uTime * 0.05 + h * 40.0));

    // Sun or moon with a soft glow
    float d = length(p - vec2(uDisc.x * uAspect, uDisc.y));
    float disc = smoothstep(uDiscSize, uDiscSize * 0.85, d);
    float glow = smoothstep(uDiscSize * 4.0, 0.0, d) * 0.3;
    col = mix(col + uDiscColor * glow, uDiscColor, disc);

    // Mountains with snowy peaks
    float x = p.x;
    float ridge = 0.2 + 0.16 * (1.0 - abs(fract(x * 0.9 + 0.15) * 2.0 - 1.0))
      + 0.03 * sin(x * 11.0);
    vec3 rock = mix(uBottom, vec3(0.08, 0.1, 0.16), 0.55);
    if (vUv.y < ridge) {
      col = rock;
      if (vUv.y > ridge - 0.045 && ridge > 0.3) col = mix(rock, vec3(0.92), 0.75);
    }

    // Snow or leaves drifting down outside
    if (uFall > 0.5) {
      for (int i = 0; i < 3; i++) {
        float layer = float(i);
        float density = 7.0 + layer * 4.0;
        vec2 q = p * density;
        q.y += uTime * (0.012 + layer * 0.006) * density * 0.25;
        q.x += sin(uTime * 0.01 + layer) * 0.6;
        vec2 id = floor(q);
        vec2 local = fract(q) - 0.5;
        float r = hash(id + layer * 13.0);
        if (r > 0.55) {
          local -= vec2(r - 0.75, hash(id.yx) - 0.5) * 0.6;
          if (uFall < 1.5) {
            float flake = smoothstep(0.09 - layer * 0.02, 0.0, length(local));
            col = mix(col, vec3(1.0), flake * 0.9);
          } else {
            float leaf = step(length(local * vec2(1.0, 2.0)), 0.12);
            vec3 leafColor = mix(vec3(0.8, 0.38, 0.25), vec3(0.85, 0.64, 0.25), r);
            col = mix(col, leafColor, leaf);
          }
        }
      }
    }
    gl_FragColor = vec4(col, 1.0);
  }
`

// Window for the left wall (room frame, wall at x = 0): live sky pane,
// cream frame with a cross of muntins and a sill
function buildWindow({ unit, centerZ, bottom, width, height, season }) {
  const group = new THREE.Group()
  const material = new THREE.ShaderMaterial({
    vertexShader: SKY_VERTEX,
    fragmentShader: SKY_FRAGMENT,
    uniforms: {
      uTop: { value: new THREE.Color() },
      uBottom: { value: new THREE.Color() },
      uDiscColor: { value: new THREE.Color() },
      uDisc: { value: new THREE.Vector2(0.5, 0.6) },
      uDiscSize: { value: 0.09 },
      uNight: { value: 0 },
      uAspect: { value: width / height },
      uTime: { value: 0 },
      uFall: { value: season === 'winter' ? 1 : season === 'autumn' ? 2 : 0 }
    }
  })
  const pane = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material)
  pane.rotation.y = Math.PI / 2 // face into the room (+x)
  pane.position.set(unit * 0.006, bottom + height / 2, centerZ)
  group.add(pane)

  const frameMaterial = new THREE.MeshStandardMaterial({ color: 0xece0c8 })
  const bar = unit * 0.035
  const depth = unit * 0.045
  const piece = (h, w, y, z, d = depth) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(d, h, w), frameMaterial)
    mesh.position.set(d / 2, y, z)
    mesh.castShadow = mesh.receiveShadow = true
    group.add(mesh)
  }
  const top = bottom + height
  piece(bar, width + bar * 2, top + bar / 2, centerZ) // head
  piece(bar, width + bar * 2, bottom - bar / 2, centerZ) // bottom rail
  piece(height, bar, bottom + height / 2, centerZ - width / 2 - bar / 2) // side
  piece(height, bar, bottom + height / 2, centerZ + width / 2 + bar / 2) // side
  piece(height, bar * 0.6, bottom + height / 2, centerZ, depth * 0.6) // muntin
  piece(bar * 0.6, width, bottom + height * 0.55, centerZ, depth * 0.6) // muntin
  piece(bar * 0.9, width + bar * 4, bottom - bar * 1.2, centerZ, depth * 2.2) // sill

  return { group, material }
}

// Shared helper: add a box mesh to a group (shadows on)
function addBox(group, w, h, d, color, x, y, z) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color })
  )
  mesh.position.set(x, y, z)
  mesh.castShadow = mesh.receiveShadow = true
  group.add(mesh)
  return mesh
}

// Round knitted rug: stacked stepped discs (cream, rust, cream, orange),
// each a little higher so no faces overlap. Origin at its centre, on the floor
function buildRug(radius, unit) {
  const group = new THREE.Group()
  const rings = [
    [1, 0xe9dcc3],
    [0.8, 0xcb6040],
    [0.62, 0xe9dcc3],
    [0.4, 0xfd8b51],
    [0.18, 0xcb6040]
  ]
  const layer = unit * 0.006
  rings.forEach(([scale, color], level) => {
    const r = radius * scale
    const step = unit * 0.06
    const rows = Math.max(2, Math.round((r * 2) / step))
    for (let i = 0; i < rows; i++) {
      const z = -r + step * (i + 0.5)
      const half = Math.sqrt(Math.max(0, r * r - z * z))
      // Snap row widths to the voxel step for a stitched, pixel look
      const w = Math.max(step, Math.round((half * 2) / step) * step)
      addBox(group, w, layer, step, color, 0, layer * (level + 0.5), z)
    }
  })
  return group
}

// Potted monstera: terracotta pot, soil, stems and big leaves. Returns the
// leaves group so it can sway. Origin at the bottom centre of the pot
function buildPlant(unit) {
  const group = new THREE.Group()
  const u = unit
  addBox(group, u * 0.2, u * 0.18, u * 0.2, 0xb5653f, 0, u * 0.09, 0)
  addBox(group, u * 0.23, u * 0.035, u * 0.23, 0x9c5232, 0, u * 0.18, 0)
  addBox(group, u * 0.17, u * 0.01, u * 0.17, 0x3d2b1f, 0, u * 0.195, 0)
  const leaves = new THREE.Group()
  leaves.position.y = u * 0.2
  group.add(leaves)
  const greens = [0x2f7a4f, 0x3a8c5c, 0x276b44]
  const count = 7
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + 0.3
    const height = u * (0.2 + 0.12 * ((i * 5) % 3))
    const reach = u * (0.08 + 0.03 * (i % 2))
    const stem = new THREE.Group()
    stem.rotation.y = angle
    leaves.add(stem)
    // Stem leaning out, leaf at its tip tilted outwards
    addBox(
      stem,
      u * 0.015,
      height,
      u * 0.015,
      0x2a5e3a,
      reach / 2,
      height / 2,
      0
    )
    const leaf = addBox(
      stem,
      u * 0.17,
      u * 0.018,
      u * 0.12,
      greens[i % greens.length],
      reach + u * 0.07,
      height,
      0
    )
    leaf.rotation.z = -0.35
  }
  return { group, leaves }
}

// Wall shelf with books and a tiny succulent. Built facing +z with its
// back at z = 0; origin at the shelf board's centre
function buildShelf(unit) {
  const group = new THREE.Group()
  const u = unit
  const width = u * 0.42
  const depth = u * 0.1
  addBox(group, width, u * 0.022, depth, 0x7d5238, 0, 0, depth / 2)
  addBox(
    group,
    u * 0.02,
    u * 0.06,
    u * 0.02,
    0x5e3b26,
    -width * 0.38,
    -u * 0.04,
    u * 0.02
  )
  addBox(
    group,
    u * 0.02,
    u * 0.06,
    u * 0.02,
    0x5e3b26,
    width * 0.38,
    -u * 0.04,
    u * 0.02
  )
  const books = [
    [0.032, 0.13, 0x1d5a66],
    [0.026, 0.11, 0xcb6040],
    [0.036, 0.14, 0xe9dcc3],
    [0.022, 0.1, 0xfd8b51],
    [0.03, 0.125, 0x3a8c5c]
  ]
  let x = -width * 0.42
  for (const [w, h, color] of books) {
    addBox(
      group,
      u * w,
      u * h,
      u * 0.075,
      color,
      x + (u * w) / 2,
      u * (0.011 + h / 2),
      depth / 2
    )
    x += u * w + u * 0.004
  }
  // A leaning book and a small potted succulent on the right
  const leaning = addBox(
    group,
    u * 0.026,
    u * 0.12,
    u * 0.075,
    0x6d5a9c,
    x + u * 0.04,
    u * 0.068,
    depth / 2
  )
  leaning.rotation.z = -0.35
  addBox(
    group,
    u * 0.06,
    u * 0.05,
    u * 0.06,
    0xb5653f,
    width * 0.32,
    u * 0.036,
    depth / 2
  )
  addBox(
    group,
    u * 0.07,
    u * 0.04,
    u * 0.07,
    0x3a8c5c,
    width * 0.32,
    u * 0.08,
    depth / 2
  )
  return group
}

// Coffee break poses, found in Blender (archive/assets/perrito.blend) and
// converted to three.js axes. Arm offsets add to the arm's rest position.
const DEG = Math.PI / 180
const ARM_POSES = {
  rest: { pos: [0, 0, 0], rx: 0, ry: 0 },
  reach: { pos: [0.11, -0.15, 0.18], rx: 0, ry: 35 },
  sip: { pos: [-0.2, 0.15, 0.15], rx: -70, ry: -40 }
}
const HEAD_POSES = {
  rest: { rx: 0, ry: 0 },
  reach: { rx: 0, ry: 8 },
  sip: { rx: -12, ry: 10 }
}
// Mug held by its handle: transform relative to the right arm
const MUG_HOLD = new THREE.Matrix4().compose(
  new THREE.Vector3(0.2536, -0.0933, 0.4213),
  new THREE.Quaternion(0.5983, 0.1051, 0.4186, 0.6751),
  new THREE.Vector3(1, 1, 1)
)
// Reach for the mug, lift, sip, put it back (seconds). `hold` blends the
// mug from the armrest (0) into the paw (1)
const DRINK_STEPS = [
  { until: 0.8, from: 'rest', to: 'reach', hold: [0, 0] },
  { until: 1.0, from: 'reach', to: 'reach', hold: [0, 0] },
  { until: 1.9, from: 'reach', to: 'sip', hold: [0, 1] },
  { until: 3.4, from: 'sip', to: 'sip', hold: [1, 1] },
  { until: 4.3, from: 'sip', to: 'reach', hold: [1, 0] },
  { until: 5.0, from: 'reach', to: 'rest', hold: [0, 0] }
]

const smoothstep = (x) => x * x * (3 - 2 * x)

function drinkPose(elapsed) {
  let start = 0
  for (const step of DRINK_STEPS) {
    if (elapsed < step.until) {
      const k = smoothstep((elapsed - start) / (step.until - start))
      const mix = (a, b) => a + (b - a) * k
      const armA = ARM_POSES[step.from]
      const armB = ARM_POSES[step.to]
      const headA = HEAD_POSES[step.from]
      const headB = HEAD_POSES[step.to]
      return {
        pos: armA.pos.map((v, i) => mix(v, armB.pos[i])),
        rx: mix(armA.rx, armB.rx) * DEG,
        ry: mix(armA.ry, armB.ry) * DEG,
        headRx: mix(headA.rx, headB.rx) * DEG,
        headRy: mix(headA.ry, headB.ry) * DEG,
        hold: mix(step.hold[0], step.hold[1]),
        sipping: step.from === 'sip' && step.to === 'sip'
      }
    }
    start = step.until
  }
  return null
}

// Soft round puff for the coffee steam
function buildPuffTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 64
  const ctx = canvas.getContext('2d')
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 64, 64)
  return new THREE.CanvasTexture(canvas)
}

// "Z" texture for the sleep bubbles
function buildZTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 64
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 52px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('Z', 32, 34)
  return new THREE.CanvasTexture(canvas)
}

// Spring: a planter with three voxel tulips (matches the site logo)
function buildTulips() {
  const group = new THREE.Group()
  const potMaterial = new THREE.MeshStandardMaterial({ color: 0xcb6040 })
  const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x257180 })
  const headMaterial = new THREE.MeshStandardMaterial({ color: 0xfd8b51 })
  const tipMaterial = new THREE.MeshStandardMaterial({ color: 0xcb6040 })

  const pot = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.14, 0.24),
    potMaterial
  )
  pot.position.y = 0.07
  group.add(pot)

  const tulips = [
    { x: -0.17, h: 0.5 },
    { x: 0.01, h: 0.66 },
    { x: 0.18, h: 0.55 }
  ]
  for (const { x, h } of tulips) {
    const stem = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, h, 0.05),
      stemMaterial
    )
    stem.position.set(x, 0.14 + h / 2, 0)
    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.16, 0.16),
      headMaterial
    )
    head.position.set(x, 0.14 + h + 0.08, 0)
    const tip = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.06, 0.16),
      tipMaterial
    )
    tip.position.set(x, 0.14 + h + 0.19, 0)
    group.add(stem, head, tip)
  }
  return group
}

// Summer: a slim voxel palm tree
function buildPalm() {
  const group = new THREE.Group()
  const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x7d5238 })
  const frondMaterial = new THREE.MeshStandardMaterial({ color: 0x1f7a55 })
  const coconutMaterial = new THREE.MeshStandardMaterial({ color: 0xcb6040 })

  // Slim straight trunk
  const segments = 6
  for (let i = 0; i < segments; i++) {
    const block = new THREE.Mesh(
      new THREE.BoxGeometry(0.09, 0.13, 0.09),
      trunkMaterial
    )
    block.position.set(i * 0.015, 0.065 + i * 0.12, 0)
    group.add(block)
  }
  const topX = (segments - 1) * 0.015
  const topY = 0.065 + (segments - 1) * 0.12 + 0.06

  // Crown: two rings of short fronds, upper flatter, lower drooping
  const rings = [
    { count: 4, tilt: -0.15, lift: 0.06, reach: 0.1 },
    { count: 4, tilt: -0.55, lift: 0, reach: 0.13, offset: Math.PI / 4 }
  ]
  for (const ring of rings) {
    for (let i = 0; i < ring.count; i++) {
      const frond = new THREE.Mesh(
        new THREE.BoxGeometry(0.28, 0.035, 0.1),
        frondMaterial
      )
      const angle = (i / ring.count) * Math.PI * 2 + (ring.offset || 0)
      frond.position.set(
        topX + Math.cos(angle) * ring.reach,
        topY + ring.lift,
        Math.sin(angle) * ring.reach
      )
      frond.rotation.y = -angle
      frond.rotation.z = ring.tilt
      group.add(frond)
    }
  }

  // Coconuts tucked under the crown
  for (const [cx, cz] of [
    [0.06, 0.04],
    [-0.05, -0.04]
  ]) {
    const coconut = new THREE.Mesh(
      new THREE.BoxGeometry(0.07, 0.07, 0.07),
      coconutMaterial
    )
    coconut.position.set(topX + cx, topY - 0.06, cz)
    group.add(coconut)
  }

  return group
}

// Room corner diorama, built in its own frame: the corner sits at the
// origin, the floor covers [0, size] on x and z, and one wall runs along
// each axis. The caller turns it 45 degrees so the corner points straight
// back and both walls open towards the camera. Sizes scale with `unit`
function buildRoom({ size, wallHeight, unit }) {
  const group = new THREE.Group()
  const box = (w, h, d, color, x, y, z) => {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      new THREE.MeshStandardMaterial({ color })
    )
    mesh.position.set(x, y, z)
    mesh.castShadow = mesh.receiveShadow = true
    group.add(mesh)
    return mesh
  }
  const floorThickness = unit * 0.06
  const wallThickness = unit * 0.05

  // Floor: dark base block with planks laid along x
  const floor = box(
    size,
    floorThickness,
    size,
    0x5e3b26,
    size / 2,
    -floorThickness / 2,
    size / 2
  )
  const plankColors = [0x8a5a3b, 0x7d5238, 0x94633f, 0x82553a]
  const plankDepth = unit * 0.11
  const plankCount = Math.floor(size / plankDepth)
  for (let i = 0; i < plankCount; i++) {
    box(
      size,
      unit * 0.008,
      plankDepth * 0.94,
      plankColors[i % plankColors.length],
      size / 2,
      unit * 0.004,
      plankDepth * (i + 0.5)
    )
  }

  // Walls: latte upper, teal wainscot, rust rail, dark baseboard, top trim
  const bottom = -floorThickness
  const total = wallHeight + floorThickness
  const wainscot = unit * 0.3
  const layers = [
    [total, 0x9e8670, bottom + total / 2, 0],
    [wainscot, 0x1d5a66, wainscot / 2, 0.004],
    [unit * 0.025, 0xcb6040, wainscot, 0.008],
    [unit * 0.04, 0x2a2420, unit * 0.02, 0.008],
    [unit * 0.03, 0x7a6552, wallHeight, 0.008]
  ]
  for (const [h, color, y, inset] of layers) {
    const proud = unit * inset
    const t = wallThickness + proud * 2
    // The wall along x covers the corner; the wall along z starts right
    // where it ends, so no two faces ever overlap (overlaps flicker)
    // Raised layers also overshoot the open end by `proud`, so their end
    // faces never share a plane with the wall behind them
    const xLength = size + wallThickness + proud * 2
    box(
      xLength,
      h,
      t,
      color,
      xLength / 2 - wallThickness - proud,
      y,
      -wallThickness / 2
    )
    const zLength = size
    box(t, h, zLength, color, -wallThickness / 2, y, proud + zLength / 2)
  }

  // Fairy lights: a sagging string of warm bulbs under each wall's trim
  const bulbs = []
  const wireMaterial = new THREE.LineBasicMaterial({ color: 0x2a2420 })
  const bulbColors = [0xffd27a, 0xffb36b, 0xfff1c9, 0xff9f80]
  const bulbGeometry = new THREE.BoxGeometry(
    unit * 0.026,
    unit * 0.034,
    unit * 0.026
  )
  const span = unit * 0.38 // distance between hooks
  const spacing = unit * 0.095 // distance between bulbs
  const hang = wallHeight - unit * 0.07
  const away = unit * 0.035 // in front of the wall face
  const addString = (alongX) => {
    const points = []
    for (let d = unit * 0.06; d <= size - unit * 0.02; d += spacing) {
      const sag = Math.sin(Math.PI * ((d % span) / span)) * unit * 0.06
      const y = hang - sag
      const position = alongX
        ? new THREE.Vector3(d, y, away)
        : new THREE.Vector3(away, y, d)
      points.push(position)
      const color = bulbColors[bulbs.length % bulbColors.length]
      const material = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.5
      })
      const bulb = new THREE.Mesh(bulbGeometry, material)
      bulb.position.copy(position).y -= unit * 0.02
      group.add(bulb)
      bulbs.push({ material, phase: Math.random() * Math.PI * 2 })
    }
    group.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(points),
        wireMaterial
      )
    )
  }
  addString(true)
  addString(false)

  return { group, floor, bulbs }
}

// Voxel-style floor lamp built from boxes, unit height (scaled to the dog)
function buildLamp() {
  const group = new THREE.Group()
  const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x1d5a66 })
  const shadeMaterial = new THREE.MeshStandardMaterial({
    color: 0xf2e5bf,
    emissive: 0xfd8b51,
    emissiveIntensity: 0
  })

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, 0.05, 0.24),
    frameMaterial
  )
  base.position.y = 0.025

  const pole = new THREE.Mesh(
    new THREE.BoxGeometry(0.05, 0.7, 0.05),
    frameMaterial
  )
  pole.position.y = 0.4

  const shadeBottom = new THREE.Mesh(
    new THREE.BoxGeometry(0.32, 0.12, 0.32),
    shadeMaterial
  )
  shadeBottom.position.y = 0.81

  const shadeTop = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, 0.12, 0.24),
    shadeMaterial
  )
  shadeTop.position.y = 0.93

  // Base and pole cast shadows; the shade must not, since the lamp's light
  // sits inside it and would otherwise be blocked completely
  for (const mesh of [base, pole]) mesh.castShadow = mesh.receiveShadow = true
  group.add(base, pole, shadeBottom, shadeTop)
  return { group, shadeMaterial }
}

const VoxelDog = () => {
  const refContainer = useRef()
  const [loading, setLoading] = useState(true)
  const refRenderer = useRef()
  const refLights = useRef(null)
  const refLightTarget = useRef(LIGHTS.dark)
  const { colorMode } = useColorMode()
  const urlDogGLB = '/perrito.glb'

  // Re-evaluate lighting on theme change and every minute for the clock
  useEffect(() => {
    const refresh = () => {
      const hour = currentHour()
      refLightTarget.current = getLightTarget({
        colorMode,
        hour,
        season: getSeason(),
        asleep: isSleepTime(hour)
      })
    }
    refresh()
    const id = setInterval(refresh, 60 * 1000)
    return () => clearInterval(id)
  }, [colorMode])

  const handleWindowResize = useCallback(() => {
    const { current: renderer } = refRenderer
    const { current: container } = refContainer
    if (container && renderer) {
      const scW = container.clientWidth
      const scH = container.clientHeight

      renderer.setSize(scW, scH)
    }
  }, [])

  useEffect(() => {
    const { current: container } = refContainer
    if (container) {
      const scW = container.clientWidth
      const scH = container.clientHeight

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
      })
      renderer.setPixelRatio(window.devicePixelRatio)
      renderer.setSize(scW, scH)
      renderer.outputEncoding = THREE.sRGBEncoding
      // Soft shadows from the sun/moon and the reading lamp
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      container.appendChild(renderer.domElement)
      refRenderer.current = renderer

      const scene = new THREE.Scene()

      const target = new THREE.Vector3(-0.5, 1.2, 0)
      const initialCameraPosition = new THREE.Vector3(0, 10, 20)

      const scale = scH * 0.005 + 4.8
      const camera = new THREE.OrthographicCamera(
        -scale,
        scale,
        scale,
        -scale,
        // Tight near/far keeps depth precision high (no flickering faces)
        1,
        60
      )
      camera.position.copy(initialCameraPosition)
      camera.lookAt(target)

      const initial = refLightTarget.current

      const ambientLight = new THREE.AmbientLight(
        initial.ambient.color,
        initial.ambient.intensity
      )
      scene.add(ambientLight)

      const directionalLight = new THREE.DirectionalLight(
        initial.directional.color,
        initial.directional.intensity
      )
      directionalLight.position.copy(
        initial.skyPosition || new THREE.Vector3(5, 10, 5)
      )
      directionalLight.castShadow = true
      directionalLight.shadow.mapSize.set(1024, 1024)
      directionalLight.shadow.bias = -0.0005
      directionalLight.shadow.normalBias = 0.03
      scene.add(directionalLight, directionalLight.target)

      // Light source sits inside the floor lamp's shade (placed after load)
      const lampLight = new THREE.PointLight(
        initial.lamp.color,
        initial.lamp.intensity
      )
      lampLight.position.set(0, 4, 2)
      lampLight.castShadow = true
      lampLight.shadow.mapSize.set(512, 512)
      lampLight.shadow.bias = -0.002
      lampLight.shadow.normalBias = 0.03
      scene.add(lampLight)

      refLights.current = {
        ambient: ambientLight,
        directional: directionalLight,
        lamp: lampLight
      }

      let lampShadeMaterial = null
      let fairyBulbs = []
      let skyMaterial = null
      let plantLeaves = null
      let dustGeometry = null
      let dustMaterial = null
      let dustData = null
      let dustMinY = 0
      let dustMaxY = 0
      let zSprites = []
      let zMaterial = null
      let zOrigin = null
      let zScale = 1
      let headPart = null
      let lidPart = null
      let screenLight = null
      let armR = null
      let armL = null
      let mugPart = null
      let eyelids = null
      const armRRest = new THREE.Vector3()
      const mugRestPos = new THREE.Vector3()
      const mugRestQuat = new THREE.Quaternion()
      const mugHeld = new THREE.Matrix4()
      const mugHeldPos = new THREE.Vector3()
      const mugHeldQuat = new THREE.Quaternion()
      const mugHeldScale = new THREE.Vector3()
      const steamSprites = []
      const steamTop = new THREE.Vector3()
      // First coffee soon after load, so visitors get to see it
      let nextDrinkAt = performance.now() + 7000 + Math.random() * 5000
      let drinkStart = null
      let nextBlinkAt = performance.now() + 2000
      let blinkStart = null
      let sleepLevel = initial.sleep || 0
      const SEASON = getSeason()

      const controls = new OrbitControls(camera, renderer.domElement)
      controls.target = target

      // Camera sways gently around a hero angle facing Perrito instead of
      // spinning 360 (which hid his face half the time). Dragging still
      // works; after letting go the view drifts back to the sway.
      const reduceMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches
      const offset = new THREE.Vector3().subVectors(
        initialCameraPosition,
        new THREE.Vector3(0, 0, 0)
      )
      const heroSpherical = new THREE.Spherical().setFromVector3(offset)
      const swaySpherical = new THREE.Spherical()
      let dragging = false
      let releasedAt = -Infinity
      controls.addEventListener('start', () => {
        dragging = true
      })
      controls.addEventListener('end', () => {
        dragging = false
        releasedAt = performance.now()
      })

      const updateSway = (now) => {
        if (dragging || now - releasedAt < 2500) return
        offset.subVectors(camera.position, target)
        swaySpherical.setFromVector3(offset)
        const sway = reduceMotion
          ? 0
          : Math.sin((now / 12000) * Math.PI * 2) * THREE.MathUtils.degToRad(10)
        // Ease back towards the hero angle plus the current sway offset
        // Shortest way round, so a big drag never swings back the long way
        const delta =
          THREE.MathUtils.euclideanModulo(
            heroSpherical.theta + sway - swaySpherical.theta + Math.PI,
            Math.PI * 2
          ) - Math.PI
        swaySpherical.theta += delta * 0.03
        swaySpherical.phi += (heroSpherical.phi - swaySpherical.phi) * 0.03
        swaySpherical.radius = heroSpherical.radius
        offset.setFromSpherical(swaySpherical)
        camera.position.copy(target).add(offset)
        camera.lookAt(target)
      }

      loadGLTFModel(scene, urlDogGLB, {
        receiveShadow: true,
        castShadow: true
      }).then((model) => {
        // Bounding box of the chair/dog only: the GLB also contains a flat
        // ground/shadow plane that would otherwise blow up the box
        const fullBox = new THREE.Box3().setFromObject(model)
        const fullHeight = fullBox.max.y - fullBox.min.y
        const box = new THREE.Box3()
        const childBox = new THREE.Box3()
        model.updateWorldMatrix(true, true)
        model.traverse((child) => {
          if (!child.isMesh) return
          childBox.setFromObject(child)
          if (childBox.max.y - childBox.min.y < fullHeight * 0.01) {
            // Hide the baked ground/shadow plane: the rug replaces it and
            // they z-fight at the same height
            child.visible = false
            return
          }
          box.union(childBox)
        })
        if (box.isEmpty()) box.copy(fullBox)
        const size = box.getSize(new THREE.Vector3())
        const { group: lamp, shadeMaterial } = buildLamp()
        lampShadeMaterial = shadeMaterial
        const lampHeight = size.y * 1.05
        lamp.scale.setScalar(lampHeight)
        lamp.position.set(
          box.max.x + size.x * 0.2,
          box.min.y,
          (box.min.z + box.max.z) / 2
        )
        scene.add(lamp)
        lampLight.position.set(
          lamp.position.x,
          box.min.y + lampHeight * 0.85,
          lamp.position.z
        )

        // Room corner turned 45 degrees: corner straight behind the
        // furniture, walls opening towards the camera. Size it so the chair,
        // lamp and the seasonal prop spot all fit with a margin.
        const rugCenterZ = (box.min.z + box.max.z) / 2
        const lampReach = lampHeight * 0.17
        const footprint = [
          [box.min.x, box.min.z],
          [box.max.x, box.min.z],
          [box.min.x, box.max.z],
          [box.max.x, box.max.z],
          [lamp.position.x - lampReach, lamp.position.z - lampReach],
          [lamp.position.x + lampReach, lamp.position.z - lampReach],
          [lamp.position.x + lampReach, lamp.position.z + lampReach],
          [box.min.x - size.x * 0.45, rugCenterZ]
        ]
        const roomCenterX =
          (Math.min(...footprint.map((p) => p[0])) +
            Math.max(...footprint.map((p) => p[0]))) /
          2
        const margin = size.y * 0.12
        // Inside the corner means z - cornerZ >= |x - roomCenterX|
        const cornerZ =
          Math.min(
            ...footprint.map(([x, z]) => z - Math.abs(x - roomCenterX))
          ) - margin
        // Distance along each wall direction, to size the square floor
        const roomSize =
          Math.max(
            ...footprint.map(([x, z]) => {
              const dx = x - roomCenterX
              const dz = z - cornerZ
              return Math.max((dx + dz) / Math.SQRT2, (dz - dx) / Math.SQRT2)
            })
          ) +
          margin * 2
        const room = buildRoom({
          size: roomSize,
          wallHeight: size.y * 0.75,
          unit: size.y
        })
        room.group.position.set(roomCenterX, box.min.y, cornerZ)
        // Local x runs front-right, local z front-left
        room.group.rotation.y = -Math.PI / 4
        fairyBulbs = room.bulbs
        const roomWindow = buildWindow({
          unit: size.y,
          centerZ: roomSize * 0.6,
          bottom: size.y * 0.36,
          width: size.y * 0.6,
          height: size.y * 0.31,
          season: SEASON
        })
        room.group.add(roomWindow.group)
        skyMaterial = roomWindow.material

        // Knitted rug under the chair's front and Perrito's feet
        const rug = buildRug(size.x * 0.55, size.y)
        rug.position.set(
          (box.min.x + box.max.x) / 2,
          box.min.y + size.y * 0.008,
          box.max.z - size.z * 0.15
        )
        scene.add(rug)

        // Monstera in the open front-left corner, against the left wall
        const plant = buildPlant(size.y)
        plant.group.position.set(size.y * 0.17, 0, roomSize * 0.86)
        room.group.add(plant.group)
        plantLeaves = plant.leaves

        // Wall shelf on the front part of the right wall
        const shelf = buildShelf(size.y)
        shelf.position.set(roomSize * 0.8, size.y * 0.5, size.y * 0.01)
        room.group.add(shelf)
        scene.add(room.group)

        // Sun/moon shadows cover the whole room; lamp shadows reach the walls
        const shadowCam = directionalLight.shadow.camera
        shadowCam.left = shadowCam.bottom = -roomSize
        shadowCam.right = shadowCam.top = roomSize
        shadowCam.near = 0.5
        shadowCam.far = 60
        shadowCam.updateProjectionMatrix()
        directionalLight.target.position.set(
          roomCenterX,
          box.min.y,
          cornerZ + roomSize / 2
        )
        lampLight.shadow.camera.near = 0.05
        lampLight.shadow.camera.far = size.y * 3
        lampLight.shadow.camera.updateProjectionMatrix()

        // Seasonal prop on the dog's free side (lamp is on the right)
        const propScale = size.y * 0.5
        const propX = box.min.x - size.x * 0.12
        const propZ = rugCenterZ + size.z * 0.25
        if (SEASON === 'spring') {
          const tulips = buildTulips()
          tulips.scale.setScalar(propScale)
          tulips.position.set(propX, box.min.y, propZ)
          scene.add(tulips)
        } else if (SEASON === 'summer') {
          const palm = buildPalm()
          palm.scale.setScalar(size.y * 1.15)
          palm.position.set(box.min.x - size.x * 0.3, box.min.y, rugCenterZ)
          scene.add(palm)
        }

        // Winter: a little snow cap settled on the lamp shade
        if (SEASON === 'winter') {
          const cap = new THREE.Mesh(
            new THREE.BoxGeometry(0.26, 0.035, 0.26),
            new THREE.MeshStandardMaterial({ color: 0xffffff })
          )
          cap.position.y = 0.99 + 0.0175
          lamp.add(cap)
        }

        // Movable parts split out in Blender: pivots at neck and hinge
        headPart = model.getObjectByName('head')
        lidPart = model.getObjectByName('laptop_lid')
        armR = model.getObjectByName('arm_R')
        armL = model.getObjectByName('arm_L')
        mugPart = model.getObjectByName('mug')
        eyelids = model.getObjectByName('eyelids')
        // Blender XYZ euler maps to three.js YXZ once the axes are swapped
        for (const part of [headPart, armR, armL]) {
          if (part) part.rotation.order = 'YXZ'
        }
        if (armR) armRRest.copy(armR.position)
        if (mugPart) {
          mugRestPos.copy(mugPart.position)
          mugRestQuat.copy(mugPart.quaternion)
          const puffMaterial = new THREE.SpriteMaterial({
            map: buildPuffTexture(),
            transparent: true,
            depthWrite: false,
            opacity: 0
          })
          for (let i = 0; i < 4; i++) {
            const puff = new THREE.Sprite(puffMaterial.clone())
            scene.add(puff)
            steamSprites.push(puff)
          }
        }

        // Laptop screen light on Perrito's face, between lid and head
        if (lidPart) {
          screenLight = new THREE.PointLight(0x9fc8ff, 0, size.y * 0.45)
          screenLight.position
            .copy(lidPart.position)
            .add(new THREE.Vector3(0, size.y * 0.09, -size.y * 0.08))
          scene.add(screenLight)
        }

        // Sleep "Z"s rising from the top of Perrito's head
        zOrigin = headPart
          ? headPart.position
              .clone()
              .add(
                new THREE.Vector3(size.x * 0.1, size.y * 0.38, size.z * 0.05)
              )
          : new THREE.Vector3(
              box.min.x + size.x * 0.6,
              box.max.y - size.y * 0.05,
              box.min.z + size.z * 0.5
            )
        zScale = size.y
        zMaterial = new THREE.SpriteMaterial({
          map: buildZTexture(),
          color: initial.zColor,
          transparent: true,
          depthWrite: false,
          depthTest: false
        })
        for (let i = 0; i < 3; i++) {
          // Each sprite gets its own material clone for individual fading
          const sprite = new THREE.Sprite(zMaterial.clone())
          sprite.visible = false
          scene.add(sprite)
          zSprites.push(sprite)
        }

        // Dust motes drifting in the lamp light
        const dustCount = 40
        dustMinY = box.min.y
        dustMaxY = box.min.y + lampHeight * 0.8
        const positions = new Float32Array(dustCount * 3)
        dustData = []
        for (let i = 0; i < dustCount; i++) {
          const radius = Math.random() * lampHeight * 0.35
          const angle = Math.random() * Math.PI * 2
          const x = lamp.position.x + Math.cos(angle) * radius
          const z = lamp.position.z + Math.sin(angle) * radius
          positions[i * 3] = x
          positions[i * 3 + 1] = dustMinY + Math.random() * lampHeight * 0.8
          positions[i * 3 + 2] = z
          dustData.push({
            baseX: x,
            baseZ: z,
            speed: lampHeight * (0.0006 + Math.random() * 0.0012),
            phase: Math.random() * Math.PI * 2,
            wobble: lampHeight * 0.02 * Math.random()
          })
        }
        dustGeometry = new THREE.BufferGeometry()
        dustGeometry.setAttribute(
          'position',
          new THREE.BufferAttribute(positions, 3)
        )
        dustMaterial = new THREE.PointsMaterial({
          color: 0xffd9a0,
          size: lampHeight * 0.022,
          transparent: true,
          opacity: 0,
          depthWrite: false
        })
        scene.add(new THREE.Points(dustGeometry, dustMaterial))

        // Pivot the camera on the middle of everything solid in the scene
        // (dog, lamp, rug), so the view stays centred while it moves
        new THREE.Box3()
          .setFromObject(model)
          .union(new THREE.Box3().setFromObject(lamp))
          .getCenter(target)

        // Fit the whole diorama on screen as seen from the hero angle:
        // project every room vertex plus the furniture, then re-centre the
        // view on that outline and zoom so it fills the canvas
        const fitCamera = camera.clone()
        fitCamera.zoom = 1
        fitCamera.updateProjectionMatrix()
        fitCamera.position.copy(target).add(initialCameraPosition)
        fitCamera.lookAt(target)
        fitCamera.updateMatrixWorld()
        const outline = new THREE.Box2()
        const point = new THREE.Vector3()
        const addPoint = () => {
          point.project(fitCamera)
          outline.expandByPoint(new THREE.Vector2(point.x, point.y))
        }
        room.group.updateMatrixWorld(true)
        room.group.traverse((mesh) => {
          if (!mesh.isMesh) return
          const positions = mesh.geometry.attributes.position
          for (let i = 0; i < positions.count; i++) {
            point
              .fromBufferAttribute(positions, i)
              .applyMatrix4(mesh.matrixWorld)
            addPoint()
          }
        })
        const furniture = new THREE.Box3()
          .setFromObject(model)
          .union(new THREE.Box3().setFromObject(lamp))
        for (let i = 0; i < 8; i++) {
          point.set(
            i & 1 ? furniture.max.x : furniture.min.x,
            i & 2 ? furniture.max.y : furniture.min.y,
            i & 4 ? furniture.max.z : furniture.min.z
          )
          addPoint()
        }
        const outlineCenter = outline.getCenter(new THREE.Vector2())
        const outlineHalf = outline
          .getSize(new THREE.Vector2())
          .multiplyScalar(0.5)
        target
          .addScaledVector(
            new THREE.Vector3().setFromMatrixColumn(fitCamera.matrixWorld, 0),
            outlineCenter.x * scale
          )
          .addScaledVector(
            new THREE.Vector3().setFromMatrixColumn(fitCamera.matrixWorld, 1),
            outlineCenter.y * scale
          )
        // Small margin so the gentle sway never clips the room's edges
        camera.zoom = THREE.MathUtils.clamp(
          0.9 / Math.max(outlineHalf.x, outlineHalf.y),
          0.5,
          1.4
        )
        camera.updateProjectionMatrix()

        animate()
        setLoading(false)
      })

      const updateLights = () => {
        const lights = refLights.current
        const targetValues = refLightTarget.current
        for (const key of Object.keys(lights)) {
          const light = lights[key]
          light.color.lerp(new THREE.Color(targetValues[key].color), 0.08)
          light.intensity +=
            (targetValues[key].intensity - light.intensity) * 0.08
        }
        if (lampShadeMaterial) {
          lampShadeMaterial.emissiveIntensity +=
            (targetValues.lampGlow - lampShadeMaterial.emissiveIntensity) * 0.08
        }
        if (dustMaterial) {
          dustMaterial.opacity +=
            (targetValues.dust - dustMaterial.opacity) * 0.08
        }
        if (targetValues.skyPosition) {
          lights.directional.position.lerp(targetValues.skyPosition, 0.05)
        }
        sleepLevel += ((targetValues.sleep || 0) - sleepLevel) * 0.03
        if (targetValues.zColor !== undefined) {
          const zColor = new THREE.Color(targetValues.zColor)
          for (const sprite of zSprites)
            sprite.material.color.lerp(zColor, 0.08)
        }
      }

      // Z bubbles: rise, drift right, grow and fade, staggered by a third
      const updateSleep = (time) => {
        if (!zOrigin) return
        // Ease so the lid starts and ends its swing gently
        const eased = sleepLevel * sleepLevel * (3 - 2 * sleepLevel)
        if (lidPart) lidPart.rotation.x = (-Math.PI / 2) * eased
        if (screenLight) {
          // Screen lights the face in the dark, switches off with the lid
          const glow = 0.25 + (refLightTarget.current.lampGlow || 0) * 1.2
          screenLight.intensity = glow * (1 - eased)
        }
        for (let i = 0; i < zSprites.length; i++) {
          const sprite = zSprites[i]
          const t = (time * 0.004 + i / zSprites.length) % 1
          sprite.visible = sleepLevel > 0.01
          if (!sprite.visible) continue
          sprite.position.set(
            zOrigin.x + t * zScale * 0.35 + Math.sin(t * 6 + i) * zScale * 0.03,
            zOrigin.y + t * zScale * 0.55,
            zOrigin.z
          )
          sprite.scale.setScalar(zScale * (0.18 + t * 0.24))
          sprite.material.rotation = Math.sin(t * 4 + i) * 0.25
          sprite.material.opacity = Math.sin(Math.PI * t) * sleepLevel
        }
      }

      // Perrito himself: typing, coffee breaks, blinking, sleeping pose
      const updateDog = (now, time) => {
        const eased = smoothstep(sleepLevel)
        const awake = 1 - eased

        // A coffee break every 20-40 s while awake
        if (drinkStart === null && awake > 0.95 && now >= nextDrinkAt) {
          drinkStart = now
        }
        let drink = null
        if (drinkStart !== null) {
          drink = drinkPose((now - drinkStart) / 1000)
          if (!drink) {
            drinkStart = null
            nextDrinkAt = now + 20000 + Math.random() * 20000
          }
        }

        // Typing: bursts of quick, uneven taps (paws lift = negative x).
        // Asleep: arms droop a little onto the closed laptop
        const tap = (phase) =>
          Math.max(
            0,
            Math.sin(time * 0.45 + phase) * Math.sin(time * 0.13 + phase * 2)
          ) ** 2
        const droop = 0.08 * eased
        if (armL) armL.rotation.x = -tap(0) * 0.2 * awake + droop
        if (armR) {
          if (drink) {
            armR.position.set(
              armRRest.x + drink.pos[0],
              armRRest.y + drink.pos[1],
              armRRest.z + drink.pos[2]
            )
            armR.rotation.set(drink.rx, drink.ry, 0)
          } else {
            armR.position.copy(armRRest)
            armR.rotation.set(-tap(1.7) * 0.2 * awake + droop, 0, 0)
          }
        }

        // Mug follows the paw while held, otherwise rests on the armrest
        if (mugPart) {
          const hold = drink ? drink.hold : 0
          if (hold > 0 && armR) {
            armR.updateMatrixWorld()
            mugHeld.multiplyMatrices(armR.matrixWorld, MUG_HOLD)
            mugHeld.decompose(mugHeldPos, mugHeldQuat, mugHeldScale)
            mugPart.position.lerpVectors(mugRestPos, mugHeldPos, hold)
            mugPart.quaternion.slerpQuaternions(mugRestQuat, mugHeldQuat, hold)
          } else {
            mugPart.position.copy(mugRestPos)
            mugPart.quaternion.copy(mugRestQuat)
          }
          // Steam: soft puffs rising from the hot coffee while awake
          mugPart.updateMatrixWorld()
          steamTop.set(0, 0.45, 0).applyMatrix4(mugPart.matrixWorld)
          for (let i = 0; i < steamSprites.length; i++) {
            const puff = steamSprites[i]
            const t = (time * 0.006 + i / steamSprites.length) % 1
            puff.position.set(
              steamTop.x + Math.sin(t * 5 + i * 2) * zScale * 0.02,
              steamTop.y + t * zScale * 0.12,
              steamTop.z
            )
            puff.scale.setScalar(zScale * (0.03 + t * 0.04))
            puff.material.opacity = Math.sin(Math.PI * t) * 0.4 * awake
          }
        }

        // Head: reading bob by day, deep nod with a sideways slump asleep,
        // and the coffee pose overrides while drinking
        if (headPart) {
          const awakeBob = Math.sin(time * 0.02) * 0.02
          const asleepNod = 0.3 + Math.sin(time * 0.018) * 0.05
          let rx = awakeBob * awake + asleepNod * eased
          let ry = 0
          if (drink) {
            rx += drink.headRx
            if (drink.sipping) rx += Math.sin(time * 0.3) * 0.03
            ry = drink.headRy
          }
          headPart.rotation.set(rx, ry, 0.12 * eased)
        }

        // Eyelids: closed asleep and mid-sip, quick blink every few seconds
        if (eyelids) {
          if (blinkStart === null && now >= nextBlinkAt) blinkStart = now
          let blink = 0
          if (blinkStart !== null) {
            const b = (now - blinkStart) / 180
            if (b >= 1) {
              blinkStart = null
              nextBlinkAt = now + 2500 + Math.random() * 3500
            } else {
              blink = Math.sin(Math.PI * b)
            }
          }
          const closed = Math.max(eased, blink, drink && drink.sipping ? 1 : 0)
          eyelids.visible = closed > 0.02
          eyelids.scale.y = Math.max(closed, 0.001)
        }
      }

      // Fairy lights twinkle softly, brighter as the room gets darker
      // Window sky follows the real clock
      const updateSky = (time) => {
        if (!skyMaterial) return
        const sky = refLightTarget.current.sky
        const u = skyMaterial.uniforms
        u.uTime.value = time
        if (!sky) return
        u.uTop.value.setHex(sky.top)
        u.uBottom.value.setHex(sky.bottom)
        u.uDiscColor.value.setHex(sky.discColor)
        u.uDisc.value.set(sky.disc[0], sky.disc[1])
        u.uDiscSize.value = sky.discSize
        u.uNight.value = sky.night
      }

      // Monstera leaves sway very gently
      const updatePlant = (time) => {
        if (!plantLeaves) return
        plantLeaves.rotation.z = Math.sin(time * 0.012) * 0.03
        plantLeaves.rotation.x = Math.sin(time * 0.009 + 1) * 0.02
      }

      const updateFairyLights = (time) => {
        const night = refLightTarget.current.lampGlow || 0
        const level = 0.2 + night * 0.75
        for (const bulb of fairyBulbs) {
          bulb.material.emissiveIntensity =
            level * (0.7 + 0.3 * Math.sin(time * 0.035 + bulb.phase))
        }
      }

      const updateDust = (time) => {
        if (!dustGeometry) return
        const positionAttr = dustGeometry.attributes.position
        for (let i = 0; i < dustData.length; i++) {
          const mote = dustData[i]
          let y = positionAttr.getY(i) + mote.speed
          if (y > dustMaxY) y = dustMinY
          positionAttr.setY(i, y)
          positionAttr.setX(
            i,
            mote.baseX + Math.sin(time * 0.02 + mote.phase) * mote.wobble
          )
          positionAttr.setZ(
            i,
            mote.baseZ + Math.cos(time * 0.017 + mote.phase) * mote.wobble
          )
        }
        positionAttr.needsUpdate = true
      }

      let req = null
      let frame = 0
      const animate = () => {
        req = requestAnimationFrame(animate)

        frame = frame <= 100 ? frame + 1 : frame

        if (frame <= 100) {
          const p = initialCameraPosition
          // Swing in from 70 degrees to the side, easing onto the hero angle
          const rotSpeed = (1 - easeOutCirc(frame / 100)) * Math.PI * 0.39

          // Intro spin around the content centre
          camera.position.y = target.y + 10
          camera.position.x =
            target.x + p.x * Math.cos(rotSpeed) + p.z * Math.sin(rotSpeed)
          camera.position.z =
            target.z + p.z * Math.cos(rotSpeed) - p.x * Math.sin(rotSpeed)
          camera.lookAt(target)
        } else {
          updateSway(performance.now())
          controls.update()
        }

        const time = performance.now() / 16
        updateLights()
        updateDust(time)
        updateSleep(time)
        updateFairyLights(time)
        updateSky(time)
        updatePlant(time)
        updateDog(performance.now(), time)

        renderer.render(scene, camera)
      }

      return () => {
        cancelAnimationFrame(req)
        renderer.domElement.remove()
        renderer.dispose()
      }
    }
  }, [])

  useEffect(() => {
    window.addEventListener('resize', handleWindowResize, false)
    return () => {
      window.removeEventListener('resize', handleWindowResize, false)
    }
  }, [handleWindowResize])

  return (
    <DogContainer ref={refContainer}>{loading && <DogSpinner />}</DogContainer>
  )
}

export default VoxelDog
