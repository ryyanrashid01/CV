import { useLayoutEffect, useRef } from "react";
import "./circuit-backdrop.css";

const clamp = (value) => Math.max(0, Math.min(1, value));
const layouts = [
  { section: "top", kind: "hero" },
  { section: "work", kind: "routing" },
  { section: "research", kind: "graph" },
  { section: "capabilities", kind: "routing" },
  { section: "contact", kind: "graph" },
];

/** Continuous current is separate from the one-time section reveal. */
function CircuitCurrent({ path, index = 0, hero = false }) {
  return (
    <g className="circuit-current" data-tone={index === 1 ? "warm" : "cool"} style={{ "--current-duration": `${(hero ? 11 : 8) + index * 2.3}s`, "--current-delay": `${-index * 3.7 - 1.4}s` }}>
      <path d={path} pathLength="1" className="circuit-current-halo" />
      <path d={path} pathLength="1" className="circuit-current-dot" />
    </g>
  );
}

function HeroCircuitDrawing() {
  return (
    <g className="hero-circuit-drawing">
      {Array.from({ length: 9 }, (_, index) => (
        <g key={index} data-hero-route={index}>
          <path className="hero-circuit-trace" />
          {[0, 3, 6].includes(index) && <CircuitCurrent index={index / 3} hero />}
        </g>
      ))}
      {Array.from({ length: 9 }, (_, index) => <circle key={index} data-hero-pad={index} className="hero-circuit-pad" r="2.6" />)}
    </g>
  );
}

function heroRoutes({ width, height, copy, controls, gutter, header }) {
  const compact = width < 768;
  const left = compact ? 12 : Math.max(18, gutter * 0.35);
  const right = width - left;
  const above = header + Math.max(8, (copy.top - header) * 0.4);
  const below = Math.min(controls - 24, copy.bottom + (compact ? 40 : 48));
  const floor = Math.min(height - 85, controls - 23);
  const channel = compact ? width * 0.68 : Math.min(right - 64, copy.right + 55);
  const top = compact ? Math.min(below, floor - 90) : Math.min(above, copy.top - 14);
  const middle = compact ? top + (floor - top) * 0.45 : top + 34;
  const end = compact ? width * 0.39 : copy.right - 105;
  const paths = [
    `M0 ${top} H${channel - 40} L${channel - 16} ${top + 24} V${below - 24} L${channel + 8} ${below} H${width}`,
    `M0 ${top - 10} H${channel - 28} L${channel - 4} ${top + 14} V${below - 38} L${channel + 24} ${below - 10} H${width}`,
    `M0 ${top - 20} H${channel - 16} L${channel + 8} ${top + 4} V${below - 48} L${channel + 36} ${below - 20} H${width}`,
    `M${width} ${middle + 24} H${channel + 74} L${channel + 48} ${middle + 50} V${floor - 24} L${channel + 24} ${floor} H${end}`,
    `M${width} ${middle + 36} H${channel + 88} L${channel + 60} ${middle + 64} V${floor - 12} L${channel + 36} ${floor + 12} H${end + 38}`,
    `M${end} ${floor} H${gutter + 95} L${gutter + 71} ${floor - 24} H0`,
    `M${left} ${above + 18} V${floor - 55} L${left + 25} ${floor - 30} H${gutter + 92}`,
    `M${right} ${above + 28} V${Math.min(floor - 45, above + 138)} L${right - 24} ${Math.min(floor - 21, above + 162)} H${right - 67}`,
    `M${channel - 105} ${top} V${Math.max(header + 15, top - 28)} H${channel - 151}`,
  ];
  const pads = [[end, floor], [end + 38, floor + 12], [gutter + 92, floor - 30], [left, above + 18], [right - 67, Math.min(floor - 21, above + 162)], [channel - 151, Math.max(header + 15, top - 28)], [channel - 16, top + 24], [channel + 48, middle + 50], [gutter + 71, floor - 24]];
  return { paths, pads };
}

// PCB-style routes share small junctions and 45-degree bends. No logo or labels.
const routing = {
  paths: [
    "M412 30 H360 L326 64 H254 L218 100 H108 L80 128 H20",
    "M412 42 H366 L330 78 H263 L227 114 H128 L100 142 H42",
    "M412 54 H374 L338 90 H278 L240 128 H158 L130 156 H64",
    "M412 104 H354 L322 136 H278 L244 170 H182 L150 202 H76",
    "M412 116 H362 L330 148 H288 L254 182 H206 L174 214 H110",
    "M324 66 V34 L306 16 H250",
    "M278 90 V46 L258 26 H204",
    "M240 128 V72 L218 50 H146",
    "M182 170 V144 L160 122 H132",
    "M354 136 V180 L378 204 H412",
    "M330 148 V190 L358 218 H412",
    "M108 100 V72 L88 52 H28",
  ],
  pads: [[20, 128], [42, 142], [64, 156], [76, 202], [110, 214], [250, 16], [204, 26], [146, 50], [132, 122], [28, 52]],
  junctions: [[324, 66], [278, 90], [240, 128], [182, 170], [354, 136], [330, 148], [108, 100]],
  arrows: [],
};

const graph = {
  paths: [
    "M408 48 H352 L322 78 H280",
    "M280 78 H242 L214 42 H170",
    "M280 78 H248 L220 126 H174",
    "M170 42 H118 L88 74 H38",
    "M174 126 H126 L88 74",
    "M174 126 H134 L110 188 H54",
    "M280 78 V158 L252 186 H210",
    "M210 186 H170 L144 214 H98",
    "M210 186 H170 L146 166 H130",
    "M38 74 H16",
  ],
  pads: [[280, 78], [170, 42], [174, 126], [38, 74], [54, 188], [210, 186], [98, 214], [130, 166]],
  junctions: [],
  arrows: [[302, 78], [193, 42], [197, 126], [62, 74], [78, 188], [231, 186]],
};

function CircuitDrawing({ kind }) {
  const pattern = kind === "graph" ? graph : routing;
  return (
    <>
      <g className="circuit-full">
        <g className="circuit-registration">
          {[70, 142, 214, 286, 358].flatMap((x) => [30, 102, 174].map((y) => (
            <path key={`${x}-${y}`} d={`M${x - 2} ${y}h4 M${x} ${y - 2}v4`} />
          )))}
        </g>
        {pattern.paths.map((path, index) => (
          <path key={path} d={path} pathLength="1" className="circuit-route" style={{ "--route-delay": (index % 4) * 0.055 }} />
        ))}
        <path d={pattern.paths[0]} pathLength="1" className="circuit-live-route" />
        <CircuitCurrent path={pattern.paths[0]} />
        <CircuitCurrent path={pattern.paths[kind === "graph" ? 5 : 4]} index={1} />
        {pattern.pads.map(([x, y], index) => (
          <g key={`${x}-${y}`} className="circuit-pad" style={{ "--pad-delay": 0.16 + (index % 5) * 0.09 }}>
            <circle cx={x} cy={y} r={kind === "graph" ? 5 : 3.3} />
            <circle cx={x} cy={y} r="1" className="circuit-pad-center" />
          </g>
        ))}
        {pattern.junctions.map(([x, y]) => <circle key={`${x}-${y}`} className="circuit-junction" cx={x} cy={y} r="1.6" />)}
        {pattern.arrows.map(([x, y]) => <path key={`${x}-${y}`} className="circuit-arrow" d={`M${x + 3} ${y - 3}l-3 3 3 3`} />)}
      </g>
      <g className="circuit-compact">
        <path d="M414 12 H292 L260 44 H124" pathLength="1" className="circuit-route" />
        <path d="M414 30 H308 L276 62 H214" pathLength="1" className="circuit-route" />
        <path d="M292 12 H238 L218 32 H180" pathLength="1" className="circuit-route" />
        <path d="M414 12 H292 L260 44 H124" pathLength="1" className="circuit-live-route" />
        <CircuitCurrent path="M414 12 H292 L260 44 H124" />
        <g className="circuit-pad"><circle cx="124" cy="44" r="4" /><circle cx="214" cy="62" r="4" /><circle cx="180" cy="32" r="4" /></g>
      </g>
    </>
  );
}

/** Decoration lives in section whitespace and advances with the same content frontier. */
export function CircuitBackdrop({ generation, disabled = false, paused = false }) {
  const host = useRef(null);

  useLayoutEffect(() => {
    const root = host.current;
    const entries = [...root.querySelectorAll("[data-circuit-section]")].map((element) => ({
      element,
      section: document.getElementById(element.dataset.circuitSection),
      top: 0,
      height: 1,
      progress: 0,
    }));
    let frame = 0;
    let disposed = false;

    const syncMotion = () => {
      root.dataset.motion = disabled || paused || document.visibilityState !== "visible" ? "paused" : "running";
    };
    const visibility = new IntersectionObserver((changes) => {
      for (const change of changes) change.target.dataset.visible = String(change.isIntersecting && change.intersectionRatio >= 0.001);
    }, { threshold: [0, 0.001] });
    entries.forEach(({ element }) => visibility.observe(element));
    document.addEventListener("visibilitychange", syncMotion);
    syncMotion();

    const update = () => {
      const front = generation.front.get();
      for (const entry of entries) {
        entry.progress = disabled ? 1 : Math.max(entry.progress, clamp((front - entry.top) / Math.max(80, entry.height)));
        entry.element.style.setProperty("--circuit-progress", entry.progress.toFixed(4));
        entry.element.dataset.state = entry.progress >= 1 ? "settled" : entry.progress > 0 ? "forming" : "pending";
      }
    };

    const measure = () => {
      frame = 0;
      const compact = innerWidth < 768;
      const origin = root.getBoundingClientRect();
      for (const entry of entries) {
        const section = entry.section;
        if (!section) continue;
        const sectionBox = section.getBoundingClientRect();
        const container = section.querySelector(".container");
        const containerBox = container.getBoundingClientRect();
        const gutter = parseFloat(getComputedStyle(container).paddingRight);
        if (entry.element.dataset.kind === "hero") {
          const copyBox = section.querySelector(".hero-copy").getBoundingClientRect();
          const controls = section.querySelector(".hero-bottom").getBoundingClientRect().top - sectionBox.top;
          const drawing = heroRoutes({ width: sectionBox.width, height: sectionBox.height, gutter, header: document.querySelector(".site-header").getBoundingClientRect().height, copy: { top: copyBox.top - sectionBox.top, bottom: copyBox.bottom - sectionBox.top, right: copyBox.right - sectionBox.left }, controls });
          entry.top = sectionBox.top + window.scrollY;
          entry.height = sectionBox.height;
          entry.element.style.left = `${sectionBox.left - origin.left}px`;
          entry.element.style.top = `${sectionBox.top - origin.top}px`;
          entry.element.style.width = `${sectionBox.width}px`;
          entry.element.style.height = `${sectionBox.height}px`;
          entry.element.setAttribute("viewBox", `0 0 ${sectionBox.width} ${sectionBox.height}`);
          entry.element.dataset.compact = String(compact);
          entry.element.querySelectorAll("[data-hero-route]").forEach((group, index) => {
            group.querySelectorAll("path").forEach((path) => path.setAttribute("d", drawing.paths[index]));
          });
          entry.element.querySelectorAll("[data-hero-pad]").forEach((pad, index) => {
            pad.setAttribute("cx", drawing.pads[index][0]);
            pad.setAttribute("cy", drawing.pads[index][1]);
          });
          continue;
        }
        const heading = section.querySelector(".section-heading, .contact-copy");
        let textRight = containerBox.left + gutter;
        if (!compact && heading) {
          const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
          const range = document.createRange();
          while (walker.nextNode()) {
            if (!walker.currentNode.textContent.trim()) continue;
            range.selectNodeContents(walker.currentNode);
            for (const box of range.getClientRects()) textRight = Math.max(textRight, box.right);
          }
        }
        const right = containerBox.right - gutter;
        const available = right - textRight - 56;
        const compactDrawing = compact || available < 210;
        const width = compactDrawing ? 146 : Math.min(entry.element.dataset.kind === "graph" ? 360 : 390, available);
        const height = compactDrawing ? 28 : width * 240 / 420;
        const top = compactDrawing ? sectionBox.top + 25 : (heading?.getBoundingClientRect().top ?? sectionBox.top + 110) - 12;
        entry.top = top + window.scrollY;
        entry.height = height;
        entry.element.style.left = `${right - width - origin.left}px`;
        entry.element.style.top = `${top - origin.top}px`;
        entry.element.style.width = `${Math.max(0, width)}px`;
        entry.element.style.height = `${Math.max(0, height)}px`;
        entry.element.dataset.compact = String(compactDrawing);
        entry.element.setAttribute("viewBox", compactDrawing ? "0 0 420 80" : "0 0 420 240");
      }
      update();
    };
    const queueMeasure = () => { if (!disposed && !frame) frame = requestAnimationFrame(measure); };
    const observer = new ResizeObserver(queueMeasure);
    const main = document.getElementById("main-content");
    if (main) observer.observe(main);
    entries.forEach(({ section }) => { if (section) observer.observe(section); });
    const unsubscribe = generation.front.on("change", update);
    window.addEventListener("resize", queueMeasure, { passive: true });
    document.fonts?.ready.then(() => { if (!disposed) queueMeasure(); });
    measure();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      unsubscribe();
      observer.disconnect();
      visibility.disconnect();
      document.removeEventListener("visibilitychange", syncMotion);
      window.removeEventListener("resize", queueMeasure);
    };
  }, [generation, disabled, paused]);

  return (
    <div ref={host} className="circuit-backdrop" aria-hidden="true">
      {layouts.map(({ section, kind }) => (
        <svg key={section} className={`section-circuit section-circuit-${kind}`} data-circuit-section={section} data-kind={kind} data-state="pending" viewBox="0 0 420 240" fill="none" focusable="false">
          {kind === "hero" ? <HeroCircuitDrawing /> : <CircuitDrawing kind={kind} />}
        </svg>
      ))}
    </div>
  );
}
