# Spatial tiles for an AI and software portfolio

The visual direction restores the earlier CNN-style image planes. Eight large planes sit at different depths, with small detached tiles, sparse connecting curves, and floating image patches. Native scrolling moves the camera through the layers and separates or assembles their tiles. Pointer movement adds perspective; the scene settles when input stops.

The positioning is AI and software engineering across domains. The planes show three representations of one abstract geometric field: shaded faceted forms, fine contours, and sparse activation-like patches. These are coordinated visual treatments, not outputs claimed from a trained model. Keep the hero, shared scene, fallback and social preview free of industry-specific imagery such as drones or microscopy. Actual project screenshots and the factual materials-research entry stay in the Work and Research content.

## Content and navigation

Facts come from `public/assets/Mohammad_Ryyan_Rashid_Resume.pdf` and the existing website, normalized in `src/data/portfolio.js`. Preserve organizations, role dates, metrics, project links, degree details, and the hydrogel manuscript's “under peer review” status. IntelliBin and its World Future Energy Summit 2026 presentation come from the PDF. UAS conformance belongs to Khalifa University according to the PDF. Do not invent dates or issuers for unspecified awards.

The page runs from introduction to work, experience, research and education, capabilities, and contact. Stable project IDs connect cards, experience entries, and capabilities. Summaries support scanning; dialogs and native disclosures carry detail. Keep the downloadable PDF easy to find.

## Motion and composition

- The existing shared opening sequence completes over 1500ms. Header navigation and the CV download remain available. The tiles assemble while readable pieces of the introduction appear.
- Native scrolling advances content generation monotonically. Project images resolve in irregular patches with small corner lights. Completed content stays readable when scrolling back.
- A separate measured chapter-progress value drives the restored perspective camera. Filtering projects or resizing remeasures chapter bounds, so the scene continues to follow the content.
- Desktop places the image planes beside the introduction. Mobile restores the original content-first composition: the identity, headline and actions sit above the tile scene. Neutral veils keep art clear of the copy and controls.
- Faint circuit traces wrap through the hero's measured empty space, above and below its copy and along the outer margins. Three small currents travel continuously on desktop; mobile uses two and keeps the larger routes below the actions. Their movement is independent of scroll. Blue signals carry a small warm accent on one desktop route.
- Later sections use stronger reading veils over the moving planes. Quiet, unlabelled circuit traces and directed graphs occupy heading whitespace; narrow layouts use compact connectors. Each visible, completed circuit carries two currents, or one on mobile. Hero traces sit below the text layer; later circuits sit above the reading veils in measured whitespace. Floating code and programming-language logos remain removed.

This is visual artwork, not a labelled lesson about network architecture. Preserve the original tile structure and physical camera depth. Do not replace it with spheres, filament webs, or a game.

## Visual system

Keep Geist Variable and Geist Mono, the wide editorial layout, staggered project grid, and restrained corner radii. Main containers cap at 1440px with 64px desktop gutters, 45px intermediate gutters, and 24px mobile gutters. Section spacing steps through 115/90/72px.

| Token | Dark | Light |
| --- | --- | --- |
| Background | `#080910` | `#f3f4f8` |
| Foreground | `#f3f4ff` | `#1b1c29` |
| Muted | `#a4a7b8` | `#55596d` |
| Button fill | `#edf0f7` | `#242734` |
| Button ink | `#151720` | `#ffffff` |
| Accent | `#82b9ff` | `#2454c6` |
| Hero emphasis | `#9bbcf7` | `#3156a3` |
| Hero action | `#2454ed` / white | `#2454ed` / white |
| Surface | `#141620` | `#e9eaf2` |
| Border | `#2c3042` | `#cbd0df` |

Headlines use solid foreground and muted emphasis, with steel blue reserved for the hero's “engineered” span. The hero action uses solid blue with a white label and a darker hover fill (`#1d46c7`); other primary actions and filters retain their existing fills. Keep labels whole and focus outlines visible. Reserve gradients for artwork shading, reading veils and the circuit's quiet edge fade; do not apply gradient text or rainbow controls. Tile edges and connecting lines use restrained blue, silver and lavender accents. Tiny warm circuit signals add contrast without becoming another text color. Light mode retains defined image surfaces rather than washing them into pale transparent panels.

The layout has been checked at 320 × 740, 390 × 844, 768 × 600, 1366 × 600 and 1440 × 900. Preserve clearance around the fixed header, actions, and discipline controls.

## Accessibility and rendering

All CV content remains semantic HTML. The canvas, circuit SVGs, generation paths and decorative fragments are hidden from assistive technology and cannot intercept clicks. Preserve keyboard focus, meaningful image alternatives, pressed states, current-section navigation, dialog focus trapping and restoration, and the skip link.

Pause and reduced motion immediately reveal content. Pause freezes camera travel; reduced motion fixes the camera at its initial depth. Dialogs pause the scene. Focus, anchors, browser Find and restored scroll positions reveal their destinations. Print hides decorative layers and presents readable content. Native scrolling is never intercepted.

Ambient currents use normalized SVG paths with small round dashes and a faint halo. CSS animates their stroke offset over 8–16 seconds, with staggered phases; there is no JavaScript animation loop or per-frame layout measurement. Current starts after its circuit finishes revealing. IntersectionObserver pauses offscreen circuits, and document visibility pauses the layer in hidden tabs. The main pause control and project dialogs also pause current. Reduced motion hides moving lights while keeping traces; print removes the decoration and resets the hero accents to neutral colors. Inactive desktop/mobile drawings remain paused.

The restored WebGL renderer batches 936 desktop tiles or 432 mobile tiles, connecting lines, and 220 desktop or 84 mobile floating patches into three draw calls. Rendering is driven by opening, scroll, pointer, mode and layout changes. It stops once transitions settle and while the document is hidden. Slow devices reduce pixel ratio. Geometry, textures, observers and event listeners are disposed on unmount.

The source imagery is generated once as a small numerical DataTexture: 512 × 768 on desktop and 256 × 384 on mobile. Two channels encode precise depth; two hold derivatives. The shader reads this shared field to produce all three treatments, with antialiased contours and deterministic sparse features. There are no photographic texture downloads or asynchronous texture-load callbacks. The field is disposed with the rest of the scene.

Initialization failure or WebGL context loss reveals a static capture of the implemented tile scene. Separate desktop/mobile and light/dark WebP assets preserve the same subject and composition. All four captures and the social preview use the current geometric imagery. The semantic content and controls remain independent of WebGL. Image-generation fragments mount only near the viewport; their underlying semantic images remain available.

## Implementation map

- `src/App.jsx`: page composition, controls, shared hooks, dialogs and contact.
- `src/data/portfolio.js`: factual content and project relationships.
- `src/lib/use-page-generation.js`: opening sequence and persistent content frontier.
- `src/lib/use-spatial-progress.js`: measured section progress for the perspective camera.
- `src/components/neural-network.jsx`: restored image-plane renderer, shading, lifecycle and responsive fallback.
- `src/lib/neural-topology.js`: original tile geometry, curves, floating patches and generation anchor.
- `src/lib/computational-field.js`: shared geometric depth field and numerical texture, generated once per scene.
- `src/components/content-assembly.jsx` and `.css`: readable text pieces and image fragments.
- `src/components/generation-field.jsx` and `.css`: source connection, margin paths and active tips.
- `src/components/circuit-backdrop.jsx` and `.css`: measured hero routes, section circuits, compact connectors and visibility-controlled ambient currents.
- `src/components/research-section.jsx` and `.css`: computer-vision-led research.
- `src/index.css`: typography, themes, responsive composition, reading veils and print.
- `public/assets/spatial-fallback*.webp`: captures of the current scene for rendering failures.
- `public/assets/neural-core-preview.webp`: screenshot of the current implemented hero for social previews.

## Validation

ESLint and production build pass. Independent browser checks cover both themes at 320, 390, 768 and 1366px widths, plus a 1440px desktop review: no horizontal overflow, visible actions and discipline controls, and readable text.

Camera depth responds to scrolling, freezes on pause, resumes correctly, and remains at 11.00 with reduced motion. Idle frame counts settle. Direct research anchors and resizing remain aligned. Forced context loss loads the correct desktop/mobile fallback in both themes. No shader or page errors were observed in the final implementation. Project-domain imagery has been removed from the live source and all of its static captures. The shared field takes approximately 7–12ms to generate on compact settings and 30–36ms on desktop settings in the review browser; it is generated once, with no texture animation loop.

Project dialogs pause the scene and restore focus after Escape. Filters return 3 AI/research projects, 5 software/systems projects and 6 overall. The CV PDF returns HTTP 200. Print hides the scene. The lazy Three.js chunk remains above Vite's standard 500KB advisory; this is a build-size warning, not a build failure. Earlier filament-scene Lighthouse measurements do not describe this restored implementation.

The ambient-circuit pass was checked at 1440 × 900, 1366 × 600, 390 × 844 and 320 × 740 in both themes. Stationary circuit offsets advance while the 3D frame counter stays fixed. Pause and project dialogs freeze offsets; offscreen circuits pause, inactive mobile/desktop drawings stay paused, and reduced motion and print remove the current animation. A synthetic visibility event verified hidden-document suspension; headless browser tabs did not provide a real background-tab test. Hero button contrast is 5.89:1, rising to 7.63:1 on hover; the emphasized word has 10.34:1 contrast in dark mode and 6.39:1 in light mode. Labels, keyboard outlines, and layout clearance remain intact.
