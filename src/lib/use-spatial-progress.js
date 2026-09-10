import { useEffect } from "react";
import { useMotionValue, useScroll } from "motion/react";

const chapters = [
  "top",
  "work",
  "experience",
  "research",
  "capabilities",
  "contact",
];

/** Actual chapter bounds keep the spatial journey aligned after filtering or resizing. */
export function useSpatialProgress() {
  const { scrollY } = useScroll();
  const progress = useMotionValue(0);
  useEffect(() => {
    let stations = [];
    const update = () => {
      if (stations.length < 2) return;
      const position = scrollY.get();
      let index = 0;
      while (index < stations.length - 2 && position > stations[index + 1])
        index += 1;
      const span = Math.max(1, stations[index + 1] - stations[index]);
      const fraction = Math.max(
        0,
        Math.min(1, (position - stations[index]) / span),
      );
      progress.set((index + fraction) / (stations.length - 1));
    };
    const measure = () => {
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      stations = chapters.map((id, index) => {
        const element = document.getElementById(id);
        if (!element || index === 0) return 0;
        return Math.max(
          0,
          Math.min(
            maxScroll,
            element.getBoundingClientRect().top +
              scrollY.get() -
              window.innerHeight * 0.27,
          ),
        );
      });
      update();
    };
    const observer = new ResizeObserver(measure);
    const main = document.getElementById("main-content");
    if (main) observer.observe(main);
    window.addEventListener("resize", measure);
    const unsubscribe = scrollY.on("change", update);
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (!cancelled) measure();
    });
    measure();
    return () => {
      cancelled = true;
      observer.disconnect();
      unsubscribe();
      window.removeEventListener("resize", measure);
    };
  }, [progress, scrollY]);
  return progress;
}
