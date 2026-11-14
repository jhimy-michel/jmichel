import * as THREE from 'three'

// Clickable objects in Perrito's room. Register objects with `add`; hover
// reports the spot under the mouse, a click (not a drag) picks it.
// Rays hit the whole scene so the dog's head still blocks the laptop behind it.
const CLICK_SLOP = 6 // px a pointer may move and still count as a click

const isShown = object => {
  for (let o = object; o; o = o.parent) if (!o.visible) return false
  return true
}

export function createHotspots({ scene, camera, dom, onHover, onPick }) {
  const spots = []
  const raycaster = new THREE.Raycaster()
  const pointer = new THREE.Vector2()
  let hovered = null
  let downAt = null
  let enabled = false

  const spotAt = event => {
    const rect = dom.getBoundingClientRect()
    pointer.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    )
    raycaster.setFromCamera(pointer, camera)
    const hit = raycaster
      .intersectObjects(scene.children, true)
      .find(h => h.object.isMesh && isShown(h.object))
    if (!hit) return null
    for (let o = hit.object; o; o = o.parent) {
      const spot = spots.find(s => s.object === o)
      if (spot) return spot
    }
    return null
  }

  const setHovered = (spot, event) => {
    hovered = spot
    dom.style.cursor = spot?.href || spot?.action ? 'pointer' : ''
    const rect = dom.getBoundingClientRect()
    onHover(
      spot,
      event && event.clientX - rect.left,
      event && event.clientY - rect.top
    )
  }

  // Mice fire many moves per frame: test the scene at most once a frame
  let pendingMove = null
  const handleMove = event => {
    if (!enabled || event.pointerType !== 'mouse' || event.buttons) return
    if (!pendingMove) {
      requestAnimationFrame(() => {
        const latest = pendingMove
        pendingMove = null
        if (enabled) setHovered(spotAt(latest), latest)
      })
    }
    pendingMove = event
  }
  const handleDown = event => {
    downAt = { x: event.clientX, y: event.clientY }
  }
  const handleUp = event => {
    if (!enabled || !downAt) return
    const moved = Math.hypot(event.clientX - downAt.x, event.clientY - downAt.y)
    downAt = null
    if (moved > CLICK_SLOP) return
    const spot = spotAt(event)
    if (spot) onPick(spot, event)
  }
  const handleLeave = () => {
    if (hovered) setHovered(null)
  }

  dom.addEventListener('pointermove', handleMove)
  dom.addEventListener('pointerdown', handleDown)
  dom.addEventListener('pointerup', handleUp)
  dom.addEventListener('pointerleave', handleLeave)

  return {
    // label: text or a function returning it. A spot opens `href` or,
    // instead, runs `action(event)` when clicked
    add(object, { label, href, external = false, action }) {
      if (object) spots.push({ object, label, href, external, action })
    },
    setEnabled(value) {
      enabled = value
      if (!value && hovered) setHovered(null)
    },
    dispose() {
      dom.removeEventListener('pointermove', handleMove)
      dom.removeEventListener('pointerdown', handleDown)
      dom.removeEventListener('pointerup', handleUp)
      dom.removeEventListener('pointerleave', handleLeave)
    }
  }
}
