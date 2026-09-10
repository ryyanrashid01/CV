import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Dialog } from "radix-ui";
import { MotionConfig } from "motion/react";
import {
  AssemblyProvider,
  Assemble as Reveal,
  AssembleImage,
} from "@/components/content-assembly";
import { usePageGeneration } from "@/lib/use-page-generation";
import { useSpatialProgress } from "@/lib/use-spatial-progress";
import { GenerationField } from "@/components/generation-field";
import { CircuitBackdrop } from "@/components/circuit-backdrop";
import Research from "@/components/research-section";
import {
  IconArrowDown,
  IconArrowUpRight,
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrain,
  IconCheck,
  IconCode,
  IconCopy,
  IconCpu,
  IconDownload,
  IconMail,
  IconMenu2,
  IconMoon,
  IconPlayerPause,
  IconPlayerPlay,
  IconSun,
  IconTopologyStar3,
  IconX,
} from "@tabler/icons-react";
import { profile, projects, experience, capabilities } from "@/data/portfolio";

const NeuralNetwork = lazy(() => import("@/components/neural-network"));
const asset = (path) => `${import.meta.env.BASE_URL}${path}`;
const navigation = [
  { id: "work", label: "Work" },
  { id: "experience", label: "Experience" },
  { id: "research", label: "Research" },
  { id: "contact", label: "Contact" },
];
const modes = [
  {
    id: "ai",
    label: "Applied AI",
    compactLabel: "Applied AI",
    icon: IconBrain,
    description: "Models that learn. Systems that understand.",
  },
  {
    id: "software",
    label: "Production software",
    compactLabel: "Software",
    icon: IconCode,
    description: "From the first commit to everyday use.",
  },
  {
    id: "research",
    label: "Research & systems",
    compactLabel: "Research",
    icon: IconTopologyStar3,
    description: "Turning complex questions into working tools.",
  },
];
const filters = [
  { id: "all", label: "All work" },
  { id: "ai", label: "AI & research" },
  { id: "software", label: "Software & systems" },
];

function useTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("theme") || "dark";
    } catch {
      return "dark";
    }
  });
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.dataset.theme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#080910" : "#f3f4f8");
    try {
      localStorage.setItem("theme", theme);
    } catch {
      /* Theme still works without storage. */
    }
  }, [theme]);
  return [
    theme,
    () => setTheme((value) => (value === "dark" ? "light" : "dark")),
  ];
}

function useReducedMotionPreference() {
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = (event) => setReducedMotion(event.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reducedMotion;
}

function Header({ theme, toggleTheme, activeSection }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <header className="site-header">
        <div className="header-inner">
          <a
            className="wordmark"
            href="#top"
            title="Home"
          >
            <span>MR</span>
            <span className="wordmark-name">
              Ryyan Rashid<span>AI + Software Engineer</span>
            </span>
          </a>
          <nav className="desktop-navigation" aria-label="Primary navigation">
            {navigation.map((item) => (
              <a
                href={`#${item.id}`}
                key={item.id}
                aria-current={
                  activeSection === item.id ? "location" : undefined
                }
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="header-actions">
            <button
              className="icon-button theme-toggle"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
              onClick={toggleTheme}
            >
              {theme === "dark" ? <IconSun /> : <IconMoon />}
            </button>
            <a className="header-cv" href={asset(profile.resume)} download>
              <IconDownload />
              <span>CV</span>
            </a>
            <Dialog.Root open={menuOpen} onOpenChange={setMenuOpen}>
              <Dialog.Trigger asChild>
                <button
                  className="icon-button mobile-menu"
                  aria-label="Open navigation"
                >
                  <IconMenu2 />
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="dialog-overlay" />
                <Dialog.Content className="mobile-navigation-panel">
                  <Dialog.Title className="menu-title">
                    Explore the connections.
                  </Dialog.Title>
                  <Dialog.Description className="sr-only">
                    Navigate the portfolio of Mohammad Ryyan Rashid.
                  </Dialog.Description>
                  <Dialog.Close asChild>
                    <button
                      className="icon-button dialog-close"
                      aria-label="Close navigation"
                    >
                      <IconX />
                    </button>
                  </Dialog.Close>
                  <nav aria-label="Mobile navigation">
                    {navigation.map((item) => (
                      <a
                        href={`#${item.id}`}
                        key={item.id}
                        onClick={() => setMenuOpen(false)}
                      >
                        {item.label}
                        <IconArrowUpRight />
                      </a>
                    ))}
                  </nav>
                  <a
                    className="button button-primary"
                    href={asset(profile.resume)}
                    download
                  >
                    Download CV
                    <IconDownload />
                  </a>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </div>
        </div>
      </header>
    </>
  );
}

function Hero({ mode, setMode, paused, setPaused, reducedMotion }) {
  const selected = modes.find((item) => item.id === mode);
  return (
    <section
      className="hero section-anchor"
      id="top"
      aria-labelledby="hero-title"
    >
      <div className="hero-shade" aria-hidden="true" />
      <div className="container hero-inner">
        <Reveal className="hero-copy">
          <p className="eyebrow hero-name">{profile.name}</p>
          <h1 id="hero-title">
            Intelligence,
            <br />
            <span>engineered</span>
            <br />
            for reality.
          </h1>
          <p className="hero-description">
            <strong>AI + software engineer.</strong> I work across computer
            vision, machine learning, and production software.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#work">
              Explore my work
              <IconArrowUpRight />
            </a>
            <a
              className="button button-secondary"
              href={asset(profile.resume)}
              download
            >
              Download CV
              <IconDownload />
            </a>
          </div>
        </Reveal>
        <Reveal className="hero-bottom">
          <div
            className="mode-controls"
            role="group"
            aria-label="Explore engineering disciplines"
          >
            {modes.map(({ id, label, compactLabel, icon: Icon }) => (
              <button
                key={id}
                className={`mode-button ${mode === id ? "is-active" : ""}`}
                aria-pressed={mode === id}
                onClick={() => setMode(id)}
              >
                <Icon />
                <span className="mode-label-full">{label}</span>
                <span className="mode-label-compact">{compactLabel}</span>
              </button>
            ))}
          </div>
          <div className="scene-caption">
            <p aria-live="polite">{selected.description}</p>
            <a href="#work">
              View{" "}
              {mode === "software" ? "software & systems" : "AI & research"}{" "}
              work
              <IconArrowUpRight />
            </a>
          </div>
          <button
            className="icon-button motion-toggle"
            onClick={() => setPaused(!paused)}
            aria-label={
              reducedMotion
                ? "Motion disabled by system preference"
                : paused
                  ? "Resume page motion"
                  : "Pause page motion"
            }
            aria-pressed={paused || !!reducedMotion}
            disabled={!!reducedMotion}
          >
            {paused || reducedMotion ? <IconPlayerPlay /> : <IconPlayerPause />}
          </button>
        </Reveal>
      </div>
    </section>
  );
}

function IntellibinVisual() {
  return (
    <div
      className="intellibin-visual"
      role="img"
      aria-label="Concept diagram: two model backbones combine to classify four waste categories"
    >
      <div className="vision-input">
        <IconCpu />
        <span>Visual input</span>
      </div>
      <div className="vision-path" aria-hidden="true">
        <span />
        <span />
      </div>
      <div className="vision-models">
        <div>
          <IconBrain />
          <span>Backbone A</span>
        </div>
        <div>
          <IconBrain />
          <span>Backbone B</span>
        </div>
      </div>
      <div className="vision-path reverse" aria-hidden="true">
        <span />
        <span />
      </div>
      <div className="vision-output">
        <span className="output-orb" />
        <span>4 categories</span>
      </div>
      <span className="diagram-caption">
        Dual-backbone classification architecture
      </span>
    </div>
  );
}

function ProjectCard({ project, index, openProject, onFocusProject }) {
  return (
    <Reveal
      className={`project project-${project.id}`}
      delay={Math.min(index * 0.04, 0.12)}
    >
      <button
        className="project-open"
        onClick={(event) => openProject(project, event.currentTarget)}
        aria-label={`Explore ${project.title}`}
        onPointerEnter={() => onFocusProject(project.id)}
        onPointerLeave={() => onFocusProject(null)}
        onFocus={() => onFocusProject(project.id)}
        onBlur={() => onFocusProject(null)}
      >
        <div className="project-media">
          {project.image ? (
            <AssembleImage
              src={asset(project.image)}
              alt={project.imageAlt}
              loading="lazy"
              width="1440"
              height="900"
            />
          ) : (
            <IntellibinVisual />
          )}
          <span className="project-open-icon" aria-hidden="true">
            <IconArrowUpRight />
          </span>
        </div>
        <div className="project-heading">
          <h3>{project.title}</h3>
          <span>{project.category}</span>
        </div>
      </button>
      <p className="project-description">{project.description}</p>
      <p className="project-outcome">{project.outcome}</p>
      <div className="project-technologies">
        {project.tech.slice(0, 4).map((technology) => (
          <span key={technology}>{technology}</span>
        ))}
      </div>
    </Reveal>
  );
}

function Work({ openProject, filter, setFilter, onFocusProject }) {
  const filtered = projects.filter(
    (project) =>
      filter === "all" ||
      (filter === "ai"
        ? ["Machine intelligence", "Autonomous systems"].includes(
            project.category,
          )
        : [
            "Production systems",
            "Algorithms and interaction",
            "Autonomous systems",
          ].includes(project.category)),
  );
  return (
    <section
      className="section section-anchor work-section"
      id="work"
      aria-labelledby="work-title"
    >
      <div className="container">
        <Reveal className="section-heading">
          <p className="eyebrow">Selected work</p>
          <h2 id="work-title">
            Ideas into
            <br />
            <span className="muted-heading">working systems.</span>
          </h2>
          <p>
            From applied intelligence to the infrastructure that makes it
            useful.
          </p>
        </Reveal>
        <Reveal className="work-toolbar">
          <div
            className="filter-controls"
            role="group"
            aria-label="Filter projects"
          >
            {filters.map((item) => (
              <button
                key={item.id}
                aria-pressed={filter === item.id}
                onClick={() => setFilter(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <span className="project-count" aria-live="polite">
            {filtered.length} projects
          </span>
        </Reveal>
        <div
          className={`project-grid ${filter !== "all" ? "is-filtered" : ""}`}
        >
          {filtered.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              openProject={openProject}
              onFocusProject={onFocusProject}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function Experience({ openProject }) {
  return (
    <section
      className="section section-anchor experience-section"
      id="experience"
      aria-labelledby="experience-title"
    >
      <div className="container experience-layout">
        <Reveal className="section-heading experience-intro">
          <p className="eyebrow">Experience</p>
          <h2 id="experience-title">
            Built through
            <br />
            <span className="muted-heading">experience.</span>
          </h2>
          <p>
            Research depth. Production ownership.
            <br />
            Real problems, end to end.
          </p>
          <a className="text-link" href={asset(profile.resume)} download>
            Full experience in my CV
            <IconDownload />
          </a>
        </Reveal>
        <div className="experience-timeline">
          {experience.map((entry) => (
            <Reveal className="experience-entry" key={entry.id}>
              <span className="timeline-node" aria-hidden="true" />
              <p className="entry-location">{entry.location}</p>
              <h3>{entry.organization}</h3>
              <div className="entry-roles">
                {entry.roles.map((role) => (
                  <div key={role.title}>
                    <strong>
                      {role.title}
                      {role.detail && <small>{role.detail}</small>}
                    </strong>
                    <span>{role.dates}</span>
                  </div>
                ))}
              </div>
              <p className="experience-summary">{entry.points[0]}</p>
              {entry.points.length > 1 && (
                <details className="experience-details">
                  <summary>
                    More about this role
                    <IconArrowDown />
                  </summary>
                  <div>
                    {entry.points.slice(1).map((point) => (
                      <p key={point}>{point}</p>
                    ))}
                  </div>
                </details>
              )}
              {entry.projectIds.length > 0 && (
                <div className="connected-projects">
                  <span>Connected work</span>
                  {entry.projectIds.map((id) => {
                    const project = projects.find((item) => item.id === id);
                    return (
                      <button
                        key={id}
                        onClick={(event) =>
                          openProject(project, event.currentTarget)
                        }
                      >
                        {project.id === "act"
                          ? "ACT"
                          : project.id === "conformance"
                            ? "UAS Conformance"
                            : project.title}
                        <IconArrowUpRight />
                      </button>
                    );
                  })}
                </div>
              )}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Capabilities({ openProject, setMode }) {
  const [selectedId, setSelectedId] = useState("ai");
  const selected = capabilities.find((item) => item.id === selectedId);
  return (
    <section
      className="section section-anchor capabilities-section"
      id="capabilities"
      aria-labelledby="capabilities-title"
    >
      <div className="container">
        <Reveal className="section-heading">
          <p className="eyebrow">Connected capabilities</p>
          <h2 id="capabilities-title">
            Different disciplines.
            <br />
            <span className="muted-heading">One connected mindset.</span>
          </h2>
          <p>Select a discipline to see the tools and the work behind it.</p>
        </Reveal>
        <Reveal className="capabilities-layout">
          <div
            className="capability-selectors"
            role="group"
            aria-label="Select a discipline"
          >
            {capabilities.map((item, index) => {
              const Icon = [IconBrain, IconCode, IconTopologyStar3, IconCpu][
                index
              ];
              return (
                <button
                  className={selectedId === item.id ? "is-active" : ""}
                  aria-pressed={selectedId === item.id}
                  key={item.id}
                  onClick={() => {
                    setSelectedId(item.id);
                    setMode(item.id === "ai" ? "ai" : "software");
                  }}
                >
                  <span className="capability-icon">
                    <Icon />
                  </span>
                  <span>{item.name}</span>
                  <IconArrowUpRight className="capability-arrow" />
                </button>
              );
            })}
          </div>
          <div className="capability-content" aria-live="polite">
            <p className="capability-summary">{selected.summary}</p>
            <div className="skill-list">
              {selected.skills.map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>
            <div className="capability-proof">
              <span className="eyebrow">Used in real work</span>
              {selected.projectIds.map((id) => {
                const project = projects.find((item) => item.id === id);
                return (
                  <button
                    key={id}
                    onClick={(event) =>
                      openProject(project, event.currentTarget)
                    }
                  >
                    {project.title}
                    <IconArrowUpRight />
                  </button>
                );
              })}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Contact() {
  const [copyState, setCopyState] = useState("idle");
  useEffect(() => {
    if (copyState === "idle") return;
    const timeout = setTimeout(() => setCopyState("idle"), 3000);
    return () => clearTimeout(timeout);
  }, [copyState]);
  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
  };
  return (
    <section
      className="contact-section section-anchor"
      id="contact"
      aria-labelledby="contact-title"
    >
      <div className="container">
        <Reveal className="contact-copy">
          <p className="eyebrow">Make the connection</p>
          <h2 id="contact-title">
            Your next idea.
            <br />
            <span>Let’s build it.</span>
          </h2>
          <p>
            Applied AI, thoughtful software, and interesting problems.
            <br />
            I’d love to hear what you’re working on.
          </p>
          <a className="button button-primary" href={`mailto:${profile.email}`}>
            Get in touch
            <IconArrowUpRight />
          </a>
          <div className="email-row">
            <a href={`mailto:${profile.email}`}>{profile.email}</a>
            <button
              className="icon-button"
              onClick={copyEmail}
              aria-label={
                copyState === "copied" ? "Email copied" : "Copy email address"
              }
            >
              {copyState === "copied" ? <IconCheck /> : <IconCopy />}
            </button>
            <span className="copy-status" role="status">
              {copyState === "copied"
                ? "Copied"
                : copyState === "error"
                  ? "Select the address to copy it."
                  : ""}
            </span>
          </div>
        </Reveal>
        <Reveal>
          <footer className="site-footer">
            <div>
              <a className="footer-name" href="#top">
                {profile.name}
              </a>
              <span>{profile.location}</span>
            </div>
            <div className="footer-links">
              <a
                href={
                  profile.links.find((item) => item.label === "GitHub").href
                }
                target="_blank"
                rel="noreferrer"
              >
                <IconBrandGithub />
                GitHub
                <IconArrowUpRight />
              </a>
              <a
                href={
                  profile.links.find((item) => item.label === "LinkedIn").href
                }
                target="_blank"
                rel="noreferrer"
              >
                <IconBrandLinkedin />
                LinkedIn
                <IconArrowUpRight />
              </a>
              <a href={asset(profile.resume)} download>
                Download CV
                <IconDownload />
              </a>
            </div>
            <p>AI + Software Engineer</p>
          </footer>
        </Reveal>
      </div>
    </section>
  );
}

function ProjectDialog({ project, onClose, triggerRef }) {
  return (
    <Dialog.Root
      open={!!project}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content
          className="project-dialog"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            triggerRef.current?.focus();
          }}
        >
          <Dialog.Close asChild>
            <button
              className="icon-button dialog-close"
              aria-label="Close project details"
            >
              <IconX />
            </button>
          </Dialog.Close>
          {project && (
            <>
              <p className="eyebrow">{project.category}</p>
              <Dialog.Title>{project.title}</Dialog.Title>
              <Dialog.Description>{project.description}</Dialog.Description>
              <p className="dialog-outcome">{project.outcome}</p>
              <div className="dialog-media">
                {project.image ? (
                  <img
                    src={asset(project.image)}
                    alt={project.imageAlt}
                    width="1440"
                    height="900"
                  />
                ) : (
                  <IntellibinVisual />
                )}
              </div>
              <div className="dialog-project-meta">
                <span>{project.organization}</span>
                <div>
                  {project.tech.map((tech) => (
                    <span key={tech}>{tech}</span>
                  ))}
                </div>
              </div>
              <h3>Inside the project</h3>
              <div className="dialog-details">
                {project.details.map((detail) => (
                  <p key={detail}>{detail}</p>
                ))}
              </div>
              {project.links.length > 0 && (
                <div className="dialog-links">
                  {project.links.map((link) => (
                    <a
                      className="button button-primary"
                      href={link.href}
                      key={link.href}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {link.label}
                      <IconArrowUpRight />
                    </a>
                  ))}
                </div>
              )}
              <a
                className="text-link"
                href="#contact"
                onClick={() => {
                  triggerRef.current = null;
                  onClose();
                }}
              >
                Talk about this project
                <IconMail />
              </a>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default function App() {
  const [theme, toggleTheme] = useTheme();
  const [mode, setMode] = useState("ai");
  const [paused, setPaused] = useState(false);
  const [workFilter, setWorkFilter] = useState("all");
  const [focusedProject, setFocusedProject] = useState(null);
  const [activeSection, setActiveSection] = useState("top");
  const [project, setProject] = useState(null);
  const projectTrigger = useRef(null);
  const reducedMotion = useReducedMotionPreference();
  const generation = usePageGeneration({ disabled: paused || reducedMotion });
  const spatialProgress = useSpatialProgress();
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        }
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: 0 },
    );
    document
      .querySelectorAll("main > section[id]")
      .forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);
  const selectMode = (nextMode) => {
    setMode(nextMode);
    setWorkFilter(nextMode === "software" ? "software" : "ai");
  };
  const selectFilter = (nextFilter) => {
    setWorkFilter(nextFilter);
    if (nextFilter !== "all") setMode(nextFilter === "ai" ? "ai" : "software");
  };
  const openProject = (item, trigger) => {
    projectTrigger.current = trigger;
    setProject(item);
  };
  return (
    <MotionConfig reducedMotion={reducedMotion ? "always" : "never"}>
      <div className="portfolio-app" data-section={activeSection}>
        <div className="neural-stage" aria-hidden="true">
          <Suspense fallback={null}>
            <NeuralNetwork
              mode={mode}
              activeSection={activeSection}
              paused={paused || !!project}
              reducedMotion={!!reducedMotion}
              theme={theme}
              generation={generation}
              scrollProgress={spatialProgress}
              focusedProject={focusedProject}
            />
          </Suspense>
        </div>
        <CircuitBackdrop generation={generation} disabled={paused || reducedMotion} paused={!!project} />
        <GenerationField
          generation={generation}
          disabled={paused || reducedMotion}
        />
        <Header
          theme={theme}
          toggleTheme={toggleTheme}
          activeSection={activeSection}
        />
        <aside className="journey-navigation" aria-label="Page sections">
          {[
            { id: "top", label: "Introduction" },
            ...navigation.slice(0, 3),
            { id: "capabilities", label: "Capabilities" },
            navigation[3],
          ].map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              aria-label={item.label}
              aria-current={activeSection === item.id ? "location" : undefined}
            >
              <span className="journey-dot" />
              <span className="journey-label">{item.label}</span>
            </a>
          ))}
        </aside>
        <AssemblyProvider
          generation={generation}
          disabled={paused || reducedMotion}
        >
          <main id="main-content">
            <Hero
              mode={mode}
              setMode={selectMode}
              paused={paused}
              setPaused={setPaused}
              reducedMotion={reducedMotion}
            />
            <Work
              openProject={openProject}
              filter={workFilter}
              setFilter={selectFilter}
              onFocusProject={setFocusedProject}
            />
            <Experience openProject={openProject} />
            <Research openProject={openProject} />
            <Capabilities openProject={openProject} setMode={setMode} />
            <Contact />
          </main>
        </AssemblyProvider>
        <ProjectDialog
          project={project}
          onClose={() => setProject(null)}
          triggerRef={projectTrigger}
        />
      </div>
    </MotionConfig>
  );
}
