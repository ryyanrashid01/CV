# Bounding Box: design notes

The portfolio's brand comes from computer vision. Work is framed and labelled the way a detection model labels a frame: a box, a class name and a confidence score. One shape, the corner bracket, does the work of logo, image frame, hover state, focus ring, active navigation and cursor.

## Identity

- **Logo.** “MR” in Archivo at 125% width and weight 800, inside four corner brackets. `src/components/logo.jsx` holds the outlined paths, so the mark renders the same before fonts load. `public/assets/favicon.svg` drops to “R” so it stays legible at 16px; `apple-touch-icon.png` is rendered from it.
- **Type.** Archivo Expanded (125% width, 700) for display, Archivo at normal width for reading, Martian Mono at 87.5% width for labels, tags and numbers. Fonts are self-hosted through Fontsource, latin subset only.
- **Shape.** Radius 0 everywhere. Brackets mark state instead of rounded corners or shadows. The `.brk` utility in `src/index.css` draws them with backgrounds; `--bc`, `--arm` and `--t` set colour, arm length and thickness.
- **Colour.** Viridis, matplotlib's default colormap. Deep purple ink, highlighter yellow, teal and green. Tag colours encode discipline: yellow for AI, teal for software, green for research (`discipline` in `src/data/portfolio.js`).

| Token | Light | Dark |
| --- | --- | --- |
| `--bg` | `#f1f1ec` | `#110c17` |
| `--fg` | `#1d0f2b` | `#f1eee6` |
| `--muted` | `#5f5868` | `#a49caf` |
| `--line` | `#d8d4dc` | `#2b2335` |
| `--mark` (brackets) | `#1d0f2b` | `#fde725` |
| `--btn-bg` / `--btn-fg` | `#1d0f2b` / `#f1f1ec` | `#fde725` / `#1d0f2b` |
| `--tag-ai` / `--tag-software` / `--tag-research` | `#fde725` / `#8eddc9` / `#bfe38a` | same |

Muted text is 6.0:1 on light and 7.3:1 on dark. Tags always use ink text. Outcome lines use `mark`, a thick yellow rule under the text (`--hl-line`). The Research section uses `.invert`, which swaps to the other theme's tokens for a colour shift mid-page. The marquee is the one loud yellow band.

The type scale lives in `--t-*` tokens (12px labels up to the fluid hero and contact sizes). Nothing renders below 11px.

## Hero: the detector

`src/lib/detector-scene.js` is a Three.js scene, lazy-loaded by `src/components/detector-scene.jsx`.

- Six projects sit on cards in a receding 3D deck (`heroProjectIds`): screenshots and concept diagrams. The deck follows the pointer and tips back as the hero scrolls away.
- Four reticles, each made of eight solid bars, fly in from space. For every box in a project's `detections`, a reticle first lands on a decoy region with a low guess (“text 0.27”), then moves near the real region (“headline 0.62”) and snaps onto it with a small overshoot (“headline 0.99”). A scan band sweeps the card while it searches.
- Labels are HTML positioned each frame at the reticle's projected corner. Registration crosses drift in the background; reticles leave short trails.
- After every box locks, the front card swings around to the back and the next project comes forward. Clicking a back card brings it forward; clicking the front card opens the case study.
- The readout under the hero is plain HTML: project, discipline, outcome, previous, next, pause and case study. Hovering or focusing it holds the rotation.

Detection boxes are percentages of a 16:10 image: `{ label, score, x, y, w, h }`. The same data drives the 2D overlays in Work cards (on hover), the Research figures (on scroll into view) and the project dialog (always shown). Tags near the right edge right-align, and phones show only the first two labels per image.

## Imagery

Real screenshots where a project has a public interface. Where it doesn't, a concept diagram in the brand's own style: night background, dot grid, Archivo Expanded title with one yellow phrase, Martian Mono labels, viridis colour. Diagrams only show facts from the CV (IntelliBin's two backbones and four categories, the conformance states, the hydrogel models and targets). The hydrogel pore field is procedural, and its histogram and porosity are measured from that drawing. No AI-generated renders. Sources live outside the repo; the exported WebP files are in `public/assets/portfolio/`.

The deck is fitted to the `.hero-stage` element, so the layout decides where it sits. Phones use a tighter stack that never climbs into the copy. Rendering stops when the hero is offscreen, the tab is hidden, a dialog is open or rotation is paused. Slow frames drop the pixel ratio to 1. WebGL failure shows the front project as a flat image with HTML boxes.

## Motion

- Lenis smooth scrolling with eased anchor jumps. It stops while dialogs or the mobile menu are open; dialog content sets `data-lenis-prevent`.
- One intro per session: the mark locks on, then the page wipes up.
- Section headings slide up line by line. Work columns drift at different speeds; the experience timeline fills as you read.
- The cursor bracket follows the pointer and snaps around whatever it points at, with a label from `data-cursor`. Labels flip below or left near the viewport edges, and the lock is re-checked after clicks and scrolls. Fine pointers only.
- Buttons roll their label on hover; primary actions pull toward the pointer. Work cards tilt with a soft glare.
- The contact heading thins near the pointer using Archivo's weight axis. The footer shows Abu Dhabi time.
- The theme toggle wipes the new theme out of the button in a square.

Reduced motion turns off Lenis, the intro, the cursor, tilt, magnetism, the marquee drift and the proximity type. The hero renders one still frame with every box locked.

## Accessibility

All content is semantic HTML; the canvas and decorative layers are `aria-hidden`. Keyboard users get visible focus outlines, the skip link, Radix dialogs with focus return, pressed states on filters and controls, and a pause control for the rotating hero. The theme follows the system until the visitor chooses, and `index.html` applies it before first paint. Print hides the scene, header and decorations.

## Map

- `src/App.jsx`: shell, theme, smooth scroll, section counter, dialog state.
- `src/data/portfolio.js`: content, disciplines, detection boxes, hero order.
- `src/components/hero.jsx`, `hero.css`: copy, readout and scene host.
- `src/lib/detector-scene.js`, `src/components/detector-scene.jsx`: the 3D detector.
- `src/components/detection-frame.jsx`: image with HTML detection boxes.
- `src/components/motion-kit.jsx`: reveals, headings, buttons, tilt, marquee, cursor, intro.
- `src/components/*-section.jsx`, `sections.css`: Work, Experience, Research, Capabilities, Contact and footer.
- `src/components/site-header.jsx`, `project-dialog.jsx`, `logo.jsx`.
- `src/index.css`: fonts, tokens, base styles and shared components.
