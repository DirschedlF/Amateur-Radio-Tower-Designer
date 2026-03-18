# Amateur Radio Tower Designer

A browser-based calculator suite for amateur radio antenna installations.
Built with React + Vite + Tailwind CSS, available as a standard SPA or as a single offline HTML file.

**Version:** 0.2.0

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

### Wind Load Calculator

Calculates wind forces and bending moments for telescoping conical masts (Schiebemast) with mounted antennas. Uses simplified formula without specific norm.

**Inputs:**

- Wind speed (m/s) or dynamic pressure (N/m²) — live sync
- Gust factor (applied to dynamic pressure, default 1.7)
- Mast: height, bottom diameter, top diameter (mm), drag coefficient cw
- Antenna: projected area (m²), drag coefficient cw, mounting height (m)

**Outputs:**

- Dynamic pressure q (N/m²)
- Wind force on mast and antenna separately (N)
- Total wind force (N)
- Bending moments at mast base for mast, antenna, and total (Nm)

SVG side-view diagram with force arrows at centroid heights included.

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
- Grounding calculator
