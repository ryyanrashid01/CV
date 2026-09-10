import { IconArrowDown, IconArrowUpRight } from "@tabler/icons-react";
import {
  Assemble as Reveal,
  AssembleImage,
} from "@/components/content-assembly";
import { education, projects, research } from "@/data/portfolio";
import "./research-section.css";

const asset = (path) => `${import.meta.env.BASE_URL}${path}`;

export default function Research({ openProject }) {
  const hydrogel = research.find((item) => item.id === "hydrogels");
  const remote = research.find((item) => item.id === "remote-id");
  const conformance = projects.find((item) => item.id === "conformance");

  return (
    <section
      className="section section-anchor research-section"
      id="research"
      aria-labelledby="research-title"
    >
      <div className="container">
        <div className="section-heading">
          <Reveal>
            <p className="eyebrow">Research & exploration</p>
          </Reveal>
          <Reveal>
            <h2 id="research-title">
              Research,
              <br />
              <span className="muted-heading">made tangible.</span>
            </h2>
          </Reveal>
          <Reveal className="research-introduction">
            <p>Exploring what intelligence can do in the physical world.</p>
          </Reveal>
        </div>
        <div className="research-layout">
          <div className="research-feature">
            <Reveal className="research-feature-image">
              <AssembleImage
                src={asset(conformance.image)}
                alt={conformance.imageAlt}
                width="1536"
                height="961"
                className="research-lead-image"
              />
            </Reveal>
            <Reveal>
              <p className="eyebrow">{remote.venue}</p>
            </Reveal>
            <Reveal>
              <h3>Visual verification of UAV location.</h3>
            </Reveal>
            <Reveal className="research-description">
              <p>{remote.description}</p>
            </Reveal>
            <Reveal>
              <p className="paper-title">{remote.title}</p>
            </Reveal>
            <Reveal>
              <button
                className="text-link"
                onClick={(event) =>
                  openProject(conformance, event.currentTarget)
                }
              >
                Explore the connected system
                <IconArrowUpRight />
              </button>
            </Reveal>
          </div>
          <Reveal className="research-articles">
            <Reveal className="research-article">
              <Reveal>
                <p className="eyebrow">World Future Energy Summit 2026</p>
              </Reveal>
              <Reveal>
                <h3>
                  Intelligence that
                  <br />
                  meets the real world.
                </h3>
              </Reveal>
              <Reveal className="research-description">
                <p>
                  A dual-backbone vision model and a working prototype for
                  four-category waste classification.
                </p>
              </Reveal>
              <Reveal>
                <button
                  className="text-link"
                  onClick={(event) =>
                    openProject(
                      projects.find((item) => item.id === "intellibin"),
                      event.currentTarget,
                    )
                  }
                >
                  Meet IntelliBin
                  <IconArrowUpRight />
                </button>
              </Reveal>
            </Reveal>
            <Reveal className="research-article research-materials">
              <Reveal>
                <p className="eyebrow">{hydrogel.venue}</p>
              </Reveal>
              <Reveal>
                <h3>Learning from complex materials.</h3>
              </Reveal>
              <div className="research-materials-body">
                <Reveal className="research-thumbnail">
                  <AssembleImage
                    src={asset(hydrogel.image)}
                    alt={hydrogel.imageAlt}
                    width="1536"
                    height="864"
                  />
                </Reveal>
                <Reveal className="research-description">
                  <p>{hydrogel.description}</p>
                </Reveal>
              </div>
              <Reveal>
                <details className="research-details">
                  <summary>
                    Read the research title
                    <IconArrowDown />
                  </summary>
                  <p>{hydrogel.title}</p>
                </details>
              </Reveal>
              <Reveal>
                <span className="research-status">{hydrogel.status}</span>
              </Reveal>
            </Reveal>
            <Reveal className="presentation-note">
              <span>Also presented at</span>
              <p>UMEX & SimTEX 2026</p>
              <button
                onClick={(event) =>
                  openProject(
                    projects.find((item) => item.id === "prism"),
                    event.currentTarget,
                  )
                }
              >
                PRISM research simulator
                <IconArrowUpRight />
              </button>
            </Reveal>
          </Reveal>
        </div>
        <Reveal className="education-row">
          <div>
            <p className="eyebrow">The foundation</p>
            <h3>{education.institution}</h3>
            <span>{education.dates}</span>
          </div>
          <div>
            <h4>{education.degree}</h4>
            <p>
              {education.specialization} / Minor in {education.minor}
            </p>
            <p className="education-result">
              CGPA {education.cgpa}
              <span>Dean’s Award List, four semesters</span>
            </p>
          </div>
        </Reveal>
        <Reveal className="education-extra">
          <div>
            <span>Recognition</span>
            <p>Intern Excellence Award / Gold Award</p>
          </div>
          <div>
            <span>Languages</span>
            <p>{education.languages.join(" / ")}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
