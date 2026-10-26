import { useRef, useState } from "react";
import { MotionConfig, useReducedMotion } from "motion/react";
import Hero from "@/components/hero";
import SiteHeader from "@/components/site-header";
import Work from "@/components/work-section";
import Experience from "@/components/experience-section";
import Research from "@/components/research-section";
import Capabilities from "@/components/capabilities-section";
import Contact from "@/components/contact-section";
import ProjectDialog from "@/components/project-dialog";
import { BracketCursor, Intro, Marquee } from "@/components/motion-kit";
import { useActiveSection } from "@/lib/use-active-section";
import { useScrollLock, useSmoothScroll } from "@/lib/use-smooth-scroll";
import { useTheme } from "@/lib/use-theme";
import "./components/sections.css";

const sections = [
  { id: "top", label: "Intro" },
  { id: "work", label: "Work" },
  { id: "experience", label: "Experience" },
  { id: "research", label: "Research" },
  { id: "capabilities", label: "Capabilities" },
  { id: "contact", label: "Contact" },
];
const sectionIds = sections.map((section) => section.id);
const marqueeItems = ["Computer vision", "Machine learning", "Production systems", "C++20 · Python · TypeScript", "Research"];
const pad = (value) => String(value).padStart(2, "0");

// The hero waits for the intro on a first visit and starts at once afterwards.
const firstIntroDelay = () => {
  try {
    if (sessionStorage.getItem("intro-seen")) return 0.1;
  } catch {
    return 0.1;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 1.15;
};

function SectionCounter({ active }) {
  const index = Math.max(0, sectionIds.indexOf(active));
  return (
    <p className="counter" aria-hidden="true" data-hidden={index === 0 || active === "contact"}>
      <b className="brk">{pad(index)}</b>/ {pad(sections.length - 1)} {sections[index].label}
    </p>
  );
}

export default function App() {
  const [theme, toggleTheme] = useTheme();
  const reduce = useReducedMotion();
  const [introDelay] = useState(firstIntroDelay);
  const [project, setProject] = useState(null);
  const projectTrigger = useRef(null);
  const activeSection = useActiveSection(sectionIds);
  useSmoothScroll(!reduce);
  useScrollLock(!!project);
  const openProject = (item, trigger) => {
    projectTrigger.current = trigger;
    setProject(item);
  };
  return (
    <MotionConfig reducedMotion="user">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Intro />
      <BracketCursor />
      <SiteHeader theme={theme} toggleTheme={toggleTheme} activeSection={activeSection} />
      <main id="main-content">
        <Hero theme={theme} paused={!!project} introDelay={introDelay} openProject={openProject} />
        <Marquee items={marqueeItems} />
        <Work openProject={openProject} />
        <Experience openProject={openProject} />
        <Research openProject={openProject} />
        <Capabilities openProject={openProject} />
        <Contact />
      </main>
      <SectionCounter active={activeSection} />
      <ProjectDialog project={project} onClose={() => setProject(null)} triggerRef={projectTrigger} />
    </MotionConfig>
  );
}
