import { useState } from "react";
import { Dialog } from "radix-ui";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { IconDownload, IconMenu2, IconMoon, IconSun, IconX } from "@tabler/icons-react";
import { profile } from "@/data/portfolio";
import { Logo } from "@/components/logo";
import { Button } from "@/components/motion-kit";
import { scrollToSection, useScrollLock } from "@/lib/use-smooth-scroll";

const asset = (path) => `${import.meta.env.BASE_URL}${path}`;
const navigation = [
  { id: "work", label: "Work" },
  { id: "experience", label: "Experience" },
  { id: "research", label: "Research" },
  { id: "contact", label: "Contact" },
];

function ThemeToggle({ theme, toggleTheme }) {
  return (
    <button
      className="icon-button"
      type="button"
      onClick={(event) => toggleTheme(event.currentTarget)}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      data-cursor={theme === "dark" ? "lights on" : "lights off"}
    >
      {theme === "dark" ? <IconSun /> : <IconMoon />}
    </button>
  );
}

export default function SiteHeader({ theme, toggleTheme, activeSection }) {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  useScrollLock(menuOpen);
  // Slide away while reading down, return as soon as the visitor scrolls up.
  useMotionValueEvent(scrollY, "change", (y) => {
    const previous = scrollY.getPrevious() ?? 0;
    setHidden(y > previous && y > 280);
    setScrolled(y > 24);
  });
  return (
    <header className="site-header" data-hidden={hidden && !menuOpen} data-scrolled={scrolled}>
      <div className="container header-inner">
        <a className="brand" href="#top" aria-label="Ryyan Rashid, back to top" data-cursor="home">
          <Logo />
          <span className="brand-name">
            Ryyan Rashid
            <small>AI + software engineer</small>
          </span>
        </a>
        <nav className="nav" aria-label="Primary">
          {navigation.map((item) => (
            <a key={item.id} href={`#${item.id}`} aria-current={activeSection === item.id ? "location" : undefined}>
              {activeSection === item.id && (
                <motion.span
                  layoutId="nav-mark"
                  className="nav-mark brk"
                  transition={{ type: "spring", stiffness: 420, damping: 36 }}
                />
              )}
              {item.label}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          <Button
            href={asset(profile.resume)}
            download
            className="btn-small header-cv"
            icon={IconDownload}
            data-cursor="download 1.00"
          >
            CV
          </Button>
          <Dialog.Root open={menuOpen} onOpenChange={setMenuOpen}>
            <Dialog.Trigger asChild>
              <button className="icon-button menu-button" type="button" aria-label="Open navigation">
                <IconMenu2 />
              </button>
            </Dialog.Trigger>
            <AnimatePresence>
              {menuOpen && (
                <Dialog.Portal forceMount>
                  <Dialog.Content asChild forceMount>
                    <motion.div
                      className="mobile-menu"
                      initial={{ clipPath: "inset(0 0 100% 0)" }}
                      animate={{ clipPath: "inset(0 0 0% 0)" }}
                      exit={{ clipPath: "inset(0 0 100% 0)" }}
                      transition={{ duration: 0.6, ease: [0.7, 0, 0.2, 1] }}
                    >
                      <div className="mobile-menu-top">
                        <Logo />
                        <Dialog.Close asChild>
                          <button className="icon-button" type="button" aria-label="Close navigation">
                            <IconX />
                          </button>
                        </Dialog.Close>
                      </div>
                      <Dialog.Title className="sr-only">Navigation</Dialog.Title>
                      <Dialog.Description className="sr-only">
                        Jump to a section of Mohammad Ryyan Rashid’s portfolio.
                      </Dialog.Description>
                      <nav aria-label="Mobile">
                        {navigation.map((item, index) => (
                          <motion.a
                            key={item.id}
                            href={`#${item.id}`}
                            onClick={(event) => {
                              event.preventDefault();
                              setMenuOpen(false);
                              scrollToSection(item.id);
                            }}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 + index * 0.06, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
                          >
                            {item.label}
                            <span>{String(index + 1).padStart(2, "0")}</span>
                          </motion.a>
                        ))}
                      </nav>
                      <div className="mobile-menu-foot">
                        <Button href={asset(profile.resume)} download icon={IconDownload}>
                          Download CV
                        </Button>
                        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
                      </div>
                    </motion.div>
                  </Dialog.Content>
                </Dialog.Portal>
              )}
            </AnimatePresence>
          </Dialog.Root>
        </div>
      </div>
    </header>
  );
}
