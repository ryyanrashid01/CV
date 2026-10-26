import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { IconArrowUpRight } from "@tabler/icons-react";
import { disciplineNames, projects } from "@/data/portfolio";
import { DetectionFrame } from "@/components/detection-frame";
import { SectionRule, SplitHeading, Tilt } from "@/components/motion-kit";
import { useMediaQuery } from "@/lib/use-active-section";

const filters = [
  { id: "all", label: "All work" },
  { id: "ai", label: "AI & research" },
  { id: "software", label: "Software & systems" },
];
const groups = {
  ai: ["Machine intelligence", "Autonomous systems"],
  software: ["Production systems", "Algorithms and interaction", "Autonomous systems"],
};
const pad = (value) => String(value).padStart(2, "0");
const ease = [0.2, 0.8, 0.2, 1];

function ProjectCard({ project, index, drift, openProject }) {
  return (
    <motion.article
      className="work-item"
      layout="position"
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.25 } }}
      transition={{ duration: 0.7, ease, delay: Math.min(index * 0.06, 0.24) }}
    >
      <motion.div className="work-drift" style={drift ? { y: drift } : undefined}>
        <button
          className="project-open"
          type="button"
          onClick={(event) => openProject(project, event.currentTarget)}
          data-cursor="open case 0.99"
        >
          <Tilt as="span" className="project-media">
            <DetectionFrame project={project} as="span" />
          </Tilt>
          <span className="project-heading">
            <span className="project-index" aria-hidden="true">
              {pad(index + 1)}
            </span>
            <span className="project-title">{project.title}</span>
            <IconArrowUpRight className="project-arrow" aria-hidden="true" />
          </span>
        </button>
        <div className="project-meta" data-discipline={project.discipline}>
          <span className="tag tag-class">{disciplineNames[project.discipline]}</span>
          <span className="tag">{project.category}</span>
        </div>
        <p className="project-description">{project.description}</p>
        <p className="project-outcome">
          <mark>{project.outcome}</mark>
        </p>
        <ul className="project-tech" aria-label="Technologies">
          {project.tech.slice(0, 4).map((technology) => (
            <li key={technology}>{technology}</li>
          ))}
        </ul>
      </motion.div>
    </motion.article>
  );
}

export default function Work({ openProject }) {
  const [filter, setFilter] = useState("all");
  const grid = useRef(null);
  const reduce = useReducedMotion();
  const wide = useMediaQuery("(min-width: 1024px)");
  const { scrollYProgress } = useScroll({ target: grid, offset: ["start end", "end start"] });
  // The two columns travel at different speeds, so the grid feels layered.
  const rise = useTransform(scrollYProgress, [0, 1], [90, -90]);
  const sink = useTransform(scrollYProgress, [0, 1], [-30, 30]);
  const visible = projects.filter((project) => filter === "all" || groups[filter].includes(project.category));
  const parallax = wide && !reduce;
  return (
    <section className="section work" id="work" aria-labelledby="work-title">
      <div className="container">
        <SectionRule index="01" label="Selected work" note="2023 — 2026" />
        <div className="section-head">
          <SplitHeading id="work-title" lines={["Ideas into", "working systems."]} muted={1} />
          <p>From applied intelligence to the infrastructure that makes it useful.</p>
        </div>
        <div className="work-toolbar">
          <div className="filters" role="group" aria-label="Filter projects">
            {filters.map((item) => (
              <button
                key={item.id}
                type="button"
                className="filter"
                aria-pressed={filter === item.id}
                onClick={() => setFilter(item.id)}
              >
                {filter === item.id && (
                  <motion.span
                    layoutId="filter-mark"
                    className="filter-mark brk"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                {item.label}
              </button>
            ))}
          </div>
          <p className="work-count" aria-live="polite">
            {pad(visible.length)} projects
          </p>
        </div>
        <div className="work-grid" ref={grid} data-filtered={filter !== "all" || undefined}>
          <AnimatePresence mode="popLayout">
            {visible.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
                drift={parallax ? (index % 2 ? rise : sink) : undefined}
                openProject={openProject}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
