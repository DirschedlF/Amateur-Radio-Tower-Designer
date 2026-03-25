# Spider Beam Mast-Konfigurator — Design Spec

**Datum:** 2026-03-25
**Status:** Genehmigt
**Produkt:** Amateur Radio Tower Designer
**Feature:** Neuer Rechner „Spider Beam Mast-Konfigurator"

---

## Überblick

Neuer, vollständig eigenständiger Rechner, der die Konfiguration eines Spiderbeam 14m HD Teleskopmastes unterstützt. Der Nutzer gibt die gewünschte Masthöhe ein, sieht welche Segmente ausgezogen werden, wählt Abspannpunkte per Klick, und kann die Konfiguration mit einem Bestätigungs-Dialog in den Abspannungs-Rechner übertragen.

---

## Mast-Physik

### Segment-Definitionen (14m HD Mast)

- **14 Segmente**, jedes exakt **1,0 m** lang
- **Segment 1 = Grundrohr** (fest, steht immer am Boden, Höhe 0–1 m)
- **Segment 14 = Mastspitze** (dünnstes Segment, wird zuerst ausgezogen)
- Montage-Reihenfolge: Seg. 14 zuerst rausziehen, dann 13, 12 … bis zur gewünschten Höhe

### Höhenformel

Für eine gewünschte Masthöhe **H** (1–14 m):

```text
Aktive Segmente: N ∈ {2, 3, …, 14} mit N ≥ (16 − H)
Eingezogen im Grundrohr: N ∈ {2, …, 15 − H}

Höhe Abspannpunkt (Segment N) = H + N − 15
```

**Beispiele:**

| H     | Aktiv (ausgezogen) | Im Grundrohr | Seg. 10 | Seg. 12 | Seg. 14 |
| ----- | ------------------ | ------------ | ------- | ------- | ------- |
| 14 m  | Seg. 2–14          | —            | 9 m     | 11 m    | 13 m    |
| 12 m  | Seg. 4–14          | Seg. 2–3     | 7 m     | 9 m     | 11 m    |
| 10 m  | Seg. 6–14          | Seg. 2–5     | 5 m     | 7 m     | 9 m     |

### Aktivierungsgrenzen der Abspannpunkte

Ein Abspannpunkt an Segment N ist nur verfügbar wenn `H ≥ 16 − N`:

| Segment | Verfügbar ab H |
| ------- | -------------- |
| Seg. 14 | H ≥ 2          |
| Seg. 12 | H ≥ 4          |
| Seg. 10 | H ≥ 6          |

---

## Dateistruktur

### Neue Dateien

```text
src/calculators/spiderbeam/
  spiderbeam.js          ← pure Rechenlogik, kein React
  SpiderBeamCalc.jsx     ← Orchestrator, hält State
  SpiderBeamDiagram.jsx  ← SVG-Diagramm (links)
  SpiderBeamResults.jsx  ← Abspannpunkte + Übergabe-Box (rechts)

tests/
  spiderbeam.test.js     ← Unit-Tests für spiderbeam.js
```

### Geänderte Dateien

```text
src/App.jsx                              ← SpiderBeamCalc einbinden, Bestätigungs-Dialog, pendingPrefill/confirmedPrefill-State
src/components/Sidebar.jsx               ← neuer CALCULATORS-Eintrag 'spiderbeam'
src/calculators/guywire/GuyWireCalc.jsx  ← neues Prop prefill
src/i18n/translations.js                 ← neue i18n-Keys (siehe unten)
```

---

## Rechenlogik (`spiderbeam.js`)

### Mast-Konfigurationen

```js
export const MAST_CONFIGS = {
  '14m_hd': {
    name: 'Spiderbeam 14m HD',
    segments: 14,
    segmentLength: 1.0,        // m
    guyLevels: [10, 12, 14],   // Segmentnummern der Abspannpunkte
  },
  // '12m_hd': { … }  ← spätere Erweiterung
}
```

### Hauptfunktion

```js
export function calculateSpiderBeam({ mastConfig, desiredHeight, activeGuyLevels }) {
  // Gibt zurück:
  // {
  //   activeSegments: number[],      // z.B. [4,5,…,14] bei H=12
  //   inGroundtube: number[],        // z.B. [2,3] bei H=12
  //   attachmentPoints: [
  //     { segment: 10, height: 7, available: true, active: true },
  //     { segment: 12, height: 9, available: true, active: true },
  //     { segment: 14, height: 11, available: true, active: false },
  //   ]
  // }
}
```

---

## Komponenten

### `SpiderBeamCalc.jsx`

Orchestrator. State:

```js
{
  desiredHeight: 14,             // 1–14 m
  activeGuyLevels: [10, 12, 14], // welche Seg-Nummern aktiv
}
```

`mastConfig` ist **kein State**, sondern eine Konstante:

```js
const mastConfig = MAST_CONFIGS['14m_hd']
```

Wenn später ein zweiter Masttyp hinzukommt, wird State ergänzt.

Props:

```jsx
SpiderBeamCalc({
  onConfigureGuyWire(config),  // { mastHeight, levels: [{ segment, height }] }
  onNavigateToGuyWire(),
})
```

Layout: `grid-cols-1 md:grid-cols-2` — Diagram links, Results rechts.

### `SpiderBeamDiagram.jsx`

Props: `{ config, results }`

SVG-Elemente:

- **Grundrohr** (Seg. 1): blauer gefüllter Rechteck-Block am Boden
- **Eingezogene Segmente** (Seg. 2 … 15−H): gestrichelter Block innerhalb des Grundrohrs
- **Aktiver Mastteil** (Seg. 16−H … 14): Trapez (konisch), Farbe `#334155`, Rand `#60a5fa`
- **Abspannpunkte aktiv**: gelber Kreis + Horizontallinie + symbolische Guy-Wire-Linien zum Boden
- **Abspannpunkte deaktiviert**: grauer Kreis + gestrichelte Linie
- **Höhenachse** links, Höhenbeschriftungen der Abspannpunkte

Skalierung: `scale = availableHeight / desiredHeight` (uniform, analog zu `GuyWireDiagram.jsx`)

Symbolische Guy-Wire-Linien: horizontaler Versatz zum Boden = feste **60 px** links und rechts von der Mastmitte — keine physikalische Skalierung, rein symbolisch.

### `SpiderBeamResults.jsx`

Props: `{ results, mastConfig, desiredHeight, activeGuyLevels, onToggleLevel, onConfigureGuyWire, onNavigateToGuyWire }`

Aufbau (von oben nach unten):

1. **Masttyp-Label** — statisches Label `mastConfig.name` (kein Selector-UI; zweiter Masttyp ist nicht im Scope, kein `onMastTypeChange`-Prop nötig)
2. **Höhen-Eingabe** — Zahlenfeld (1–14), Status-Badge (aktive Segmente + eingezogen im Grundrohr)
3. **Abspannpunkte** — klickbare Zeilen, toggle `activeGuyLevels` im Parent via `onToggleLevel`
4. **Übergabe-Box** — Vorschau der zu übertragenden Werte + Button „Abspannungs-Rechner öffnen"

### Bestätigungs-Dialog (in `App.jsx`)

Erscheint wenn `pendingPrefill !== null`. Einfaches Modal (kein Portal nötig):

```text
┌─────────────────────────────────────────┐
│  Abspannungs-Rechner überschreiben?     │
│                                         │
│  Masthöhe: 12 m                         │
│  Ebene 1:  7 m  (Segment 10)            │
│  Ebene 2:  9 m  (Segment 12)            │
│                                         │
│  [Abbrechen]        [Ja, überschreiben] │
└─────────────────────────────────────────┘
```

- Bei „Ja": `setConfirmedPrefill(pendingPrefill)` + `setActiveCalc('guywire')` + `setPendingPrefill(null)`
- Bei „Abbrechen": `setPendingPrefill(null)` — `GuyWireCalc` wird **nicht** verändert

---

## GuyWireCalc — Prefill-Integration

Neues Prop `prefill = null`. Ein `useEffect([prefill])` übernimmt die Werte:

```js
useEffect(() => {
  if (!prefill) return
  setConfig(c => ({
    ...c,
    mastHeight: prefill.mastHeight,
    levels: prefill.levels.length,
    // Nur die ersten n Einträge überschreiben, Rest aus c.levelConfig erhalten
    // (verhindert undefined-Einträge wenn der Nutzer später mehr Ebenen aktiviert)
    levelConfig: c.levelConfig.map((existing, i) =>
      i < prefill.levels.length
        ? { ...existing, height: prefill.levels[i].height }
        : existing
    ),
  }))
  onMastHeightChange(prefill.mastHeight)  // sharedMastHeight synchronisieren
}, [prefill]) // eslint-disable-line react-hooks/exhaustive-deps
```

**Wichtig — `onMastHeightChange`:** Muss aufgerufen werden, damit `sharedMastHeight` in App.jsx auf den neuen Wert aktualisiert wird. Andernfalls würde der bestehende `useEffect([mastHeight])` in GuyWireCalc beim nächsten Render mit dem alten `sharedMastHeight`-Prop feuern. Da der prefill-Effect aber bereits denselben Wert in `config.mastHeight` geschrieben hat, greift die Early-Return-Guard (`c.mastHeight === mastHeight`) korrekt — trotzdem muss der Prop-Wert stimmen um zukünftige Änderungen nicht zu blockieren.

Nach dem Übernehmen: keine Rückverbindung. Der Abspannrechner ist danach vollständig eigenständig.

---

## App.jsx — Änderungen

```jsx
// Zwei getrennte States: pending (für Dialog-Anzeige) und confirmed (für GuyWireCalc)
const [pendingPrefill, setPendingPrefill] = useState(null)
const [confirmedPrefill, setConfirmedPrefill] = useState(null)

// SpiderBeamCalc — nur pending setzen, GuyWireCalc wird noch nicht verändert:
<SpiderBeamCalc
  onConfigureGuyWire={setPendingPrefill}
  onNavigateToGuyWire={() => setActiveCalc('guywire')}
/>

// GuyWireCalc — bekommt nur confirmedPrefill, nie das pending:
<GuyWireCalc prefill={confirmedPrefill} … />

// Bestätigungs-Dialog:
{pendingPrefill && (
  <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
    {/* Titel: t('spiderBeamConfirmTitle') */}
    {/* Dialog-Inhalt: Vorschau der Werte */}
    <button onClick={() => setPendingPrefill(null)}>{t('spiderBeamConfirmCancel')}</button>
    <button onClick={() => {
      setConfirmedPrefill(pendingPrefill)  // triggert useEffect in GuyWireCalc
      setActiveCalc('guywire')
      setPendingPrefill(null)
    }}>{t('spiderBeamConfirmYes')}</button>
  </div>
)}
```

**Warum zwei States?** Wenn `pendingPrefill` direkt als `prefill`-Prop an `GuyWireCalc` übergeben würde, feuert der `useEffect` sofort wenn der Nutzer den Transfer-Button klickt — noch vor der Dialog-Bestätigung. „Abbrechen" könnte dann die bereits überschriebene Konfiguration nicht mehr rückgängig machen. Durch `confirmedPrefill` wird `GuyWireCalc` erst nach expliziter Bestätigung verändert.

---

## i18n — Neue Keys

| Key | DE | EN |
| --- | -- | -- |
| `calcSpiderBeam` | `Spider Beam` | `Spider Beam` |
| `calcSpiderBeamSubtitle` | `Mast-Konfigurator` | `Mast Designer` |
| `spiderBeamMastLabel` | `Masttyp` | `Mast type` |
| `spiderBeamHeight` | `Masthöhe` | `Mast height` |
| `spiderBeamSegmentsActive` | `Segmente ausgezogen` | `Segments extended` |
| `spiderBeamInGroundtube` | `im Grundrohr` | `in base tube` |
| `spiderBeamGuyLevels` | `Abspannpunkte` | `Guy wire levels` |
| `spiderBeamTransferTitle` | `Übergabe an Abspannungs-Rechner` | `Transfer to Guy Wire Calc` |
| `spiderBeamOpenGuyWire` | `Abspannungs-Rechner öffnen →` | `Open Guy Wire Calc →` |
| `spiderBeamConfirmTitle` | `Abspannrechner überschreiben?` | `Overwrite guy wire calc?` |
| `spiderBeamConfirmYes` | `Ja, überschreiben` | `Yes, overwrite` |
| `spiderBeamConfirmCancel` | `Abbrechen` | `Cancel` |

---

## Tests (`tests/spiderbeam.test.js`)

| Test | Beschreibung |
| ---- | ------------ |
| Volle Höhe (H=14) | Alle Segmente aktiv, Abspannpunkte bei 9/11/13 m |
| H=12 | Seg. 2+3 im Grundrohr, Punkte bei 7/9/11 m |
| H=10 | Seg. 2–5 im Grundrohr, Punkte bei 5/7/9 m |
| H=6 | Seg. 10 gerade noch verfügbar (Grenzfall) |
| H=5 | Seg. 10 nicht verfügbar |
| H=1 | Nur Grundrohr, keine Abspannpunkte verfügbar |
| H=4 | Seg. 12 gerade verfügbar, Seg. 10 nicht |

---

## Nicht im Scope dieser Version

- Segment-Durchmesser / Schellen-Empfehlungen (können später als Config-Tabelle ergänzt werden)
- 12m HD Mast (`MAST_CONFIGS`-Eintrag vorbereitet, aber kein UI)
- Rücksynchronisation vom Abspannrechner zum Spider-Beam-Designer
- Report-Integration (Spider Beam Daten im PDF)
