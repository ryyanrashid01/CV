import * as THREE from "three";

// A shared, domain-neutral depth study. Every visual treatment samples these
// same folded geometric forms: surfaces, extracted edges and sparse features.
const forms = [
  [-0.55, -0.9, 0.25, 0.8, 0.52],
  [0.2, -0.83, 0.35, 0.35, 0.76],
  [0.53, -0.03, 0.25, 0.93, 0.58],
  [-0.13, 0.1, 0.28, 0.55, 0.9],
  [-0.61, 0.67, 0.19, 0.75, 0.72],
  [0.22, 1.1, 0.36, 0.33, 0.66],
];

function fieldAt(x, y) {
  const u = x * 0.866 + y * 0.5;
  const v = -x * 0.5 + y * 0.866;
  let depth = 0;
  for (const [cx, cy, width, height, peak] of forms) {
    const dx = Math.abs(u - cx) - width;
    const dy = Math.abs(v - cy) - height;
    const distance = Math.max(dx, dy);
    const bevel = Math.max(0, Math.min(1, -distance / 0.17));
    const fold = 0.7 + (u - cx) / width * 0.14 + (v - cy) / height * 0.09;
    depth = Math.max(depth, bevel * peak * fold);
  }
  return depth;
}

/** One small numerical texture, generated once; no remote imagery or draw loop. */
export function createComputationalField(compact = false) {
  const width = compact ? 256 : 512;
  const height = Math.round(width * 1.5);
  const values = new Float32Array(width * height);
  for (let row = 0; row < height; row += 1) {
    for (let column = 0; column < width; column += 1) {
      values[row * width + column] = fieldAt((column / width - 0.5) * 2.6, (row / height - 0.5) * 3.9);
    }
  }
  const data = new Uint8Array(width * height * 4);
  const encode = (value) => Math.round(Math.max(0, Math.min(1, value)) * 255);
  for (let row = 0; row < height; row += 1) {
    for (let column = 0; column < width; column += 1) {
      const index = row * width + column;
      const dx = (values[row * width + Math.min(width - 1, column + 1)] - values[row * width + Math.max(0, column - 1)]) * width / 5.2;
      const dy = (values[Math.min(height - 1, row + 1) * width + column] - values[Math.max(0, row - 1) * width + column]) * height / 7.8;
      // Pack depth into two bytes to keep fine contours smooth. The other
      // channels hold derivatives; this remains a filterable RGBA8 texture.
      const depth = Math.round(values[index] * 65535);
      data[index * 4] = depth >> 8;
      data[index * 4 + 1] = depth & 255;
      data[index * 4 + 2] = encode(dx * 0.1 + 0.5);
      data[index * 4 + 3] = encode(dy * 0.1 + 0.5);
    }
  }
  const texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}
