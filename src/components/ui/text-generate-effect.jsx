"use client"

import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

export function TextGenerateEffect({
  words,
  className,
  duration = 0.58,
}) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.span
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      className={cn("inline-block", className)}
      initial={reduceMotion ? undefined : { opacity: 0, y: 16 }}
      transition={{ duration, ease: [0.16, 1, 0.3, 1] }}
    >
      {words}
    </motion.span>
  )
}
