"use client"

import { useRef } from "react"
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react"

export function CometCard({
  children,
  className,
  disabled = false,
  glareOpacity = 0.08,
  hoverScale = 1.008,
  rotateDepth = 4,
  showGlare = false,
  translateDepth = 4,
}) {
  const ref = useRef(null)
  const reduceMotion = useReducedMotion()
  const motionDisabled = disabled || reduceMotion
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const mouseXSpring = useSpring(x, { damping: 22, mass: 0.4, stiffness: 120 })
  const mouseYSpring = useSpring(y, { damping: 22, mass: 0.4, stiffness: 120 })
  const rotateX = useTransform(
    mouseYSpring,
    [-0.5, 0.5],
    [`-${rotateDepth}deg`, `${rotateDepth}deg`],
  )
  const rotateY = useTransform(
    mouseXSpring,
    [-0.5, 0.5],
    [`${rotateDepth}deg`, `-${rotateDepth}deg`],
  )
  const translateX = useTransform(
    mouseXSpring,
    [-0.5, 0.5],
    [`-${translateDepth}px`, `${translateDepth}px`],
  )
  const translateY = useTransform(
    mouseYSpring,
    [-0.5, 0.5],
    [`${translateDepth}px`, `-${translateDepth}px`],
  )
  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], [0, 100])
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], [0, 100])
  const glareBackground = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.75), transparent 70%)`

  const handleMouseMove = (event) => {
    if (!ref.current || motionDisabled) return
    const bounds = ref.current.getBoundingClientRect()
    x.set((event.clientX - bounds.left) / bounds.width - 0.5)
    y.set((event.clientY - bounds.top) / bounds.height - 0.5)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <div className={className} style={{ perspective: "1200px" }}>
      <motion.div
        className="relative"
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        ref={ref}
        style={{
          rotateX: motionDisabled ? 0 : rotateX,
          rotateY: motionDisabled ? 0 : rotateY,
          transformStyle: "preserve-3d",
          translateX: motionDisabled ? 0 : translateX,
          translateY: motionDisabled ? 0 : translateY,
        }}
        whileHover={
          motionDisabled
            ? undefined
            : { scale: hoverScale, transition: { duration: 0.25 } }
        }
      >
        {children}
        {showGlare && !motionDisabled ? (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[inherit] mix-blend-overlay"
            style={{ background: glareBackground, opacity: glareOpacity }}
          />
        ) : null}
      </motion.div>
    </div>
  )
}
