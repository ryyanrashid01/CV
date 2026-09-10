import { useLayoutEffect, useMemo } from "react";
import { useMotionValue } from "motion/react";

const INTRO_DURATION = 1500;
const SOURCE_ACTIVATION = 220;
const SCROLL_DURATION = 150;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/** One persistent, document-space frontier for the source, wave and content. */
export function usePageGeneration({ disabled = false } = {}) {
  const front = useMotionValue(0);
  const intro = useMotionValue(0);
  const scrollY = useMotionValue(0);
  const generation = useMemo(
    () => ({ front, intro, scrollY }),
    [front, intro, scrollY],
  );

  useLayoutEffect(() => {
    let animationFrame = 0;
    let layoutFrame = 0;
    let documentHeight = 0;
    let heroBottom = 0;
    let scrollTarget = front.get();
    let scrollStart = front.get();
    let scrollStartedAt = 0;
    let disposed = false;
    const introStartedAt = performance.now();

    const measure = () => {
      documentHeight = Math.ceil(
        Math.max(
          document.documentElement.scrollHeight,
          document.body.scrollHeight,
          document.body.getBoundingClientRect().bottom + window.scrollY,
          innerHeight,
        ),
      );
      const hero = document.getElementById("top");
      heroBottom = hero
        ? hero.getBoundingClientRect().bottom + window.scrollY
        : innerHeight;
      scrollY.set(window.scrollY);
    };
    const advance = (next) => front.set(Math.max(front.get(), next));
    const readingLine = (position = window.scrollY) => {
      const atBottom = position + innerHeight >= documentHeight - 3;
      return atBottom
        ? documentHeight
        : Math.min(documentHeight, position + innerHeight * 0.9);
    };
    const cancelAnimation = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    };
    const finishIntro = () => {
      intro.set(1);
      advance(heroBottom);
    };
    const settleTo = (position) => {
      cancelAnimation();
      finishIntro();
      advance(position);
      scrollTarget = front.get();
    };
    const revealAll = () => {
      measure();
      settleTo(documentHeight);
    };
    const animate = (now) => {
      animationFrame = 0;
      if (intro.get() < 1) {
        const elapsed = now - introStartedAt;
        intro.set(clamp(elapsed / INTRO_DURATION, 0, 1));
        const progress = clamp(
          (elapsed - SOURCE_ACTIVATION) / (INTRO_DURATION - SOURCE_ACTIVATION),
          0,
          1,
        );
        // The first connections deliver readable identity and actions promptly;
        // the remaining source activity settles into the margin by 1.5 seconds.
        advance(heroBottom * (1 - (1 - progress) ** 3));
        if (intro.get() < 1) animationFrame = requestAnimationFrame(animate);
      } else if (scrollTarget > front.get()) {
        const progress = clamp((now - scrollStartedAt) / SCROLL_DURATION, 0, 1);
        advance(
          scrollStart +
            (scrollTarget - scrollStart) * (1 - (1 - progress) ** 3),
        );
        if (progress < 1) animationFrame = requestAnimationFrame(animate);
      }
    };
    const followScroll = () => {
      scrollY.set(window.scrollY);
      if (disabled) {
        advance(documentHeight);
        return;
      }
      // Scrolling, including browser find/scroll restoration, never waits for the intro.
      if (intro.get() < 1) {
        settleTo(readingLine());
        return;
      }
      const next = Math.max(scrollTarget, readingLine());
      if (next <= front.get()) return;
      scrollStart = front.get();
      scrollTarget = next;
      scrollStartedAt = performance.now();
      if (!animationFrame) animationFrame = requestAnimationFrame(animate);
    };
    const updateLayout = () => {
      layoutFrame = 0;
      measure();
      if (disabled) revealAll();
      else if (intro.get() >= 1) followScroll();
      document.dispatchEvent(new Event("generationlayout"));
    };
    const queueLayout = () => {
      if (!disposed && !layoutFrame)
        layoutFrame = requestAnimationFrame(updateLayout);
    };
    const revealDestination = (target, wholeElement = false) => {
      if (!(target instanceof Element)) return;
      measure();
      const bounds = target.getBoundingClientRect();
      let destination = bounds.top + window.scrollY + innerHeight * 0.9;
      if (wholeElement) destination = bounds.bottom + window.scrollY + 2;
      // Complete enclosing masks as well, so focus can never sit under an outer clip.
      for (let node = target; node; node = node.parentElement) {
        if (node.hasAttribute("data-generation")) {
          destination = Math.max(
            destination,
            node.getBoundingClientRect().bottom + window.scrollY + 2,
          );
        }
      }
      settleTo(Math.min(documentHeight, destination));
    };
    const hashTarget = (hash) => {
      try {
        return document.getElementById(decodeURIComponent(hash.slice(1)));
      } catch {
        return null;
      }
    };
    const onHashChange = () => {
      const target = hashTarget(window.location.hash);
      if (target) revealDestination(target);
    };
    const onAnchor = (event) => {
      const anchor =
        event.target instanceof Element
          ? event.target.closest("a[href]")
          : null;
      if (
        !anchor ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const url = new URL(anchor.href, window.location.href);
      if (
        url.origin !== location.origin ||
        url.pathname !== location.pathname ||
        url.search !== location.search ||
        !url.hash
      )
        return;
      const target = hashTarget(url.hash);
      if (target) revealDestination(target);
    };
    const onFocus = (event) => {
      if (
        event.target instanceof Element &&
        event.target.closest("[data-generation]")
      ) {
        revealDestination(event.target, true);
      }
    };
    const onFind = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "f")
        revealAll();
    };
    const onBeforeMatch = (event) => revealDestination(event.target);

    measure();
    if (disabled) revealAll();
    else if (window.location.hash && hashTarget(window.location.hash))
      onHashChange();
    else if (window.scrollY > 2) settleTo(readingLine());
    else if (intro.get() < 1) animationFrame = requestAnimationFrame(animate);

    window.addEventListener("scroll", followScroll, { passive: true });
    window.addEventListener("resize", queueLayout, { passive: true });
    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("beforeprint", revealAll);
    document.addEventListener("click", onAnchor, true);
    document.addEventListener("focusin", onFocus);
    document.addEventListener("keydown", onFind);
    document.addEventListener("beforematch", onBeforeMatch);
    document.addEventListener("toggle", queueLayout, true);
    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(queueLayout);
    resizeObserver?.observe(document.body);
    resizeObserver?.observe(document.documentElement);
    const hero = document.getElementById("top");
    if (hero) resizeObserver?.observe(hero);
    const mutationObserver = new MutationObserver((records) => {
      // SVG drawing changes do not change document layout. Observing those
      // would recreate the field on every frame and erase its live traces.
      if (records.some((record) => !(record.target instanceof Element && record.target.closest(".generation-field, .neural-stage")))) queueLayout();
    });
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["open", "hidden"],
    });
    document.fonts?.ready.then(queueLayout);

    return () => {
      disposed = true;
      cancelAnimation();
      cancelAnimationFrame(layoutFrame);
      resizeObserver?.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("scroll", followScroll);
      window.removeEventListener("resize", queueLayout);
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("beforeprint", revealAll);
      document.removeEventListener("click", onAnchor, true);
      document.removeEventListener("focusin", onFocus);
      document.removeEventListener("keydown", onFind);
      document.removeEventListener("beforematch", onBeforeMatch);
      document.removeEventListener("toggle", queueLayout, true);
    };
  }, [disabled, front, intro, scrollY]);

  return generation;
}
