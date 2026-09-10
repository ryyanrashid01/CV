import { useEffect, useRef } from "react";
import "./generation-field.css";

const NS = "http://www.w3.org/2000/svg";
const clamp = (value, low = 0, high = 1) => Math.max(low, Math.min(high, value));

/** Small margin signals terminate at the very points that assemble the content. */
export function GenerationField({ generation, disabled = false }) {
  const svg = useRef(null);
  const source = useRef(null);
  const sourcePulse = useRef(null);
  const branches = useRef(null);
  const trunk = useRef(null);
  const head = useRef(null);

  useEffect(() => {
    if (disabled) return undefined;
    const element = svg.current;
    const main = document.getElementById("main-content");
    if (!element || !main) return undefined;
    let targets = [];
    let width = window.innerWidth;
    let height = window.innerHeight;
    let frame = 0;
    let measureFrame = 0;
    let disposed = false;
    let output = { x: width * 0.72, y: 430 };
    const create = (name, className) => {
      const node = document.createElementNS(NS, name);
      node.setAttribute("class", className);
      return node;
    };
    const set = (node, values) => {
      for (const [key, value] of Object.entries(values)) node.setAttribute(key, value);
    };
    const draw = () => {
      frame = 0;
      if (disposed) return;
      const y = generation.scrollY.get();
      const front = generation.front.get();
      const intro = generation.intro.get();
      const margin = width < 768 ? 10 : 26;
      const sourceY = output.y - y;
      const sourceEndX = width - margin;
      const sourceEndY = sourceY + (width < 768 ? 34 : 54);
      // Exit into the nearby free margin, without the old loop across the hero.
      const sourcePath = `M${output.x} ${sourceY} C${output.x + 32} ${sourceY + 26},${sourceEndX - 48} ${sourceEndY},${sourceEndX} ${sourceEndY}`;
      const sourceStrength = clamp(intro * 6 - 0.5) * clamp((1 - intro) * 4);
      const continuing = front > output.y + 54;
      set(source.current, { d: sourcePath, opacity: Math.max(sourceStrength * 0.36, continuing ? 0.12 : 0) });
      const frontY = front - y;
      set(trunk.current, { d: `M${sourceEndX} ${Math.max(70, sourceEndY)} V${frontY}`, opacity: continuing && frontY > 70 ? 0.16 : 0 });
      set(head.current, { cx: sourceEndX, cy: frontY, opacity: continuing && frontY > 75 && frontY < height + 5 ? 0.85 : 0 });
      set(sourcePulse.current, {
        d: sourcePath,
        "stroke-dashoffset": 100 - clamp((intro - 0.1) / 0.55) * 110,
        opacity: sourceStrength * 0.8,
      });
      element.dataset.front = front.toFixed(1);

      for (const target of targets) {
        const progress = target.image
          ? Number(target.element.dataset.generationProgress) || 0
          : Number(target.element.dataset.generationPartProgress) || 0;
        const top = target.top - y;
        const bottom = top + target.height;
        if (progress <= 0 || progress >= 1 || top > height + 40 || bottom < 65) {
          target.group.style.display = "none";
          continue;
        }
        target.group.style.display = "";
        const rightSide = target.hero || target.left + target.width / 2 > width / 2;
        const spineX = rightSide ? width - margin : margin;
        const side = rightSide ? -1 : 1;
        const strength = Math.sin(Math.PI * clamp(progress)) ** 0.45;
        if (!target.image) {
          const x = rightSide ? target.left + target.width + 7 : target.left - 7;
          const seedY = top + Math.min(15, target.height * 0.45);
          // Right-hand content receives its signal above adjacent left-hand copy.
          const routeY = target.routeTop === null ? seedY - 18 : target.routeTop - y;
          const gutterX = x - side * 13;
          const path = target.hero
            ? `M${output.x} ${sourceY} C${output.x - 45} ${sourceY + 12},${x + 24} ${seedY},${x} ${seedY}`
            : `M${spineX} ${routeY - 14} C${spineX} ${routeY + 5},${gutterX} ${routeY - 5},${gutterX} ${routeY + 12} C${gutterX} ${seedY},${x - side * 7} ${seedY},${x} ${seedY}`;
          set(target.paths[0], { d: path, opacity: strength * 0.42 });
          set(target.dots[0], { cx: x, cy: seedY, opacity: strength * 0.95 });
          continue;
        }

        // Read the chosen live fragment corners, including their tiny assembly
        // offset. This keeps the light and its incoming trace on the same pixel.
        const live = target.tiles.filter((tile) => tile.element.hasAttribute("data-tile-spark")).slice(0, 3);
        target.paths.forEach((path, index) => {
          const tile = live[index];
          if (!tile) {
            set(path, { opacity: 0 });
            set(target.dots[index], { opacity: 0 });
            return;
          }
          const local = clamp((progress - tile.start) / 0.2);
          const remaining = 1 - local;
          const drift = 1 - clamp(local * 2.8);
          const x = target.left + target.width * tile.x + drift * (tile.driftX + target.width / tile.columns * 0.015);
          const seedY = top + target.height * tile.y + drift * (tile.driftY + target.height / tile.rows * 0.015);
          const opacity = Math.min(1, local * 6) * Math.min(1, remaining * 3.5);
          let d;
          if (index === 0 && target.width > 180) {
            // One visible feeder connects the page signal to the live patch.
            // Approach from the outer gutter so it cannot cross another column.
            const gutter = rightSide ? target.left + target.width + 12 : target.left - 12;
            const approachY = Math.min(bottom - 5, seedY + 34);
            d = `M${spineX} ${approachY - 32} C${spineX} ${approachY - 8},${gutter} ${approachY - 12},${gutter} ${approachY} C${gutter + side * 24} ${approachY + 5},${x - side * 28} ${seedY + 20},${x} ${seedY}`;
          } else {
            // Secondary writing points retain a short local strand; the main
            // feeder establishes continuity without drawing a frame over the image.
            d = `M${x - 14} ${seedY - 9} Q${x - 6} ${seedY - 9},${x} ${seedY}`;
          }
          set(path, { d, opacity: opacity * (index === 0 ? 0.56 : 0.72) });
          set(target.dots[index], { cx: x, cy: seedY, opacity });
        });
      }
    };
    const schedule = () => {
      if (!disposed && !frame) frame = requestAnimationFrame(draw);
    };
    const measure = () => {
      measureFrame = 0;
      if (disposed) return;
      width = window.innerWidth;
      height = window.innerHeight;
      element.setAttribute("viewBox", `0 0 ${width} ${height}`);
      const renderer = document.querySelector(".neural-network-renderer");
      output = {
        x: Number(renderer?.dataset.outputX) || width * (width < 768 ? 0.54 : 0.72),
        y: Number(renderer?.dataset.outputY) || (width < 768 ? 268 : 430),
      };
      const nodes = Array.from(main.querySelectorAll('[data-generation-part="true"], .assembly-image'));
      const bounds = nodes.map((node) => ({ node, box: node.getBoundingClientRect(), section: node.closest("section") }));
      branches.current.replaceChildren();
      targets = bounds.map(({ node, box, section }) => {
        const image = node.classList.contains("assembly-image");
        const blockers = bounds.filter((item) => item.node !== node && item.section === section && item.box.left < box.left && item.box.right > 32 && item.box.top <= box.top && item.box.bottom > box.top);
        const routeTop = image && blockers.length ? Math.min(...blockers.map((item) => item.box.top)) + window.scrollY - 18 : null;
        const group = create("g", "generation-connection");
        const paths = [];
        const dots = [];
        for (let index = 0; index < (image ? 3 : 1); index += 1) {
          const branch = create("path", `generation-branch generation-tone-${index}`);
          const dot = create("circle", `generation-node generation-tone-${index}`);
          set(dot, { r: image ? 2 : 1.5 });
          group.append(branch, dot);
          paths.push(branch);
          dots.push(dot);
        }
        branches.current.append(group);
        const tiles = image ? Array.from(node.querySelectorAll(".assembly-fragment")).map((tile) => {
          const value = (name) => parseFloat(tile.style.getPropertyValue(name));
          const columns = value("--fragment-columns");
          const rows = value("--fragment-rows");
          return { element: tile, start: Number(tile.dataset.tileStart), columns, rows, x: value("--fragment-column") / columns, y: value("--fragment-row") / rows, driftX: value("--fragment-drift-x"), driftY: value("--fragment-drift-y") };
        }) : [];
        return { element: node, group, paths, dots, routeTop, image, tiles, hero: Boolean(node.closest(".hero-copy")), top: box.top + window.scrollY, left: box.left, width: box.width, height: box.height };
      });
      schedule();
    };
    const queueMeasure = () => {
      if (!disposed && !measureFrame) measureFrame = requestAnimationFrame(measure);
    };
    const onOutput = (event) => { output = event.detail; schedule(); };
    const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(queueMeasure);
    resizeObserver?.observe(main);
    const mutationObserver = new MutationObserver(queueMeasure);
    mutationObserver.observe(main, { childList: true, subtree: true });
    const offFront = generation.front.on("change", schedule);
    const offScroll = generation.scrollY.on("change", schedule);
    const offIntro = generation.intro.on("change", schedule);
    window.addEventListener("resize", queueMeasure);
    document.addEventListener("generationlayout", queueMeasure);
    document.addEventListener("neural-output", onOutput);
    measure();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      cancelAnimationFrame(measureFrame);
      resizeObserver?.disconnect();
      mutationObserver.disconnect();
      offFront(); offScroll(); offIntro();
      window.removeEventListener("resize", queueMeasure);
      document.removeEventListener("generationlayout", queueMeasure);
      document.removeEventListener("neural-output", onOutput);
    };
  }, [generation, disabled]);

  if (disabled) return null;
  return (
    <svg className="generation-field" ref={svg} aria-hidden="true">
      <path ref={source} className="generation-source" />
      <path ref={sourcePulse} className="generation-source-pulse" pathLength="100" />
      <path ref={trunk} className="generation-trunk" />
      <circle ref={head} className="generation-head" r="1.8" />
      <g ref={branches} />
    </svg>
  );
}
