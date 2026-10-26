import { useEffect, useRef } from "react";
import { createDetectorScene } from "@/lib/detector-scene";
import "./detector-scene.css";

const asset = (path) => `${import.meta.env.BASE_URL}${path}`;

/** WebGL layer of the hero. Titles, controls and links stay in normal HTML. */
export default function DetectorScene({
  projects,
  stage,
  activeIndex,
  paused,
  holding,
  reducedMotion,
  theme,
  scrollProgress,
  onRequestActive,
  onOpen,
  onReady,
  onFail,
}) {
  const host = useRef(null);
  const canvas = useRef(null);
  const labels = useRef(null);
  const controller = useRef(null);
  const options = useRef({ activeIndex, paused, holding, reducedMotion, theme });
  const callbacks = useRef({ onRequestActive, onOpen, onReady, onFail });
  useEffect(() => {
    callbacks.current = { onRequestActive, onOpen, onReady, onFail };
  });
  useEffect(() => {
    const scene = createDetectorScene({
      canvas: canvas.current,
      host: host.current,
      stage: stage.current,
      labelLayer: labels.current,
      projects: projects.map((project) => ({ ...project, image: asset(project.image) })),
      options: options.current,
      onRequestActive: (index) => callbacks.current.onRequestActive?.(index),
      onOpen: (index) => callbacks.current.onOpen?.(index),
      onReady: () => callbacks.current.onReady?.(),
      onFail: () => callbacks.current.onFail?.(),
    });
    controller.current = scene;
    return () => {
      scene.dispose();
      controller.current = null;
    };
  }, [projects, stage]);
  useEffect(() => {
    options.current = { activeIndex, paused, holding, reducedMotion, theme };
    controller.current?.update(options.current);
  }, [activeIndex, paused, holding, reducedMotion, theme]);
  useEffect(() => {
    if (!scrollProgress) return undefined;
    controller.current?.setScroll(scrollProgress.get());
    return scrollProgress.on("change", (value) => controller.current?.setScroll(value));
  }, [scrollProgress]);
  return (
    <div className="detector" ref={host}>
      <canvas ref={canvas} />
      <div className="detector-labels" ref={labels} />
    </div>
  );
}
