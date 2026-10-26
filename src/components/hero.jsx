import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { animate, motion, useReducedMotion, useScroll } from "motion/react";
import {
  IconArrowDownRight,
  IconArrowLeft,
  IconArrowRight,
  IconArrowUpRight,
  IconDownload,
  IconPlayerPause,
  IconPlayerPlay,
} from "@tabler/icons-react";
import { disciplineNames, heroProjectIds, profile, projects } from "@/data/portfolio";
import { Button } from "@/components/motion-kit";
import { DetectionFrame } from "@/components/detection-frame";
import "./hero.css";

const DetectorScene = lazy(() => import("@/components/detector-scene"));
const asset = (path) => `${import.meta.env.BASE_URL}${path}`;
const heroProjects = heroProjectIds.map((id) => projects.find((project) => project.id === id));
const pad = (value) => String(value).padStart(2, "0");
const ease = [0.2, 0.8, 0.2, 1];

/** The bracket locks onto one word while its confidence climbs. */
function EngineeredMark({ delay }) {
  const reduce = useReducedMotion();
  const [score, setScore] = useState(0.21);
  useEffect(() => {
    if (reduce) return undefined;
    const controls = animate(0.21, 0.99, {
      delay: delay + 0.45,
      duration: 1.2,
      ease: "easeOut",
      onUpdate: setScore,
    });
    return () => controls.stop();
  }, [reduce, delay]);
  return (
    <span className="hero-mark">
      <motion.span
        className="hero-mark-box brk"
        aria-hidden="true"
        initial={reduce ? false : { opacity: 0, scale: 1.3 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: delay + 0.3, duration: 0.9, ease: [0.3, 1.35, 0.4, 1] }}
      />
      engineered
      <motion.span
        className="hero-mark-tag"
        aria-hidden="true"
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay + 0.55, duration: 0.5, ease }}
      >
        skill {(reduce ? 0.99 : score).toFixed(2)}
      </motion.span>
    </span>
  );
}

export default function Hero({ theme, paused, introDelay, openProject }) {
  const section = useRef(null);
  const stage = useRef(null);
  const caseStudy = useRef(null);
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [holding, setHolding] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [scene, setScene] = useState("loading");
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end start"] });
  const current = heroProjects[active];
  const step = (direction) => setActive((index) => (index + direction + heroProjects.length) % heroProjects.length);
  const line = (index) => ({
    initial: reduce ? false : { y: "110%" },
    animate: { y: "0%" },
    transition: { delay: introDelay + index * 0.1, duration: 1.05, ease },
  });
  const rise = (index) => ({
    initial: reduce ? false : { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: introDelay + 0.35 + index * 0.08, duration: 0.9, ease },
  });
  return (
    <section className="hero" id="top" ref={section} aria-labelledby="hero-title">
      <div className="hero-scene" aria-hidden="true">
        {scene !== "failed" && (
          <Suspense fallback={null}>
            <DetectorScene
              projects={heroProjects}
              stage={stage}
              activeIndex={active}
              paused={paused || stopped}
              holding={holding}
              reducedMotion={!!reduce}
              theme={theme}
              scrollProgress={scrollYProgress}
              onRequestActive={setActive}
              onOpen={(index) => openProject(heroProjects[index], caseStudy.current)}
              onReady={() => setScene("ready")}
              onFail={() => setScene("failed")}
            />
          </Suspense>
        )}
      </div>
      <div className="container hero-inner">
        <div className="hero-copy">
          <motion.p className="eyebrow" {...rise(-2)}>
            <span className="eyebrow-index brk">MR</span>
            {profile.name} · {profile.location.split(",")[0]}
          </motion.p>
          <h1 id="hero-title" className="display hero-title">
            <span className="line">
              <motion.span {...line(0)}>Intelligence,</motion.span>
            </span>
            <span className="line hero-mark-line">
              <motion.span {...line(1)}>
                <EngineeredMark delay={introDelay} />
              </motion.span>
            </span>
            <span className="line">
              <motion.span {...line(2)}>for reality.</motion.span>
            </span>
          </h1>
          <motion.p className="hero-lede" {...rise(0)}>
            AI and software engineer working across computer vision, machine learning and
            production software.
          </motion.p>
          <motion.div className="hero-actions" {...rise(1)}>
            <Button href="#work" icon={IconArrowDownRight} magnetic data-cursor="explore 0.99">
              See the work
            </Button>
            <Button href={asset(profile.resume)} variant="ghost" icon={IconDownload} download data-cursor="download 1.00">
              Download CV
            </Button>
          </motion.div>
          <motion.p className="hero-status" {...rise(2)}>
            <span className="hero-pulse" aria-hidden="true" />
            Now: Research Assistant, Khalifa University
          </motion.p>
        </div>
        <div className="hero-stage" ref={stage}>
          {scene === "failed" && <DetectionFrame project={current} mode="static" className="hero-fallback" eager />}
        </div>
        <motion.div
          className="hero-readout"
          role="group"
          aria-label="Featured projects"
          onPointerEnter={() => setHolding(true)}
          onPointerLeave={() => setHolding(false)}
          onFocus={() => setHolding(true)}
          onBlur={() => setHolding(false)}
          {...rise(3)}
        >
          <p className="hero-index" aria-hidden="true">
            <b className="brk">{pad(active + 1)}</b> / {pad(heroProjects.length)}
          </p>
          <p className="hero-now" aria-live="polite">
            <span className="tag tag-class" data-discipline={current.discipline}>
              {disciplineNames[current.discipline]}
            </span>
            <strong>{current.title}</strong>
            <span className="hero-outcome">{current.outcome}</span>
          </p>
          <div className="hero-controls">
            <button className="icon-button" type="button" aria-label="Previous project" onClick={() => step(-1)}>
              <IconArrowLeft />
            </button>
            <button className="icon-button" type="button" aria-label="Next project" onClick={() => step(1)}>
              <IconArrowRight />
            </button>
            <button
              className="icon-button"
              type="button"
              aria-pressed={stopped}
              aria-label={stopped ? "Resume project rotation" : "Pause project rotation"}
              onClick={() => setStopped((value) => !value)}
            >
              {stopped ? <IconPlayerPlay /> : <IconPlayerPause />}
            </button>
            <Button
              ref={caseStudy}
              variant="ghost"
              className="btn-small"
              icon={IconArrowUpRight}
              onClick={(event) => openProject(current, event.currentTarget)}
              data-cursor="open 0.99"
            >
              Case study
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
