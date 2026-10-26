import { useEffect } from "react";
import Lenis from "lenis";

let instance = null;

/** The running Lenis instance, or null when native scrolling is in use. */
export const getLenis = () => instance;

/** Eased wheel scrolling and anchor jumps. Off for reduced motion. */
export function useSmoothScroll(enabled) {
  useEffect(() => {
    if (!enabled) return undefined;
    instance = new Lenis({ autoRaf: true, anchors: true, lerp: 0.11 });
    return () => {
      instance.destroy();
      instance = null;
    };
  }, [enabled]);
}

/** Scrolls to a section after an overlay has released the page. */
export function scrollToSection(id) {
  setTimeout(() => {
    const target = document.getElementById(id);
    if (!target) return;
    if (instance) instance.scrollTo(target, { force: true });
    else target.scrollIntoView({ behavior: "smooth" });
  }, 80);
}

/** Stops smooth scrolling while a dialog owns the page. */
export function useScrollLock(locked) {
  useEffect(() => {
    if (!locked) return undefined;
    getLenis()?.stop();
    return () => getLenis()?.start();
  }, [locked]);
}
