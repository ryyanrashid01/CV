import { Dialog } from "radix-ui";
import { motion } from "motion/react";
import { IconArrowUpRight, IconMail, IconX } from "@tabler/icons-react";
import { disciplineNames } from "@/data/portfolio";
import { DetectionFrame } from "@/components/detection-frame";
import { Button } from "@/components/motion-kit";
import { scrollToSection } from "@/lib/use-smooth-scroll";

export default function ProjectDialog({ project, onClose, triggerRef }) {
  return (
    <Dialog.Root open={!!project} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content
          className="project-dialog"
          data-lenis-prevent
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            triggerRef.current?.focus();
          }}
        >
          <Dialog.Close asChild>
            <button className="icon-button dialog-close" type="button" aria-label="Close project details">
              <IconX />
            </button>
          </Dialog.Close>
          {project && (
            <motion.div
              className="dialog-body"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <p className="eyebrow" data-discipline={project.discipline}>
                <span className="tag tag-class">{disciplineNames[project.discipline]}</span>
                {project.category}
              </p>
              <Dialog.Title className="display dialog-title">{project.title}</Dialog.Title>
              <Dialog.Description className="dialog-description">{project.description}</Dialog.Description>
              <p>
                <mark>{project.outcome}</mark>
              </p>
              <DetectionFrame project={project} mode="static" eager />
              <div className="dialog-meta">
                <span>{project.organization}</span>
                {project.tech.map((technology) => (
                  <span className="tag" key={technology}>
                    {technology}
                  </span>
                ))}
              </div>
              <h3 className="eyebrow">Inside the project</h3>
              <ul className="dialog-details">
                {project.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
              <div className="dialog-links">
                {project.links.map((item) => (
                  <Button
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    icon={IconArrowUpRight}
                    data-cursor="visit 0.99"
                  >
                    {item.label}
                  </Button>
                ))}
                <Dialog.Close asChild>
                  <a
                    className="btn btn-ghost"
                    href="#contact"
                    data-cursor="say hi 0.97"
                    onClick={(event) => {
                      event.preventDefault();
                      triggerRef.current = null;
                      scrollToSection("contact");
                    }}
                  >
                    <span className="btn-label">
                      <span>Talk about this project</span>
                      <span aria-hidden="true">Talk about this project</span>
                    </span>
                    <IconMail className="btn-icon" aria-hidden="true" />
                  </a>
                </Dialog.Close>
              </div>
            </motion.div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
