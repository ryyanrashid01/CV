import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useReducedMotion } from "motion/react";
import "./content-assembly.css";

const AssemblyContext = createContext(null);
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

function createAssemblyRegistry(generation, disabled) {
  const entries = new Set();
  let observer;

  const collectParts = (element) => {
    const parts = [];
    const visit = (parent) => {
      for (const child of parent.children) {
        if (child.hasAttribute("data-generation")) continue;
        if (child.querySelector("[data-generation]")) visit(child);
        else if (!child.hasAttribute("aria-hidden")) parts.push(child);
      }
    };
    visit(element);
    return parts;
  };
  const apply = (entry) => {
    const { element, top, height } = entry;
    const front = generation?.front.get() ?? Infinity;
    const progress = entry.immediate
      ? 1
      : Math.max(entry.progress, clamp((front - top + 30) / Math.max(1, height)));
    entry.progress = progress;
    entry.memory.current = progress;
    element.style.setProperty("--assembly-progress", progress.toFixed(5));
    element.dataset.generationProgress = progress.toFixed(5);
    element.dataset.assembly = progress >= 0.99999 ? "settled" : progress > 0 ? "forming" : "pending";

    for (const part of entry.parts) {
      const next = entry.immediate || progress >= 0.99999
        ? 1
        : Math.max(part.progress, clamp((front - part.start) / part.span));
      if (next === part.progress && part.applied) continue;
      part.progress = next;
      part.applied = true;
      part.element.style.setProperty("--part-progress", next.toFixed(4));
      part.element.dataset.generationPartProgress = next.toFixed(4);
      part.element.dataset.partState = next >= 1 ? "settled" : next > 0 ? "forming" : "pending";
    }
    for (const tile of entry.tiles) {
      const next = entry.immediate ? 1 : clamp((progress - tile.start) / 0.2);
      if (next === tile.progress) continue;
      tile.progress = next;
      tile.element.style.setProperty("--tile-progress", next.toFixed(4));
      tile.element.dataset.tileState = next >= 1 ? "settled" : next > 0 ? "forming" : "pending";
    }
    const forming = entry.tiles.filter((tile) => tile.progress > 0.025 && tile.progress < 0.98);
    const lights = new Set([0.12, 0.5, 0.88].map((position) => forming[Math.floor((forming.length - 1) * position)]).filter(Boolean));
    for (const tile of entry.tiles) {
      const lit = lights.has(tile);
      if (lit === tile.lit) continue;
      tile.lit = lit;
      tile.element.toggleAttribute("data-tile-spark", lit);
    }
  };
  const measureEntry = (entry) => {
    const bounds = entry.element.getBoundingClientRect();
    entry.top = bounds.top + window.scrollY;
    entry.height = bounds.height;
    if (entry.image) {
      const tiles = entry.element.querySelectorAll(".assembly-fragment");
      if (entry.tiles.length !== tiles.length || entry.tiles[0]?.element !== tiles[0]) {
        entry.tiles = Array.from(tiles, (tile) => ({
          element: tile,
          start: Number(tile.dataset.tileStart),
          progress: -1,
        }));
      }
    }
    entry.parts = entry.image ? [] : collectParts(entry.element).map((element, index) => {
      const box = element.getBoundingClientRect();
      const start = box.top + window.scrollY - 28 + (index % 3) * 7;
      element.dataset.generationPart = "true";
      return {
        element,
        start,
        span: Math.max(38, Math.min(100, box.height * 0.65)),
        progress: Number(element.dataset.generationPartProgress) || 0,
      };
    });
  };
  return {
    disabled,
    generation,
    register(element, motionDisabled, memory) {
      const entry = {
        element,
        memory,
        image: element.dataset.generation === "image",
        immediate: disabled || motionDisabled || !generation,
        progress: Math.max(memory.current, Number(element.dataset.generationProgress) || 0),
        tiles: Array.from(element.dataset.generation === "image" ? element.querySelectorAll(".assembly-fragment") : []).map((tile) => ({
          element: tile,
          start: Number(tile.dataset.tileStart),
          progress: -1,
        })),
      };
      entries.add(entry);
      measureEntry(entry);
      apply(entry);
      observer?.observe(element);
      return () => {
        observer?.unobserve(element);
        entries.delete(entry);
      };
    },
    measure() {
      // Layout is read only when it changes; animation updates write cached parts.
      entries.forEach(measureEntry);
      entries.forEach(apply);
    },
    update() {
      entries.forEach(apply);
    },
    observe(nextObserver) {
      observer = nextObserver;
      entries.forEach(({ element }) => observer?.observe(element));
    },
  };
}

export function AssemblyProvider({ generation, disabled = false, children }) {
  const registry = useMemo(
    () => createAssemblyRegistry(generation, disabled),
    [generation, disabled],
  );

  useLayoutEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      registry.measure();
    };
    const queueMeasure = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    const unsubscribe = generation?.front.on("change", registry.update);
    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(queueMeasure);
    registry.observe(observer);
    observer?.observe(document.body);
    window.addEventListener("resize", queueMeasure, { passive: true });
    document.addEventListener("generationlayout", measure);
    measure();
    return () => {
      cancelAnimationFrame(frame);
      unsubscribe?.();
      observer?.disconnect();
      registry.observe(null);
      window.removeEventListener("resize", queueMeasure);
      document.removeEventListener("generationlayout", measure);
    };
  }, [generation, registry]);

  return (
    <AssemblyContext.Provider value={registry}>
      {children}
    </AssemblyContext.Provider>
  );
}

function useAssemblyProgress(motionDisabled = false) {
  const target = useRef(null);
  const progress = useRef(0);
  const registry = useContext(AssemblyContext);
  const reducedMotion = useReducedMotion();
  const immediate =
    !registry?.generation ||
    registry.disabled ||
    reducedMotion ||
    motionDisabled;

  useLayoutEffect(() => {
    const element = target.current;
    if (!element || !registry) return undefined;
    return registry.register(element, immediate, progress);
  }, [immediate, registry]);

  return { target, immediate };
}

export function Assemble({
  children,
  className = "",
  delay = 0,
  motionDisabled = false,
}) {
  const { target, immediate } = useAssemblyProgress(motionDisabled);
  return (
    <div
      ref={target}
      className={`assembly-block ${className}`}
      data-generation="block"
      data-generation-progress={immediate ? "1" : "0"}
      data-assembly={immediate ? "settled" : "pending"}
      data-assembly-delay={delay || undefined}
    >
      {children}
    </div>
  );
}

function ImageFragments() {
  const columns = 24;
  const rows = 14;
  // Three edge seeds send irregular, overlapping fronts into the image plane.
  const seeds = [
    { x: 0, y: 0, delay: 0 },
    { x: 23, y: 0, delay: 0.1 },
    { x: 0, y: 13, delay: 0.16 },
  ];
  return (
    <div className="assembly-fragments" aria-hidden="true">
      {Array.from({ length: columns * rows }, (_, index) => {
        const column = index % columns;
        const row = Math.floor(index / columns);
        const noise = ((column * 17 + row * 29) % 13) / 13;
        const arrivals = seeds.map((seed) => ({
          distance: Math.hypot((column - seed.x) / columns, (row - seed.y) / rows) * 0.72 + seed.delay,
          seed,
        }));
        const nearest = arrivals.reduce((first, next) => next.distance < first.distance ? next : first);
        const start = Math.min(0.76, nearest.distance + noise * 0.085);
        return (
          <span
            key={index}
            className="assembly-fragment"
            data-tile-start={start.toFixed(4)}
            data-tile-state="pending"
            style={{
              "--fragment-column": column,
              "--fragment-row": row,
              "--fragment-columns": columns,
              "--fragment-rows": rows,
              "--fragment-drift-x": `${column < 12 ? -1.4 : 1.4}px`,
              "--fragment-drift-y": `${row < 7 ? -1.4 : 1.4}px`,
            }}
          />
        );
      })}
    </div>
  );
}

export function AssembleImage({
  src,
  alt,
  width,
  height,
  className = "",
  loading = "lazy",
  motionDisabled = false,
}) {
  const { target, immediate } = useAssemblyProgress(motionDisabled);
  const original = useRef(null);
  const [fragmentsReady, setFragmentsReady] = useState(
    loading !== "lazy" || typeof IntersectionObserver === "undefined",
  );

  useLayoutEffect(() => {
    // Newly mounted fragments join the existing frontier before their first paint.
    if (fragmentsReady) document.dispatchEvent(new Event("generationlayout"));
  }, [fragmentsReady]);

  useEffect(() => {
    const element = original.current?.parentElement;
    if (!element) return undefined;
    const activate = () => {
      element.style.setProperty(
        "--assembly-image-url",
        `url(${JSON.stringify(src)})`,
      );
      element.dataset.fragmentsReady = "true";
    };
    if (loading !== "lazy" || typeof IntersectionObserver === "undefined") {
      activate();
      return undefined;
    }
    // Keep the semantic image lazy and mount its decorative mosaic only nearby.
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        activate();
        if (element.dataset.assembly !== "settled") setFragmentsReady(true);
        observer.disconnect();
      },
      { rootMargin: "600px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [loading, src]);

  useEffect(() => {
    const element = target.current;
    const image = original.current;
    if (!element || !image) return undefined;
    const measure = () => {
      const boxStyle = getComputedStyle(element);
      const boxWidth = parseFloat(boxStyle.width) || element.clientWidth;
      const boxHeight = parseFloat(boxStyle.height) || element.clientHeight;
      const imageWidth = image.naturalWidth || Number(width) || boxWidth;
      const imageHeight = image.naturalHeight || Number(height) || boxHeight;
      if (!boxWidth || !boxHeight || !imageWidth || !imageHeight) return;
      const scale = Math.max(boxWidth / imageWidth, boxHeight / imageHeight);
      const coverWidth = imageWidth * scale;
      const coverHeight = imageHeight * scale;
      element.style.setProperty("--assembly-width", `${boxWidth}px`);
      element.style.setProperty("--assembly-height", `${boxHeight}px`);
      element.style.setProperty("--cover-width", `${coverWidth}px`);
      element.style.setProperty("--cover-height", `${coverHeight}px`);
      element.style.setProperty(
        "--cover-left",
        `${(boxWidth - coverWidth) / 2}px`,
      );
      element.style.setProperty(
        "--cover-top",
        `${(boxHeight - coverHeight) / 2}px`,
      );
      element.style.setProperty(
        "--assembly-image-filter",
        getComputedStyle(image).filter,
      );
    };
    measure();
    image.addEventListener("load", measure);
    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(measure);
    observer?.observe(element);
    return () => {
      image.removeEventListener("load", measure);
      observer?.disconnect();
    };
  }, [height, src, target, width]);

  return (
    <div
      ref={target}
      className={`assembly-image ${className}`}
      data-generation="image"
      data-generation-progress={immediate ? "1" : "0"}
      data-assembly={immediate ? "settled" : "pending"}
    >
      <img
        ref={original}
        className="assembly-source"
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        decoding="async"
      />
      {fragmentsReady && !immediate && <ImageFragments />}
    </div>
  );
}
