import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IconArrowUpRight, IconBrain, IconCode, IconCpu, IconTopologyStar3 } from "@tabler/icons-react";
import { capabilities, projects } from "@/data/portfolio";
import { Reveal, SectionRule, SplitHeading } from "@/components/motion-kit";

const icons = { ai: IconBrain, software: IconCode, systems: IconTopologyStar3, delivery: IconCpu };
const pad = (value) => String(value).padStart(2, "0");
const ease = [0.2, 0.8, 0.2, 1];

export default function Capabilities({ openProject }) {
  const [selectedId, setSelectedId] = useState("ai");
  const selected = capabilities.find((item) => item.id === selectedId);
  return (
    <section className="section capabilities" id="capabilities" aria-labelledby="capabilities-title">
      <div className="container">
        <SectionRule index="04" label="Capabilities" note="Tools behind the work" />
        <div className="section-head">
          <SplitHeading
            id="capabilities-title"
            lines={["Different disciplines.", "One connected mindset."]}
            muted={1}
          />
          <p>Select a discipline to see the tools and the work behind it.</p>
        </div>
        <Reveal className="capabilities-layout">
          <div className="capability-list" role="group" aria-label="Select a discipline">
            {capabilities.map((item, index) => {
              const Icon = icons[item.id];
              const active = selectedId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className="capability"
                  aria-pressed={active}
                  onClick={() => setSelectedId(item.id)}
                >
                  {active && (
                    <motion.span
                      layoutId="capability-mark"
                      className="capability-mark brk"
                      transition={{ type: "spring", stiffness: 380, damping: 34 }}
                    />
                  )}
                  <span className="capability-index">{pad(index + 1)}</span>
                  <span className="capability-name">{item.name}</span>
                  <Icon className="capability-icon" aria-hidden="true" />
                </button>
              );
            })}
          </div>
          <div className="capability-panel" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease }}
              >
                <p className="capability-summary display">{selected.summary}</p>
                <ul className="skill-list">
                  {selected.skills.map((skill, index) => (
                    <motion.li
                      key={skill}
                      className="tag"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + index * 0.035, duration: 0.35, ease }}
                    >
                      {skill}
                    </motion.li>
                  ))}
                </ul>
                <div className="capability-proof">
                  <span className="eyebrow">Used in real work</span>
                  <div>
                    {selected.projectIds.map((id) => {
                      const project = projects.find((item) => item.id === id);
                      return (
                        <button
                          key={id}
                          type="button"
                          className="text-link"
                          onClick={(event) => openProject(project, event.currentTarget)}
                          data-cursor="open 0.98"
                        >
                          {project.title}
                          <IconArrowUpRight aria-hidden="true" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
