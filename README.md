# Mohammad Ryyan Rashid

An interactive CV and engineering portfolio built with React, Vite, Three.js, Motion, Radix UI, and Tailwind CSS.

A CNN-style tile scene opens the portfolio. Three coordinated treatments of the same abstract geometry—shaded surfaces, contours, and sparse feature patches—sit at different depths. Individual tiles assemble and separate as native scrolling moves the camera through them. Pointer movement adds perspective, and the 3D scene settles when input stops. Faint circuit traces wrap around the hero's open space, with small blue and occasional warm currents that continue travelling while the page is still. Selected later sections use the same ambient detail. A steel-blue headline accent and solid blue hero action add color without gradient text or controls. The artwork represents AI and software engineering across domains. Completed content stays readable, and actual project imagery stays in Work and Research.

The scene generates one small numerical texture locally and shades it into the three visual treatments. It needs no photographic texture downloads. Ambient SVG currents use CSS animation and stop when offscreen, paused, or the tab is hidden; reduced motion removes them. The site includes connected project details, work filters, light and dark themes, a pause control, keyboard navigation, and responsive layouts. Static WebP fallbacks are captured from the implemented tile scene for desktop/mobile and both themes. Header navigation and the downloadable CV remain available during the opening.

## Development

```bash
npm install
npm run dev
```

Open the local URL with the `/CV/` base path.

## Validation and production

```bash
npm run lint
npm run build
npm run preview
```

The Vite base path is configured for GitHub Pages at `/CV/`. The existing deployment workflow publishes changes pushed to `main`.

## Updating the CV

Edit `src/data/portfolio.js` for projects, experience, research, skills, and profile details. Asset paths in this file are relative to `public/`. Replace `public/assets/Mohammad_Ryyan_Rashid_Resume.pdf` when the downloadable document changes. The [design notes](DESIGN.md) describe visual and interaction conventions.
