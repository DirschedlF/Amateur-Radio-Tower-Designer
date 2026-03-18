# Design Spec: Guy Wire Calculator (Abspannungsrechner)

**Date:** 2026-03-18
**Project:** Amateur Radio Tower Designer
**Status:** Approved

---

## Overview

A bilingual (DE/EN) web application for calculating amateur radio tower/mast guy wire geometry. Built as a multi-tool framework to accommodate future calculators (wind load, grounding, etc.). The first calculator covers geometric guy wire calculations (lengths and angles); force/load calculations are planned as a future extension.

---

## Technology Stack

Identical to sister projects (DXCC Analyzer Pro, Propagation Info):

- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS 3 (dark theme, gray-900/950 backgrounds)
- **Icons:** Lucide React
- **Linting:** ESLint, strict (0 warnings)
- **Build modes:**
  - Standard SPA → `dist/` (GitHub Pages)
  - Standalone HTML → `dist-standalone/` (offline use, single file via `vite-plugin-singlefile`)

---

## Application Structure

### Multi-Tool Sidebar Layout

- **Header:** App title + DE/EN language toggle button
- **Sidebar (left):** List of available calculators; active one highlighted; future calculators shown as placeholders
- **Main content (right):** Active calculator (inputs + diagram + results)

### File Structure

```
src/
├── main.jsx
├── App.jsx                    # Sidebar + active calculator router
├── i18n/
│   └── translations.js        # All DE/EN strings, centralized
├── hooks/
│   └── useLanguage.js         # Language context + toggle (DE/EN)
├── calculators/
│   └── guywire/
│       ├── GuyWireCalc.jsx    # Main orchestrating component
│       ├── GuyWireInputs.jsx  # Input form (global + per-level)
│       ├── GuyWireDiagram.jsx # SVG side view
│       ├── GuyWireResults.jsx # Results table
│       └── guywire.js         # Pure calculation logic (no React)
└── components/
    └── Sidebar.jsx
```

---

## Internationalisation (i18n)

- **Approach:** Custom lightweight solution — no external library
- **`translations.js`:** Single object `{ de: { key: "..." }, en: { key: "..." } }` containing all UI strings
- **`useLanguage` hook:** React context providing `{ lang, t, toggleLang }` — `t("key")` returns the string in the active language
- **Toggle:** A DE/EN button in the header switches language globally; preference persisted in `localStorage`

---

## Guy Wire Calculator — Inputs

### Global Settings

| Field | Type | Values | Default |
|---|---|---|---|
| Masthöhe / Mast Height | Number input | meters | 12.0 |
| Abspannebenen / Guy Wire Levels | Toggle | 2, 3 or 4 | 2 |

**Default configuration (12 m mast, 2 levels):**

| Level | Höhe / Height | Radius | Drähte / Wires |
|---|---|---|---|
| Ebene 1 | 6.0 m | 5.0 m | 3 |
| Ebene 2 | 11.0 m | 8.0 m | 3 |

### Per-Level Settings (one row per level)

| Field | Type |
|---|---|
| Höhe / Height | Number input (meters) |
| Abspannradius / Anchor Radius | Number input (meters) |
| Drähte / Wires | Toggle: 3 or 4 (per level, independent) |

---

## Guy Wire Calculator — Calculation Logic

Pure JavaScript function in `guywire.js` — no React dependency. Accepts a config object, returns a results object.

```js
// Input
{
  mastHeight: number,   // meters
  levels: number,       // 2, 3, or 4
  levelConfig: [{ height: number, radius: number, wires: number }, ...]
  // wires: 3 or 4, configurable independently per level
}

// Output per level
{
  wireLength: number,        // L = √(h² + r²)
  angleFromHorizontal: number, // α = arctan(h / r) in degrees
  angleFromMast: number,     // β = 90° - α in degrees
  totalLengthPerLevel: number, // L × wiresPerLevel
}

// Overall
{
  grandTotalLength: number   // Σ (L × wiresPerLevel) across all levels
}
```

This function is intentionally isolated so it can later be extended with force/load calculations without touching the UI layer.

---

## Guy Wire Calculator — Output

### SVG Side View (Seitenansicht)

- 2D side view of the mast with guy wires drawn as angled lines
- Each level rendered in a distinct color (consistent across diagram and results table)
- Ground line, mast, anchor points, height labels shown
- Scales automatically to the entered mast height and radii

### Results Table (Ergebnistabelle)

| Column | Description |
|---|---|
| Ebene / Level | Level number, color-coded |
| Drahtlänge / Wire Length | Per single wire (meters) |
| Winkel (Horizontal) / Angle | Angle from horizontal (degrees) |
| Winkel (Mast) / Angle | Angle from mast vertical (degrees) |
| Länge gesamt / Total Length | Length × wires per level |
| **Gesamtlänge / Grand Total** | Sum of all levels |

---

## Future Extensions

The framework is designed so additional calculators can be added as new entries in the sidebar and new folders under `src/calculators/`:

1. **Windlast / Wind Load** — force on guy wires and anchors based on wind speed and mast diameter
2. **Kräfte / Force Calculation** — tension in each wire, anchor pull forces
3. **Erdung / Grounding** — grounding rod calculations

Each extension builds on the `guywire.js` calculation outputs as inputs for load analysis.

---

## Non-Goals (this iteration)

- No backend or server-side processing — 100% client-side
- No user accounts or cloud storage
- No 3D visualization
- No force/load calculations (next iteration)
