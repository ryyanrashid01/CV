import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Environment, Lightformer } from "@react-three/drei"
import { IconPlayerPause, IconPlayerPlay } from "@tabler/icons-react"
import * as THREE from "three"

import { Button } from "@/components/ui/button"

const UP = new THREE.Vector3(0, 1, 0)

function useReducedMotionPreference() {
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window === "undefined"
      ? false
      : window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  )

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    const updatePreference = (event) => setReducedMotion(event.matches)

    query.addEventListener("change", updatePreference)
    return () => query.removeEventListener("change", updatePreference)
  }, [])

  return reducedMotion
}

function buildTopology() {
  const geometry = new THREE.IcosahedronGeometry(2.05, 1)
  const positions = geometry.getAttribute("position")
  const vertexMap = new Map()
  const vertices = []
  const edges = new Map()

  const getVertexIndex = (offset) => {
    const vertex = new THREE.Vector3().fromBufferAttribute(positions, offset)
    const key = `${vertex.x.toFixed(4)}:${vertex.y.toFixed(4)}:${vertex.z.toFixed(4)}`

    if (!vertexMap.has(key)) {
      vertexMap.set(key, vertices.length)
      vertices.push(vertex)
    }

    return vertexMap.get(key)
  }

  for (let index = 0; index < positions.count; index += 3) {
    const triangle = [
      getVertexIndex(index),
      getVertexIndex(index + 1),
      getVertexIndex(index + 2),
    ]

    for (const [start, end] of [
      [triangle[0], triangle[1]],
      [triangle[1], triangle[2]],
      [triangle[2], triangle[0]],
    ]) {
      const key = start < end ? `${start}:${end}` : `${end}:${start}`
      if (!edges.has(key)) edges.set(key, [vertices[start], vertices[end]])
    }
  }

  return { edges: [...edges.values()], geometry, vertices }
}

function SignalPulse({ cycle, edges, offset, paused, stride }) {
  const pulse = useRef(null)
  const elapsed = useRef(0)
  const position = useMemo(() => new THREE.Vector3(), [])

  useFrame((_, delta) => {
    if (!pulse.current) return
    if (paused) {
      pulse.current.visible = false
      return
    }

    elapsed.current += Math.min(delta, 0.05)
    const sequenceTime = elapsed.current + offset
    const phase = sequenceTime % cycle
    const activeDuration = 1.25

    if (phase > activeDuration) {
      pulse.current.visible = false
      return
    }

    const sequence = Math.floor(sequenceTime / cycle)
    const edge = edges[(sequence * stride + stride) % edges.length]
    const progress = phase / activeDuration

    position.lerpVectors(edge[0], edge[1], progress)
    pulse.current.position.copy(position)
    pulse.current.scale.setScalar(0.62 + Math.sin(progress * Math.PI) * 0.58)
    pulse.current.visible = true
  })

  return (
    <mesh ref={pulse} visible={false}>
      <sphereGeometry args={[0.052, 12, 12]} />
      <meshBasicMaterial color="#b7f538" toneMapped={false} />
    </mesh>
  )
}

function VertexNode({ polyhedron, scanY, vertex }) {
  const node = useRef(null)
  const activationShell = useRef(null)
  const transformedVertex = useMemo(() => new THREE.Vector3(), [])

  useFrame(() => {
    if (!node.current || !activationShell.current || !polyhedron.current) return

    transformedVertex.copy(vertex).applyQuaternion(polyhedron.current.quaternion)
    const distance = Math.abs(transformedVertex.y - scanY.current)
    const activation = 1 - THREE.MathUtils.clamp((distance - 0.025) / 0.3, 0, 1)

    node.current.scale.setScalar(0.9 + activation * 0.24)
    activationShell.current.visible = activation > 0.025
    activationShell.current.scale.setScalar(0.96 + activation * 0.38)
    activationShell.current.material.opacity = activation * 0.92
  })

  return (
    <group position={vertex}>
      <mesh ref={node}>
        <sphereGeometry args={[0.043, 12, 12]} />
        <meshStandardMaterial color="#858c88" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh ref={activationShell} visible={false}>
        <sphereGeometry args={[0.049, 12, 12]} />
        <meshBasicMaterial
          color="#b7f538"
          depthWrite={false}
          toneMapped={false}
          transparent
        />
      </mesh>
    </group>
  )
}

function PolyhedronMechanism({ paused }) {
  const polyhedron = useRef(null)
  const edgeInstances = useRef(null)
  const scanner = useRef(null)
  const scanY = useRef(0)
  const elapsed = useRef(0)
  const topology = useMemo(() => buildTopology(), [])
  const edgeTransform = useMemo(() => new THREE.Object3D(), [])
  const midpoint = useMemo(() => new THREE.Vector3(), [])
  const direction = useMemo(() => new THREE.Vector3(), [])

  useLayoutEffect(() => {
    if (!edgeInstances.current) return

    topology.edges.forEach(([start, end], index) => {
      midpoint.lerpVectors(start, end, 0.5)
      direction.subVectors(end, start)
      edgeTransform.position.copy(midpoint)
      edgeTransform.quaternion.setFromUnitVectors(UP, direction.clone().normalize())
      edgeTransform.scale.set(0.012, direction.length(), 0.012)
      edgeTransform.updateMatrix()
      edgeInstances.current.setMatrixAt(index, edgeTransform.matrix)
    })

    edgeInstances.current.instanceMatrix.needsUpdate = true
  }, [direction, edgeTransform, midpoint, topology.edges])

  useEffect(() => () => topology.geometry.dispose(), [topology.geometry])

  useFrame((_, delta) => {
    if (!polyhedron.current || !scanner.current) return

    if (!paused) elapsed.current += Math.min(delta, 0.05)
    const time = elapsed.current
    scanY.current = Math.sin(time * 0.68) * 1.72
    const scanRadius = Math.sqrt(Math.max(0.55, 2.05 ** 2 - scanY.current ** 2))

    polyhedron.current.rotation.set(
      0.22 + Math.sin(time * 0.18) * 0.07,
      -0.38 + time * 0.11,
      -0.13 + Math.sin(time * 0.23) * 0.05,
    )
    scanner.current.position.y = scanY.current
    scanner.current.scale.set(scanRadius, 1, scanRadius)
  })

  return (
    <group scale={1.08}>
      <group ref={polyhedron}>
        <mesh geometry={topology.geometry}>
          <meshPhysicalMaterial
            color="#242a27"
            depthWrite={false}
            metalness={0.82}
            opacity={0.02}
            roughness={0.28}
            side={THREE.DoubleSide}
            transparent
          />
        </mesh>
        <instancedMesh args={[null, null, topology.edges.length]} ref={edgeInstances}>
          <cylinderGeometry args={[1, 1, 1, 8, 1, true]} />
          <meshStandardMaterial
            color="#7b827e"
            emissive="#171b19"
            emissiveIntensity={0.55}
            metalness={0.9}
            roughness={0.24}
          />
        </instancedMesh>
        {topology.vertices.map((vertex) => (
          <VertexNode
            key={`${vertex.x}:${vertex.y}:${vertex.z}`}
            polyhedron={polyhedron}
            scanY={scanY}
            vertex={vertex}
          />
        ))}
        <SignalPulse cycle={5.7} edges={topology.edges} offset={0.2} paused={paused} stride={7} />
        <SignalPulse cycle={7.4} edges={topology.edges} offset={3.1} paused={paused} stride={11} />
      </group>

      <group ref={scanner}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1, 72]} />
          <meshBasicMaterial
            color="#b7f538"
            depthWrite={false}
            opacity={0.035}
            side={THREE.DoubleSide}
            toneMapped={false}
            transparent
          />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.982, 1, 96]} />
          <meshBasicMaterial
            color="#b7f538"
            depthWrite={false}
            opacity={0.42}
            side={THREE.DoubleSide}
            toneMapped={false}
            transparent
          />
        </mesh>
      </group>
    </group>
  )
}

function PolyhedronScene({ paused }) {
  return (
    <>
      <ambientLight intensity={0.54} />
      <directionalLight intensity={2.7} position={[4.5, 5.5, 5]} />
      <pointLight color="#b7f538" intensity={0.34} position={[-3.2, -0.3, 2.5]} />
      <PolyhedronMechanism paused={paused} />
      <Environment resolution={128}>
        <Lightformer
          form="rect"
          intensity={4.2}
          position={[0, 4, -4]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[5, 5, 1]}
        />
        <Lightformer
          form="rect"
          intensity={2.4}
          position={[-4, 1, 2]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[3, 2, 1]}
        />
        <Lightformer
          form="rect"
          intensity={1.8}
          position={[4, -1, 1]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={[2, 3, 1]}
        />
      </Environment>
    </>
  )
}

export default function HeroPolyhedron({ fallbackSrc }) {
  const container = useRef(null)
  const reducedMotion = useReducedMotionPreference()
  const [manualPause, setManualPause] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [pageVisible, setPageVisible] = useState(() =>
    typeof document === "undefined" ? true : document.visibilityState === "visible",
  )

  useEffect(() => {
    if (!container.current || !("IntersectionObserver" in window)) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { rootMargin: "120px" },
    )

    observer.observe(container.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const updateVisibility = () => setPageVisible(document.visibilityState === "visible")
    document.addEventListener("visibilitychange", updateVisibility)
    return () => document.removeEventListener("visibilitychange", updateVisibility)
  }, [])

  const paused = manualPause || reducedMotion || !isVisible || !pageVisible

  return (
    <div className="group relative h-full w-full overflow-visible" ref={container}>
      <div
        aria-label="Rotating three-dimensional wireframe polyhedron with a horizontal scanning plane and traveling edge signals"
        className="absolute inset-0"
        role="img"
      >
        <Canvas
          camera={{ fov: 35, near: 0.1, far: 100, position: [0.4, 0.2, 7.5] }}
          className="pointer-events-none absolute inset-0"
          dpr={[1, 1.5]}
          fallback={
            <img
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-contain"
              height="1024"
              src={fallbackSrc}
              width="1536"
            />
          }
          frameloop={paused ? "demand" : "always"}
          gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
          onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
          style={{ position: "absolute", inset: 0 }}
        >
          <PolyhedronScene paused={paused} />
        </Canvas>
      </div>
      <Button
        aria-label={
          reducedMotion
            ? "Motion disabled by system preference"
            : manualPause
              ? "Play polyhedron animation"
              : "Pause polyhedron animation"
        }
        aria-pressed={paused}
        className="absolute right-1 bottom-1 z-20 size-11 border-0 bg-transparent text-muted-foreground opacity-35 shadow-none transition-opacity hover:bg-transparent hover:text-foreground hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-[#b7f538] sm:opacity-0 sm:group-hover:opacity-55"
        disabled={reducedMotion}
        onClick={() => setManualPause((current) => !current)}
        size="icon"
        title={
          reducedMotion
            ? "Motion disabled by system preference"
            : manualPause
              ? "Play animation"
              : "Pause animation"
        }
        variant="ghost"
      >
        {paused ? (
          <IconPlayerPlay aria-hidden="true" stroke={1.75} />
        ) : (
          <IconPlayerPause aria-hidden="true" stroke={1.75} />
        )}
      </Button>
    </div>
  )
}
