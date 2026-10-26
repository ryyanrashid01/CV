import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import {
  IconArrowUp,
  IconArrowUpRight,
  IconBrandGithub,
  IconBrandLinkedin,
  IconCheck,
  IconCopy,
  IconDownload,
} from "@tabler/icons-react";
import { profile } from "@/data/portfolio";
import { Logo } from "@/components/logo";
import { Button, Reveal, SectionRule } from "@/components/motion-kit";
import { useMediaQuery } from "@/lib/use-active-section";

const asset = (path) => `${import.meta.env.BASE_URL}${path}`;
const link = (label) => profile.links.find((item) => item.label === label).href;
const clock = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Dubai",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

/** Letters thin out near the pointer, using Archivo's weight axis. */
function ProximityHeading({ id, lines }) {
  const root = useRef(null);
  const reduce = useReducedMotion();
  const fine = useMediaQuery("(hover: hover) and (pointer: fine)");
  useEffect(() => {
    if (reduce || !fine) return undefined;
    const element = root.current;
    const letters = [...element.querySelectorAll(".prox-letter")];
    const weights = letters.map(() => 700);
    let centers = [];
    let pointer = null;
    let frame = 0;
    const measure = () => {
      centers = letters.map((letter) => {
        const box = letter.getBoundingClientRect();
        return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
      });
    };
    const tick = () => {
      frame = 0;
      let moving = false;
      letters.forEach((letter, index) => {
        const center = centers[index];
        const distance = pointer ? Math.hypot(pointer.x - center.x, pointer.y - center.y) : Infinity;
        const target = 700 - 480 * Math.max(0, 1 - distance / 240) ** 1.4;
        weights[index] += (target - weights[index]) * 0.16;
        if (Math.abs(target - weights[index]) > 0.5) moving = true;
        letter.style.fontWeight = weights[index].toFixed(0);
      });
      if (moving) frame = requestAnimationFrame(tick);
    };
    const move = (event) => {
      if (!pointer) measure();
      pointer = { x: event.clientX, y: event.clientY };
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const leave = () => {
      pointer = null;
      if (!frame) frame = requestAnimationFrame(tick);
    };
    element.addEventListener("pointermove", move);
    element.addEventListener("pointerleave", leave);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(frame);
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerleave", leave);
      window.removeEventListener("resize", measure);
      letters.forEach((letter) => letter.style.removeProperty("font-weight"));
    };
  }, [reduce, fine]);
  return (
    <h2 id={id} className="display contact-title" ref={root} aria-label={lines.join(" ")}>
      {lines.map((line, lineIndex) => (
        <span className={`contact-line ${lineIndex ? "muted" : ""}`} key={line} aria-hidden="true">
          {line.split(" ").map((word, wordIndex) => (
            <span className="prox-word" key={wordIndex}>
              {[...word].map((letter, letterIndex) => (
                <span className="prox-letter" key={letterIndex}>
                  {letter}
                </span>
              ))}
            </span>
          ))}
        </span>
      ))}
    </h2>
  );
}

function EmailCopy() {
  const [state, setState] = useState("idle");
  useEffect(() => {
    if (state === "idle") return undefined;
    const timeout = setTimeout(() => setState("idle"), 2600);
    return () => clearTimeout(timeout);
  }, [state]);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setState("copied");
    } catch {
      setState("error");
    }
  };
  return (
    <div className="email-row">
      <a href={`mailto:${profile.email}`} data-cursor="say hi 0.97">
        {profile.email}
      </a>
      <button
        className="icon-button"
        type="button"
        onClick={copy}
        aria-label={state === "copied" ? "Email copied" : "Copy email address"}
        data-cursor={state === "copied" ? "copied 1.00" : "copy"}
      >
        {state === "copied" ? <IconCheck /> : <IconCopy />}
      </button>
      <span className="email-status" role="status">
        {state === "copied" ? "Copied" : state === "error" ? "Select the address to copy it." : ""}
      </span>
    </div>
  );
}

function LiveClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <p className="clock">
      <span className="hero-pulse" aria-hidden="true" />
      Abu Dhabi <time dateTime={now.toISOString()}>{clock.format(now)}</time> GST
    </p>
  );
}

export default function Contact() {
  return (
    <section className="section contact" id="contact" aria-labelledby="contact-title">
      <div className="container">
        <SectionRule index="05" label="Contact" note="Abu Dhabi · Open to remote" />
        <ProximityHeading id="contact-title" lines={["Your next idea.", "Let’s build it."]} />
        <Reveal className="contact-row">
          <p>
            Applied AI, thoughtful software, and interesting problems. I’d love to hear what you’re
            working on.
          </p>
          <div className="contact-actions">
            <Button href={`mailto:${profile.email}`} icon={IconArrowUpRight} magnetic data-cursor="say hi 0.98">
              Get in touch
            </Button>
            <EmailCopy />
          </div>
        </Reveal>
      </div>
      <footer className="container site-footer">
        <div className="footer-brand">
          <Logo />
          <p>
            {profile.name}
            <span>AI + software engineer</span>
          </p>
        </div>
        <div className="footer-meta">
          <LiveClock />
          <p>24.45° N, 54.38° E</p>
        </div>
        <nav className="footer-links" aria-label="Elsewhere">
          <a href={link("GitHub")} target="_blank" rel="noreferrer" data-cursor="github">
            <IconBrandGithub aria-hidden="true" />
            GitHub
          </a>
          <a href={link("LinkedIn")} target="_blank" rel="noreferrer" data-cursor="linkedin">
            <IconBrandLinkedin aria-hidden="true" />
            LinkedIn
          </a>
          <a href={asset(profile.resume)} download data-cursor="download 1.00">
            <IconDownload aria-hidden="true" />
            CV
          </a>
          <a href="#top" data-cursor="top">
            <IconArrowUp aria-hidden="true" />
            Back to top
          </a>
        </nav>
      </footer>
    </section>
  );
}
