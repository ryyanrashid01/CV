import { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { Logo } from "@/components/logo";
import { useMediaQuery } from "@/lib/use-active-section";

const ease = [0.2, 0.8, 0.2, 1];

/** Rises into place once, the first time it scrolls into view. */
export function Reveal({ as = "div", children, delay = 0, y = 36, amount = 0.2, ...props }) {
  const Component = motion[as];
  return (
    <Component
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.9, delay, ease }}
      {...props}
    >
      {children}
    </Component>
  );
}

/** The ruled line that opens each section: index and name left, a note right. */
export function SectionRule({ index, label, note }) {
  return (
    <Reveal className="section-rule" y={0}>
      <p className="eyebrow">
        <span className="eyebrow-index brk">{index}</span>
        {label}
      </p>
      {note && <p className="eyebrow">{note}</p>}
    </Reveal>
  );
}

/**
 * Heading lines slide up from behind a mask. The unclipped line wrapper
 * watches the viewport, since the hidden inner text never intersects it.
 * `muted` dims lines from that index on.
 */
export function SplitHeading({ as = "h2", lines, muted, className = "", delay = 0, ...props }) {
  const Component = as;
  return (
    <Component className={`display ${className}`} {...props}>
      {lines.map((line, index) => (
        <motion.span
          className="line"
          key={index}
          initial="hidden"
          whileInView="shown"
          viewport={{ once: true, amount: 0.5 }}
        >
          <motion.span
            className={muted !== undefined && index >= muted ? "muted" : undefined}
            variants={{
              hidden: { y: "110%" },
              shown: { y: "0%", transition: { duration: 1, delay: delay + index * 0.09, ease } },
            }}
          >
            {line}
          </motion.span>
        </motion.span>
      ))}
    </Component>
  );
}

/** A button or link whose label rolls on hover; primary actions also pull toward the pointer. */
export function Button({
  href,
  variant = "primary",
  icon: Icon,
  magnetic = false,
  className = "",
  children,
  ref: forwardedRef,
  ...props
}) {
  const ref = useRef(null);
  const setRef = (node) => {
    ref.current = node;
    if (typeof forwardedRef === "function") forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  };
  const reduce = useReducedMotion();
  const x = useSpring(0, { stiffness: 260, damping: 18, mass: 0.6 });
  const y = useSpring(0, { stiffness: 260, damping: 18, mass: 0.6 });
  const pull = magnetic && !reduce;
  const Component = href ? motion.a : motion.button;
  return (
    <Component
      ref={setRef}
      href={href}
      type={href ? undefined : "button"}
      className={`btn btn-${variant} ${className}`}
      style={pull ? { x, y } : undefined}
      onPointerMove={
        pull
          ? (event) => {
              if (event.pointerType !== "mouse") return;
              const box = ref.current.getBoundingClientRect();
              x.set((event.clientX - box.left - box.width / 2) * 0.28);
              y.set((event.clientY - box.top - box.height / 2) * 0.4);
            }
          : undefined
      }
      onPointerLeave={
        pull
          ? () => {
              x.set(0);
              y.set(0);
            }
          : undefined
      }
      {...props}
    >
      <span className="btn-label">
        <span>{children}</span>
        <span aria-hidden="true">{children}</span>
      </span>
      {Icon && <Icon className="btn-icon" aria-hidden="true" />}
    </Component>
  );
}

/** Tilts its content toward the pointer with a soft glare. */
export function Tilt({ children, className = "", max = 6, as = "div" }) {
  const Component = motion[as];
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const rotateX = useSpring(0, { stiffness: 180, damping: 18 });
  const rotateY = useSpring(0, { stiffness: 180, damping: 18 });
  const move = (event) => {
    if (reduce || event.pointerType !== "mouse") return;
    const box = ref.current.getBoundingClientRect();
    const px = (event.clientX - box.left) / box.width;
    const py = (event.clientY - box.top) / box.height;
    rotateY.set((px - 0.5) * max * 2);
    rotateX.set((0.5 - py) * max * 2);
    ref.current.style.setProperty("--glare-x", `${(px * 100).toFixed(1)}%`);
    ref.current.style.setProperty("--glare-y", `${(py * 100).toFixed(1)}%`);
  };
  const leave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };
  return (
    <Component
      ref={ref}
      className={`tilt ${className}`}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      onPointerMove={move}
      onPointerLeave={leave}
    >
      {children}
      <span className="tilt-glare" aria-hidden="true" />
    </Component>
  );
}

const wrap = (min, max, value) => {
  const range = max - min;
  return ((((value - min) % range) + range) % range) + min;
};

/** Words that drift sideways and speed up with scroll, reversing when you scroll back. */
export function Marquee({ items, speed = 3 }) {
  const reduce = useReducedMotion();
  const offset = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const boost = useTransform(velocity, [-2000, 0, 2000], [-5, 0, 5], { clamp: false });
  const direction = useRef(-1);
  const x = useTransform(offset, (value) => `${wrap(-25, 0, value)}%`);
  useAnimationFrame((_, delta) => {
    if (reduce) return;
    const factor = boost.get();
    if (factor < 0) direction.current = 1;
    else if (factor > 0) direction.current = -1;
    const step = direction.current * speed * (delta / 1000);
    offset.set(offset.get() + step + step * Math.abs(factor));
  });
  const group = (copy) => (
    <span className="marquee-group" key={copy}>
      {items.map((item) => (
        <span className="marquee-item" key={item}>
          {item}
          <span className="marquee-glyph brk" />
        </span>
      ))}
    </span>
  );
  return (
    <div className="marquee" aria-hidden="true">
      <motion.div className="marquee-track" style={{ x }}>
        {[0, 1, 2, 3].map(group)}
      </motion.div>
    </div>
  );
}

const targets = "a, button, summary, [data-cursor]";

/** A bracket that follows the pointer and locks onto controls like a detection. */
export function BracketCursor() {
  const fine = useMediaQuery("(hover: hover) and (pointer: fine)");
  const reduce = useReducedMotion();
  const enabled = fine && !reduce;
  const element = useRef(null);
  const spring = { stiffness: 520, damping: 42, mass: 0.6 };
  const x = useSpring(-100, spring);
  const y = useSpring(-100, spring);
  const width = useSpring(22, spring);
  const height = useSpring(22, spring);
  useEffect(() => {
    if (!enabled) return undefined;
    let locked = null;
    let pointer = { x: -100, y: -100 };
    const node = element.current;
    const place = () => {
      if (locked && locked.isConnected) {
        const box = locked.getBoundingClientRect();
        const pad = 6;
        x.set(box.left - pad);
        y.set(box.top - pad);
        width.set(box.width + pad * 2);
        height.set(box.height + pad * 2);
        // Keep the label on screen: below targets near the top, right-aligned near the right edge.
        node.dataset.below = String(box.top < 48);
        node.dataset.end = String(box.left + 160 > window.innerWidth);
      } else {
        x.set(pointer.x - 11);
        y.set(pointer.y - 11);
        width.set(22);
        height.set(22);
      }
    };
    const lockOnto = (element) => {
      const target = element instanceof Element ? element.closest(targets) : null;
      const next = target && !target.closest("[data-cursor-ignore]") ? target : null;
      if (next !== locked) {
        locked = next;
        node.dataset.locked = String(!!locked);
        node.querySelector(".cursor-tag").textContent = locked?.dataset.cursor || "";
      }
    };
    const move = (event) => {
      pointer = { x: event.clientX, y: event.clientY };
      lockOnto(event.target);
      node.dataset.visible = "true";
      place();
    };
    // A click can open a dialog or move content under a still pointer, so look again.
    let recheck = 0;
    const click = () => {
      clearTimeout(recheck);
      recheck = setTimeout(() => {
        lockOnto(document.elementFromPoint(pointer.x, pointer.y));
        place();
      }, 120);
    };
    const hide = () => {
      node.dataset.visible = "false";
    };
    window.addEventListener("pointermove", move, { passive: true });
    // Content scrolls under a still pointer, so re-target on scroll too.
    const scrolled = () => {
      lockOnto(document.elementFromPoint(pointer.x, pointer.y));
      place();
    };
    window.addEventListener("scroll", scrolled, { passive: true });
    window.addEventListener("click", click, true);
    document.documentElement.addEventListener("pointerleave", hide);
    return () => {
      clearTimeout(recheck);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("scroll", scrolled);
      window.removeEventListener("click", click, true);
      document.documentElement.removeEventListener("pointerleave", hide);
    };
  }, [enabled, x, y, width, height]);
  if (!enabled) return null;
  return (
    <motion.div
      ref={element}
      className="cursor brk"
      style={{ x, y, width, height }}
      aria-hidden="true"
      data-visible="false"
    >
      <span className="cursor-dot" />
      <span className="cursor-tag" />
    </motion.div>
  );
}

/** Plays once per visit: the mark locks on, then the page wipes in from below. */
export function Intro() {
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(() => {
    try {
      return !sessionStorage.getItem("intro-seen");
    } catch {
      return true;
    }
  });
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!visible) return undefined;
    try {
      sessionStorage.setItem("intro-seen", "1");
    } catch {
      /* Without storage the intro may replay on reload. */
    }
    const controls = animate(0, 99, {
      duration: 0.8,
      ease: "easeOut",
      onUpdate: (value) => setCount(Math.round(value)),
    });
    return () => controls.stop();
  }, [visible]);
  if (!visible || reduce) return null;
  return (
    <motion.div
      className="intro"
      initial={{ clipPath: "inset(0% 0% 0% 0%)" }}
      animate={{ clipPath: "inset(0% 0% 100% 0%)" }}
      transition={{ delay: 1, duration: 0.75, ease: [0.7, 0, 0.2, 1] }}
      onAnimationComplete={() => setVisible(false)}
      aria-hidden="true"
    >
      <motion.div
        initial={{ scale: 1.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.3, 1.4, 0.4, 1] }}
      >
        <Logo />
      </motion.div>
      <div className="intro-meta">
        <span>Locking on</span>
        <span>{`0.${String(count).padStart(2, "0")}`}</span>
      </div>
    </motion.div>
  );
}
