import { Canvas, useFrame } from '@react-three/fiber'
import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import {
  AdditiveBlending,
  BufferAttribute,
  Color,
  InstancedBufferAttribute,
  InstancedMesh,
  MathUtils,
  MeshBasicMaterial,
  Object3D,
  SphereGeometry,
  Vector3,
} from 'three'
import type { BufferGeometry } from 'three'

export interface ChristmasLightsProps {
  lightCount?: number
  strandCount?: number
  strandSpacing?: number
  bulbColors?: string[]
  bulbSize?: number
  bulbSpacing?: number
  dropLength?: number
  windStrength?: number
  gravitySag?: number
  cordTension?: number
  glowIntensity?: number
  glowRadius?: number
  glassOpacity?: number
  swaySpeed?: number
  time?: number
  cordColor?: string
  socketColor?: string
  enablePointLights?: boolean
  enableGlowMesh?: boolean
  position?: [number, number, number]
  rotation?: [number, number, number]
  width?: number
  /** CSS properties forwarded to the Canvas wrapper container */
  style?: React.CSSProperties
}

const DEFAULT_COLORS = ['#ef4444', '#22c55e', '#facc15', '#38bdf8', '#f97316']
const scratch = new Vector3()
const dummy = new Object3D()
const colorScratch = new Color()

function clamp01(value: number) {
  return MathUtils.clamp(value, 0, 1)
}

function ChristmasLightsInner({
  lightCount = 24,
  strandCount = 9,
  strandSpacing = 0.6,
  bulbColors = DEFAULT_COLORS,
  bulbSize = 0.045,
  bulbSpacing = 0.18,
  dropLength,
  windStrength = 0.24,
  gravitySag = 0.9,
  cordTension = 0.42,
  glowIntensity = 1.4,
  glowRadius = 2.8,
  swaySpeed = 0.75,
  time,
  cordColor = '#181f18',
  enableGlowMesh = true,
  position = [0, 2, 0],
  rotation = [0, 0, 0],
  width,
}: ChristmasLightsProps) {
  const count = Math.max(1, Math.floor(lightCount))
  const strands = Math.max(1, Math.floor(strandCount))
  const totalLights = count * strands
  const totalDrop = Math.max(bulbSpacing, dropLength ?? Math.max(bulbSpacing, count * bulbSpacing * 0.72))
  const wireSegments = Math.max(28, count * 3)
  const coreMeshRef = useRef<InstancedMesh>(null)
  const haloMeshRef = useRef<InstancedMesh>(null)
  const cordGeometryRefs = useRef<BufferGeometry[]>([])

  const cordPositions = useMemo(
    () => Array.from({ length: strands }, () => new Float32Array((wireSegments + 1) * 3)),
    [strands, wireSegments],
  )

  const colorSequence = useMemo(
    () => (bulbColors.length > 0 ? bulbColors : DEFAULT_COLORS).map((value) => new Color(value)),
    [bulbColors],
  )

  const coreMesh = useMemo(() => {
    const geo = new SphereGeometry(1, 10, 8)
    const ca = new Float32Array(geo.attributes.position.count * 3)
    ca.fill(1)
    geo.setAttribute('color', new BufferAttribute(ca, 3))
    const mat = new MeshBasicMaterial({ vertexColors: true })
    const mesh = new InstancedMesh(geo, mat, totalLights)
    const ic = new InstancedBufferAttribute(new Float32Array(totalLights * 3), 3)
    ic.array.fill(1)
    ic.needsUpdate = true
    mesh.instanceColor = ic
    mesh.frustumCulled = false
    return mesh
  }, [totalLights])

  const haloMesh = useMemo(() => {
    const geo = new SphereGeometry(1, 8, 6)
    const ca = new Float32Array(geo.attributes.position.count * 3)
    ca.fill(1)
    geo.setAttribute('color', new BufferAttribute(ca, 3))
    const mat = new MeshBasicMaterial({
      vertexColors: true,
      blending: AdditiveBlending,
      transparent: true,
      depthWrite: false,
      opacity: MathUtils.clamp(glowIntensity * 0.42, 0.22, 0.85),
    })
    const mesh = new InstancedMesh(geo, mat, totalLights)
    const ic = new InstancedBufferAttribute(new Float32Array(totalLights * 3), 3)
    ic.array.fill(0.6)
    ic.needsUpdate = true
    mesh.instanceColor = ic
    mesh.frustumCulled = false
    return mesh
  }, [glowIntensity, totalLights])

  const getStrandPoint = useCallback(
    (strandIndex: number, t: number, seconds: number, target: Vector3) => {
      const tension = clamp01(cordTension)
      const centered = strandIndex - (strands - 1) / 2
      const phase = strandIndex * 0.93
      const direction = strandIndex % 2 === 0 ? 1 : -1
      const baseSpan = width ?? Math.max(1.45, count * bulbSpacing * 0.66) * (1 + (strandIndex % 4) * 0.075)
      const skew = direction * strandSpacing * (0.28 + (strandIndex % 3) * 0.06)
      const centerX = centered * strandSpacing * 0.72 + Math.sin(strandIndex * 1.41) * 0.12
      const startX = centerX - baseSpan * 0.5 - skew
      const endX = centerX + baseSpan * 0.5 + skew
      const startY = 0.9 + Math.sin(strandIndex * 1.77) * 0.1
      const endY = 0.84 + Math.cos(strandIndex * 1.19) * 0.13
      const layerZ = ((strandIndex % 5) - 2) * 0.07
      const arc = Math.sin(Math.PI * t)
      const sag =
        totalDrop * (0.34 + (1 - tension) * 0.25) * (0.84 + Math.sin(strandIndex * 2.17) * 0.1) +
        gravitySag * 0.32
      const breeze =
        Math.sin(seconds * swaySpeed + phase + t * 2.4) *
        windStrength *
        (0.018 + arc * 0.085) *
        (1 - tension * 0.66)
      const depthBreeze =
        Math.cos(seconds * swaySpeed * 0.72 + phase + t * 3.1) *
        windStrength *
        (0.014 + arc * 0.04) *
        (1 - tension * 0.72)

      target.set(
        MathUtils.lerp(startX, endX, t) + breeze,
        MathUtils.lerp(startY, endY, t) - sag * arc,
        layerZ + depthBreeze + Math.sin(t * Math.PI * 2 + phase) * 0.018,
      )

      return target
    },
    [
      bulbSpacing,
      cordTension,
      count,
      gravitySag,
      strands,
      strandSpacing,
      swaySpeed,
      totalDrop,
      windStrength,
      width,
    ],
  )

  const renderAt = useCallback(
    (seconds: number) => {
      for (let strandIndex = 0; strandIndex < strands; strandIndex += 1) {
        const positions = cordPositions[strandIndex]
        for (let segmentIndex = 0; segmentIndex <= wireSegments; segmentIndex += 1) {
          getStrandPoint(strandIndex, segmentIndex / wireSegments, seconds, scratch)
          positions[segmentIndex * 3] = scratch.x
          positions[segmentIndex * 3 + 1] = scratch.y
          positions[segmentIndex * 3 + 2] = scratch.z
        }

        const geometry = cordGeometryRefs.current[strandIndex]
        const posAttr = geometry?.attributes.position
        if (posAttr) {
          posAttr.needsUpdate = true
        }

        for (let bulbIndex = 0; bulbIndex < count; bulbIndex += 1) {
          const flatIndex = strandIndex * count + bulbIndex
          const t = count === 1 ? 0.5 : (bulbIndex + 0.5) / count
          const lowerWeight = Math.sin(Math.PI * t)
          const pulse =
            0.88 +
            Math.sin(seconds * 1.4 + strandIndex * 1.17 + bulbIndex * 0.61) *
              0.08 *
              MathUtils.clamp(glowIntensity, 0.5, 2.2)
          const scale = bulbSize * (0.82 + lowerWeight * 0.28) * pulse

          getStrandPoint(strandIndex, t, seconds, scratch)

          dummy.position.copy(scratch)
          dummy.scale.setScalar(scale)
          dummy.updateMatrix()
          coreMesh.setMatrixAt(flatIndex, dummy.matrix)
          colorScratch
            .copy(colorSequence[flatIndex % colorSequence.length])
            .multiplyScalar(Math.max(1, glowIntensity))
          coreMesh.setColorAt(flatIndex, colorScratch)

          if (enableGlowMesh) {
            dummy.position.copy(scratch)
            dummy.scale.setScalar(scale * glowRadius)
            dummy.updateMatrix()
            haloMesh.setMatrixAt(flatIndex, dummy.matrix)
            haloMesh.setColorAt(flatIndex, colorSequence[flatIndex % colorSequence.length])
          }
        }
      }

      coreMesh.instanceMatrix.needsUpdate = true
      if (coreMesh.instanceColor) {
        coreMesh.instanceColor.needsUpdate = true
      }

      if (enableGlowMesh) {
        haloMesh.instanceMatrix.needsUpdate = true
        if (haloMesh.instanceColor) {
          haloMesh.instanceColor.needsUpdate = true
        }
      }
    },
    [
      cordPositions,
      colorSequence,
      count,
      coreMesh,
      haloMesh,
      enableGlowMesh,
      getStrandPoint,
      glowIntensity,
      glowRadius,
      strands,
      wireSegments,
      bulbSize,
    ],
  )

  useEffect(() => {
    coreMeshRef.current = coreMesh
    haloMeshRef.current = haloMesh
    renderAt(time ?? 0)
  }, [coreMesh, haloMesh, renderAt, time])

  useFrame(({ clock }) => {
    if (time === undefined) {
      renderAt(clock.getElapsedTime())
    }
  })

  return (
    <group position={position} rotation={rotation}>
      {Array.from({ length: strands }, (_, strandIndex) => (
        <line key={strandIndex}>
          <bufferGeometry
            ref={(node) => {
              if (node) {
                cordGeometryRefs.current[strandIndex] = node as BufferGeometry
              }
            }}
          >
            <bufferAttribute attach="attributes-position" args={[cordPositions[strandIndex], 3]} />
          </bufferGeometry>
          <lineBasicMaterial color={cordColor} transparent opacity={0.82} />
        </line>
      ))}

      {enableGlowMesh ? <primitive object={haloMesh} /> : null}
      <primitive object={coreMesh} />
    </group>
  )
}

export function ChristmasLights({ style, ...props }: ChristmasLightsProps) {
  return (
    <div
      aria-hidden="true"
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', ...style }}
    >
      <Canvas
        camera={{ position: [0, 1.2, 4.5], fov: 42 }}
        gl={{ alpha: true, antialias: true }}
        onCreated={({ gl }) => gl.setClearAlpha(0)}
      >
        <ChristmasLightsInner {...props} />
      </Canvas>
    </div>
  )
}
