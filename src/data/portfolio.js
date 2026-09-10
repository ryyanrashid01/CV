// Content drawn from the existing portfolio and its downloadable CV.
// Asset paths are relative to import.meta.env.BASE_URL.

export const profile = {
  name: "Mohammad Ryyan Rashid",
  shortName: "Ryyan Rashid",
  initials: "MR",
  role: "AI/ML Engineer · Software Engineer",
  headline: "Intelligence, engineered for the real world.",
  summary:
    "I build dependable intelligent systems, production software, and research tools, from machine learning and real-time C++ systems to products people use every day.",
  location: "Abu Dhabi, UAE",
  email: "ryyan.rashid01@gmail.com",
  phone: "+971 58 542 4229",
  resume: "assets/Mohammad_Ryyan_Rashid_Resume.pdf",
  links: [
    { label: "Email", href: "mailto:ryyan.rashid01@gmail.com" },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/mohammad-ryyan-rashid-4a3a81175/",
    },
    { label: "GitHub", href: "https://github.com/ryyanrashid01" },
  ],
};

export const projects = [
  {
    id: "act",
    title: "ACT Operations Platform",
    category: "Production systems",
    organization: "Aamina Charitable Trust",
    description:
      "A financial-operations platform connecting beneficiary accounts, donations, payments, approvals, and reconciliation, with a public accountability site.",
    outcome:
      "450+ beneficiaries. Daily administration reduced to under 30 minutes.",
    tech: ["Next.js", "TypeScript", "PostgreSQL", "Prisma", "Docker"],
    image: "assets/portfolio/act-ecosystem.webp",
    imageAlt: "Aamina Charitable Trust public accountability website",
    links: [{ label: "Public site", href: "https://aaminatrust.org" }],
    details: [
      "Solely designed, built, deployed, and maintain the platform for a 10-12-person team managing 450+ beneficiary records across 370+ households, 4,600+ transactions, and over INR 1 million in monthly payment activity.",
      "Reduced recurring financial administration from three people spending multiple hours per day to less than 30 minutes total per day through bank-statement processing, reconciliation, recurring payments, payment runs, and digital approvals.",
      "Built permissions, authentication, audit trails, digital signatures, QR-backed document verification, background jobs, and a Telegram bot. The internal operations platform is access controlled.",
      "Integrated a governed OpenRouter interface with no direct database access, and own PostgreSQL, Docker, Hostinger deployment, Linux, backups, and GitHub Actions CI/CD.",
      "The CV records that the web system has operated since April 2026 with no significant outages.",
    ],
    relatedSkills: [
      "Software Engineering",
      "Systems and Data",
      "Delivery and Operations",
    ],
  },
  {
    id: "prism",
    title: "PRISM",
    category: "Autonomous systems",
    organization: "Khalifa University",
    description:
      "A UTM research simulator for configuring missions, evaluating risk, and inspecting live timing and airspace-conformance signals.",
    outcome:
      "Research simulation with sequential and parallel risk evaluation.",
    tech: ["React", "Python", "FastAPI", "UTM Simulation"],
    image: "assets/portfolio/prism-simulation.webp",
    imageAlt:
      "PRISM live UAS simulation with aircraft, a monitoring zone, and processing metrics",
    links: [{ label: "Launch PRISM", href: "https://prism.secure-utm.org" }],
    details: [
      "Develop and advance a FastAPI-based web UTM simulator with an interactive frontend and configurable risk models as part of Technology Innovation Institute (TII)-sponsored research deliverables at Khalifa University.",
      "Support sequential or parallel execution with interactive timing and performance analysis, mission configuration, and live conformance signals.",
      "Presented at UMEX & SimTEX 2026.",
    ],
    relatedSkills: ["Software Engineering", "Systems and Data"],
  },
  {
    id: "conformance",
    title: "UAS Conformance Monitoring",
    category: "Autonomous systems",
    organization: "Khalifa University",
    description:
      "A modular C++20 decision engine that correlates aircraft evidence and evaluates identity, authorization, trajectories, and 3D airspace constraints in real time.",
    outcome:
      "Verified evidence translated into deterministic operational states.",
    tech: ["C++20", "CMake", "NATS JetStream", "Remote ID", "YAML", "vcpkg"],
    image: "assets/uas-conformance.webp",
    imageAlt:
      "Aircraft trajectories through three-dimensional airspace corridors and exclusion zones",
    links: [],
    details: [
      "Architect and develop the real-time UAS conformance-monitoring system at Khalifa University, integrating research outputs through independently testable CMake modules and event-driven boundaries.",
      "A bounded asynchronous pipeline correlates independent tracking and Remote ID streams using spatial indexing, temporal matching, confidence scoring, ambiguity handling, and worker-thread concurrency.",
      "Reversible aircraft context uses link-health hysteresis, timeouts, stale-result protection, and automatic split or recovery when associated evidence becomes inconsistent.",
      "A finite-state pipeline derives operational states for missing identification, invalid identity, unauthorized operation, and spatial or temporal violations from verified evidence.",
      "Trajectory algorithms evaluate waypoint corridors and polygonal airspace volumes with altitude limits, time windows, and exclusion zones.",
      "Architecture includes dependency inversion, typed configuration, fail-closed boundaries, unit tests, static analysis, and documentation. Integration boundaries cover JetStream, registry and operations services, real-time dashboards, audit events, and future camera-assisted identification.",
    ],
    relatedSkills: ["Software Engineering", "Systems and Data"],
  },
  {
    id: "taqyeem",
    title: "Taqyeem",
    category: "Production systems",
    organization: "Khalifa University",
    description:
      "An outcome-based education platform connecting course assessment, CLO-PLO analysis, student feedback, and administrative approvals.",
    outcome: "Connected assessment and quality-assurance workflows.",
    tech: ["Next.js", "TypeScript", "PostgreSQL"],
    image: "assets/portfolio/taqyeem-platform.webp",
    imageAlt: "Taqyeem assessment and academic reporting platform",
    links: [{ label: "Visit Taqyeem", href: "https://taqyeem.app" }],
    details: [
      "Lead development of a full-stack platform for outcome-based education and academic quality assurance at Khalifa University.",
      "Connect course assessment reporting, course learning outcome (CLO) and programme learning outcome (PLO) mapping, interactive analysis, student feedback, and administrative approvals.",
    ],
    relatedSkills: ["Software Engineering", "Systems and Data"],
  },
  {
    id: "intellibin",
    title: "IntelliBin",
    category: "Machine intelligence",
    organization: "Khalifa University",
    description:
      "An AI-driven waste-segregation system pairing a dual-backbone classification model with a functional prototype.",
    outcome: "Four-category waste classification. Presented at WFES 2026.",
    tech: ["Computer Vision", "Machine Learning", "Dual-backbone Model"],
    links: [],
    details: [
      "Developed a dual-backbone model and functional prototype for four-category waste classification at Khalifa University in 2026.",
      "Presented IntelliBin: AI-Driven Waste Segregation System at the World Future Energy Summit 2026.",
    ],
    relatedSkills: ["AI and Machine Learning"],
  },
  {
    id: "wordle",
    title: "Wordle Solver",
    category: "Algorithms and interaction",
    organization: "Personal project",
    description:
      "A browser-based solver that ranks an 8,888-word corpus by information gain, frequency, and commonness while keeping the interface responsive.",
    outcome: "8,888 words ranked without blocking the interface.",
    tech: ["React", "TypeScript", "Web Worker"],
    image: "assets/portfolio/wordle-solver.webp",
    imageAlt: "Wordle Solver interface ranking recommended words",
    links: [
      {
        label: "Try solver",
        href: "https://ryyanrashid01.github.io/wordle_solver/",
      },
      {
        label: "Source code",
        href: "https://github.com/ryyanrashid01/wordle_solver",
      },
    ],
    details: [
      "Ranks an 8,888-word corpus using information gain, frequency, and commonness to surface recommended guesses.",
      "Runs client-side computation in a Web Worker so ranking does not block the React interface.",
    ],
    relatedSkills: ["Software Engineering", "Systems and Data"],
  },
];

export const experience = [
  {
    id: "khalifa",
    organization: "Khalifa University",
    location: "Abu Dhabi, UAE",
    roles: [
      { title: "Research Assistant", dates: "Sep 2025 - Present" },
      { title: "Visiting Researcher", dates: "Jun 2025 - Sep 2025" },
    ],
    points: [
      "Develop PRISM, a FastAPI-based UTM simulator with configurable risk models, interactive analysis, and sequential or parallel execution for TII-sponsored research deliverables.",
      "Architect and develop modular C++20 systems for UAS evidence correlation, identity and authorization checks, trajectory analysis, and 3D airspace conformance.",
      "Lead Taqyeem, a full-stack platform for outcome-based education, CLO-PLO mapping, and interactive academic quality-assurance workflows.",
    ],
    projectIds: ["prism", "conformance", "taqyeem", "intellibin"],
  },
  {
    id: "aamina",
    organization: "Aamina Charitable Trust",
    location: "Remote / Kashmir, India",
    roles: [
      {
        title: "Pro Bono Software Engineer",
        dates: "Jun 2024 - Present",
        detail: "15-20 hours/week",
      },
    ],
    points: [
      "Solely designed, deployed, and maintain a production financial-operations platform for a 10-12-person team managing 450+ beneficiaries, 370+ households, 4,600+ transactions, and over INR 1 million in monthly payments.",
      "Reduced recurring administration from three people spending multiple hours per day to less than 30 minutes total per day through reconciliation, recurring payments, payment runs, and digital approvals.",
      "Own the application and its operations: permissions, audit trails, digital signatures, QR verification, PostgreSQL, Docker, Linux, Hostinger, backups, GitHub Actions, a Telegram bot, and a governed OpenRouter interface.",
    ],
    projectIds: ["act"],
  },
  {
    id: "harvard",
    organization: "Harvard Medical School",
    location: "Boston, MA, USA",
    roles: [{ title: "Research Intern", dates: "Apr 2023 - Oct 2023" }],
    points: [
      "Developed and evaluated SVR, XGBR, MLR, and neural-network models for hydrogel porosity, pore-size distribution, and mechanical properties.",
      "Applied image processing and genetic algorithms to biomaterials research that contributed to a manuscript under peer review.",
    ],
    projectIds: [],
  },
];

export const research = [
  {
    id: "remote-id",
    title:
      "Visual Verification of UAV Location in Remote Identification Messages",
    venue: "IEEE / ICUAS 2026",
    type: "Research",
    description:
      "Co-authored research on visually cross-verifying location information reported through UAV Remote ID messages.",
    projectIds: ["prism", "conformance"],
    links: [],
  },
  {
    id: "hydrogels",
    title:
      "AI/ML Driven Design of Aqueous Two-Phase Emulsions Based Porous Hydrogels",
    venue: "Harvard Medical School",
    type: "Manuscript",
    status: "Manuscript under peer review.",
    description:
      "Machine learning, image processing, and genetic algorithms applied to hydrogel porosity, pore-size distribution, and mechanical properties.",
    image: "assets/hydrogel-microstructure.webp",
    imageAlt:
      "Microscopy-inspired illustration of an interconnected porous hydrogel structure",
    projectIds: [],
    links: [],
  },
  {
    id: "intellibin-research",
    title: "IntelliBin: AI-Driven Waste Segregation System",
    venue: "Khalifa University, 2026",
    type: "Applied research",
    description:
      "A dual-backbone model and functional prototype for four-category waste classification, presented at the World Future Energy Summit 2026.",
    projectIds: ["intellibin"],
    links: [],
  },
];

export const education = {
  institution: "Universiti Sains Malaysia",
  degree: "Bachelor of Computer Science (Honours)",
  dates: "Oct 2020 - Oct 2024",
  specialization: "Intelligent Computing (AI)",
  minor: "Mathematics",
  cgpa: "3.56",
  recognition: [
    "Intern Excellence Award",
    "Dean’s Award List, four semesters",
    "Gold Award",
  ],
  presentations: [
    {
      event: "World Future Energy Summit 2026",
      project: "IntelliBin",
      projectId: "intellibin",
    },
    { event: "UMEX & SimTEX 2026", project: "PRISM", projectId: "prism" },
  ],
  languages: ["English - IELTS Band 8 (C1)", "Urdu and Hindi - native"],
};

export const capabilities = [
  {
    id: "ai",
    name: "AI and Machine Learning",
    summary:
      "From predictive models to computer vision and applied intelligence.",
    skills: [
      "PyTorch",
      "TensorFlow",
      "scikit-learn",
      "Computer Vision",
      "Neural Networks",
      "NumPy",
      "Pandas",
      "LLM API Integration",
    ],
    projectIds: ["intellibin", "act"],
  },
  {
    id: "software",
    name: "Software Engineering",
    summary: "Real-time C++ systems, Python services, and full-stack products.",
    skills: [
      "C++20",
      "CMake",
      "Python",
      "FastAPI",
      "JavaScript",
      "TypeScript",
      "React",
      "Next.js",
      "Node.js",
      "REST APIs",
    ],
    projectIds: ["act", "prism", "conformance", "taqyeem", "wordle"],
  },
  {
    id: "systems",
    name: "Systems and Data",
    summary:
      "Concurrent processing, event-driven architecture, and dependable data.",
    skills: [
      "Concurrent Processing",
      "Event-driven Systems",
      "NATS JetStream",
      "SQL",
      "PostgreSQL",
      "MongoDB",
    ],
    projectIds: ["act", "prism", "conformance", "taqyeem", "wordle"],
  },
  {
    id: "delivery",
    name: "Delivery and Operations",
    summary:
      "Ownership from deployment and automation to backups and maintenance.",
    skills: [
      "Docker",
      "Git",
      "GitHub Actions",
      "CI/CD",
      "Linux",
      "systemd",
      "Hostinger",
      "DigitalOcean",
      "Backups",
    ],
    projectIds: ["act"],
  },
];
