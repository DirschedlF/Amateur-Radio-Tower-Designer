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
      <section style="margin-top:12px;">
        <h3>${t('loadSectionTitle')}</h3>
        <table>
          <thead>
            <tr style="background:#f1f5f9;">
              <th>${t('colLevel')}</th>
              <th class="r">${t('colSectionForce')}</th>
              <th class="r">${t('colHorizPerWire')}</th>
              <th class="r">${t('colTension')} (N)</th>
              <th class="r">${t('colTension')} (kgf)</th>
            </tr>
          </thead>
          <tbody>
            ${guyWireSnapshot.loadResults.map((lvl, i) => `
              <tr>
                <td>${i + 1}</td>
                <td class="r">${fmt(lvl.sectionForce, 0)} N</td>
                <td class="r">${fmt(lvl.horizForcePerWire, 0)} N</td>
                <td class="r">${fmt(lvl.tension, 0)} N</td>
                <td class="r">${fmt(lvl.tensionKgf, 1)} kgf</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <p class="hint">💡 ${t('loadBreakingLoadHint')}</p>
      </section>`
    : ''

  const levelsHtml = guyWireSnapshot.levels.map((lvl, i) => `
    <tr>
      <td>${i + 1}</td>
      <td class="r">${fmt(lvl.height)} m</td>
      <td class="r">${fmt(lvl.radius)} m</td>
      <td class="r">${Number(lvl.wires)}</td>
      <td class="r">${fmt(lvl.wireLength)} m</td>
      <td class="r">${fmt(lvl.angleFromHorizontal)}°</td>
      <td class="r">${fmt(lvl.angleFromMast)}°</td>
      <td class="r">${fmt(lvl.totalLengthPerLevel)} m</td>
    </tr>
  `).join('')

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${t('reportTitle')}</title>
<style>
  @page{margin:12mm;}
  *{box-sizing:border-box;}
  body{font-family:system-ui,sans-serif;font-size:12px;color:#1e293b;background:#fff;margin:16px;line-height:1.4;}
  h1{font-size:16px;margin:0 0 2px;}
  h3{font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#475569;margin:0 0 5px;}
  .meta{font-size:10px;color:#64748b;margin-bottom:12px;}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
  .section{background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:10px;}
  table{width:100%;border-collapse:collapse;font-size:11px;}
  th,td{padding:2px 5px;border:1px solid #e2e8f0;}
  th{background:#f1f5f9;text-align:left;}
  td.r,th.r{text-align:right;}
  .kv{display:flex;justify-content:space-between;gap:8px;padding:1px 0;border-bottom:1px solid #f1f5f9;font-size:11px;}
  .kv:last-child{border-bottom:none;}
  .kv-sep{border-top:1px solid #e2e8f0;margin-top:5px;padding-top:5px;}
  .label{color:#64748b;}
  .value{font-weight:500;}
  .disclaimer{margin-top:10px;font-size:10px;color:#92400e;background:#fffbeb;border:1px solid #fcd34d;border-radius:4px;padding:6px 8px;line-height:1.4;}
  .hint{margin-top:6px;font-size:10px;color:#92400e;background:#fffbeb;border:1px solid #fcd34d;border-radius:4px;padding:5px 7px;}
  footer{margin-top:8px;font-size:9px;color:#94a3b8;text-align:center;}
  footer a{color:#94a3b8;}
  @media print{body{margin:0;}}
</style>
</head>
<body>
<h1>📡 ${t('reportTitle')}</h1>
<p class="meta">v0.6.0 · ${date}</p>

<div class="grid">
  <div class="section">
    <h3>${t('calcWindLoad')}</h3>
    <div class="kv"><span class="label">${t('mastHeight')}</span><span class="value">${fmt(windSnapshot.mastHeight, 1)} m</span></div>
    <div class="kv"><span class="label">${t('diamBottom')}</span><span class="value">${fmt(windSnapshot.diamBottomMm, 0)} mm</span></div>
    <div class="kv"><span class="label">${t('diamTop')}</span><span class="value">${fmt(windSnapshot.diamTopMm, 0)} mm</span></div>
    <div class="kv"><span class="label">cw ${t('mastSection')}</span><span class="value">${fmt(windSnapshot.mastCw, 2)}</span></div>
    <div class="kv"><span class="label">${t('antennaArea')}</span><span class="value">${fmt(windSnapshot.antennaArea, 2)} m²</span></div>
    <div class="kv"><span class="label">cw ${t('antennaSection')}</span><span class="value">${fmt(windSnapshot.antennaCw, 2)}</span></div>
    <div class="kv"><span class="label">${t('mountHeight')}</span><span class="value">${fmt(windSnapshot.antennaMountHeight, 1)} m</span></div>
    <div class="kv kv-sep"><span class="label">${t('windSpeed')}</span><span class="value">${fmt(windSnapshot.windSpeed, 1)} m/s</span></div>
    <div class="kv"><span class="label">${t('gustFactor')}</span><span class="value">${gustFactor}</span></div>
    <div class="kv kv-sep"><span class="label">${t('reportMastForce')}</span><span class="value">${fmt(windSnapshot.mastForce, 0)} N</span></div>
    <div class="kv"><span class="label">${t('reportAntennaForce')}</span><span class="value">${fmt(windSnapshot.antennaForce, 0)} N</span></div>
    <div class="kv"><span class="label"><strong>${t('reportTotalForce')}</strong></span><span class="value"><strong>${fmt(windSnapshot.totalForce, 0)} N</strong></span></div>
    <div class="kv"><span class="label">${t('reportTotalMoment')}</span><span class="value">${fmt(windSnapshot.totalMoment, 0)} Nm</span></div>
  </div>

  <div class="section">
    <h3>${t('calcGuyWire')}</h3>
    <table>
      <thead>
        <tr>
          <th>${t('colLevel')}</th>
          <th class="r">${t('heightLabel').replace(/\s*\(m\)/i, '')}</th>
          <th class="r">${t('radiusLabel').replace(/\s*\(m\)/i, '')}</th>
          <th class="r">${t('wiresLabel')}</th>
          <th class="r">${t('colWireLength')}</th>
          <th class="r">${t('colAngleH')}</th>
          <th class="r">${t('colAngleM')}</th>
          <th class="r">${t('colTotalLevel')}</th>
        </tr>
      </thead>
      <tbody>${levelsHtml}</tbody>
    </table>
    <div class="kv" style="margin-top:6px;"><span class="label"><strong>${t('grandTotal')}</strong></span><span class="value"><strong>${fmt(guyWireSnapshot.grandTotalLength)} m</strong></span></div>
  </div>
</div>

${loadTableHtml}

<p class="disclaimer">⚠️ ${t('windLoadDisclaimer')}</p>

<footer>
  Fritz Dirschedl · DK9RC ·
  <a href="https://github.com/DirschedlF/Amateur-Radio-Tower-Designer">GitHub</a> ·
  ${t('footerLicense')}
</footer>
</body>
</html>`
}
