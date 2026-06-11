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

  useEffect(() => {
    refLightTarget.current = LIGHTS[colorMode] || LIGHTS.dark
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
      container.appendChild(renderer.domElement)
      refRenderer.current = renderer

      const scene = new THREE.Scene()

      const target = new THREE.Vector3(-0.5, 1.2, 0)
      const initialCameraPosition = new THREE.Vector3(
        20 * Math.sin(0.2 * Math.PI),
        10,
        20 * Math.cos(0.2 * Math.PI)
      )

      const scale = scH * 0.005 + 4.8
      const camera = new THREE.OrthographicCamera(
        -scale,
        scale,
        scale,
        -scale,
        0.01,
        50000
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
      directionalLight.position.set(5, 10, 5)
      scene.add(directionalLight)

      // Light source sits inside the floor lamp's shade (placed after load)
      const lampLight = new THREE.PointLight(
        initial.lamp.color,
        initial.lamp.intensity
      )
      lampLight.position.set(0, 4, 2)
      scene.add(lampLight)

      refLights.current = {
        ambient: ambientLight,
        directional: directionalLight,
        lamp: lampLight
      }

      let lampShadeMaterial = null
      let dustGeometry = null
      let dustMaterial = null
      let dustData = null
      let dustMinY = 0
      let dustMaxY = 0

      const controls = new OrbitControls(camera, renderer.domElement)
      controls.autoRotate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
      controls.autoRotateSpeed = 0.6
      controls.target = target

      loadGLTFModel(scene, urlDogGLB, {
        receiveShadow: false,
        castShadow: false
      }).then(model => {
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
          if (childBox.max.y - childBox.min.y < fullHeight * 0.05) {
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

        // Voxel rug spanning chair and lamp: teal border, pale teal center
        const rugThickness = size.y * 0.02
        const lampEdgeX = lamp.position.x + lampHeight * 0.15
        const rugWidth = (lampEdgeX - box.min.x) * 1.45
        const rugCenterX = (box.min.x + lampEdgeX) / 2
        const rugCenterZ = (box.min.z + box.max.z) / 2
        const rugOuter = new THREE.Mesh(
          new THREE.BoxGeometry(rugWidth, rugThickness, size.z * 1.6),
          new THREE.MeshStandardMaterial({ color: 0x1d5a66 })
        )
        rugOuter.position.set(
          rugCenterX,
          box.min.y - rugThickness / 2,
          rugCenterZ
        )
        const rugInner = new THREE.Mesh(
          new THREE.BoxGeometry(
            rugWidth * 0.85,
            rugThickness,
            size.z * 1.35
          ),
          new THREE.MeshStandardMaterial({ color: 0x7fb0ba })
        )
        rugInner.position.set(
          rugCenterX,
          box.min.y - rugThickness / 2 + rugThickness * 0.1,
          rugCenterZ
        )
        scene.add(rugOuter, rugInner)

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
            (targetValues.lampGlow - lampShadeMaterial.emissiveIntensity) *
            0.08
        }
        if (dustMaterial) {
          dustMaterial.opacity +=
            (targetValues.dust - dustMaterial.opacity) * 0.08
        }
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

      let req = null
      let frame = 0
      const animate = () => {
        req = requestAnimationFrame(animate)

        frame = frame <= 100 ? frame + 1 : frame

        if (frame <= 100) {
          const p = initialCameraPosition
          const rotSpeed = -easeOutCirc(frame / 120) * Math.PI * 20

          camera.position.y = 10
          camera.position.x =
            p.x * Math.cos(rotSpeed) + p.z * Math.sin(rotSpeed)
          camera.position.z =
            p.z * Math.cos(rotSpeed) - p.x * Math.sin(rotSpeed)
          camera.lookAt(target)
        } else {
          controls.update()
        }

        updateLights()
        updateDust(performance.now() / 16)

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
