# Wind Load Calculator — Design Spec

**Date:** 2026-03-18
**Status:** Approved
**Norm:** Simplified formula (no specific standard)

---

## Overview

A standalone wind load calculator for amateur radio telescoping masts (Schiebemast). Calculates wind forces and bending moments for both the conical mast and mounted antennas. Follows the same architecture as the existing Guy Wire calculator.

---

## Calculation Logic (`windload.js`)

### Inputs

| Parameter | Type | Description |
|-----------|------|-------------|
| `windSpeed` | number (m/s) | Wind velocity |
| `mast.height` | number (m) | Total mast height |
| `mast.diamBottom` | number (m) | Mast diameter at base |
| `mast.diamTop` | number (m) | Mast diameter at top |
| `mast.cw` | number | Drag coefficient (default: 0.8, circular cylinder) |
| `antenna.area` | number (m²) | Total projected wind area of all antennas |
| `antenna.cw` | number | Drag coefficient (default: 0.8) |
| `antenna.mountHeight` | number (m) | Effective mounting height above base |

### Formulas

```
// Dynamic pressure
q = 0.5 × 1.25 kg/m³ × windSpeed²

// Mast projected area (trapezoid)
A_mast = (diamBottom + diamTop) / 2 × height

// Forces
F_mast    = q × A_mast × cw_mast
F_antenna = q × antenna.area × cw_antenna
F_total   = F_mast + F_antenna

// Moment arm for conical mast (centroid of trapezoid)
h_mast = height/3 × (diamBottom + 2×diamTop) / (diamBottom + diamTop)

// Bending moments at base
M_mast    = F_mast    × h_mast
M_antenna = F_antenna × antenna.mountHeight
M_total   = M_mast + M_antenna
```

### Output

```js
{
  q,                          // dynamic pressure (N/m²)
  mast: {
    area,                     // projected area (m²)
    force,                    // F_mast (N)
    momentArm,                // h_mast (m)
    moment,                   // M_mast (Nm)
  },
  antenna: {
    force,                    // F_antenna (N)
    moment,                   // M_antenna (Nm)
  },
  total: {
    force,                    // F_total (N)
    moment,                   // M_total (Nm)
  },
}
```

---

## UI Structure

### Layout

```
┌──────────────────────────────────────────────────────┐
│ WindLoadInputs                                       │
│  [Wind]    v (m/s)  ↔  q (N/m²)  — live sync        │
│  [Mast]    Höhe | ⌀ unten (mm) | ⌀ oben (mm) | cw   │
│  [Antenna] Fläche (m²) | cw | Montagehöhe (m)       │
└──────────────────────────────────────────────────────┘
┌───────────────────────┐  ┌───────────────────────────┐
│ WindLoadDiagram (SVG) │  │ WindLoadResults            │
│  Conical mast         │  │  q (N/m²)                  │
│  Force arrow at       │  │  F_Mast / F_Antenne (N)    │
│  centroid height      │  │  F_Gesamt (N / kN)         │
└───────────────────────┘  │  M_Mast / M_Antenne (Nm)  │
                           │  M_Gesamt (Nm / kNm)       │
                           └───────────────────────────┘
```

### Input Details

- **Wind speed ↔ dynamic pressure:** Two fields that update each other live. No mode switch — editing either field recalculates the other immediately.
- **Diameter inputs:** entered in **mm** (practical for tube masts), converted to m internally.
- **cw fields:** editable number inputs with default 0.8 (circular cylinder).

### Diagram

Simple SVG side view:
- Conical mast outline (trapezoid shape, wider at base)
- Horizontal force arrow at centroid height (h_mast)
- Antenna symbol at mountHeight with its force arrow
- Similar visual style to `GuyWireDiagram`

---

## Files

### New Files

```
src/calculators/windload/
  windload.js           — pure calculation function, no React
  WindLoadCalc.jsx      — orchestrator: owns state, calls windload.js via useMemo
  WindLoadInputs.jsx    — input form (wind, mast, antenna sections)
  WindLoadDiagram.jsx   — SVG side view
  WindLoadResults.jsx   — results table
tests/
  windload.test.js      — unit tests for windload.js
```

### Modified Files

| File | Change |
|------|--------|
| `src/App.jsx` | Add `windload: WindLoadCalc` to `CALC_COMPONENTS` |
| `src/components/Sidebar.jsx` | Move `windload` from `COMING_SOON` to `CALCULATORS`; add subtitle key `calcWindLoadSubtitle` |
| `src/i18n/translations.js` | Add all new translation keys (DE + EN) |

### No changes to guywire files.

---

## i18n Keys (new)

| Key | DE | EN |
|-----|----|----|
| `calcWindLoadSubtitle` | Windlast | Wind Load |
| `windSection` | Wind | Wind |
| `mastSection` | Mast | Mast |
| `antennaSection` | Antenne | Antenna |
| `windSpeed` | Windgeschwindigkeit | Wind Speed |
| `dynamicPressure` | Staudruck | Dynamic Pressure |
| `unit_ms` | m/s | m/s |
| `unit_nm2` | N/m² | N/m² |
| `diamBottom` | ⌀ unten | ⌀ Bottom |
| `diamTop` | ⌀ oben | ⌀ Top |
| `unit_mm` | mm | mm |
| `cwLabel` | cw | cw |
| `antennaArea` | Antennenfläche | Antenna Area |
| `unit_m2` | m² | m² |
| `mountHeight` | Montagehöhe | Mount Height |
| `colComponent` | Komponente | Component |
| `colForce` | Kraft | Force |
| `colMomentArm` | Hebelarm | Moment Arm |
| `colMoment` | Moment | Moment |
| `rowMast` | Mast | Mast |
| `rowAntenna` | Antenne | Antenna |
| `rowTotal` | Gesamt | Total |
| `unit_n` | N | N |
| `unit_kn` | kN | kN |
| `unit_nm` | Nm | Nm |
| `unit_knm` | kNm | kNm |

---

## Testing

`tests/windload.test.js` covers:
- Staudruck-Berechnung aus Windgeschwindigkeit
- Mastfläche (Trapez) mit bekannten Werten
- Kräfte Mast und Antenne
- Schwerpunkthöhe konischer Mast (Sonderfall: diamBottom === diamTop → H/2)
- Biegemomente
- Gesamtkraft und -moment
