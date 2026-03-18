# Amateur Radio Tower Designer

A browser-based calculator suite for amateur radio antenna installations.
Built with React + Vite + Tailwind CSS, available as a standard SPA or as a single offline HTML file.

**Version:** 0.1.0

---

## Calculators

### Guy Wire Calculator
Calculates geometry for guyed masts with 1, 2, or 3 wire levels.

**Inputs per level:**
- Attachment height on mast (m)
- Anchor radius from mast base (m)
- Number of wires (3 or 4)

**Outputs:**
- Wire length per wire
- Angle from horizontal
- Angle from mast
- Total wire length per level
- Grand total across all levels

Side-view SVG diagram with color-coded wire levels included.

---

## Getting Started

```bash
npm install
npm run dev        # Dev server at http://localhost:5173
```

## Build

```bash
npm run build            # Standard SPA → dist/
npm run build:standalone # Single offline HTML file → dist-standalone/
npm run preview          # Preview production build
```

## Development

```bash
npm run lint   # ESLint (strict, 0 warnings allowed)
npm run test   # Vitest unit tests
```

## Tech Stack

- React 18 + Vite 7
- Tailwind CSS 3 (dark theme)
- Vitest for unit tests
- Custom i18n — DE/EN, no external library
- `vite-plugin-singlefile` for the standalone build

## Language

The UI supports German and English. Toggle in the top-right corner; preference is saved in `localStorage`.

## Planned

- Force and load calculations for guy wires
- Additional antenna calculators
