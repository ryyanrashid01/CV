import { useEffect, useRef, useState } from "react";

const asset = (path) => `${import.meta.env.BASE_URL}${path}`;

/**
 * A project image with detection boxes over its real regions. Boxes appear on
 * hover ("hover"), when scrolled into view ("inview"), or always ("static").
 */
export function DetectionFrame({ project, mode = "hover", className = "", eager = false, as: Root = "figure" }) {
  const frame = useRef(null);
  const [active, setActive] = useState(false);
  useEffect(() => {
    if (mode !== "inview") return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setActive(true);
        observer.disconnect();
      },
      { threshold: 0.45 },
    );
    observer.observe(frame.current);
    return () => observer.disconnect();
  }, [mode]);
  return (
    <Root
      ref={frame}
      className={`det-frame ${className}`}
      data-mode={mode}
      data-active={active || undefined}
      data-discipline={project.discipline}
    >
      <img
        src={asset(project.image)}
        alt={project.imageAlt}
        width="1440"
        height="900"
        loading={eager ? "eager" : "lazy"}
        decoding="async"
      />
      <span className="det-layer" aria-hidden="true">
        {project.detections?.map((box, index) => (
          <span
            key={`${box.label}-${index}`}
            className={`det-box brk ${box.y < 7 ? "is-low" : ""}`}
            style={{
              left: `${box.x}%`,
              top: `${box.y}%`,
              width: `${box.w}%`,
              height: `${box.h}%`,
              "--i": index,
            }}
          >
            <span className="det-tag">
              {box.label} {box.score}
            </span>
          </span>
        ))}
      </span>
    </Root>
  );
}
