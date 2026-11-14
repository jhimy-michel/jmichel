import { useState, useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils'
import Router from 'next/router'
import { Box, useColorMode, useColorModeValue } from '@chakra-ui/react'
import { DogSpinner, DogContainer } from './voxel-dog-loader'
import { loadGLTFModel } from '../libs/model'
import { createHotspots } from './room-hotspots'
import { SHEET_BELOW, SHEET_HEIGHT } from './panel'
import { topicById } from '../libs/topics'
import { heroInset } from '../libs/layout'

const GITHUB_URL = 'https://github.com/jhimy-michel'
const GLIDE_MS = 900
const NAVBAR_HEIGHT = 64
const SHADOW_EVERY = 3 // redraw shadows every Nth frame
// Filmic tone mapping darkens a little: lift the lamp-lit night more
// than full daylight, which would wash out
const TONE_EXPOSURE = { night: 1.25, day: 0.65 }
const FLOOR_BOUNCE = 0x5e3b26 // ambient light bounced up from the floor
const LAMP_FILL = 0.3 // wall fill light, share of the lamp's intensity
// Theme switch moments, in ms after the toggle: the lamp flickers on,
// the fairy lights come on one by one, Perrito glances at the lamp
const FLICKER = [80, 180, 260, 420] // on/off edges while switching on
const SCREEN_LIGHT = new THREE.Color(0xfff4e0)
const SCREEN_DARK = new THREE.Color(0x9fc8ff)
const CASCADE = { start: 300, step: 35, fade: 200 }
const GLANCE = { in: 400, hold: 1600, out: 600 }

// The armchair's two blues in the model's 256x1 colour palette (only the
// chair uses them), repainted in code: [palette index, new colour]
const CHAIR_COLORS = [
  [136, 0x3a7556], // dark green
  [137, 0x2b5c42] // dark green in shade
]

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

// Perrito sleeps between 22:00 and 07:00 local time
const isSleepTime = hour => hour >= 22 || hour < 7

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
  const mix = key => ({
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

// Hour the room is shown at: light mode is always daytime and dark mode
// always night, each following the real clock within its range. (Sleep
// still follows the real clock: late visitors in light mode see a nap)
function sceneHour(colorMode, hour) {
  if (colorMode === 'light') return THREE.MathUtils.clamp(hour, 9, 17.5)
  return hour >= 6 && hour < 21 ? 22.5 : hour
}

function getLightTarget({ colorMode, hour: realHour, season, asleep }) {
  const hour = sceneHour(colorMode, realHour)
  let target
  let daylight = 0
  if (colorMode === 'light') {
    target = lightModeAt(hour)
    const tint = SEASONAL_SUN[season]
    daylight = Math.max(0, Math.sin(((hour - 6) / 12) * Math.PI))
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
  target.exposure =
    TONE_EXPOSURE.night + (TONE_EXPOSURE.day - TONE_EXPOSURE.night) * daylight
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
  uniform float uFall; // 0 nothing, 1 snow
  uniform float uPlace; // 0 Zurich, 1 La Paz (blends in between)

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  // Triangle peak: 1 at x = c, 0 at distance w
  float peak(float x, float c, float w) {
    return max(0.0, 1.0 - abs(x - c) / w);
  }

  // Scenery lit by the sky: darker and bluer at night
  vec3 lit(vec3 c) {
    return mix(c, c * 0.28 + uTop * 0.12, uNight);
  }

  // Snow stays pale in the moonlight
  vec3 snow() {
    return mix(vec3(0.95, 0.96, 0.98), vec3(0.45, 0.52, 0.66), uNight);
  }

  // Warm window lights at night: a random share of cells, twinkling
  float cityLight(vec2 p, float density, float share) {
    vec2 cell = floor(p * density);
    vec2 f = fract(p * density) - 0.5;
    float h = hash(cell);
    float on = step(1.0 - share, h);
    float flick = 0.75 + 0.25 * sin(uTime * 0.03 + h * 50.0);
    return on * smoothstep(0.3, 0.05, length(f)) * uNight * flick;
  }

  // Zurich: Alps with a sharp Matterhorn-like peak, the lake below with
  // a shimmer, a green shore on the left and lights along it at night
  vec3 zurich(vec2 p, vec3 col) {
    float x = p.x;
    float alps = 0.36
      + 0.12 * peak(x, 0.35, 0.3) + 0.1 * peak(x, 0.75, 0.25)
      + 0.32 * peak(x, 1.25, 0.22) + 0.14 * peak(x, 1.65, 0.3)
      + 0.015 * sin(x * 37.0);
    vec3 rock = mix(uBottom, vec3(0.32, 0.38, 0.5), 0.6);
    if (p.y < alps) {
      col = lit(rock);
      if (p.y > alps - 0.07 && alps > 0.42) col = snow();
    }
    // Lake: the sky's colour, darker, with drifting glints
    if (p.y < 0.22) {
      vec3 water = mix(uBottom, uTop, 0.6) * 0.75;
      float glint = step(0.92, sin(x * 60.0 + uTime * 0.05 + sin(p.y * 90.0) * 2.0))
        * smoothstep(0.0, 0.22, p.y);
      col = lit(water) + glint * mix(0.25, 0.1, uNight);
    }
    // Green shore with a few houses on the left
    float shore = 0.24 - x * 0.18 + 0.02 * sin(x * 25.0);
    if (p.y < shore && x < 1.2) {
      col = lit(vec3(0.24, 0.45, 0.28));
      col += vec3(1.0, 0.8, 0.45) * cityLight(p, 30.0, 0.25);
    }
    return col;
  }

  // La Paz: Illimani's three snowy summits above the city, which climbs
  // the hillsides in brick and ochre houses. Thousands of lights at night
  // and a teleferico cabin gliding along its cable
  vec3 laPaz(vec2 p, vec3 col) {
    float x = p.x;
    float illimani = 0.34
      + 0.36 * peak(x, 1.2, 0.55) + 0.05 * peak(x, 0.95, 0.1)
      + 0.06 * peak(x, 1.45, 0.12) + 0.01 * sin(x * 41.0);
    vec3 rock = mix(uBottom, vec3(0.36, 0.38, 0.48), 0.6);
    if (p.y < illimani) {
      col = lit(rock);
      if (p.y > 0.47 + 0.03 * sin(x * 13.0)) col = snow();
    }
    // City bowl: steep hillsides on both sides, lower in the middle
    float hills = 0.12 + 0.3 * smoothstep(0.9, 0.0, x)
      + 0.16 * smoothstep(1.3, 1.95, x) + 0.012 * sin(x * 30.0);
    if (p.y < hills) {
      vec2 cell = floor(p * vec2(34.0, 40.0));
      float h = hash(cell);
      vec3 house = h < 0.33 ? vec3(0.66, 0.33, 0.24)
        : h < 0.66 ? vec3(0.78, 0.55, 0.36) : vec3(0.58, 0.46, 0.38);
      col = lit(house);
      col += vec3(1.0, 0.78, 0.4) * cityLight(p, 40.0, 0.55) * 1.2;
    }
    // Teleferico cable and a red cabin travelling along it
    vec2 a = vec2(0.05, 0.5);
    vec2 b = vec2(uAspect - 0.05, 0.3);
    vec2 ab = b - a;
    float t = clamp(dot(p - a, ab) / dot(ab, ab), 0.0, 1.0);
    float cable = length(p - (a + ab * t));
    col = mix(col, vec3(0.1), smoothstep(0.004, 0.0015, cable));
    float travel = fract(uTime * 0.0015);
    vec2 cabin = a + ab * travel - vec2(0.0, 0.025);
    vec2 d = abs(p - cabin);
    if (d.x < 0.022 && d.y < 0.018) col = lit(vec3(0.8, 0.15, 0.15))
      + vec3(1.0, 0.85, 0.5) * uNight * 0.6;
    return col;
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

    // The view: Zurich or La Paz, crossfading while switching
    vec3 view = col;
    if (uPlace < 0.999) view = zurich(p, col);
    if (uPlace > 0.001) view = mix(view, laPaz(p, col), uPlace);
    col = view;

    // Snow drifting down outside in winter
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
        if (r > 0.68) {
          local -= vec2(r - 0.75, hash(id.yx) - 0.5) * 0.6;
          float flake = smoothstep(0.09 - layer * 0.02, 0.0, length(local));
          col = mix(col, vec3(1.0), flake * 0.9);
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
      uFall: { value: season === 'winter' ? 1 : 0 },
      uPlace: { value: 0 }
    }
  })
  const pane = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material)
  pane.rotation.y = Math.PI / 2 // face into the room (+x)
  pane.position.set(unit * 0.006, bottom + height / 2, centerZ)
  group.add(pane)
  group.userData.pane = pane

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

// Repaint palette cells of the model's texture (a 256x1 strip of colours)
function repaintPalette(texture, cells) {
  const { image } = texture
  const canvas = document.createElement('canvas')
  canvas.width = image.width
  canvas.height = image.height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(image, 0, 0)
  for (const [index, color] of cells) {
    ctx.fillStyle = `#${color.toString(16).padStart(6, '0')}`
    ctx.fillRect(index, 0, 1, canvas.height)
  }
  texture.image = canvas
  texture.needsUpdate = true
}

// World bounds of the vertices of `mesh` painted with the given palette
// cells (the chair inside the body mesh)
function paletteBounds(mesh, cells) {
  const bounds = new THREE.Box3()
  const { position, uv } = mesh.geometry.attributes
  const point = new THREE.Vector3()
  const width = mesh.material.map.image.width
  for (let i = 0; i < position.count; i++) {
    if (!cells.includes(Math.floor(uv.getX(i) * width))) continue
    point.fromBufferAttribute(position, i).applyMatrix4(mesh.matrixWorld)
    bounds.expandByPoint(point)
  }
  return bounds
}

// Aymara aguayo (Bolivian woven cloth) as pixel art: wide solid bands
// separated by thin stripes and narrow bands of diamonds and zigzags.
// Rows run top to bottom; each row is drawn across the full width
function drawAguayo(ctx, size) {
  const c = {
    red: '#b3122e',
    pink: '#e0457b',
    orange: '#f28c28',
    yellow: '#f5c518',
    green: '#1e8a4c',
    blue: '#1f4e9c',
    purple: '#5b2a86',
    black: '#1a1a1a',
    white: '#f2e5bf'
  }
  const row = (y, color) => {
    ctx.fillStyle = color
    ctx.fillRect(0, y, size, 1)
  }
  const dot = (x, y, color) => {
    ctx.fillStyle = color
    ctx.fillRect(x, y, 1, 1)
  }
  // Diamonds: 5 rows high, one every 6 pixels
  const diamonds = (y0, bg, fg, centre) => {
    for (let y = 0; y < 5; y++) row(y0 + y, bg)
    for (let x0 = 0; x0 < size; x0 += 6) {
      for (let y = 0; y < 5; y++) {
        const half = 2 - Math.abs(y - 2)
        for (let dx = -half; dx <= half; dx++) {
          dot((x0 + 3 + dx + size) % size, y0 + y, fg)
        }
      }
      dot(x0 + 3, y0 + 2, centre)
    }
  }
  // Zigzag: 3 rows high, period 4
  const zigzag = (y0, bg, fg) => {
    for (let y = 0; y < 3; y++) row(y0 + y, bg)
    for (let x = 0; x < size; x++) {
      const y = [0, 1, 2, 1][x % 4]
      dot(x, y0 + y, fg)
    }
  }
  const bands = [
    [0, 6, c.red],
    [6, 1, c.yellow],
    [7, 1, c.green]
  ]
  for (const [y0, h, color] of bands)
    for (let y = y0; y < y0 + h; y++) row(y, color)
  diamonds(8, c.blue, c.yellow, c.pink)
  row(13, c.green)
  row(14, c.yellow)
  for (let y = 15; y < 21; y++) row(y, c.pink)
  row(21, c.orange)
  row(22, c.black)
  zigzag(23, c.black, c.white)
  row(26, c.black)
  row(27, c.orange)
  for (let y = 28; y < 32; y++) row(y, c.purple)
}

// Aguayo throw blanket folded over the front of an armrest: a piece on
// top, one hanging down the front and one down the outside. Built for
// the left armrest (outside at -x, front at +z); origin at the arm's top
// front outer corner
function buildThrow(unit, armWidth, length, drop) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 32
  drawAguayo(canvas.getContext('2d'), 32)
  const texture = new THREE.CanvasTexture(canvas)
  texture.magFilter = THREE.NearestFilter
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.encoding = THREE.sRGBEncoding
  const material = new THREE.MeshStandardMaterial({ map: texture })

  // Pieces given by their min/max corners. A small gap `e` keeps every
  // face off the armrest and off the other pieces: faces sharing a plane
  // flicker (z-fighting)
  const group = new THREE.Group()
  const t = unit * 0.02 // thickness
  const e = t * 0.15
  const piece = ([x0, y0, z0], [x1, y1, z1]) => {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0),
      material
    )
    mesh.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2)
    mesh.castShadow = mesh.receiveShadow = true
    group.add(mesh)
  }
  // On top, covering the edges of the two hanging pieces
  piece([-t - 2 * e, e, -length], [armWidth + e, e + t, t + 2 * e])
  // Down the front
  piece([-t - e, e - drop, e], [armWidth, e, e + t])
  // Down the outside
  piece([-t - e, e - drop * 0.8, -length + e], [-e, e, 0])
  return group
}

// Monstera leaf drawn as a voxel grid ('#' = cube): heart shape with the
// classic holes. Rows run from the stem (top) to the tip (bottom)
const MONSTERA_LEAF = [
  '..###..',
  '.#####.',
  '##.#.##',
  '#######',
  '#.###.#',
  '#######',
  '.##.##.',
  '..###..',
  '...#...'
]

// One leaf as a single merged mesh (one draw call), lying flat and
// pointing along +x from its stem end at the origin
function buildMonsteraLeaf(cell, color) {
  const boxes = []
  MONSTERA_LEAF.forEach((row, i) => {
    for (let j = 0; j < row.length; j++) {
      if (row[j] !== '#') continue
      const box = new THREE.BoxGeometry(cell, cell * 0.5, cell)
      box.translate((i + 0.5) * cell, 0, (j - (row.length - 1) / 2) * cell)
      boxes.push(box)
    }
  })
  const leaf = new THREE.Mesh(
    mergeBufferGeometries(boxes),
    new THREE.MeshStandardMaterial({ color })
  )
  leaf.castShadow = leaf.receiveShadow = true
  return leaf
}

// Potted voxel monstera: stepped terracotta pot on a saucer, stems
// leaning out with drooping voxel leaves. Returns the leaves group so it
// can sway. Origin at the bottom centre of the pot
function buildPlant(unit) {
  const group = new THREE.Group()
  const u = unit
  addBox(group, u * 0.24, u * 0.015, u * 0.24, 0x9c5232, 0, u * 0.0075, 0)
  addBox(group, u * 0.17, u * 0.06, u * 0.17, 0xa85b39, 0, u * 0.045, 0)
  addBox(group, u * 0.2, u * 0.1, u * 0.2, 0xb5653f, 0, u * 0.125, 0)
  addBox(group, u * 0.23, u * 0.035, u * 0.23, 0xc77a52, 0, u * 0.19, 0)
  addBox(group, u * 0.18, u * 0.01, u * 0.18, 0x3d2b1f, 0, u * 0.205, 0)
  const leaves = new THREE.Group()
  leaves.position.y = u * 0.2
  group.add(leaves)

  const cell = u * 0.022
  const greens = [0x2f7a4f, 0x3a8c5c, 0x276b44, 0x4a9a63]
  // [turn around the pot, stem length, lean out, leaf droop, size].
  // Turns stay within a half circle around +x: the plant stands against
  // a wall at -x, so no leaf may reach behind the pot. Positive turns
  // lean towards the window (-z), so they stay small
  const stems = [
    [-1.4, 0.3, 0.5, 0.6, 0.9],
    [-0.9, 0.42, 0.35, 0.5, 1.1],
    [-0.4, 0.26, 0.65, 0.7, 0.85],
    [0, 0.48, 0.2, 0.45, 1.1],
    [0.35, 0.34, 0.5, 0.6, 1],
    [-1.55, 0.4, 0.3, 0.5, 0.95],
    [0.1, 0.2, 0.15, 0.3, 0.75]
  ]
  stems.forEach(([turn, length, lean, droop, size], i) => {
    const stem = new THREE.Group()
    stem.rotation.y = turn
    stem.rotation.z = -lean // lean outwards (+x)
    leaves.add(stem)
    addBox(
      stem,
      u * 0.014,
      u * length,
      u * 0.014,
      0x2a5e3a,
      0,
      (u * length) / 2,
      0
    )
    const leaf = buildMonsteraLeaf(cell * size, greens[i % greens.length])
    leaf.position.y = u * length
    // Undo the lean, then droop the tip down and give it a little twist
    leaf.rotation.set(0.15 * ((i % 3) - 1), 0, lean - droop)
    stem.add(leaf)
  })
  return { group, leaves }
}

// Small pixel-art pictures for the photo frames until real photos exist:
// [sky, far, near, accent] drawn as simple landscapes
const FRAME_PICTURES = [
  ['#8fc4e8', '#f2f4f7', '#7a8aa3', '#c97b4a'], // snowy mountain
  ['#f5a35c', '#e5735a', '#2f4f6b', '#ffd27a'], // sunset over the sea
  ['#a7d3e8', '#4f7a5a', '#3a6f9a', '#f2e5bf'] // lake and hills
]

function buildPictureTexture([sky, far, near, accent], kind) {
  const canvas = document.createElement('canvas')
  canvas.width = 12
  canvas.height = 15
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, 12, 15)
  if (kind === 0) {
    // Mountain with a snowy top
    for (let y = 4; y < 15; y++) {
      const half = y - 3
      ctx.fillStyle = y < 7 ? far : near
      ctx.fillRect(6 - half, y, half * 2, 1)
    }
    ctx.fillStyle = accent
    ctx.fillRect(0, 13, 12, 2)
  } else if (kind === 1) {
    // Sun setting into the sea
    ctx.fillStyle = far
    ctx.fillRect(0, 6, 12, 3)
    ctx.fillStyle = accent
    ctx.fillRect(4, 5, 4, 3)
    ctx.fillStyle = near
    ctx.fillRect(0, 9, 12, 6)
  } else {
    // Hills over a lake
    ctx.fillStyle = far
    ctx.fillRect(0, 7, 12, 3)
    ctx.fillRect(2, 6, 5, 1)
    ctx.fillStyle = near
    ctx.fillRect(0, 10, 12, 5)
    ctx.fillStyle = accent
    ctx.fillRect(7, 11, 3, 1)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.magFilter = THREE.NearestFilter
  texture.encoding = THREE.sRGBEncoding
  return texture
}

// Small hash for stable per-post variety (book height and thickness)
function hashString(text) {
  let h = 0
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0
  return Math.abs(h)
}

const MAX_SHELF_POSTS = 12

// Two-board wall bookcase. Top board: one book per post, coloured by
// topic, padded with a few plain books so it never looks empty. Lower
// board: photo frames and a little camera. Built facing +z with its back
// at z = 0; origin at the lower board's centre. Returns the post books
// (to click and pull out) and the photo frames group
function buildShelf(unit, posts) {
  const group = new THREE.Group()
  const u = unit
  const width = u * 0.5
  const depth = u * 0.1
  const gap = u * 0.16 // between the two boards
  const wood = 0x7d5238
  const board = u * 0.022
  addBox(group, width, board, depth, wood, 0, 0, depth / 2)
  addBox(group, width, board, depth, wood, 0, gap, depth / 2)
  // Side panels holding both boards
  for (const side of [-1, 1]) {
    addBox(
      group,
      u * 0.02,
      gap + board * 2,
      depth,
      0x5e3b26,
      side * (width / 2 + u * 0.01),
      gap / 2,
      depth / 2
    )
  }

  // Top board: post books, then plain filler books
  const postBooks = []
  const shelfTop = gap + board / 2
  let x = -width / 2 + u * 0.012
  const addBook = (w, h, color) => {
    const book = addBox(
      group,
      w,
      h,
      u * 0.075,
      color,
      x + w / 2,
      shelfTop + h / 2,
      depth / 2
    )
    x += w + u * 0.004
    return book
  }
  for (const post of posts.slice(0, MAX_SHELF_POSTS)) {
    const h = hashString(post.slug)
    const topic = topicById(post.topic)
    const color = new THREE.Color(topic ? topic.color : '#9e8670').getHex()
    const mesh = addBook(
      u * (0.026 + (h % 4) * 0.003),
      u * (0.1 + ((h >> 3) % 4) * 0.006),
      color
    )
    postBooks.push({ mesh, restZ: mesh.position.z, ...post })
  }
  const fillers = [
    [0.024, 0.092, 0xe9dcc3],
    [0.03, 0.108, 0xfd8b51],
    [0.022, 0.096, 0x6d5a9c],
    [0.028, 0.102, 0xd9a441]
  ]
  const room = width / 2 - u * 0.09 // leave space for the leaning book
  for (const [w, h, color] of fillers) {
    if (postBooks.length + 2 > MAX_SHELF_POSTS || x + u * w > room) break
    addBook(u * w, u * h, color)
  }
  const leaning = addBox(
    group,
    u * 0.026,
    u * 0.1,
    u * 0.075,
    0x2f6b4f,
    x + u * 0.033,
    shelfTop + u * 0.047,
    depth / 2
  )
  leaning.rotation.z = -0.35

  // Lower board: three framed pictures leaning against the wall, a
  // little camera and the succulent
  const photos = new THREE.Group()
  group.add(photos)
  const frameW = u * 0.075
  const frameH = u * 0.095
  FRAME_PICTURES.forEach((colors, i) => {
    const frame = new THREE.Group()
    frame.position.set(-width * 0.36 + i * u * 0.088, board / 2, depth * 0.45)
    frame.rotation.x = -0.12 // leaning back
    frame.rotation.y = (i - 1) * 0.08
    addBox(frame, frameW, frameH, u * 0.012, 0x3a2a1f, 0, frameH / 2, 0)
    const picture = new THREE.Mesh(
      new THREE.PlaneGeometry(frameW * 0.78, frameH * 0.8),
      new THREE.MeshStandardMaterial({
        map: buildPictureTexture(colors, i)
      })
    )
    picture.position.set(0, frameH / 2, u * 0.0065)
    frame.add(picture)
    photos.add(frame)
  })
  // Camera: body, lens and a red shutter button
  const cameraX = width * 0.12
  addBox(
    photos,
    u * 0.06,
    u * 0.038,
    u * 0.03,
    0x222428,
    cameraX,
    board / 2 + u * 0.019,
    depth * 0.55
  )
  addBox(
    photos,
    u * 0.026,
    u * 0.026,
    u * 0.02,
    0x3a3d44,
    cameraX,
    board / 2 + u * 0.019,
    depth * 0.55 + u * 0.024
  )
  addBox(
    photos,
    u * 0.01,
    u * 0.006,
    u * 0.01,
    0xcb6040,
    cameraX + u * 0.018,
    board / 2 + u * 0.041,
    depth * 0.55
  )
  // Succulent in a terracotta pot
  addBox(
    group,
    u * 0.05,
    u * 0.045,
    u * 0.05,
    0xb5653f,
    width * 0.36,
    board / 2 + u * 0.0225,
    depth / 2
  )
  addBox(
    group,
    u * 0.06,
    u * 0.035,
    u * 0.06,
    0x3a8c5c,
    width * 0.36,
    board / 2 + u * 0.062,
    depth / 2
  )

  return { group, postBooks, photos, pullOut: depth * 0.55 }
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

const smoothstep = x => x * x * (3 - 2 * x)

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
  // Soft additive halo around each bulb, so they glow instead of looking
  // like plain white cubes (cheaper than a bloom pass)
  const haloTexture = buildPuffTexture()
  const span = unit * 0.38 // distance between hooks
  const spacing = unit * 0.095 // distance between bulbs
  const hang = wallHeight - unit * 0.07
  const away = unit * 0.035 // in front of the wall face
  const addString = alongX => {
    const points = []
    for (let d = unit * 0.06; d <= size - unit * 0.02; d += spacing) {
      const sag = Math.sin(Math.PI * ((d % span) / span)) * unit * 0.045
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
      const halo = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: haloTexture,
          color,
          blending: THREE.AdditiveBlending,
          transparent: true,
          depthWrite: false,
          opacity: 0
        })
      )
      halo.position.copy(bulb.position)
      halo.scale.setScalar(unit * 0.13)
      group.add(halo)
      bulbs.push({
        material,
        halo: halo.material,
        phase: Math.random() * Math.PI * 2
      })
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

// Swiss railway style wall clock: white face, black bar markers, black
// hands and a red second hand with a disc at its tip. Built facing +z,
// origin at the face centre. Returns the hand pivots for updateClock
function buildClock(radius) {
  const group = new THREE.Group()
  const r = radius
  const depth = r * 0.25

  const rim = new THREE.Mesh(
    new THREE.CylinderGeometry(r * 1.1, r * 1.1, depth, 48),
    new THREE.MeshStandardMaterial({
      color: 0x8d969c,
      metalness: 0.5,
      roughness: 0.4
    })
  )
  rim.rotation.x = Math.PI / 2
  rim.position.z = -depth / 2
  rim.castShadow = rim.receiveShadow = true
  group.add(rim)

  // Face with 60 minute bars and 12 thicker hour bars, drawn once
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 256
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, 256, 256)
  ctx.fillStyle = '#111111'
  ctx.translate(128, 128)
  for (let i = 0; i < 60; i++) {
    const hour = i % 5 === 0
    ctx.save()
    ctx.rotate((i / 60) * Math.PI * 2)
    if (hour) ctx.fillRect(-5, -122, 10, 34)
    else ctx.fillRect(-2, -122, 4, 10)
    ctx.restore()
  }
  const face = new THREE.Mesh(
    new THREE.CircleGeometry(r, 48),
    new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(canvas) })
  )
  face.position.z = 0.001
  face.receiveShadow = true
  group.add(face)

  // Hands turn around z on pivots at the centre, pointing up (12) at 0
  const black = new THREE.MeshStandardMaterial({ color: 0x111111 })
  const red = new THREE.MeshStandardMaterial({ color: 0xd52b1e })
  const hand = (width, length, tail, material, z) => {
    const pivot = new THREE.Group()
    pivot.position.z = z
    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(width, length + tail, r * 0.02),
      material
    )
    bar.position.y = (length - tail) / 2
    pivot.add(bar)
    group.add(pivot)
    return pivot
  }
  const hour = hand(r * 0.12, r * 0.62, r * 0.2, black, r * 0.03)
  const minute = hand(r * 0.09, r * 0.92, r * 0.22, black, r * 0.06)
  const second = hand(r * 0.03, r * 0.6, r * 0.3, red, r * 0.09)
  const disc = new THREE.Mesh(
    new THREE.CylinderGeometry(r * 0.11, r * 0.11, r * 0.02, 24),
    red
  )
  disc.rotation.x = Math.PI / 2
  disc.position.y = r * 0.6
  second.add(disc)

  return { group, hour, minute, second }
}

// Local time of a place, whatever the visitor's timezone: offset from
// the visitor's clock, worked out once
function timeZoneOffset(timeZone) {
  const now = new Date()
  now.setMilliseconds(0)
  const parts = {}
  for (const { type, value } of new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
  }).formatToParts(now)) {
    parts[type] = Number(value)
  }
  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second
  )
  return asUtc - now.getTime()
}

// Read the result with getUTC* methods
const placeNow = offset => new Date(Date.now() + offset)

// The two views out of the window. The view alternates by day; clicking
// the window switches it
const PLACES = [
  { label: '🇨🇭 Zürich', timeZone: 'Europe/Zurich' },
  { label: '🇧🇴 La Paz · Illimani', timeZone: 'America/La_Paz' }
]
const dayNumber = () =>
  Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000)

const hhmm = date =>
  `${String(date.getUTCHours()).padStart(2, '0')}:${String(
    date.getUTCMinutes()
  ).padStart(2, '0')}`

// Small wooden side table with a drawer. Unit is the dog's height;
// origin at the floor centre. Returns the height of its top
function buildSideTable(unit) {
  const group = new THREE.Group()
  const u = unit
  const height = u * 0.34
  const top = u * 0.24
  const wood = 0x7d5238
  addBox(group, top, u * 0.025, top, 0x94633f, 0, height - u * 0.0125, 0)
  for (const [x, z] of [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1]
  ]) {
    addBox(
      group,
      u * 0.025,
      height - u * 0.025,
      u * 0.025,
      wood,
      x * top * 0.4,
      (height - u * 0.025) / 2,
      z * top * 0.4
    )
  }
  // Drawer under the top, knob facing the room
  addBox(group, top * 0.85, u * 0.06, top * 0.85, wood, 0, height - u * 0.06, 0)
  addBox(
    group,
    u * 0.02,
    u * 0.02,
    u * 0.012,
    0xcb6040,
    0,
    height - u * 0.06,
    top * 0.43
  )
  // Lower shelf
  addBox(group, top * 0.85, u * 0.015, top * 0.85, wood, 0, u * 0.08, 0)
  return { group, height }
}

// Bedside lamp: round-ish base, short stem and a stepped shade. Unit
// height. Returns the bulb's local position so the lights sit inside
function buildLamp() {
  const group = new THREE.Group()
  const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x1d5a66 })
  const shadeMaterial = new THREE.MeshStandardMaterial({
    color: 0xf2e5bf,
    emissive: 0xfd8b51,
    emissiveIntensity: 0
  })
  const bulbMaterial = new THREE.MeshStandardMaterial({
    color: 0xfff1c9,
    emissive: 0xffd27a,
    emissiveIntensity: 0
  })
  const box = (w, h, d, material, y) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material)
    mesh.position.y = y
    group.add(mesh)
    return mesh
  }

  const frame = [
    box(0.45, 0.08, 0.45, frameMaterial, 0.04),
    box(0.3, 0.1, 0.3, frameMaterial, 0.13),
    box(0.08, 0.35, 0.08, frameMaterial, 0.35)
  ]
  // Stepped shade, wide at the bottom
  box(0.72, 0.18, 0.72, shadeMaterial, 0.6)
  box(0.58, 0.14, 0.58, shadeMaterial, 0.76)
  box(0.42, 0.1, 0.42, shadeMaterial, 0.88)
  // Bulb peeking out under the shade
  box(0.2, 0.06, 0.2, bulbMaterial, 0.49)

  // Base and stem cast shadows; the shade and bulb must not, since the
  // lamp's light sits inside them and would otherwise be blocked
  for (const mesh of frame) mesh.castShadow = mesh.receiveShadow = true
  return {
    group,
    shadeMaterial,
    bulbMaterial,
    light: new THREE.Vector3(0, 0.5, 0)
  }
}

// focus: 'room' or 'shelf'. panelWidth: px covered by the page panel
// (0 when closed). activeTopic / activePost: books pulled out of the shelf
// hero: the hero text is showing, so the room frames itself beside it
const VoxelDog = ({
  focus = 'room',
  panelWidth = 0,
  activeTopic = null,
  activePost = null,
  hero = false
}) => {
  const refContainer = useRef()
  const [loading, setLoading] = useState(true)
  const refRenderer = useRef()
  const refLights = useRef(null)
  const refLightTarget = useRef(LIGHTS.dark)
  const refLabel = useRef()
  // Re-fits the camera to the canvas shape; set once the scene is built
  const refFit = useRef(null)
  const refUpdateView = useRef(null)
  const refFocus = useRef(focus)
  const refPanelWidth = useRef(panelWidth)
  const refHero = useRef(hero)
  const refTopic = useRef(activeTopic)
  const refPost = useRef(activePost)
  const { colorMode, toggleColorMode } = useColorMode()
  const refColorMode = useRef(colorMode)
  const refToggle = useRef(toggleColorMode)
  useEffect(() => {
    refToggle.current = toggleColorMode
  }, [toggleColorMode])
  // Last theme switch (not the first render): { mode, at }
  const refThemeSwitch = useRef(null)
  const labelBg = useColorModeValue('brand.tealDeep', 'brand.sand')
  const labelColor = useColorModeValue('brand.cream', 'brand.night')
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
    if (refColorMode.current !== colorMode) {
      refThemeSwitch.current = { mode: colorMode, at: performance.now() }
      refColorMode.current = colorMode
    }
    const id = setInterval(refresh, 60 * 1000)
    return () => clearInterval(id)
  }, [colorMode])

  const handleResize = useCallback(() => {
    const { current: renderer } = refRenderer
    const { current: container } = refContainer
    if (container && renderer) {
      renderer.setSize(container.clientWidth, container.clientHeight)
      if (refFit.current) refFit.current()
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
      // Phones: small or touch-only screens get a lighter scene
      const isPhone =
        Math.min(window.innerWidth, window.innerHeight) < 600 ||
        window.matchMedia('(pointer: coarse)').matches
      // Full-screen canvas: past 2x (1.5x on phones) extra pixels cost a
      // lot of GPU time and look no different
      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, isPhone ? 1.5 : 2)
      )
      renderer.setSize(scW, scH)
      renderer.outputEncoding = THREE.sRGBEncoding
      // Filmic curve: bright lamp light rolls off softly instead of
      // clipping to flat orange
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure =
        refLightTarget.current.exposure || TONE_EXPOSURE.night
      // Soft shadows from the sun/moon and the reading lamp
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      // Shadows only change when Perrito moves: redraw them every few
      // frames instead of every frame (see animate)
      renderer.shadowMap.autoUpdate = false
      container.appendChild(renderer.domElement)
      refRenderer.current = renderer

      const scene = new THREE.Scene()

      const target = new THREE.Vector3(-0.5, 1.2, 0)
      const initialCameraPosition = new THREE.Vector3(0, 10, 20)

      const scale = scH * 0.005 + 4.8
      const aspect = scW / scH
      const camera = new THREE.OrthographicCamera(
        -scale * aspect,
        scale * aspect,
        scale,
        -scale,
        // Tight near/far keeps depth precision high (no flickering faces)
        1,
        60
      )
      camera.position.copy(initialCameraPosition)
      camera.lookAt(target)

      const initial = refLightTarget.current

      // Sky colour from above, warm floor bounce from below: gives the
      // walls and furniture some variation instead of one flat tone
      const ambientLight = new THREE.HemisphereLight(
        initial.ambient.color,
        FLOOR_BOUNCE,
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

      // Reading lamp: a spotlight inside the shade pointing down makes a
      // warm pool on Perrito and the rug; a weak fill (no shadows) warms
      // the walls around it. Both placed after load
      const lampLight = new THREE.SpotLight(
        initial.lamp.color,
        initial.lamp.intensity
      )
      lampLight.angle = 0.85
      lampLight.penumbra = 0.8
      lampLight.decay = 1
      // One extra shadow render (a point light would need six)
      lampLight.castShadow = true
      lampLight.shadow.mapSize.set(512, 512)
      lampLight.shadow.bias = -0.002
      lampLight.shadow.normalBias = 0.03
      scene.add(lampLight, lampLight.target)
      const lampFill = new THREE.PointLight(initial.lamp.color, 0)
      lampFill.decay = 1
      scene.add(lampFill)

      refLights.current = {
        ambient: ambientLight,
        directional: directionalLight,
        lamp: lampLight
      }

      let lampShadeMaterial = null
      // Lamp brightness and shade glow before the switch-on flicker
      let lampLevel = initial.lamp.intensity
      let glowLevel = initial.lampGlow
      let clock = null
      const clockOffset = timeZoneOffset('Europe/Zurich')
      const placeOffsets = PLACES.map(place => timeZoneOffset(place.timeZone))
      let place = dayNumber() % PLACES.length
      let placeLevel = place
      let lampBulbMaterial = null
      let lampHalo = null
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
      // Post books on the shelf: { mesh, restZ, pullOut, slug, topic }
      const books = []
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
      // The page must still scroll over the room: no wheel zoom, and
      // vertical swipes scroll on touch screens (horizontal ones rotate)
      controls.enableZoom = false
      controls.enablePan = false
      renderer.domElement.style.touchAction = 'pan-y'

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

      // Clicking an object just navigates; the page decides the framing
      const hotspots = createHotspots({
        scene,
        camera,
        dom: renderer.domElement,
        onHover: (spot, x, y) => {
          const label = refLabel.current
          if (!label) return
          label.style.display = spot ? 'block' : 'none'
          if (!spot) return
          label.textContent =
            typeof spot.label === 'function' ? spot.label() : spot.label
          label.style.left = `${x}px`
          label.style.top = `${y - 36}px`
        },
        onPick: (spot, event) => {
          if (spot.action) {
            spot.action(event)
            return
          }
          if (!spot.href) return
          if (spot.external) {
            window.open(spot.href, '_blank', 'noopener')
            return
          }
          Router.push(spot.href, undefined, { scroll: false })
        }
      })

      // Framing. A view is a target + zoom that fits a set of points (the
      // whole room, or the bookshelf) as seen from the hero angle, into the
      // part of the canvas the page panel and navbar leave free. The view
      // follows the page and the canvas size; the camera glides between views
      const heroCamera = camera.clone()
      heroCamera.position.copy(initialCameraPosition)
      heroCamera.lookAt(0, 0, 0)
      heroCamera.updateMatrixWorld()
      const heroRight = new THREE.Vector3().setFromMatrixColumn(
        heroCamera.matrixWorld,
        0
      )
      const heroUp = new THREE.Vector3().setFromMatrixColumn(
        heroCamera.matrixWorld,
        1
      )
      let roomPoints = null
      let shelfPoints = null
      let glide = null
      const glideDelta = new THREE.Vector3()

      // Free part of the canvas in px: what the navbar, the side panel or
      // the bottom sheet don't cover. (cx, cy) is its centre's offset from
      // the canvas centre, y pointing down
      const freeArea = () => {
        const w = container.clientWidth
        const h = container.clientHeight
        const panel = refPanelWidth.current
        let left = 0
        let right = w
        let top = NAVBAR_HEIGHT
        let bottom = h
        if (panel && w < SHEET_BELOW) bottom = h * (1 - SHEET_HEIGHT)
        else if (panel) right = Math.max(w - panel, w * 0.3)
        else if (refHero.current) {
          const inset = heroInset(w)
          left = Math.min(inset.left, w * 0.5)
          right = w - inset.right
          bottom = h - inset.bottom
        }
        if (bottom - top < 80) top = 0
        return {
          w,
          h,
          fw: right - left,
          fh: bottom - top,
          cx: (left + right - w) / 2,
          cy: (top + bottom - h) / 2
        }
      }

      const viewFor = (points, fill) => {
        const area = freeArea()
        let minX = Infinity
        let maxX = -Infinity
        let minY = Infinity
        let maxY = -Infinity
        const centre = new THREE.Vector3()
        for (const p of points) {
          const x = p.dot(heroRight)
          const y = p.dot(heroUp)
          minX = Math.min(minX, x)
          maxX = Math.max(maxX, x)
          minY = Math.min(minY, y)
          maxY = Math.max(maxY, y)
          centre.add(p)
        }
        centre.divideScalar(points.length)
        // Slide the centroid within the screen plane onto the outline's centre
        centre
          .addScaledVector(heroRight, (minX + maxX) / 2 - centre.dot(heroRight))
          .addScaledVector(heroUp, (minY + maxY) / 2 - centre.dot(heroUp))
        const halfX = Math.max((maxX - minX) / 2, 1e-3)
        const halfY = Math.max((maxY - minY) / 2, 1e-3)
        // Ortho camera: canvas height h shows 2 * scale / zoom world units
        const zoom = THREE.MathUtils.clamp(
          Math.min(
            (fill * area.fw * scale) / (halfX * area.h),
            (fill * area.fh * scale) / (halfY * area.h)
          ),
          0.2,
          20
        )
        const pxPerUnit = (area.h * zoom) / (2 * scale)
        // Shift the camera so the outline sits in the free area's centre
        const viewTarget = centre
          .clone()
          .addScaledVector(heroRight, -area.cx / pxPerUnit)
          .addScaledVector(heroUp, area.cy / pxPerUnit)
        return { target: viewTarget, zoom }
      }

      const desiredView = () => {
        if (refFocus.current === 'shelf' && shelfPoints) {
          // Leave some wall around the shelf so it reads as part of the room
          return viewFor(shelfPoints, 0.45)
        }
        const { w, h } = freeArea()
        // Portrait phones are width-bound: let the room go nearly edge to edge
        const fill = refPanelWidth.current ? 0.9 : w < h ? 0.98 : 0.94
        return viewFor(roomPoints, fill)
      }

      // Move target and camera together so the view angle stays the same
      const moveTo = (viewTarget, zoom) => {
        glideDelta.subVectors(viewTarget, target)
        target.add(glideDelta)
        camera.position.add(glideDelta)
        camera.zoom = zoom
        camera.updateProjectionMatrix()
      }

      const updateView = ({ animate }) => {
        if (!roomPoints) return
        const view = desiredView()
        if (!animate || reduceMotion) {
          glide = null
          moveTo(view.target, view.zoom)
          return
        }
        glide = {
          start: performance.now(),
          from: target.clone(),
          fromZoom: camera.zoom,
          to: view
        }
      }

      const updateGlide = now => {
        const t = Math.min(1, (now - glide.start) / GLIDE_MS)
        const e = smoothstep(t)
        moveTo(
          glideDelta.lerpVectors(glide.from, glide.to.target, e).clone(),
          THREE.MathUtils.lerp(glide.fromZoom, glide.to.zoom, e)
        )
        if (t === 1) glide = null
      }

      const resize = () => {
        const { clientWidth: w, clientHeight: h } = container
        if (!w || !h) return
        camera.left = (-scale * w) / h
        camera.right = (scale * w) / h
        camera.updateProjectionMatrix()
        updateView({ animate: false })
      }
      refFit.current = resize
      refUpdateView.current = () => updateView({ animate: true })

      const updateSway = now => {
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

      // The posts for the bookshelf (written at build time)
      const shelfPosts = fetch('/shelf.json')
        .then(response => (response.ok ? response.json() : []))
        .catch(() => [])

      Promise.all([
        loadGLTFModel(scene, urlDogGLB, {
          receiveShadow: true,
          castShadow: true
        }),
        shelfPosts
      ]).then(([model, posts]) => {
        // Bounding box of the chair/dog only: the GLB also contains a flat
        // ground/shadow plane that would otherwise blow up the box
        const fullBox = new THREE.Box3().setFromObject(model)
        const fullHeight = fullBox.max.y - fullBox.min.y
        const box = new THREE.Box3()
        const childBox = new THREE.Box3()
        model.updateWorldMatrix(true, true)
        model.traverse(child => {
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

        // Armchair: dark green instead of navy (stands out from the teal
        // walls), with an aguayo throw over the left armrest
        const body = model.getObjectByName('body')
        if (body?.isMesh && body.material.map) {
          const chairCells = CHAIR_COLORS.map(([index]) => index)
          const chair = paletteBounds(body, chairCells)
          repaintPalette(body.material.map, CHAIR_COLORS)
          if (!chair.isEmpty()) {
            const chairSize = chair.getSize(new THREE.Vector3())
            // Armrest top: highest chair point along the left edge
            const armWidth = chairSize.x * 0.17
            let armTop = chair.min.y
            const { position, uv } = body.geometry.attributes
            const point = new THREE.Vector3()
            const width = body.material.map.image.width
            for (let i = 0; i < position.count; i++) {
              if (!chairCells.includes(Math.floor(uv.getX(i) * width))) continue
              point.fromBufferAttribute(position, i)
              point.applyMatrix4(body.matrixWorld)
              if (
                point.x < chair.min.x + armWidth * 0.8 &&
                point.z > chair.max.z - chairSize.z * 0.3
              )
                armTop = Math.max(armTop, point.y)
            }
            const blanket = buildThrow(
              size.y,
              armWidth,
              chairSize.z * 0.35,
              (armTop - chair.min.y) * 0.55
            )
            blanket.position.set(chair.min.x, armTop, chair.max.z)
            scene.add(blanket)
          }
        }
        // Side table right of the chair, next to the mug with a small bedside lamp on it:
        // low enough to stay clear of Perrito's face, the window and the
        // clock on the right wall
        const table = buildSideTable(size.y)
        const lampBase = new THREE.Vector3(
          box.max.x + size.x * 0.16,
          box.min.y,
          box.max.z - size.z * 0.05
        )
        table.group.position.copy(lampBase)
        scene.add(table.group)
        const lampHeight = size.y * 0.26
        const {
          group: lamp,
          shadeMaterial,
          bulbMaterial,
          light: lightAt
        } = buildLamp()
        lampShadeMaterial = shadeMaterial
        lampBulbMaterial = bulbMaterial
        lamp.scale.setScalar(lampHeight)
        lamp.position.copy(lampBase)
        lamp.position.y += table.height
        scene.add(lamp)
        lamp.updateMatrixWorld()
        lamp.localToWorld(lightAt)
        lampLight.position.copy(lightAt)
        // Aimed at Perrito's lap and the laptop
        lampLight.target.position.set(
          (box.min.x + box.max.x) / 2,
          box.min.y + size.y * 0.4,
          box.max.z - size.z * 0.3
        )
        lampLight.distance = size.y * 2.5
        lampFill.position.copy(lightAt)
        lampFill.distance = size.y * 3
        // Soft glow under the shade, faded in with the lamp
        lampHalo = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: buildPuffTexture(),
            color: 0xffc58a,
            blending: THREE.AdditiveBlending,
            transparent: true,
            depthWrite: false,
            opacity: 0
          })
        )
        lampHalo.position.copy(lightAt)
        lampHalo.scale.setScalar(size.y * 0.35)
        scene.add(lampHalo)
        // The lamp is a light switch for the whole site
        hotspots.add(lamp, {
          label: () =>
            refColorMode.current === 'dark' ? '☀️ Light mode' : '🌙 Dark mode',
          action: () => refToggle.current()
        })

        // Room corner turned 45 degrees: corner straight behind the
        // furniture, walls opening towards the camera. Size it so the chair,
        // lamp and the seasonal prop spot all fit with a margin.
        const rugCenterZ = (box.min.z + box.max.z) / 2
        const baseReach = size.y * 0.15
        const margin = size.y * 0.12
        // [x, z, margin]: the chair's back sits close to the walls so there
        // is no empty gap behind it
        const backMargin = size.y * 0.03
        const footprint = [
          [box.min.x, box.min.z, backMargin],
          [box.max.x, box.min.z, backMargin],
          [box.min.x, box.max.z],
          [box.max.x, box.max.z],
          [lampBase.x - baseReach, lampBase.z - baseReach],
          [lampBase.x + baseReach, lampBase.z - baseReach],
          [lampBase.x + baseReach, lampBase.z + baseReach],
          [box.min.x - size.x * 0.45, rugCenterZ]
        ]
        const roomCenterX =
          (Math.min(...footprint.map(p => p[0])) +
            Math.max(...footprint.map(p => p[0]))) /
          2
        // Inside the corner means z - cornerZ >= |x - roomCenterX|
        const cornerZ = Math.min(
          ...footprint.map(
            ([x, z, m = margin]) => z - Math.abs(x - roomCenterX) - m
          )
        )
        // Distance along each wall direction, to size the square floor
        const roomSize =
          Math.max(
            ...footprint.map(([x, z]) => {
              const dx = x - roomCenterX
              const dz = z - cornerZ
              return Math.max((dx + dz) / Math.SQRT2, (dz - dx) / Math.SQRT2)
            })
          ) +
          margin * 2 +
          // A little extra floor so the walls aren't crowded
          size.y * 0.2
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
        // Zurich or La Paz outside: hover shows the place and its time,
        // clicking switches to the other view
        hotspots.add(roomWindow.group, {
          label: () =>
            `${PLACES[place].label} ${hhmm(placeNow(placeOffsets[place]))}`,
          action: () => {
            place = (place + 1) % PLACES.length
          }
        })

        // Station clock on the right wall, just left of the bookshelf
        // (the chair hides most of the left wall's corner)
        const clockRadius = size.y * 0.09
        clock = buildClock(clockRadius)
        clock.group.position.set(
          roomSize * 0.8 - size.y * 0.36 - clockRadius,
          size.y * 0.5,
          size.y * 0.022
        )
        room.group.add(clock.group)
        hotspots.add(clock.group, {
          label: () => `🇨🇭 Zürich ${hhmm(placeNow(clockOffset))}`
        })

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
        plant.group.position.set(size.y * 0.15, 0, roomSize * 0.84)
        room.group.add(plant.group)
        plantLeaves = plant.leaves

        // Wall shelf on the front part of the right wall
        // Bookcase: lower board just under the wall's rail, books on top
        // (low enough to stay under the fairy lights)
        const {
          group: shelf,
          postBooks,
          photos,
          pullOut
        } = buildShelf(size.y, posts)
        shelf.position.set(roomSize * 0.82, size.y * 0.27, size.y * 0.01)
        room.group.add(shelf)
        hotspots.add(shelf, { label: '📚 Bookshelf', href: '/posts' })
        for (const book of postBooks) {
          const topic = topicById(book.topic)
          hotspots.add(book.mesh, {
            label: `${topic ? topic.emoji : '📖'} ${book.title}`,
            href: `/posts/${book.slug}`
          })
          books.push({ ...book, pullOut })
        }
        hotspots.add(photos, { label: '📷 Photos coming soon' })
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
        lampLight.shadow.camera.far = size.y * 2.5
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
            new THREE.BoxGeometry(0.38, 0.06, 0.38),
            new THREE.MeshStandardMaterial({ color: 0xffffff })
          )
          // On top of the shade
          cap.position.y = 0.93 + 0.03
          lamp.add(cap)
        }

        // Movable parts split out in Blender: pivots at neck and hinge
        headPart = model.getObjectByName('head')
        lidPart = model.getObjectByName('laptop_lid')
        hotspots.add(lidPart, {
          label: '💻 GitHub ↗',
          href: GITHUB_URL,
          external: true
        })
        armR = model.getObjectByName('arm_R')
        armL = model.getObjectByName('arm_L')
        mugPart = model.getObjectByName('mug')
        hotspots.add(mugPart, { label: '☕ About me', href: '/#about' })
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
        dustMaxY = box.min.y + size.y * 0.8
        const positions = new Float32Array(dustCount * 3)
        dustData = []
        for (let i = 0; i < dustCount; i++) {
          const radius = Math.random() * size.y * 0.35
          const angle = Math.random() * Math.PI * 2
          const x = lampBase.x + Math.cos(angle) * radius
          const z = lampBase.z + Math.sin(angle) * radius
          positions[i * 3] = x
          positions[i * 3 + 1] = dustMinY + Math.random() * size.y * 0.8
          positions[i * 3 + 2] = z
          dustData.push({
            baseX: x,
            baseZ: z,
            speed: size.y * (0.0006 + Math.random() * 0.0012),
            phase: Math.random() * Math.PI * 2,
            wobble: size.y * 0.02 * Math.random()
          })
        }
        dustGeometry = new THREE.BufferGeometry()
        dustGeometry.setAttribute(
          'position',
          new THREE.BufferAttribute(positions, 3)
        )
        dustMaterial = new THREE.PointsMaterial({
          color: 0xffd9a0,
          size: size.y * 0.022,
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

        // Outlines to frame: every room vertex plus the furniture's box,
        // and the bookshelf on its own
        const collectPoints = object => {
          const points = []
          object.updateMatrixWorld(true)
          object.traverse(mesh => {
            if (!mesh.isMesh) return
            const positions = mesh.geometry.attributes.position
            for (let i = 0; i < positions.count; i++) {
              points.push(
                new THREE.Vector3()
                  .fromBufferAttribute(positions, i)
                  .applyMatrix4(mesh.matrixWorld)
              )
            }
          })
          return points
        }
        roomPoints = collectPoints(room.group)
        const furniture = new THREE.Box3()
          .setFromObject(model)
          .union(new THREE.Box3().setFromObject(lamp))
        for (let i = 0; i < 8; i++) {
          roomPoints.push(
            new THREE.Vector3(
              i & 1 ? furniture.max.x : furniture.min.x,
              i & 2 ? furniture.max.y : furniture.min.y,
              i & 4 ? furniture.max.z : furniture.min.z
            )
          )
        }
        shelfPoints = collectPoints(shelf)
        resize()

        animate()
        setLoading(false)
      })

      // ms since the visitor switched to dark mode, or null
      const sinceDarkSwitch = () => {
        const change = refThemeSwitch.current
        if (!change || change.mode !== 'dark') return null
        return performance.now() - change.at
      }

      const lampFlicker = () => {
        const t = sinceDarkSwitch()
        if (t === null || t > FLICKER[FLICKER.length - 1]) return 1
        // Alternates on/off at each edge, starting on
        const edge = FLICKER.findIndex(e => t < e)
        return edge % 2 === 0 ? 1 : 0.15
      }

      // Perrito glances up at the lamp after any theme switch: 0..1
      const glance = () => {
        const change = refThemeSwitch.current
        if (!change) return 0
        const t = performance.now() - change.at
        const end = GLANCE.in + GLANCE.hold + GLANCE.out
        if (t > end) return 0
        if (t < GLANCE.in) return smoothstep(t / GLANCE.in)
        if (t < GLANCE.in + GLANCE.hold) return 1
        return smoothstep((end - t) / GLANCE.out)
      }

      const updateLights = () => {
        const lights = refLights.current
        const targetValues = refLightTarget.current
        for (const key of Object.keys(lights)) {
          const light = lights[key]
          light.color.lerp(new THREE.Color(targetValues[key].color), 0.08)
          if (key === 'lamp') continue
          light.intensity +=
            (targetValues[key].intensity - light.intensity) * 0.08
        }
        // Lamp: comes up quickly, cools down slowly like a filament, and
        // flickers a few times when the visitor switches to dark mode
        const lampRate = (target, now) => (target > now ? 0.08 : 0.05)
        lampLevel +=
          (targetValues.lamp.intensity - lampLevel) *
          lampRate(targetValues.lamp.intensity, lampLevel)
        glowLevel +=
          (targetValues.lampGlow - glowLevel) *
          lampRate(targetValues.lampGlow, glowLevel)
        const flicker = lampFlicker()
        lights.lamp.intensity = lampLevel * flicker
        if (lampShadeMaterial) {
          const glow = glowLevel * flicker
          lampShadeMaterial.emissiveIntensity = glow
          lampBulbMaterial.emissiveIntensity = 0.3 + glow * 2
          lampHalo.material.opacity = glow * 0.6
        }
        refRenderer.current.toneMappingExposure +=
          (targetValues.exposure - refRenderer.current.toneMappingExposure) *
          0.08
        lampFill.color.copy(lights.lamp.color)
        lampFill.intensity = lights.lamp.intensity * LAMP_FILL
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
      const updateSleep = time => {
        if (!zOrigin) return
        // Ease so the lid starts and ends its swing gently
        const eased = sleepLevel * sleepLevel * (3 - 2 * sleepLevel)
        if (lidPart) lidPart.rotation.x = (-Math.PI / 2) * eased
        if (screenLight) {
          // Screen lights the face in the dark, switches off with the lid
          const glow = 0.25 + (refLightTarget.current.lampGlow || 0) * 1.2
          screenLight.intensity = glow * (1 - eased)
          // His editor follows the site theme: white glow in light mode,
          // dim blue in dark mode
          screenLight.color.lerp(
            refColorMode.current === 'dark' ? SCREEN_DARK : SCREEN_LIGHT,
            0.05
          )
        }
        for (let i = 0; i < zSprites.length; i++) {
          const sprite = zSprites[i]
          const t = (time * 0.004 + i / zSprites.length) % 1
          sprite.visible = sleepLevel > 0.01
          if (!sprite.visible) continue
          sprite.position.set(
            zOrigin.x + t * zScale * 0.22 + Math.sin(t * 6 + i) * zScale * 0.02,
            zOrigin.y + t * zScale * 0.32,
            zOrigin.z
          )
          // Small and soft, fading out before they leave the room
          sprite.scale.setScalar(zScale * (0.08 + t * 0.1))
          sprite.material.rotation = Math.sin(t * 4 + i) * 0.25
          sprite.material.opacity = Math.sin(Math.PI * t) * 0.8 * sleepLevel
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
        const tap = phase =>
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
          // Glance up towards the lamp (his left, +x) after a theme switch
          const look = glance() * awake
          rx -= 0.15 * look
          ry += 0.45 * look
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
      const updateSky = time => {
        if (!skyMaterial) return
        const sky = refLightTarget.current.sky
        const u = skyMaterial.uniforms
        u.uTime.value = time
        placeLevel += (place - placeLevel) * 0.04
        u.uPlace.value = placeLevel
        if (!sky) return
        u.uTop.value.setHex(sky.top)
        u.uBottom.value.setHex(sky.bottom)
        u.uDiscColor.value.setHex(sky.discColor)
        u.uDisc.value.set(sky.disc[0], sky.disc[1])
        u.uDiscSize.value = sky.discSize
        u.uNight.value = sky.night
      }

      // Monstera leaves sway very gently
      // Stop-to-go: the second hand sweeps round in 58.5 s, waits at 12,
      // and the minute hand jumps when the full minute starts
      const updateClock = () => {
        if (!clock) return
        const now = placeNow(clockOffset)
        const seconds = now.getUTCSeconds() + now.getUTCMilliseconds() / 1000
        const minutes = now.getUTCMinutes()
        const hours = (now.getUTCHours() % 12) + minutes / 60
        const turn = -Math.PI * 2 // clockwise
        clock.second.rotation.z = turn * Math.min(seconds / 58.5, 1)
        clock.minute.rotation.z = (turn * minutes) / 60
        clock.hour.rotation.z = (turn * hours) / 12
      }

      const updatePlant = time => {
        if (!plantLeaves) return
        plantLeaves.rotation.z = Math.sin(time * 0.012) * 0.03
        plantLeaves.rotation.x = Math.sin(time * 0.009 + 1) * 0.02
      }

      // Follow the lamp's glow; after a switch to dark mode they come on
      // one by one along the string
      const updateFairyLights = time => {
        const night = glowLevel
        const since = sinceDarkSwitch()
        fairyBulbs.forEach((bulb, i) => {
          const on =
            since === null
              ? 1
              : THREE.MathUtils.clamp(
                  (since - CASCADE.start - i * CASCADE.step) / CASCADE.fade,
                  0,
                  1
                )
          const lit = night * on
          const twinkle = 0.7 + 0.3 * Math.sin(time * 0.035 + bulb.phase)
          bulb.material.emissiveIntensity = (0.2 + lit * 0.75) * twinkle
          bulb.halo.opacity = lit * 0.55 * twinkle
        })
      }

      const updateDust = time => {
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

      // The open topic's book slides out of the shelf towards the room
      // Pull out the open post's book, or every book of the chosen topic
      const updateBooks = () => {
        for (const book of books) {
          const active =
            book.slug === refPost.current ||
            (refTopic.current && book.topic === refTopic.current)
          const out = active ? book.pullOut : 0
          book.mesh.position.z +=
            (book.restZ + out - book.mesh.position.z) * 0.12
        }
      }

      let req = null
      // Reduced motion: no intro swing, start on the hero angle
      let frame = reduceMotion ? 101 : 0
      let tick = 0 // every rendered frame (frame stops counting after the intro)
      const animate = () => {
        req = requestAnimationFrame(animate)

        frame = frame <= 100 ? frame + 1 : frame
        if (glide) updateGlide(performance.now())

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
          if (frame === 101) {
            frame++
            hotspots.setEnabled(true)
          }
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
        updateClock()
        updateDog(performance.now(), time)
        updateBooks()

        tick++
        if (tick % SHADOW_EVERY === 1) renderer.shadowMap.needsUpdate = true
        renderer.render(scene, camera)
      }

      return () => {
        cancelAnimationFrame(req)
        hotspots.dispose()
        renderer.domElement.remove()
        renderer.dispose()
      }
    }
  }, [])

  // A new page re-frames the camera: room or bookshelf, beside the panel
  useEffect(() => {
    refFocus.current = focus
    refPanelWidth.current = panelWidth
    refHero.current = hero
    if (refUpdateView.current) refUpdateView.current()
  }, [focus, panelWidth, hero])

  useEffect(() => {
    refTopic.current = activeTopic
    refPost.current = activePost
  }, [activeTopic, activePost])

  // Canvas follows the window size
  useEffect(() => {
    const observer = new ResizeObserver(handleResize)
    observer.observe(refContainer.current)
    return () => observer.disconnect()
  }, [handleResize])

  return (
    <DogContainer ref={refContainer}>
      {loading && <DogSpinner />}
      <Box
        ref={refLabel}
        display="none"
        position="absolute"
        transform="translateX(-50%)"
        px={2}
        py={1}
        borderRadius="md"
        fontSize="sm"
        fontWeight="semibold"
        whiteSpace="nowrap"
        pointerEvents="none"
        zIndex={1}
        bg={labelBg}
        color={labelColor}
      />
    </DogContainer>
  )
}

export default VoxelDog
