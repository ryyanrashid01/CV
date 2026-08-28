"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { cn } from "@/lib/utils"

const BAYER_MATRIX_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
]

const BAYER_MATRIX_8X8 = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
]

const DEFAULT_PALETTE = ["#000000", "#ffffff"]

function parseColor(color) {
  if (color.startsWith("#")) {
    const hex = color.slice(1)
    if (hex.length === 3) {
      return [
        parseInt(hex[0] + hex[0], 16),
        parseInt(hex[1] + hex[1], 16),
        parseInt(hex[2] + hex[2], 16),
      ]
    }
    return [
      parseInt(hex.slice(0, 2), 16),
      parseInt(hex.slice(2, 4), 16),
      parseInt(hex.slice(4, 6), 16),
    ]
  }

  const match = color.match(/rgb\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)\)/i)
  return match
    ? [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])]
    : [0, 0, 0]
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function getLuminance(red, green, blue) {
  return 0.299 * red + 0.587 * green + 0.114 * blue
}

export function DitherShader({
  alt = "",
  animated = false,
  animationDuration = 4800,
  animationFps = 12,
  animationSpeed = 0.06,
  backgroundColor = "transparent",
  brightness = 0,
  canvasOpacity = 1,
  className,
  colorMode = "original",
  contrast = 1,
  customPalette = DEFAULT_PALETTE,
  ditherMode = "bayer",
  fetchPriority = "auto",
  gridSize = 4,
  height = 900,
  invert = false,
  objectFit = "cover",
  pixelRatio = 1,
  primaryColor = "#000000",
  secondaryColor = "#ffffff",
  src,
  threshold = 0.5,
  width = 1440,
}) {
  const animationRef = useRef(null)
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const imageDataRef = useRef(null)
  const imageRef = useRef(null)
  const timeRef = useRef(0)
  const [dimensions, setDimensions] = useState({ height: 0, width: 0 })

  const parsedPrimaryColor = useMemo(() => parseColor(primaryColor), [primaryColor])
  const parsedSecondaryColor = useMemo(() => parseColor(secondaryColor), [secondaryColor])
  const parsedCustomPalette = useMemo(
    () => customPalette.map(parseColor),
    [customPalette],
  )

  const applyDithering = useCallback(
    (context, displayWidth, displayHeight, time = 0) => {
      if (!canvasRef.current || !imageDataRef.current) return

      if (backgroundColor === "transparent") {
        context.clearRect(0, 0, displayWidth, displayHeight)
      } else {
        context.fillStyle = backgroundColor
        context.fillRect(0, 0, displayWidth, displayHeight)
      }

      const sourceData = imageDataRef.current.data
      const sourceWidth = imageDataRef.current.width
      const sourceHeight = imageDataRef.current.height
      const effectivePixelSize = Math.max(1, Math.floor(gridSize * pixelRatio))
      const matrixSize = gridSize <= 4 ? 4 : 8
      const bayerMatrix = gridSize <= 4 ? BAYER_MATRIX_4X4 : BAYER_MATRIX_8X8
      const matrixScale = matrixSize === 4 ? 16 : 64
      const orderedPhase = Math.floor(time)

      for (let y = 0; y < displayHeight; y += effectivePixelSize) {
        for (let x = 0; x < displayWidth; x += effectivePixelSize) {
          const sourceX = Math.floor((x / displayWidth) * sourceWidth)
          const sourceY = Math.floor((y / displayHeight) * sourceHeight)
          const sourceIndex = (sourceY * sourceWidth + sourceX) * 4

          let red = sourceData[sourceIndex] || 0
          let green = sourceData[sourceIndex + 1] || 0
          let blue = sourceData[sourceIndex + 2] || 0
          const alpha = sourceData[sourceIndex + 3] || 0

          if (alpha < 10) continue

          red = clamp((red - 128) * contrast + 128 + brightness * 255, 0, 255)
          green = clamp((green - 128) * contrast + 128 + brightness * 255, 0, 255)
          blue = clamp((blue - 128) * contrast + 128 + brightness * 255, 0, 255)

          const luminance = getLuminance(red, green, blue) / 255
          const matrixX =
            (Math.floor(x / gridSize) + orderedPhase) % matrixSize
          const matrixY =
            (Math.floor(y / gridSize) + Math.floor(orderedPhase / 2)) % matrixSize
          let ditherThreshold

          if (ditherMode === "halftone") {
            const angle = Math.PI / 4
            const scale = gridSize * 2
            const rotatedX = x * Math.cos(angle) + y * Math.sin(angle)
            const rotatedY = -x * Math.sin(angle) + y * Math.cos(angle)
            ditherThreshold =
              (Math.sin(rotatedX / scale + time) +
                Math.sin(rotatedY / scale + time) +
                2) /
              4
          } else if (ditherMode === "noise") {
            const noiseValue =
              Math.sin(x * 12.9898 + y * 78.233 + time * 100) * 43758.5453
            ditherThreshold = noiseValue - Math.floor(noiseValue)
          } else if (ditherMode === "crosshatch") {
            const lineOne = (x + y + orderedPhase) % (gridSize * 2) < gridSize ? 1 : 0
            const lineTwo =
              (x - y + gridSize * 4 + orderedPhase) % (gridSize * 2) < gridSize
                ? 1
                : 0
            ditherThreshold = (lineOne + lineTwo) / 2
          } else {
            ditherThreshold = bayerMatrix[matrixY][matrixX] / matrixScale
          }

          ditherThreshold = ditherThreshold * (1 - threshold) + threshold * 0.5
          let outputColor

          if (colorMode === "grayscale") {
            outputColor = luminance < ditherThreshold ? [0, 0, 0] : [255, 255, 255]
          } else if (colorMode === "duotone") {
            outputColor =
              luminance < ditherThreshold ? parsedPrimaryColor : parsedSecondaryColor
          } else if (colorMode === "custom") {
            if (parsedCustomPalette.length === 2) {
              outputColor =
                luminance < ditherThreshold
                  ? parsedCustomPalette[0]
                  : parsedCustomPalette[1]
            } else {
              const adjustedLuminance = luminance + (ditherThreshold - 0.5) * 0.5
              const paletteIndex = Math.floor(
                clamp(adjustedLuminance, 0, 1) * (parsedCustomPalette.length - 1),
              )
              outputColor = parsedCustomPalette[paletteIndex]
            }
          } else {
            const ditherAmount = ditherThreshold - 0.5
            const levels = 4
            outputColor = [red, green, blue].map(
              (channel) =>
                Math.round(clamp(channel + ditherAmount * 64, 0, 255) / (255 / levels)) *
                (255 / levels),
            )
          }

          if (invert) outputColor = outputColor.map((channel) => 255 - channel)

          context.fillStyle = `rgb(${outputColor[0]}, ${outputColor[1]}, ${outputColor[2]})`
          context.fillRect(x, y, effectivePixelSize, effectivePixelSize)
        }
      }
    },
    [
      backgroundColor,
      brightness,
      colorMode,
      contrast,
      ditherMode,
      gridSize,
      invert,
      parsedCustomPalette,
      parsedPrimaryColor,
      parsedSecondaryColor,
      pixelRatio,
      threshold,
    ],
  )

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined

    const resizeObserver = new ResizeObserver(([entry]) => {
      const height = Math.max(0, Math.round(entry.contentRect.height))
      const width = Math.max(0, Math.round(entry.contentRect.width))
      if (height > 0 && width > 0) setDimensions({ height, width })
    })

    resizeObserver.observe(container)
    return () => resizeObserver.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || dimensions.width === 0 || dimensions.height === 0) return undefined

    let isCancelled = false
    let lastFrame = 0

    const processImage = (image) => {
      if (isCancelled) return

      const devicePixelRatio = window.devicePixelRatio || 1
      const { height: displayHeight, width: displayWidth } = dimensions
      canvas.height = Math.floor(displayHeight * devicePixelRatio)
      canvas.width = Math.floor(displayWidth * devicePixelRatio)

      const context = canvas.getContext("2d")
      if (!context) return
      context.resetTransform()
      context.scale(devicePixelRatio, devicePixelRatio)

      const offscreen = document.createElement("canvas")
      offscreen.height = displayHeight
      offscreen.width = displayWidth
      const offscreenContext = offscreen.getContext("2d")
      if (!offscreenContext) return

      const imageWidth = image.naturalWidth || displayWidth
      const imageHeight = image.naturalHeight || displayHeight
      let drawWidth = displayWidth
      let drawHeight = displayHeight
      let drawX = 0
      let drawY = 0

      if (objectFit === "cover" || objectFit === "contain") {
        const scale =
          objectFit === "cover"
            ? Math.max(displayWidth / imageWidth, displayHeight / imageHeight)
            : Math.min(displayWidth / imageWidth, displayHeight / imageHeight)
        drawWidth = Math.ceil(imageWidth * scale)
        drawHeight = Math.ceil(imageHeight * scale)
        drawX = Math.floor((displayWidth - drawWidth) / 2)
        drawY = Math.floor((displayHeight - drawHeight) / 2)
      } else if (objectFit !== "fill") {
        drawWidth = imageWidth
        drawHeight = imageHeight
        drawX = Math.floor((displayWidth - drawWidth) / 2)
        drawY = Math.floor((displayHeight - drawHeight) / 2)
      }

      offscreenContext.drawImage(image, drawX, drawY, drawWidth, drawHeight)
      imageDataRef.current = offscreenContext.getImageData(
        0,
        0,
        displayWidth,
        displayHeight,
      )
      applyDithering(context, displayWidth, displayHeight, timeRef.current)

      if (!animated) return

      const frameDuration = 1000 / Math.max(1, animationFps)
      const animationStart = performance.now()
      const animate = (timestamp) => {
        if (isCancelled) return
        if (timestamp - animationStart >= animationDuration) return
        if (timestamp - lastFrame >= frameDuration) {
          timeRef.current += animationSpeed
          applyDithering(context, displayWidth, displayHeight, timeRef.current)
          lastFrame = timestamp
        }
        animationRef.current = requestAnimationFrame(animate)
      }
      animationRef.current = requestAnimationFrame(animate)
    }

    if (imageRef.current?.complete) {
      processImage(imageRef.current)
    } else {
      const image = new Image()
      image.crossOrigin = "anonymous"
      image.src = src
      image.onload = () => {
        imageRef.current = image
        processImage(image)
      }
      image.onerror = () => console.error("Failed to load image for DitherShader:", src)
    }

    return () => {
      isCancelled = true
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [
    animated,
    animationDuration,
    animationFps,
    animationSpeed,
    applyDithering,
    dimensions,
    objectFit,
    src,
  ])

  return (
    <div className={cn("relative h-full w-full", className)} ref={containerRef}>
      <img
        alt={alt}
        className="absolute inset-0 h-full w-full"
        fetchPriority={fetchPriority}
        height={height}
        src={src}
        style={{ objectFit }}
        width={width}
      />
      <canvas
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
        ref={canvasRef}
        style={{ imageRendering: "pixelated", opacity: canvasOpacity }}
      />
    </div>
  )
}

export default DitherShader
