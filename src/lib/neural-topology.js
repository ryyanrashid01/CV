import * as THREE from "three";

const colors = ["#82b9ed", "#aaa2dc", "#98b1d1"];

function randomSequence(seed = 29) {
  let value = seed;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

/** A continuous depth field. Every patch keeps its source-image coordinates. */
export function buildNeuralTopology(compact = false) {
  const random = randomSequence();
  const columns = compact ? 6 : 9;
  const rows = compact ? 9 : 13;
  const planes = 8;
  const patchCount = columns * rows * planes;
  const patchGeometry = new THREE.PlaneGeometry(1, 1);
  const patchUv = new Float32Array(patchCount * 4);
  const patchData = new Float32Array(patchCount * 3);
  const scatter = new Float32Array(patchCount * 3);
  const matrices = [];
  const planeAnchors = [];
  const linePositions = [];
  const lineColors = [];
  const transform = new THREE.Object3D();
  const local = new THREE.Vector3();
  const rotation = new THREE.Quaternion();
  const planeX = [4.9, 3.25, 1.85, 4.45, 2.75, 4.8, 2.35, 4.4];
  const addLine = (start, end, color, strength = 1) => {
    linePositions.push(...start.toArray(), ...end.toArray());
    for (let point = 0; point < 2; point += 1)
      lineColors.push(
        color.r * strength,
        color.g * strength,
        color.b * strength,
      );
  };

  // Draw distant translucent surfaces first, with foreground depth occlusion.
  for (let layer = planes - 1; layer >= 0; layer -= 1) {
    const width = layer === 0 ? 5.8 : 3.8;
    const height = layer === 0 ? 8.1 : 5.2;
    const center = new THREE.Vector3(
      planeX[layer],
      layer % 3 === 1 ? 0.65 : 0.1,
      3 - layer * 7.8,
    );
    rotation.setFromEuler(
      new THREE.Euler(
        0.015,
        layer % 2 ? 0.46 : -0.48,
        layer % 2 ? -0.035 : 0.025,
      ),
    );
    planeAnchors[layer] = { center, rotation: rotation.clone(), width, height };
    const tint = new THREE.Color(colors[layer % colors.length]);
    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const index = matrices.length;
        const edge =
          column === 0 ||
          column === columns - 1 ||
          row === 0 ||
          row === rows - 1;
        const detached = edge && random() > 0.68;
        local
          .set(
            ((column + 0.5) / columns - 0.5) * width,
            ((row + 0.5) / rows - 0.5) * height,
            0,
          )
          .applyQuaternion(rotation)
          .add(center);
        if (detached) {
          local.x += (random() - 0.5) * 0.4;
          local.y += (random() - 0.5) * 0.3;
          local.z += (random() - 0.5) * 0.8;
        }
        transform.position.copy(local);
        transform.quaternion.copy(rotation);
        transform.scale.set(width / columns, height / rows, 1);
        transform.updateMatrix();
        matrices.push(transform.matrix.clone());
        patchUv.set(
          [column / columns, row / rows, 1 / columns, 1 / rows],
          index * 4,
        );
        patchData.set([layer % 3, random(), layer % 3], index * 3);
        scatter.set(
          [
            (random() - 0.5) * (edge ? 2.3 : 1.1),
            (random() - 0.5) * 2.1,
            (random() - 0.5) * 4.5,
          ],
          index * 3,
        );
      }
    }
    const corners = [
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1],
    ].map(([x, y]) =>
      new THREE.Vector3((x * width) / 2, (y * height) / 2, 0.01)
        .applyQuaternion(rotation)
        .add(center),
    );
    corners.forEach((corner, index) =>
      addLine(corner, corners[(index + 1) % 4], tint, 0.85),
    );
  }
  // Sparse curved connections join actual patch edges at different elevations.
  for (let layer = 0; layer < planes - 1; layer += 1) {
    const near = planeAnchors[layer];
    const far = planeAnchors[layer + 1];
    for (let strand = 0; strand < 3; strand += 1) {
      const elevation = (strand - 1) * 0.29;
      const start = new THREE.Vector3(
        -near.width * 0.49,
        near.height * elevation,
        0.035,
      )
        .applyQuaternion(near.rotation)
        .add(near.center);
      const end = new THREE.Vector3(
        -far.width * 0.49,
        far.height * (elevation + 0.08),
        0.035,
      )
        .applyQuaternion(far.rotation)
        .add(far.center);
      const first = start.clone().lerp(end, 0.34);
      const second = start.clone().lerp(end, 0.7);
      first.x -= 0.65 + strand * 0.18;
      second.x -= 0.85;
      first.y += 0.25 * (strand - 1);
      const curve = new THREE.CubicBezierCurve3(start, first, second, end);
      const points = curve.getPoints(24);
      const tint = new THREE.Color(colors[(layer + strand) % 3]);
      for (let index = 0; index < points.length - 1; index += 1)
        addLine(points[index], points[index + 1], tint, 0.33);
    }
  }
  patchGeometry.setAttribute(
    "aPatchUv",
    new THREE.InstancedBufferAttribute(patchUv, 4),
  );
  patchGeometry.setAttribute(
    "aPatchData",
    new THREE.InstancedBufferAttribute(patchData, 3),
  );
  patchGeometry.setAttribute(
    "aScatter",
    new THREE.InstancedBufferAttribute(scatter, 3),
  );

  const ribbonPoint = (t, lane) => {
    const z = 7 - t * 70;
    return new THREE.Vector3(
      1.2 + Math.sin(t * Math.PI * 7 - 0.7) * 1.18 + lane * 0.11,
      -2.15 + Math.cos(t * Math.PI * 3.2) * 0.55 + lane * 0.06,
      z,
    );
  };
  for (let lane = 0; lane < (compact ? 4 : 7); lane += 1) {
    const tint = new THREE.Color(colors[lane % 3]);
    for (let segment = 0; segment < 100; segment += 1) {
      addLine(
        ribbonPoint(segment / 100, lane),
        ribbonPoint((segment + 1) / 100, lane),
        tint,
        0.34,
      );
    }
  }
  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(linePositions, 3),
  );
  lineGeometry.setAttribute(
    "color",
    new THREE.Float32BufferAttribute(lineColors, 3),
  );

  const tokenCount = compact ? 84 : 220;
  const tokenGeometry = new THREE.PlaneGeometry(1, 1);
  const tokenColors = new Float32Array(tokenCount * 3);
  const tokenSeeds = new Float32Array(tokenCount);
  const tokens = [];
  for (let index = 0; index < tokenCount; index += 1) {
    const lane = Math.floor(random() * 7);
    transform.position.copy(ribbonPoint(random() * 0.94, lane));
    transform.position.x += (random() - 0.5) * 1.5;
    transform.position.y += (random() - 0.5) * (index % 4 === 0 ? 6.6 : 0.65);
    transform.rotation.set(
      (random() - 0.5) * 0.4,
      (random() - 0.5) * 0.8,
      (random() - 0.5) * 0.18,
    );
    const size = 0.035 + random() ** 3 * 0.24;
    transform.scale.set(size, size * (0.8 + random() * 1.2), 1);
    transform.updateMatrix();
    tokens.push(transform.matrix.clone());
    new THREE.Color(colors[index % 3]).toArray(tokenColors, index * 3);
    tokenSeeds[index] = random();
  }
  tokenGeometry.setAttribute(
    "aTint",
    new THREE.InstancedBufferAttribute(tokenColors, 3),
  );
  tokenGeometry.setAttribute(
    "aSeed",
    new THREE.InstancedBufferAttribute(tokenSeeds, 1),
  );
  const outputPlane = planeAnchors[2];
  const outputAnchor = new THREE.Vector3(-outputPlane.width / 2, -outputPlane.height / 2, 0.01)
    .applyQuaternion(outputPlane.rotation)
    .add(outputPlane.center);
  return { patchGeometry, matrices, lineGeometry, tokenGeometry, tokens, outputAnchor };
}
