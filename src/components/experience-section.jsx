import { useRef } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { IconArrowUpRight, IconDownload, IconPlus } from "@tabler/icons-react";
import { experience, profile, projects } from "@/data/portfolio";
import { Reveal, SectionRule, SplitHeading } from "@/components/motion-kit";

const asset = (path) => `${import.meta.env.BASE_URL}${path}`;
const shortNames = { act: "ACT", conformance: "UAS Conformance" };

export default function Experience({ openProject }) {
  const timeline = useRef(null);
  const { scrollYProgress } = useScroll({ target: timeline, offset: ["start 75%", "end 55%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  return (
    <section className="section experience" id="experience" aria-labelledby="experience-title">
      <div className="container">
        <SectionRule index="02" label="Experience" note="2023 — now" />
        <div className="experience-layout">
          <div className="experience-intro">
            <SplitHeading id="experience-title" lines={["Built through", "experience."]} muted={1} />
            <Reveal as="p" className="experience-lede">
              Research depth. Production ownership. Real problems, end to end.
            </Reveal>
            <Reveal>
              <a className="text-link" href={asset(profile.resume)} download data-cursor="download 1.00">
                Full experience in my CV
                <IconDownload aria-hidden="true" />
              </a>
            </Reveal>
          </div>
          <ol className="timeline" ref={timeline}>
            <motion.span className="timeline-progress" style={{ scaleY: progress }} aria-hidden="true" />
            {experience.map((entry) => (
              <Reveal as="li" className="entry" key={entry.id}>
                <span className="entry-node brk" aria-hidden="true" />
                <p className="entry-location">{entry.location}</p>
                <h3 className="entry-org">{entry.organization}</h3>
                <dl className="entry-roles">
                  {entry.roles.map((role) => (
                    <div key={role.title}>
                      <dt>
                        {role.title}
                        {role.detail && <small>{role.detail}</small>}
                      </dt>
                      <dd>{role.dates}</dd>
                    </div>
                  ))}
                </dl>
                <p className="entry-summary">{entry.points[0]}</p>
                {entry.points.length > 1 && (
                  <details className="entry-details">
                    <summary>
                      More about this role
                      <IconPlus aria-hidden="true" />
                    </summary>
                    <ul>
                      {entry.points.slice(1).map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                  </details>
                )}
                {entry.projectIds.length > 0 && (
                  <div className="entry-links">
                    <span className="eyebrow">Connected work</span>
                    {entry.projectIds.map((id) => {
                      const project = projects.find((item) => item.id === id);
                      return (
                        <button
                          key={id}
                          type="button"
                          className="tag tag-link"
                          onClick={(event) => openProject(project, event.currentTarget)}
                          data-cursor="open 0.98"
                        >
                          {shortNames[id] || project.title}
                          <IconArrowUpRight aria-hidden="true" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
