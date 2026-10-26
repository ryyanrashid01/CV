# Mohammad Ryyan Rashid

An interactive CV and engineering portfolio built with React, Vite, Three.js, Motion, Lenis and Radix UI.

The hero is a 3D detector: real project screenshots float in a deck while solid bracket reticles search each card, try a wrong guess, and lock onto real regions as their confidence climbs. The rest of the site uses the same bounding-box language for its logo, hover states, focus, navigation and cursor. Light and dark themes follow the system until the visitor chooses one. The [design notes](DESIGN.md) describe the system.

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

The Vite base path is configured for GitHub Pages at `/CV/`. The deployment workflow publishes changes pushed to `main`.

## Updating the CV

Edit `src/data/portfolio.js` for projects, experience, research, skills and profile details. Asset paths are relative to `public/`.

Each project has a `discipline` (`ai`, `software` or `research`) that sets its tag colour, and `detections`: boxes over its screenshot as percentages of a 16:10 image, `{ label, score, x, y, w, h }`. `heroProjectIds` sets which projects appear in the hero and in what order. Replace `public/assets/Mohammad_Ryyan_Rashid_Resume.pdf` when the downloadable document changes.
