import { useLanguage } from '../../hooks/useLanguage.jsx'

const SVG_W = 240
const SVG_H = 180
const MARGIN = { top: 14, bottom: 22, left: 16, right: 68 }
const DRAW_H = SVG_H - MARGIN.top - MARGIN.bottom
const MAST_X = 68   // centerline x

export default function WindLoadDiagram({ config, results }) {
  const { t } = useLanguage()
  if (!results) return null

  const mastHeight = config.mast.height || 1
  const rBottom = (config.mast.diamBottomMm / 1000 / 2) || 0.01
  const rTop    = (config.mast.diamTopMm   / 1000 / 2) || 0.005

  // Scale: map mastHeight → DRAW_H
  const scale = DRAW_H / mastHeight
  const toY   = h => MARGIN.top + DRAW_H - h * scale

  const baseY = toY(0)
  const topY  = toY(mastHeight)
  const maxR  = Math.max(rBottom, rTop)
  const rScale = Math.min(40, 40 / maxR)   // px per metre, max 40 px radius

  // Radius in px at a given height (for correct arrow start position on tapered mast)
  const pxAtH = h => {
    const r = rBottom + (rTop - rBottom) * (h / mastHeight)
    return r * rScale
  }

  const pxBottom = pxAtH(0)
  const pxTopPx  = pxAtH(mastHeight)

  // Mast trapezoid points
  const mastPoly = [
    `${MAST_X - pxBottom},${baseY}`,
    `${MAST_X - pxTopPx},${topY}`,
    `${MAST_X + pxTopPx},${topY}`,
    `${MAST_X + pxBottom},${baseY}`,
  ].join(' ')

  // Force arrows — start from mast right edge at the respective height
  const arrowLen   = 36
  const arrowGap   = 5     // gap between mast surface and arrow end
  const mastArmY   = toY(results.mast.momentArm)
  const antennaY   = toY(config.antenna.mountHeight)
  const mastArrowX = MAST_X + pxAtH(results.mast.momentArm)      + arrowGap
  const antArrowX  = MAST_X + pxAtH(config.antenna.mountHeight)  + arrowGap

  // Collision avoidance: separate label y-positions if arrows are too close
  const Y_MIN_GAP = 12
  let mastLabelY = mastArmY + 4
  let antLabelY  = antennaY + 4
  if (results.antenna.force > 0) {
    const gap = antennaY - mastArmY   // positive → antenna renders lower (smaller height m)
    if (Math.abs(gap) < Y_MIN_GAP) {
      const shift = Math.ceil((Y_MIN_GAP - Math.abs(gap)) / 2) + 1
      if (gap >= 0) {
        mastLabelY = mastArmY - shift
        antLabelY  = antennaY + shift
      } else {
        antLabelY  = antennaY - shift
        mastLabelY = mastArmY + shift
      }
    }
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">
        {t('windLoadDiagramTitle')}
      </p>
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full">
        {/* defs first — marker forward-references fail on some iOS Safari versions */}
        <defs>
          <marker id="arrowMast" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto">
            <path d="M5,0 L5,5 L0,2.5 z" fill="#34d399" />
          </marker>
          <marker id="arrowAntenna" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto">
            <path d="M5,0 L5,5 L0,2.5 z" fill="#fbbf24" />
          </marker>
        </defs>

        {/* Ground line */}
        <line x1={14} y1={baseY} x2={SVG_W - 14} y2={baseY} stroke="#475569" strokeWidth="1" />
        <text x={SVG_W / 2} y={baseY + 12} textAnchor="middle" fontSize="8" fill="#64748b">{t('ground')}</text>

        {/* Mast outline */}
        <polygon points={mastPoly} fill="#334155" stroke="#64748b" strokeWidth="0.75" />

        {/* Mast force arrow */}
        {results.mast.force > 0 && (
          <g>
            <line
              x1={mastArrowX + arrowLen} y1={mastArmY}
              x2={mastArrowX + 3}        y2={mastArmY}
              stroke="#34d399" strokeWidth="1"
              markerEnd="url(#arrowMast)"
            />
            <text x={mastArrowX + arrowLen + 3} y={mastLabelY} fontSize="8" fill="#34d399">
              {results.mast.force.toFixed(0)} N
            </text>
          </g>
        )}

        {/* Antenna force arrow */}
        {results.antenna.force > 0 && (
          <g>
            <circle cx={MAST_X} cy={antennaY} r={3} fill="#fbbf24" />
            <line
              x1={antArrowX + arrowLen} y1={antennaY}
              x2={antArrowX + 3}        y2={antennaY}
              stroke="#fbbf24" strokeWidth="1"
              markerEnd="url(#arrowAntenna)"
            />
            <text x={antArrowX + arrowLen + 3} y={antLabelY} fontSize="8" fill="#fbbf24">
              {results.antenna.force.toFixed(0)} N
            </text>
          </g>
        )}
      </svg>
    </div>
  )
}
