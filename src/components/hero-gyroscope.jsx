import { useEffect, useMemo, useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Environment, Lightformer, OrbitControls } from "@react-three/drei"
import { IconPlayerPause, IconPlayerPlay } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"

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

function Bearing({ position, rotation }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow>
        <cylinderGeometry args={[0.17, 0.17, 0.34, 24]} />
        <meshStandardMaterial color="#303532" metalness={0.88} roughness={0.24} />
      </mesh>
      <mesh castShadow position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.1, 20]} />
        <meshStandardMaterial color="#a7aca8" metalness={0.92} roughness={0.18} />
      </mesh>
    </group>
  )
}

function MachinedRing({ radius, tube, tone }) {
  return (
    <group>
      <mesh castShadow receiveShadow>
        <torusGeometry args={[radius, tube, 10, 128]} />
        <meshStandardMaterial color={tone} metalness={0.9} roughness={0.25} />
      </mesh>
      <Bearing position={[radius, 0, 0]} rotation={[0, 0, Math.PI / 2]} />
      <Bearing position={[-radius, 0, 0]} rotation={[0, 0, Math.PI / 2]} />
    </group>
  )
}

function CentralCore() {
  return (
    <group>
      <mesh castShadow receiveShadow>
        <dodecahedronGeometry args={[0.7, 1]} />
        <meshStandardMaterial color="#171b19" flatShading metalness={0.72} roughness={0.34} />
      </mesh>
      <mesh castShadow>
        <torusGeometry args={[0.72, 0.045, 8, 96]} />
        <meshStandardMaterial color="#b7f538" emissive="#385600" emissiveIntensity={0.22} metalness={0.38} roughness={0.34} />
      </mesh>
      <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.075, 0.075, 1.82, 20]} />
        <meshStandardMaterial color="#747b77" metalness={0.94} roughness={0.2} />
      </mesh>
    </group>
  )
}

function GyroscopeMechanism({ paused }) {
  const outerRing = useRef(null)
  const middleRing = useRef(null)
  const innerRing = useRef(null)
  const core = useRef(null)

  useFrame((_, delta) => {
    if (paused) return

    const step = Math.min(delta, 0.05)
    outerRing.current.rotation.y += step * 0.16
    middleRing.current.rotation.x += step * 0.23
    innerRing.current.rotation.z -= step * 0.31
    core.current.rotation.y += step * 0.22
  })

  return (
    <group rotation={[0.08, -0.22, -0.08]} scale={1.03}>
      <group rotation={[0.16, 0.28, -0.12]}>
        <group ref={outerRing}>
          <MachinedRing radius={2.08} tone="#626965" tube={0.115} />
          <group rotation={[1.03, 0.18, 0.35]}>
            <group ref={middleRing}>
              <MachinedRing radius={1.63} tone="#929894" tube={0.095} />
              <group rotation={[0.64, 0.36, -0.24]}>
                <group ref={innerRing}>
                  <MachinedRing radius={1.19} tone="#4c5350" tube={0.085} />
                  <group ref={core}>
                    <CentralCore />
                  </group>
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  )
}

function GyroscopeScene({ paused }) {
  const polarLimits = useMemo(
    () => ({ min: Math.PI * 0.27, max: Math.PI * 0.73 }),
    [],
  )

  return (
    <>
      <ambientLight intensity={0.46} />
      <directionalLight
        castShadow
        intensity={2.8}
        position={[4.5, 5.5, 5]}
        shadow-bias={-0.0004}
        shadow-mapSize-height={1024}
        shadow-mapSize-width={1024}
      />
      <pointLight color="#b7f538" intensity={0.9} position={[-3.8, -0.5, 2.8]} />
      <GyroscopeMechanism paused={paused} />
      <Environment resolution={128}>
        <Lightformer
          form="rect"
          intensity={4}
          position={[0, 4, -4]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[5, 5, 1]}
        />
        <Lightformer
          form="rect"
          intensity={2.2}
          position={[-4, 1, 2]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[3, 2, 1]}
        />
        <Lightformer
          form="rect"
          intensity={1.5}
          position={[4, -1, 1]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={[2, 3, 1]}
        />
      </Environment>
      <OrbitControls
        autoRotate={!paused}
        autoRotateSpeed={0.55}
        enableDamping={!paused}
        enablePan={false}
        enableZoom={false}
        maxPolarAngle={polarLimits.max}
        minPolarAngle={polarLimits.min}
      />
    </>
  )
}

export default function HeroGyroscope({ fallbackSrc }) {
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
  const motionDisabled = reducedMotion

  return (
    <div
      className="group relative h-full w-full overflow-visible"
      ref={container}
    >
      <div
        aria-label="Interactive three-dimensional mechanical gyroscope representing layered software systems"
        className="absolute inset-0"
        role="img"
      >
        <Canvas
          camera={{ fov: 36, near: 0.1, far: 100, position: [4.7, 2.5, 7.1] }}
          className="absolute inset-0"
          dpr={[1, 1.5]}
          fallback={
            <img
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-contain"
              height="1025"
              src={fallbackSrc}
              width="1535"
            />
          }
          frameloop={paused ? "demand" : "always"}
          gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
          onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
          style={{ position: "absolute", inset: 0, touchAction: "pan-y" }}
        >
          <GyroscopeScene paused={paused} />
        </Canvas>
      </div>
      <Button
        aria-label={
          motionDisabled
            ? "Motion disabled by system preference"
            : manualPause
              ? "Play gyroscope animation"
              : "Pause gyroscope animation"
        }
        aria-pressed={paused}
        className="absolute right-1 bottom-1 z-20 size-11 border-0 bg-transparent text-muted-foreground opacity-35 shadow-none transition-opacity hover:bg-transparent hover:text-foreground hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-[#b7f538] sm:opacity-0 sm:group-hover:opacity-55"
        disabled={motionDisabled}
        onClick={() => setManualPause((current) => !current)}
        size="icon"
        title={
          motionDisabled
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
