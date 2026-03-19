# Design: v0.4.0 — Mobile Layout & Bericht-Export

**Datum:** 2026-03-19
**Version:** 0.4.0
**Status:** Approved

---

## Übersicht

v0.4.0 bringt zwei Verbesserungen:

1. **Responsive Mobile Layout** — Hamburger-Menü ersetzt die Sidebar auf kleinen Screens
2. **Bericht-Export** — kompakter 1-Seiten-Bericht aller Eingaben und Ergebnisse, druckbar und als HTML downloadbar

---

## 1. Responsive Layout / Mobile Navigation

### Anforderung

Die aktuelle Sidebar (`w-44`, immer sichtbar) ist auf Mobilgeräten nicht nutzbar. Desktop-Verhalten bleibt unverändert.

### Breakpoint

Tailwind `md:` (768px). Unterhalb dieses Breakpoints gilt das Mobile-Layout.

### Verhalten

**Desktop (`md:` und größer):**

- Sidebar bleibt wie bisher (linke Spalte, immer sichtbar)
- Kein Hamburger-Button

**Mobile (unter `md:`):**

- Sidebar ist ausgeblendet (`hidden md:flex` auf dem Sidebar-Element)
- Header zeigt links einen Hamburger-Button (`☰`, `md:hidden`)
- Klick auf Hamburger öffnet einen **Overlay-Drawer**:
  - Sidebar gleitet von links ins Bild (CSS transform/transition)
  - Hintergrund: halbtransparentes dunkles Overlay (`bg-black/50`)
  - Schließt bei: Klick auf Nav-Item (ruft `onClose` auf), Klick auf Overlay-Hintergrund, oder Escape-Taste

### Gegenseitiger Ausschluss Drawer / Report-Popover

Wenn der Report-Button auf Mobile geklickt wird, muss `App.jsx` zuerst `setDrawerOpen(false)` aufrufen, bevor das Popover geöffnet wird. Damit ist sichergestellt, dass beide nie gleichzeitig offen sind. Escape-Handler für Drawer und Popover sind unabhängig und konfliktfrei.

### Betroffene Dateien

| Datei | Änderung |
| --- | --- |
| `src/App.jsx` | State `drawerOpen` (boolean), Hamburger-Button im Header, Overlay-Div |
| `src/components/Sidebar.jsx` | Props `isOpen` + `onClose`, responsive Klassen für Drawer-Verhalten |

### Kein neuer Breakpoint-State nötig

Der `drawerOpen`-State in `App.jsx` reicht. Auf Desktop ist der Drawer nie relevant (Sidebar immer sichtbar via CSS).

---

## 2. Bericht-Export

### Ziel

Ein "Bericht"-Button erzeugt ein kompaktes 1-Seiten-Dokument mit allen Eingaben und Ergebnissen beider Rechner. Der Benutzer kann es drucken (→ PDF via Browser) oder als HTML-Datei herunterladen.

### State-Lifting für GuyWire

`GuyWireCalc` berechnet Geometrie-Ergebnisse intern per `useMemo` (via `calculateGuyWires`). Lastberechnungs-Ergebnisse werden aktuell von `GuyWireLoad.jsx` intern berechnet. Für den Report werden beide in `App.jsx` benötigt.

**Lösung:** Gleiches Muster wie `windLoadSnapshot`:

- `GuyWireCalc` importiert zusätzlich `calculateGuyWireLoad`
- Zweites `useMemo` in `GuyWireCalc` berechnet `loadResult = calculateGuyWireLoad({ snapshot: windLoadSnapshot, levelResults: results?.levels })` — ergibt `null` wenn `windLoadSnapshot` fehlt oder `results` fehlt
- `GuyWireLoad.jsx` bekommt `loadResult` als Prop; die bisherigen Props `windLoadSnapshot` und `geoResults` entfallen. `GuyWireCalc` reichert das Ergebnis mit Metadaten an: `loadResult = loadRaw ? { levels: loadRaw.levels, q: windLoadSnapshot.q, windSpeed: windLoadSnapshot.windSpeed } : null`. Neues Prop-Interface: `{ loadResult, onNavigateToWindLoad }`. `GuyWireLoad` liest `loadResult.q` und `loadResult.windSpeed` für die Zusammenfassungszeile.
- `GuyWireCalc` bekommt prop `onGuyWireChange`
- Emittiert `guyWireSnapshot` via `useEffect([results, loadResult])`: wenn die Geometrie-Ergebnisse (`results`) nicht null sind, wird ein Snapshot emittiert — mit `loadResults: loadResult?.levels ?? null` (kann null sein wenn windLoadSnapshot fehlt); wenn `results === null`, wird `onGuyWireChange(null)` aufgerufen (kein veralteter Snapshot in `App.jsx`)
- `App.jsx` hält `guyWireSnapshot` im State (Initialwert `null`) und übergibt `onGuyWireChange={setGuyWireSnapshot}` an `GuyWireCalc`

### Exakte Datenstrukturen (aus Quellcode)

**`calculateGuyWires` gibt zurück:**

```js
{
  levels: [{
    height,              // number — Abspannhöhe (m)
    radius,              // number — Ankerradius (m)
    wires,               // number — 3 oder 4
    wireLength,          // number — Länge eines Drahtes (m)
    angleFromHorizontal, // number — Winkel zur Horizontalen (°)
    angleFromMast,       // number — Winkel zur Mastachse (°)
    totalLengthPerLevel, // number — Gesamtlänge der Ebene (m)
  }],
  grandTotalLength,      // number — Gesamtdrahtlänge aller Ebenen (m)
}
```

**`calculateGuyWireLoad` gibt zurück:**

```js
{ levels: [{
    sectionForce,     // number — Windkraft auf den Abschnitt (N)
    horizForcePerWire,// number — Horizontalkraft je Draht (N)
    tension,          // number — Drahtspannung (N)
    tensionKgf,       // number — Drahtspannung (kgf)
}] }
// oder null wenn levelResults fehlt
```

**`guyWireSnapshot`-Struktur (wird emittiert):**

```js
{
  mastHeight,       // number — aus config
  levels,           // array — direkt aus calculateGuyWires().levels (Felder wie oben)
  grandTotalLength, // number — aus calculateGuyWires().grandTotalLength
  loadResults,      // array | null
                    // null: wenn calculateGuyWireLoad null zurückgibt
                    // sonst: calculateGuyWireLoad().levels (Felder wie oben)
}
```

**`loadResults: null` vs. leeres Array:**

- `null`: wenn `windLoadSnapshot` nicht vorhanden oder `calculateGuyWireLoad` null zurückgibt
- Leeres Array: tritt nicht auf (mindestens eine Abspannebene immer vorhanden)
- `ReportButton` ist aktiv wenn `guyWireSnapshot !== null` UND `windLoadSnapshot !== null`

### Neue Dateien

#### `src/report/generateReport.js`

Pure Funktion (kein React). Signatur:

```js
generateReport({ windSnapshot, guyWireSnapshot, lang })
// → vollständiger HTML-String (<!DOCTYPE html> ... </html>)
```

**Styling:** Helles, druckfreundliches Layout (weißer Hintergrund, schwarzer Text). Kein Dark Theme. Inline CSS im `<style>`-Block des generierten HTML. Enthält `@media print { body { margin: 0; } }`.

**Layout:** CSS Grid, zwei Spalten (`grid-template-columns: 1fr 1fr`). Fällt auf eine Spalte zurück bei `@media (max-width: 600px)`.

**`windSnapshot`-Felder (erweitert):** `WindLoadCalc.jsx` wird um zusätzliche Felder im Snapshot erweitert, damit `generateReport.js` keine eigene Berechnung durchführen muss:

```js
{
  // Eingaben (bisher)
  q, windSpeed, mastHeight, diamBottomMm, diamTopMm, mastCw,
  antennaForce, antennaMountHeight,
  // Neu hinzugefügt
  antennaArea,   // config.antenna.area (m²)
  antennaCw,     // config.antenna.cw
  // Vorberechnete Ergebnisse (aus calculateWindLoad)
  mastForce,     // results.mast.force (N)
  mastMoment,    // results.mast.moment (Nm)
  totalForce,    // results.total.force (N)
  totalMoment,   // results.total.moment (Nm)
}
```

`generateReport.js` importiert `calculateWindLoad` **nicht** — es liest alle Werte direkt aus dem erweiterten Snapshot.

**Inhalt:**

- **Header:** Titel (`reportTitle` aus i18n), Datum (Display: `new Date().toLocaleDateString('sv-SE')`), Version `v0.4.0` (hardcoded — muss bei Versionsbump manuell aktualisiert werden)
- **Linke Spalte:** Windlast-Eingaben aus `windSnapshot` (Windgeschwindigkeit `windSpeed`, Böenfaktor `gustFactor` — aus `q` zurückgerechnet als `q / (0.5 * 1.25 * windSpeed²)`, Masthöhe, ⌀ unten/oben, cw-Mast, Antenne: `antennaForce` und `antennaMountHeight`) + Ergebnisse aus `calculateWindLoad`-Aufruf (Windkraft Mast, Windkraft Antenne = `antennaForce`, Gesamtkraft, Biegemoment gesamt)
- **Rechte Spalte:** Abspanngeometrie aus `guyWireSnapshot.levels` — je Ebene: `height`, `radius`, `wires`, `wireLength`, `angleFromHorizontal`, `angleFromMast`, `totalLengthPerLevel`; darunter `grandTotalLength`
- **Volle Breite:** Lastberechnungs-Tabelle aus `guyWireSnapshot.loadResults` — nur gerendert wenn `loadResults !== null`; Spalten: Ebene, `sectionForce` (N), `horizForcePerWire` (N), `tension` (N), `tensionKgf` (kgf)
- **Footer:** `reportDisclaimer` (aus i18n), zentriert, kleiner Text

#### `src/components/ReportButton.jsx`

Button + Popover (kein echtes Modal, kein Focus-Trap).

**Disabled-Zustand:** `windSnapshot === null || guyWireSnapshot === null`. Der Button zeigt einen HTML `title`-Tooltip mit `reportBothRequired`-Text.

**Aktiver Zustand:** Klick ruft zuerst `onCloseDrawer()` auf, dann öffnet das Popover. Das Popover wird als React Portal in `document.body` gerendert (via `createPortal`), positioniert via `getBoundingClientRect()` des Buttons: unterhalb des Buttons, rechtsbündig zur rechten Button-Kante. Maximale Breite `min(220px, 90vw)`, kein Viewport-Overflow. `z-50`. Damit wird Layout-Shift durch den Drawer-Close vermieden. Inhalt:

- Zwei Buttons: `reportPrint` und `reportDownload`
- Kein weiterer Text oder Vorschau

**Popover schließen:** Escape-Taste oder Klick außerhalb (document `mousedown`-Listener). Der Listener wird in einem `useEffect` registriert und im Cleanup desselben `useEffect` entfernt — sowohl beim Schließen (wenn `popoverOpen` false wird) als auch beim Unmount der Komponente.

**Aktionen:**

- **Drucken:**

  ```js
  const html = generateReport({ windSnapshot, guyWireSnapshot, lang })
  const w = window.open('', '_blank')
  if (!w) { alert(t('reportPopupBlocked') ?? 'Popup blocked — please allow popups for this site.'); return }
  w.document.write(html)
  w.document.close()
  setTimeout(() => w.print(), 250) // 250ms: best-effort, ausreichend für alle modernen Browser
  ```

- **Herunterladen:**

  ```js
  const html = generateReport({ windSnapshot, guyWireSnapshot, lang })
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `mast-bericht-${new Date().toISOString().slice(0, 10)}.html` // ISO date, immer YYYY-MM-DD
  a.click()
  URL.revokeObjectURL(url)
  ```

### Platzierung im Header

`ReportButton` wird direkt in `App.jsx` im Header-Bereich rechts gerendert, neben dem Sprach-Toggle-Button. Props von `App.jsx`: `windSnapshot={windLoadSnapshot}`, `guyWireSnapshot={guyWireSnapshot}`, `onCloseDrawer={() => setDrawerOpen(false)}`, `lang={lang}`. Auf Mobile ebenfalls sichtbar (gleiche Komponente, gleiche Props). Die bestehenden `windSnapshot`-Felder bleiben vollständig erhalten; `WindLoadCalc.jsx` fügt nur neue Felder hinzu.

### i18n

Neue Translations-Keys in `src/i18n/translations.js`:

| Key | DE | EN |
| --- | --- | --- |
| reportButton | Bericht | Report |
| reportPrint | Drucken | Print |
| reportDownload | Herunterladen | Download |
| reportTitle | Mast-Designer Bericht | Mast Designer Report |
| reportDisclaimer | Planungsabschätzung — kein Ersatz für einen statischen Nachweis | Planning estimate — not a substitute for structural verification |
| reportBothRequired | Beide Rechner müssen ausgefüllt sein | Both calculators must be filled in |
| reportPopupBlocked | Popup blockiert — bitte Popups für diese Seite erlauben | Popup blocked — please allow popups for this site |

`reportBothRequired` wird als `title`-Attribut des disabled Buttons verwendet (nativer Browser-Tooltip).

---

## Neue Dateien (Übersicht)

| Datei | Typ | Beschreibung |
| --- | --- | --- |
| `src/report/generateReport.js` | Pure JS | HTML-String-Generator für den Bericht |
| `src/components/ReportButton.jsx` | React | Button + Popover für Drucken/Download |

## Geänderte Dateien

| Datei | Änderung |
| --- | --- |
| `src/App.jsx` | `drawerOpen` State, Hamburger-Button, Overlay, `guyWireSnapshot` State, `ReportButton` einbinden, `onCloseDrawer`-Prop an `ReportButton` |
| `src/components/Sidebar.jsx` | `isOpen` + `onClose` Props, Drawer-CSS |
| `src/calculators/windload/WindLoadCalc.jsx` | Snapshot um `antennaArea`, `antennaCw`, `mastForce`, `mastMoment`, `totalForce`, `totalMoment` erweitert |
| `src/calculators/guywire/GuyWireCalc.jsx` | Import `calculateGuyWireLoad`, zweites `useMemo` für `loadResult`, `onGuyWireChange`-Prop + Snapshot-Emission, `loadResult`-Prop an `GuyWireLoad` |
| `src/calculators/guywire/GuyWireLoad.jsx` | Neues Prop-Interface: `{ loadResult, onNavigateToWindLoad }` — `windLoadSnapshot` und `geoResults` entfernt |
| `src/i18n/translations.js` | Neue Keys für Report, Mobile-Nav und Popup-Fehler |

---

## Nicht in Scope

- Kein PDF-Library-Einsatz (kein `jsPDF` o.ä.) — Browser-Druckdialog reicht
- Keine Änderungen an der Berechnungslogik
- Keine neuen Rechner
- Desktop-Layout bleibt unverändert
