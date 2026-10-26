import * as THREE from "three";

const CAMERA_Z = 14;
const TAU = Math.PI * 2;
const RETICLES = 4;
const TRAIL = 36;
const clamp01 = (value) => Math.min(1, Math.max(0, value));
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const easeOut = (t) => 1 - (1 - t) ** 3;
const easeOutBack = (t) => 1 + 2.2 * (t - 1) ** 3 + 1.2 * (t - 1) ** 2;
const random = (seed) => {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
};

const palettes = {
  light: {
    fade: "#f1f1ec",
    back: "#e4e1ea",
    rule: "#cfcad6",
    front: "#1d0f2b",
    side: "#8a7f98",
    scan: "#fde725",
    particle: "#a49caf",
    trail: "#1d0f2b",
    shadow: 0.24,
  },
  dark: {
    fade: "#110c17",
    back: "#1d1626",
    rule: "#3a3046",
    front: "#fde725",
    side: "#8f8216",
    scan: "#fde725",
    particle: "#4f455c",
    trail: "#fde725",
    shadow: 0.6,
  },
};
// Early guesses the detector shows before it settles on the real class.
const decoys = ["region", "object", "text", "ui_element", "panel"];

const cardVertex = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const cardFragment = `
  uniform sampler2D uMap;
  uniform float uReady;
  uniform float uDim;
  uniform float uScan;
  uniform vec3 uBack;
  uniform vec3 uRule;
  uniform vec3 uScanColor;
  uniform vec3 uFade;
  varying vec2 vUv;
  void main() {
    vec3 color = uBack;
    if (gl_FrontFacing) {
      color = mix(uBack, texture2D(uMap, vUv).rgb, uReady);
      // A scan band sweeps down while the detector reads the card.
      float scanning = step(0.0, uScan) * (1.0 - step(1.0, uScan));
      float line = 1.0 - uScan;
      float band = (1.0 - smoothstep(0.0, 0.022, abs(vUv.y - line))) * scanning;
      float wake = smoothstep(line + 0.22, line, vUv.y) * step(line, vUv.y) * scanning;
      vec2 cell = abs(fract(vUv * vec2(32.0, 20.0)) - 0.5);
      float grid = (1.0 - smoothstep(0.46, 0.5, max(cell.x, cell.y))) * wake;
      color = mix(color, uScanColor, band * 0.7 + grid * 0.18);
    }
    color = mix(color, uFade, uDim);
    vec2 edgeDistance = min(vUv, 1.0 - vUv);
    vec2 edgeWidth = fwidth(vUv) * 1.4;
    float edge = 1.0 - min(smoothstep(0.0, edgeWidth.x, edgeDistance.x), smoothstep(0.0, edgeWidth.y, edgeDistance.y));
    color = mix(color, uRule, edge);
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;
const barVertex = `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * (mat3(instanceMatrix) * normal));
    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
  }
`;
const barFragment = `
  uniform vec3 uFront;
  uniform vec3 uSide;
  varying vec3 vNormal;
  void main() {
    vec3 normal = normalize(vNormal);
    float facing = smoothstep(0.35, 0.95, abs(normal.z));
    float light = 0.55 + 0.45 * clamp(dot(normal, normalize(vec3(-0.35, 0.55, 0.75))), 0.0, 1.0);
    gl_FragColor = vec4(mix(uSide * light, uFront, facing), 1.0);
    #include <colorspace_fragment>
  }
`;
const particleVertex = `
  attribute float aSeed;
  uniform float uTime;
  uniform float uSize;
  varying float vFade;
  void main() {
    vec3 moved = position;
    moved.y += sin(uTime * 0.25 + aSeed * 6.2831) * 0.18;
    moved.x += cos(uTime * 0.18 + aSeed * 12.0) * 0.12;
    vec4 view = modelViewMatrix * vec4(moved, 1.0);
    vFade = smoothstep(42.0, 14.0, -view.z);
    gl_PointSize = uSize * (12.0 / -view.z);
    gl_Position = projectionMatrix * view;
  }
`;
const particleFragment = `
  uniform vec3 uColor;
  varying float vFade;
  void main() {
    vec2 p = abs(gl_PointCoord - 0.5);
    if (min(p.x, p.y) > 0.07 || max(p.x, p.y) > 0.5) discard;
    gl_FragColor = vec4(uColor, vFade * 0.75);
    #include <colorspace_fragment>
  }
`;

function shadowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 160;
  const context = canvas.getContext("2d");
  // Draw the rectangle off-canvas so only its blurred shadow lands inside.
  context.shadowColor = "rgba(0, 0, 0, 1)";
  context.shadowBlur = 26;
  context.shadowOffsetX = 1000;
  context.fillRect(-1000 + 40, 34, 176, 92);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Project cards float in a receding deck. Solid bracket reticles search each
 * front card, pass through decoy guesses, and lock onto real regions while a
 * DOM label reports the class and a confidence that rises as the box tightens.
 */
export function createDetectorScene({
  canvas,
  host,
  stage,
  labelLayer,
  projects,
  options,
  onRequestActive,
  onOpen,
  onReady,
  onFail,
}) {
  let settings = { ...options };
  let renderer;
  let disposed = false;
  let frame = 0;
  let last = 0;
  let time = 0;
  let width = 1;
  let height = 1;
  let cardWidth = 4.6;
  let activeIndex = settings.activeIndex ?? 0;
  let activatedAt = 0;
  let lockedAt = -1;
  let hovered = -1;
  let visible = true;
  let scroll = 0;
  let pixelRatio = Math.min(window.devicePixelRatio || 1, 1.75);
  let slowFrames = 0;
  let introDone = false;
  const pointer = new THREE.Vector2();
  const parallax = new THREE.Vector2();
  const resources = new Set();
  const listeners = [];
  const anchor = new THREE.Vector3();
  const compact = () => width < 768;
  const still = () => settings.reducedMotion;
  const listen = (target, type, handler, config) => {
    target.addEventListener(type, handler, config);
    listeners.push(() => target.removeEventListener(type, handler, config));
  };

  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch {
    onFail?.();
    return { update() {}, setScroll() {}, relayout() {}, dispose() {} };
  }
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(pixelRatio);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 120);
  camera.position.set(0, 0, CAMERA_Z + 5);
  const deck = new THREE.Group();
  scene.add(deck);
  const palette = () => palettes[settings.theme === "dark" ? "dark" : "light"];

  // Cards
  const loader = new THREE.TextureLoader();
  const plane = new THREE.PlaneGeometry(1, 1);
  const shadowMap = shadowTexture();
  resources.add(plane);
  resources.add(shadowMap);
  const anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const cards = projects.map((project, index) => {
    const uniforms = {
      uMap: { value: null },
      uReady: { value: 0 },
      uDim: { value: 0 },
      uScan: { value: -1 },
      uBack: { value: new THREE.Color() },
      uRule: { value: new THREE.Color() },
      uScanColor: { value: new THREE.Color() },
      uFade: { value: new THREE.Color() },
    };
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: cardVertex,
      fragmentShader: cardFragment,
      side: THREE.DoubleSide,
    });
    const group = new THREE.Group();
    const mesh = new THREE.Mesh(plane, material);
    mesh.userData.index = index;
    const shadowMaterial = new THREE.MeshBasicMaterial({
      map: shadowMap,
      transparent: true,
      depthWrite: false,
      opacity: 0.3,
    });
    const shadow = new THREE.Mesh(plane, shadowMaterial);
    shadow.renderOrder = -1;
    group.add(shadow, mesh);
    deck.add(group);
    resources.add(material);
    resources.add(shadowMaterial);
    const texture = loader.load(project.image, (loaded) => {
      loaded.colorSpace = THREE.SRGBColorSpace;
      loaded.anisotropy = anisotropy;
      loaded.needsUpdate = true;
      card.loadedAt = time;
      requestRender();
    });
    texture.colorSpace = THREE.SRGBColorSpace;
    uniforms.uMap.value = texture;
    resources.add(texture);
    const card = {
      index,
      project,
      group,
      mesh,
      shadow,
      uniforms,
      loadedAt: -1,
      hover: 0,
      depth: 0,
      motion: null,
      position: new THREE.Vector3(),
      quaternion: new THREE.Quaternion(),
      dim: 0,
    };
    return card;
  });
  const count = cards.length;
  const depthOf = (index) => (index - activeIndex + count) % count;
  // Desktop decks recede up and to the right; phone decks stay tight so they
  // never climb into the copy above.
  const slot = (depth) => {
    const narrow = compact();
    return {
      position: new THREE.Vector3(
        cardWidth * (narrow ? -0.02 + depth * 0.09 : -0.12 + depth * 0.25),
        cardWidth * (narrow ? -0.04 + depth * 0.05 : -0.06 + depth * 0.15),
        -depth * cardWidth * (narrow ? 0.62 : 0.82),
      ),
      quaternion: new THREE.Quaternion().setFromEuler(
        new THREE.Euler(narrow ? 0.05 : 0.07, narrow ? -0.12 - depth * 0.03 : -0.36 - depth * 0.025, 0.015 + depth * 0.012),
      ),
      dim: Math.min(0.72, depth * 0.17),
    };
  };
  const placeCards = (animate, intro = false) => {
    cards.forEach((card) => {
      const depth = depthOf(card.index);
      const target = slot(depth);
      if (!animate || still()) {
        card.motion = null;
        card.position.copy(target.position);
        card.quaternion.copy(target.quaternion);
        card.dim = target.dim;
        card.depth = depth;
        return;
      }
      const from = intro
        ? {
            position: target.position.clone().add(
              new THREE.Vector3(
                cardWidth * (0.6 + random(card.index) * 1.2),
                -cardWidth * (1.1 + random(card.index + 9) * 0.8),
                cardWidth * (0.8 + random(card.index + 3) * 1.4),
              ),
            ),
            quaternion: new THREE.Quaternion().setFromEuler(
              new THREE.Euler(random(card.index + 1) * 1.6 - 0.8, random(card.index + 2) * 2 - 1, random(card.index + 4) - 0.5),
            ),
            dim: 1,
          }
        : { position: card.position.clone(), quaternion: card.quaternion.clone(), dim: card.dim };
      // Cards that fall back in the deck swing out and around instead of
      // passing through the cards in front of them.
      const backwards = !intro && depth > card.depth;
      const control = from.position.clone().lerp(target.position, 0.5);
      if (backwards) control.add(new THREE.Vector3(-cardWidth * 1.15, -cardWidth * 0.45, cardWidth * 1.1));
      card.motion = {
        from,
        to: target,
        control,
        start: time + (intro ? 0.15 + depth * 0.1 : depth * 0.05),
        duration: intro ? 1.7 : backwards ? 1.35 : 1.05,
        spin: backwards && depth === count - 1 && card.depth === 0 ? TAU : 0,
      };
      card.depth = depth;
    });
  };

  // Reticles: four solid L-shaped corners each, drawn as instanced bars.
  const box = new THREE.BoxGeometry(1, 1, 1);
  const barMaterial = new THREE.ShaderMaterial({
    uniforms: { uFront: { value: new THREE.Color() }, uSide: { value: new THREE.Color() } },
    vertexShader: barVertex,
    fragmentShader: barFragment,
  });
  const bars = new THREE.InstancedMesh(box, barMaterial, RETICLES * 8);
  bars.frustumCulled = false;
  deck.add(bars);
  resources.add(box);
  resources.add(barMaterial);
  const trailMaterial = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false });
  resources.add(trailMaterial);
  const reticles = Array.from({ length: RETICLES }, (_, index) => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(TRAIL * 3), 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(new Float32Array(TRAIL * 4), 4));
    const line = new THREE.Line(geometry, trailMaterial);
    line.frustumCulled = false;
    deck.add(line);
    resources.add(geometry);
    const label = document.createElement("span");
    label.className = "detector-tag";
    const text = document.createElement("span");
    label.append(text);
    labelLayer.append(label);
    return {
      index,
      position: new THREE.Vector3(index * 1.4 - 2, 3 + index, 6),
      quaternion: new THREE.Quaternion().setFromEuler(new THREE.Euler(index, index * 0.7, 0.3)),
      size: new THREE.Vector2(2.4, 1.6),
      task: null,
      trail: Array.from({ length: TRAIL }, () => new THREE.Vector3(index * 1.4 - 2, 3 + index, 6)),
      line,
      label,
      text,
      shown: "",
      opacity: 0,
    };
  });

  // Ambient registration marks give the space depth.
  const particleCount = window.matchMedia("(max-width: 767px)").matches ? 80 : 160;
  const particleGeometry = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  const particleSeeds = new Float32Array(particleCount);
  for (let index = 0; index < particleCount; index += 1) {
    particlePositions.set(
      [(random(index * 3.1) - 0.5) * 26, (random(index * 5.7) - 0.5) * 15, -random(index * 7.3) * 22 + 3],
      index * 3,
    );
    particleSeeds[index] = random(index * 1.9);
  }
  particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
  particleGeometry.setAttribute("aSeed", new THREE.BufferAttribute(particleSeeds, 1));
  const particleMaterial = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uSize: { value: 16 }, uColor: { value: new THREE.Color() } },
    vertexShader: particleVertex,
    fragmentShader: particleFragment,
    transparent: true,
    depthWrite: false,
  });
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);
  resources.add(particleGeometry);
  resources.add(particleMaterial);

  const applyTheme = () => {
    const colors = palette();
    cards.forEach((card) => {
      card.uniforms.uBack.value.set(colors.back);
      card.uniforms.uRule.value.set(colors.rule);
      card.uniforms.uScanColor.value.set(colors.scan);
      card.uniforms.uFade.value.set(colors.fade);
      card.shadow.material.opacity = colors.shadow;
    });
    barMaterial.uniforms.uFront.value.set(colors.front);
    barMaterial.uniforms.uSide.value.set(colors.side);
    particleMaterial.uniforms.uColor.value.set(colors.particle);
  };

  // Geometry helpers in deck space.
  const cardPose = (card) => {
    const lift = card.hover * cardWidth * 0.035;
    const height = cardWidth / 1.6;
    return { lift, height };
  };
  const pointOnCard = (card, u, v, z = 0) => {
    const { lift, height } = cardPose(card);
    return new THREE.Vector3((u - 0.5) * cardWidth, (0.5 - v) * height, z + lift)
      .applyQuaternion(card.group.quaternion)
      .add(card.group.position);
  };
  const regionPose = (card, region, grow = 1) => {
    const height = cardWidth / 1.6;
    const pad = cardWidth * 0.012;
    return {
      position: pointOnCard(card, (region.x + region.w / 2) / 100, (region.y + region.h / 2) / 100, cardWidth * 0.045),
      quaternion: card.group.quaternion,
      width: ((region.w / 100) * cardWidth + pad * 2) * grow,
      height: ((region.h / 100) * height + pad * 2) * grow,
    };
  };
  const orbitPose = (reticle) => {
    const t = time * 0.35 + reticle.index * 1.7;
    return {
      position: new THREE.Vector3(
        cardWidth * (0.55 + Math.sin(t) * 0.55),
        cardWidth * (0.42 + Math.cos(t * 0.8) * 0.3),
        cardWidth * (0.35 + Math.sin(t * 0.6) * 0.25),
      ),
      quaternion: new THREE.Quaternion().setFromEuler(new THREE.Euler(t * 0.9, t * 1.2, t * 0.5)),
      width: cardWidth * 0.13,
      height: cardWidth * 0.1,
    };
  };

  const assignTasks = () => {
    const card = cards[activeIndex];
    const regions = card.project.detections || [];
    reticles.forEach((reticle, index) => {
      const region = regions[index];
      if (!region) {
        reticle.task = null;
        return;
      }
      const seed = activeIndex * 13 + index * 3;
      reticle.task = {
        card,
        region,
        start: activatedAt + (introDone ? 0.45 : 1.25) + index * 0.5,
        duration: 1.75,
        from: null,
        decoy: {
          x: 8 + random(seed) * 64,
          y: 10 + random(seed + 1) * 62,
          w: Math.max(12, region.w * 1.5),
          h: Math.max(10, region.h * 1.5),
        },
        guess: decoys[Math.floor(random(seed + 2) * decoys.length)],
        locked: false,
      };
    });
  };

  const activate = (index, intro = false) => {
    activeIndex = index;
    activatedAt = time;
    lockedAt = -1;
    placeCards(true, intro);
    assignTasks();
    if (still()) {
      reticles.forEach((reticle) => {
        if (reticle.task) reticle.task.start = -100;
      });
    }
    requestRender();
  };

  const blendPose = (a, b, t) => ({
    position: a.position.clone().lerp(b.position, t),
    quaternion: a.quaternion.clone().slerp(b.quaternion, t),
    width: THREE.MathUtils.lerp(a.width, b.width, t),
    height: THREE.MathUtils.lerp(a.height, b.height, t),
  });

  const updateReticles = (delta) => {
    let allLocked = reticles.some((reticle) => reticle.task);
    reticles.forEach((reticle) => {
      const { task } = reticle;
      let pose;
      let label = "";
      let labelOpacity = 0;
      if (task && time >= task.start) {
        if (!task.from) {
          task.from = {
            position: reticle.position.clone(),
            quaternion: reticle.quaternion.clone(),
            width: reticle.size.x,
            height: reticle.size.y,
          };
        }
        const progress = clamp01((time - task.start) / task.duration);
        const target = regionPose(task.card, task.region);
        const decoy = regionPose(task.card, task.decoy);
        const near = regionPose(task.card, task.region, 1.32);
        const confidence = Number(task.region.score);
        if (progress < 0.4) {
          // Travel to a wrong region first, the way a detector proposes candidates.
          pose = blendPose(task.from, decoy, easeInOut(progress / 0.4));
          label = "scanning";
          labelOpacity = clamp01(progress / 0.15) * 0.7;
        } else if (progress < 0.5) {
          pose = decoy;
          pose.position.y += Math.sin(time * 18) * cardWidth * 0.004;
          label = `${task.guess} ${(0.18 + random(task.start) * 0.17).toFixed(2)}`;
          labelOpacity = 0.85;
        } else if (progress < 0.8) {
          pose = blendPose(decoy, near, easeInOut((progress - 0.5) / 0.3));
          label = `${task.region.label} ${(0.42 + ((progress - 0.5) / 0.3) * 0.3).toFixed(2)}`;
          labelOpacity = 0.9;
        } else {
          const snap = easeOutBack((progress - 0.8) / 0.2);
          pose = blendPose(near, target, snap);
          label = `${task.region.label} ${(0.72 + (confidence - 0.72) * clamp01((progress - 0.8) / 0.2)).toFixed(2)}`;
          labelOpacity = 1;
        }
        if (progress >= 1) {
          const breathe = 1 + Math.sin(time * 2.2 + reticle.index) * 0.012;
          pose = target;
          pose.width *= breathe;
          pose.height *= breathe;
          label = `${task.region.label} ${task.region.score}`;
          task.locked = true;
        } else {
          allLocked = false;
        }
        reticle.position.copy(pose.position);
        reticle.quaternion.copy(pose.quaternion);
        reticle.size.set(pose.width, pose.height);
      } else {
        // Waiting reticles ride their last card or drift in orbit.
        if (task) allLocked = false;
        const previous = reticle.lastLock;
        const goal = previous && task ? regionPose(previous.card, previous.region) : orbitPose(reticle);
        const lambda = previous && task ? 12 : 2.2;
        reticle.position.x = THREE.MathUtils.damp(reticle.position.x, goal.position.x, lambda, delta);
        reticle.position.y = THREE.MathUtils.damp(reticle.position.y, goal.position.y, lambda, delta);
        reticle.position.z = THREE.MathUtils.damp(reticle.position.z, goal.position.z, lambda, delta);
        reticle.quaternion.slerp(goal.quaternion, 1 - Math.exp(-lambda * delta));
        reticle.size.x = THREE.MathUtils.damp(reticle.size.x, goal.width, lambda, delta);
        reticle.size.y = THREE.MathUtils.damp(reticle.size.y, goal.height, lambda, delta);
      }
      if (task?.locked) reticle.lastLock = { card: task.card, region: task.region };
      reticle.label.dataset.discipline = (task || reticle.lastLock)?.card.project.discipline || "";
      reticle.targetLabel = label;
      reticle.targetOpacity = labelOpacity;
    });
    if (allLocked && lockedAt < 0) lockedAt = time;
  };

  const matrix = new THREE.Matrix4();
  const barPosition = new THREE.Vector3();
  const barScale = new THREE.Vector3();
  const writeBars = () => {
    let instance = 0;
    const thickness = cardWidth * 0.011;
    const depth = cardWidth * 0.022;
    reticles.forEach((reticle) => {
      const w = reticle.size.x;
      const h = reticle.size.y;
      const arm = Math.min(Math.min(w, h) * 0.32, cardWidth * 0.07);
      for (const [sx, sy] of [[-1, 1], [1, 1], [1, -1], [-1, -1]]) {
        const cornerX = (sx * w) / 2;
        const cornerY = (sy * h) / 2;
        // Horizontal arm, then vertical arm, both running inward from the corner.
        for (const vertical of [false, true]) {
          const localX = vertical ? cornerX - (sx * thickness) / 2 : cornerX - (sx * arm) / 2;
          const localY = vertical ? cornerY - (sy * arm) / 2 : cornerY - (sy * thickness) / 2;
          barPosition.set(localX, localY, 0).applyQuaternion(reticle.quaternion).add(reticle.position);
          barScale.set(vertical ? thickness : arm, vertical ? arm : thickness, depth);
          matrix.compose(barPosition, reticle.quaternion, barScale);
          bars.setMatrixAt(instance, matrix);
          instance += 1;
        }
      }
    });
    bars.instanceMatrix.needsUpdate = true;
  };

  const trailColor = new THREE.Color();
  const writeTrails = () => {
    trailColor.set(palette().trail);
    reticles.forEach((reticle) => {
      reticle.trail.pop();
      reticle.trail.unshift(reticle.position.clone());
      const positions = reticle.line.geometry.attributes.position;
      const colors = reticle.line.geometry.attributes.color;
      const speed = reticle.trail[0].distanceTo(reticle.trail[4]) / cardWidth;
      const strength = still() ? 0 : clamp01(speed * 6) * 0.5;
      reticle.trail.forEach((point, index) => {
        positions.setXYZ(index, point.x, point.y, point.z);
        colors.setXYZW(index, trailColor.r, trailColor.g, trailColor.b, strength * (1 - index / TRAIL) ** 1.6);
      });
      positions.needsUpdate = true;
      colors.needsUpdate = true;
    });
  };

  const projected = new THREE.Vector3();
  const writeLabels = () => {
    const exit = clamp01(1 - scroll * 1.6);
    reticles.forEach((reticle) => {
      projected
        .set(-reticle.size.x / 2, reticle.size.y / 2, 0)
        .applyQuaternion(reticle.quaternion)
        .add(reticle.position);
      deck.localToWorld(projected);
      projected.project(camera);
      const x = ((projected.x + 1) / 2) * width;
      const y = ((1 - projected.y) / 2) * height;
      reticle.opacity = still()
        ? reticle.targetOpacity
        : THREE.MathUtils.lerp(reticle.opacity, reticle.targetOpacity, 0.18);
      reticle.label.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      reticle.label.style.opacity = (reticle.opacity * exit).toFixed(3);
      if (reticle.shown !== reticle.targetLabel && reticle.targetLabel) {
        reticle.shown = reticle.targetLabel;
        reticle.text.textContent = reticle.targetLabel;
      }
    });
  };

  const updateCards = () => {
    cards.forEach((card) => {
      const { motion } = card;
      let position = card.position;
      let quaternion = card.quaternion;
      let dim = card.dim;
      if (motion) {
        const raw = clamp01((time - motion.start) / motion.duration);
        const t = easeInOut(raw);
        const a = motion.from.position;
        const b = motion.to.position;
        const c = motion.control;
        position = new THREE.Vector3()
          .addScaledVector(a, (1 - t) ** 2)
          .addScaledVector(c, 2 * (1 - t) * t)
          .addScaledVector(b, t * t);
        quaternion = motion.from.quaternion.clone().slerp(motion.to.quaternion, t);
        if (motion.spin) quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), motion.spin * t));
        dim = THREE.MathUtils.lerp(motion.from.dim, motion.to.dim, t);
        if (raw >= 1) {
          card.motion = null;
          card.position.copy(motion.to.position);
          card.quaternion.copy(motion.to.quaternion);
          card.dim = motion.to.dim;
        }
      }
      const bob = still() ? 0 : Math.sin(time * 0.7 + card.index * 1.3) * cardWidth * 0.012;
      card.hover = THREE.MathUtils.lerp(card.hover, hovered === card.index ? 1 : 0, 0.15);
      card.group.position.copy(position);
      card.group.position.y += bob;
      card.group.quaternion.copy(quaternion);
      card.mesh.scale.set(cardWidth, cardWidth / 1.6, 1);
      card.mesh.position.z = card.hover * cardWidth * 0.035;
      card.shadow.scale.set(cardWidth * 1.42, (cardWidth / 1.6) * 1.55, 1);
      card.shadow.position.set(cardWidth * 0.03, -cardWidth * 0.05, -cardWidth * 0.08);
      card.uniforms.uDim.value = Math.max(0, dim - card.hover * 0.12);
      card.uniforms.uReady.value = card.loadedAt < 0 ? 0 : still() ? 1 : clamp01((time - card.loadedAt) / 0.5);
      const scanStart = activatedAt + (introDone ? 0.3 : 1.1);
      card.uniforms.uScan.value =
        card.index === activeIndex && !still() ? (time - scanStart) / 1.6 : -1;
    });
  };

  const layout = () => {
    width = Math.max(1, host.clientWidth);
    height = Math.max(1, host.clientHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.fov = compact() ? 38 : 30;
    camera.updateProjectionMatrix();
    const hostBox = host.getBoundingClientRect();
    const stageBox = stage.getBoundingClientRect();
    const viewHeight = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * CAMERA_Z;
    const viewWidth = viewHeight * camera.aspect;
    const stageWidth = (stageBox.width / width) * viewWidth;
    const stageHeight = (stageBox.height / height) * viewHeight;
    cardWidth = Math.max(1.2, Math.min(stageWidth * (compact() ? 0.8 : 0.74), stageHeight * 0.66 * 1.6));
    anchor.set(
      ((stageBox.left + stageBox.width / 2 - hostBox.left) / width - 0.5) * viewWidth,
      (0.5 - (stageBox.top + stageBox.height / 2 - hostBox.top) / height) * viewHeight,
      0,
    );
    particleMaterial.uniforms.uSize.value = (compact() ? 6 : 7) * pixelRatio;
    // Moving cards keep flying but retarget to the resized slots.
    cards.forEach((card) => {
      const target = slot(depthOf(card.index));
      if (card.motion) card.motion.to = target;
      else {
        card.position.copy(target.position);
        card.quaternion.copy(target.quaternion);
        card.dim = target.dim;
        card.depth = depthOf(card.index);
      }
    });
    requestRender();
  };

  const raycaster = new THREE.Raycaster();
  const pick = (event) => {
    const box = canvas.getBoundingClientRect();
    const ndc = new THREE.Vector2(
      ((event.clientX - box.left) / box.width) * 2 - 1,
      -((event.clientY - box.top) / box.height) * 2 + 1,
    );
    raycaster.setFromCamera(ndc, camera);
    const hit = raycaster.intersectObjects(cards.map((card) => card.mesh), false)[0];
    return hit ? hit.object.userData.index : -1;
  };

  const render = (timestamp) => {
    frame = 0;
    if (disposed) return;
    const delta = last ? Math.min((timestamp - last) / 1000, 0.05) : 1 / 60;
    last = timestamp;
    const started = performance.now();
    if (!still()) time += delta;
    if (!introDone && time - activatedAt > 2.4) introDone = true;
    if (!still()) {
      parallax.x = THREE.MathUtils.damp(parallax.x, pointer.x, 3, delta);
      parallax.y = THREE.MathUtils.damp(parallax.y, pointer.y, 3, delta);
    }
    const intro = still() ? 1 : easeOut(clamp01(time / 1.9));
    camera.position.set(parallax.x * 0.4, parallax.y * 0.25, CAMERA_Z + (1 - intro) * 5 + scroll * 3);
    camera.lookAt(parallax.x * 0.1, 0, 0);
    deck.position.copy(anchor);
    // Scrolling away tips the deck back; phones only push it into depth.
    if (compact()) deck.position.z -= scroll * cardWidth * 1.2;
    else deck.position.y += scroll * cardWidth * 0.5;
    deck.rotation.set(-parallax.y * 0.08 + scroll * 0.35, parallax.x * 0.14, 0);
    deck.updateMatrixWorld();
    particles.rotation.y = parallax.x * 0.05;
    particleMaterial.uniforms.uTime.value = time;
    updateCards();
    deck.updateMatrixWorld();
    updateReticles(delta);
    writeBars();
    writeTrails();
    writeLabels();
    renderer.render(scene, camera);
    if (
      lockedAt >= 0 &&
      !settings.paused &&
      !settings.holding &&
      !still() &&
      hovered < 0 &&
      time - lockedAt > 2.6
    ) {
      lockedAt = -1;
      onRequestActive?.((activeIndex + 1) % count);
    }
    // Lower the resolution once if frames keep running long.
    if (performance.now() - started > 20) slowFrames += 1;
    else slowFrames = Math.max(0, slowFrames - 1);
    if (slowFrames > 40 && pixelRatio > 1) {
      pixelRatio = 1;
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(width, height, false);
    }
    if (!still() && !settings.paused && visible && document.visibilityState === "visible") {
      frame = requestAnimationFrame(render);
    }
  };
  function requestRender() {
    if (!frame && !disposed) frame = requestAnimationFrame(render);
  }

  // Events
  listen(window, "pointermove", (event) => {
    if (event.pointerType === "touch") return;
    const box = host.getBoundingClientRect();
    pointer.set(((event.clientX - box.left) / box.width) * 2 - 1, -(((event.clientY - box.top) / box.height) * 2 - 1));
    if (!still()) pointer.clampScalar(-1, 1);
    else pointer.set(0, 0);
    const next = event.target === canvas ? pick(event) : -1;
    if (next !== hovered) {
      hovered = next;
      canvas.style.cursor = hovered >= 0 ? "pointer" : "";
      requestRender();
    }
  }, { passive: true });
  listen(canvas, "click", (event) => {
    const index = pick(event);
    if (index < 0) return;
    if (index === activeIndex) onOpen?.(index);
    else onRequestActive?.(index);
  });
  listen(canvas, "webglcontextlost", (event) => {
    event.preventDefault();
    onFail?.();
  });
  listen(document, "visibilitychange", () => {
    last = 0;
    requestRender();
  });
  const resizeObserver = new ResizeObserver(layout);
  resizeObserver.observe(host);
  resizeObserver.observe(stage);
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    last = 0;
    if (visible) requestRender();
  });
  visibilityObserver.observe(host);
  document.fonts?.ready.then(() => !disposed && layout());

  applyTheme();
  layout();
  activate(activeIndex, !still());
  if (still()) introDone = true;
  onReady?.();

  return {
    update(next) {
      const previous = settings;
      settings = { ...settings, ...next };
      if (next.theme !== undefined && next.theme !== previous.theme) applyTheme();
      if (next.activeIndex !== undefined && next.activeIndex !== activeIndex) activate(next.activeIndex);
      if (next.reducedMotion !== previous.reducedMotion) {
        if (settings.reducedMotion) {
          introDone = true;
          placeCards(false);
          reticles.forEach((reticle) => {
            if (reticle.task) reticle.task.start = -100;
          });
        }
      }
      last = 0;
      requestRender();
    },
    setScroll(value) {
      scroll = clamp01(value);
      requestRender();
    },
    relayout: layout,
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      listeners.forEach((remove) => remove());
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      reticles.forEach((reticle) => reticle.label.remove());
      resources.forEach((resource) => resource.dispose());
      renderer.dispose();
    },
  };
}
