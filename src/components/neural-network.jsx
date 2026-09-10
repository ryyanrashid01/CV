import { useEffect, useRef } from "react";
import * as THREE from "three";
import { buildNeuralTopology } from "@/lib/neural-topology";
import { createComputationalField } from "@/lib/computational-field";

const asset = (name) => `${import.meta.env.BASE_URL}assets/${name}`;
const modes = { ai: 0, software: 2, research: 1 };
const projectColors = {
  act: 0,
  intellibin: 0,
  conformance: 1,
  prism: 2,
  taqyeem: 2,
  wordle: 2,
};
const vertexShader = `
  attribute vec4 aPatchUv;
  attribute vec3 aPatchData;
  attribute vec3 aScatter;
  uniform float uAssembly;
  uniform float uScale;
  varying vec2 vUv;
  varying vec2 vImageUv;
  varying vec3 vData;
  varying float vDepth;
  void main() {
    vUv = uv;
    vImageUv = aPatchUv.xy + uv * aPatchUv.zw;
    vData = aPatchData;
    vec3 tile = position;
    tile.xy *= 0.996;
    vec4 world = modelMatrix * instanceMatrix * vec4(tile, 1.0);
    float depth = -(viewMatrix * world).z;
    float release = 1.0 - smoothstep(2.0, 7.0, depth);
    world.xyz += aScatter * uScale * (uAssembly * (0.25 + aPatchData.y * 0.6) + release);
    vec4 view = viewMatrix * world;
    vDepth = -view.z;
    gl_Position = projectionMatrix * view;
  }
`;
const fragmentShader = `
  uniform sampler2D uField;
  uniform float uLight;
  uniform float uMode;
  uniform float uFocus;
  uniform float uAssembly;
  varying vec2 vUv;
  varying vec2 vImageUv;
  varying vec3 vData;
  varying float vDepth;
  vec3 palette(float index) {
    vec3 cool = mix(vec3(0.18, 0.48, 0.85), vec3(0.40, 0.34, 0.75), clamp(index, 0.0, 1.0));
    return mix(cool, vec3(0.36, 0.58, 0.78), clamp(index - 1.0, 0.0, 1.0));
  }
  void main() {
    float depthFade = smoothstep(1.8, 4.0, vDepth) * (1.0 - smoothstep(34.0, 58.0, vDepth));
    if (depthFade < 0.01) discard;
    vec2 sampleUv = vImageUv;
    vec4 field = texture2D(uField, sampleUv);
    float depth = dot(field.rg, vec2(256.0 / 257.0, 1.0 / 257.0));
    vec2 slope = (field.ba - 0.5) * 10.0;
    float occupied = smoothstep(0.015, 0.065, depth);
    vec3 normal = normalize(vec3(-slope, 1.0));
    float lighting = max(0.0, dot(normal, normalize(vec3(-0.65, 0.8, 0.9))));
    vec3 tint = mix(palette(vData.z), palette(uMode), 0.22);
    vec3 color = vec3(0.012, 0.019, 0.032);
    if (vData.x < 0.5) {
      // A shaded geometric image, with broad faces and precise beveled edges.
      vec3 surface = mix(vec3(0.025, 0.06, 0.15), vec3(0.28, 0.43, 0.66), depth);
      color = mix(color, surface * (0.3 + lighting * 1.2), occupied);
      float glint = pow(max(0.0, dot(normal, normalize(vec3(-0.3, 0.7, 1.0)))), 24.0);
      color += vec3(0.48, 0.66, 0.86) * glint * occupied * 0.16;
    } else if (vData.x < 1.5) {
      // The same image resolved into contours and edge responses.
      float level = depth * 10.0;
      float lineWidth = max(fwidth(level), 0.018);
      float contour = (1.0 - smoothstep(lineWidth * 0.4, lineWidth, abs(fract(level + 0.5) - 0.5))) * min(1.0, 0.08 / lineWidth);
      float boundary = exp(-depth * 42.0) * smoothstep(0.002, 0.018, depth);
      color += vec3(0.018, 0.021, 0.038) * occupied;
      color += vec3(0.28, 0.31, 0.67) * contour * occupied * 0.8;
      color += vec3(0.38, 0.50, 0.72) * boundary * 0.7;
    } else {
      // Sparse feature patches share the underlying form, rather than noise.
      vec2 resolution = vec2(34.0, 51.0);
      vec2 cell = floor(sampleUv * resolution);
      float feature = dot(texture2D(uField, (cell + 0.5) / resolution).rg, vec2(256.0 / 257.0, 1.0 / 257.0));
      float seed = fract(sin(dot(cell, vec2(127.1, 311.7))) * 43758.5453);
      float activation = smoothstep(0.07, 0.5, feature) * step(0.22, seed);
      vec2 local = abs(fract(sampleUv * resolution) - 0.5);
      float square = 1.0 - smoothstep(0.28, 0.39, max(local.x, local.y));
      color += vec3(0.018, 0.03, 0.045) * occupied;
      color += mix(vec3(0.07, 0.25, 0.53), vec3(0.60, 0.72, 0.85), step(0.86, seed)) * square * activation;
    }
    float edge = 1.0 - smoothstep(0.003, 0.014, min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y)));
    float selected = uFocus < 0.0 ? 0.0 : 1.0 - smoothstep(0.0, 0.8, abs(vData.z - uFocus));
    color += tint * edge * (0.035 + vData.y * 0.07 + uAssembly * 0.25 + selected * 0.2);
    float rim = 1.0 - smoothstep(0.001, 0.009, min(min(vImageUv.x, 1.0 - vImageUv.x), min(vImageUv.y, 1.0 - vImageUv.y)));
    color += tint * rim * 0.38;
    color = mix(color, color * 0.84 + vec3(0.015, 0.022, 0.035), uLight);
    float opacity = mix(0.86, 0.88, uLight) * depthFade;
    gl_FragColor = vec4(color, opacity);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;
const lineVertex = `
  varying vec3 vColor;
  varying float vDepth;
  void main() {
    vColor = color;
    vec4 view = modelViewMatrix * vec4(position, 1.0);
    vDepth = -view.z;
    gl_Position = projectionMatrix * view;
  }
`;
const lineFragment = `
  uniform float uLight;
  uniform float uAssembly;
  varying vec3 vColor;
  varying float vDepth;
  void main() {
    float fade = smoothstep(2.0, 6.0, vDepth) * (1.0 - smoothstep(24.0, 60.0, vDepth));
    gl_FragColor = vec4(vColor * mix(1.0, 0.35, uLight), fade * (0.75 - uAssembly * 0.25));
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;
const tokenVertex = `
  attribute vec3 aTint;
  attribute float aSeed;
  uniform float uAssembly;
  uniform float uScale;
  varying vec2 vUv;
  varying vec3 vColor;
  varying float vDepth;
  void main() {
    vUv = uv;
    vColor = aTint;
    vec4 world = modelMatrix * instanceMatrix * vec4(position, 1.0);
    world.y += sin(aSeed * 18.0) * uAssembly * uScale * 0.7;
    vec4 view = viewMatrix * world;
    vDepth = -view.z;
    gl_Position = projectionMatrix * view;
  }
`;
const tokenFragment = `
  uniform float uLight;
  varying vec2 vUv;
  varying vec3 vColor;
  varying float vDepth;
  void main() {
    float edge = 1.0 - smoothstep(0.025, 0.1, min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y)));
    float fade = smoothstep(1.5, 5.0, vDepth) * (1.0 - smoothstep(27.0, 54.0, vDepth));
    gl_FragColor = vec4(vColor * (0.45 + edge * 0.65) * mix(1.0, 0.4, uLight), fade * (0.42 + edge * 0.42));
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

function createNeuralScene(canvas, fallback, host, initialOptions, initialIntro) {
  let options = initialOptions;
  let renderer;
  let observer;
  let disposed = false;
  let failed = false;
  let frame = 0;
  let lastFrame = 0;
  let targetScroll = 0;
  let scroll = 0;
  let intro = initialIntro;
  let width = 1;
  let height = 1;
  let lowQuality = false;
  let slowFrames = 0;
  let renderedFrames = 0;
  let outputKey = "";
  let mode = modes[options.mode] || 0;
  const pointer = new THREE.Vector2();
  const currentPointer = new THREE.Vector2();
  const resources = new Set();
  const scene = new THREE.Scene();
  const world = new THREE.Group();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.2, 85);
  scene.add(world);
  const immediate = () => options.paused || options.reducedMotion;
  const reportMode = () => {
    if (failed) {
      options.onMotionModeChange?.("fallback");
      return;
    }
    host.dataset.motion = options.reducedMotion
      ? "reduced"
      : options.paused
        ? "paused"
        : lowQuality
          ? "adaptive-low"
          : "interactive";
    // Lower resolution retains every interaction, so the pause control stays usable.
    options.onMotionModeChange?.("animated");
  };
  const fail = () => {
    failed = true;
    cancelAnimationFrame(frame);
    frame = 0;
    canvas.style.opacity = "0";
    fallback.style.opacity = "1";
    host.dataset.renderer = "fallback";
    host.dataset.motion = "fallback";
    options.onMotionModeChange?.("fallback");
  };
  try {
    const compact = window.matchMedia("(max-width: 767px)").matches;
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, compact ? 1 : 1.25),
    );
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    const topology = buildNeuralTopology(compact);
    resources.add(topology.patchGeometry);
    resources.add(topology.tokenGeometry);
    resources.add(topology.lineGeometry);
    const fieldTexture = createComputationalField(compact);
    resources.add(fieldTexture);
    const uniforms = {
      uAssembly: { value: 0 },
      uScale: { value: 1 },
      uLight: { value: 0 },
      uMode: { value: mode },
      uFocus: { value: -1 },
      uField: { value: fieldTexture },
    };
    const patchMaterial = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
      forceSinglePass: true,
      depthWrite: true,
    });
    const patches = new THREE.InstancedMesh(
      topology.patchGeometry,
      patchMaterial,
      topology.matrices.length,
    );
    topology.matrices.forEach((matrix, index) =>
      patches.setMatrixAt(index, matrix),
    );
    patches.instanceMatrix.needsUpdate = true;
    patches.frustumCulled = false;
    world.add(patches);
    const tokenMaterial = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: tokenVertex,
      fragmentShader: tokenFragment,
      transparent: true,
      side: THREE.DoubleSide,
      forceSinglePass: true,
      depthWrite: false,
    });
    const tokens = new THREE.InstancedMesh(
      topology.tokenGeometry,
      tokenMaterial,
      topology.tokens.length,
    );
    topology.tokens.forEach((matrix, index) =>
      tokens.setMatrixAt(index, matrix),
    );
    tokens.instanceMatrix.needsUpdate = true;
    tokens.frustumCulled = false;
    tokens.renderOrder = 2;
    world.add(tokens);
    const lineMaterial = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: lineVertex,
      fragmentShader: lineFragment,
      transparent: true,
      vertexColors: true,
      depthWrite: false,
    });
    const lines = new THREE.LineSegments(topology.lineGeometry, lineMaterial);
    lines.renderOrder = 1;
    world.add(lines);
    for (const resource of [
      patchMaterial,
      tokenMaterial,
      lineMaterial,
    ])
      resources.add(resource);

    const draw = (timestamp) => {
      frame = 0;
      if (disposed || failed || document.visibilityState !== "visible") return;
      if (lowQuality && lastFrame && timestamp - lastFrame < 40) {
        frame = requestAnimationFrame(draw);
        return;
      }
      const started = performance.now();
      const delta = lastFrame
        ? Math.min((timestamp - lastFrame) / 1000, 0.08)
        : 1;
      lastFrame = timestamp;
      const blend = immediate() || lowQuality ? 1 : 1 - Math.exp(-delta * 13);
      const destination = options.reducedMotion
        ? 0
        : options.paused
          ? scroll
          : targetScroll;
      scroll = THREE.MathUtils.lerp(scroll, destination, blend);
      const targetMode = modes[options.mode] || 0;
      mode = THREE.MathUtils.lerp(mode, targetMode, blend);
      if (immediate()) pointer.set(0, 0);
      currentPointer.lerp(pointer, blend);
      const mobile = width < 768;
      const scale = mobile ? 0.63 : 1;
      const pathX = Math.sin(scroll * Math.PI * 2) * 0.36;
      const cameraZ = 11 - scroll * 36 * scale;
      world.scale.setScalar(scale);
      world.position.set(
        mobile ? -2.15 : Math.max(-0.2, (camera.aspect - 1.5) * 3.8),
        mobile ? -3.65 : 0.1,
        0,
      );
      camera.position.set(
        pathX + currentPointer.x * 0.58,
        currentPointer.y * 0.3,
        cameraZ,
      );
      camera.lookAt(
        pathX + currentPointer.x * 0.1,
        currentPointer.y * 0.04,
        cameraZ - 20,
      );
      uniforms.uScale.value = scale;
      uniforms.uAssembly.value = immediate() ? 0 : Math.max(1 - intro, Math.sin(scroll * Math.PI * 5) ** 2 * 0.68);
      uniforms.uLight.value = options.theme === "light" ? 1 : 0;
      uniforms.uMode.value = mode;
      const focus = options.focusedProject;
      uniforms.uFocus.value = projectColors[focus] ?? -1;
      host.dataset.focus = focus || "";
      try {
        renderer.render(scene, camera);
        if (scroll < 0.001) {
          // Join the existing content-generation paths to a real edge of the
          // rear tile plane, measured in the opening document composition.
          const output = topology.outputAnchor.clone()
            .applyMatrix4(world.matrixWorld)
            .project(camera);
          const x = (output.x + 1) * width / 2;
          const y = (1 - output.y) * height / 2;
          const key = `${x.toFixed(1)},${y.toFixed(1)}`;
          if (outputKey !== key) {
            outputKey = key;
            host.dataset.outputX = x.toFixed(1);
            host.dataset.outputY = y.toFixed(1);
            host.dispatchEvent(new CustomEvent("neural-output", { bubbles: true, detail: { x, y } }));
          }
        }
        canvas.style.opacity = "1";
        fallback.style.opacity = "0";
        host.dataset.renderer = "webgl";
        host.dataset.imagery = "surfaces-contours-features";
        host.dataset.depth = cameraZ.toFixed(2);
        host.dataset.frames = String(renderedFrames);
        host.dataset.drawCalls = String(renderer.info.render.calls);
        host.dataset.tiles = String(topology.matrices.length);
      } catch {
        fail();
      }
      // Measure work, not time between input events. Slow devices still track scroll.
      if (!failed && renderedFrames++ > 2 && !lowQuality) {
        slowFrames =
          performance.now() - started > 45
            ? slowFrames + 1
            : Math.max(0, slowFrames - 1);
        if (slowFrames >= 3) {
          lowQuality = true;
          renderer.setPixelRatio(0.75);
          reportMode();
        }
      }
      const settling =
        Math.abs(scroll - targetScroll) > 0.00008 ||
        currentPointer.distanceToSquared(pointer) > 0.00002 ||
        Math.abs(mode - targetMode) > 0.005;
      if (!failed && settling && !immediate())
        frame = requestAnimationFrame(draw);
    };
    const requestDraw = () => {
      if (
        !disposed &&
        !failed &&
        !frame &&
        document.visibilityState === "visible"
      )
        frame = requestAnimationFrame(draw);
    };
    const resize = () => {
      width = Math.max(host.clientWidth, 1);
      height = Math.max(host.clientHeight, 1);
      camera.aspect = width / height;
      camera.fov = width < 768 ? 49 : 42;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      requestDraw();
    };
    observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();
    const onPointer = (event) => {
      if (width < 768 || immediate() || event.pointerType === "touch") return;
      pointer.set(
        (event.clientX / width) * 2 - 1,
        1 - (event.clientY / height) * 2,
      );
      requestDraw();
    };
    const onPointerLeave = () => {
      pointer.set(0, 0);
      requestDraw();
    };
    const onVisibility = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      lastFrame = 0;
      requestDraw();
    };
    const onContextLost = (event) => {
      event.preventDefault();
      fail();
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("visibilitychange", onVisibility);
    canvas.addEventListener("webglcontextlost", onContextLost);
    reportMode();
    return {
      update(nextOptions) {
        options = nextOptions;
        reportMode();
        requestDraw();
      },
      updateScroll(value) {
        targetScroll = THREE.MathUtils.clamp(value, 0, 1);
        requestDraw();
      },
      updateIntro(value) {
        intro = value;
        requestDraw();
      },
      dispose() {
        disposed = true;
        cancelAnimationFrame(frame);
        observer.disconnect();
        window.removeEventListener("pointermove", onPointer);
        document.documentElement.removeEventListener(
          "pointerleave",
          onPointerLeave,
        );
        document.removeEventListener("visibilitychange", onVisibility);
        canvas.removeEventListener("webglcontextlost", onContextLost);
        resources.forEach((resource) => resource.dispose());
        renderer.dispose();
      },
    };
  } catch {
    fail();
    observer?.disconnect();
    resources.forEach((resource) => resource.dispose());
    renderer?.dispose();
    return {
      update() {},
      updateScroll() {},
      updateIntro() {},
      dispose() {
        disposed = true;
      },
    };
  }
}

/** Three shared draw calls; readable CV content always remains normal HTML. */
export default function NeuralNetwork({
  mode = "ai",
  activeSection = "top",
  paused = false,
  reducedMotion = false,
  theme = "dark",
  scrollProgress,
  generation,
  focusedProject = null,
  onMotionModeChange,
}) {
  const canvas = useRef(null);
  const fallback = useRef(null);
  const host = useRef(null);
  const controller = useRef(null);
  const currentOptions = useRef({
    mode,
    activeSection,
    paused,
    reducedMotion,
    theme,
    focusedProject,
    onMotionModeChange,
  });
  const currentScroll = useRef(0);
  const currentIntro = useRef(1);
  useEffect(() => {
    const initialization = requestAnimationFrame(() => {
      controller.current = createNeuralScene(
        canvas.current,
        fallback.current,
        host.current,
        currentOptions.current,
        currentIntro.current,
      );
      controller.current.updateScroll(currentScroll.current);
    });
    return () => {
      cancelAnimationFrame(initialization);
      controller.current?.dispose();
      controller.current = null;
    };
  }, []);
  useEffect(() => {
    currentOptions.current = {
      mode,
      activeSection,
      paused,
      reducedMotion,
      theme,
      focusedProject,
      onMotionModeChange,
    };
    controller.current?.update(currentOptions.current);
  }, [
    mode,
    activeSection,
    paused,
    reducedMotion,
    theme,
    focusedProject,
    onMotionModeChange,
  ]);
  useEffect(() => {
    if (!scrollProgress) return undefined;
    currentScroll.current = scrollProgress.get();
    controller.current?.updateScroll(currentScroll.current);
    return scrollProgress.on("change", (value) => {
      currentScroll.current = value;
      controller.current?.updateScroll(value);
    });
  }, [scrollProgress]);
  useEffect(() => {
    if (!generation) return undefined;
    currentIntro.current = generation.intro.get();
    controller.current?.updateIntro(currentIntro.current);
    return generation.intro.on("change", (value) => {
      currentIntro.current = value;
      controller.current?.updateIntro(value);
    });
  }, [generation]);
  return (
    <div
      aria-hidden="true"
      className="neural-network-renderer"
      ref={host}
      style={{
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        position: "relative",
      }}
    >
      <picture>
        <source
          media="(max-width: 767px)"
          srcSet={asset(theme === "light" ? "spatial-fallback-mobile-light.webp" : "spatial-fallback-mobile.webp")}
        />
        <img
          alt=""
          className="neural-network-fallback"
          decoding="async"
          ref={fallback}
          src={asset(theme === "light" ? "spatial-fallback-light.webp" : "spatial-fallback.webp")}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 1,
          }}
        />
      </picture>
      <canvas
        ref={canvas}
        style={{ display: "block", width: "100%", height: "100%", opacity: 0 }}
      />
    </div>
  );
}
