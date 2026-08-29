import { lazy, Suspense, useEffect, useState } from "react"
import {
  IconArrowRight,
  IconArrowUpRight,
  IconBrandGithub,
  IconBrandLinkedin,
  IconDownload,
  IconMail,
  IconMapPin,
  IconMenu2,
  IconMoon,
  IconSun,
} from "@tabler/icons-react"
import { motion, MotionConfig, useReducedMotion } from "motion/react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { TextGenerateEffect } from "@/components/ui/text-generate-effect"

const HeroGyroscope = lazy(() => import("@/components/hero-gyroscope"))

const baseUrl = import.meta.env.BASE_URL

const navigation = [
  { href: "#work", label: "Work" },
  { href: "#experience", label: "Experience" },
  { href: "#research", label: "Research" },
  { href: "#contact", label: "Contact" },
]

const experience = [
  {
    organization: "Khalifa University",
    location: "Abu Dhabi, UAE",
    roles: [
      { title: "Research Assistant", dates: "Sep 2025 - Present" },
      { title: "Visiting Researcher", dates: "Jun 2025 - Sep 2025" },
    ],
    points: [
      "Develop PRISM, a FastAPI-based UTM simulator with configurable risk models, interactive analysis, and sequential or parallel execution for TII-sponsored research deliverables.",
      "Build modular C++20 and event-driven systems for UAS evidence correlation, identity and authorization checks, trajectory analysis, and 3D airspace conformance.",
      "Lead Taqyeem, a full-stack platform for outcome-based education, CLO-PLO mapping, and interactive academic quality-assurance workflows.",
    ],
  },
  {
    organization: "Aamina Charitable Trust",
    location: "Remote / Kashmir, India",
    roles: [{ title: "Pro Bono Software Engineer", dates: "Jun 2024 - Present" }],
    points: [
      "Solely designed, deployed, and maintain a production financial-operations platform for a 10-12 person team managing 450+ beneficiaries, 370+ households, 4,600+ transactions, and more than INR 1 million in monthly payment activity.",
      "Reduced recurring administration from three people spending hours per day to less than 30 minutes total through reconciliation, recurring payments, payment runs, and digital approvals.",
      "Own PostgreSQL, Docker, Linux, Hostinger, backups, GitHub Actions, audit trails, digital signatures, QR verification, a Telegram bot, and a governed OpenRouter interface with no direct database access.",
    ],
  },
  {
    organization: "Harvard Medical School",
    location: "Boston, MA, USA",
    roles: [{ title: "Research Intern", dates: "Apr 2023 - Oct 2023" }],
    points: [
      "Developed and evaluated SVR, XGBR, MLR, and neural-network models for hydrogel porosity, pore-size distribution, and mechanical properties.",
      "Applied image processing and genetic algorithms to biomaterials research that contributed to a manuscript under peer review.",
    ],
  },
]

const conformanceCapabilities = [
  {
    title: "Evidence Association",
    description:
      "A bounded asynchronous pipeline correlates independent tracking and Remote ID streams through spatial indexing, temporal matching, confidence scoring, ambiguity handling, and worker-thread concurrency.",
  },
  {
    title: "Reversible Context Fusion",
    description:
      "Aircraft context uses link-health hysteresis, timeouts, stale-result protection, and automatic split or recovery when previously associated evidence becomes inconsistent.",
  },
  {
    title: "Deterministic Decisions",
    description:
      "A finite-state pipeline converts verified evidence into operational states for missing identification, invalid identity, unauthorized operation, and spatial or temporal violations.",
  },
  {
    title: "3D Conformance",
    description:
      "Trajectory algorithms evaluate waypoint corridors and polygonal airspace volumes with altitude limits, time windows, and exclusion zones.",
  },
]

const capabilities = [
  {
    name: "Systems Engineering",
    detail: "C++20, CMake, concurrent processing, NATS JetStream, event-driven boundaries, typed YAML",
  },
  {
    name: "Backend and Web",
    detail: "Python, FastAPI, JavaScript, TypeScript, React, Next.js, Node.js, REST APIs",
  },
  {
    name: "Data and Applied AI",
    detail: "PostgreSQL, MongoDB, SQL, PyTorch, TensorFlow, scikit-learn, computer vision",
  },
  {
    name: "Delivery and Operations",
    detail: "Docker, GitHub Actions, CI/CD, Linux, systemd, Hostinger, DigitalOcean, backups",
  },
]

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.14 },
  transition: { duration: 0.64, ease: [0.16, 1, 0.3, 1] },
}

const externalLinkClass =
  "inline-flex min-h-11 items-center gap-2 border-b border-current py-2 text-sm font-medium text-primary transition-colors hover:text-foreground focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

function ThemeToggle() {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark")

  useEffect(() => {
    const isDark = theme === "dark"
    document.documentElement.classList.toggle("dark", isDark)
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      "content",
      isDark ? "#101312" : "#faf9f6",
    )
    localStorage.setItem("theme", theme)
  }, [theme])

  const isDark = theme === "dark"
  return (
    <Button
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className="rounded-md"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      size="icon"
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      variant="ghost"
    >
      {isDark ? (
        <IconSun aria-hidden="true" stroke={1.75} />
      ) : (
        <IconMoon aria-hidden="true" stroke={1.75} />
      )}
    </Button>
  )
}

function Header() {
  return (
    <>
      <a
        className="fixed top-3 left-3 z-[60] -translate-y-20 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-transform focus-visible:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        href="#main-content"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-40 h-16 border-b bg-background">
        <div className="mx-auto flex h-full max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <a
            className="flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            href="#top"
          >
            <span className="font-mono text-xl font-medium tracking-[-0.08em] text-primary">MR</span>
            <span className="hidden text-sm text-muted-foreground sm:inline">Software engineer</span>
          </a>

          <div className="flex items-center gap-1">
            <nav aria-label="Primary navigation" className="mr-2 hidden items-center md:flex">
              {navigation.map((item) => (
                <a
                  className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <ThemeToggle />

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  aria-label="Open navigation"
                  className="rounded-md md:hidden"
                  size="icon"
                  variant="ghost"
                >
                  <IconMenu2 aria-hidden="true" stroke={1.75} />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-sm" side="right">
                <SheetHeader className="border-b px-6 py-6">
                  <SheetTitle>Mohammad Ryyan Rashid</SheetTitle>
                  <SheetDescription>AI and software engineer</SheetDescription>
                </SheetHeader>
                <nav aria-label="Mobile navigation" className="grid px-6 py-6">
                  {navigation.map((item) => (
                    <SheetClose asChild key={item.href}>
                      <a
                        className="border-b py-5 text-2xl font-medium tracking-[-0.04em] transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        href={item.href}
                      >
                        {item.label}
                      </a>
                    </SheetClose>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  )
}

function Hero() {
  const reduceMotion = useReducedMotion()

  return (
    <section className="relative isolate overflow-hidden" id="top">
      <div aria-hidden="true" className="site-grid pointer-events-none absolute inset-0 -z-10 opacity-60" />
      <div className="mx-auto grid min-h-[calc(100dvh-4rem)] max-w-[1400px] items-center gap-12 px-4 py-12 sm:px-6 lg:grid-cols-12 lg:gap-10 lg:px-8 lg:py-16">
        <div className="min-w-0 lg:col-span-5">
          <h1 className="max-w-[8.5ch] text-[clamp(3.25rem,5.7vw,5.75rem)] leading-[0.92] font-medium tracking-[-0.07em] text-balance">
            <TextGenerateEffect words="Mohammad Ryyan Rashid" />
          </h1>
          <motion.p
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            className="mt-7 max-w-[26ch] font-mono text-lg leading-snug text-primary sm:text-xl"
            initial={reduceMotion ? undefined : { opacity: 0, y: 12 }}
            transition={{ delay: 0.28, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            AI and software engineer.
          </motion.p>
          <motion.p
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground text-pretty"
            initial={reduceMotion ? undefined : { opacity: 0, y: 12 }}
            transition={{ delay: 0.38, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            I build dependable intelligent systems, production software, and research tools for complex real-world workflows.
          </motion.p>
          <motion.div
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            className="mt-8 flex flex-wrap gap-3"
            initial={reduceMotion ? undefined : { opacity: 0, y: 12 }}
            transition={{ delay: 0.48, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <Button asChild className="h-12 rounded-md px-6 text-base" size="lg">
              <a href="#work">
                View Work
                <IconArrowRight aria-hidden="true" stroke={1.75} />
              </a>
            </Button>
            <Button
              asChild
              className="h-12 rounded-md border-border bg-background/70 px-6 text-base"
              size="lg"
              variant="outline"
            >
              <a download href={`${baseUrl}assets/Mohammad_Ryyan_Rashid_Resume.pdf`}>
                Download CV
                <IconDownload aria-hidden="true" stroke={1.75} />
              </a>
            </Button>
          </motion.div>
        </div>

        <div className="min-w-0 lg:col-span-7">
          <div className="relative aspect-[8/5] overflow-visible lg:aspect-[6/5]">
            <Suspense
              fallback={
                <img
                  alt="Mechanical systems gyroscope with three machined rings and a faceted central core"
                  className="h-full w-full object-contain"
                  fetchPriority="high"
                  height="1025"
                  src={`${baseUrl}assets/hero-gyroscope-transparent.webp`}
                  width="1535"
                />
              }
            >
              <HeroGyroscope fallbackSrc={`${baseUrl}assets/hero-gyroscope-transparent.webp`} />
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  )
}

function Highlights() {
  const items = [
    { label: "Focus", value: "AI, systems, and production software" },
    { label: "Production", value: "4,600+ financial transactions" },
    { label: "Research", value: "IEEE / ICUAS 2026" },
  ]

  return (
    <section aria-label="Career highlights" className="border-y">
      <div className="mx-auto grid max-w-[1400px] md:grid-cols-3">
        {items.map((item) => (
          <div
            className="px-4 py-7 sm:px-6 md:px-8 md:py-8 md:[&:not(:last-child)]:border-r"
            key={item.label}
          >
            <p className="font-mono text-xs text-muted-foreground">{item.label}</p>
            <p className="mt-2 text-lg font-medium tracking-[-0.025em]">{item.value}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function SelectedWork() {
  return (
    <section className="section-anchor border-b pt-24 pb-16 sm:pt-28 sm:pb-16" id="work">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <motion.div className="grid gap-5 md:grid-cols-12 md:items-end" {...reveal}>
          <div className="md:col-span-8">
            <p className="font-mono text-xs text-primary">01 / Portfolio</p>
            <h2 className="mt-4 text-[clamp(3rem,5.2vw,5.25rem)] leading-none font-medium tracking-[-0.065em]">
              Selected Work
            </h2>
          </div>
          <p className="max-w-md text-base leading-relaxed text-muted-foreground text-pretty md:col-span-4">
            Research tools, operational software, and public products built for people who depend on them.
          </p>
        </motion.div>

        <motion.article className="mt-12 grid gap-8 border-y py-10 lg:grid-cols-12 lg:items-start lg:gap-10" {...reveal}>
          <div className="lg:col-span-4 lg:py-2">
            <p className="font-mono text-xs text-primary">Operations / Accountability</p>
            <h3 className="mt-4 text-3xl font-medium tracking-[-0.045em] sm:text-4xl">
              ACT Operations Platform
            </h3>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground text-pretty">
              A private fintech web application for beneficiary accounts, donations, commitments, payments, approvals, reconciliation, audit trails, and verified documents, paired with a public accountability site.
            </p>
            <p className="mt-5 font-mono text-xs leading-relaxed text-muted-foreground">
              Next.js / TypeScript / PostgreSQL / Prisma
            </p>
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2">
              <a className={externalLinkClass} href="https://aaminatrust.org" rel="noreferrer" target="_blank">
                View Public Site
                <IconArrowUpRight aria-hidden="true" className="size-4" stroke={1.75} />
              </a>
            </div>
          </div>
          <figure className="lg:col-span-8">
            <div className="media-frame aspect-[8/5] overflow-hidden rounded-xl border bg-secondary">
              <img
                alt="Aamina Charitable Trust public accountability website with current support metrics"
                className="h-full w-full object-cover"
                height="900"
                loading="lazy"
                src={`${baseUrl}assets/portfolio/act-ecosystem.webp`}
                width="1440"
              />
            </div>
            <figcaption className="mt-3 font-mono text-xs text-muted-foreground">
              Public accountability layer. Internal operations remain access controlled.
            </figcaption>
          </figure>
        </motion.article>

        <div className="grid border-b lg:grid-cols-12">
          <motion.article className="py-10 lg:col-span-7 lg:border-r lg:pr-8" {...reveal}>
            <figure>
              <div className="media-frame aspect-[8/5] overflow-hidden rounded-xl border bg-secondary">
                <img
                  alt="PRISM live UAS simulation with three drones, a monitoring zone, and processing metrics"
                  className="h-full w-full object-cover"
                  height="900"
                  loading="lazy"
                  src={`${baseUrl}assets/portfolio/prism-simulation.webp`}
                  width="1440"
                />
              </div>
            </figure>
            <p className="mt-7 font-mono text-xs text-primary">UTM Research / Simulation</p>
            <h3 className="mt-3 text-3xl font-medium tracking-[-0.045em]">PRISM</h3>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground text-pretty">
              A UTM research simulator for configuring missions, running sequential or parallel risk evaluation, and inspecting live timing and conformance signals.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
              <p className="font-mono text-xs text-muted-foreground">React / FastAPI / UTM Simulation</p>
              <a className={externalLinkClass} href="https://prism.secure-utm.org" rel="noreferrer" target="_blank">
                Launch PRISM
                <IconArrowUpRight aria-hidden="true" className="size-4" stroke={1.75} />
              </a>
            </div>
          </motion.article>

          <motion.article className="border-t py-10 lg:col-span-5 lg:border-t-0 lg:pl-8" {...reveal}>
            <figure>
              <div className="media-frame aspect-[8/5] overflow-hidden rounded-xl border bg-secondary">
                <img
                  alt="Taqyeem platform landing page with assessment and reporting interface preview"
                  className="h-full w-full object-cover"
                  height="900"
                  loading="lazy"
                  src={`${baseUrl}assets/portfolio/taqyeem-platform.webp`}
                  width="1440"
                />
              </div>
            </figure>
            <p className="mt-7 font-mono text-xs text-primary">Academic Quality / Workflow</p>
            <h3 className="mt-3 text-3xl font-medium tracking-[-0.045em]">Taqyeem</h3>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground text-pretty">
              An outcome-based education platform connecting course assessment reporting, CLO/PLO analysis, student feedback, and administrative approvals.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
              <p className="font-mono text-xs text-muted-foreground">Next.js / TypeScript / PostgreSQL</p>
              <a className={externalLinkClass} href="https://taqyeem.app" rel="noreferrer" target="_blank">
                Visit Taqyeem
                <IconArrowUpRight aria-hidden="true" className="size-4" stroke={1.75} />
              </a>
            </div>
          </motion.article>
        </div>

        <motion.article className="grid gap-8 border-b py-10 lg:grid-cols-12 lg:items-center" {...reveal}>
          <div className="lg:col-span-4">
            <p className="font-mono text-xs text-primary">Algorithms / Interaction</p>
            <h3 className="mt-3 text-3xl font-medium tracking-[-0.045em]">Wordle Solver</h3>
            <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground text-pretty">
              A client-side solver that ranks an 8,888-word corpus by information gain, frequency, and commonness without blocking the interface.
            </p>
            <p className="mt-5 font-mono text-xs text-muted-foreground">React / TypeScript / Web Worker</p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
              <a className={externalLinkClass} href="https://ryyanrashid01.github.io/wordle_solver/" rel="noreferrer" target="_blank">
                Try Solver
                <IconArrowUpRight aria-hidden="true" className="size-4" stroke={1.75} />
              </a>
              <a className={externalLinkClass} href="https://github.com/ryyanrashid01/wordle_solver" rel="noreferrer" target="_blank">
                Source Code
                <IconBrandGithub aria-hidden="true" className="size-4" stroke={1.75} />
              </a>
            </div>
          </div>
          <figure className="lg:col-span-8">
            <div className="media-frame aspect-[8/5] overflow-hidden rounded-xl border bg-secondary">
              <img
                alt="Wordle Solver interface ranking recommended words from a large candidate set"
                className="h-full w-full object-cover"
                height="900"
                loading="lazy"
                src={`${baseUrl}assets/portfolio/wordle-solver.webp`}
                width="1440"
              />
            </div>
          </figure>
        </motion.article>
      </div>
    </section>
  )
}

function EngineeringCaseStudy() {
  return (
    <section className="border-b pt-16 pb-24 sm:pt-16 sm:pb-28" aria-labelledby="engineering-title">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <motion.div className="grid gap-5 md:grid-cols-12 md:items-end" {...reveal}>
          <div className="md:col-span-8">
            <p className="font-mono text-xs text-primary">02 / Engineering Case Study</p>
            <h2
              className="mt-4 max-w-[12ch] text-[clamp(3rem,5.2vw,5.25rem)] leading-[0.96] font-medium tracking-[-0.065em] text-balance"
              id="engineering-title"
            >
              Real-Time UAS Conformance Monitoring
            </h2>
          </div>
          <p className="max-w-md text-base leading-relaxed text-muted-foreground text-pretty md:col-span-4">
            A modular C++20 decision engine that verifies evidence, authorization, trajectory, and operational constraints in real time.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:items-start">
          <motion.figure className="lg:col-span-8" {...reveal}>
            <div className="media-frame aspect-[8/5] overflow-hidden rounded-xl border bg-secondary">
              <img
                alt="Aircraft trajectories moving through three-dimensional airspace corridors and exclusion zones"
                className="image-treatment h-full w-full object-cover"
                height="961"
                loading="lazy"
                src={`${baseUrl}assets/uas-conformance.webp`}
                width="1536"
              />
            </div>
          </motion.figure>

          <motion.div className="lg:col-span-4" {...reveal}>
            <p className="font-mono text-xs text-primary">Personal Engineering Project</p>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground text-pretty">
              The system combines independent tracking and Remote ID streams, builds reversible aircraft context, then converts verified evidence into deterministic operational states and response protocols.
            </p>
            <div className="mt-8 grid grid-cols-2 border-y font-mono text-xs text-muted-foreground">
              {["C++20 / CMake", "NATS JetStream", "YAML / vcpkg", "Remote ID"].map((item, index) => (
                <span className={`py-3 ${index % 2 === 0 ? "pr-3" : "border-l pl-3"}`} key={item}>
                  {item}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="mt-12 grid border-t md:grid-cols-2">
          {conformanceCapabilities.map((item, index) => (
            <motion.article
              className={`border-b py-8 md:p-8 ${index % 2 === 0 ? "md:border-r" : ""}`}
              key={item.title}
              {...reveal}
            >
              <h3 className="text-xl font-medium tracking-[-0.035em]">{item.title}</h3>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground text-pretty">
                {item.description}
              </p>
            </motion.article>
          ))}
        </div>

        <motion.p className="mt-8 max-w-5xl text-sm leading-relaxed text-muted-foreground text-pretty" {...reveal}>
          The system is split into independently testable CMake modules with dependency inversion, typed configuration, fail-closed boundaries, unit tests, static analysis, and architecture documentation. Integration boundaries cover JetStream, registry and operations services, real-time dashboards, audit events, and future camera-assisted identification.
        </motion.p>
      </div>
    </section>
  )
}

function Experience() {
  return (
    <section className="section-anchor border-b py-24 sm:py-28" id="experience">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <motion.div {...reveal}>
          <p className="font-mono text-xs text-primary">03 / Experience</p>
          <h2 className="mt-4 text-[clamp(3rem,5.2vw,5.25rem)] leading-none font-medium tracking-[-0.065em]">
            Experience
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty">
            Research depth, production ownership, and systems built to operate under real constraints.
          </p>
        </motion.div>

        <div className="mt-14">
          {experience.map((entry) => (
            <article className="grid gap-7 border-t py-10 md:grid-cols-12 md:gap-10 md:py-12" key={entry.organization}>
              <div className="md:col-span-3">
                {entry.roles.map((role) => (
                  <p className="font-mono text-sm leading-6 text-muted-foreground" key={role.dates}>
                    {role.dates}
                  </p>
                ))}
                <p className="mt-3 text-sm text-muted-foreground">{entry.location}</p>
              </div>
              <div className="md:col-span-9">
                <h3 className="text-3xl font-medium tracking-[-0.045em] sm:text-4xl">
                  {entry.organization}
                </h3>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
                  {entry.roles.map((role) => (
                    <span className="font-mono text-xs text-primary" key={role.title}>
                      {role.title}
                    </span>
                  ))}
                </div>
                <div className="mt-6 grid gap-4 text-base leading-relaxed text-muted-foreground">
                  {entry.points.map((point) => (
                    <p className="max-w-4xl text-pretty" key={point}>
                      {point}
                    </p>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Research() {
  return (
    <section className="section-anchor border-b py-24 sm:py-28" id="research">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <motion.div {...reveal}>
          <p className="font-mono text-xs text-primary">04 / Research</p>
          <h2 className="mt-4 text-[clamp(3rem,5.2vw,5.25rem)] leading-none font-medium tracking-[-0.065em]">
            Research
          </h2>
        </motion.div>

        <div className="mt-12 grid border-y lg:grid-cols-12">
          <motion.article className="py-10 lg:col-span-5 lg:border-r lg:pr-10" {...reveal}>
            <p className="font-mono text-xs text-primary">IEEE / ICUAS 2026</p>
            <h3 className="mt-4 text-3xl leading-tight font-medium tracking-[-0.045em] text-balance">
              Visual Verification of UAV Location in Remote Identification Messages
            </h3>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground text-pretty">
              Co-authored research on visually cross-verifying location information reported through UAV Remote ID messages.
            </p>
          </motion.article>

          <motion.article className="border-t py-10 lg:col-span-7 lg:border-t-0 lg:pl-10" {...reveal}>
            <figure>
              <div className="media-frame aspect-video overflow-hidden rounded-xl border bg-secondary">
                <img
                  alt="Microscopy-inspired view of an interconnected porous hydrogel structure"
                  className="image-treatment h-full w-full object-cover"
                  height="864"
                  loading="lazy"
                  src={`${baseUrl}assets/hydrogel-microstructure.webp`}
                  width="1536"
                />
              </div>
            </figure>
            <p className="mt-7 font-mono text-xs text-primary">Harvard Medical School</p>
            <h3 className="mt-4 max-w-3xl text-2xl font-medium tracking-[-0.04em] text-balance">
              AI/ML Driven Design of Aqueous Two-Phase Emulsions Based Porous Hydrogels
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">Manuscript under peer review.</p>
          </motion.article>
        </div>

        <div className="grid md:grid-cols-3">
          <motion.article className="border-b py-8 md:border-r md:p-8" {...reveal}>
            <p className="font-mono text-xs text-primary">Presentations</p>
            <div className="mt-4 grid gap-4 text-xl font-medium tracking-[-0.03em]">
              <p>World Future Energy Summit 2026</p>
              <p>UMEX and SimTEX 2026</p>
            </div>
          </motion.article>
          <motion.article className="border-b py-8 md:border-r md:p-8" {...reveal}>
            <p className="font-mono text-xs text-primary">Education</p>
            <h3 className="mt-4 text-2xl font-medium tracking-[-0.04em]">
              Bachelor of Computer Science (Honours)
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Universiti Sains Malaysia<br />Intelligent Computing (AI), Minor in Mathematics
            </p>
          </motion.article>
          <motion.article className="border-b py-8 md:p-8" {...reveal}>
            <p className="font-mono text-xs text-primary">Recognition</p>
            <div className="mt-4 grid gap-3 text-base text-muted-foreground">
              <p>Intern Excellence Award</p>
              <p>Dean&apos;s Award List, 4 semesters</p>
              <p>Gold Award</p>
            </div>
          </motion.article>
        </div>
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section className="section-anchor" id="contact">
      <div className="grid min-h-[76dvh] border-b lg:grid-cols-2">
        <motion.div className="flex flex-col justify-between border-b p-6 py-20 sm:p-10 lg:border-r lg:border-b-0 lg:p-16" {...reveal}>
          <div>
            <p className="font-mono text-xs text-primary">05 / Contact</p>
            <h2 className="mt-5 max-w-[10ch] text-[clamp(3rem,5.4vw,5.75rem)] leading-[0.96] font-medium tracking-[-0.065em] text-balance">
              Let&apos;s Build Dependable Systems.
            </h2>
            <Button asChild className="mt-10 h-12 rounded-md px-6 text-base" size="lg">
              <a href="mailto:ryyan.rashid01@gmail.com">
                Email Me
                <IconMail aria-hidden="true" stroke={1.75} />
              </a>
            </Button>
          </div>
          <div className="mt-16 flex flex-wrap gap-x-7 gap-y-4">
            <a
              className="inline-flex min-h-11 items-center gap-2 border-b pb-1 text-base transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              href="https://www.linkedin.com/in/mohammad-ryyan-rashid-4a3a81175/"
              rel="noreferrer"
              target="_blank"
            >
              <IconBrandLinkedin aria-hidden="true" className="size-5" stroke={1.75} />
              LinkedIn
              <IconArrowUpRight aria-hidden="true" className="size-4" stroke={1.75} />
            </a>
            <a
              className="inline-flex min-h-11 items-center gap-2 border-b pb-1 text-base transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              href="https://github.com/ryyanrashid01"
              rel="noreferrer"
              target="_blank"
            >
              <IconBrandGithub aria-hidden="true" className="size-5" stroke={1.75} />
              GitHub
              <IconArrowUpRight aria-hidden="true" className="size-4" stroke={1.75} />
            </a>
          </div>
        </motion.div>

        <motion.div className="flex flex-col justify-center p-6 py-20 sm:p-10 lg:p-16" {...reveal}>
          <p className="font-mono text-xs text-primary">Capabilities</p>
          <Accordion className="mt-5" collapsible defaultValue="systems" type="single">
            {capabilities.map((capability) => (
              <AccordionItem key={capability.name} value={capability.name.toLowerCase().split(" ")[0]}>
                <AccordionTrigger className="py-6 text-xl font-medium tracking-[-0.035em] hover:no-underline sm:text-2xl">
                  {capability.name}
                </AccordionTrigger>
                <AccordionContent className="max-w-xl pb-6 text-base leading-relaxed text-muted-foreground">
                  {capability.detail}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="mt-10 grid gap-2 border-t pt-6 text-sm text-muted-foreground sm:grid-cols-2">
            <p>English, IELTS Band 8 (C1)</p>
            <p>Urdu and Hindi, native</p>
          </div>
        </motion.div>
      </div>

      <footer className="mx-auto flex max-w-[1400px] flex-col gap-5 px-4 py-8 text-sm text-muted-foreground sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <p className="text-foreground">Mohammad Ryyan Rashid</p>
        <p className="inline-flex items-center gap-2">
          <IconMapPin aria-hidden="true" className="size-4" stroke={1.75} />
          Abu Dhabi, UAE
        </p>
        <p>AI and software engineering</p>
      </footer>
    </section>
  )
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-[100dvh] bg-background text-foreground">
        <Header />
        <main id="main-content">
          <Hero />
          <Highlights />
          <SelectedWork />
          <EngineeringCaseStudy />
          <Experience />
          <Research />
          <Contact />
        </main>
      </div>
    </MotionConfig>
  )
}
