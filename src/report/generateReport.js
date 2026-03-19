import { translations } from '../i18n/translations.js'

export function generateReport({ windSnapshot, guyWireSnapshot, lang }) {
  const t = (key) => translations[lang]?.[key] ?? translations['de'][key] ?? key

  const date = new Date().toLocaleDateString('sv-SE')

  const fmt = (n, d = 1) => (typeof n === 'number' ? n.toFixed(d) : '—')

  const gustFactor = windSnapshot.windSpeed > 0
    ? (windSnapshot.q / (0.5 * 1.25 * windSnapshot.windSpeed ** 2)).toFixed(2)
    : '—'

  const loadTableHtml = guyWireSnapshot.loadResults
    ? `
      <section style="grid-column:1/-1;margin-top:16px;">
        <h3 style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#475569;margin-bottom:6px;">${t('loadSectionTitle')}</h3>
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <thead>
            <tr style="background:#f1f5f9;">
              <th style="text-align:left;padding:4px 8px;border:1px solid #e2e8f0;">${t('colLevel')}</th>
              <th style="text-align:right;padding:4px 8px;border:1px solid #e2e8f0;">${t('colSectionForce')}</th>
              <th style="text-align:right;padding:4px 8px;border:1px solid #e2e8f0;">${t('colHorizPerWire')}</th>
              <th style="text-align:right;padding:4px 8px;border:1px solid #e2e8f0;">${t('colTension')}</th>
              <th style="text-align:right;padding:4px 8px;border:1px solid #e2e8f0;">${t('colTension')}</th>
            </tr>
          </thead>
          <tbody>
            ${guyWireSnapshot.loadResults.map((lvl, i) => `
              <tr>
                <td style="padding:4px 8px;border:1px solid #e2e8f0;">${i + 1}</td>
                <td style="text-align:right;padding:4px 8px;border:1px solid #e2e8f0;">${fmt(lvl.sectionForce, 0)} N</td>
                <td style="text-align:right;padding:4px 8px;border:1px solid #e2e8f0;">${fmt(lvl.horizForcePerWire, 0)} N</td>
                <td style="text-align:right;padding:4px 8px;border:1px solid #e2e8f0;">${fmt(lvl.tension, 0)} N</td>
                <td style="text-align:right;padding:4px 8px;border:1px solid #e2e8f0;">${fmt(lvl.tensionKgf, 1)} kgf</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </section>`
    : ''

  const levelsHtml = guyWireSnapshot.levels.map((lvl, i) => `
    <tr>
      <td style="padding:3px 6px;border:1px solid #e2e8f0;">${i + 1}</td>
      <td style="text-align:right;padding:3px 6px;border:1px solid #e2e8f0;">${fmt(lvl.height)} m</td>
      <td style="text-align:right;padding:3px 6px;border:1px solid #e2e8f0;">${fmt(lvl.radius)} m</td>
      <td style="text-align:right;padding:3px 6px;border:1px solid #e2e8f0;">${Number(lvl.wires)}</td>
      <td style="text-align:right;padding:3px 6px;border:1px solid #e2e8f0;">${fmt(lvl.wireLength)} m</td>
      <td style="text-align:right;padding:3px 6px;border:1px solid #e2e8f0;">${fmt(lvl.angleFromHorizontal)}°</td>
      <td style="text-align:right;padding:3px 6px;border:1px solid #e2e8f0;">${fmt(lvl.angleFromMast)}°</td>
      <td style="text-align:right;padding:3px 6px;border:1px solid #e2e8f0;">${fmt(lvl.totalLengthPerLevel)} m</td>
    </tr>
  `).join('')

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${t('reportTitle')}</title>
<style>
  *{box-sizing:border-box;}
  body{font-family:system-ui,sans-serif;font-size:13px;color:#1e293b;background:#fff;margin:24px;line-height:1.5;}
  h1{font-size:18px;margin:0 0 2px;}
  h3{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#475569;margin:0 0 6px;}
  .meta{font-size:11px;color:#64748b;margin-bottom:16px;}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
  .section{background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:12px;}
  table{width:100%;border-collapse:collapse;font-size:12px;}
  th,td{padding:3px 6px;border:1px solid #e2e8f0;}
  th{background:#f1f5f9;text-align:left;}
  td.r{text-align:right;}
  .kv{display:flex;justify-content:space-between;gap:8px;padding:2px 0;border-bottom:1px solid #f1f5f9;}
  .kv:last-child{border-bottom:none;}
  .label{color:#64748b;}
  .value{font-weight:500;}
  footer{margin-top:16px;font-size:10px;color:#94a3b8;text-align:center;}
  @media print{body{margin:0;}}
  @media(max-width:600px){.grid{grid-template-columns:1fr;}}
</style>
</head>
<body>
<h1>📡 ${t('reportTitle')}</h1>
<p class="meta">v0.4.0 · ${date}</p>

<div class="grid">
  <div class="section">
    <h3>${t('calcWindLoad')}</h3>
    <div class="kv"><span class="label">${t('windSpeed') ?? 'Windgeschwindigkeit'}</span><span class="value">${fmt(windSnapshot.windSpeed, 1)} m/s</span></div>
    <div class="kv"><span class="label">q</span><span class="value">${fmt(windSnapshot.q, 0)} N/m²</span></div>
    <div class="kv"><span class="label">${t('gustFactor') ?? 'Böenfaktor'}</span><span class="value">${gustFactor}</span></div>
    <div class="kv"><span class="label">${t('mastHeight') ?? 'Masthöhe'}</span><span class="value">${fmt(windSnapshot.mastHeight, 1)} m</span></div>
    <div class="kv"><span class="label">⌀ ${t('bottom') ?? 'unten'}</span><span class="value">${fmt(windSnapshot.diamBottomMm, 0)} mm</span></div>
    <div class="kv"><span class="label">⌀ ${t('top') ?? 'oben'}</span><span class="value">${fmt(windSnapshot.diamTopMm, 0)} mm</span></div>
    <div class="kv"><span class="label">cw ${t('mast') ?? 'Mast'}</span><span class="value">${fmt(windSnapshot.mastCw, 2)}</span></div>
    <div class="kv"><span class="label">${t('antennaArea') ?? 'Antennenfläche'}</span><span class="value">${fmt(windSnapshot.antennaArea, 2)} m²</span></div>
    <div class="kv"><span class="label">cw ${t('antenna') ?? 'Antenne'}</span><span class="value">${fmt(windSnapshot.antennaCw, 2)}</span></div>
    <div class="kv"><span class="label">${t('mountHeight') ?? 'Montagehöhe'}</span><span class="value">${fmt(windSnapshot.antennaMountHeight, 1)} m</span></div>
    <div style="margin-top:8px;padding-top:8px;border-top:1px solid #e2e8f0;">
      <div class="kv"><span class="label">${t('mastForce') ?? 'Windkraft Mast'}</span><span class="value">${fmt(windSnapshot.mastForce, 0)} N</span></div>
      <div class="kv"><span class="label">${t('antennaForce') ?? 'Windkraft Antenne'}</span><span class="value">${fmt(windSnapshot.antennaForce, 0)} N</span></div>
      <div class="kv"><span class="label"><strong>${t('totalForce') ?? 'Gesamtkraft'}</strong></span><span class="value"><strong>${fmt(windSnapshot.totalForce, 0)} N</strong></span></div>
      <div class="kv"><span class="label">${t('totalMoment') ?? 'Biegemoment'}</span><span class="value">${fmt(windSnapshot.totalMoment, 0)} Nm</span></div>
    </div>
  </div>

  <div class="section">
    <h3>${t('calcGuyWire')}</h3>
    <table>
      <thead>
        <tr>
          <th>${t('colLevel')}</th>
          <th class="r">${t('heightLabel').replace(/\s*\(m\)/i, '')}</th>
          <th class="r">${t('radiusLabel').replace(/\s*\(m\)/i, '')}</th>
          <th class="r">${t('wiresLabel') ?? 'n'}</th>
          <th class="r">${t('colWireLength')}</th>
          <th class="r">${t('colAngleH')}</th>
          <th class="r">${t('colAngleM')}</th>
          <th class="r">${t('colTotalLevel')}</th>
        </tr>
      </thead>
      <tbody>${levelsHtml}</tbody>
    </table>
    <div class="kv" style="margin-top:8px;"><span class="label"><strong>${t('grandTotal')}</strong></span><span class="value"><strong>${fmt(guyWireSnapshot.grandTotalLength)} m</strong></span></div>
  </div>

  ${loadTableHtml}
</div>

<footer>${t('reportDisclaimer')}</footer>
</body>
</html>`
}
