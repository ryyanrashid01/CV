"use client"

import { useEffect, useRef, useState } from "react"
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react"

import { cn } from "@/lib/utils"

export function TracingBeam({ children, className }) {
  const ref = useRef(null)
  const contentRef = useRef(null)
  const [svgHeight, setSvgHeight] = useState(0)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 70%", "end 35%"],
  })

  useEffect(() => {
    if (!contentRef.current) return undefined

    const updateHeight = () => setSvgHeight(contentRef.current?.offsetHeight ?? 0)
    updateHeight()

    const observer = new ResizeObserver(updateHeight)
    observer.observe(contentRef.current)
    return () => observer.disconnect()
  }, [])

  const y1 = useSpring(useTransform(scrollYProgress, [0, 0.82], [0, svgHeight]), {
    stiffness: 420,
    damping: 84,
  })
  const y2 = useSpring(useTransform(scrollYProgress, [0, 1], [0, svgHeight]), {
    stiffness: 420,
    damping: 84,
  })

  return (
    <motion.div ref={ref} className={cn("relative h-full w-full", className)}>
      <svg
        aria-hidden="true"
        className="absolute top-0 left-0 hidden h-full w-5 overflow-visible md:block"
        height={svgHeight}
        viewBox={`0 0 20 ${svgHeight}`}
        width="20"
      >
        <path
          d={`M 10 0 V ${svgHeight}`}
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.18"
          strokeWidth="1"
        />
        {!reduceMotion && (
          <motion.path
            d={`M 10 0 V ${svgHeight}`}
            fill="none"
            stroke="url(#experience-gradient)"
            strokeWidth="2"
          />
        )}
        <defs>
          <motion.linearGradient
            gradientUnits="userSpaceOnUse"
            id="experience-gradient"
            x1="0"
            x2="0"
            y1={y1}
            y2={y2}
          >
            <stop stopColor="#b7f36b" stopOpacity="0" />
            <stop offset="0.22" stopColor="#b7f36b" />
            <stop offset="0.76" stopColor="#b7f36b" />
            <stop offset="1" stopColor="#b7f36b" stopOpacity="0" />
          </motion.linearGradient>
        </defs>
      </svg>
      <div ref={contentRef}>{children}</div>
    </motion.div>
  )
}
