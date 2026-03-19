# Amateur Radio Tower Designer

Wer einen Amateurfunk-Mast plant, jongliert mit Masthöhe, Abspanngeometrie und Windlast — und verliert dabei schnell den Überblick. Der **Amateur Radio Tower Designer** bringt das alles an einen Ort.

Das Tool berechnet zunächst die **Abspanngeometrie**: Drahtlängen, Winkel und Gesamtmaterial für bis zu drei Abspannebenen — sofort, während man die Werte eingibt. Parallel dazu ermittelt der **Windlast-Rechner** den dynamischen Winddruck auf Mast und Antenne nach EN 1991-1-4.

Der entscheidende Schritt: Beide Rechner sind verknüpft. Aus der Windlast und der Abspanngeometrie berechnet das Tool direkt die **Drahtspannung je Ebene** — in Newton und Kilogramm-Kraft, aufgeschlüsselt nach der Abschnittsmethode. So sieht man auf einen Blick, welche Abspannebene am stärksten belastet wird und ob die geplanten Drähte dafür ausgelegt sein müssen.

Das Ergebnis ist kein Statikgutachten, sondern eine fundierte **Planungsgrundlage**: schnell, nachvollziehbar, kostenlos — direkt im Browser, ohne Installation.

**Version:** 0.3.0 · [Live](https://dirschedlf.github.io/Amateur-Radio-Tower-Designer/)

---

## Calculators

### Guy Wire Calculator

Calculates geometry and wind load tensions for guyed masts with 1, 2, or 3 wire levels.

**Geometry inputs per level:**

- Attachment height on mast (m)
- Anchor radius from mast base (m)
- Number of wires (3 or 4)

**Geometry outputs:**

- Wire length per wire
- Angle from horizontal / angle from mast
- Total wire length per level and grand total

**Load analysis** (requires Wind Load Calculator to be filled in):

- Section wind force per level (sectional method / Abschnittsmethode)
- Horizontal force per wire
- Wire tension in N and kgf

Side-view SVG diagram with color-coded wire levels included.

### Wind Load Calculator

Calculates wind forces and bending moments for telescoping conical masts with mounted antennas, following EN 1991-1-4.

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

## Dokumentation

- [Benutzerhandbuch (DE)](docs/Benutzerhandbuch.md) — Schritt-für-Schritt-Anleitung für Einsteiger, inkl. Erklärungen zu Windwerten, Böenfaktor und cw-Wert
- [Berechnungsmethoden (DE)](docs/Berechnungsmethoden.md) — Formeln, Annahmen und physikalisches Modell beider Rechner

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

## Disclaimer

The calculations in this tool are technical estimates for planning purposes only, without warranty or liability. For a permitted structural design (e.g. installation on buildings or as a permanent structure), a structural safety assessment by a licensed engineer in accordance with EN 1991-1-4 is required.
