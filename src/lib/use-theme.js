import { useEffect, useState } from "react";
import { flushSync } from "react-dom";

const query = "(prefers-color-scheme: dark)";
const colors = { light: "#f1f1ec", dark: "#110c17" };
const storedTheme = () => {
  try {
    return localStorage.getItem("theme");
  } catch {
    return null;
  }
};

/** Follows the system theme until the visitor picks one, then remembers it. */
export function useTheme() {
  const [theme, setTheme] = useState(
    () => document.documentElement.dataset.theme || (window.matchMedia(query).matches ? "dark" : "light"),
  );
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", colors[theme]);
  }, [theme]);
  useEffect(() => {
    const media = window.matchMedia(query);
    const follow = (event) => {
      if (!storedTheme()) setTheme(event.matches ? "dark" : "light");
    };
    media.addEventListener("change", follow);
    return () => media.removeEventListener("change", follow);
  }, []);

  // A square wipe grows out of the toggle, in the brand's own geometry.
  const toggle = (origin) => {
    const next = theme === "dark" ? "light" : "dark";
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* The choice still applies for this visit. */
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!document.startViewTransition || reduce || !origin) {
      setTheme(next);
      return;
    }
    const box = origin.getBoundingClientRect();
    const transition = document.startViewTransition(() => {
      flushSync(() => setTheme(next));
      document.documentElement.dataset.theme = next;
    });
    transition.ready
      .then(() => {
        const right = window.innerWidth - box.right;
        const bottom = window.innerHeight - box.bottom;
        document.documentElement.animate(
          {
            clipPath: [
              `inset(${box.top}px ${right}px ${bottom}px ${box.left}px)`,
              "inset(0px 0px 0px 0px)",
            ],
          },
          { duration: 650, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)", pseudoElement: "::view-transition-new(root)" },
        );
      })
      .catch(() => {
        /* The browser skipped the transition; the theme has still changed. */
      });
  };
  return [theme, toggle];
}
