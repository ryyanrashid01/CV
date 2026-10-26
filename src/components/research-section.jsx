import { IconArrowUpRight, IconPlus } from "@tabler/icons-react";
import { education, projects, research } from "@/data/portfolio";
import { DetectionFrame } from "@/components/detection-frame";
import { Reveal, SectionRule, SplitHeading, Tilt } from "@/components/motion-kit";

const find = (id) => projects.find((item) => item.id === id);

export default function Research({ openProject }) {
  const hydrogel = research.find((item) => item.id === "hydrogels");
  const remote = research.find((item) => item.id === "remote-id");
  const conformance = find("conformance");
  return (
    <section className="section research invert" id="research" aria-labelledby="research-title">
      <div className="container">
        <SectionRule index="03" label="Research & exploration" note="IEEE ICUAS 2026 · WFES 2026" />
        <div className="section-head">
          <SplitHeading id="research-title" lines={["Research,", "made tangible."]} muted={1} />
          <p>Exploring what intelligence can do in the physical world.</p>
        </div>
        <div className="research-layout">
          <article className="research-feature">
            <Reveal>
              <Tilt max={4}>
                <DetectionFrame project={conformance} mode="inview" />
              </Tilt>
            </Reveal>
            <Reveal className="research-copy">
              <p className="eyebrow">{remote.venue}</p>
              <h3 className="display research-title">Visual verification of UAV location.</h3>
              <p>{remote.description}</p>
              <p className="paper-title">{remote.title}</p>
              <button
                type="button"
                className="text-link"
                onClick={(event) => openProject(conformance, event.currentTarget)}
                data-cursor="open 0.99"
              >
                Explore the connected system
                <IconArrowUpRight aria-hidden="true" />
              </button>
            </Reveal>
          </article>
          <div className="research-articles">
            <Reveal as="article" className="research-article">
              <p className="eyebrow">World Future Energy Summit 2026</p>
              <h3 className="display">Intelligence that meets the real world.</h3>
              <p>A dual-backbone vision model and a working prototype for four-category waste classification.</p>
              <button
                type="button"
                className="text-link"
                onClick={(event) => openProject(find("intellibin"), event.currentTarget)}
                data-cursor="open 0.99"
              >
                Meet IntelliBin
                <IconArrowUpRight aria-hidden="true" />
              </button>
            </Reveal>
            <Reveal as="article" className="research-article">
              <p className="eyebrow">{hydrogel.venue}</p>
              <h3 className="display">Learning from complex materials.</h3>
              <DetectionFrame project={hydrogel} mode="inview" className="research-figure" />
              <p>{hydrogel.description}</p>
              <details className="entry-details">
                <summary>
                  Research title
                  <IconPlus aria-hidden="true" />
                </summary>
                <p>{hydrogel.title}</p>
              </details>
              <p className="research-status">{hydrogel.status}</p>
            </Reveal>
            <Reveal className="research-note">
              <span className="eyebrow">Also presented at</span>
              <p>UMEX & SimTEX 2026</p>
              <button
                type="button"
                className="text-link"
                onClick={(event) => openProject(find("prism"), event.currentTarget)}
                data-cursor="open 0.99"
              >
                PRISM research simulator
                <IconArrowUpRight aria-hidden="true" />
              </button>
            </Reveal>
          </div>
        </div>
        <Reveal className="education">
          <div>
            <p className="eyebrow">The foundation</p>
            <h3 className="display">{education.institution}</h3>
            <p className="education-dates">{education.dates}</p>
          </div>
          <div className="education-detail">
            <h4>{education.degree}</h4>
            <p>
              {education.specialization} · Minor in {education.minor}
            </p>
            <p className="education-result">
              <span className="tag">CGPA {education.cgpa}</span>
              <span className="tag">Dean’s Award List, four semesters</span>
            </p>
          </div>
          <div className="education-extra">
            <div>
              <p className="eyebrow">Recognition</p>
              <p>Intern Excellence Award · Gold Award</p>
            </div>
            <div>
              <p className="eyebrow">Languages</p>
              <p>{education.languages.join(" · ")}</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
