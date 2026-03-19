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
- Header zeigt links einen Hamburger-Button (`☰`)
- Klick auf Hamburger öffnet einen **Overlay-Drawer**:
  - Sidebar gleitet von links ins Bild (CSS transform)
  - Hintergrund: halbtransparentes dunkles Overlay
  - Schließt bei: Klick auf Nav-Item, Klick auf Overlay-Hintergrund, oder Escape

### Betroffene Dateien

| Datei | Änderung |
|-------|----------|
| `src/App.jsx` | State `drawerOpen` (boolean), Hamburger-Button im Header, Overlay-Div |
| `src/components/Sidebar.jsx` | Props `isOpen` + `onClose`, responsive Klassen für Drawer-Verhalten |

### Kein neuer Breakpoint-State nötig

Der `drawerOpen`-State in `App.jsx` reicht. Auf Desktop ist der Drawer nie relevant (Sidebar immer sichtbar via CSS).

---

## 2. Bericht-Export

### Anforderung

Ein "Bericht"-Button erzeugt ein kompaktes 1-Seiten-Dokument mit allen Eingaben und Ergebnissen beider Rechner. Der Benutzer kann es drucken (→ PDF via Browser) oder als HTML-Datei herunterladen.

### State-Lifting für GuyWire

`GuyWireCalc` berechnet seine Ergebnisse aktuell intern per `useMemo`. Für den Report werden diese Daten in `App.jsx` benötigt.

**Lösung:** Gleiches Muster wie `windLoadSnapshot`:
- `GuyWireCalc` bekommt prop `onGuyWireChange`
- Emittiert ein `guyWireSnapshot`-Objekt via `useEffect` wenn sich Ergebnisse ändern
- `App.jsx` hält `guyWireSnapshot` im State

**`guyWireSnapshot`-Struktur:**
```js
{
  mastHeight,        // number
  levels,            // array: [{ height, radius, wireCount, wireLength, angleDeg, totalLength }]
  grandTotal,        // number — Gesamtdrahtlänge
  loadResults,       // array: [{ sectionForce, horizPerWire, tension }] | null
}
```

### Neue Dateien

#### `src/report/generateReport.js`

Pure Funktion (kein React). Nimmt `{ windSnapshot, guyWireSnapshot, lang }`, gibt einen vollständigen HTML-String zurück (selbst-enthalten, mit inline CSS für Druck).

Inhalt des Reports:
- **Header:** Titel ("Mast-Designer Bericht"), Datum, Version
- **Zwei Spalten:**
  - Links: Windlast-Eingaben + Ergebnisse (Windgeschwindigkeit, Böenfaktor, Mast-Dimensionen, Antenne, Gesamtkraft, Biegemoment)
  - Rechts: Abspanngeometrie je Ebene (Höhe, Radius, Drähte, Drahtlänge, Winkel)
- **Volle Breite:** Lastberechnungs-Tabelle (Abschnittskraft, Horiz./Draht, Spannung in N und kgf)
- **Footer:** "Planungsabschätzung — kein Ersatz für einen statischen Nachweis"

#### `src/components/ReportButton.jsx`

Button + kleines Modal (Inline-Overlay, kein externes Modal-System).

- Button ist **disabled** wenn `windSnapshot === null || guyWireSnapshot === null` (Tooltip: "Beide Rechner müssen ausgefüllt sein")
- Klick öffnet Modal mit zwei Aktionen:
  - **Drucken:** öffnet Report-HTML in neuem Fenster → `window.print()`
  - **Herunterladen:** Blob-URL → `<a download="mast-bericht-YYYY-MM-DD.html">` → programmatischer Klick

### Platzierung im Header

`ReportButton` wird in `App.jsx` im Header-Bereich rechts platziert, neben dem Sprach-Toggle-Button. Auf Mobile ist er ebenfalls sichtbar (kompakte Icon-Variante oder kurzes Label).

### i18n

Neue Translations-Keys in `src/i18n/translations.js`:

| Key | DE | EN |
|-----|----|----|
| `reportButton` | Bericht | Report |
| `reportPrint` | Drucken | Print |
| `reportDownload` | Herunterladen | Download |
| `reportTitle` | Mast-Designer Bericht | Mast Designer Report |
| `reportDisclaimer` | Planungsabschätzung — kein Ersatz für einen statischen Nachweis | Planning estimate — not a substitute for structural verification |
| `reportBothRequired` | Beide Rechner müssen ausgefüllt sein | Both calculators must be filled in |

---

## Neue Dateien (Übersicht)

| Datei | Typ | Beschreibung |
|-------|-----|--------------|
| `src/report/generateReport.js` | Pure JS | HTML-String-Generator für den Bericht |
| `src/components/ReportButton.jsx` | React | Button + Modal für Drucken/Download |

## Geänderte Dateien

| Datei | Änderung |
|-------|----------|
| `src/App.jsx` | `drawerOpen` State, Hamburger-Button, Overlay, `guyWireSnapshot` State, `ReportButton` einbinden |
| `src/components/Sidebar.jsx` | `isOpen` + `onClose` Props, Drawer-CSS |
| `src/calculators/guywire/GuyWireCalc.jsx` | `onGuyWireChange` Prop, Snapshot emittieren |
| `src/i18n/translations.js` | Neue Keys für Report und Mobile-Nav |

---

## Nicht in Scope

- Kein PDF-Library-Einsatz (kein `jsPDF` o.ä.) — Browser-Druckdialog reicht
- Keine Änderungen an der Berechnungslogik
- Keine neuen Rechner
- Desktop-Layout bleibt unverändert
