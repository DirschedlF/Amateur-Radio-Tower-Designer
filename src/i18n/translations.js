export const translations = {
  de: {
    appTitle: 'Amateurfunk Mast-Designer',
    sidebarCalculators: 'Rechner',
    sidebarComingSoon: 'Demnächst',
    calcGuyWire: 'Abspannung',
    calcGuyWireSubtitle: 'Geometrie',
    calcWindLoad: 'Windlast',
    calcGrounding: 'Erdung',
    langToggle: 'EN',

    // Inputs
    mastHeight: 'Masthöhe',
    mastHeightUnit: 'm',
    levels: 'Abspannebenen',
    wires: 'Drähte',
    levelLabel: 'Ebene',
    heightLabel: 'Höhe (m)',
    radiusLabel: 'Radius (m)',
    wiresLabel: 'Drähte',

    // Results
    resultsTitle: 'Ergebnisse',
    colLevel: 'Ebene',
    colWireLength: 'Drahtlänge',
    colAngleH: 'Winkel (Horiz.)',
    colAngleM: 'Winkel (Mast)',
    colTotalLevel: 'Gesamt Ebene',
    grandTotal: 'Gesamtlänge',
    perWire: 'je Draht',
    unit_m: 'm',
    unit_deg: '°',

    // Diagram
    diagramTitle: 'Seitenansicht',
    ground: 'Boden',

    // Wind Load Calculator
    calcWindLoadSubtitle: 'Kräfte & Momente',
    windSection: 'Wind',
    gustFactor: 'Böenfaktor',
    mastSection: 'Mast',
    antennaSection: 'Antenne',
    windSpeed: 'Windgeschwindigkeit',
    dynamicPressure: 'Staudruck',
    unit_ms: 'm/s',
    unit_nm2: 'N/m²',
    diamBottom: '⌀ unten',
    diamTop: '⌀ oben',
    unit_mm: 'mm',
    cwLabel: 'cw',
    antennaArea: 'Antennenfläche',
    unit_m2: 'm²',
    mountHeight: 'Montagehöhe',
    mountHeightHint: 'Schwerpunkt der Antenne über Fuß',
    colComponent: 'Komponente',
    colForce: 'Kraft (N)',
    colMomentArm: 'Hebelarm (m)',
    colMoment: 'Moment (Nm)',
    rowMast: 'Mast',
    rowAntenna: 'Antenne',
    rowTotal: 'Gesamt',
    unit_n: 'N',
    unit_kn: 'kN',
    unit_nm: 'Nm',
    unit_knm: 'kNm',
    windLoadResultsTitle: 'Windlast-Ergebnisse',
    windLoadDiagramTitle: 'Windlast-Diagramm',
    windLoadDisclaimer: 'Diese Berechnung dient als technische Abschätzung für Planungszwecke ohne Gewähr und Haftung. Für eine genehmigte statische Auslegung (z.\u202fB. bei Aufstellung auf Gebäuden oder als Dauerinstallation) ist ein Standsicherheitsnachweis durch einen zugelassenen Ingenieur nach DIN\u202fEN\u202f1991-1-4 erforderlich.',

    // Guy Wire Load section
    loadSectionTitle: 'Belastungsberechnung',
    loadRequiredHint: 'Bitte zuerst den Windlast-Rechner ausfüllen, um die Drahtspannungen zu berechnen.',
    loadGoToWindLoad: '→ Windlast-Rechner',
    colSectionForce: 'Abschnittskraft',
    colHorizPerWire: 'Horiz. je Draht',
    colTension: 'Drahtspannung',
    loadDisclaimer: 'Planungsschätzung — keine statische Auslegung. Vorspannkraft nicht berücksichtigt.',
    loadBreakingLoadHint: 'Empfehlung: Mindestbruchlast des Drahtes ≥ 3× berechnete Drahtspannung.',

    // Wind speed tooltip
    windSpeedTooltipTitle: 'Richtwerte',
    windSpeedTooltipRow1: 'Leichter Wind',
    windSpeedTooltipRow2: 'Frischer Wind, Böen',
    windSpeedTooltipRow3: 'Sturm / Amateurfunk',
    windSpeedTooltipRow4: 'WZ 1 normativ (DIN EN 1991-1-4)',
    windSpeedTooltipNote: 'Empfehlung für Dauerinstallationen: ≥ 22,5 m/s',

    // Gust factor tooltip
    gustFactorTooltipTitle: 'Böenfaktor',
    gustFactorTooltipText: 'Berücksichtigt kurzzeitige Windspitzen (Böen). Der Standardwert 1,7 entspricht einer konservativen Auslegung für offenes Gelände nach DIN EN 1991-1-4. Typischer Bereich: 1,5–1,7.',

    // cw tooltip (mast)
    cwTooltipTitle: 'Was ist der cw-Wert?',
    cwTooltipRow1: 'Tragflügelprofil',
    cwTooltipRow2: 'Kugel',
    cwTooltipRow3: 'Rundes Rohr (Mast)',
    cwTooltipRow4: 'Vierkantrohr',
    cwTooltipRow5: 'Flachplatte quer',
    cwTooltipNote: 'cw = 1,1 im Tool: konservativ und physikalisch begründet für Teleskop-Steckmäste.',

    // Report — result labels
    reportMastForce: 'Windkraft Mast',
    reportAntennaForce: 'Windkraft Antenne',
    reportTotalForce: 'Gesamtkraft',
    reportTotalMoment: 'Biegemoment',

    // Report export
    reportButton: 'Bericht',
    reportPrint: 'Drucken',
    reportDownload: 'Herunterladen',
    reportTitle: 'Mast-Designer Bericht',
    reportDisclaimer: 'Planungsabschätzung — kein Ersatz für einen statischen Nachweis',
    reportBothRequired: 'Beide Rechner müssen ausgefüllt sein',
    reportPopupBlocked: 'Popup blockiert — bitte Popups für diese Seite erlauben',

    // Header
    handbuchLink: 'Handbuch',

    // Footer
    footerLicense: 'MIT-Lizenz',
  },
  en: {
    appTitle: 'Amateur Radio Tower Designer',
    sidebarCalculators: 'Calculators',
    sidebarComingSoon: 'Coming Soon',
    calcGuyWire: 'Guy Wires',
    calcGuyWireSubtitle: 'Geometry',
    calcWindLoad: 'Wind Load',
    calcGrounding: 'Grounding',
    langToggle: 'DE',

    // Inputs
    mastHeight: 'Mast Height',
    mastHeightUnit: 'm',
    levels: 'Guy Wire Levels',
    wires: 'Wires',
    levelLabel: 'Level',
    heightLabel: 'Height (m)',
    radiusLabel: 'Radius (m)',
    wiresLabel: 'Wires',

    // Results
    resultsTitle: 'Results',
    colLevel: 'Level',
    colWireLength: 'Wire Length',
    colAngleH: 'Angle (Horiz.)',
    colAngleM: 'Angle (Mast)',
    colTotalLevel: 'Level Total',
    grandTotal: 'Grand Total',
    perWire: 'per wire',
    unit_m: 'm',
    unit_deg: '°',

    // Diagram
    diagramTitle: 'Side View',
    ground: 'Ground',

    // Wind Load Calculator
    calcWindLoadSubtitle: 'Forces & Moments',
    windSection: 'Wind',
    gustFactor: 'Gust Factor',
    mastSection: 'Mast',
    antennaSection: 'Antenna',
    windSpeed: 'Wind Speed',
    dynamicPressure: 'Dynamic Pressure',
    unit_ms: 'm/s',
    unit_nm2: 'N/m²',
    diamBottom: '⌀ Bottom',
    diamTop: '⌀ Top',
    unit_mm: 'mm',
    cwLabel: 'cw',
    antennaArea: 'Antenna Area',
    unit_m2: 'm²',
    mountHeight: 'Mount Height',
    mountHeightHint: 'Antenna aerodynamic center above base',
    colComponent: 'Component',
    colForce: 'Force (N)',
    colMomentArm: 'Moment Arm (m)',
    colMoment: 'Moment (Nm)',
    rowMast: 'Mast',
    rowAntenna: 'Antenna',
    rowTotal: 'Total',
    unit_n: 'N',
    unit_kn: 'kN',
    unit_nm: 'Nm',
    unit_knm: 'kNm',
    windLoadResultsTitle: 'Wind Load Results',
    windLoadDiagramTitle: 'Wind Load Diagram',
    windLoadDisclaimer: 'This calculation is a technical estimate for planning purposes only, without warranty or liability. For a permitted structural design (e.g. installation on buildings or as a permanent structure), a structural safety assessment by a licensed engineer in accordance with EN\u202f1991-1-4 is required.',

    // Guy Wire Load section
    loadSectionTitle: 'Load Analysis',
    loadRequiredHint: 'Please fill in the Wind Load calculator first to compute wire tensions.',
    loadGoToWindLoad: '→ Wind Load',
    colSectionForce: 'Section Force',
    colHorizPerWire: 'Horiz. per Wire',
    colTension: 'Wire Tension',
    loadDisclaimer: 'Planning estimate only — not a structural analysis. Pre-tension not considered.',
    loadBreakingLoadHint: 'Recommendation: Minimum breaking load of wire ≥ 3× calculated tension.',

    // Wind speed tooltip
    windSpeedTooltipTitle: 'Reference Values',
    windSpeedTooltipRow1: 'Light wind',
    windSpeedTooltipRow2: 'Fresh wind, gusts',
    windSpeedTooltipRow3: 'Storm / amateur radio',
    windSpeedTooltipRow4: 'Zone 1 normative (EN 1991-1-4)',
    windSpeedTooltipNote: 'Recommended for permanent installations: ≥ 22.5 m/s',

    // Gust factor tooltip
    gustFactorTooltipTitle: 'Gust Factor',
    gustFactorTooltipText: 'Accounts for short-term wind gusts. The default value of 1.7 is conservative for open terrain per EN 1991-1-4. Typical range: 1.5–1.7.',

    // cw tooltip (mast)
    cwTooltipTitle: 'What is the cw value?',
    cwTooltipRow1: 'Aerofoil section',
    cwTooltipRow2: 'Sphere',
    cwTooltipRow3: 'Round tube (mast)',
    cwTooltipRow4: 'Square tube',
    cwTooltipRow5: 'Flat plate (broadside)',
    cwTooltipNote: 'cw = 1.1 in the tool: conservative and physically justified for telescoping masts.',

    // Report — result labels
    reportMastForce: 'Wind Force (Mast)',
    reportAntennaForce: 'Wind Force (Antenna)',
    reportTotalForce: 'Total Force',
    reportTotalMoment: 'Bending Moment',

    // Report export
    reportButton: 'Report',
    reportPrint: 'Print',
    reportDownload: 'Download',
    reportTitle: 'Mast Designer Report',
    reportDisclaimer: 'Planning estimate — not a substitute for structural verification',
    reportBothRequired: 'Both calculators must be filled in',
    reportPopupBlocked: 'Popup blocked — please allow popups for this site',

    // Header
    handbuchLink: 'Manual',

    // Footer
    footerLicense: 'MIT License',
  },
}
